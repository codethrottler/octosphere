import { taskActivityMock } from '@/modules/dashboard/mock/taskActivity.mock'
import { taskTotalsMock } from '@/shared/analytics/taskData.mock'
import type { DonutDatum } from '@/shared/components/DonutCard/DonutCard'

/**
 * Wraps the same taskTotalsMock consumed by Executive Overview so the two
 * screens never disagree on totals, plus a local recent-activity mock.
 */
export function useTaskOverview() {
  const { total, completed, inProgress, overdue } = taskTotalsMock
  const completionRate = (completed / total) * 100
  const overdueRate = (overdue / total) * 100

  const statusDistribution: DonutDatum[] = [
    { name: 'Completed', value: completed, color: 'var(--color-success-500)' },
    { name: 'In Progress', value: inProgress, color: 'var(--color-info-500)' },
    { name: 'Overdue', value: overdue, color: 'var(--color-danger-500)' },
  ]

  return {
    totals: taskTotalsMock,
    completionRate,
    overdueRate,
    statusDistribution,
    activity: taskActivityMock,
  }
}
