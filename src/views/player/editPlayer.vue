<template>
    <div class="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md">
        <PlayerForm v-if="player" :modelValue="player" @submit="handleUpdate" @cancel="cancelEdit" />
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

onMounted(async () => {
    const id = Number(route.params.id)
    if (!Number.isFinite(id) || id <= 0) {
        showToast({ type: 'error', message: 'ID de jugador inválido' })
        router.push({ name: 'IndexPlayer' })
        return
    }

    // 1) Intentamos obtener desde memoria
    const cached = playerStore.getPlayerById(id)
    if (cached) {
        player.value = { ...cached }
    }

    // 2) Siempre refrescamos desde API para tener datos al día
    try {
        const fresh = await playerStore.fetchPlayerById(id)
        if (fresh) {
            player.value = { ...fresh } // usa mapper (nickname, position, etc.)
        } else if (!cached) {
            router.push({ name: 'IndexPlayer' })
        }
    } catch {
        if (!cached) {
            router.push({ name: 'IndexPlayer' })
        }
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

    if (!result.isConfirmed) return

    try {
        // Aseguramos incluir el id del jugador
        await playerStore.updatePlayer({ id: player.value.id, ...updatedData })
        showToast({ type: 'success', message: 'Jugador actualizado correctamente' })
        router.push({ name: 'IndexPlayer' })
    } catch (e) {
        showToast({ type: 'error', message: 'No se pudo actualizar el jugador' })
        console.error(e)
    }
}

const cancelEdit = () => {
    showToast({ type: 'success', message: 'Acción cancelada exitosamente' })
    router.push({ name: 'IndexPlayer' })
}
</script>
