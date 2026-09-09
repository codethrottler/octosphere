import type { ReactNode } from 'react'

import { clsx } from 'clsx'

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand'

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
  info: 'bg-info-50 text-info-700',
  neutral: 'bg-ink-100 text-ink-600',
  brand: 'bg-brand-50 text-brand-700',
}

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
}

/** Small status pill — new this session: attendance correction / leave approval status needed one, nothing here had it yet. */
export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', TONE_CLASSES[tone])}>{children}</span>
}
