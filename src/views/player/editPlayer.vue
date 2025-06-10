<template>
    <div>
        <PlayerForm v-if="player" :modelValue="player" @submit="handleUpdate" @cancel="cancelEdit"/>
        <p v-else class="text-gray-500">Cargando jugador...</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { showToast } from '@/utils/alerts.js'
import { usePlayerStore } from '@/stores/usePlayerStore'
import PlayerForm from '@/components/PlayerForm.vue'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()

const player = ref(null)

onMounted(() => {
    const id = parseInt(route.params.id)
    const found = playerStore.getPlayerById(id)
    if (found) {
        player.value = { ...found }
    } else {
        router.push({ name: 'IndexPlayer' })
    }
})

const handleUpdate = async (updatedData) => {
    const result = await Swal.fire({
        title: 'Confirmar edición',
        text: '¿Deseás guardar los cambios del jugador?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
        await playerStore.updatePlayer(updatedData)
        router.push({ name: 'IndexPlayer' })
    }
}

const cancelEdit = () => {
    showToast({ type: 'success', message: 'Accion cancelada exitosamente' })
    router.push({ name: 'IndexPlayer' })
}
</script>
