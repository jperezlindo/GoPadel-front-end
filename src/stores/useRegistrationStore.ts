// src/stores/useRegistrationStore.ts
// Store Pinia para manejar inscripciones del Player.
// Reglas:
//  - UX: pre-chequeo para no permitir duplicado del player en el mismo torneo.
//  - Envío en orden canónico: player = min(player_id, partner_id); partner = max(...).
//  - paid_amount debe ser igual al price de la categoría (lo recibe como arg `categoryPrice`).

import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  createRegistration,
  listRegistrations,
  type RegistrationApi,
  type Paginated,
} from '@/services/registrationApi'
import { normalizeApiError } from '@/utils/handleApi'

// Helper para generar un error legible compatible con toasts
const userFacingError = (message: string, detail?: Record<string, string[]>) => {
  const err: any = new Error(message)
  // Marco el error como "normalizado" para que el caller lo trate igual que normalizeApiError
  err.__normalized = true
  err.status = 400
  err.message = message
  err.detail = detail || { detail: [message] }
  return err
}

export interface CreateForPlayerArgs {
  tournamentId: number
  tournamentCategoryId: number
  partnerId: number
  categoryPrice: number
  paymentReference?: string
  comment?: string
}

export const useRegistrationStore = defineStore('registration', () => {
  // ===== State =====
  const isLoading = ref(false)
  const items = ref<RegistrationApi[]>([]) // listado de inscripciones (ej: las del player)
  const lastError = ref<string | null>(null)

  // ===== Actions =====

  /** Listado genérico con filtros */
  const fetch = async (params: Record<string, any> = {}) => {
    try {
      isLoading.value = true
      lastError.value = null
      const data = await listRegistrations(params)
      // Soporta respuesta {results: []} o []
      items.value = Array.isArray(data) ? data : (data as Paginated<RegistrationApi>)?.results ?? []
      return items.value
    } catch (e) {
      const n = normalizeApiError(e)
      lastError.value = n.message
      throw n
    } finally {
      isLoading.value = false
    }
  }

  /** Listar inscripciones del player (opcionalmente filtradas por torneo) */
  const fetchMine = async (playerId: number, tournamentId?: number) => {
    const params: Record<string, any> = { player_id: playerId }
    if (tournamentId) params.tournament_id = tournamentId
    return fetch(params)
  }

  /**
   * Crear inscripción para el Player actual.
   * @param args Ver interface CreateForPlayerArgs
   */
  const createForPlayer = async ({
    tournamentId,
    tournamentCategoryId,
    partnerId,
    categoryPrice,
    paymentReference,
    comment,
  }: CreateForPlayerArgs) => {
    // === Obtener player_id actual ===
    // TODO (cuando esté login):
    // import { useAuthStore } from '@/stores/useAuthStore'
    // const auth = useAuthStore()
    // const currentPlayerId = auth.currentUser?.player?.id
    // if (!currentPlayerId) throw userFacingError('No se encontró el player logueado')
    const currentPlayerId: number = 2 // <- MODO PRUEBA (por ahora)

    // === Pre-check UX duplicado por torneo ===
    // Si el backend soporta ?player_id=&tournament_id=, esto evita doble inscripción.
    try {
      isLoading.value = true
      lastError.value = null

      const existing = await listRegistrations({
        player_id: currentPlayerId,
        tournament_id: tournamentId,
      })

      const already = Array.isArray(existing) ? existing : (existing as Paginated<RegistrationApi>)?.results ?? []
      if (already.length > 0) {
        throw userFacingError('Ya estás inscripto en este torneo.')
      }
    } catch (e: any) {
      // Si el pre-check falla por falta de filtro en el backend, no se bloquea.
      // Pero si fue el error explícito de duplicado, se re-lanza.
      if (e?.__normalized && typeof e.message === 'string' && e.message.includes('inscripto')) throw e
    } finally {
      isLoading.value = false
    }

    // === Orden canónico (player < partner) ===
    const a = Number(currentPlayerId)
    const b = Number(partnerId)
    const canonPlayer = Math.min(a, b)
    const canonPartner = Math.max(a, b)

    // Aunque en UI "el player logueado es el jugador",
    // el backend impone la restricción canónica. Por eso se ordena aquí.
    const payload = {
      tournament_category: Number(tournamentCategoryId),
      player: canonPlayer,
      partner: canonPartner,
      paid_amount: Number(categoryPrice),
      payment_reference: (paymentReference && String(paymentReference).trim()) || undefined,
      comment: (comment && String(comment).trim()) || undefined,
    }

    try {
      isLoading.value = true
      lastError.value = null
      const created = await createRegistration(payload)

      // Opcional: refrescar las inscripciones del player para ese torneo
      try {
        await fetchMine(currentPlayerId, tournamentId)
      } catch (_) { /* noop */ }

      return created
    } catch (e) {
      const n = normalizeApiError(e)
      lastError.value = n.message
      throw n
    } finally {
      isLoading.value = false
    }
  }

  return {
    // state
    isLoading,
    items,
    lastError,
    // actions
    fetch,
    fetchMine,
    createForPlayer,
  }
})
