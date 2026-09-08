/**
 * Thin fetch wrapper around the Django backend. Every real API call goes
 * through `apiGet`/`apiRequest` — components never call `fetch` directly —
 * so swapping in auth headers, error handling, or a base URL change
 * happens in one place. See docs/CONVENTIONS.md "How the frontend calls
 * the API".
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = localStorage.getItem('octosphere.accessToken')

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(response.status, `${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: 'GET' })
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
