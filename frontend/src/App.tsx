import { BrowserRouter } from 'react-router-dom'

import { AppRoutes } from '@/routes'
import { AppShell } from '@/shell/AppShell'

export function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <AppRoutes />
      </AppShell>
    </BrowserRouter>
  )
}
