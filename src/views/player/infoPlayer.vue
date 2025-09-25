<template>
    <div class="p-6">
        <ShowPlayer :user="user" :player="selectedPlayer" />
    </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'

import { useAuthStore } from '@/stores/useAuthStoretjs'
import { usePlayerStore } from '@/stores/usePlayerStore'

import ShowPlayer from '@/views/player/showPlayer.vue'

const authStore = useAuthStore()
const playerStore = usePlayerStore()

const user = ref({}) //computed(() => authStore.user)
const selectedPlayer = ref({})

onMounted( async () => {
    user.value = authStore.user
    selectedPlayer.value = await playerStore.getPlayerByUserId(user?.value.id)
})

</script>