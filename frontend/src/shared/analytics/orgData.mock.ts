/**
 * Raw HR/org source data. Owned here (not inside a module) so both the
 * Dashboard's Executive/HR Overview tabs and the future HRMS Overview /
 * Reports Executive Reports page can compute their summaries from the same
 * source instead of each hardcoding their own numbers.
 */

export const headcountMock = {
  total: 1284,
  active: 1231,
  onLeave: 42,
  newJoiners: 18,
  exits: 9,
}

export const departmentDistributionMock = [
  { name: 'Engineering', value: 412, color: 'var(--color-brand-500)' },
  { name: 'Sales', value: 268, color: 'var(--color-info-500)' },
  { name: 'Operations', value: 231, color: 'var(--color-success-500)' },
  { name: 'Customer Support', value: 187, color: 'var(--color-warning-500)' },
  { name: 'Finance', value: 98, color: 'var(--color-desk-hr)' },
  { name: 'Other', value: 88, color: 'var(--color-ink-300)' },
]

export const leaveRequestsPendingMock = 23
