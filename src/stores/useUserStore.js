// src/stores/useUserStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { handleApi } from '@/utils/handleApi' // axios preconfigurado

const BASE = '/api/v1/users/'

// ------------------ Mappers ------------------

// API -> Front
const fromApi = (api = {}) => {
  const isActive = Boolean(api.is_active ?? api.isActive ?? true)
  return {
    id: api.id ?? 0,
    name: api.name ?? '',
    last_name: api.last_name ?? '',
    email: api.email ?? '',
    birth_day: api.birth_day ?? null, // "YYYY-MM-DD" o null
    avatar: api.avatar ?? '',

    // relaciones (exponemos *_id)
    facility_id: api.facility_id ?? api.facility ?? null,
    city_id: api.city_id ?? api.city ?? null,
    rol_id: api.rol_id ?? api.rol ?? null,

    // flags
    isActive,
    is_active: isActive,          // alias solo lectura
    is_deleted: Boolean(api.is_deleted ?? false),
    is_staff: Boolean(api.is_staff ?? false),

    // timestamps
    created_at: api.created_at ?? null,
    updated_at: api.updated_at ?? null,
  }
}

// Front -> API (FULL: para create)
const toApiFull = (front = {}) => {
  const facilityId = Number(front.facility_id ?? front.facility?.id ?? front.facility)
  const cityId = Number(front.city_id ?? front.city?.id ?? front.city)
  const rolId = Number(front.rol_id ?? front.rol?.id ?? front.rol)

  const birth = (front.birth_day ?? '').toString().trim()
  const birth_day = birth.length ? birth : null

  const hasIsActive = Object.prototype.hasOwnProperty.call(front, 'isActive') ||
    Object.prototype.hasOwnProperty.call(front, 'is_active')
  const isActive = hasIsActive ? (front.isActive ?? front.is_active) : true

  const payload = {
    name: (front.name ?? '').toString().trim(),
    last_name: (front.last_name ?? '').toString().trim(),
    email: (front.email ?? '').toString().trim(),
    birth_day,
    avatar: ((front.avatar ?? '').toString().trim() || null),

    facility: Number.isFinite(facilityId) && facilityId > 0 ? facilityId : null,
    city: Number.isFinite(cityId) && cityId > 0 ? cityId : null,
    rol: Number.isFinite(rolId) && rolId > 0 ? rolId : null,

    is_active: Boolean(isActive),
    is_deleted: Boolean(front.is_deleted ?? false),
    is_staff: Boolean(front.is_staff ?? false),
  }

  // password solo si viene definido y no vacío
  const pwd = (front.password ?? '').toString()
  if (pwd.length) payload.password = pwd

  return payload
}

// Front -> API (PARTIAL: para patch) — solo envía lo definido
const toApiPartial = (front = {}) => {
  const out = {}

  if (Object.prototype.hasOwnProperty.call(front, 'name')) {
    out.name = (front.name ?? '').toString().trim()
  }
  if (Object.prototype.hasOwnProperty.call(front, 'last_name')) {
    out.last_name = (front.last_name ?? '').toString().trim()
  }
  if (Object.prototype.hasOwnProperty.call(front, 'email')) {
    out.email = (front.email ?? '').toString().trim()
  }
  if (Object.prototype.hasOwnProperty.call(front, 'birth_day')) {
    const birth = (front.birth_day ?? '').toString().trim()
    out.birth_day = birth.length ? birth : null
  }
  if (Object.prototype.hasOwnProperty.call(front, 'avatar')) {
    out.avatar = ((front.avatar ?? '').toString().trim() || null)
  }

  if (Object.prototype.hasOwnProperty.call(front, 'facility_id') || front.facility) {
    const id = Number(front.facility_id ?? front.facility?.id ?? front.facility)
    out.facility = Number.isFinite(id) && id > 0 ? id : null
  }
  if (Object.prototype.hasOwnProperty.call(front, 'city_id') || front.city) {
    const id = Number(front.city_id ?? front.city?.id ?? front.city)
    out.city = Number.isFinite(id) && id > 0 ? id : null
  }
  if (Object.prototype.hasOwnProperty.call(front, 'rol_id') || front.rol) {
    const id = Number(front.rol_id ?? front.rol?.id ?? front.rol)
    out.rol = Number.isFinite(id) && id > 0 ? id : null
  }

  if (Object.prototype.hasOwnProperty.call(front, 'isActive') ||
    Object.prototype.hasOwnProperty.call(front, 'is_active')) {
    out.is_active = Boolean(front.isActive ?? front.is_active)
  }
  if (Object.prototype.hasOwnProperty.call(front, 'is_deleted')) {
    out.is_deleted = Boolean(front.is_deleted)
  }
  if (Object.prototype.hasOwnProperty.call(front, 'is_staff')) {
    out.is_staff = Boolean(front.is_staff)
  }

  // password solo si viene definido y no vacío
  if (Object.prototype.hasOwnProperty.call(front, 'password')) {
    const pwd = (front.password ?? '').toString()
    if (pwd.length) out.password = pwd
  }

  return out
}

// ------------------ Store ------------------
export const useUserStore = defineStore('user', () => {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ==== READ: listar ====
  const fetchUsers = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const { data } = await handleApi.get(BASE, { params })
      const list = Array.isArray(data) ? data : (data?.results ?? [])
      users.value = list.map(fromApi)
    } catch (e) {
      error.value = e
      users.value = []
      console.error('Error fetching users:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // ==== READ: detalle ====
  const fetchUserById = async (id) => {
    const uid = Number(id)
    if (!Number.isFinite(uid)) return null
    loading.value = true
    error.value = null
    try {
      const { data } = await handleApi.get(`${BASE}${uid}/`)
      const item = fromApi(data)
      const idx = users.value.findIndex(u => u.id === item.id)
      if (idx === -1) users.value.push(item)
      else users.value[idx] = item
      return item
    } catch (e) {
      error.value = e
      console.error(`Error fetching user #${uid}:`, e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // ==== Helper ====
  const getUserById = (id) => users.value.find(u => u.id === Number(id))

  // ==== CREATE ====
  const createUser = async (user) => {
    error.value = null
    try {
      const payload = toApiFull(user)
      const { data } = await handleApi.post(BASE, payload)
      const created = fromApi(data)
      users.value.push(created)
      return created
    } catch (e) {
      error.value = e
      console.error('Error creating user:', e)
      throw e
    }
  }

  // ==== PATCH genérico ====
  const patchUser = async (id, partial) => {
    const uid = Number(id)
    if (!Number.isFinite(uid)) throw new Error('ID de usuario inválido')
    error.value = null
    try {
      const payload = toApiPartial(partial ?? {})
      const { data, status } = await handleApi.patch(`${BASE}${uid}/`, payload)

      if (data) {
        const saved = fromApi(data)
        const idx = users.value.findIndex(u => u.id === uid)
        if (idx !== -1) users.value[idx] = saved
        else users.value.push(saved)
        return saved
      }

      if (status === 204 || !data) {
        const idx = users.value.findIndex(u => u.id === uid)
        if (idx !== -1) {
          users.value[idx] = fromApi({ ...users.value[idx], ...payload, id: uid })
          return users.value[idx]
        }
      }

      return getUserById(uid)
    } catch (e) {
      error.value = e
      console.error('Error patching user:', e)
      throw e
    }
  }

  // ==== UPDATE (usa PATCH parcial) ====
  const updateUser = async (updatedUser) => {
    const uid = Number(updatedUser?.id)
    if (!Number.isFinite(uid)) throw new Error('ID de usuario inválido')
    return await patchUser(uid, updatedUser)
  }

  // ==== ACTIVATE / DEACTIVATE ====
  const deactivateUser = async (id) => {
    const uid = Number(id)
    if (!Number.isFinite(uid)) throw new Error('ID de usuario inválido')
    error.value = null
    try {
      const { data, status } = await handleApi.patch(`${BASE}${uid}/`, { is_active: false })
      if (data) {
        const saved = fromApi(data)
        const idx = users.value.findIndex(u => u.id === uid)
        if (idx !== -1) users.value[idx] = saved
        return saved
      }
      if (status === 204 || !data) {
        const idx = users.value.findIndex(u => u.id === uid)
        if (idx !== -1) users.value[idx] = { ...users.value[idx], isActive: false, is_active: false }
        return users.value[idx]
      }
      return getUserById(uid)
    } catch (e) {
      error.value = e
      console.error('Error deactivating user:', e)
      throw e
    }
  }

  const activateUser = async (id) => {
    const uid = Number(id)
    if (!Number.isFinite(uid)) throw new Error('ID de usuario inválido')
    error.value = null
    try {
      const { data, status } = await handleApi.patch(`${BASE}${uid}/`, { is_active: true })
      if (data) {
        const saved = fromApi(data)
        const idx = users.value.findIndex(u => u.id === uid)
        if (idx !== -1) users.value[idx] = saved
        return saved
      }
      if (status === 204 || !data) {
        const idx = users.value.findIndex(u => u.id === uid)
        if (idx !== -1) users.value[idx] = { ...users.value[idx], isActive: true, is_active: true }
        return users.value[idx]
      }
      return getUserById(uid)
    } catch (e) {
      error.value = e
      console.error('Error activating user:', e)
      throw e
    }
  }

  // Toggle
  const toggleActive = async (id, nextState = undefined) => {
    const item = getUserById(id)
    const desired = (typeof nextState === 'boolean') ? nextState : !item?.isActive
    return desired ? activateUser(id) : deactivateUser(id)
  }

  return {
    // state
    users, loading, error,

    // reads
    fetchUsers, fetchUserById, getUserById,

    // writes
    createUser, patchUser, updateUser,
    deactivateUser, activateUser, toggleActive,
  }
})
