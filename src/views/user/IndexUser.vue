<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-gray-800">Usuarios</h2>
            <button @click="goToCreate" class="btn-primary w-auto px-4">+ Nuevo Usuario</button>
        </div>

        <!-- Filtro por estado -->
        <div class="mb-4">
            <label class="mr-2 font-medium">Mostrar:</label>
            <select v-model="statusFilter" class="border px-3 py-2 rounded-md">
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
            </select>
        </div>

        <!-- Tabla de usuarios -->
        <ListTable :columns="columns" :data="filteredUsers">
            <template #actions="{ row }">
                <button @click="showUser(row)" class="text-green-600 hover:underline mr-2">Ver</button>
                <button @click="editUser(row.id)" class="text-blue-600 hover:underline mr-2">Editar</button>
                <button v-if="statusFilter === 'active'" @click="deactivateUser(row.id)"
                    class="text-red-600 hover:underline">
                    Desactivar
                </button>
                <button v-else @click="activateUser(row.id)" class="text-green-600 hover:underline">
                    Activar
                </button>
            </template>
        </ListTable>

        <!-- Modal para ShowUser -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 relative">
                <button @click="closeModal"
                    class="absolute top-2 right-2 text-gray-500 hover:text-black text-xl">×</button>
                <ShowUser :user="selectedUser" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from '@/utils/alerts.js'
import Swal from 'sweetalert2'

import ListTable from '@/components/ListTable.vue'
import ShowUser from '@/views/user/ShowUser.vue'

import { useUserStore } from '@/stores/useUserStore.js'

const router = useRouter()
const userStore = useUserStore()


let selectedUser = {}
const users =  ref([])
const showModal = ref(false)
const statusFilter = ref('active')

const columns = [
    { label: 'Nombre', field: 'name' },
    { label: 'Apellido', field: 'lastname' },
    { label: 'Email', field: 'email' },
    { label: 'WhatsApp', field: 'whatsapp' },
]

onMounted( () => {
    users.value = userStore.users
})

const filteredUsers = computed(() => {
    if (!Array.isArray(users.value)) return []
    return users.value.filter(u => u.isActive === (statusFilter.value === 'active'))
})

const goToCreate = () => {
    router.push({ name: 'CreateUser' })
}

const editUser = (userId) => {
    router.push({ name: 'EditUser', params: { id: userId } })
}

const deactivateUser = async (id) => {
    const result = await Swal.fire({
        title: 'Desactivar usuario',
        text: '¿Estás seguro de que querés desactivar este usuario?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, desactivar',
        cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
        await userStore.deactivateUser(id)
        showToast({
            message: 'El usuario fue desactivado correctamente.',
            type: 'success'
        })
    }
}

const activateUser = async (id) => {
    const result = await Swal.fire({
        title: 'Activar usuario',
        text: '¿Querés volver a activar este usuario?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, activar',
        cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
        await userStore.activateUser(id)
        showToast({
            message: 'El usuario fue activado correctamente.',
            type: 'success'
        })
    }
}

const showUser = (user) => {
    selectedUser = user
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    selectedUser = null
}
</script>

<style scoped>
.btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition;
}
</style>
