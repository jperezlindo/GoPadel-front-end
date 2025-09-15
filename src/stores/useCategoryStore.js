// src/stores/useCategoryStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { handleApi } from '@/utils/handleApi' // axios preconfigurado

const BASE = '/api/v1/categories/'

// ------------------ Mappers ------------------

// API -> Front
const fromApi = (api = {}) => {
    const isActive = Boolean(api.is_active ?? api.isActive ?? true)
    return {
        id: api.id ?? 0,
        name: api.name ?? '',
        // flags
        isActive,
        is_active: isActive, // alias solo lectura
    }
}

// Front -> API (FULL: create)
const toApiFull = (front = {}) => {
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
const toApiPartial = (front = {}) => {
    const out = {}
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

// ------------------ Store ------------------
export const useCategoryStore = defineStore('category', () => {
    const categories = ref([])
    const loading = ref(false)
    const error = ref(null)

    // ==== READ: listar ====
    const fetchCategories = async (params = {}) => {
        loading.value = true
        error.value = null
        try {
            const { data } = await handleApi.get(BASE, { params })
            const list = Array.isArray(data) ? data : (data?.results ?? [])
            categories.value = list.map(fromApi)
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
    const fetchCategoryById = async (id) => {
        const cid = Number(id)
        if (!Number.isFinite(cid)) return null
        loading.value = true
        error.value = null
        try {
            const { data } = await handleApi.get(`${BASE}${cid}/`)
            const item = fromApi(data)
            const idx = categories.value.findIndex(c => c.id === item.id)
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
    const getCategoryById = (id) => categories.value.find(c => c.id === Number(id))

    // ==== CREATE ====
    const createCategory = async (category) => {
        error.value = null
        try {
            const payload = toApiFull(category)
            const { data } = await handleApi.post(BASE, payload)
            const created = fromApi(data)
            categories.value.push(created)
            return created
        } catch (e) {
            error.value = e
            console.error('Error creating category:', e)
            throw e
        }
    }

    // ==== PATCH genérico ====
    const patchCategory = async (id, partial) => {
        const cid = Number(id)
        if (!Number.isFinite(cid)) throw new Error('ID de categoría inválido')
        error.value = null
        try {
            const payload = toApiPartial(partial ?? {})
            const { data, status } = await handleApi.patch(`${BASE}${cid}/`, payload)

            if (data) {
                const saved = fromApi(data)
                const idx = categories.value.findIndex(c => c.id === cid)
                if (idx !== -1) categories.value[idx] = saved
                else categories.value.push(saved)
                return saved
            }

            if (status === 204 || !data) {
                const idx = categories.value.findIndex(c => c.id === cid)
                if (idx !== -1) {
                    categories.value[idx] = fromApi({ ...categories.value[idx], ...payload, id: cid })
                    return categories.value[idx]
                }
            }

            return getCategoryById(cid)
        } catch (e) {
            error.value = e
            console.error('Error patching category:', e)
            throw e
        }
    }

    // ==== UPDATE (usa PATCH parcial) ====
    const updateCategory = async (updatedCategory) => {
        const cid = Number(updatedCategory?.id)
        if (!Number.isFinite(cid)) throw new Error('ID de categoría inválido')
        return await patchCategory(cid, updatedCategory)
    }

    // ==== ACTIVATE / DEACTIVATE ====
    const deactivateCategory = async (id) => {
        const cid = Number(id)
        if (!Number.isFinite(cid)) throw new Error('ID de categoría inválido')
        error.value = null
        try {
            const { data, status } = await handleApi.patch(`${BASE}${cid}/`, { is_active: false })
            if (data) {
                const saved = fromApi(data)
                const idx = categories.value.findIndex(c => c.id === cid)
                if (idx !== -1) categories.value[idx] = saved
                return saved
            }
            if (status === 204 || !data) {
                const idx = categories.value.findIndex(c => c.id === cid)
                if (idx !== -1) categories.value[idx] = { ...categories.value[idx], isActive: false, is_active: false }
                return categories.value[idx]
            }
            return getCategoryById(cid)
        } catch (e) {
            error.value = e
            console.error('Error deactivating category:', e)
            throw e
        }
    }

    const activateCategory = async (id) => {
        const cid = Number(id)
        if (!Number.isFinite(cid)) throw new Error('ID de categoría inválido')
        error.value = null
        try {
            const { data, status } = await handleApi.patch(`${BASE}${cid}/`, { is_active: true })
            if (data) {
                const saved = fromApi(data)
                const idx = categories.value.findIndex(c => c.id === cid)
                if (idx !== -1) categories.value[idx] = saved
                return saved
            }
            if (status === 204 || !data) {
                const idx = categories.value.findIndex(c => c.id === cid)
                if (idx !== -1) categories.value[idx] = { ...categories.value[idx], isActive: true, is_active: true }
                return categories.value[idx]
            }
            return getCategoryById(cid)
        } catch (e) {
            error.value = e
            console.error('Error activating category:', e)
            throw e
        }
    }

    // Toggle
    const toggleActive = async (id, nextState = undefined) => {
        const item = getCategoryById(id)
        const desired = (typeof nextState === 'boolean') ? nextState : !item?.isActive
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
