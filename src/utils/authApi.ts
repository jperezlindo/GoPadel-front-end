// src/utils/authApi.ts
import { handleApi } from '@/utils/handleApi'

/** ===== Tipos ===== */
export type LoginCredentials = {
  email: string
  password: string
}

export type JwtPair = {
  access: string
  refresh: string
}

export type RegisterPayload = {
  name: string
  last_name: string
  email: string
  password: string
  birth_day?: string | null      // YYYY-MM-DD
  avatar?: string | null
  facility_id?: number | null
  city_id?: number | null
  // is_active es opcional; el rol lo fija el backend (PLAYER/EMPLOYEE)
  is_active?: boolean
}

export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export type UserDTO = {
  id: number
  name: string
  last_name: string
  email: string
  birth_day: string | null
  avatar: string | null
  is_active: boolean
  is_deleted: boolean
  is_staff: boolean
  created_at: string
  updated_at: string
  facility_id: number | null
  city_id: number | null
  rol_id: number | null
  // player?: { id: number; nickname?: string } // si lo necesitás, tipalo acá
}

/** ===== Auth API ===== */

/** Login (SimpleJWT) → Tokens */
export const login = async (credentials: LoginCredentials): Promise<JwtPair> => {
  const res = await handleApi.post('/api/v1/token/', credentials)
  // Algunos setups devuelven res.data, otros ya el data “plano”; cubro ambos:
  const data = (res as any)?.data ?? res
  return {
    access: data.access,
    refresh: data.refresh,
  }
}

/** Refresh de token (SimpleJWT) */
export const refresh = async (refreshToken: string): Promise<{ access: string }> => {
  const res = await handleApi.post('/api/v1/token/refresh/', { refresh: refreshToken })
  const data = (res as any)?.data ?? res
  return { access: data.access }
}

/** Registro PÚBLICO → crea usuario con rol PLAYER (rol_id=3) */
export const registerPlayer = async (payload: RegisterPayload): Promise<ApiEnvelope<UserDTO>> => {
  const res = await handleApi.post('/api/v1/auth/register', payload)
  return ((res as any)?.data ?? res) as ApiEnvelope<UserDTO>
}

/** Registro PROTEGIDO → crea usuario EMPLOYEE (rol_id=2)
 *  Requiere que handleApi ya incluya Authorization: Bearer <access>
 *  (normalmente vía interceptor con el token guardado).
 */
export const registerEmployee = async (payload: RegisterPayload): Promise<ApiEnvelope<UserDTO>> => {
  const res = await handleApi.post('/api/v1/auth/register-employee', payload)
  return ((res as any)?.data ?? res) as ApiEnvelope<UserDTO>
}
