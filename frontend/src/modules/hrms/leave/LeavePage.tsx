import { useState } from 'react'

import { ApplyLeaveTab } from '@/modules/hrms/leave/ApplyLeaveTab'
import { ApprovalsTab } from '@/modules/hrms/leave/ApprovalsTab'
import { BalanceTab } from '@/modules/hrms/leave/BalanceTab'
import { LeaveCalendarTab } from '@/modules/hrms/leave/LeaveCalendarTab'
import { PageHeader } from '@/shell/PageHeader'
import { SubTabs } from '@/widgets/SubTabs'

const TABS = [
  { id: 'apply', label: 'Apply Leave' },
  { id: 'balance', label: 'Leave Balance' },
  { id: 'calendar', label: 'Leave Calendar' },
  { id: 'approvals', label: 'Approvals' },
] as const

type TabId = (typeof TABS)[number]['id']

export function LeavePage() {
  const [tab, setTab] = useState<TabId>('apply')

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Leave" />
      <SubTabs tabs={TABS} activeId={tab} onChange={(id) => setTab(id as TabId)} />
      <div className="min-h-0 flex-1">
        {tab === 'apply' && <ApplyLeaveTab />}
        {tab === 'balance' && <BalanceTab />}
        {tab === 'calendar' && <LeaveCalendarTab />}
        {tab === 'approvals' && <ApprovalsTab />}
      </div>
    </div>
  )
}
