import type { ComponentType } from 'react'

import { clsx } from 'clsx'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'

export type TrendDirection = 'up' | 'down' | 'flat'

/** "up" isn't always good (e.g. Overdue Tickets trending up is bad) — the caller says which color a direction maps to. */
export type TrendSentiment = 'positive' | 'negative' | 'neutral'

interface KpiCardProps {
  label: string
  value: string | number
  icon?: ComponentType<{ className?: string }>
  trend?: {
    direction: TrendDirection
    label: string
    sentiment?: TrendSentiment
  }
  footnote?: string
}

const TREND_ICON: Record<TrendDirection, ComponentType<{ className?: string }>> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
}

const SENTIMENT_CLASSES: Record<TrendSentiment, string> = {
  positive: 'text-success-700 bg-success-50',
  negative: 'text-danger-700 bg-danger-50',
  neutral: 'text-ink-600 bg-ink-100',
}

/** The base metric tile used across every Dashboard tab and (later) Reports. */
export function KpiCard({ label, value, icon: Icon, trend, footnote }: KpiCardProps) {
  const TrendIcon = trend ? TREND_ICON[trend.direction] : null

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-500">{label}</span>
        {Icon ? <Icon className="h-4 w-4 text-ink-400" /> : null}
      </div>
      <span className="text-2xl font-semibold tracking-tight text-ink-900">{value}</span>
      {trend ? (
        <span
          className={clsx(
            'inline-flex w-fit items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium',
            SENTIMENT_CLASSES[trend.sentiment ?? 'neutral'],
          )}
        >
          {TrendIcon ? <TrendIcon className="h-3 w-3" /> : null}
          {trend.label}
        </span>
      ) : footnote ? (
        <span className="text-xs text-ink-400">{footnote}</span>
      ) : null}
    </div>
  )
}
