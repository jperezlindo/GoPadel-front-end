<template>
    <div>
        <!-- Error global opcional arriba del form -->
        <div v-if="globalError" class="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
            {{ globalError }}
        </div>

        <UserForm :modelValue="user" :errors="formErrors" @submit="handleCreate" @cancel="cancelCreate" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { useUserStore } from '@/stores/useUserStore'
import { showToast } from '@/utils/alerts.js'
import UserForm from '@/components/UserForm.vue'

const router = useRouter()
const userStore = useUserStore()

// Estado inicial alineado al UserForm
const user = ref({
    name: '',
    last_name: '',
    email: '',
    password: '',
    isActive: true,
    avatar: '',
    birth_day: null,   // 'YYYY-MM-DD'
    facility_id: null,
    city_id: null,
    rol_id: null,
})

// Errores por campo (vienen de e.detail) + posible _error global
const formErrors = ref({})
const globalError = computed(() => formErrors.value._error || null)

const handleCreate = async (payload) => {
    // limpiar errores previos
    formErrors.value = {}

    // Confirmación
    const result = await Swal.fire({
        title: 'Confirmar creación',
        text: '¿Deseás crear este usuario?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, crear',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
    })
    if (!result.isConfirmed) return

    // Validaciones rápidas de UX (opcionales; el back valida de todos modos)
    if (!payload.name || !payload.last_name || !payload.email) {
        formErrors.value = { _error: 'Nombre, Apellido y Email son obligatorios.' }
        showToast({ type: 'error', message: formErrors.value._error })
        return
    }
    if (!payload.password || payload.password.length < 6) {
        formErrors.value = { password: ['La contraseña debe tener al menos 6 caracteres.'] }
        showToast({ type: 'error', message: 'La contraseña debe tener al menos 6 caracteres.' })
        return
    }

    try {
        await userStore.createUser(payload)
        showToast({ type: 'success', message: 'Usuario creado exitosamente.' })
        router.push({ name: 'IndexUser' })
    } catch (e) {
        // e viene normalizado por handleApi.normalizeApiError
        // e.detail => dict por campo (ej: { email: ["..."] })
        // e.message => legible para toast
        const detail = e?.detail
        formErrors.value =
            detail && typeof detail === 'object' && Object.keys(detail).length
                ? detail
                : { _error: e?.message || 'No se pudo crear el usuario.' }

        showToast({ type: 'error', message: e?.message || 'No se pudo crear el usuario.' })
    }
}

const cancelCreate = () => {
    showToast({ type: 'success', message: 'Acción cancelada exitosamente.' })
    router.push({ name: 'IndexUser' })
}
</script>

<style scoped>
.btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition;
}
</style>
