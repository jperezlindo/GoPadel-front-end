<template>
    <div>
        <CategoryForm :modelValue="category" @submit="handleCreate" @cancel="handleCancel" />
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { showToast } from '@/utils/alerts'
import CategoryForm from '@/components/CategoryForm.vue'

const router = useRouter()
const categoryStore = useCategoryStore()

const category = ref({
    name: ''
})

const handleCreate = async (data) => {
    const result = await Swal.fire({
        title: 'Confirmar creación',
        text: '¿Deseás crear esta categoría?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, crear',
        cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
        await categoryStore.createCategory(data)
        showToast({ message: 'Categoría creada exitosamente.', type: 'success' })
        router.push({ name: 'IndexCategory' })
    }
}

const handleCancel = async () => {
    showToast({ type: 'success', message: 'Accion cancelada exitosamente' })
    router.push({ name: 'IndexCategory' })
}
</script>
