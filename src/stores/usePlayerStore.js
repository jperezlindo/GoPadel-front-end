import { defineStore } from "pinia"
import { ref } from 'vue'
import { showToast } from '@/utils/alerts.js'

export const usePlayerStore = defineStore( 'player', () =>{
    const players = ref([
        {
            id: 1,
            nickname: 'Gono',
            birthday: '1989-09-13',
            position: 'Drive',
            level: null,
            points: null,
            partner: null,
            user_id: 1,
            category_id: 6,
            isActive: true,
        },
                {
            id: 2,
            nickname: 'Misil',
            birthday: '1989-09-13',
            position: 'Revez',
            level: null,
            points: null,
            partner: null,
            user_id: 2,
            category_id: 6,
            isActive: true,
        }
    ])

    const positions = ref(['Drive', 'Revez', 'Ambos'])

    const fetchPlayers = async () => {
        //Para llamar a la api
    }

    const getPlayerById = (id) => {
        return players.value.find( player => player.id === id)
    }

    const createPlayer = (player) => {
        players.value.push({...player})
        showToast({ type: 'success', message: 'Jugador creado exitosamente' })
    }

    const updatePlayer = async (updatePlayer) => {
        const index = players.value.findIndex( player => player.id === updatePlayer.id)
        if (index !== -1){
            players.value[index] = {...updatePlayer}
            showToast({ type: 'success', message: 'Jugador actualizado correctamente' })
        }
    }

    const activatePlayer = (playerId) => {
        let player = players.value.find(player => player.id === playerId)
        if (player) player.isActive = true
    }

    const deactivatePlayer = (playerId) => {
        let player = players.value.find(player => player.id === playerId)
        if (player) player.isActive = false
    }
    
    return {
        players,
        positions,
        getPlayerById,
        createPlayer,
        updatePlayer,
        activatePlayer,
        deactivatePlayer,
    }
})