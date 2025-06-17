import { defineStore } from 'pinia'
import { ref } from 'vue'
import { showToast } from '@/utils/alerts.js'

export const useUserStore = defineStore('user', () => {
    // REF: el rol 1 es jugador, el rol 2 es usuario
    const users = ref([
        {
            id: 1,
            name: 'Jose',
            lastname: 'Perezlindo',
            email: 'jose@mail.com',
            whatsapp: '3794112233',
            isActive: true,
            avatar: 'https://i.pravatar.cc/100?img=3',
            rol_id: 1
        },
        {
            id: 2,
            name: 'Ana',
            lastname: 'Gómez',
            email: 'ana@mail.com',
            whatsapp: '3794999888',
            isActive: true,
            avatar: 'https://i.pravatar.cc/150?img=32',
            rol_id: 2
        },
        {
            id: 3,
            name: 'Marco',
            lastname: 'Anzuate',
            email: 'marco@mail.com',
            whatsapp: '3794999888',
            isActive: true,
            avatar: 'https://i.pravatar.cc/100?img=3',
            rol_id: 1
        }
    ])

    const fetchUsers = async () => {
        // Acá deberías consumir tu API real.
        // Por ahora usamos datos simulados.
        users.value = [

        ]
    }

    const getUserById = (id) => {
        return users.value.find(user => user.id === id)
    }

    const createUser = async (user) => {
        user.id = Date.now()
        users.value.push({ ...user })
        showToast({ type: 'success', message: 'Usuario creado exitosamente' })
    }

    const updateUser = async (updatedUser) => {
        const index = users.value.findIndex(u => u.id === updatedUser.id)
        if (index !== -1) {
            users.value[index] = { ...updatedUser }
            showToast({ type: 'success', message: 'Usuario actualizado correctamente' })
        }
    }

    const deactivateUser = async (id) => {
        const user = users.value.find(u => u.id === id)
        if (user) {
            user.isActive = false
        }
    }

    const activateUser = async (id) => {
    const user = users.value.find(u => u.id === id)
    if (user) {
        user.isActive = true
    }
    }


    return {
        users,
        fetchUsers,
        getUserById,
        createUser,
        updateUser,
        deactivateUser,
        activateUser
    }
})
