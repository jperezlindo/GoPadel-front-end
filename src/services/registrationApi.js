// src/utils/registrationApi.js
// API client para Registrations (lado Player)
// Usa utils/handleApi.js (axios + normalización de errores)

import { handleApi } from '@/utils/handleApi'

const BASE = '/api/v1/registrations/'

/**
 * Crear inscripción
 * payload:
 *  {
 *    tournament_category_id: number,
 *    player_id: number,
 *    partner_id: number,
 *    paid_amount: number,
 *    payment_reference?: string,
 *    comment?: string
 *  }
 */
export const createRegistration = async (payload) => {
  console.log('createRegistration payload', payload)
  const res = await handleApi.post(BASE, payload)
  return res?.data ?? res
}

/**
 * Listar inscripciones con filtros (querystring)
 * params ej: { player_id, partner_id, tournament_id, tournament_category_id, status }
 */
export const listRegistrations = async (params = {}) => {
  const res = await handleApi.get(BASE, { params })
  return res?.data ?? res
}

/** Obtener una inscripción por id */
export const getRegistration = async (id) => {
  const res = await handleApi.get(`${BASE}${id}/`)
  return res?.data ?? res
}

export default {
  createRegistration,
  listRegistrations,
  getRegistration,
}
