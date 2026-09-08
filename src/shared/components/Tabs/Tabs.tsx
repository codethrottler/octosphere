import type { ComponentType } from 'react'

import { clsx } from 'clsx'

export interface TabItem {
  id: string
  label: string
  icon?: ComponentType<{ className?: string }>
}

interface TabsProps {
  tabs: TabItem[]
  activeId: string
  onChange: (id: string) => void
}

/**
 * Horizontal tab strip. New this session — the shell had no tab primitive
 * and the Dashboard's 7 sub-pages need one, so this is a real gap rather
 * than a style preference.
 */
export function Tabs({ tabs, activeId, onChange }: TabsProps) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-ink-200">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'border-brand-500 text-brand-700'
                : 'border-transparent text-ink-500 hover:text-ink-800',
            )}
          >
            {Icon ? <Icon className="h-4 w-4" /> : null}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
