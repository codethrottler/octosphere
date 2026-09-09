import { useEffect, useState } from 'react'

import { Check, X } from 'lucide-react'

import {
  approveCorrection,
  fetchCorrections,
  fetchMyRecentAttendance,
  rejectCorrection,
  requestCorrection,
} from '@/modules/hrms/attendance/data'
import type { AttendanceCorrection, AttendanceRecord } from '@/modules/hrms/attendance/types'
import { Badge, type BadgeTone } from '@/widgets/Badge'

const STATUS_TONE: Record<AttendanceCorrection['approval_status'], BadgeTone> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  cancelled: 'neutral',
}

export function CorrectionsTab() {
  const [scope, setScope] = useState<'mine' | 'team'>('mine')
  const [corrections, setCorrections] = useState<AttendanceCorrection[]>([])
  const [myRecords, setMyRecords] = useState<AttendanceRecord[]>([])
  const [recordId, setRecordId] = useState('')
  const [requestedCheckIn, setRequestedCheckIn] = useState('')
  const [requestedCheckOut, setRequestedCheckOut] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  function reload() {
    fetchCorrections(scope).then((page) => setCorrections(page.results))
  }

  useEffect(reload, [scope])
  useEffect(() => {
    fetchMyRecentAttendance().then((page) => setMyRecords(page.results))
  }, [])

  async function handleSubmit() {
    if (!recordId || !reason) return
    setSaving(true)
    try {
      await requestCorrection({
        record: Number(recordId),
        requested_check_in: requestedCheckIn || undefined,
        requested_check_out: requestedCheckOut || undefined,
        reason,
      })
      setRecordId('')
      setRequestedCheckIn('')
      setRequestedCheckOut('')
      setReason('')
      reload()
    } finally {
      setSaving(false)
    }
  }

  async function handleDecision(id: number, approved: boolean) {
    await (approved ? approveCorrection(id) : rejectCorrection(id))
    reload()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setScope('mine')}
          className={`rounded-full px-3 py-1 text-xs font-medium ${scope === 'mine' ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-600'}`}
        >
          My Requests
        </button>
        <button
          type="button"
          onClick={() => setScope('team')}
          className={`rounded-full px-3 py-1 text-xs font-medium ${scope === 'team' ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-600'}`}
        >
          Team Requests
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {corrections.length === 0 ? (
          <p className="text-sm text-ink-400">No correction requests.</p>
        ) : (
          corrections.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border border-ink-200 bg-white p-3 shadow-sm">
              <div>
                <p className="text-sm font-medium text-ink-900">
                  {c.employee_name} · {c.record_date}
                </p>
                <p className="text-xs text-ink-500">{c.reason}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={STATUS_TONE[c.approval_status]}>{c.approval_status}</Badge>
                {scope === 'team' && c.approval_status === 'pending' ? (
                  <>
                    <button type="button" onClick={() => handleDecision(c.id, true)} className="rounded-lg p-1.5 text-success-700 hover:bg-success-50">
                      <Check className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleDecision(c.id, false)} className="rounded-lg p-1.5 text-danger-700 hover:bg-danger-50">
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      {scope === 'mine' ? (
        <div className="flex max-w-xl flex-col gap-3 rounded-xl border border-dashed border-ink-200 bg-white p-4">
          <p className="text-sm font-semibold text-ink-800">Request a correction</p>
          <select value={recordId} onChange={(e) => setRecordId(e.target.value)} className="input">
            <option value="">Select a date…</option>
            {myRecords.map((r) => (
              <option key={r.id} value={r.id}>
                {r.date} ({r.status})
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input type="datetime-local" value={requestedCheckIn} onChange={(e) => setRequestedCheckIn(e.target.value)} className="input" placeholder="Corrected check-in" />
            <input type="datetime-local" value={requestedCheckOut} onChange={(e) => setRequestedCheckOut(e.target.value)} className="input" placeholder="Corrected check-out" />
          </div>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Reason" className="input" />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="w-fit rounded-lg bg-brand-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {saving ? 'Submitting…' : 'Submit request'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
