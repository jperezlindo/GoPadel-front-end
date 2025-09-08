// src/stores/usePlayerStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { showToast } from '@/utils/alerts.js'
import { handleApi } from '@/utils/handleApi'

const BASE = '/api/v1/players/'

// ------------------ Mappers ------------------

// API -> Front (siempre expone isActive)
const fromApi = (api = {}) => {
  const posApi = (api.position ?? '').toString().toUpperCase()
  const position = posApi === 'DRIVE' ? 'Drive' : posApi === 'REVES' ? 'Revez' : ''
  const isActive = Boolean(api.is_active ?? api.isActive ?? true)

  return {
    id: api.id ?? 0,
    user_id: api.user ?? api.user_id ?? null,
    category_id: api.category ?? api.category_id ?? null,
    nickname: api.nick_name ?? '',
    position,
    level: api.level ?? null,
    points: api.points ?? null,
    isActive,
    // alias solo lectura para compatibilidad (no usar en UI nueva)
    is_active: isActive,
    created_at: api.created_at ?? null,
    updated_at: api.updated_at ?? null,
  }
}

// Front -> API (FULL: para create). Incluye todos los campos conocidos.
const toApiFull = (front = {}) => {
  const userId = Number(front.user_id ?? front.user?.id ?? front.user)
  const categoryId = Number(front.category_id ?? front.category?.id ?? front.category)
  const p = (front.position ?? '').toString().toLowerCase()
  const position = p === 'drive' ? 'DRIVE' : p === 'revez' ? 'REVES' : null
  const levelNum = front.level === '' || front.level === undefined ? null : Number(front.level)
  const pointsNum = front.points === '' || front.points === undefined ? null : Number(front.points)

  // Solo si el front lo trae explícito, lo usamos; si no, default true para altas
  const hasIsActive = Object.prototype.hasOwnProperty.call(front, 'isActive') ||
                      Object.prototype.hasOwnProperty.call(front, 'is_active')
  const isActive = hasIsActive
    ? (front.isActive ?? front.is_active)
    : true

  return {
    user: Number.isFinite(userId) && userId > 0 ? userId : null,
    category: Number.isFinite(categoryId) && categoryId > 0 ? categoryId : null,
    nick_name: (front.nickname ?? '').toString().trim(),
    position,
    level: Number.isFinite(levelNum) ? levelNum : null,
    points: Number.isFinite(pointsNum) ? pointsNum : null,
    is_active: Boolean(isActive),
  }
}

// Front -> API (PARTIAL: para patch). Solo envía lo que venga definido.
const toApiPartial = (front = {}) => {
  const out = {}

  if (Object.prototype.hasOwnProperty.call(front, 'user_id') || front.user) {
    const userId = Number(front.user_id ?? front.user?.id ?? front.user)
    out.user = Number.isFinite(userId) && userId > 0 ? userId : null
  }
  if (Object.prototype.hasOwnProperty.call(front, 'category_id') || front.category) {
    const categoryId = Number(front.category_id ?? front.category?.id ?? front.category)
    out.category = Number.isFinite(categoryId) && categoryId > 0 ? categoryId : null
  }
  if (Object.prototype.hasOwnProperty.call(front, 'nickname')) {
    out.nick_name = (front.nickname ?? '').toString().trim()
  }
  if (Object.prototype.hasOwnProperty.call(front, 'position')) {
    const p = (front.position ?? '').toString().toLowerCase()
    out.position = p === 'drive' ? 'DRIVE' : p === 'revez' ? 'REVES' : null
  }
  if (Object.prototype.hasOwnProperty.call(front, 'level')) {
    const levelNum = front.level === '' || front.level === undefined ? null : Number(front.level)
    out.level = Number.isFinite(levelNum) ? levelNum : null
  }
  if (Object.prototype.hasOwnProperty.call(front, 'points')) {
    const pointsNum = front.points === '' || front.points === undefined ? null : Number(front.points)
    out.points = Number.isFinite(pointsNum) ? pointsNum : null
  }
  if (Object.prototype.hasOwnProperty.call(front, 'isActive') ||
      Object.prototype.hasOwnProperty.call(front, 'is_active')) {
    out.is_active = Boolean(front.isActive ?? front.is_active)
  }

  return out
}

export const usePlayerStore = defineStore('player', () => {
  // ------------------ State ------------------
  const players = ref([])
  const positions = ref(['Drive', 'Revez', 'Ambos'])
  const loading = ref(false)
  const error = ref(null)

  // Filtros en store (para que la vista se mantenga simple)
  const searchTerm = ref('')
  const statusFilter = ref('all') // 'all' | 'active' | 'inactive'

  // ------------------ Reads ------------------
  const fetchPlayers = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const { data } = await handleApi.get(BASE, { params })
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

  // Helpers
  const getPlayerById = (id) => players.value.find(p => p.id === Number(id))
  const getPlayerByUserId = async (userId) => await fetchPlayerById(userId)

  // ------------------ Writes ------------------
  const createPlayer = async (player) => {
    error.value = null
    try {
      const payload = toApiFull(player)
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

  // PATCH genérico (parcial). Útil para vistas.
  const patchPlayer = async (id, partial) => {
    const playerId = Number(id)
    if (!Number.isFinite(playerId)) throw new Error('ID de jugador inválido')
    error.value = null
    try {
      const payload = toApiPartial(partial ?? {})
      const { data, status } = await handleApi.patch(`${BASE}${playerId}/`, payload)

      // Si el back devuelve 200 con objeto:
      if (data) {
        const saved = fromApi(data)
        const idx = players.value.findIndex(p => p.id === playerId)
        if (idx !== -1) players.value[idx] = saved
        else players.value.push(saved)
        return saved
      }

      // Si devuelve 204 sin body, actualizamos en memoria
      if (status === 204 || !data) {
        const idx = players.value.findIndex(p => p.id === playerId)
        if (idx !== -1) {
          players.value[idx] = fromApi({ ...players.value[idx], ...payload, id: playerId })
          return players.value[idx]
        }
      }

      return getPlayerById(playerId)
    } catch (e) {
      error.value = e
      console.error('Error patching player:', e)
      showToast({ type: 'error', message: 'No se pudo actualizar el jugador' })
      throw e
    }
  }

  // UPDATE de alto nivel (acepta objeto front y hace PATCH parcial)
  const updatePlayer = async (updatePlayer) => {
    const id = Number(updatePlayer?.id)
    if (!Number.isFinite(id)) throw new Error('ID de jugador inválido')
    return await patchPlayer(id, updatePlayer)
  }

  // Activar / Desactivar (PATCH is_active) con fallback a 204
  const activatePlayer = async (playerId) => {
    error.value = null
    try {
      const id = Number(playerId)
      if (!Number.isFinite(id)) throw new Error('ID de jugador inválido')

      const { data, status } = await handleApi.patch(`${BASE}${id}/`, { is_active: true })
      if (data) {
        const saved = fromApi(data)
        const idx = players.value.findIndex(p => p.id === id)
        if (idx !== -1) players.value[idx] = saved
        showToast({ type: 'success', message: 'Jugador activado' })
        return saved
      }
      if (status === 204 || !data) {
        const idx = players.value.findIndex(p => p.id === id)
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

  const deactivatePlayer = async (playerId) => {
    error.value = null
    try {
      const id = Number(playerId)
      if (!Number.isFinite(id)) throw new Error('ID de jugador inválido')

      const { data, status } = await handleApi.patch(`${BASE}${id}/`, { is_active: false })
      if (data) {
        const saved = fromApi(data)
        const idx = players.value.findIndex(p => p.id === id)
        if (idx !== -1) players.value[idx] = saved
        showToast({ type: 'success', message: 'Jugador desactivado' })
        return saved
      }
      if (status === 204 || !data) {
        const idx = players.value.findIndex(p => p.id === id)
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
  const toggleActive = async (playerId, nextState = undefined) => {
    const item = getPlayerById(playerId)
    const desired = (typeof nextState === 'boolean') ? nextState : !item?.isActive
    return desired ? activatePlayer(playerId) : deactivatePlayer(playerId)
  }

  // ------------------ Filtros (client-side) ------------------
  const setSearchTerm = (v) => { searchTerm.value = (v ?? '').toString() }
  const setStatusFilter = (v) => { statusFilter.value = v || 'all' }
  const clearFilters = () => { searchTerm.value = ''; statusFilter.value = 'all' }

  const activeCount = computed(() => players.value.filter(p => !!p.isActive).length)
  const inactiveCount = computed(() => players.value.filter(p => !p.isActive).length)

  const filteredPlayers = computed(() => {
    const term = (searchTerm.value ?? '').trim().toLowerCase()
    let base = players.value

    if (term) {
      base = base.filter(p => String(p.nickname ?? '').toLowerCase().includes(term))
    }
    if (statusFilter.value === 'active') return base.filter(p => !!p.isActive)
    if (statusFilter.value === 'inactive') return base.filter(p => !p.isActive)
    return base
  })

  return {
    // state
    players, positions, loading, error,
    searchTerm, statusFilter,

    // reads
    fetchPlayers, fetchPlayerById, getPlayerById, getPlayerByUserId,

    // writes
    createPlayer, patchPlayer, updatePlayer,
    activatePlayer, deactivatePlayer, toggleActive,

    // filtros helpers
    setSearchTerm, setStatusFilter, clearFilters,

    // derivados
    filteredPlayers, activeCount, inactiveCount,
  }
})
