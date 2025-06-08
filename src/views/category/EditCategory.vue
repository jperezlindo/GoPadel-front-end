<template>
    <div>
        <CategoryForm v-if="category" :modelValue="category" @submit="handleUpdate" @cancel="handleCancel" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Swal from 'sweetalert2'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { showToast } from '@/utils/alerts'
import CategoryForm from '@/components/CategoryForm.vue'

const router = useRouter()
const route = useRoute()
const categoryStore = useCategoryStore()

const category = ref(null)

onMounted(() => {
    const id = parseInt(route.params.id)
    const found = categoryStore.getCategoryById(id)
    if (found) category.value = { ...found }
    else router.push({ name: 'IndexCategory' })
})

const handleUpdate = async (data) => {
    const result = await Swal.fire({
        title: 'Confirmar edición',
        text: '¿Deseás guardar los cambios?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
        await categoryStore.updateCategory(data)
        showToast({ message: 'Categoría actualizada correctamente.', type: 'success' })
        router.push({ name: 'IndexCategory' })
    }
}

const handleCancel = async () => {
    showToast({ type: 'success', message: 'Accion cancelada exitosamente' })
    router.push({ name: 'IndexCategory' })
}
</script>
