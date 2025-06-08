<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-gray-800">Categorias</h2>
            <button @click="goToCreate" class="btn-primary w-auto px-4">+ Nueva Categoria</button>
        </div>

        <ListTable :columns="columns" :data="categories">
            <template #actions="{ row }">
                <button @click="viewCategory(row)" class="text-green-600 hover:underline mr-2">Ver</button>
                <button @click="editCategory(row.id)" class="text-blue-600 hover:underline">Editar</button>
            </template>
        </ListTable>

        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white w-full max-w-xl rounded-xl shadow-lg p-6 relative">
                <button @click="closeModal"
                    class="absolute top-2 right-2 text-gray-500 hover:text-black text-xl">×</button>
                <ShowCategory :category="selectedCategory" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCategoryStore } from '@/stores/useCategoryStore'
import ListTable from '@/components/ListTable.vue'
import ShowCategory from '@/views/category/ShowCategory.vue'

const router = useRouter()
const categoryStore = useCategoryStore()

const showModal = ref(false)
const selectedCategory = ref(null)

const categories = categoryStore.categories

const columns = [
    { label: 'Nombre', field: 'name' }
]

const goToCreate = () => {
    router.push({ name: 'CreateCategory' })
}

const editCategory = (id) => {
    router.push({ name: 'EditCategory', params: { id } })
}

const viewCategory = (category) => {
    selectedCategory.value = category
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    selectedCategory.value = null
}
</script>

<style scoped>
.btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition;
}
</style>
