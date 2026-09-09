import { useRef, useState, type ChangeEvent } from 'react'

import { FileText, Trash2, Upload } from 'lucide-react'

import { deleteDocument, uploadDocument } from '@/modules/hrms/profile/data'
import type { ProfileDocument } from '@/modules/hrms/profile/types'

interface DocumentsTabProps {
  documents: ProfileDocument[]
  onChanged: () => void
}

const DOCUMENT_TYPES = [
  { value: 'id_proof', label: 'ID Proof' },
  { value: 'resume', label: 'Resume' },
  { value: 'offer_letter', label: 'Offer Letter' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'other', label: 'Other' },
]

/** Profile-scoped documents only (ID proof, resume, certificates) — see docs/MODULE_PLAN.md for the broader Documents module, out of scope. */
export function DocumentsTab({ documents, onChanged }: DocumentsTabProps) {
  const [documentType, setDocumentType] = useState('resume')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadDocument(documentType, file)
      onChanged()
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div className="flex flex-col gap-2">
        {documents.length === 0 ? (
          <p className="text-sm text-ink-400">No documents uploaded yet.</p>
        ) : (
          documents.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl border border-ink-200 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-ink-400" />
                <div>
                  <p className="text-sm font-medium text-ink-900">{d.original_filename}</p>
                  <p className="text-xs text-ink-500">{DOCUMENT_TYPES.find((t) => t.value === d.document_type)?.label ?? d.document_type}</p>
                </div>
              </div>
              <button type="button" onClick={() => deleteDocument(d.id).then(onChanged)} className="rounded-lg p-1.5 text-ink-400 hover:bg-danger-50 hover:text-danger-700">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-dashed border-ink-200 bg-white p-4">
        <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="input">
          {DOCUMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-600">
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading…' : 'Upload file'}
          <input ref={fileInputRef} type="file" onChange={handleFileChange} disabled={uploading} className="hidden" />
        </label>
      </div>
    </div>
  )
}
