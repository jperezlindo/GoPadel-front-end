// src/services/playerApi.ts
import { handleApi } from '@/utils/handleApi'

/** Tipos del backend (API) */
export interface PlayerApiItem {
  id?: number
  user?: number | null
  user_id?: number | null
  category?: number | null
  category_id?: number | null
  nick_name?: string
  position?: string | null
  level?: number | null
  points?: number | null
  is_active?: boolean
  isActive?: boolean
  created_at?: string | null
  updated_at?: string | null
}

/** Tipos del front (UI) */
export interface PlayerFront {
  id: number
  user_id: number | null
  category_id: number | null
  nickname: string
  position: 'Drive' | 'Revez' | '' // UI-friendly
  level: number | null
  points: number | null
  isActive: boolean
  is_active: boolean // alias solo lectura para compat
  created_at: string | null
  updated_at: string | null
}

const BASE = '/api/v1/players/'

/** ========= Helpers de coerción seguros (evitan TS2367) ========= */
const toNumOrNull = (v: unknown): number | null => {
  if (v === '' || v === undefined || v === null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const toIdOrNull = (v: unknown): number | null => {
  const n = toNumOrNull(v)
  return n !== null && n > 0 ? n : null
}

/** ------------------ Mappers ------------------ */

// API -> Front
export const fromApi = (api: PlayerApiItem = {}): PlayerFront => {
  const posApi = String(api.position ?? '').toUpperCase()
  const position: PlayerFront['position'] =
    posApi === 'DRIVE' ? 'Drive' : posApi === 'REVES' ? 'Revez' : ''
  const isActive = Boolean(api.is_active ?? api.isActive ?? true)

  return {
    id: api.id ?? 0,
    user_id: (api.user ?? api.user_id ?? null) as number | null,
    category_id: (api.category ?? api.category_id ?? null) as number | null,
    nickname: api.nick_name ?? '',
    position,
    level: (api.level ?? null) as number | null,
    points: (api.points ?? null) as number | null,
    isActive,
    is_active: isActive,
    created_at: (api.created_at ?? null) as string | null,
    updated_at: (api.updated_at ?? null) as string | null,
  }
}

// Front -> API (FULL: create)
export const toApiFull = (front: Partial<PlayerFront> = {}) => {
  const userId = toIdOrNull((front as any).user_id ?? (front as any).user?.id ?? (front as any).user)
  const categoryId = toIdOrNull(
    (front as any).category_id ?? (front as any).category?.id ?? (front as any).category
  )
  const p = String(front.position ?? '').toLowerCase()
  const position = p === 'drive' ? 'DRIVE' : p === 'revez' ? 'REVES' : null

  const levelNum = toNumOrNull((front as any).level)
  const pointsNum = toNumOrNull((front as any).points)

  const hasIsActive =
    Object.prototype.hasOwnProperty.call(front, 'isActive') ||
    Object.prototype.hasOwnProperty.call(front, 'is_active')
  const isActive = hasIsActive ? (front as any).isActive ?? (front as any).is_active : true

  return {
    user: userId,
    category: categoryId,
    nick_name: (front.nickname ?? '').toString().trim(),
    position, // 'DRIVE' | 'REVES' | null
    level: levelNum,
    points: pointsNum,
    is_active: Boolean(isActive),
  }
}

// Front -> API (PARTIAL: patch)
export const toApiPartial = (front: Partial<PlayerFront> = {}) => {
  const out: Record<string, unknown> = {}

  if (Object.prototype.hasOwnProperty.call(front, 'user_id') || (front as any).user) {
    out.user = toIdOrNull((front as any).user_id ?? (front as any).user?.id ?? (front as any).user)
  }
  if (Object.prototype.hasOwnProperty.call(front, 'category_id') || (front as any).category) {
    out.category = toIdOrNull(
      (front as any).category_id ?? (front as any).category?.id ?? (front as any).category
    )
  }
  if (Object.prototype.hasOwnProperty.call(front, 'nickname')) {
    out.nick_name = (front.nickname ?? '').toString().trim()
  }
  if (Object.prototype.hasOwnProperty.call(front, 'position')) {
    const p = String(front.position ?? '').toLowerCase()
    out.position = p === 'drive' ? 'DRIVE' : p === 'revez' ? 'REVES' : null
  }
  if (Object.prototype.hasOwnProperty.call(front, 'level')) {
    out.level = toNumOrNull((front as any).level)
  }
  if (Object.prototype.hasOwnProperty.call(front, 'points')) {
    out.points = toNumOrNull((front as any).points)
  }
  if (
    Object.prototype.hasOwnProperty.call(front, 'isActive') ||
    Object.prototype.hasOwnProperty.call(front, 'is_active')
  ) {
    out.is_active = Boolean((front as any).isActive ?? (front as any).is_active)
  }

  return out
}

/** ------------------ Service HTTP ------------------ */

export const listPlayers = async (
  params: Record<string, any> = {}
): Promise<PlayerFront[]> => {
  const { data } = await handleApi.get<PlayerApiItem[] | { results: PlayerApiItem[] }>(BASE, {
    params,
  })
  const list = Array.isArray(data) ? data : data?.results ?? []
  return list.map(fromApi)
}

export const getPlayer = async (id: number | string): Promise<PlayerFront> => {
  const playerId = Number(id)
  const { data } = await handleApi.get<PlayerApiItem>(`${BASE}${playerId}/`)
  return fromApi(data)
}

export const createPlayerSvc = async (
  player: Partial<PlayerFront>
): Promise<PlayerFront> => {
  const payload = toApiFull(player)
  const { data } = await handleApi.post<PlayerApiItem>(BASE, payload)
  return fromApi(data)
}

export const patchPlayerSvc = async (
  id: number | string,
  partial: Partial<PlayerFront>
): Promise<{ data?: PlayerFront; status: number }> => {
  const playerId = Number(id)
  const payload = toApiPartial(partial ?? {})
  const { data, status } = await handleApi.patch<PlayerApiItem | undefined>(
    `${BASE}${playerId}/`,
    payload
  )
  return { data: data ? fromApi(data) : undefined, status }
}

export const updatePlayerSvc = async (
  updated: Partial<PlayerFront>
): Promise<{ data?: PlayerFront; status: number }> => {
  const id = Number(updated?.id)
  if (!Number.isFinite(id)) throw new Error('ID de jugador inválido')
  return patchPlayerSvc(id, updated)
}

export const setPlayerActive = async (
  id: number | string,
  isActive: boolean
): Promise<{ data?: PlayerFront; status: number }> => {
  const playerId = Number(id)
  const { data, status } = await handleApi.patch<PlayerApiItem | undefined>(
    `${BASE}${playerId}/`,
    { is_active: !!isActive }
  )
  return { data: data ? fromApi(data) : undefined, status }
}
