import type { ReactNode } from 'react'

import { IconRail } from '@/app/shell/IconRail'
import { TopBar } from '@/app/shell/TopBar'

interface AppShellProps {
  children: ReactNode
}

/** Top-level chrome: icon rail + top bar around a scrollable content area. Every route renders inside this. */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ink-50">
      <IconRail />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
