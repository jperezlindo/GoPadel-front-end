// src/services/authApi.ts
import { handleApi } from '@/utils/handleApi'
import { fromApi as mapUserFromApi, type UserFront } from '@/services/userApi'

/** Ajustá rutas según tu backend si difieren */
export const AUTH_LOGIN = '/api/v1/auth/login/'
export const AUTH_REFRESH = '/api/v1/auth/refresh/'
export const AUTH_ME = '/api/v1/auth/me/'
export const AUTH_LOGOUT = '/api/v1/auth/logout/'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResult {
  accessToken: string
  refreshToken?: string | null
  user?: UserFront | null
  raw: any
}

/** Helpers robustos para extraer datos de distintas respuestas */
const pick = (obj: any, keys: string[]): any => {
  for (const k of keys) {
    const v = obj?.[k]
    if (v !== undefined && v !== null) return v
  }
  return undefined
}

const extractAccessToken = (data: any): string | null => {
  return (
    pick(data, ['access', 'token', 'jwt', 'key']) ??
    pick(data?.data ?? {}, ['access', 'token', 'jwt', 'key']) ??
    null
  )
}

const extractRefreshToken = (data: any): string | null => {
  return (
    pick(data, ['refresh', 'refresh_token']) ??
    pick(data?.data ?? {}, ['refresh', 'refresh_token']) ??
    null
  )
}

const extractUser = (data: any): UserFront | null => {
  const raw =
    pick(data, ['user', 'profile', 'me']) ??
    pick(data?.data ?? {}, ['user', 'profile', 'me'])
  if (raw && typeof raw === 'object') return mapUserFromApi(raw)
  return null
}

/** ==== Calls ==== */
export const login = async (creds: LoginCredentials): Promise<AuthResult> => {
  const { data } = await handleApi.post<any>(AUTH_LOGIN, creds)
  const accessToken = extractAccessToken(data)
  if (!accessToken) throw new Error('Login: no se recibió access token')
  const refreshToken = extractRefreshToken(data)
  const user = extractUser(data)
  return { accessToken, refreshToken, user, raw: data }
}

export const refresh = async (refreshToken: string): Promise<string> => {
  const { data } = await handleApi.post<any>(AUTH_REFRESH, { refresh: refreshToken })
  const access = extractAccessToken(data)
  if (!access) throw new Error('Refresh: no se recibió access token')
  return access
}

export const me = async (): Promise<UserFront> => {
  const { data } = await handleApi.get<any>(AUTH_ME)
  // algunos back devuelven el usuario directo, otros envuelto
  return extractUser(data) ?? mapUserFromApi(data)
}

export const logout = async (): Promise<void> => {
  try {
    await handleApi.post(AUTH_LOGOUT, {})
  } catch {
    // si tu back no expone logout, ignoramos
  }
}
