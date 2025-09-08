// src/utils/handleApi.js
import axios from 'axios'

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
  } catch (_) { }
}

export const onUnauthorized = (fn) => {
  onUnauthorizedHandler = fn
}

/** Cargar token guardado (si existe) */
try {
  const saved = localStorage.getItem('access_token')
  if (saved) accessToken = saved
} catch (_) { }

/** ===== Helpers internos para errores ===== */
const isDict = (v) => v && typeof v === 'object' && !Array.isArray(v)

const extractErrorData = (err) => {
  // Preferí el payload crudo del back
  return (
    err?.response?.data ??
    err?.detail ??
    err?.raw ??
    err?.errors ??
    null
  )
}

/**
 * Convierte cualquier payload en un dict de errores por campo.
 * - dict -> { campo: [..] } respetando arrays/strings
 * - list -> { non_field_errors: [...] }
 * - string -> { detail: ["..."] }
 * - null/otros -> {}
 */
const toFieldMap = (payload) => {
  const out = {}

  if (!payload) return out

  // Algunos backends colocan el diccionario real dentro de `detail` o `raw`
  const p = isDict(payload?.detail) ? payload.detail
    : isDict(payload?.raw) ? payload.raw
      : payload

  if (typeof p === 'string') {
    out.detail = [p]
    return out
  }
  if (Array.isArray(p)) {
    out.non_field_errors = p.map(String)
    return out
  }
  if (!isDict(p)) return out

  for (const key of Object.keys(p)) {
    const val = p[key]
    if (Array.isArray(val)) out[key] = val.map(String)
    else if (typeof val === 'string') out[key] = [val]
    else if (isDict(val)) {
      // aplanado simple: nested.field: "msg"
      // (si necesitás nesting profundo, se puede mejorar)
      for (const sub of Object.keys(val)) {
        const flatKey = `${key}.${sub}`
        const subVal = val[sub]
        if (Array.isArray(subVal)) out[flatKey] = subVal.map(String)
        else if (typeof subVal === 'string') out[flatKey] = [subVal]
      }
    }
  }
  return out
}

/** Toma el primer mensaje representativo para mostrar en toast */
const pickFirstMessage = (fieldMap, fallback) => {
  if (!fieldMap || typeof fieldMap !== 'object') return fallback
  // prioridad: non_field_errors, detail, luego cualquier campo
  if (Array.isArray(fieldMap.non_field_errors) && fieldMap.non_field_errors.length) {
    return fieldMap.non_field_errors[0]
  }
  if (Array.isArray(fieldMap.detail) && fieldMap.detail.length) {
    return fieldMap.detail[0]
  }
  for (const k of Object.keys(fieldMap)) {
    const v = fieldMap[k]
    if (Array.isArray(v) && v.length) return v[0]
  }
  return fallback
}

/** ===== Parser de mensajes (compatible con tu UI actual) ===== */
export const parseApiError = (error, { joinWith = '\n', max = 5 } = {}) => {
  const data = extractErrorData(error)
  const fieldMap = toFieldMap(data)

  // construir lista legible
  const msgs = []

  if (Array.isArray(fieldMap.non_field_errors)) msgs.push(...fieldMap.non_field_errors)
  if (Array.isArray(fieldMap.detail)) msgs.push(...fieldMap.detail)

  for (const [key, val] of Object.entries(fieldMap)) {
    if (key === 'non_field_errors' || key === 'detail') continue
    if (Array.isArray(val)) {
      val.forEach((m) => msgs.push(`${key}: ${m}`))
    }
  }

  const unique = Array.from(new Set(msgs)).filter(Boolean)
  if (!unique.length) {
    const status = error?.response?.status
    return status ? `Error ${status}.` : 'Error de validación.'
  }
  return unique.slice(0, max).join(joinWith)
}

/** ===== Normalizador de errores ===== */
export const normalizeApiError = (err) => {
  // Evitar doble normalización
  if (err && err.__normalized) return err

  const status = err?.response?.status ?? null
  const data = extractErrorData(err)
  const detail = toFieldMap(data)
  const message = pickFirstMessage(detail, parseApiError(err))

  return {
    __normalized: true,
    status,
    message,      // string legible para toasts
    detail,       // dict por campo (lo que necesita tu formulario)
    errors: undefined, // por compat
    raw: data ?? err,  // payload original por si lo querés inspeccionar
  }
}

/** ===== Instancia de Axios ===== */
const instance = axios.create({
  baseURL,
  timeout: DEFAULT_TIMEOUT_MS,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

/** ===== Interceptor de Request ===== */
instance.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers = config.headers || {}
      if (!('Authorization' in config.headers)) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
    }
    return config
  },
  (error) => Promise.reject(normalizeApiError(error))
)

/** ===== Interceptor de Response ===== */
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status
    if (status === 401 && onUnauthorizedHandler) {
      try { onUnauthorizedHandler() } catch (_) { }
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
      headers: { ...(config?.headers || {}), 'Content-Type': 'multipart/form-data' },
    })
  },
}

export default instance
