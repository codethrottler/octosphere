interface PageHeaderFilter {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

interface PageHeaderProps {
  title: string
  filter?: PageHeaderFilter
}

/** Main-content pattern reused by every module's Overview page: title + a scope/filter dropdown top-right. */
export function PageHeader({ title, filter }: PageHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h1 className="text-lg font-semibold text-ink-900">{title}</h1>
      {filter ? (
        <select
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700 focus:border-brand-300 focus:outline-none"
        >
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  )
}
