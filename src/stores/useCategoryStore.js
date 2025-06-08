import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCategoryStore = defineStore('category', () => {
    const categories = ref([])

    const fetchCategories = async () => {
        // Simulación inicial - reemplazá por fetch real si tenés backend
        categories.value = [
            { id: 1, name: 'Primera' },
            { id: 2, name: 'Segunda' },
            { id: 3, name: 'Tercera' }
        ]
    }

    const getCategoryById = (id) => {
        return categories.value.find(category => category.id === id)
    }

    const createCategory = async (category) => {
        category.id = Date.now()
        categories.value.push(category)
    }

    const updateCategory = async (updatedCategory) => {
        const index = categories.value.findIndex(c => c.id === updatedCategory.id)
        if (index !== -1) {
            categories.value[index] = { ...updatedCategory }
        }
    }

    return {
        categories,
        fetchCategories,
        getCategoryById,
        createCategory,
        updateCategory
    }
})
