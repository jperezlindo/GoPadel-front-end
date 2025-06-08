<template>
    <div>
        <h2 class="text-2xl font-bold mb-6">Crear Nuevo Usuario</h2>
        <UserForm :modelValue="user" @submit="handleCreate" @cancel="cancelCreate"/>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { useUserStore } from '@/stores/useUserStore'
import { showToast } from '@/utils/alerts.js'
import UserForm from '@/components/UserForm.vue'

const router = useRouter()
const userStore = useUserStore()

const user = ref({
    name: '',
    lastname: '',
    email: '',
    whatsapp: '',
    password: '',
    isActive: true,
    image: ''
})

const handleCreate = async (data) => {
    const result = await Swal.fire({
        title: 'Confirmar creación',
        text: '¿Deseás crear este usuario?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, crear',
        cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
        await userStore.createUser(data)
        router.push({ name: 'IndexUser' })
    }
}

const cancelCreate = () => {
    showToast({ type: 'success', message: 'Accion cancelada exitosamente' })
    router.push({ name: 'IndexUser' })
}
</script>
