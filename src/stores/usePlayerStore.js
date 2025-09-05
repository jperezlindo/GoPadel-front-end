// src/stores/usePlayerStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { showToast } from '@/utils/alerts.js'
import { handleApi } from '@/utils/handleApi' // axios preconfigurado

const BASE = '/api/v1/players/'

// ---- Mappers: API <-> Front ----

// API -> Front
const fromApi = (api = {}) => {
    // normalización de posición para UI
    const posApi = (api.position ?? '').toString().toUpperCase()
    const position =
        posApi === 'DRIVE' ? 'Drive' :
            posApi === 'REVES' ? 'Revez' :
                '' // vacío = sin posición (equivale a null en back)

    return {
        id: api.id ?? 0,

        // relaciones (IDs simples)
        user_id: api.user ?? api.user_id ?? null,
        category_id: api.category ?? api.category_id ?? null,

        // campos visibles del modelo Player
        nickname: api.nick_name ?? '',         // <- nick_name en back
        position,                               // 'Drive' | 'Revez' | ''
        level: api.level ?? null,               // decimal (number o null)
        points: api.points ?? null,             // int (number o null)

        // flags / timestamps
        isActive: Boolean(api.is_active ?? api.isActive ?? true),
        created_at: api.created_at ?? null,
        updated_at: api.updated_at ?? null,
    }
}

// Front -> API
const toApi = (front = {}) => {
    const userId = Number(front.user_id ?? front.user?.id ?? front.user)
    const categoryId = Number(front.category_id ?? front.category?.id ?? front.category)

    // normalizar posición de UI -> back
    // UI acepta 'Drive' | 'Revez' | 'Ambos' | '' | null
    const p = (front.position ?? '').toString().toLowerCase()
    const position =
        p === 'drive' ? 'DRIVE' :
            p === 'revez' ? 'REVES' :
                null // 'Ambos' o vacío => null

    // level y points como numéricos o null
    const levelNum = front.level === '' || front.level === undefined ? null : Number(front.level)
    const pointsNum = front.points === '' || front.points === undefined ? null : Number(front.points)

    return {
        user: Number.isFinite(userId) && userId > 0 ? userId : null,
        category: Number.isFinite(categoryId) && categoryId > 0 ? categoryId : null,

        nick_name: (front.nickname ?? '').toString().trim(), // <- nick_name en back
        position,                                            // 'DRIVE' | 'REVES' | null
        level: Number.isFinite(levelNum) ? levelNum : null,  // DecimalField
        points: Number.isFinite(pointsNum) ? pointsNum : null,

        is_active: Boolean(front.is_active ?? front.isActive),
    }
}


export const usePlayerStore = defineStore('player', () => {
    const players = ref([])
    const positions = ref(['Drive', 'Revez', 'Ambos'])
    const loading = ref(false)
    const error = ref(null)

    // ==== READ: listar (el backend ya filtra is_active=true) ====
    const fetchPlayers = async () => {
        loading.value = true
        error.value = null
        try {
            const { data } = await handleApi.get(BASE)
            const list = Array.isArray(data) ? data : (data?.results ?? [])
            players.value = list.map(fromApi)
        } catch (e) {
            error.value = e
            console.error('Error fetching players:', e)
            players.value = []
            showToast({ type: 'error', message: 'No se pudieron cargar los jugadores' })
        } finally {
            loading.value = false
        }
    }

    // ==== READ: detalle por id (id en URL) ====
    const fetchPlayerById = async (id) => {
        const playerId = Number(id)
        if (!Number.isFinite(playerId)) return null
        loading.value = true
        error.value = null
        try {
            const { data } = await handleApi.get(`${BASE}${playerId}/`)
            const item = fromApi(data)
            const idx = players.value.findIndex(p => p.id === item.id)
            if (idx === -1) players.value.push(item)
            else players.value[idx] = item
            return item
        } catch (e) {
            error.value = e
            console.error(`Error fetching player #${playerId}:`, e)
            showToast({ type: 'error', message: 'No se pudo obtener el jugador' })
            return null
        } finally {
            loading.value = false
        }
    }

    // ==== HELPERS locales ====
    const getPlayerById = (id) => players.value.find(p => p.id === Number(id))

    // Según tu aclaración: el "id" viene en la URL.
    // Si en tu UI lo llamás "userId", igualmente usamos /players/{id}/
    const getPlayerByUserId = async (userId) => {
        return await fetchPlayerById(userId)
    }

    // ==== CREATE ====
    const createPlayer = async (player) => {
        error.value = null
        try {
            const payload = toApi(player)
            const { data } = await handleApi.post(BASE, payload)
            const created = fromApi(data)
            players.value.push(created)
            showToast({ type: 'success', message: 'Jugador creado exitosamente' })
            return created
        } catch (e) {
            error.value = e
            console.error('Error creating player:', e)
            showToast({ type: 'error', message: 'No se pudo crear el jugador' })
            throw e
        }
    }

    // ==== UPDATE ====
    const updatePlayer = async (updatePlayer) => {
        error.value = null
        try {
            const id = Number(updatePlayer?.id)
            if (!Number.isFinite(id)) throw new Error('ID de jugador inválido')
            const payload = toApi(updatePlayer)
            const { data } = await handleApi.patch(`${BASE}${id}/`, payload)
            const saved = fromApi(data)

            const idx = players.value.findIndex(p => p.id === id)
            if (idx !== -1) players.value[idx] = saved
            else players.value.push(saved)

            showToast({ type: 'success', message: 'Jugador actualizado correctamente' })
            return saved
        } catch (e) {
            error.value = e
            console.error('Error updating player:', e)
            showToast({ type: 'error', message: 'No se pudo actualizar el jugador' })
            throw e
        }
    }

    // ==== ACTIVATE / DEACTIVATE (PATCH is_active) ====
    const activatePlayer = async (playerId) => {
        error.value = null
        try {
            const id = Number(playerId)
            if (!Number.isFinite(id)) throw new Error('ID de jugador inválido')

            const { data } = await handleApi.patch(`${BASE}${id}/`, { is_active: true })
            const saved = data ? fromApi(data) : null

            const idx = players.value.findIndex(p => p.id === id)
            if (idx !== -1) {
                players.value[idx] = saved ?? { ...players.value[idx], isActive: true }
            }

            showToast({ type: 'success', message: 'Jugador activado' })
            return saved ?? players.value[idx]
        } catch (e) {
            error.value = e
            console.error('Error activating player:', e)
            showToast({ type: 'error', message: 'No se pudo activar el jugador' })
            throw e
        }
    }

    const deactivatePlayer = async (playerId) => {
        error.value = null
        try {
            const id = Number(playerId)
            if (!Number.isFinite(id)) throw new Error('ID de jugador inválido')

            const { data } = await handleApi.patch(`${BASE}${id}/`, { is_active: false })
            const saved = data ? fromApi(data) : null

            const idx = players.value.findIndex(p => p.id === id)
            if (idx !== -1) {
                players.value[idx] = saved ?? { ...players.value[idx], isActive: false }
            }

            showToast({ type: 'success', message: 'Jugador desactivado' })
            return saved ?? players.value[idx]
        } catch (e) {
            error.value = e
            console.error('Error deactivating player:', e)
            showToast({ type: 'error', message: 'No se pudo desactivar el jugador' })
            throw e
        }
    }

    return {
        // state
        players,
        positions,
        loading,
        error,
        // reads
        fetchPlayers,
        fetchPlayerById,
        getPlayerById,
        getPlayerByUserId, // usa detalle con id en URL
        // writes
        createPlayer,
        updatePlayer,
        activatePlayer,
        deactivatePlayer,
    }
})
