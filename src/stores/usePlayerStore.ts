// src/stores/usePlayerStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { showToast } from '@/utils/alerts.js' // ok importar .js (allowJs=true)
import {
  listPlayers,
  getPlayer,
  createPlayerSvc,
  patchPlayerSvc,
  updatePlayerSvc,
  setPlayerActive,
  fromApi,
  type PlayerFront,
} from '@/services/playerApi'

type StatusFilter = 'all' | 'active' | 'inactive'

export const usePlayerStore = defineStore('player', () => {
  // ------------------ State ------------------
  const players = ref<PlayerFront[]>([])
  const positions = ref<string[]>(['Drive', 'Revez', 'Ambos'])
  const loading = ref(false)
  const error = ref<unknown>(null)

  // Filtros en store
  const searchTerm = ref<string>('')
  const statusFilter = ref<StatusFilter>('all')

  // ------------------ Reads ------------------
  const fetchPlayers = async (params: Record<string, any> = {}) => {
    loading.value = true
    error.value = null
    try {
      players.value = await listPlayers(params)
    } catch (e) {
      error.value = e
      players.value = []
      console.error('Error fetching players:', e)
      showToast({ type: 'error', message: 'No se pudieron cargar los jugadores' })
    } finally {
      loading.value = false
    }
  }

  const fetchPlayerById = async (id: number | string) => {
    const playerId = Number(id)
    if (!Number.isFinite(playerId)) return null
    loading.value = true
    error.value = null
    try {
      const item = await getPlayer(playerId)
      const idx = players.value.findIndex((p) => p.id === item.id)
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

  // Helpers
  const getPlayerById = (id: number | string) =>
    players.value.find((p) => p.id === Number(id))

  // Nota: tu implementación original usaba fetchPlayerById(userId).
  // Se mantiene para no romper, aunque idealmente sería un filtro por user_id.
  const getPlayerByUserId = async (userId: number | string) =>
    await fetchPlayerById(userId)

  // ------------------ Writes ------------------
  const createPlayer = async (player: Partial<PlayerFront>) => {
    error.value = null
    try {
      const created = await createPlayerSvc(player)
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

  // PATCH genérico (parcial)
  const patchPlayer = async (id: number | string, partial: Partial<PlayerFront>) => {
    const playerId = Number(id)
    if (!Number.isFinite(playerId)) throw new Error('ID de jugador inválido')
    error.value = null
    try {
      const { data, status } = await patchPlayerSvc(playerId, partial ?? {})

      if (data) {
        const saved = data
        const idx = players.value.findIndex((p) => p.id === playerId)
        if (idx !== -1) players.value[idx] = saved
        else players.value.push(saved)
        return saved
      }

      // Fallback 204/empty: actualizo en memoria
      if (status === 204 || !data) {
        const idx = players.value.findIndex((p) => p.id === playerId)
        if (idx !== -1) {
          players.value[idx] = fromApi({ ...players.value[idx], ...partial, id: playerId })
          return players.value[idx]
        }
      }

      return getPlayerById(playerId) ?? null
    } catch (e) {
      error.value = e
      console.error('Error patching player:', e)
      showToast({ type: 'error', message: 'No se pudo actualizar el jugador' })
      throw e
    }
  }

  // UPDATE (alto nivel) — usa PATCH parcial
  const updatePlayer = async (updatePlayerObj: Partial<PlayerFront>) => {
    const id = Number(updatePlayerObj?.id)
    if (!Number.isFinite(id)) throw new Error('ID de jugador inválido')
    return await patchPlayer(id, updatePlayerObj)
  }

  // Activar / Desactivar (PATCH is_active) con fallback a 204
  const activatePlayer = async (playerId: number | string) => {
    error.value = null
    try {
      const id = Number(playerId)
      if (!Number.isFinite(id)) throw new Error('ID de jugador inválido')

      const { data, status } = await setPlayerActive(id, true)
      if (data) {
        const saved = data
        const idx = players.value.findIndex((p) => p.id === id)
        if (idx !== -1) players.value[idx] = saved
        showToast({ type: 'success', message: 'Jugador activado' })
        return saved
      }
      if (status === 204 || !data) {
        const idx = players.value.findIndex((p) => p.id === id)
        if (idx !== -1) {
          players.value[idx] = { ...players.value[idx], isActive: true, is_active: true }
        }
        showToast({ type: 'success', message: 'Jugador activado' })
        return players.value[idx]
      }
    } catch (e) {
      error.value = e
      console.error('Error activating player:', e)
      showToast({ type: 'error', message: 'No se pudo activar el jugador' })
      throw e
    }
  }

  const deactivatePlayer = async (playerId: number | string) => {
    error.value = null
    try {
      const id = Number(playerId)
      if (!Number.isFinite(id)) throw new Error('ID de jugador inválido')

      const { data, status } = await setPlayerActive(id, false)
      if (data) {
        const saved = data
        const idx = players.value.findIndex((p) => p.id === id)
        if (idx !== -1) players.value[idx] = saved
        showToast({ type: 'success', message: 'Jugador desactivado' })
        return saved
      }
      if (status === 204 || !data) {
        const idx = players.value.findIndex((p) => p.id === id)
        if (idx !== -1) {
          players.value[idx] = { ...players.value[idx], isActive: false, is_active: false }
        }
        showToast({ type: 'success', message: 'Jugador desactivado' })
        return players.value[idx]
      }
    } catch (e) {
      error.value = e
      console.error('Error deactivating player:', e)
      showToast({ type: 'error', message: 'No se pudo desactivar el jugador' })
      throw e
    }
  }

  // Toggle (si no pasás nextState, invierte el actual)
  const toggleActive = async (playerId: number | string, nextState: boolean | undefined = undefined) => {
    const item = getPlayerById(playerId)
    const desired = typeof nextState === 'boolean' ? nextState : !item?.isActive
    return desired ? activatePlayer(playerId) : deactivatePlayer(playerId)
  }

  // ------------------ Filtros (client-side) ------------------
  const setSearchTerm = (v: unknown) => {
    searchTerm.value = (v ?? '').toString()
  }
  const setStatusFilter = (v: unknown) => {
    statusFilter.value = (v as StatusFilter) || 'all'
  }
  const clearFilters = () => {
    searchTerm.value = ''
    statusFilter.value = 'all'
  }

  const activeCount = computed(() => players.value.filter((p) => !!p.isActive).length)
  const inactiveCount = computed(() => players.value.filter((p) => !p.isActive).length)

  const filteredPlayers = computed(() => {
    const term = (searchTerm.value ?? '').trim().toLowerCase()
    let base = players.value

    if (term) {
      base = base.filter((p) => String(p.nickname ?? '').toLowerCase().includes(term))
    }
    if (statusFilter.value === 'active') return base.filter((p) => !!p.isActive)
    if (statusFilter.value === 'inactive') return base.filter((p) => !p.isActive)
    return base
  })

  return {
    // state
    players,
    positions,
    loading,
    error,
    searchTerm,
    statusFilter,

    // reads
    fetchPlayers,
    fetchPlayerById,
    getPlayerById,
    getPlayerByUserId,

    // writes
    createPlayer,
    patchPlayer,
    updatePlayer,
    activatePlayer,
    deactivatePlayer,
    toggleActive,

    // filtros helpers
    setSearchTerm,
    setStatusFilter,
    clearFilters,

    // derivados
    filteredPlayers,
    activeCount,
    inactiveCount,
  }
})
