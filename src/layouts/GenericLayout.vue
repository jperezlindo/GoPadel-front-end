<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUserStore } from '@/stores/useUserStore'
import { usePlayerStore } from '@/stores/usePlayerStore'

import UserLayout from '@/layouts/UserLayout.vue'
import PlayerLayout from '@/layouts/PlayerLayout.vue'

const authStore = useAuthStore()
const userStore = useUserStore()
const playerStore = usePlayerStore()

// Determinar el layout dinámico
const layoutComponent = computed(() => {
  // if (authStore.isUser()) 
  // return UserLayout
  return PlayerLayout
})

onMounted(() => {
  // // 1. Cargar desde localStorage si existe
  // // const storedUser = JSON.parse(localStorage.getItem('auth_user'))
  // // if (storedUser && !authStore.user) {
  // //   authStore.setUser(storedUser)
  // // }

  // // const storedPlayer = JSON.parse(localStorage.getItem('auth_player'))
  // // if (storedPlayer && !authStore.player) {
  // //   authStore.setPlayer(storedPlayer)
  // // }

  // // 2. Fallback para desarrollo (usuario por defecto)
  // //if (!authStore.user) {
  //   const fallbackUser = userStore.getUserById() // podés cambiar a 12
  //   console.log('Fallback user set:', authStore.user)
  //   if (fallbackUser) authStore.setUser(fallbackUser)
  // //}

  // // 3. Si el usuario tiene rol jugador, buscar su player asociado
  // if (!authStore.player && authStore.user?.rol_id === 1) {
  //   const fallbackPlayer = playerStore.getPlayerByUserId(authStore.user.id)
  //   if (fallbackPlayer) authStore.setPlayer(fallbackPlayer)
  // }
})
</script>

