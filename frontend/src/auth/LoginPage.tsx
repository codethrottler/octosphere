import { useState, type FormEvent } from 'react'

import { LogIn } from 'lucide-react'

import { useAuth } from '@/auth/AuthContext'
import { ApiError } from '@/lib/api'

/** Minimal login screen — POSTs to /api/auth/token/ via useAuth().login, no self-serve signup/reset this session. */
export function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(username, password)
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? 'Incorrect username or password.' : 'Could not sign in — is the backend running?')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-ink-50">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-xl border border-ink-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-base font-bold text-white">
            O
          </div>
          <h1 className="text-lg font-semibold text-ink-900">Sign in to OctoSphere</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-sm font-medium text-ink-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-ink-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none"
            />
          </div>

          {error ? <p className="text-sm text-danger-700">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-xs text-ink-400">
          Demo accounts: any seeded username (e.g. priya.nair) — see backend/hrms/management/commands/seed_demo_data.py
        </p>
      </div>
    </div>
  )
}
