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
  },
  {
    id: 3,
    nickname: 'Luci',
    birthday: '1994-04-21',
    position: 'Drive',
    level: null,
    points: null,
    partner: null,
    user_id: 3,
    category_id: 5,
    isActive: true,
  },
  {
    id: 4,
    nickname: 'Rama',
    birthday: '1990-08-03',
    position: 'Revez',
    level: null,
    points: null,
    partner: null,
    user_id: 4,
    category_id: 5,
    isActive: true,
  },
  {
    id: 5,
    nickname: 'Pau',
    birthday: '1992-12-14',
    position: 'Drive',
    level: null,
    points: null,
    partner: null,
    user_id: 5,
    category_id: 4,
    isActive: true,
  },
  {
    id: 6,
    nickname: 'Toto',
    birthday: '1988-06-07',
    position: 'Revez',
    level: null,
    points: null,
    partner: null,
    user_id: 6,
    category_id: 4,
    isActive: true,
  },
  {
    id: 7,
    nickname: 'July',
    birthday: '1995-10-28',
    position: 'Drive',
    level: null,
    points: null,
    partner: null,
    user_id: 7,
    category_id: 3,
    isActive: true,
  },
  {
    id: 8,
    nickname: 'Cris',
    birthday: '1991-03-16',
    position: 'Revez',
    level: null,
    points: null,
    partner: null,
    user_id: 8,
    category_id: 3,
    isActive: true,
  },
  {
    id: 9,
    nickname: 'Mile',
    birthday: '1993-11-19',
    position: 'Drive',
    level: null,
    points: null,
    partner: null,
    user_id: 9,
    category_id: 2,
    isActive: true,
  },
  {
    id: 10,
    nickname: 'Bru',
    birthday: '1987-02-23',
    position: 'Revez',
    level: null,
    points: null,
    partner: null,
    user_id: 10,
    category_id: 2,
    isActive: true,
  },
  {
    id: 11,
    nickname: 'Anita',
    birthday: '1990-09-01',
    position: 'Revez',
    level: null,
    points: null,
    partner: null,
    user_id: 2,
    category_id: 1,
    isActive: true,
  },
  {
    id: 12,
    nickname: 'Vale',
    birthday: '1996-01-10',
    position: 'Drive',
    level: null,
    points: null,
    partner: null,
    user_id: 12,
    category_id: 1,
    isActive: true,
  },
])


    const positions = ref(['Drive', 'Revez', 'Ambos'])

    const fetchPlayers = async () => {
        //Para llamar a la api
    }

    const getPlayerById = (id) => {
        return players.value.find( player => player.id === id)
    }

    const getPlayerByUserId = async (userId) => {
        return players.value.find( player => player.user_id === userId)
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
        getPlayerByUserId,
        createPlayer,
        updatePlayer,
        activatePlayer,
        deactivatePlayer,
    }
})