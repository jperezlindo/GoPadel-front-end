// src/utils/handleApi.js
import axios from 'axios'
// import qs from 'qs' // <- opcional si querés serializar arrays/objetos en query

/** ===== Config base ===== */
const baseURL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000'
const DEFAULT_TIMEOUT_MS = 20000

/** ===== Estado token y callbacks ===== */
let accessToken = null
let onUnauthorizedHandler = null

export const setAuthToken = (token) => {
  accessToken = token
  try {
    if (token) localStorage.setItem('access_token', token)
    else localStorage.removeItem('access_token')
  } catch (_) {}
}

export const onUnauthorized = (fn) => {
  onUnauthorizedHandler = fn
}

/** Cargar token guardado (si existe) */
try {
  const saved = localStorage.getItem('access_token')
  if (saved) accessToken = saved
} catch (_) {}

/** ===== Parser de mensajes de error (DRF / Axios) ===== */
// Devuelve un string listo para mostrar (ej. en Swal)
export const parseApiError = (error, { joinWith = '\n', max = 5 } = {}) => {
  const status = error?.response?.status
  const data = error?.response?.data || error?.raw || error || {}

  const msgs = []

  // DRF típicos
  if (Array.isArray(data?.non_field_errors)) {
    msgs.push(...data.non_field_errors)
  }

  if (data?.detail) {
    if (typeof data.detail === 'string') {
      msgs.push(data.detail)
    } else if (Array.isArray(data?.detail?.__all__)) {
      msgs.push(...data.detail.__all__)
    }
  }

  // Mensaje genérico de algunas APIs
  if (typeof data?.message === 'string') {
    msgs.push(data.message)
  }

  // Aplanar errores por campo: { field: ["msg"], nested: { sub: ["..."] } }
  const addFieldErrors = (obj, prefix = '') => {
    if (!obj || typeof obj !== 'object') return
    Object.entries(obj).forEach(([key, val]) => {
      if (key === 'non_field_errors' || key === '__all__') return
      const label = prefix ? `${prefix}${key}` : key

      if (Array.isArray(val)) {
        val.forEach(item => {
          if (typeof item === 'string') {
            msgs.push(`${label}: ${item}`)
          } else if (item && typeof item === 'object') {
            addFieldErrors(item, `${label}.`)
          }
        })
      } else if (val && typeof val === 'object') {
        addFieldErrors(val, `${label}.`)
      } else if (typeof val === 'string') {
        msgs.push(`${label}: ${val}`)
      }
    })
  }

  // Algunas APIs devuelven field errors en top-level o bajo "errors"
  addFieldErrors(data?.errors ?? data)

  const uniqueMsgs = Array.from(new Set(msgs)).filter(Boolean)

  if (uniqueMsgs.length === 0) {
    return status ? `Error ${status}.` : 'Error de validación.'
  }
  return uniqueMsgs.slice(0, max).join(joinWith)
}

/** ===== Normalizador de errores ===== */
export const normalizeApiError = (err) => {
  // Si ya viene normalizado desde el interceptor, devuélvelo tal cual
  if (err && err.__normalized) return err

  const status = err?.response?.status ?? null
  const data = err?.response?.data
  const detail = data?.detail ?? data?.message ?? data?.error ?? data?.errors ?? data

  // Usamos el parser para extraer el mejor mensaje legible
  const message = parseApiError(err)

  const normalized = {
    __normalized: true,
    status,
    message,
    detail,
    errors: data?.errors,
    raw: data ?? err
  }
  return normalized
}

/** ===== Instancia de Axios ===== */
const instance = axios.create({
  baseURL,
  timeout: DEFAULT_TIMEOUT_MS,
  withCredentials: false, // ponelo true si vas a usar cookies/CSRF
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  // Si usas qs para serializar arrays:
  // paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' })
})

/** ===== Interceptor de Request ===== */
instance.interceptors.request.use(
  (config) => {
    // Header Authorization (solo si hay token y no está seteado manualmente)
    if (accessToken) {
      config.headers = config.headers || {}
      if (!('Authorization' in config.headers)) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
    }
    // Idioma (opcional):
    // config.headers['Accept-Language'] = 'es-AR'
    return config
  },
  (error) => Promise.reject(normalizeApiError(error))
)

/** ===== Interceptor de Response ===== */
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status

    // === REFRESH JWT (Preparado pero desactivado) ===
    // if (status === 401 && !originalRequest._retry && !isAuthEndpoint) { ... }

    if (status === 401 && onUnauthorizedHandler) {
      try { onUnauthorizedHandler() } catch (_) {}
    }

    return Promise.reject(normalizeApiError(error))
  }
)

/** ===== Helpers de métodos ===== */
export const handleApi = {
  get: (url, config) => instance.get(url, config),
  post: (url, data, config) => instance.post(url, data, config),
  put: (url, data, config) => instance.put(url, data, config),
  patch: (url, data, config) => instance.patch(url, data, config),
  delete: (url, config) => instance.delete(url, config),

  /** Subidas multipart/form-data */
  upload: (url, payload, config) => {
    const fd = new FormData()
    Object.entries(payload || {}).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (v instanceof Blob || v instanceof File) fd.append(k, v)
      else if (Array.isArray(v) || typeof v === 'object') fd.append(k, JSON.stringify(v))
      else fd.append(k, String(v))
    })
    return instance.post(url, fd, {
      ...(config || {}),
      headers: { ...(config?.headers || {}), 'Content-Type': 'multipart/form-data' }
    })
  }
}

/** Export default por compatibilidad (axios interceptado) */
export default instance
