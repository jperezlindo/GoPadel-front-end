// src/services/registrationApi.ts
// API client para Registrations (lado Player).
// Se usa utils/handleApi (axios + normalización de errores).
import { handleApi } from '@/utils/handleApi'

const BASE = '/api/v1/registrations/'

/**
 * Tipos mínimos para requests/responses.
 * Mantengo los nombres exactos que espera el backend (snake_case).
 */
export interface RegistrationCreatePayload {
  tournament_category: number
  player: number
  partner: number
  paid_amount: number
  payment_reference?: string
  comment?: string
}

export interface RegistrationApi {
  id?: number
  tournament_category: number
  player: number
  partner: number
  paid_amount: number
  payment_reference?: string
  comment?: string
  status?: string
  created_at?: string
  updated_at?: string
}

/** Tipado de respuesta paginada común en DRF */
export interface Paginated<T> {
  count?: number
  next?: string | null
  previous?: string | null
  results: T[]
}

/**
 * Crear inscripción
 * payload:
 * {
 *   tournament_category: number,
 *   player: number,
 *   partner: number,
 *   paid_amount: number,
 *   payment_reference?: string,
 *   comment?: string
 * }
 */
export const createRegistration = async (
  payload: RegistrationCreatePayload
): Promise<RegistrationApi> => {
  // Acá centralizo la llamada POST y devuelvo data tipada
  const res = await handleApi.post<RegistrationApi>(BASE, payload)
  return (res?.data ?? res) as RegistrationApi
}

/**
 * Listar inscripciones con filtros (querystring)
 * params ej: { player_id, partner_id, tournament_id, tournament_category_id, status }
 * Devuelvo exactamente lo que usabas: array o {results: []}
 */
export const listRegistrations = async (
  params: Record<string, any> = {}
): Promise<RegistrationApi[] | Paginated<RegistrationApi>> => {
  const res = await handleApi.get<RegistrationApi[] | Paginated<RegistrationApi>>(BASE, { params })
  return (res?.data ?? res) as RegistrationApi[] | Paginated<RegistrationApi>
}

/** Obtener una inscripción por id */
export const getRegistration = async (id: number | string): Promise<RegistrationApi> => {
  const res = await handleApi.get<RegistrationApi>(`${BASE}${id}/`)
  return (res?.data ?? res) as RegistrationApi
}

export default {
  createRegistration,
  listRegistrations,
  getRegistration,
}
