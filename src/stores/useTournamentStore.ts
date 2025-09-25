// src/stores/useTournamentStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  listTournaments,
  getTournament,
  createTournamentSvc,
  updateTournamentSvc,
  setTournamentActive,
  deleteTournamentSvc,
  type TournamentFront,
} from '@/services/tournamentApi'
import { normalizeApiError } from '@/utils/handleApi'

type StoreError = { message: string; details?: unknown } | null

export const useTournamentStore = defineStore('tournament', () => {
  // ===== state =====
  const tournaments = ref<TournamentFront[]>([])
  const loading = ref<boolean>(false)
  const error = ref<StoreError>(null)

  // Mantengo este estado para formularios de alta/edición (equivalente al anterior)
  const newTournament = ref<Partial<TournamentFront>>({
    id: 0,
    name: '',
    date_start: null, // mejor null que cadena vacía
    date_end: null,
    facility_id: null,
    isActive: true,
    categories: [],
  })

  // ===== helpers =====
  const setErr = (e: unknown) => {
    const n = normalizeApiError(e)
    error.value = {
      message: n.message || 'Error inesperado',
      details: (n as any).data ?? (n as any).errors ?? undefined,
    }
  }

  const upsert = (t: TournamentFront) => {
    const idx = tournaments.value.findIndex(x => x.id === t.id)
    if (idx >= 0) tournaments.value.splice(idx, 1, t)
    else tournaments.value.push(t)
  }

  // ===== setters formulario =====
  const setTournament = (data: Partial<TournamentFront>) => {
    newTournament.value = { ...newTournament.value, ...data }
  }

  const resetTournament = () => {
    newTournament.value = {
      id: 0,
      name: '',
      date_start: null,
      date_end: null,
      facility_id: null,
      isActive: true,
      categories: [],
    }
  }

  // ===== actions =====
  const fetchTournaments = async (params: Record<string, any> = {}) => {
    try {
      loading.value = true
      error.value = null
      tournaments.value = await listTournaments(params)
    } catch (e) {
      setErr(e)
      tournaments.value = []
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchTournamentById = async (id: number | string) => {
    try {
      loading.value = true
      error.value = null
      const item = await getTournament(id)
      upsert(item)
      return item
    } catch (e) {
      setErr(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const createTournament = async (frontPayload: Partial<TournamentFront>) => {
    try {
      error.value = null
      const created = await createTournamentSvc(frontPayload)
      upsert(created)
      resetTournament()
      return created
    } catch (e) {
      setErr(e)
      throw e
    }
  }

  const updateTournament = async (id: number | string, frontPayload: Partial<TournamentFront>) => {
    try {
      error.value = null
      const saved = await updateTournamentSvc(id, frontPayload)
      upsert(saved)
      return saved
    } catch (e) {
      setErr(e)
      throw e
    }
  }

  const closeTournament = async (id: number | string) => {
    try {
      error.value = null
      const updated = await setTournamentActive(id, false)
      if ('name' in (updated as any)) upsert(updated as TournamentFront)
      else {
        const idx = tournaments.value.findIndex(t => t.id === Number((updated as any).id))
        if (idx >= 0) tournaments.value[idx] = { ...tournaments.value[idx], isActive: false }
      }
      return updated
    } catch (e) {
      setErr(e)
      throw e
    }
  }

  const openTournament = async (id: number | string) => {
    try {
      error.value = null
      const updated = await setTournamentActive(id, true)
      if ('name' in (updated as any)) upsert(updated as TournamentFront)
      else {
        const idx = tournaments.value.findIndex(t => t.id === Number((updated as any).id))
        if (idx >= 0) tournaments.value[idx] = { ...tournaments.value[idx], isActive: true }
      }
      return updated
    } catch (e) {
      setErr(e)
      throw e
    }
  }

  /** Fuerza el estado si nextState es boolean; si no, invierte el actual. */
  const toggleActive = async (id: number | string, nextState?: boolean) => {
    const current = tournaments.value.find(t => t.id === Number(id))
    const desired = typeof nextState === 'boolean' ? nextState : !current?.isActive
    return desired ? openTournament(id) : closeTournament(id)
  }

  const deleteTournament = async (id: number | string) => {
    try {
      error.value = null
      const removedId = await deleteTournamentSvc(id)
      const idx = tournaments.value.findIndex(t => t.id === Number(removedId))
      if (idx !== -1) {
        // Mantengo la UX original: marcar como inactivo en memoria
        tournaments.value[idx] = { ...tournaments.value[idx], isActive: false }
      }
      return removedId
    } catch (e) {
      setErr(e)
      throw e
    }
  }

  const getTournamentById = (id: number | string) =>
    tournaments.value.find(t => t.id === Number(id))

  return {
    // state
    newTournament,
    tournaments,
    loading,
    error,
    // setters
    setTournament,
    resetTournament,
    // actions
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
