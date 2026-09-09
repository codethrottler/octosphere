import type { ReactNode } from 'react'

import { useAuth } from '@/auth/AuthContext'
import { LoginPage } from '@/auth/LoginPage'

/** Gates the whole app shell behind a session: loading -> blank, unauthenticated -> LoginPage, else render children. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth()

  if (status === 'loading') {
    return <div className="h-screen w-screen bg-ink-50" />
  }

  if (status === 'unauthenticated') {
    return <LoginPage />
  }

  return <>{children}</>
}
