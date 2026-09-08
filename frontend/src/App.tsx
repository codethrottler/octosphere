import { BrowserRouter } from 'react-router-dom'

import { NotificationsProvider } from '@/app/notifications/NotificationsProvider'
import { AppRoutes } from '@/app/routes'
import { AppShell } from '@/app/shell/AppShell'
import { SessionProvider } from '@/app/session/SessionContext'

export function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <NotificationsProvider>
          <AppShell>
            <AppRoutes />
          </AppShell>
        </NotificationsProvider>
      </SessionProvider>
    </BrowserRouter>
  )
}
