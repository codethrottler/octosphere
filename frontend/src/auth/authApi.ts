import { apiGet, apiPost } from '@/lib/api'

interface TokenPairResponse {
  access: string
  refresh: string
}

export function requestTokenPair(username: string, password: string): Promise<TokenPairResponse> {
  return apiPost<TokenPairResponse>('/api/auth/token/', { username, password })
}

export interface CurrentUser {
  id: number
  username: string
  email: string
  name: string
  initials: string
  employee_code: string | null
  title: string
  team_name: string | null
  employment_status: string
  is_staff: boolean
}

export function fetchCurrentUser(): Promise<CurrentUser> {
  return apiGet<CurrentUser>('/api/core/me/')
}
