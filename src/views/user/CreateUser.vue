<template>
    <div>
        <div v-if="globalError" class="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
            {{ globalError }}
        </div>

        <UserForm :modelValue="user" :errors="formErrors" @submit="handleCreate" @cancel="cancelCreate" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { useUserStore } from '@/stores/useUserStore'
import { showToast } from '@/utils/alerts'
import UserForm from '@/components/UserForm.vue'
import type { UserFront } from '@/services/userApi'
import { useFormErrors } from '@/composables/useFormErrors'

const router = useRouter()
const userStore = useUserStore()
const { errorsRaw, errors, globalError, setFromApiError, clear } = useFormErrors()

type CreateUserForm = Partial<UserFront> & { password?: string }
const user = ref<CreateUserForm>({
    name: '',
    last_name: '',
    email: '',
    password: '',
    isActive: true,
    avatar: '',
    birth_day: null,
    facility_id: null,
    city_id: null,
    rol_id: null,
})

const handleCreate = async (payload: CreateUserForm) => {
    clear()

    const result = await Swal.fire({
        title: 'Confirmar creación',
        text: '¿Deseás crear este usuario?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, crear',
        cancelButtonText: 'Cancelar',
    })
    if (!result.isConfirmed) return

    // Validaciones UX
    if (!payload.name || !payload.last_name || !payload.email) {
        errorsRaw.value = { _error: 'Nombre, Apellido y Email son obligatorios.' }
        showToast({ type: 'error', message: globalError.value! })
        return
    }
    if (!payload.password || payload.password.length < 6) {
        errorsRaw.value = { password: ['La contraseña debe tener al menos 6 caracteres.'] }
        showToast({ type: 'error', message: 'La contraseña debe tener al menos 6 caracteres.' })
        return
    }

    try {
        await userStore.createUser(payload)
        showToast({ type: 'success', message: 'Usuario creado exitosamente.' })
        router.push({ name: 'IndexUser' })
    } catch (e) {
        setFromApiError(e)
        showToast({ type: 'error', message: globalError.value ?? 'No se pudo crear el usuario.' })
    }
}
</script>

<template>
    <div>
        <div v-if="globalError" class="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
            {{ globalError }}
        </div>

        <UserForm :modelValue="user" :errors="errors" @submit="handleCreate"
            @cancel="() => router.push({ name: 'IndexUser' })" />
    </div>
</template>


<style scoped>
.btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition;
}
</style>
