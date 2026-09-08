import { departmentDistributionMock, headcountMock, leaveRequestsPendingMock } from '@/shared/analytics/orgData.mock'
import type { DonutDatum } from '@/shared/components/DonutCard/DonutCard'

export interface HrSummary {
  headcount: typeof headcountMock
  leaveRequestsPending: number
  departmentDistribution: DonutDatum[]
}

/**
 * Cross-module aggregation for the HR Overview tab. Lives in
 * `shared/analytics` so the future HRMS Overview widget set reuses this
 * exact summary instead of duplicating the headcount/department logic.
 */
export function getHrSummary(): HrSummary {
  return {
    headcount: headcountMock,
    leaveRequestsPending: leaveRequestsPendingMock,
    departmentDistribution: departmentDistributionMock,
  }
}
