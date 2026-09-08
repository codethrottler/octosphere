interface ModulePlaceholderPageProps {
  title: string
}

/** Stand-in for modules not yet built this session, so the icon rail is fully navigable. */
export function ModulePlaceholderPage({ title }: ModulePlaceholderPageProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-lg font-semibold text-ink-800">{title}</h1>
      <p className="text-sm text-ink-400">This module hasn't been built yet.</p>
    </div>
  )
}
