import { useState } from 'react'

import { Field } from '@/modules/hrms/profile/Field'
import { updateMyProfile } from '@/modules/hrms/profile/data'
import type { EmployeeProfile } from '@/modules/hrms/profile/types'

interface PersonalTabProps {
  profile: EmployeeProfile
  onSaved: () => void
}

export function PersonalTab({ profile, onSaved }: PersonalTabProps) {
  const [form, setForm] = useState({
    date_of_birth: profile.date_of_birth ?? '',
    gender: profile.gender,
    marital_status: profile.marital_status,
    nationality: profile.nationality,
    blood_group: profile.blood_group,
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await updateMyProfile(form)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex max-w-lg flex-col gap-4 rounded-xl border border-ink-200 bg-white p-5 shadow-sm">
      <Field label="Date of birth">
        <input
          type="date"
          value={form.date_of_birth}
          onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
          className="input"
        />
      </Field>
      <Field label="Gender">
        <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input">
          <option value="">—</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="undisclosed">Prefer not to say</option>
        </select>
      </Field>
      <Field label="Marital status">
        <select value={form.marital_status} onChange={(e) => setForm({ ...form, marital_status: e.target.value })} className="input">
          <option value="">—</option>
          <option value="single">Single</option>
          <option value="married">Married</option>
          <option value="other">Other</option>
          <option value="undisclosed">Prefer not to say</option>
        </select>
      </Field>
      <Field label="Nationality">
        <input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} className="input" />
      </Field>
      <Field label="Blood group">
        <input value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })} className="input" placeholder="e.g. O+" />
      </Field>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-fit rounded-lg bg-brand-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  )
}
