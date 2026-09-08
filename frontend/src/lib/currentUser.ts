/**
 * Stand-in for the authenticated session until the login flow exists.
 * Consumed directly (not via context) — nothing this session needs to
 * react to the user changing, so a context would be unused ceremony.
 * Promote this to a context/provider once a real login flow needs to
 * update it at runtime.
 */
export const currentUser = {
  name: 'Priya Nair',
  initials: 'PN',
  title: 'HR Business Partner',
}
