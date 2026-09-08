import { departmentDistributionMock, headcountMock, leaveRequestsPendingMock } from '@/shared/analytics/orgData.mock'
import { taskTotalsMock } from '@/shared/analytics/taskData.mock'
import { ticketsByDeskMock, ticketTotalsMock } from '@/shared/analytics/ticketData.mock'
import type { DonutDatum } from '@/shared/components/DonutCard/DonutCard'

export interface ExecutiveSummary {
  headcount: typeof headcountMock
  taskCompletionRate: number
  tickets: typeof ticketTotalsMock
  ticketsByDesk: DonutDatum[]
  leavePending: number
  departmentDistribution: DonutDatum[]
}

/**
 * Cross-module aggregation for the Executive Overview tab. Lives in
 * `shared/analytics` (not inside the dashboard module) precisely so
 * Reports & Analytics' future Executive Reports page imports this same
 * function instead of re-deriving the same numbers.
 */
export function getExecutiveSummary(): ExecutiveSummary {
  const taskCompletionRate = (taskTotalsMock.completed / taskTotalsMock.total) * 100

  return {
    headcount: headcountMock,
    taskCompletionRate,
    tickets: ticketTotalsMock,
    ticketsByDesk: ticketsByDeskMock,
    leavePending: leaveRequestsPendingMock,
    departmentDistribution: departmentDistributionMock,
  }
}
