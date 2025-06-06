// src/stores/tournament.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTournamentStore = defineStore('tournament', () => {
    const newTournament = ref({
        name: '',
        start_date: '',
        end_date: ''
    })

    const tournaments = ref([
        {
            id: 1,
            name: 'Copa Primavera',
            location: 'Club Central',
            start_date: '2025-10-15',
            end_date: '2025-10-17',
            status: 'abierto'
        },
        {
            id: 2,
            name: 'Torneo Mixto',
            location: 'Pádel Plus',
            start_date: '2025-11-01',
            end_date: '2025-11-03',
            status: 'cerrado'
        }
    ])


    const setTournament = (data) => {
        newTournament.value = data
        console.log('Torneo guardado en el store:', newTournament)
    }

    const resetTournament = () => {
        newTournament.value = { name: '', start_date: '', end_date: '' }
    }

    return {
        tournaments,
        setTournament,
        resetTournament
    }
})
