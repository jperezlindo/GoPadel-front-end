import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null) // { id: 1, name: 'Juan', role: 'admin' }

  const setUser = (userData) => {
    user.value = userData
  }

  const logout = () => {
    user.value = null
    // también podés limpiar tokens, redirigir, etc.
  }

  const isUser = () => user.value?.rol_id == 2
  const isPlayer = () => user.value?.rol_id == 1

  return {
    user,
    setUser,
    logout,
    isUser,
    isPlayer
  }
})
