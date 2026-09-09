import { clsx } from 'clsx'

export interface SubTabItem {
  id: string
  label: string
}

interface SubTabsProps {
  tabs: readonly SubTabItem[]
  activeId: string
  onChange: (id: string) => void
}

/**
 * Internal tab strip for a page that has multiple views but only one
 * sidebar entry — new this session. Employees (Directory/List/Org
 * Structure/Departments/Designations/Teams), Attendance (My/Team/
 * Calendar/Corrections), and Leave (Apply/Balance/Calendar/Approvals)
 * all need this: nav.config.ts gives each of those one sidebar item, not
 * six, so the sub-views switch inside the page instead. A real 3x reuse
 * case, not a one-off — see docs/ARCHITECTURE.md.
 */
export function SubTabs({ tabs, activeId, onChange }: SubTabsProps) {
  return (
    <div role="tablist" className="mb-4 flex gap-1 border-b border-ink-200">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'border-brand-500 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-800',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
