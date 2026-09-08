import { createContext, useContext, useMemo, type ReactNode } from 'react'

import { currentUserMock } from '@/app/session/currentUser.mock'
import type { CurrentUser, Role } from '@/app/session/types'

interface SessionValue {
  currentUser: CurrentUser
  hasRole: (...roles: Role[]) => boolean
}

const SessionContext = createContext<SessionValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const value = useMemo<SessionValue>(() => {
    const currentUser = currentUserMock
    return {
      currentUser,
      hasRole: (...roles) => roles.some((role) => currentUser.roles.includes(role)),
    }
  }, [])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return ctx
}
