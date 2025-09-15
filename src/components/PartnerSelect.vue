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
        <p v-if="modelValue" class="mt-2 text-sm text-gray-600">
            Seleccionado:
            <span class="font-medium">{{ selectedText }}</span>
            <button type="button" class="ml-2 text-blue-600 hover:underline" @click="$emit('update:modelValue', null)">
                Quitar
            </button>
        </p>
    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { handleApi, normalizeApiError } from '@/utils/handleApi'

/**
 * Props & emits
 */
const props = defineProps({
    modelValue: { type: [Number, null], default: null },
    placeholder: { type: String, default: 'Buscar por nick, nombre o email…' },
})
const emit = defineEmits(['update:modelValue'])

/**
 * State
 */
const rootEl = ref(null)
const query = ref('')
const results = ref([])        // [{ id, nick_name, user: { name, email } }, ...]
const open = ref(false)
const isLoading = ref(false)
let debounceId = null

/**
 * Helpers de mapeo
 */
const displayName = (p) => p?.nick_name || p?.user?.name || p?.user?.email || `Player #${p?.id}`
const displayMeta = (p) => {
    const name = p?.user?.name ? p.user.name : ''
    const email = p?.user?.email ? ` · ${p.user.email}` : ''
    return `${name}${email}`.trim()
}

/**
 * Texto del seleccionado (si está en results)
 */
const selectedText = computed(() => {
    const current = results.value.find(r => r.id === props.modelValue)
    return current ? displayName(current) : (props.modelValue ? `Player #${props.modelValue}` : '')
})

/**
 * Búsqueda principal: players
 */
const searchPlayers = async (term) => {
    const res = await handleApi.get(`/api/v1/players/`, { params: { search: term } })
    const data = res?.data ?? res
    return Array.isArray(data) ? data : (data?.results ?? [])
}

/**
 * (Opcional fallback) búsqueda en users para enriquecer nombres/emails
 * Si querés desactivarlo por ahora, comentá esta función + su uso
 */
const searchUsers = async (term) => {
    const res = await handleApi.get(`/api/v1/users/`, { params: { search: term } })
    const data = res?.data ?? res
    return Array.isArray(data) ? data : (data?.results ?? [])
}

/**
 * Merge básico players + users (por email o name). Si tu API de players ya trae user anidado,
 * este merge no suele ser necesario. Lo dejo defensivo.
 */
const mergePlayersUsers = (players, users) => {
    if (!Array.isArray(players) || !Array.isArray(users)) return players || []
    const byEmail = new Map(users.map(u => [String(u?.email || '').toLowerCase(), u]))
    return players.map(p => {
        if (p?.user?.email) {
            const u = byEmail.get(String(p.user.email).toLowerCase())
            if (u) {
                return { ...p, user: { ...u, ...(p.user || {}) } }
            }
        }
        return p
    })
}

/**
 * Ejecutar búsqueda (con manejo de loading/errores)
 */
const runSearch = async (term) => {
    if (!term || term.length < 2) {
        results.value = []
        return
    }
    isLoading.value = true
    try {
        const players = await searchPlayers(term)
        // Fallback opcional a users (podés comentar estas 2 líneas si no querés merge)
        const users = await searchUsers(term).catch(() => [])
        results.value = mergePlayersUsers(players, users)
    } catch (e) {
        const n = normalizeApiError(e)
        // Podrías mostrar un toast si querés; por ahora solo vaciamos resultados
        results.value = []
        // console.error('search error:', n.message)
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
const select = (p) => {
    emit('update:modelValue', p.id)
    open.value = false
}

/**
 * Cerrar al click afuera
 */
const onClickOutside = (e) => {
    if (!rootEl.value) return
    if (!rootEl.value.contains(e.target)) open.value = false
}

onMounted(() => {
    document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', onClickOutside)
    if (debounceId) clearTimeout(debounceId)
})

/**
 * Si quisieras precargar el nombre cuando ya viene un modelValue,
 * acá podríamos hacer GET /api/v1/players/:id (cuando exista ese endpoint).
 */
watch(() => props.modelValue, () => {
    // noop; mantenemos selectedText con resultados recientes o placeholder
})
</script>
