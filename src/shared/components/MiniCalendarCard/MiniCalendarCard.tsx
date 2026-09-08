import { clsx } from 'clsx'

export type CalendarEventType = 'task' | 'meeting' | 'leave' | 'deadline' | 'event'

export interface CalendarEvent {
  date: string // ISO date, e.g. "2026-09-11"
  type: CalendarEventType
  label: string
}

interface MiniCalendarCardProps {
  title: string
  /** Anchors which month is displayed. Defaults to today. */
  referenceDate?: Date
  events: CalendarEvent[]
}

const EVENT_DOT_CLASSES: Record<CalendarEventType, string> = {
  task: 'bg-brand-500',
  meeting: 'bg-info-500',
  leave: 'bg-warning-500',
  deadline: 'bg-danger-500',
  event: 'bg-success-500',
}

const EVENT_LABEL: Record<CalendarEventType, string> = {
  task: 'Task',
  meeting: 'Meeting',
  leave: 'Leave',
  deadline: 'Deadline',
  event: 'Event',
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

/** Compact month grid with event dots, plus a short upcoming list. Used for personal, team, and leave calendars. */
export function MiniCalendarCard({ title, referenceDate, events }: MiniCalendarCardProps) {
  const today = referenceDate ?? new Date()
  const cells = buildMonthGrid(today)
  const eventsByDate = new Map<string, CalendarEvent[]>()
  for (const event of events) {
    const list = eventsByDate.get(event.date) ?? []
    list.push(event)
    eventsByDate.set(event.date, list)
  }

  const todayIso = toIsoDate(new Date())
  const monthLabel = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const upcoming = [...events]
    .filter((event) => event.date >= todayIso)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)

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
          const dayEvents = eventsByDate.get(iso) ?? []
          const isToday = iso === todayIso
          return (
            <div key={iso} className="flex flex-col items-center gap-0.5 py-0.5">
              <span
                className={clsx(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                  isToday ? 'bg-brand-500 font-semibold text-white' : 'text-ink-700',
                )}
              >
                {cell.getDate()}
              </span>
              <span className="flex h-1.5 items-center gap-0.5">
                {dayEvents.slice(0, 3).map((event, idx) => (
                  <span
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${iso}-${idx}`}
                    className={clsx('h-1.5 w-1.5 rounded-full', EVENT_DOT_CLASSES[event.type])}
                  />
                ))}
              </span>
            </div>
          )
        })}
      </div>

      {upcoming.length > 0 ? (
        <ul className="flex flex-col gap-1.5 border-t border-ink-100 pt-2">
          {upcoming.map((event) => (
            <li key={`${event.date}-${event.label}`} className="flex items-center gap-2 text-xs">
              <span className={clsx('h-1.5 w-1.5 shrink-0 rounded-full', EVENT_DOT_CLASSES[event.type])} />
              <span className="text-ink-400">
                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="truncate text-ink-700">{event.label}</span>
              <span className="ml-auto shrink-0 text-ink-400">{EVENT_LABEL[event.type]}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
