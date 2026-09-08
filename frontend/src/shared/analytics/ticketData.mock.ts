/** Raw Service Desk source data, shared by Executive Overview and the Service Desk Overview tab. */

export const ticketTotalsMock = {
  open: 438,
  resolvedToday: 72,
  slaBreached: 14,
  avgResolutionHours: 4.2,
}

export const ticketsByDeskMock = [
  { name: 'HR Desk', value: 124, color: 'var(--color-desk-hr)' },
  { name: 'IT Desk', value: 231, color: 'var(--color-desk-it)' },
  { name: 'Admin Desk', value: 83, color: 'var(--color-desk-admin)' },
]
