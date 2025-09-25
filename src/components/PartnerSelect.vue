<!-- src/components/PartnerSelect.vue -->
<template>
    <div class="w-full" ref="rootEl">
        <label class="block text-sm font-medium text-gray-700 mb-1">Partner</label>

        <div class="relative">
            <input v-model="query" type="text" :placeholder="placeholder || 'Buscar por nick, nombre o email…'"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                @input="onInput" @focus="open = true" />

            <!-- Dropdown -->
            <ul v-if="open && !isLoading && results.length"
                class="absolute z-20 mt-1 w-full rounded-lg border bg-white shadow-md max-h-64 overflow-auto">
                <li v-for="p in results" :key="p.id" @click="select(p)"
                    class="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                    <div class="font-medium">{{ displayName(p) }}</div>
                    <div class="text-xs text-gray-500">{{ displayMeta(p) }}</div>
                </li>
            </ul>

            <!-- Sin resultados -->
            <div v-if="open && !isLoading && !results.length && query.length >= 2"
                class="absolute z-20 mt-1 w-full rounded-lg border bg-white shadow-md p-3 text-sm text-gray-500">
                Sin resultados
            </div>

            <!-- Loading -->
            <div v-if="isLoading" class="absolute right-3 top-2.5 text-sm text-gray-400">
                Buscando…
            </div>
        </div>

        <!-- Seleccionado -->
        <p v-if="modelValue !== null" class="mt-2 text-sm text-gray-600">
            Seleccionado:
            <span class="font-medium">{{ selectedText }}</span>
            <button type="button" class="ml-2 text-blue-600 hover:underline" @click="emit('update:modelValue', null)">
                Quitar
            </button>
        </p>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount, type Ref } from 'vue'
import { handleApi, normalizeApiError } from '@/utils/handleApi'

/**
 * Tipos mínimos basados en el contrato actual del componente.
 */
type MaybeEl = HTMLElement | null
type UserLite = { name?: string; email?: string } | null | undefined
type PlayerLite = { id: number; nick_name?: string; user?: UserLite } // resultados de /players
type UserResult = { id?: number; name?: string; email?: string } // resultados de /users (merge defensivo)

/**
 * Props & emits
 */
const props = withDefaults(
    defineProps < {
        modelValue: number | null
    placeholder?: string
    } > (),
    {
        modelValue: null,
        placeholder: 'Buscar por nick, nombre o email…',
    }
)

const emit = defineEmits < {
  (e: 'update:modelValue', value: number | null): void
}> ()

/**
 * State
 */
const rootEl: Ref<MaybeEl> = ref(null)
const query = ref < string > ('')
const results = ref < PlayerLite[] > ([]) // [{ id, nick_name, user: { name, email } }, ...]
const open = ref < boolean > (false)
const isLoading = ref < boolean > (false)
let debounceId: ReturnType<typeof setTimeout> | null = null

/**
 * Helpers de mapeo
 */
const displayName = (p: PlayerLite): string =>
    p?.nick_name || (p?.user?.name ?? '') || (p?.user?.email ?? '') || `Player #${p?.id}`

const displayMeta = (p: PlayerLite): string => {
    const name = p?.user?.name ? p.user.name : ''
    const email = p?.user?.email ? ` · ${p.user.email}` : ''
    return `${name}${email}`.trim()
}

/**
 * Texto del seleccionado (si está en results)
 */
const selectedText = computed < string > (() => {
    const current = results.value.find(r => r.id === props.modelValue)
    return current ? displayName(current) : props.modelValue ? `Player #${props.modelValue}` : ''
})

/**
 * Búsqueda principal: players
 */
const searchPlayers = async (term: string): Promise<PlayerLite[]> => {
    const res = await handleApi.get(`/api/v1/players/`, { params: { search: term } })
    const data = (res as any)?.data ?? res
    return Array.isArray(data) ? (data as PlayerLite[]) : ((data?.results ?? []) as PlayerLite[])
}

/**
 * (Opcional fallback) búsqueda en users para enriquecer nombres/emails.
 * Se mantiene por compatibilidad; si no se necesita, puede comentarse la llamada.
 */
const searchUsers = async (term: string): Promise<UserResult[]> => {
    const res = await handleApi.get(`/api/v1/users/`, { params: { search: term } })
    const data = (res as any)?.data ?? res
    return Array.isArray(data) ? (data as UserResult[]) : ((data?.results ?? []) as UserResult[])
}

/**
 * Merge básico players + users (por email o name). Si players ya trae user anidado,
 * este merge no es necesario; se conserva defensivo sin cambiar el contrato.
 */
const mergePlayersUsers = (players: PlayerLite[], users: UserResult[]): PlayerLite[] => {
    if (!Array.isArray(players) || !Array.isArray(users)) return players || []
    const byEmail = new Map < string, UserResult> (
        users.map(u => [String(u?.email || '').toLowerCase(), u])
    )
    return players.map(p => {
        const email = String(p?.user?.email || '').toLowerCase()
        const u = email ? byEmail.get(email) : undefined
        return u ? { ...p, user: { ...u, ...(p.user || {}) } } : p
    })
}

/**
 * Ejecutar búsqueda (con manejo de loading/errores)
 */
const runSearch = async (term: string) => {
    if (!term || term.length < 2) {
        results.value = []
        return
    }
    isLoading.value = true
    try {
        const players = await searchPlayers(term)
        // Fallback opcional a users para enriquecer (mantengo try/catch silencioso)
        const users = await searchUsers(term).catch(() => [] as UserResult[])
        results.value = mergePlayersUsers(players, users)
    } catch (e) {
        const _n = normalizeApiError(e as any)
        results.value = []
        // Se mantiene sin toast para no alterar UX actual
    } finally {
        isLoading.value = false
    }
}

/**
 * Input con debounce
 */
const onInput = () => {
    open.value = true
    if (debounceId) clearTimeout(debounceId)
    debounceId = setTimeout(() => runSearch(query.value.trim()), 300)
}

/**
 * Selección
 */
const select = (p: PlayerLite) => {
    emit('update:modelValue', p.id)
    open.value = false
}

/**
 * Cerrar al click afuera
 */
const onClickOutside = (e: MouseEvent) => {
    const target = e.target as Node | null
    if (!rootEl.value || !target) return
    if (!rootEl.value.contains(target)) open.value = false
}

onMounted(() => {
    document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', onClickOutside)
    if (debounceId) clearTimeout(debounceId)
})

/**
 * Si se quisiera precargar el nombre cuando ya viene un modelValue,
 * se podría hacer GET /api/v1/players/:id aquí (cuando exista ese endpoint).
 */
watch(
    () => props.modelValue,
    () => {
        // noop; selectedText se apoya en resultados recientes o en el placeholder
    }
)
</script>
