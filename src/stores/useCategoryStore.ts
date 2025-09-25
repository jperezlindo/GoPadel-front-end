// src/stores/useCategoryStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  listCategories,
  getCategory,
  createCategorySvc,
  patchCategorySvc,
  updateCategorySvc,
  setCategoryActive,
  fromApi,
  type CategoryFront,
} from '@/services/categoryApi'

/**
 * Yo mantengo el mismo contrato público del store original:
 * - state: categories, loading, error
 * - reads: fetchCategories, fetchCategoryById, getCategoryById
 * - writes: createCategory, patchCategory, updateCategory, deactivateCategory, activateCategory, toggleActive
 * Toda lógica HTTP está en services; acá solo orquesto estado y UX.
 */

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<CategoryFront[]>([])
  const loading = ref(false)
  const error = ref<unknown>(null)

  // ==== READ: listar ====
  const fetchCategories = async (params: Record<string, any> = {}) => {
    loading.value = true
    error.value = null
    try {
      categories.value = await listCategories(params)
    } catch (e) {
      error.value = e
      categories.value = []
      console.error('Error fetching categories:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // ==== READ: detalle ====
  const fetchCategoryById = async (id: number | string) => {
    const cid = Number(id)
    if (!Number.isFinite(cid)) return null
    loading.value = true
    error.value = null
    try {
      const item = await getCategory(cid)
      const idx = categories.value.findIndex((c) => c.id === item.id)
      if (idx === -1) categories.value.push(item)
      else categories.value[idx] = item
      return item
    } catch (e) {
      error.value = e
      console.error(`Error fetching category #${cid}:`, e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // ==== Helper ====
  const getCategoryById = (id: number | string) =>
    categories.value.find((c) => c.id === Number(id))

  // ==== CREATE ====
  const createCategory = async (category: Partial<CategoryFront>) => {
    error.value = null
    try {
      const created = await createCategorySvc(category)
      categories.value.push(created)
      return created
    } catch (e) {
      error.value = e
      console.error('Error creating category:', e)
      throw e
    }
  }

  // ==== PATCH genérico ====
  const patchCategory = async (id: number | string, partial: Partial<CategoryFront>) => {
    const cid = Number(id)
    if (!Number.isFinite(cid)) throw new Error('ID de categoría inválido')
    error.value = null
    try {
      const { data, status } = await patchCategorySvc(cid, partial ?? {})

      if (data) {
        const saved = data
        const idx = categories.value.findIndex((c) => c.id === cid)
        if (idx !== -1) categories.value[idx] = saved
        else categories.value.push(saved)
        return saved
      }

      // Fallback: si la API responde 204/empty, actualizo localmente
      if (status === 204 || !data) {
        const idx = categories.value.findIndex((c) => c.id === cid)
        if (idx !== -1) {
          categories.value[idx] = fromApi({ ...categories.value[idx], ...partial, id: cid })
          return categories.value[idx]
        }
      }

      return getCategoryById(cid) ?? null
    } catch (e) {
      error.value = e
      console.error('Error patching category:', e)
      throw e
    }
  }

  // ==== UPDATE (usa PATCH parcial) ====
  const updateCategory = async (updatedCategory: Partial<CategoryFront>) => {
    const cid = Number(updatedCategory?.id)
    if (!Number.isFinite(cid)) throw new Error('ID de categoría inválido')
    return patchCategory(cid, updatedCategory)
  }

  // ==== ACTIVATE / DEACTIVATE ====
  const deactivateCategory = async (id: number | string) => {
    const cid = Number(id)
    if (!Number.isFinite(cid)) throw new Error('ID de categoría inválido')
    error.value = null
    try {
      const { data, status } = await setCategoryActive(cid, false)
      if (data) {
        const saved = data
        const idx = categories.value.findIndex((c) => c.id === cid)
        if (idx !== -1) categories.value[idx] = saved
        return saved
      }
      if (status === 204 || !data) {
        const idx = categories.value.findIndex((c) => c.id === cid)
        if (idx !== -1) {
          categories.value[idx] = { ...categories.value[idx], isActive: false, is_active: false }
          return categories.value[idx]
        }
      }
      return getCategoryById(cid) ?? null
    } catch (e) {
      error.value = e
      console.error('Error deactivating category:', e)
      throw e
    }
  }

  const activateCategory = async (id: number | string) => {
    const cid = Number(id)
    if (!Number.isFinite(cid)) throw new Error('ID de categoría inválido')
    error.value = null
    try {
      const { data, status } = await setCategoryActive(cid, true)
      if (data) {
        const saved = data
        const idx = categories.value.findIndex((c) => c.id === cid)
        if (idx !== -1) categories.value[idx] = saved
        return saved
      }
      if (status === 204 || !data) {
        const idx = categories.value.findIndex((c) => c.id === cid)
        if (idx !== -1) {
          categories.value[idx] = { ...categories.value[idx], isActive: true, is_active: true }
          return categories.value[idx]
        }
      }
      return getCategoryById(cid) ?? null
    } catch (e) {
      error.value = e
      console.error('Error activating category:', e)
      throw e
    }
  }

  // Toggle
  const toggleActive = async (id: number | string, nextState: boolean | undefined = undefined) => {
    const item = getCategoryById(id)
    const desired = typeof nextState === 'boolean' ? nextState : !item?.isActive
    return desired ? activateCategory(id) : deactivateCategory(id)
  }

  return {
    // state
    categories, loading, error,
    // reads
    fetchCategories, fetchCategoryById, getCategoryById,
    // writes
    createCategory, patchCategory, updateCategory,
    deactivateCategory, activateCategory, toggleActive,
  }
})
