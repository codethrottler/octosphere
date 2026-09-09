import { useState } from 'react'

import { Trash2 } from 'lucide-react'

import { Field } from '@/modules/hrms/profile/Field'
import { createEmergencyContact, deleteEmergencyContact } from '@/modules/hrms/profile/data'
import type { EmergencyContact } from '@/modules/hrms/profile/types'

interface EmergencyContactsTabProps {
  contacts: EmergencyContact[]
  onChanged: () => void
}

const EMPTY_FORM = { name: '', relationship: '', phone_number: '', alternate_phone_number: '', is_primary: false }

export function EmergencyContactsTab({ contacts, onChanged }: EmergencyContactsTabProps) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!form.name || !form.phone_number) return
    setSaving(true)
    try {
      await createEmergencyContact(form)
      setForm(EMPTY_FORM)
      onChanged()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    await deleteEmergencyContact(id)
    onChanged()
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div className="flex flex-col gap-2">
        {contacts.length === 0 ? (
          <p className="text-sm text-ink-400">No emergency contacts added yet.</p>
        ) : (
          contacts.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border border-ink-200 bg-white p-3 shadow-sm">
              <div>
                <p className="text-sm font-medium text-ink-900">
                  {c.name} {c.is_primary ? <span className="ml-1 text-xs font-normal text-brand-600">Primary</span> : null}
                </p>
                <p className="text-xs text-ink-500">
                  {c.relationship} · {c.phone_number}
                </p>
              </div>
              <button type="button" onClick={() => handleDelete(c.id)} className="rounded-lg p-1.5 text-ink-400 hover:bg-danger-50 hover:text-danger-700">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-xl border border-dashed border-ink-200 bg-white p-4">
        <Field label="Name">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        </Field>
        <Field label="Relationship">
          <input value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} className="input" />
        </Field>
        <Field label="Phone number">
          <input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="input" />
        </Field>
        <Field label="Alternate phone">
          <input value={form.alternate_phone_number} onChange={(e) => setForm({ ...form, alternate_phone_number: e.target.value })} className="input" />
        </Field>
        <label className="col-span-2 flex items-center gap-2 text-sm text-ink-600">
          <input type="checkbox" checked={form.is_primary} onChange={(e) => setForm({ ...form, is_primary: e.target.checked })} />
          Primary contact
        </label>
        <button
          type="button"
          onClick={handleAdd}
          disabled={saving}
          className="col-span-2 w-fit rounded-lg bg-brand-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {saving ? 'Adding…' : 'Add contact'}
        </button>
      </div>
    </div>
  )
}
