// src/services/userApi.ts
import { handleApi } from '@/utils/handleApi'

/** === Tipos del backend (API) === */
export interface UserApiItem {
  id?: number
  name?: string
  last_name?: string
  email?: string
  birth_day?: string | null
  avatar?: string | null

  facility?: number | null
  facility_id?: number | null
  city?: number | null
  city_id?: number | null
  rol?: number | null
  rol_id?: number | null

  is_active?: boolean
  isActive?: boolean
  is_deleted?: boolean
  is_staff?: boolean

  created_at?: string | null
  updated_at?: string | null
  password?: string
}

/** === Tipos del front (UI) === */
export interface UserFront {
  id: number
  name: string
  last_name: string
  email: string
  birth_day: string | null
  avatar: string

  facility_id: number | null
  city_id: number | null
  rol_id: number | null

  isActive: boolean
  is_active: boolean  // alias solo lectura
  is_deleted: boolean
  is_staff: boolean

  created_at: string | null
  updated_at: string | null
  // password no se guarda en front; solo se envía si viene
}

const BASE = '/api/v1/users/'

/** Helpers numéricos seguros */
const toIdOrNull = (v: unknown): number | null => {
  if (v === '' || v === undefined || v === null) return null
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

/** === Mappers === */

// API -> Front
export const fromApi = (api: UserApiItem = {} as UserApiItem): UserFront => {
  const isActive = Boolean(api.is_active ?? api.isActive ?? true)
  return {
    id: api.id ?? 0,
    name: api.name ?? '',
    last_name: api.last_name ?? '',
    email: api.email ?? '',
    birth_day: (api.birth_day ?? null) as string | null,
    avatar: api.avatar ?? '',

    facility_id: (api.facility_id ?? api.facility ?? null) as number | null,
    city_id: (api.city_id ?? api.city ?? null) as number | null,
    rol_id: (api.rol_id ?? api.rol ?? null) as number | null,

    isActive,
    is_active: isActive, // alias
    is_deleted: Boolean(api.is_deleted ?? false),
    is_staff: Boolean(api.is_staff ?? false),

    created_at: (api.created_at ?? null) as string | null,
    updated_at: (api.updated_at ?? null) as string | null,
  }
}

// Front -> API (FULL: create)
export const toApiFull = (front: Partial<UserFront> & { password?: string } = {}) => {
  const facilityId = toIdOrNull((front as any).facility_id ?? (front as any).facility?.id ?? (front as any).facility)
  const cityId = toIdOrNull((front as any).city_id ?? (front as any).city?.id ?? (front as any).city)
  const rolId = toIdOrNull((front as any).rol_id ?? (front as any).rol?.id ?? (front as any).rol)

  const birth = String(front.birth_day ?? '').trim()
  const birth_day = birth.length ? birth : null

  const hasIsActive =
    Object.prototype.hasOwnProperty.call(front, 'isActive') ||
    Object.prototype.hasOwnProperty.call(front, 'is_active')
  const isActive = hasIsActive ? (front as any).isActive ?? (front as any).is_active : true

  const payload: Record<string, unknown> = {
    name: String(front.name ?? '').trim(),
    last_name: String(front.last_name ?? '').trim(),
    email: String(front.email ?? '').trim(),
    birth_day,
    avatar: (String(front.avatar ?? '').trim() || null),

    facility: facilityId,
    city: cityId,
    rol: rolId,

    is_active: Boolean(isActive),
    is_deleted: Boolean((front as any).is_deleted ?? false),
    is_staff: Boolean((front as any).is_staff ?? false),
  }

  // password solo si viene definido y no vacío
  const pwd = String((front as any).password ?? '')
  if (pwd.length) payload.password = pwd

  return payload
}

// Front -> API (PARTIAL: patch) — solo envía lo definido
export const toApiPartial = (front: Partial<UserFront> & { password?: string } = {}) => {
  const out: Record<string, unknown> = {}

  if (Object.prototype.hasOwnProperty.call(front, 'name')) {
    out.name = String(front.name ?? '').trim()
  }
  if (Object.prototype.hasOwnProperty.call(front, 'last_name')) {
    out.last_name = String(front.last_name ?? '').trim()
  }
  if (Object.prototype.hasOwnProperty.call(front, 'email')) {
    out.email = String(front.email ?? '').trim()
  }
  if (Object.prototype.hasOwnProperty.call(front, 'birth_day')) {
    const birth = String(front.birth_day ?? '').trim()
    out.birth_day = birth.length ? birth : null
  }
  if (Object.prototype.hasOwnProperty.call(front, 'avatar')) {
    out.avatar = (String(front.avatar ?? '').trim() || null)
  }

  if (Object.prototype.hasOwnProperty.call(front, 'facility_id') || (front as any).facility) {
    out.facility = toIdOrNull((front as any).facility_id ?? (front as any).facility?.id ?? (front as any).facility)
  }
  if (Object.prototype.hasOwnProperty.call(front, 'city_id') || (front as any).city) {
    out.city = toIdOrNull((front as any).city_id ?? (front as any).city?.id ?? (front as any).city)
  }
  if (Object.prototype.hasOwnProperty.call(front, 'rol_id') || (front as any).rol) {
    out.rol = toIdOrNull((front as any).rol_id ?? (front as any).rol?.id ?? (front as any).rol)
  }

  if (
    Object.prototype.hasOwnProperty.call(front, 'isActive') ||
    Object.prototype.hasOwnProperty.call(front, 'is_active')
  ) {
    out.is_active = Boolean((front as any).isActive ?? (front as any).is_active)
  }
  if (Object.prototype.hasOwnProperty.call(front, 'is_deleted')) {
    out.is_deleted = Boolean((front as any).is_deleted)
  }
  if (Object.prototype.hasOwnProperty.call(front, 'is_staff')) {
    out.is_staff = Boolean((front as any).is_staff)
  }

  // password solo si viene definido y no vacío
  if (Object.prototype.hasOwnProperty.call(front, 'password')) {
    const pwd = String((front as any).password ?? '')
    if (pwd.length) out.password = pwd
  }

  return out
}

/** === Service HTTP === */

// === Perfil del usuario autenticado ===
// GET /api/v1/users/me  (requiere Authorization: Bearer <access>)
export const me = async (): Promise<UserFront> => {
  const res = await handleApi.get(`${BASE}me`)
  const data = (res as any)?.data ?? res
  // El backend puede envolver como { success, message, data } o devolver el objeto directo
  const payload = (data && typeof data === 'object' && 'data' in data) ? (data as any).data : data
  return fromApi(payload as UserApiItem)
}

// Listar
export const listUsers = async (params: Record<string, any> = {}): Promise<UserFront[]> => {
  const { data } = await handleApi.get<UserApiItem[] | { results: UserApiItem[] }>(BASE, { params })
  const list = Array.isArray(data) ? data : (data?.results ?? [])
  return list.map(fromApi)
}

// Detalle
export const getUser = async (id: number | string): Promise<UserFront> => {
  const uid = Number(id)
  const { data } = await handleApi.get<UserApiItem>(`${BASE}${uid}/`)
  return fromApi(data)
}

// Crear
export const createUserSvc = async (user: Partial<UserFront> & { password?: string }): Promise<UserFront> => {
  const payload = toApiFull(user)
  const { data } = await handleApi.post<UserApiItem>(BASE, payload)
  return fromApi(data)
}

// Patch genérico
export const patchUserSvc = async (
  id: number | string,
  partial: Partial<UserFront> & { password?: string }
): Promise<{ data?: UserFront; status: number }> => {
  const uid = Number(id)
  const payload = toApiPartial(partial ?? {})
  const { data, status } = await handleApi.patch<UserApiItem | undefined>(`${BASE}${uid}/`, payload)
  return { data: data ? fromApi(data) : undefined, status }
}

// Update (usa PATCH)
export const updateUserSvc = async (
  updated: Partial<UserFront> & { password?: string }
): Promise<{ data?: UserFront; status: number }> => {
  const uid = Number(updated?.id)
  if (!Number.isFinite(uid)) throw new Error('ID de usuario inválido')
  return patchUserSvc(uid, updated)
}

// Activar / Desactivar
export const setUserActive = async (
  id: number | string,
  isActive: boolean
): Promise<{ data?: UserFront; status: number }> => {
  const uid = Number(id)
  const { data, status } = await handleApi.patch<UserApiItem | undefined>(`${BASE}${uid}/`, { is_active: !!isActive })
  return { data: data ? fromApi(data) : undefined, status }
}

// === Cambio de contraseña ===
export type ChangePasswordPayload = {
  old_password?: string
  new_password: string
}

export const changePassword = async (
  userId: number,
  payload: ChangePasswordPayload
): Promise<{ message?: string }> => {
  const { data } = await handleApi.post(`/api/v1/users/${userId}/change-password/`, payload)
  // el backend suele envolver como { success, message, data: { message, user } }
  const body = (data?.data ?? data) as any
  return { message: body?.message || 'Password updated successfully' }
}