interface ComingSoonPageProps {
  moduleLabel: string
  pageLabel: string
}

/** Stand-in for every sidebar destination not yet built. Shown for all pages except hrms/overview this session. */
export function ComingSoonPage({ moduleLabel, pageLabel }: ComingSoonPageProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-lg font-semibold text-ink-800">{pageLabel}</h1>
      <p className="text-sm text-ink-400">
        {moduleLabel} → {pageLabel} hasn't been built yet.
      </p>
    </div>
  )
}
