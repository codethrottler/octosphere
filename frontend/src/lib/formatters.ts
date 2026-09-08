/** Shared display formatting so every module renders numbers/dates the same way. */

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US')
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return `${value.toFixed(fractionDigits)}%`
}

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const diffMin = Math.round((Date.now() - then) / 60_000)

  if (diffMin < 1) return 'just now'
  if (diffMin === 1) return '1 minute ago'
  if (diffMin < 60) return `${diffMin} minutes ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return diffHr === 1 ? '1 hour ago' : `${diffHr} hours ago`
  const diffDay = Math.round(diffHr / 24)
  if (diffDay < 7) return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
