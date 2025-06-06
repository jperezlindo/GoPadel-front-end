<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
            <button @click="openForm()" class="btn-primary w-auto px-4">
                + Nuevo Usuario
            </button>
        </div>

        <!-- Tabla de usuarios -->
        <ListTable :columns="columns" :data="users">
            <template #actions="{ row }">
                <button @click="openForm(row)" class="text-blue-600 hover:underline mr-2">Editar</button>
                <button @click="deleteUser(row.id)" class="text-red-600 hover:underline">Eliminar</button>
            </template>
        </ListTable>

        <!-- Modal para crear/editar -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div class="bg-white p-6 rounded-2xl shadow-md w-full max-w-xl relative">
                <button @click="closeForm"
                    class="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl">&times;</button>
                <UserForm :user="selectedUser" @submit="handleSubmit" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import ListTable from '@/components/ListTable.vue'
import UserForm from '@/components/UserForm.vue'

// Datos simulados
const users = ref([
    {
        id: 1,
        name: 'Juan',
        lastname: 'Pérez',
        email: 'juan@example.com',
        whatsapp: '549111111111',
        password: '*****'
    },
    {
        id: 2,
        name: 'Ana',
        lastname: 'González',
        email: 'ana@example.com',
        whatsapp: '549222222222',
        password: '*****'
    }
])

// Columnas para la tabla
const columns = [
    { label: 'Nombre', field: 'name' },
    { label: 'Apellido', field: 'lastname' },
    { label: 'Email', field: 'email' },
    { label: 'WhatsApp', field: 'whatsapp' }
]

// Modal y selección
const showModal = ref(false)
const selectedUser = ref(null)

function openForm(user = null) {
    selectedUser.value = user ? { ...user } : {}
    showModal.value = true
}

function closeForm() {
    showModal.value = false
    selectedUser.value = null
}

function handleSubmit(user) {
    if (user.id) {
        const index = users.value.findIndex(u => u.id === user.id)
        if (index !== -1) users.value[index] = user
    } else {
        user.id = Date.now()
        users.value.push(user)
    }
    closeForm()
}

function deleteUser(id) {
    users.value = users.value.filter(u => u.id !== id)
}
</script>

<style scoped>
.btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition;
}
</style>
