import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import { fetchCurrentUser, requestTokenPair, type CurrentUser } from '@/auth/authApi'
import { AUTH_EVENTS, clearTokens, getAccessToken, setTokens } from '@/lib/api'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthValue {
  user: CurrentUser | null
  status: AuthStatus
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

/**
 * Owns the JWT session: loads /api/core/me/ on mount if a token is
 * already stored, exposes login()/logout(), and logs the user out
 * automatically on any 401 (see lib/api.ts's AUTH_EVENTS — this is the
 * only listener). Stateful, so this stays a context rather than the
 * plain lib/currentUser.ts export it replaces.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  // Lazy initializer, not an effect: "no token" is known synchronously from
  // localStorage, so only the "has a token, still need to verify it" case
  // needs the effect below.
  const [status, setStatus] = useState<AuthStatus>(() => (getAccessToken() ? 'loading' : 'unauthenticated'))

  async function loadCurrentUser() {
    try {
      setUser(await fetchCurrentUser())
      setStatus('authenticated')
    } catch {
      clearTokens()
      setUser(null)
      setStatus('unauthenticated')
    }
  }

  useEffect(() => {
    if (getAccessToken()) {
      loadCurrentUser()
    }
  }, [])

  useEffect(() => {
    function handleUnauthorized() {
      clearTokens()
      setUser(null)
      setStatus('unauthenticated')
    }
    AUTH_EVENTS.addEventListener('unauthorized', handleUnauthorized)
    return () => AUTH_EVENTS.removeEventListener('unauthorized', handleUnauthorized)
  }, [])

  async function login(username: string, password: string) {
    const tokens = await requestTokenPair(username, password)
    setTokens(tokens.access, tokens.refresh)
    await loadCurrentUser()
  }

  function logout() {
    clearTokens()
    setUser(null)
    setStatus('unauthenticated')
  }

  return <AuthContext.Provider value={{ user, status, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
