import { useAuth } from '@/auth/AuthContext'
import type { EmployeeProfile } from '@/modules/hrms/profile/types'

interface EmploymentTabProps {
  profile: EmployeeProfile
}

function ReadField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</span>
      <span className="text-sm text-ink-800">{value || '—'}</span>
    </div>
  )
}

/**
 * Read-only: employment fields are HR-managed (employee_code/team/status
 * on core.User, designation/employment_type here) — no self-service edit
 * this session. Pulls core.User fields from useAuth() alongside the
 * EmployeeProfile ones so both sources show in one place.
 */
export function EmploymentTab({ profile }: EmploymentTabProps) {
  const { user } = useAuth()

  return (
    <div className="grid max-w-lg grid-cols-2 gap-4 rounded-xl border border-ink-200 bg-white p-5 shadow-sm">
      <ReadField label="Employee ID" value={user?.employee_code} />
      <ReadField label="Team" value={user?.team_name} />
      <ReadField label="Designation" value={profile.designation_name || user?.title} />
      <ReadField label="Employment type" value={profile.employment_type} />
      <ReadField label="Work location" value={profile.work_location} />
      <ReadField label="Employment status" value={user?.employment_status} />
      <ReadField label="Confirmation date" value={profile.confirmation_date} />
    </div>
  )
}
