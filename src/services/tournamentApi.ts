// src/services/tournamentApi.ts
import { handleApi } from '@/utils/handleApi'

/**
 * Tipos y mappers centralizados para el módulo de Torneos.
 */

export interface TournamentCategoryFront {
  id?: number
  name: string
  price: number
  is_active?: boolean
  category_id?: number | null
  category?: number | null
}

export interface TournamentFront {
  id: number
  name: string
  date_start: string | null
  date_end: string | null
  facility_id: number | null
  /** Nombre de la sede/facility (solo lectura para UI) */
  facility: string
  /** Alias explícito para que las vistas puedan usar facility_name si lo esperan */
  facility_name: string
  isActive: boolean
  categories: Array<{
    id?: number
    name: string
    price: number
    is_active?: boolean
    category_id?: number | null
    category?: number | null
  }>
}

export interface TournamentApiItem {
  id?: number
  name?: string
  date_start?: string | null
  date_end?: string | null
  facility_id?: number | null
  /** Campos de nombre que puede devolver tu API */
  venue?: string
  venue_name?: string
  facility_name?: string
  is_active?: boolean
  isActive?: boolean
  categories?: Array<{
    id?: number
    name?: string
    price?: number
    is_active?: boolean
    category_id?: number | null
    category?: number | null
  }>
}

const BASE = '/api/v1/tournaments/'

/** ---- Mappers: API -> Front ---- */
export const fromApi = (apiItem: TournamentApiItem = {}): TournamentFront => {
  const facilityName =
    apiItem.venue ??
    apiItem.venue_name ??
    apiItem.facility_name ??
    ''

  return {
    id: apiItem.id ?? 0,
    name: apiItem.name ?? '',
    date_start: apiItem.date_start ?? null,
    date_end: apiItem.date_end ?? null,

    // Mejor null que 0 cuando no hay relación
    facility_id:
      typeof apiItem.facility_id === 'number' && Number.isFinite(apiItem.facility_id)
        ? apiItem.facility_id
        : null,

    // Exponemos ambos para facilitar a la UI
    facility: facilityName,
    facility_name: facilityName,

    isActive: Boolean(apiItem.is_active ?? apiItem.isActive ?? true),

    categories: Array.isArray(apiItem.categories)
      ? apiItem.categories.map((c) => ({
          id: c?.id,
          name: c?.name ?? '',
          price: Number(c?.price ?? 0),
          is_active: Boolean(c?.is_active ?? true),
          category_id: c?.category_id ?? c?.category ?? null,
          category: c?.category ?? c?.category_id ?? null,
        }))
      : [],
  }
}

/** ---- Mappers: Front -> API ---- */
export const toApi = (frontItem: Partial<TournamentFront> = {}) => {
  const toNumber = (v: any): number | null => {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }

  const facilityId =
    Number((frontItem as any)?.facility_id ?? (frontItem as any)?.facility?.id ?? (frontItem as any)?.facility)

  return {
    name: String(frontItem.name ?? '').trim(),
    // Si enviás 'YYYY-MM-DD', DRF suele interpretarlo como 00:00:00; si quisieras horario explícito, convertí antes en la vista.
    date_start: frontItem.date_start ? frontItem.date_start : null,
    date_end: frontItem.date_end ? frontItem.date_end : null,
    is_active: Boolean((frontItem as any).is_active ?? frontItem.isActive),
    facility_id: Number.isFinite(facilityId) && facilityId > 0 ? facilityId : null,

    // categories inline: { name, price, is_active?, comment?, category? (ID) }
    categories: Array.isArray(frontItem.categories)
      ? frontItem.categories
          .map((c: any) => {
            const categoryId = toNumber(c?.category_id ?? c?.category) // solo ID numérico si existe
            const out: Record<string, any> = {
              name: String(c?.name ?? '').trim(),
              price: Number(c?.price ?? 0),
            }
            if (typeof c?.is_active === 'boolean') out.is_active = c.is_active
            if (typeof c?.comment === 'string') out.comment = c.comment
            if (categoryId !== null) out.category = categoryId // DRF espera 'category' (PK)
            // Nota: 'id' NO se manda en creación; en actualización sí, pero el endpoint de create no la usa.
            return out
          })
          // Permitimos categorías sin 'category' (porque 'name' es obligatorio y suficiente)
          .filter((cat) => cat.name !== '' && Number.isFinite(cat.price))
      : [],
  }
}

/** ==== Service methods (HTTP) ==== */

/** Listar torneos (acepta params de filtro/paginación) */
export const listTournaments = async (params: Record<string, any> = {}): Promise<TournamentFront[]> => {
  const { data } = await handleApi.get<TournamentApiItem[] | { results: TournamentApiItem[] }>(BASE, { params })
  const list = Array.isArray(data) ? data : data?.results ?? []
  return list.map(fromApi)
}

/** Obtener un torneo por id */
export const getTournament = async (id: number | string): Promise<TournamentFront> => {
  const { data } = await handleApi.get<TournamentApiItem>(`${BASE}${Number(id)}/`)
  return fromApi(data)
}

/** Crear torneo */
export const createTournamentSvc = async (frontPayload: Partial<TournamentFront>): Promise<TournamentFront> => {
  if (!frontPayload || typeof frontPayload !== 'object') {
    throw new Error('Payload inválido para crear torneo')
  }
  const payload = toApi(frontPayload)
  console.log('Creating tournament with payload:', payload)
  const { data } = await handleApi.post<TournamentApiItem>(BASE, payload)
  return fromApi(data)
}

/** Actualizar torneo (PATCH) */
export const updateTournamentSvc = async (
  id: number | string,
  frontPayload: Partial<TournamentFront>
): Promise<TournamentFront> => {
  const tournamentId = Number(id)
  if (!Number.isFinite(tournamentId)) {
    throw new Error('Tournament id inválido')
  }
  const payload = toApi(frontPayload)
  const { data } = await handleApi.patch<TournamentApiItem>(`${BASE}${tournamentId}/`, payload)
  return fromApi(data)
}

/** Activar/Desactivar (soft-on/off) */
export const setTournamentActive = async (
  id: number | string,
  isActive: boolean
): Promise<TournamentFront | { id: number; isActive: boolean }> => {
  const tournamentId = Number(id)
  if (!Number.isFinite(tournamentId)) {
    throw new Error('Tournament id inválido')
  }
  const { data } = await handleApi.patch<TournamentApiItem | undefined>(`${BASE}${tournamentId}/`, {
    is_active: !!isActive,
  })

  if (data) return fromApi(data)
  // Si la API devuelve 204 sin body, devolvemos un mínimo para que el store actualice memoria
  return { id: tournamentId, isActive: !!isActive }
}

/** Eliminar (o soft-delete si tu API lo maneja así detrás de escena) */
export const deleteTournamentSvc = async (id: number | string): Promise<number> => {
  const tournamentId = Number(id)
  if (!Number.isFinite(tournamentId)) {
    throw new Error('Tournament id inválido')
  }
  await handleApi.delete(`${BASE}${tournamentId}/`)
  return tournamentId
}
