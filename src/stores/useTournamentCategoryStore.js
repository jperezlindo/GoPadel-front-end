// src/stores/category.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTournamentCategoryStore = defineStore('tournamentCategory', () => {
    const newCategories = ref([])

    const categoriesAdded = ref([
        { category_id: 1, name: 'Primera', registration_fee: 25, tournament_id: 1 },
        { category_id: 2, name: 'Mixta', registration_fee: 20, tournament_id: 1 },
        { category_id: 3, name: 'Primera mixta', registration_fee: 25, tournament_id: 2 },
        { category_id: 4, name: 'Segunda', registration_fee: 20, tournament_id: 2 },
    ])

    const setNewCategories = (data) => {
        newCategories.value = [...data]
    }

    const resetNewCategories = () => {
        newCategories.value = []
    }

    const createCategories = async (tournamentId) => {
        return new Promise((resolve) => {
            let id = 6
            const created = newCategories.value.map((cat) => ({
                ...cat,
                tournament_id: tournamentId,
                category_id: id++ // simulamos IDs únicos
            }))

            categoriesAdded.value.push(...created)
            console.log('Categorías creadas:', created)

            resetNewCategories()
            resolve(created)
        })
    }

    const updateCategories = async (tournamentId, updatedCategories) => {
        return new Promise((resolve) => {
            // Eliminamos las actuales del torneo
            categoriesAdded.value = categoriesAdded.value.filter(cat => cat.tournament_id !== tournamentId)

            // Asignamos nuevas
            const formatted = updatedCategories.map((cat, i) => ({
                ...cat,
                tournament_id: tournamentId,
                category_id: cat.category_id || Date.now() + i
            }))

            categoriesAdded.value.push(...formatted)
            resolve(formatted)
        })
    }

    const deleteCategories = async (tournamentId) => {
        return new Promise((resolve) => {
            categoriesAdded.value = categoriesAdded.value.map(cat =>
                cat.tournament_id === tournamentId
                    ? { ...cat, isActive: false }
                    : cat
            )
            console.log(`Categorías del torneo ${tournamentId} marcadas como inactivas`)
            resolve(tournamentId)
        })
    }

    const getCategoriesByTournament = (tournamentId) => {
        return categoriesAdded.value.filter(cat => cat.tournament_id === tournamentId)
    }

    return {
        newCategories,
        categoriesAdded,
        setNewCategories,
        resetNewCategories,
        createCategories,
        getCategoriesByTournament,
        updateCategories,
        deleteCategories,
    }
})