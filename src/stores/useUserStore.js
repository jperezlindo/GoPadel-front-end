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
    rol_id: 1,
  },
  {
    id: 2,
    name: 'Marco',
    lastname: 'Anzuate',
    email: 'marco@mail.com',
    whatsapp: '3794999888',
    isActive: true,
    avatar: 'https://i.pravatar.cc/100?img=3',
    rol_id: 1,
  },
  {
    id: 3,
    name: 'Lucía',
    lastname: 'Fernández',
    email: 'lucia@mail.com',
    whatsapp: '3794000001',
    isActive: true,
    avatar: 'https://i.pravatar.cc/100?img=4',
    rol_id: 1,
  },
  {
    id: 4,
    name: 'Ramiro',
    lastname: 'Ibarra',
    email: 'ramiro@mail.com',
    whatsapp: '3794000002',
    isActive: true,
    avatar: 'https://i.pravatar.cc/100?img=5',
    rol_id: 1,
  },
  {
    id: 5,
    name: 'Paula',
    lastname: 'Sosa',
    email: 'paula@mail.com',
    whatsapp: '3794000003',
    isActive: true,
    avatar: 'https://i.pravatar.cc/100?img=6',
    rol_id: 1,
  },
  {
    id: 6,
    name: 'Matías',
    lastname: 'Ríos',
    email: 'matias@mail.com',
    whatsapp: '3794000004',
    isActive: true,
    avatar: 'https://i.pravatar.cc/100?img=7',
    rol_id: 1,
  },
  {
    id: 7,
    name: 'Julieta',
    lastname: 'Acosta',
    email: 'julieta@mail.com',
    whatsapp: '3794000005',
    isActive: true,
    avatar: 'https://i.pravatar.cc/100?img=8',
    rol_id: 1,
  },
  {
    id: 8,
    name: 'Cristian',
    lastname: 'Morel',
    email: 'cristian@mail.com',
    whatsapp: '3794000006',
    isActive: true,
    avatar: 'https://i.pravatar.cc/100?img=9',
    rol_id: 1,
  },
  {
    id: 9,
    name: 'Milena',
    lastname: 'Lopez',
    email: 'milena@mail.com',
    whatsapp: '3794000007',
    isActive: true,
    avatar: 'https://i.pravatar.cc/100?img=10',
    rol_id: 1,
  },
  {
    id: 10,
    name: 'Bruno',
    lastname: 'Salinas',
    email: 'bruno@mail.com',
    whatsapp: '3794000008',
    isActive: true,
    avatar: 'https://i.pravatar.cc/100?img=11',
    rol_id: 1,
  },
  {
    id: 11,
    name: 'Ana',
    lastname: 'Gómez',
    email: 'ana@mail.com',
    whatsapp: '3794999888',
    isActive: true,
    avatar: 'https://i.pravatar.cc/150?img=32',
    rol_id: 1,
  },
  {
    id: 12,
    name: 'Valentina',
    lastname: 'Paredes',
    email: 'valentina@mail.com',
    whatsapp: '3794000009',
    isActive: true,
    avatar: 'https://i.pravatar.cc/100?img=12',
    rol_id: 2,
  },
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
