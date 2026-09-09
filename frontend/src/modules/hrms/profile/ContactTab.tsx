import { useState } from 'react'

import { Field } from '@/modules/hrms/profile/Field'
import { updateMyProfile } from '@/modules/hrms/profile/data'
import type { EmployeeProfile } from '@/modules/hrms/profile/types'

interface ContactTabProps {
  profile: EmployeeProfile
  onSaved: () => void
}

export function ContactTab({ profile, onSaved }: ContactTabProps) {
  const [form, setForm] = useState({
    personal_email: profile.personal_email,
    phone_number: profile.phone_number,
    alternate_phone_number: profile.alternate_phone_number,
    current_address: profile.current_address,
    permanent_address: profile.permanent_address,
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
      <Field label="Personal email">
        <input type="email" value={form.personal_email} onChange={(e) => setForm({ ...form, personal_email: e.target.value })} className="input" />
      </Field>
      <Field label="Phone number">
        <input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="input" />
      </Field>
      <Field label="Alternate phone number">
        <input value={form.alternate_phone_number} onChange={(e) => setForm({ ...form, alternate_phone_number: e.target.value })} className="input" />
      </Field>
      <Field label="Current address">
        <textarea value={form.current_address} onChange={(e) => setForm({ ...form, current_address: e.target.value })} rows={3} className="input" />
      </Field>
      <Field label="Permanent address">
        <textarea value={form.permanent_address} onChange={(e) => setForm({ ...form, permanent_address: e.target.value })} rows={3} className="input" />
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
