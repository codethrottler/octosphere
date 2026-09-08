import { clsx } from 'clsx'

export interface CalendarHighlight {
  date: string // ISO date, e.g. "2026-09-11"
  label: string
  tone?: 'brand' | 'success' | 'warning' | 'danger'
}

interface MiniCalendarCardProps {
  title: string
  /** Anchors which month is displayed. Defaults to today. */
  referenceDate?: Date
  highlights: CalendarHighlight[]
}

const TONE_DOT_CLASSES: Record<NonNullable<CalendarHighlight['tone']>, string> = {
  brand: 'bg-brand-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function buildMonthGrid(reference: Date): (Date | null)[] {
  const year = reference.getFullYear()
  const month = reference.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leadingBlanks = firstOfMonth.getDay()

  const cells: (Date | null)[] = Array.from({ length: leadingBlanks }, () => null)
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day))
  }
  return cells
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Compact month grid with a few highlighted dates. Used wherever a module needs an at-a-glance calendar. */
export function MiniCalendarCard({ title, referenceDate, highlights }: MiniCalendarCardProps) {
  const today = referenceDate ?? new Date()
  const cells = buildMonthGrid(today)
  const highlightsByDate = new Map<string, CalendarHighlight>()
  for (const h of highlights) highlightsByDate.set(h.date, h)

  const todayIso = toIsoDate(new Date())
  const monthLabel = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-500">{title}</span>
        <span className="text-xs text-ink-400">{monthLabel}</span>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] text-ink-400">
        {WEEKDAY_LABELS.map((day, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={`${day}-${i}`}>{day}</span>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <span key={`blank-${i}`} />
          const iso = toIsoDate(cell)
          const highlight = highlightsByDate.get(iso)
          const isToday = iso === todayIso
          return (
            <div key={iso} className="flex flex-col items-center gap-0.5 py-0.5" title={highlight?.label}>
              <span
                className={clsx(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                  isToday ? 'bg-brand-500 font-semibold text-white' : 'text-ink-700',
                )}
              >
                {cell.getDate()}
              </span>
              <span className="h-1.5">
                {highlight ? (
                  <span className={clsx('block h-1.5 w-1.5 rounded-full', TONE_DOT_CLASSES[highlight.tone ?? 'brand'])} />
                ) : null}
              </span>
            </div>
          )
        })}
      </div>

      {highlights.length > 0 ? (
        <ul className="flex flex-col gap-1.5 border-t border-ink-100 pt-2">
          {highlights.slice(0, 4).map((h) => (
            <li key={`${h.date}-${h.label}`} className="flex items-center gap-2 text-xs">
              <span className={clsx('h-1.5 w-1.5 shrink-0 rounded-full', TONE_DOT_CLASSES[h.tone ?? 'brand'])} />
              <span className="text-ink-400">
                {new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="truncate text-ink-700">{h.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
