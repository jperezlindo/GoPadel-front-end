// src/stores/tournament.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTournamentStore = defineStore('tournament', () => {
    const newTournament = ref({
        id: 0,
        name: '',
        start_date: '',
        end_date: '',
        sports_complex_id: 0,
        isActive: true
    })

    const tournaments = ref([
        {
            id: 1,
            name: 'Copa Primavera',
            start_date: '2025-10-15',
            end_date: '2025-10-17',
            sports_complex_id: 1,
            isActive: true
        },
        {
            id: 2,
            name: 'Torneo Mixto',
            start_date: '2025-11-01',
            end_date: '2025-11-03',
            sports_complex_id: 1,
            isActive: true
        }
    ])

    const setTournament = (data) => {
        newTournament.value = { ...data }
    }

    const resetTournament = () => {
        newTournament.value = {
            id: 0,
            name: '',
            start_date: '',
            end_date: '',
            sports_complex_id: 0,
            isActive: true
        }
    }

    const createTournament = async () => {
        return new Promise((resolve) => {
            const created = {
                ...newTournament.value,
                id: 3 // simulamos un ID único
            }
            tournaments.value.push(created)
            console.log('Torneo creado:', created)
            resetTournament()
            resolve(created.id)
        })
    }

    const updateTournament = (updatedTournament) => {
        const index = tournaments.value.findIndex(t => t.id === updatedTournament.id)
        if (index !== -1) {
            tournaments.value[index] = { ...updatedTournament }
        }
    }
    
    const deleteTournament = async (tournamentId) => {
        return new Promise((resolve) => {
            const index = tournaments.value.findIndex(t => t.id === tournamentId)
            if (index !== -1) {
                tournaments.value[index].isActive = false
            }
            resolve(tournamentId)
        })
    }

    const getTournamentById = (id) => {
        return tournaments.value.find(t => t.id === Number(id))
    }

    return {
        newTournament,
        tournaments,
        setTournament,
        resetTournament,
        createTournament,
        getTournamentById,
        updateTournament,
        deleteTournament,
    }
})
