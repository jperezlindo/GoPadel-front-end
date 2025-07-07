import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // Estado persistente usando localStorage
  const user = ref(JSON.parse(localStorage.getItem('auth_user')) || null)
  const player = ref(JSON.parse(localStorage.getItem('auth_player')) || null)

  // Setters con persistencia
  const setUser = (u) => {
    user.value = u
    localStorage.setItem('auth_user', JSON.stringify(u))
  }

  const setPlayer = (p) => {
    player.value = p
    localStorage.setItem('auth_player', JSON.stringify(p))
  }

  const logout = () => {
    user.value = null
    player.value = null
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_player')
  }

  // Helpers
  const isUser = () => user.value?.rol_id === 2
  const isPlayer = () => user.value?.rol_id === 1
  const isLoggedIn = () => !!user.value

  return {
    user,
    player,
    setUser,
    setPlayer,
    logout,
    isUser,
    isPlayer,
    isLoggedIn,
  }
})
