import type { CurrentUser } from '@/app/session/types'

/**
 * Stand-in for the authenticated session until real auth lands. Deliberately
 * a manager who is NOT on HR — this exercises both sides of role gating in
 * the Dashboard (Team Overview renders, HR Overview shows the permission
 * gate) instead of hiding the gate behind an all-access demo user.
 */
export const currentUserMock: CurrentUser = {
  id: 'usr_2041',
  name: 'Priya Nair',
  initials: 'PN',
  title: 'Engineering Manager',
  roles: ['employee', 'manager'],
}
