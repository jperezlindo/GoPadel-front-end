<template>
    <div>
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-gray-800">Usuarios</h2>
            <button @click="goToCreate" class="btn-primary w-auto px-4">+ Nuevo Usuario</button>
        </div>

        <!-- Filtros -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div class="md:col-span-2">
                <input v-model="searchTerm" type="text" placeholder="Buscar por nombre, apellido o email…"
                    class="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring focus:ring-blue-200" />
            </div>
            <div>
                <select v-model="statusFilter"
                    class="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring focus:ring-blue-200">
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                </select>
            </div>
        </div>

        <!-- Tabla -->
        <ListTable :columns="columns" :data="filteredUsers">
            <template #actions="{ row }">
                <div class="flex items-center gap-3">
                    <button @click="showUser(row)" class="text-green-600 hover:underline">Ver</button>
                    <button @click="editUser(row.id)" class="text-blue-600 hover:underline">Editar</button>
                    <button @click="onToggleActive(row)"
                        :class="row.isActive ? 'text-red-600 hover:underline' : 'text-emerald-600 hover:underline'">
                        {{ row.isActive ? 'Desactivar' : 'Activar' }}
                    </button>
                </div>
            </template>
        </ListTable>

        <!-- Footer con conteos -->
        <div class="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-3">
            <span>Total: {{ totals.total }}</span>
            <span>• Activos: {{ totals.active }}</span>
            <span>• Inactivos: {{ totals.inactive }}</span>
            <button v-if="searchTerm || statusFilter !== 'all'" @click="clearFilters"
                class="ml-auto underline text-gray-700 hover:text-black">
                Limpiar filtros
            </button>
        </div>

        <!-- Modal ShowUser -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 relative">
                <button @click="closeModal"
                    class="absolute top-2 right-2 text-gray-500 hover:text-black text-xl">×</button>
                <ShowUser v-if="selectedUser" :user="selectedUser!" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { showToast } from '@/utils/alerts'

import ListTable from '@/components/ListTable.vue'
import ShowUser from '@/views/user/ShowUser.vue'
import { useUserStore } from '@/stores/useUserStore'
import type { UserFront } from '@/services/userApi'

const router = useRouter()
const userStore = useUserStore()

const ROLE_PLAYER = 3

const showModal = ref(false)
const selectedUser = ref < UserFront | null > (null)

// Filtros locales
const searchTerm = ref < string > ('')
const statusFilter = ref < 'all' | 'active' | 'inactive' > ('all')

// Columnas del modelo/front actual
const columns: Array<{ label: string; field: keyof UserFront | 'rol_id' }> = [
    { label: 'Nombre', field: 'name' },
    { label: 'Apellido', field: 'last_name' },
    { label: 'Email', field: 'email' },
    { label: 'Rol ID', field: 'rol_id' },
]

// Cargar usuarios al montar
onMounted(async () => {
    try {
        await userStore.fetchUsers()
    } catch {
        showToast({ type: 'error', message: 'No se pudieron cargar los usuarios' })
    }
})

// Totales (sobre el store) — excluye jugadores
const totals = computed(() => {
    const list = Array.isArray(userStore.users) ? userStore.users : []
    const base = list.filter(u => u.rol_id !== ROLE_PLAYER)
    const active = base.filter(u => !!u.isActive).length
    const inactive = base.filter(u => !u.isActive).length
    return { total: base.length, active, inactive }
})

// Normaliza texto para búsqueda
const toKey = (v: unknown): string =>
    String(v ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()

// Filtro combinado (excluye jugadores)
const filteredUsers = computed < UserFront[] > (() => {
    const list = Array.isArray(userStore.users) ? (userStore.users as UserFront[]) : []
    const base = list.filter(u => u.rol_id !== ROLE_PLAYER)

    // estado
    let byStatus = base
    if (statusFilter.value === 'active') byStatus = base.filter(u => !!u.isActive)
    if (statusFilter.value === 'inactive') byStatus = base.filter(u => !u.isActive)

    // búsqueda por nombre, apellido o email
    const termKey = toKey(searchTerm.value)
    if (!termKey) return byStatus

    return byStatus.filter(u => {
        const nameKey = toKey(u.name)
        const lastKey = toKey(u.last_name)
        const emailKey = toKey(u.email)
        return nameKey.includes(termKey) || lastKey.includes(termKey) || emailKey.includes(termKey)
    })
})

const clearFilters = () => {
    searchTerm.value = ''
    statusFilter.value = 'all'
}

const goToCreate = () => {
    router.push({ name: 'CreateUser' })
}

const editUser = (userId: number) => {
    router.push({ name: 'EditUser', params: { id: userId } })
}

const showUser = (user: UserFront) => {
    selectedUser.value = user
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    selectedUser.value = null
}

// Activar/Desactivar con confirmación y toast
const onToggleActive = async (row: UserFront) => {
    const nextState = !row.isActive
    const actionText = nextState ? 'activar' : 'desactivar'

    const result = await Swal.fire({
        title: `${nextState ? 'Activar' : 'Desactivar'} usuario`,
        text: `¿Confirmás ${actionText} a "${row?.name ?? row.id}"?`,
        icon: nextState ? 'question' : 'warning',
        showCancelButton: true,
        confirmButtonText: `Sí, ${actionText}`,
        cancelButtonText: 'Cancelar',
    })
    if (!result.isConfirmed) return

    try {
        await userStore.toggleActive(row.id, nextState)
        showToast({
            type: 'success',
            message: nextState ? 'Usuario activado correctamente.' : 'Usuario desactivado correctamente.',
        })
    } catch {
        showToast({
            type: 'error',
            message: nextState ? 'No se pudo activar el usuario.' : 'No se pudo desactivar el usuario.',
        })
    }
}
</script>

<style scoped>
.btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition;
}
</style>
