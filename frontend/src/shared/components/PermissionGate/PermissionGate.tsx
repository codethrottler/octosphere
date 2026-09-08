import type { ReactNode } from 'react'

import { ShieldAlert } from 'lucide-react'

interface PermissionGateProps {
  allow: boolean
  message?: string
  children: ReactNode
}

/**
 * Renders children only when `allow` is true; otherwise shows an inline
 * "you don't have access" panel instead of hiding the tab entirely. New
 * this session — Team/HR Overview are the first role-gated screens.
 */
export function PermissionGate({ allow, message = "You don't have access to this view.", children }: PermissionGateProps) {
  if (allow) return <>{children}</>

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-ink-200 bg-white px-6 py-12 text-center">
      <ShieldAlert className="h-6 w-6 text-ink-400" />
      <p className="text-sm font-medium text-ink-600">{message}</p>
      <p className="text-xs text-ink-400">Contact your administrator if you believe this is incorrect.</p>
    </div>
  )
}
