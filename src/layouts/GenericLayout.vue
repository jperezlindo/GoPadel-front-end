<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUserStore } from '@/stores/useUserStore'

import UserLayout from '@/layouts/UserLayout.vue'
import PlayerLayout from '@/layouts/PlayerLayout.vue'

const authStore = useAuthStore()
const userStore = useUserStore()

const layoutComponent = computed(() => {
  if (authStore.isUser()) return UserLayout
  return PlayerLayout
})

onMounted( () => {
    authStore.setUser(userStore.getUserById(1))
})
</script>
