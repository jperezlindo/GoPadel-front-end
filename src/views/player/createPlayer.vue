<template>
    <div>
        <PlayerForm :modelValue="player" @submit="handleCreate" @cancel="handleCancel"/>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import Swal from 'sweetalert2'

import { showToast } from '@/utils/alerts.js'

import { usePlayerStore } from '@/stores/usePlayerStore'

import PlayerForm from '@/components/PlayerForm.vue'

const router = useRouter()
const playerStore = usePlayerStore()

const player = ref({
    nickname: '',
    birthday: '',
    position: '',
    level: null,
    points: null,
    partner: null,
    user_id: 3,
    category_id: null,
    isActive: true,
})

const handleCreate = async (data) => {
    const result = await Swal.fire({
        title: 'Confirmar creación',
        text: '¿Deseás crear el Jugador?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, crear',
        cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
        await playerStore.createPlayer(data)
        router.push({ name: 'IndexPlayer' })
    }
}

const handleCancel = async () => {
    showToast({ type: 'success', message: 'Accion cancelada exitosamente' })
    router.push({ name: 'IndexPlayer' })
}

</script>