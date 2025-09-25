// src/stores/useUserStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  listUsers,
  getUser,
  createUserSvc,
  patchUserSvc,
  updateUserSvc,
  setUserActive,
  fromApi,
  type UserFront,
} from '@/services/userApi'

export const useUserStore = defineStore('user', () => {
  const users = ref<UserFront[]>([])
  const loading = ref(false)
  const error = ref<unknown>(null)

  // ==== READ: listar ====
  const fetchUsers = async (params: Record<string, any> = {}) => {
    loading.value = true
    error.value = null
    try {
      users.value = await listUsers(params)
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
  const fetchUserById = async (id: number | string) => {
    const uid = Number(id)
    if (!Number.isFinite(uid)) return null
    loading.value = true
    error.value = null
    try {
      const item = await getUser(uid)
      const idx = users.value.findIndex((u) => u.id === item.id)
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
  const getUserById = (id: number | string) =>
    users.value.find((u) => u.id === Number(id))

  // ==== CREATE ====
  const createUser = async (user: Partial<UserFront> & { password?: string }) => {
    error.value = null
    try {
      const created = await createUserSvc(user)
      users.value.push(created)
      return created
    } catch (e) {
      error.value = e
      console.error('Error creating user:', e)
      throw e
    }
  }

  // ==== PATCH genérico ====
  const patchUser = async (id: number | string, partial: Partial<UserFront> & { password?: string }) => {
    const uid = Number(id)
    if (!Number.isFinite(uid)) throw new Error('ID de usuario inválido')
    error.value = null
    try {
      const { data, status } = await patchUserSvc(uid, partial ?? {})

      if (data) {
        const saved = data
        const idx = users.value.findIndex((u) => u.id === uid)
        if (idx !== -1) users.value[idx] = saved
        else users.value.push(saved)
        return saved
      }

      if (status === 204 || !data) {
        const idx = users.value.findIndex((u) => u.id === uid)
        if (idx !== -1) {
          users.value[idx] = fromApi({ ...users.value[idx], ...(partial as any), id: uid })
          return users.value[idx]
        }
      }

      return getUserById(uid) ?? null
    } catch (e) {
      error.value = e
      console.error('Error patching user:', e)
      throw e
    }
  }

  // ==== UPDATE (usa PATCH parcial) ====
  const updateUser = async (updatedUser: Partial<UserFront> & { password?: string }) => {
    const uid = Number(updatedUser?.id)
    if (!Number.isFinite(uid)) throw new Error('ID de usuario inválido')
    return patchUser(uid, updatedUser)
  }

  // ==== ACTIVATE / DEACTIVATE ====
  const deactivateUser = async (id: number | string) => {
    const uid = Number(id)
    if (!Number.isFinite(uid)) throw new Error('ID de usuario inválido')
    error.value = null
    try {
      const { data, status } = await setUserActive(uid, false)
      if (data) {
        const saved = data
        const idx = users.value.findIndex((u) => u.id === uid)
        if (idx !== -1) users.value[idx] = saved
        return saved
      }
      if (status === 204 || !data) {
        const idx = users.value.findIndex((u) => u.id === uid)
        if (idx !== -1) {
          users.value[idx] = { ...users.value[idx], isActive: false, is_active: false }
          return users.value[idx]
        }
      }
      return getUserById(uid) ?? null
    } catch (e) {
      error.value = e
      console.error('Error deactivating user:', e)
      throw e
    }
  }

  const activateUser = async (id: number | string) => {
    const uid = Number(id)
    if (!Number.isFinite(uid)) throw new Error('ID de usuario inválido')
    error.value = null
    try {
      const { data, status } = await setUserActive(uid, true)
      if (data) {
        const saved = data
        const idx = users.value.findIndex((u) => u.id === uid)
        if (idx !== -1) users.value[idx] = saved
        return saved
      }
      if (status === 204 || !data) {
        const idx = users.value.findIndex((u) => u.id === uid)
        if (idx !== -1) {
          users.value[idx] = { ...users.value[idx], isActive: true, is_active: true }
          return users.value[idx]
        }
      }
      return getUserById(uid) ?? null
    } catch (e) {
      error.value = e
      console.error('Error activating user:', e)
      throw e
    }
  }

  // Toggle
  const toggleActive = async (id: number | string, nextState: boolean | undefined = undefined) => {
    const item = getUserById(id)
    const desired = typeof nextState === 'boolean' ? nextState : !item?.isActive
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
