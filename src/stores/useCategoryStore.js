import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCategoryStore = defineStore('category', () => {
    const newCategories = ref([])

    const availableCategories = ref([
        { id: 1, name: 'Primera' },
        { id: 2, name: 'Segunda' },
        { id: 3, name: 'tercera' },
    ])
    
    const categoriesAdded = ref([
        { category_id: 1, name: 'Primera', registration_fee: 25 },
        { category_id: 2, name: 'Mixta', registration_fee: 20 }
    ])

    const setNewCategories = (data) => {
        newCategories.value = data
        console.log('Categorias guardada en el store:', newCategories)
    }

    const resetCategory = () => {
        category.value = {name: '', registration_fee: 0}
    }

    return {
        categoriesAdded,
        availableCategories,
        setNewCategories,
        resetCategory
    }
})