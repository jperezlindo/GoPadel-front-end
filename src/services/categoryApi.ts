// src/services/categoryApi.ts
import { handleApi } from '@/utils/handleApi'

/**
 * Yo tipifico el modelo mínimo para categorías sin cambiar el contrato del front.
 * Mantengo el mapeo API <-> Front centralizado acá.
 */

export interface CategoryApiItem {
  id?: number
  name?: string
  is_active?: boolean
  isActive?: boolean
}

export interface CategoryFront {
  id: number
  name: string
  // Yo mantengo ambos flags para compatibilidad con tu UI
  isActive: boolean
  is_active: boolean
}

const BASE = '/api/v1/categories/'

// ------------------ Mappers ------------------

// API -> Front
export const fromApi = (api: CategoryApiItem = {}): CategoryFront => {
  const isActive = Boolean(api.is_active ?? api.isActive ?? true)
  return {
    id: api.id ?? 0,
    name: api.name ?? '',
    isActive,
    is_active: isActive, // alias solo lectura
  }
}

// Front -> API (FULL: create)
export const toApiFull = (front: Partial<CategoryFront> = {}) => {
  const hasIsActive =
    Object.prototype.hasOwnProperty.call(front, 'isActive') ||
    Object.prototype.hasOwnProperty.call(front, 'is_active')
  const isActive = hasIsActive ? (front.isActive ?? front.is_active) : true

  return {
    name: (front.name ?? '').toString().trim(),
    is_active: Boolean(isActive),
  }
}

// Front -> API (PARTIAL: patch) — solo envía lo definido
export const toApiPartial = (front: Partial<CategoryFront> = {}) => {
  const out: Record<string, unknown> = {}
  if (Object.prototype.hasOwnProperty.call(front, 'name')) {
    out.name = (front.name ?? '').toString().trim()
  }
  if (
    Object.prototype.hasOwnProperty.call(front, 'isActive') ||
    Object.prototype.hasOwnProperty.call(front, 'is_active')
  ) {
    out.is_active = Boolean(front.isActive ?? front.is_active)
  }
  return out
}

// ------------------ Service (HTTP) ------------------

// Listar
export const listCategories = async (params: Record<string, any> = {}): Promise<CategoryFront[]> => {
  const { data } = await handleApi.get<CategoryApiItem[] | { results: CategoryApiItem[] }>(BASE, { params })
  const list = Array.isArray(data) ? data : (data?.results ?? [])
  return list.map(fromApi)
}

// Detalle
export const getCategory = async (id: number | string): Promise<CategoryFront> => {
  const cid = Number(id)
  const { data } = await handleApi.get<CategoryApiItem>(`${BASE}${cid}/`)
  return fromApi(data)
}

// Crear
export const createCategorySvc = async (category: Partial<CategoryFront>): Promise<CategoryFront> => {
  const payload = toApiFull(category)
  const { data } = await handleApi.post<CategoryApiItem>(BASE, payload)
  return fromApi(data)
}

// Patch genérico — devuelvo { data?, status } para que el store decida el fallback
export const patchCategorySvc = async (
  id: number | string,
  partial: Partial<CategoryFront>
): Promise<{ data?: CategoryFront; status: number }> => {
  const cid = Number(id)
  const payload = toApiPartial(partial ?? {})
  const { data, status } = await handleApi.patch<CategoryApiItem | undefined>(`${BASE}${cid}/`, payload)
  return { data: data ? fromApi(data) : undefined, status }
}

// Update (usa PATCH)
export const updateCategorySvc = async (updated: Partial<CategoryFront>): Promise<{ data?: CategoryFront; status: number }> => {
  const cid = Number(updated?.id)
  if (!Number.isFinite(cid)) throw new Error('ID de categoría inválido')
  return patchCategorySvc(cid, updated)
}

// Activar/Desactivar
export const setCategoryActive = async (
  id: number | string,
  isActive: boolean
): Promise<{ data?: CategoryFront; status: number }> => {
  const cid = Number(id)
  const { data, status } = await handleApi.patch<CategoryApiItem | undefined>(`${BASE}${cid}/`, { is_active: !!isActive })
  return { data: data ? fromApi(data) : undefined, status }
}
