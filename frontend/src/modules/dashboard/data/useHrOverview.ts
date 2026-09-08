import { hrActivityMock } from '@/modules/dashboard/mock/hrActivity.mock'
import { getHrSummary, type HrSummary } from '@/shared/analytics/hrMetrics'

/**
 * Wraps the shared HR aggregation (see hrMetrics.ts) plus a small local
 * activity mock. Once HRMS' own Overview widget exists, it should call
 * getHrSummary() directly rather than duplicating this logic.
 */
export function useHrOverview(): { summary: HrSummary; activity: typeof hrActivityMock } {
  return {
    summary: getHrSummary(),
    activity: hrActivityMock,
  }
}
