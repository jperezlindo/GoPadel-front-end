// src/stores/useTournamentStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { handleApi } from '@/utils/handleApi' // usa el handleApi que armamos

// Base URL de la API para torneos
const BASE = '/api/v1/tournaments/'

// ---- Mappers: API <-> Front ----
const fromApi = (apiItem = {}) => ({
  id: apiItem.id ?? 0,
  name: apiItem.name ?? '',
  date_start: apiItem.date_start ?? '',
  date_end: apiItem.date_end ?? '',
  facility_id: apiItem.facility_id ?? 0,
  facility: apiItem.venue ?? apiItem.venue_name ?? apiItem.facility_name ?? '',
  isActive: Boolean(apiItem.is_active ?? apiItem.isActive ?? true),
  categories: Array.isArray(apiItem.categories) ? apiItem.categories.map((c) => ({
    id: c.id,
    name: c.name,
    price: c.price,
    is_active: Boolean(c.is_active ?? true),
    category_id: c.category_id ?? c.category ?? null,
  })) : [],
})

const toApi = (frontItem = {}) => {
  const facilityId = Number(frontItem?.facility_id ?? frontItem?.facility?.id ?? frontItem?.facility)

  return {
    name: String(frontItem.name ?? '').trim(),
    // el backend exige DateTime ISO (no date-only)
    date_start: frontItem.date_start ? frontItem.date_start : null,
    date_end: frontItem.date_end ? frontItem.date_end : null,
    is_active: Boolean(frontItem.is_active ?? frontItem.isActive),
    // si es obligatorio, NO mandar 0; validamos en componente
    facility_id: Number.isFinite(facilityId) && facilityId > 0 ? facilityId : null,
    categories: Array.isArray(frontItem.categories)
      ? frontItem.categories.map(c => ({
        // id opcional si tu API lo usa para upsert; si no, quitalo
        id: c?.id ?? undefined,
        name: c?.name ?? '',
        price: Number(c?.price ?? 0),
        // La API espera "category" como ID de la categoría
        category: Number(c?.category ?? c?.category_id ?? c?.id ?? 0)
      }))
        .filter(cat =>
          cat.name !== '' &&
          Number.isFinite(cat.price) &&
          Number.isFinite(cat.category) && cat.category > 0
        )
      : []
  }
}

export const useTournamentStore = defineStore('tournament', () => {
  const newTournament = ref({
    id: 0,
    name: '',
    date_start: '',
    date_end: '',
    facility_id: 0,
    isActive: 1,
  })

  const tournaments = ref([])      // ahora se llena desde la API
  const loading = ref(false)
  const error = ref(null)

  const setTournament = (data) => {
    newTournament.value = { ...data }
  }

  const resetTournament = () => {
    newTournament.value = {
      id: 0,
      name: '',
      date_start: '',
      date_end: '',
      facility_id: 0,
      isActive: 1,
    }
  }

  // ==== READ: listar todos ====
  const fetchTournaments = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const { data } = await handleApi.get(BASE, { params })
      // Soporta respuesta paginada { results: [...] } o lista directa
      const list = Array.isArray(data) ? data : (data?.results ?? [])
      tournaments.value = list.map(fromApi)
    } catch (e) {
      error.value = e
      console.error('Error fetching tournaments:', e)
      tournaments.value = []
    } finally {
      loading.value = false
    }
  }

  // ==== READ: obtener uno ====
  const fetchTournamentById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const { data } = await handleApi.get(`${BASE}${id}/`)
      const item = fromApi(data)
      // actualiza/inyecta en la lista local
      const idx = tournaments.value.findIndex(t => t.id === item.id)
      if (idx === -1) tournaments.value.push(item)
      else tournaments.value[idx] = item
      return item
    } catch (e) {
      error.value = e
      console.error(`Error fetching tournament #${id}:`, e)
      return null
    } finally {
      loading.value = false
    }
  }

  // ==== CREATE ====
  const createTournament = async (frontPayload) => {
    error.value = null
    try {
      if (!frontPayload || typeof frontPayload !== 'object') {
        throw new Error('Payload inválido para crear torneo')
      }
      const payload = toApi(frontPayload) // mapeo centralizado
      const { data } = await handleApi.post(BASE, payload)
      const created = fromApi(data)

      tournaments.value.push(created)
      resetTournament?.() // si existe
      return created // devolvemos el objeto creado (no sólo id)
    } catch (e) {
      error.value = e
      console.error('Error creating tournament:', e)
      throw e
    }
  }

  // ==== UPDATE ====
  const updateTournament = async (id, updatedTournament) => {
    error.value = null
    try {
      const tournamentId = Number(id)
      if (!Number.isFinite(tournamentId)) {
        throw new Error('Tournament id inválido')
      }

      const payload = toApi(updatedTournament)

      const { data } = await handleApi.patch(`${BASE}${tournamentId}/`, payload)
      const saved = fromApi(data)

      const index = tournaments.value.findIndex(t => t.id === tournamentId)
      if (index !== -1) tournaments.value[index] = saved
      else tournaments.value.push(saved)

      return saved
    } catch (e) {
      error.value = e
      console.error('Error updating tournament:', e)
      throw e
    }
  }

  // ==== CLOSE (soft-off): is_active = false ====
  const closeTournament = async (id) => {
    error.value = null
    try {
      const tournamentId = Number(id)
      if (!Number.isFinite(tournamentId)) {
        throw new Error('Tournament id inválido')
      }

      const response = await handleApi.patch(`${BASE}${tournamentId}/`, { is_active: false })
      const data = response?.data

      if (data) {
        // Si el backend devuelve el objeto actualizado
        const saved = fromApi(data)
        const idx = tournaments.value.findIndex(t => t.id === tournamentId)
        if (idx !== -1) tournaments.value[idx] = saved
        else tournaments.value.push(saved)
        return saved
      } else {
        // Fallback: si la API responde 204/empty, actualizamos localmente
        const idx = tournaments.value.findIndex(t => t.id === tournamentId)
        if (idx !== -1) {
          tournaments.value[idx] = {
            ...tournaments.value[idx],
            isActive: false
          }
          return tournaments.value[idx]
        }
        // Si no está en memoria, devolvemos un mínimo
        return { id: tournamentId, isActive: false }
      }
    } catch (e) {
      error.value = e
      console.error('No se pudo cerrar el torneo:', e)
      throw e
    }
  }

  // ==== OPEN (soft-on): is_active = true ====
  const openTournament = async (id) => {
    error.value = null
    try {
      const tournamentId = Number(id)
      if (!Number.isFinite(tournamentId)) {
        throw new Error('Tournament id inválido')
      }

      const response = await handleApi.patch(`${BASE}${tournamentId}/`, { is_active: true })
      const data = response?.data

      if (data) {
        const saved = fromApi(data)
        const idx = tournaments.value.findIndex(t => t.id === tournamentId)
        if (idx !== -1) tournaments.value[idx] = saved
        else tournaments.value.push(saved)
        return saved
      } else {
        const idx = tournaments.value.findIndex(t => t.id === tournamentId)
        if (idx !== -1) {
          tournaments.value[idx] = {
            ...tournaments.value[idx],
            isActive: true
          }
          return tournaments.value[idx]
        }
        return { id: tournamentId, isActive: true }
      }
    } catch (e) {
      error.value = e
      console.error('No se pudo abrir el torneo:', e)
      throw e
    }
  }

  // ==== TOGGLE (delegando en open/close) ====
  // Si nextState es booleano, lo fuerza; si no, invierte el estado actual.
  const toggleActive = async (id, nextState = undefined) => {
    const item = getTournamentById(id)
    const isActive = !!item?.isActive
    const desired = (typeof nextState === 'boolean') ? nextState : !isActive
    return desired ? openTournament(id) : closeTournament(id)
  }

  // ==== DELETE ====
  // Si tu API hace delete físico, esto lo refleja. Si preferís soft-delete,
  // en vez de DELETE podrías hacer PATCH con is_active=false.
  const deleteTournament = async (tournamentId) => {
    error.value = null
    try {
      await handleApi.delete(`${BASE}${tournamentId}/`)
      const idx = tournaments.value.findIndex(t => t.id === tournamentId)
      if (idx !== -1) {
        // mantenemos tu UX: marcar como inactivo en memoria
        tournaments.value[idx] = {
          ...tournaments.value[idx],
          isActive: false,
        }
      }
      return tournamentId
    } catch (e) {
      error.value = e
      console.error('Error deleting tournament:', e)
      throw e
    }
  }

  // ==== Utilidad original ====
  const getTournamentById = (id) => {
    return tournaments.value.find(t => t.id === Number(id))
  }

  return {
    // state
    newTournament,
    tournaments,
    loading,
    error,
    // setters
    setTournament,
    resetTournament,
    // crud
    fetchTournaments,
    fetchTournamentById,
    createTournament,
    updateTournament,
    closeTournament,
    openTournament,
    toggleActive,
    deleteTournament,
    // utils
    getTournamentById,
  }
})
