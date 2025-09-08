<template>
    <div>
        <UserForm v-if="user" :modelValue="user" :errors="formErrors" @submit="handleUpdate" @cancel="cancelEdit" />
        <p v-else class="text-gray-500">Cargando usuario...</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { showToast } from '@/utils/alerts.js'
import { useUserStore } from '@/stores/useUserStore'
import UserForm from '@/components/UserForm.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const user = ref(null)
// errores normalizados { campo: string[], _error?: string }
const formErrors = ref({})

/** Normaliza formatos de error de back (DRF/Django) a { campo: string[] } */
const parseApiErrors = (err) => {
    const out = {}
    const data = err?.response?.data ?? err?.data ?? err

    if (!data) {
        out._error = 'Ocurrió un error inesperado. Intenta nuevamente.'
        return out
    }
    if (typeof data === 'string') {
        out._error = data
        return out
    }
    if (Array.isArray(data)) {
        out._error = data.join(', ')
        return out
    }
    for (const key of Object.keys(data)) {
        const val = data[key]
        if (key === 'detail') {
            out._error = Array.isArray(val) ? val.join(' ') : String(val)
            continue
        }
        if (key === 'non_field_errors' || key === 'nonFieldErrors') {
            const arr = Array.isArray(val) ? val : [String(val)]
            out._error = arr.join(' ')
            continue
        }
        if (Array.isArray(val)) out[key] = val.map(v => String(v))
        else if (typeof val === 'string') out[key] = [val]
        else out[key] = [JSON.stringify(val)]
    }
    return out
}

onMounted(async () => {
    const id = Number(route.params.id)
    if (!Number.isFinite(id)) {
        showToast({ type: 'error', message: 'ID inválido.' })
        router.push({ name: 'IndexUser' })
        return
    }

    // Intentar obtener desde el store; si no está, fetch
    const found = userStore.getUserById(id)
    if (found) {
        user.value = { ...found }
        return
    }

    try {
        const fetched = await userStore.fetchUserById(id)
        if (!fetched) {
            showToast({ type: 'error', message: 'Usuario no encontrado.' })
            router.push({ name: 'IndexUser' })
            return
        }
        user.value = { ...fetched }
    } catch {
        showToast({ type: 'error', message: 'No se pudo cargar el usuario.' })
        router.push({ name: 'IndexUser' })
    }
})

const handleUpdate = async (updatedData) => {
    // limpiar errores previos
    formErrors.value = {}

    const result = await Swal.fire({
        title: 'Confirmar edición',
        text: '¿Deseás guardar los cambios del usuario?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
    })
    if (!result.isConfirmed) return

    try {
        const saved = await userStore.updateUser(updatedData)
        showToast({ type: 'success', message: 'Usuario actualizado correctamente.' })

        // decidir redirección por rol
        const rolId = saved?.rol_id ?? user.value?.rol_id
        if (rolId === 1) router.push({ name: 'Home' })
        else router.push({ name: 'IndexUser' })
    } catch (e) {
        formErrors.value = parseApiErrors(e)
        const global =
            formErrors.value._error ||
            Object.values(formErrors.value).find(v => Array.isArray(v))?.[0] ||
            'No se pudo actualizar el usuario.'
        showToast({ type: 'error', message: global })
    }
}

const cancelEdit = () => {
    showToast({ type: 'success', message: 'Acción cancelada exitosamente' })
    const rolId = user.value?.rol_id
    if (rolId === 1) router.push({ name: 'Home' })
    else router.push({ name: 'IndexUser' })
}
</script>
