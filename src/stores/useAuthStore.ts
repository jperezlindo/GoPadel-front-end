// src/stores/useAuthStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { setAuthToken, onUnauthorized, normalizeApiError } from '@/utils/handleApi'

// ✅ Usamos el authApi que acabamos de crear
import { login, refresh, type LoginCredentials } from '@/utils/authApi'

// ✅ “me” viene del módulo de usuarios (mantengo tu contrato existente)
import { me, type UserFront } from '@/services/userApi'

// ✅ Player asociado
import { listPlayers, type PlayerFront } from '@/services/playerApi'

/** Roles del backend */
const ROLE_ADMIN = 1
const ROLE_EMPLOYEE = 2
const ROLE_PLAYER = 3

/** LocalStorage keys (compat) */
const LS_USER = 'auth_user'
const LS_PLAYER = 'auth_player'
const LS_REFRESH = 'refresh_token'

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref<UserFront | null>(null)
  const player = ref<PlayerFront | null>(null)

  const accessToken = ref<string | null>(null)   // espejo del guardado por handleApi
  const refreshToken = ref<string | null>(null)

  const loading = ref(false)
  const error = ref<string | null>(null)

  // --- Persistencia
  const loadFromStorage = () => {
    try {
      const u = localStorage.getItem(LS_USER)
      user.value = u ? JSON.parse(u) : null
    } catch { user.value = null }

    try {
      const p = localStorage.getItem(LS_PLAYER)
      player.value = p ? JSON.parse(p) : null
    } catch { player.value = null }

    try {
      refreshToken.value = localStorage.getItem(LS_REFRESH)
    } catch { refreshToken.value = null }

    accessToken.value = localStorage.getItem('access_token') // lo setea handleApi
  }

  const persistUser = () => {
    try {
      if (user.value) localStorage.setItem(LS_USER, JSON.stringify(user.value))
      else localStorage.removeItem(LS_USER)
    } catch { /* noop */ }
  }
  const persistPlayer = () => {
    try {
      if (player.value) localStorage.setItem(LS_PLAYER, JSON.stringify(player.value))
      else localStorage.removeItem(LS_PLAYER)
    } catch { /* noop */ }
  }
  const persistRefresh = () => {
    try {
      if (refreshToken.value) localStorage.setItem(LS_REFRESH, refreshToken.value)
      else localStorage.removeItem(LS_REFRESH)
    } catch { /* noop */ }
  }

  // --- Setters
  const setUser = (u: UserFront | null) => { user.value = u; persistUser() }
  const setPlayer = (p: PlayerFront | null) => { player.value = p; persistPlayer() }

  // --- Helpers de sesión/roles
  const isLoggedIn = () => !!user.value
  const logged = computed(() => !!user.value)

  const isAdmin = () => user.value?.rol_id === ROLE_ADMIN
  const isEmployee = () => user.value?.rol_id === ROLE_EMPLOYEE
  const isPlayer = () => user.value?.rol_id === ROLE_PLAYER

  // --- Limpieza total
  const clearAuth = () => {
    user.value = null
    player.value = null
    accessToken.value = null
    refreshToken.value = null
    error.value = null

    try {
      localStorage.removeItem(LS_USER)
      localStorage.removeItem(LS_PLAYER)
      localStorage.removeItem(LS_REFRESH)
      localStorage.removeItem('access_token')
    } catch { /* noop */ }

    setAuthToken(null)
  }

  // --- Bootstrap (inicializar sesión si hay tokens guardados)
  const bootstrap = async () => {
    loadFromStorage()

  // Si el refresh falla en handleApi, caemos acá y limpiamos sesión.
  onUnauthorized(() => {
    clearAuth()
  })

    if (accessToken.value) {
      try {
        loading.value = true
        const m = await me()
        setUser(m)

        // Traigo player asociado por user_id (si existe)
        try {
          const res = await listPlayers({ user_id: m.id })
          setPlayer(Array.isArray(res) ? res[0] ?? null : null)
        } catch { /* opcional */ }

        return m
      } catch {
        clearAuth()
      } finally {
        loading.value = false
      }
    }
    return null
  }

  // --- Login
  const signIn = async (creds: LoginCredentials) => {
    try {
      loading.value = true
      error.value = null

      // SimpleJWT
      const tokens = await login(creds)
      accessToken.value = tokens.access
      refreshToken.value = tokens.refresh ?? null

      setAuthToken(tokens.access) // también persiste en localStorage
      persistRefresh()

      // Obtener /me
      const u = await me()
      setUser(u)

      // player asociado
      try {
        const pl = await listPlayers({ user_id: u.id })
        setPlayer(Array.isArray(pl) ? pl[0] ?? null : null)
      } catch { /* noop */ }

      return u
    } catch (e) {
      const n = normalizeApiError(e)
      error.value = n.message
      clearAuth()
      throw n
    } finally {
      loading.value = false
    }
  }

  // --- Logout (no es necesario endpoint: basta limpiar cliente)
  const signOut = async () => {
    clearAuth()
  }

  // API pública de compat
  const logout = () => { void signOut() }

  return {
    // state
    user, player, accessToken, refreshToken, loading, error, logged,

    // init
    bootstrap, loadFromStorage,

    // auth
    signIn, signOut, logout,

    // setters
    setUser, setPlayer,

    // roles
    isLoggedIn, isAdmin, isEmployee, isPlayer,
  }
})
