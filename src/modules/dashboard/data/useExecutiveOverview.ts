import { getExecutiveSummary, type ExecutiveSummary } from '@/shared/analytics/executiveMetrics'

/**
 * Thin wrapper around the shared aggregation. Kept as a hook (rather than
 * calling getExecutiveSummary() directly in the tab) so swapping to a real
 * API call later doesn't touch the component.
 */
export function useExecutiveOverview(): ExecutiveSummary {
  return getExecutiveSummary()
}
