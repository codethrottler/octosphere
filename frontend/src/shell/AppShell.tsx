import type { ReactNode } from 'react'

import { Header } from '@/shell/Header'
import { IconRail } from '@/shell/IconRail'
import { Sidebar } from '@/shell/Sidebar'

interface AppShellProps {
  children: ReactNode
}

/** Three-column shell + header, built once and reused by every module. */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ink-50">
      <IconRail />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
