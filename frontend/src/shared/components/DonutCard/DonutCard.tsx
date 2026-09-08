import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

export interface DonutDatum {
  name: string
  value: number
  color: string
}

interface DonutCardProps {
  title: string
  data: DonutDatum[]
  /** Shown in the center of the ring, e.g. a total. Defaults to the sum of values. */
  centerLabel?: string
  centerValue?: string | number
}

/** Segmented donut chart with a center total and a color-keyed legend. Used for any "X by category" breakdown. */
export function DonutCard({ title, data, centerLabel = 'Total', centerValue }: DonutCardProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const displayValue = centerValue ?? total

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
      <span className="text-sm font-medium text-ink-500">{title}</span>
      <div className="flex items-center gap-4">
        <div className="relative h-36 w-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="70%"
                outerRadius="100%"
                paddingAngle={data.length > 1 ? 2 : 0}
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [Number(value).toLocaleString(), name]}
                contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: 'var(--color-ink-200)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold text-ink-900">{displayValue.toLocaleString()}</span>
            <span className="text-[11px] text-ink-400">{centerLabel}</span>
          </div>
        </div>
        <ul className="flex flex-1 flex-col gap-2">
          {data.map((entry) => (
            <li key={entry.name} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 text-ink-600">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </span>
              <span className="font-medium text-ink-900">{entry.value.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
