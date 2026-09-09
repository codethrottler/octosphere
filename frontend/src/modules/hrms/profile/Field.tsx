import type { ReactNode } from 'react'

/** Label + control wrapper reused by every My Profile form tab. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink-700">{label}</span>
      {children}
    </label>
  )
}
