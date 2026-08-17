import { env } from '../config/env'
import { tokenStorage } from './token-storage'
import type { ApiErrorShape, AuthTokensDto } from './types'

export class ApiError extends Error {
  statusCode: number
  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
    this.name = 'ApiError'
  }
}

/** Registered by AuthProvider so the client can react to a hard session loss. */
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) return null
  if (!refreshPromise) {
    refreshPromise = fetch(`${env.apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return null
        const data = (await res.json()) as AuthTokensDto
        tokenStorage.setTokens(data.accessToken, data.refreshToken)
        return data.accessToken
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Skip attaching the bearer token / 401 retry (used by /auth/* calls). */
  skipAuth?: boolean
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { body, skipAuth, headers, ...rest } = opts
  const doFetch = async (): Promise<Response> => {
    const finalHeaders: Record<string, string> = {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(headers as Record<string, string> | undefined),
    }
    if (!skipAuth) {
      const token = tokenStorage.getAccessToken()
      if (token) finalHeaders.Authorization = `Bearer ${token}`
    }
    return fetch(`${env.apiUrl}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  let res: Response
  try {
    res = await doFetch()
  } catch {
    throw new ApiError(0, 'Network error — could not reach the server.')
  }

  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      res = await doFetch()
    } else {
      tokenStorage.clear()
      onUnauthorized?.()
      throw new ApiError(401, 'Session expired')
    }
  }

  if (res.status === 204) {
    return undefined as T
  }

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await res.json().catch(() => null) : null

  if (!res.ok) {
    const err = payload as ApiErrorShape | null
    const message = Array.isArray(err?.message) ? err.message.join(', ') : err?.message ?? res.statusText
    throw new ApiError(res.status, message || `Request failed with status ${res.status}`)
  }

  return payload as T
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'DELETE' }),
}
