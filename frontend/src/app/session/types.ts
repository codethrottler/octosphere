/**
 * A user can hold multiple roles at once (e.g. an engineering manager who is
 * also a regular employee). Screens gate on "does the current user have role
 * X", never on a single exclusive role.
 */
export type Role = 'employee' | 'manager' | 'hr' | 'admin'

export interface CurrentUser {
  id: string
  name: string
  initials: string
  title: string
  roles: Role[]
}
