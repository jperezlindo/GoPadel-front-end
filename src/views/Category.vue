<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-gray-800">Gestión de Categorías</h2>
            <button @click="openForm()" class="btn-primary w-auto px-4">
                + Nueva Categoría
            </button>
        </div>

        <ListTable :columns="columns" :data="categories">
            <template #actions="{ row }">
                <button @click="openForm(row)" class="text-blue-600 hover:underline mr-2">Editar</button>
                <button @click="deleteCategory(row.id)" class="text-red-600 hover:underline">Eliminar</button>
            </template>
        </ListTable>

        <!-- Modal para alta / edición -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div class="bg-white p-6 rounded-2xl shadow-md w-full max-w-xl relative">
                <button @click="closeForm"
                    class="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl">&times;</button>
                <CategoryForm :modelValue="selectedCategory" @submit="handleSubmit" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import ListTable from '@/components/ListTable.vue'
import CategoryForm from '@/components/CategoryForm.vue'

const categories = ref([
    { id: 1, name: 'Primera'},
    { id: 2, name: 'Segunda'},
    { id: 3, name: 'Mixta'}
])

const columns = [
    { label: 'Nombre', field: 'name' },
]

const showModal = ref(false)
const selectedCategory = ref(null)

function openForm(category = null) {
    selectedCategory.value = category ? { ...category } : {}
    showModal.value = true
}

function closeForm() {
    showModal.value = false
    selectedCategory.value = null
}

function handleSubmit(category) {
    if (category.id) {
        const index = categories.value.findIndex(c => c.id === category.id)
        if (index !== -1) categories.value[index] = category
    } else {
        category.id = Date.now()
        categories.value.push(category)
    }
    closeForm()
}

function deleteCategory(id) {
    categories.value = categories.value.filter(c => c.id !== id)
}
</script>

<style scoped>
.btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition;
}
</style>
