import { clsx } from 'clsx'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'

export type TrendDirection = 'up' | 'down' | 'flat'
/** "up" isn't always good (e.g. Overdue Tickets trending up is bad) — the caller says which color a direction maps to. */
export type TrendSentiment = 'positive' | 'negative' | 'neutral'

interface KpiCardProps {
  label: string
  value: string | number
  /** A short recent-history series driving the sparkline, oldest first. */
  trendData: number[]
  deltaLabel?: string
  deltaDirection?: TrendDirection
  deltaSentiment?: TrendSentiment
}

const TREND_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus }

const SENTIMENT_TEXT_CLASSES: Record<TrendSentiment, string> = {
  positive: 'text-success-700',
  negative: 'text-danger-700',
  neutral: 'text-ink-500',
}

const SENTIMENT_STROKE: Record<TrendSentiment, string> = {
  positive: 'var(--color-success-500)',
  negative: 'var(--color-danger-500)',
  neutral: 'var(--color-ink-400)',
}

/** The base KPI tile every module's Overview grid is built from: label, big number, trend sparkline. */
export function KpiCard({ label, value, trendData, deltaLabel, deltaDirection, deltaSentiment = 'neutral' }: KpiCardProps) {
  const DeltaIcon = deltaDirection ? TREND_ICON[deltaDirection] : null
  const sparklineData = trendData.map((v, i) => ({ i, v }))
  const gradientId = `spark-${label.replace(/[^a-zA-Z0-9]+/g, '-')}`

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="text-sm font-medium text-ink-500">{label}</span>
        <span className="text-2xl font-semibold tracking-tight text-ink-900">{value}</span>
        {deltaLabel ? (
          <span className={clsx('inline-flex w-fit items-center gap-1 text-xs font-medium', SENTIMENT_TEXT_CLASSES[deltaSentiment])}>
            {DeltaIcon ? <DeltaIcon className="h-3 w-3" /> : null}
            {deltaLabel}
          </span>
        ) : null}
      </div>

      <div className="h-10 w-20 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SENTIMENT_STROKE[deltaSentiment]} stopOpacity={0.35} />
                <stop offset="100%" stopColor={SENTIMENT_STROKE[deltaSentiment]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={SENTIMENT_STROKE[deltaSentiment]}
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
