// src/stores/useRegistrationStore.js
// Store Pinia para manejar inscripciones del Player.
// Reglas:
//  - UX: pre-chequeo para no permitir duplicado del player en el mismo torneo.
//  - Envío en orden canónico: player = min(player_id, partner_id); partner = max(...).
//  - paid_amount debe ser igual al price de la categoría (lo recibe como arg `categoryPrice`).

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createRegistration, listRegistrations } from '@/services/registrationApi'
import { normalizeApiError } from '@/utils/handleApi'

// Helper para generar un error legible compatible con toasts
const userFacingError = (message, detail) => {
  const err = new Error(message)
  err.__normalized = true
  err.status = 400
  err.message = message
  err.detail = detail || { detail: [message] }
  return err
}

export const useRegistrationStore = defineStore('registration', () => {
  // ===== State =====
  const isLoading = ref(false)
  const items = ref([])        // listado de inscripciones (ej: las del player)
  const lastError = ref(null)

  // ===== Actions =====

  /** Listado genérico con filtros */
  const fetch = async (params = {}) => {
    try {
      isLoading.value = true
      lastError.value = null
      const data = await listRegistrations(params)
      // Soporta respuesta {results: []} o []
      items.value = Array.isArray(data) ? data : (data?.results ?? [])
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
  const fetchMine = async (playerId, tournamentId) => {
    const params = { player_id: playerId }
    if (tournamentId) params.tournament_id = tournamentId
    return fetch(params)
  }

  /**
   * Crear inscripción para el Player actual.
   * @param {Object} args
   * @param {number} args.tournamentId           Torneo (para pre-check UX)
   * @param {number} args.tournamentCategoryId   Categoría elegida
   * @param {number} args.partnerId              Partner elegido
   * @param {number} args.categoryPrice          Price de la categoría (paid_amount)
   * @param {string} [args.paymentReference]     Referencia de pago (opcional)
   * @param {string} [args.comment]              Comentario (opcional)
   */
  const createForPlayer = async ({
    tournamentId,
    tournamentCategoryId,
    partnerId,
    categoryPrice,
    paymentReference,
    comment,
  }) => {
    // === Obtener player_id actual ===
    // TODO (cuando este login):
    // import { useAuthStore } from '@/stores/useAuthStore'
    // const auth = useAuthStore()
    // const currentPlayerId = auth.currentUser?.player?.id
    // if (!currentPlayerId) throw userFacingError('No se encontró el player logueado')
    const currentPlayerId = 2 // <- MODO PRUEBA (por ahora)

    // === Pre-check UX duplicado por torneo ===
    // Si el backend soporta ?player_id=&tournament_id=, esto evita doble inscripción.
    try {
      isLoading.value = true
      lastError.value = null

      const existing = await listRegistrations({
        player_id: currentPlayerId,
        tournament_id: tournamentId,
      })

      const already = Array.isArray(existing) ? existing : (existing?.results ?? [])
      if (already.length > 0) {
        throw userFacingError('Ya estás inscripto en este torneo.')
      }
    } catch (e) {
      // Si el pre-check falla por falta de filtro en el backend, no bloqueamos.
      // Pero si fue el error explícito de duplicado, re-lanzamos.
      if (e?.__normalized && e.message?.includes('inscripto')) throw e
    } finally {
      isLoading.value = false
    }

    // === Orden canónico (player < partner) ===
    const a = Number(currentPlayerId)
    const b = Number(partnerId)
    const canonPlayer = Math.min(a, b)
    const canonPartner = Math.max(a, b)

    // NOTA: aunque en UI "el player logueado es el jugador",
    // el backend impone la restricción canónica. Por eso ordenamos aquí.
    // Si preferís enviar player=currentPlayerId y partner=partnerId y que el back reordene, usa a/b.
    const payload = {
      tournament_category: Number(tournamentCategoryId),
      player: canonPlayer,
      partner: canonPartner,
      paid_amount: Number(categoryPrice),
      payment_reference: paymentReference && String(paymentReference).trim() || undefined,
      comment: comment && String(comment).trim() || undefined,
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
