// src/utils/handleApi.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'

type Dict<T = unknown> = Record<string, T>

type FieldErrors = {
  non_field_errors?: string[]
  detail?: string[]
  [key: string]: string[] | undefined
}

interface NormalizedApiError {
  __normalized: true
  status: number | null
  message: string
  detail: FieldErrors
  errors?: undefined
  raw: unknown
}

type UnknownError = unknown | AxiosError

/** ===== Config base ===== */
const baseURL: string = (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:8000'
const DEFAULT_TIMEOUT_MS = 20000

/** Endpoints auth */
const REFRESH_ENDPOINT = '/api/v1/token/refresh/'

/** ===== Estado token y callbacks ===== */
let accessToken: string | null = null
let onUnauthorizedHandler: (() => void) | null = null

export const setAuthToken = (token: string | null) => {
  accessToken = token
  try {
    if (token) localStorage.setItem('access_token', token)
    else localStorage.removeItem('access_token')
  } catch (_) { /* no-op */ }
}

export const onUnauthorized = (fn: () => void) => {
  onUnauthorizedHandler = fn
}

/** Cargar token guardado (si existe) */
try {
  const saved = localStorage.getItem('access_token')
  if (saved) accessToken = saved
} catch (_) { /* no-op */ }

/** ===== Helpers internos ===== */
const isDict = (v: unknown): v is Dict => !!v && typeof v === 'object' && !Array.isArray(v)

/** Yo hago un type guard para detectar si el error ya está normalizado */
const isNormalizedError = (e: unknown): e is NormalizedApiError =>
  isDict(e) && (e as any).__normalized === true

const extractErrorData = (err: UnknownError): any => {
  const e = err as any
  return (
    e?.response?.data ??
    e?.detail ??
    e?.raw ??
    e?.errors ??
    null
  )
}

/**
 * Yo convierto cualquier payload en un dict de errores por campo.
 * - dict -> { campo: [..] }
 * - list -> { non_field_errors: [...] }
 * - string -> { detail: ["..."] }
 * - null/otros -> {}
 */
const toFieldMap = (payload: any): FieldErrors => {
  const out: FieldErrors = {}
  if (!payload) return out

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
    const val = (p as Dict)[key]
    if (Array.isArray(val)) out[key] = val.map(String)
    else if (typeof val === 'string') out[key] = [val]
    else if (isDict(val)) {
      for (const sub of Object.keys(val)) {
        const flatKey = `${key}.${sub}`
        const subVal = (val as Dict)[sub]
        if (Array.isArray(subVal)) out[flatKey] = subVal.map(String)
        else if (typeof subVal === 'string') out[flatKey] = [subVal]
      }
    }
  }
  return out
}

/** Yo tomo el primer mensaje representativo para mostrar en toast */
const pickFirstMessage = (fieldMap: FieldErrors, fallback: string): string => {
  if (!fieldMap || typeof fieldMap !== 'object') return fallback
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
export const parseApiError = (
  error: UnknownError,
  { joinWith = '\n', max = 5 }: { joinWith?: string; max?: number } = {}
): string => {
  const data = extractErrorData(error)
  const fieldMap = toFieldMap(data)

  const msgs: string[] = []
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
    const status = (error as any)?.response?.status
    return status ? `Error ${status}.` : 'Error de validación.'
  }
  return unique.slice(0, max).join(joinWith)
}

/** ===== Normalizador de errores ===== */
export const normalizeApiError = (err: UnknownError): NormalizedApiError => {
  if (isNormalizedError(err)) return err
  const anyErr = err as any
  const status: number | null = anyErr?.response?.status ?? null
  const data = extractErrorData(anyErr)
  const detail = toFieldMap(data)
  const message = pickFirstMessage(detail, parseApiError(anyErr))
  return {
    __normalized: true,
    status,
    message,
    detail,
    errors: undefined,
    raw: data ?? err,
  }
}

/** ===== Instancia de Axios ===== */
const instance: AxiosInstance = axios.create({
  baseURL,
  timeout: DEFAULT_TIMEOUT_MS,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

/** ===== Refresh flow (con cola de reintentos) ===== */
const getRefreshToken = (): string | null => {
  try { return localStorage.getItem('refresh_token') } catch { return null }
}

let isRefreshing = false
let refreshWaiters: Array<(token: string | null) => void> = []

const subscribeTokenRefresh = (cb: (token: string | null) => void) => {
  refreshWaiters.push(cb)
}
const notifyRefreshed = (token: string | null) => {
  refreshWaiters.forEach(cb => { try { cb(token) } catch {} })
  refreshWaiters = []
}

const refreshAccessToken = async (): Promise<string | null> => {
  const refresh = getRefreshToken()
  if (!refresh) return null

  if (isRefreshing) {
    // espero a que termine el refresh en curso
    return new Promise(resolve => subscribeTokenRefresh(resolve))
  }

  isRefreshing = true
  try {
    // uso axios "crudo" para evitar interceptores y loops
    const resp = await axios.post(
      `${baseURL}${REFRESH_ENDPOINT}`,
      { refresh },
      { headers: { 'Content-Type': 'application/json' } }
    )
    const newAccess = (resp.data as any)?.access ?? null
    setAuthToken(newAccess)
    notifyRefreshed(newAccess)
    return newAccess
  } catch (e) {
    // refresh falló → limpio tokens y notifico logout
    setAuthToken(null)
    try { localStorage.removeItem('refresh_token') } catch {}
    notifyRefreshed(null)
    if (onUnauthorizedHandler) { try { onUnauthorizedHandler() } catch {} }
    return null
  } finally {
    isRefreshing = false
  }
}

/** ===== Interceptor de Request ===== */
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (accessToken) {
      const hasAuth =
        typeof (config.headers as any).get === 'function'
          ? (config.headers as any).get('Authorization')
          : (config.headers as any)['Authorization']
      if (!hasAuth) {
        if (typeof (config.headers as any).set === 'function') {
          (config.headers as any).set('Authorization', `Bearer ${accessToken}`)
        } else {
          (config.headers as any)['Authorization'] = `Bearer ${accessToken}`
        }
      }
    }
    return config
  },
  (error) => Promise.reject(normalizeApiError(error))
)

/** ===== Interceptor de Response (con retry tras refresh) ===== */
type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const status = error?.response?.status
    const original = error.config as RetryConfig | undefined

    // Si no es 401 o no tengo config, normalizo y listo
    if (status !== 401 || !original) {
      return Promise.reject(normalizeApiError(error))
    }

    // Evito intentar refrescar contra el propio endpoint de refresh
    if (original.url && original.url.includes(REFRESH_ENDPOINT)) {
      return Promise.reject(normalizeApiError(error))
    }

    // Evito loop de reintentos
    if (original._retry) {
      if (onUnauthorizedHandler) { try { onUnauthorizedHandler() } catch {} }
      return Promise.reject(normalizeApiError(error))
    }
    original._retry = true

    // Intento refrescar y reintentar UNA vez
    const newAccess = await refreshAccessToken()
    if (!newAccess) {
      return Promise.reject(normalizeApiError(error))
    }

    // Reintento con el nuevo token
    if (typeof (original.headers as any)?.set === 'function') {
      (original.headers as any).set('Authorization', `Bearer ${newAccess}`)
    } else {
      (original.headers as any) = {
        ...(original.headers as any),
        Authorization: `Bearer ${newAccess}`,
      }
    }
    try {
      return await instance(original)
    } catch (err) {
      return Promise.reject(normalizeApiError(err))
    }
  }
)

/** ===== Helpers HTTP ===== */
export const handleApi = {
  get:    <T = any>(url: string, config?: AxiosRequestConfig) => instance.get<T>(url, config),
  post:   <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => instance.post<T>(url, data, config),
  put:    <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => instance.put<T>(url, data, config),
  patch:  <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => instance.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => instance.delete<T>(url, config),

  upload: <T = any>(url: string, payload: Dict, config?: AxiosRequestConfig) => {
    const fd = new FormData()
    Object.entries(payload || {}).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (v instanceof Blob || v instanceof File) fd.append(k, v)
      else if (Array.isArray(v) || typeof v === 'object') fd.append(k, JSON.stringify(v))
      else fd.append(k, String(v))
    })
    return instance.post<T>(url, fd, {
      ...(config || {}),
      headers: { ...(config?.headers || {}), 'Content-Type': 'multipart/form-data' },
    })
  },
}

export default instance
