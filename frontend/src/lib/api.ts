/**
 * Thin fetch wrapper around the Django backend. Every real API call goes
 * through `apiGet`/`apiPost`/`apiPatch`/`apiPut`/`apiDelete`/`apiUpload` —
 * components never call `fetch` directly — so swapping in auth headers,
 * error handling, or a base URL change happens in one place. See
 * docs/CONVENTIONS.md "How the frontend calls the API".
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

const ACCESS_TOKEN_KEY = 'octosphere.accessToken'
const REFRESH_TOKEN_KEY = 'octosphere.refreshToken'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, access)
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  /** Parsed JSON error body, when the response had one — DRF validation errors land here. */
  body: unknown

  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

/**
 * Fired on a 401 so app/auth/AuthContext can log the user out without
 * lib/api.ts importing React or the router. AuthContext is the only
 * listener; components never subscribe to this directly.
 */
export const AUTH_EVENTS = new EventTarget()

async function parseErrorBody(response: Response): Promise<unknown> {
  try {
    return await response.clone().json()
  } catch {
    return null
  }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = getAccessToken()
  const isFormData = init?.body instanceof FormData

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  })

  if (response.status === 401 && accessToken) {
    AUTH_EVENTS.dispatchEvent(new Event('unauthorized'))
  }

  if (!response.ok) {
    throw new ApiError(response.status, `${response.status} ${response.statusText}`, await parseErrorBody(response))
  }

  if (response.status === 204) {
    return undefined as T
  }
  return response.json() as Promise<T>
}

export function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: 'GET' })
}

export function apiPost<T>(path: string, data?: unknown): Promise<T> {
  return apiRequest<T>(path, { method: 'POST', body: data === undefined ? undefined : JSON.stringify(data) })
}

export function apiPatch<T>(path: string, data: unknown): Promise<T> {
  return apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(data) })
}

export function apiPut<T>(path: string, data: unknown): Promise<T> {
  return apiRequest<T>(path, { method: 'PUT', body: JSON.stringify(data) })
}

export function apiDelete<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: 'DELETE' })
}

/** multipart/form-data upload — omits the JSON Content-Type so the browser sets the multipart boundary itself. */
export function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  return apiRequest<T>(path, { method: 'POST', body: formData })
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded'
  django_version: string
  database: {
    engine: string
    name: string
    connected: boolean
    error: string | null
  }
}

export function getHealth(): Promise<HealthCheckResponse> {
  return apiGet<HealthCheckResponse>('/api/core/health/')
}

/** Server-side-paginated (limit/offset) list response shape — every AG-Grid-backed endpoint returns this. */
export interface PagedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
