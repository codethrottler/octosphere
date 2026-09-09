import { useState } from 'react'

import { Field } from '@/modules/hrms/profile/Field'
import { saveBankAccount } from '@/modules/hrms/profile/data'
import type { BankAccount } from '@/modules/hrms/profile/types'

interface BankTabProps {
  bankAccount: BankAccount | null
  onSaved: () => void
}

type BankFormData = Omit<BankAccount, 'updated_at'>

const EMPTY_FORM: BankFormData = {
  account_holder_name: '',
  bank_name: '',
  branch_name: '',
  account_number: '',
  ifsc_code: '',
  account_type: 'savings',
}

/** India-specific fields (account number + IFSC) per this session's scoping — see docs/ARCHITECTURE.md. */
export function BankTab({ bankAccount, onSaved }: BankTabProps) {
  const [form, setForm] = useState<BankFormData>(bankAccount ?? EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await saveBankAccount(form)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex max-w-lg flex-col gap-4 rounded-xl border border-ink-200 bg-white p-5 shadow-sm">
      <Field label="Account holder name">
        <input value={form.account_holder_name} onChange={(e) => setForm({ ...form, account_holder_name: e.target.value })} className="input" />
      </Field>
      <Field label="Bank name">
        <input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} className="input" />
      </Field>
      <Field label="Branch name">
        <input value={form.branch_name} onChange={(e) => setForm({ ...form, branch_name: e.target.value })} className="input" />
      </Field>
      <Field label="Account number">
        <input value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} className="input" />
      </Field>
      <Field label="IFSC code">
        <input value={form.ifsc_code} onChange={(e) => setForm({ ...form, ifsc_code: e.target.value.toUpperCase() })} className="input" maxLength={11} />
      </Field>
      <Field label="Account type">
        <select
          value={form.account_type}
          onChange={(e) => setForm({ ...form, account_type: e.target.value as 'savings' | 'current' })}
          className="input"
        >
          <option value="savings">Savings</option>
          <option value="current">Current</option>
        </select>
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
