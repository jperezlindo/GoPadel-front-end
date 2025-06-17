<template>
    <div>
        <UserForm v-if="user" :modelValue="user" @submit="handleUpdate" @cancel="cancelEdit"/>
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

onMounted(() => {
    const id = parseInt(route.params.id)
    const found = userStore.getUserById(id)
    if (found) {
        user.value = { ...found }
    } else {
        alert('Desarrollar la logica dependiendo del tipo de usuario direccionar')
    }
})

const handleUpdate = async (updatedData) => {
    const result = await Swal.fire({
        title: 'Confirmar edición',
        text: '¿Deseás guardar los cambios del usuario?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
        await userStore.updateUser(updatedData)
        if (user.value.rol_id == 1){
            router.push({ name: 'Home'})            
        }else{
            router.push({ name: 'IndexUser' })
        }
    }
}

const cancelEdit = () => {
    showToast({ type: 'success', message: 'Accion cancelada exitosamente' })
    if (user.value.rol_id == 1){
        router.push({ name: 'Home'})            
    }else{
        router.push({ name: 'IndexUser' })
    }
}

</script>
