// src/stores/useUserStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { showToast } from '@/utils/alerts.js'
import { handleApi } from '@/utils/handleApi' // axios preconfigurado

const BASE = '/api/v1/users/'

// ---- Mappers: API <-> Front ----
// API -> Front
const fromApi = (api = {}) => ({
  id: api.id ?? 0,
  name: api.name ?? '',
  last_name: api.last_name ?? '',
  email: api.email ?? '',
  birth_day: api.birth_day ?? null,        // "YYYY-MM-DD" o null
  avatar: api.avatar ?? '',

  // relaciones (exponemos *_id en el front para comodidad)
  facility_id: api.facility_id ?? api.facility ?? null,
  city_id: api.city_id ?? api.city ?? null,
  rol_id: api.rol_id ?? api.rol ?? null,

  // flags
  isActive: Boolean(api.is_active ?? api.isActive ?? true),
  is_deleted: Boolean(api.is_deleted ?? false),
  is_staff: Boolean(api.is_staff ?? false),

  // timestamps (opcional mostrarlos)
  created_at: api.created_at ?? null,
  updated_at: api.updated_at ?? null,
})

// Front -> API
// Convenciones (según tu backend/serializers):
// - Escritura: enviar FK como `facility`, `city`, `rol` (IDs o null)
// - `birth_day` como "YYYY-MM-DD" o null
const toApi = (front = {}) => {
  const facilityId = Number(front.facility_id ?? front.facility?.id ?? front.facility)
  const cityId = Number(front.city_id ?? front.city?.id ?? front.city)
  const rolId = Number(front.rol_id ?? front.rol?.id ?? front.rol)

  // birth_day pasa tal cual si viene como "YYYY-MM-DD"; si viene vacío => null
  const birth = (front.birth_day ?? '').toString().trim()
  const birth_day = birth.length ? birth : null

  return {
    name: (front.name ?? '').toString().trim(),
    last_name: (front.last_name ?? '').toString().trim(),
    email: (front.email ?? '').toString().trim(),
    birth_day,
    avatar: (front.avatar ?? '').toString().trim() || null,

    // FK como IDs (o null)
    facility: Number.isFinite(facilityId) && facilityId > 0 ? facilityId : null,
    city: Number.isFinite(cityId) && cityId > 0 ? cityId : null,
    rol: Number.isFinite(rolId) && rolId > 0 ? rolId : null,

    // flags que quieras permitir actualizar
    is_active: front.is_active !== undefined ? Boolean(front.is_active) : Boolean(front.isActive ?? true),
    is_deleted: Boolean(front.is_deleted ?? false),
    is_staff: Boolean(front.is_staff ?? false),
  }
}

export const useUserStore = defineStore('user', () => {
  // REF: el rol 1 es jugador, el rol 2 es usuario
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
      showToast({ type: 'error', message: 'No se pudieron cargar los usuarios' })
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
      showToast({ type: 'error', message: 'No se pudo obtener el usuario' })
      return null
    } finally {
      loading.value = false
    }
  }

  // ==== Helper local ====
  const getUserById = (id) => users.value.find(u => u.id === Number(id))

  // ==== CREATE ====
  const createUser = async (user) => {
    error.value = null
    try {
      const payload = toApi(user)
      const { data } = await handleApi.post(BASE, payload)
      const created = fromApi(data)
      users.value.push(created)
      showToast({ type: 'success', message: 'Usuario creado exitosamente' })
      return created
    } catch (e) {
      error.value = e
      console.error('Error creating user:', e)
      showToast({ type: 'error', message: 'No se pudo crear el usuario' })
      throw e
    }
  }

  // ==== UPDATE (PATCH) ====
  const updateUser = async (updatedUser) => {
    error.value = null
    try {
      const uid = Number(updatedUser?.id)
      if (!Number.isFinite(uid)) throw new Error('ID de usuario inválido')
      const payload = toApi(updatedUser)
      const { data } = await handleApi.patch(`${BASE}${uid}/`, payload)
      const saved = fromApi(data)

      const idx = users.value.findIndex(u => u.id === uid)
      if (idx !== -1) users.value[idx] = saved
      else users.value.push(saved)

      showToast({ type: 'success', message: 'Usuario actualizado correctamente' })
      return saved
    } catch (e) {
      error.value = e
      console.error('Error updating user:', e)
      showToast({ type: 'error', message: 'No se pudo actualizar el usuario' })
      throw e
    }
  }

  // ==== ACTIVATE / DEACTIVATE (PATCH is_active) ====
  const deactivateUser = async (id) => {
    error.value = null
    try {
      const uid = Number(id)
      if (!Number.isFinite(uid)) throw new Error('ID de usuario inválido')

      const { data } = await handleApi.patch(`${BASE}${uid}/`, { is_active: false })
      const saved = data ? fromApi(data) : null

      const idx = users.value.findIndex(u => u.id === uid)
      if (idx !== -1) {
        users.value[idx] = saved ?? { ...users.value[idx], isActive: false }
      }

      showToast({ type: 'success', message: 'Usuario desactivado' })
      return saved ?? users.value[idx]
    } catch (e) {
      error.value = e
      console.error('Error deactivating user:', e)
      showToast({ type: 'error', message: 'No se pudo desactivar el usuario' })
      throw e
    }
  }

  const activateUser = async (id) => {
    error.value = null
    try {
      const uid = Number(id)
      if (!Number.isFinite(uid)) throw new Error('ID de usuario inválido')

      const { data } = await handleApi.patch(`${BASE}${uid}/`, { is_active: true })
      const saved = data ? fromApi(data) : null

      const idx = users.value.findIndex(u => u.id === uid)
      if (idx !== -1) {
        users.value[idx] = saved ?? { ...users.value[idx], isActive: true }
      }

      showToast({ type: 'success', message: 'Usuario activado' })
      return saved ?? users.value[idx]
    } catch (e) {
      error.value = e
      console.error('Error activating user:', e)
      showToast({ type: 'error', message: 'No se pudo activar el usuario' })
      throw e
    }
  }

  return {
    // state
    users,
    loading,
    error,
    // reads
    fetchUsers,
    fetchUserById,
    getUserById,
    // writes
    createUser,
    updateUser,
    deactivateUser,
    activateUser,
  }
})
