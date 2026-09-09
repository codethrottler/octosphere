import { BrowserRouter } from 'react-router-dom'

import { AuthProvider } from '@/auth/AuthContext'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { AppRoutes } from '@/routes'
import { AppShell } from '@/shell/AppShell'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProtectedRoute>
          <AppShell>
            <AppRoutes />
          </AppShell>
        </ProtectedRoute>
      </AuthProvider>
    </BrowserRouter>
  )
}
