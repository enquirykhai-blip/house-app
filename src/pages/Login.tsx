import { useState, type FormEvent } from 'react'
import { Home } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { PasswordInput } from '../components/PasswordInput'
import { inputClass, labelClass, primaryButtonClass } from '../components/ui'

export function Login() {
  const { login, authError, clearAuthError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
    } catch {
      setError('Email atau kata laluan salah.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6">
      <div className="animate-fade-in-up mx-auto w-full max-w-sm safe-top">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 dark:bg-white">
            <Home className="h-7 w-7 text-white dark:text-neutral-900" strokeWidth={1.75} />
          </div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">House App</h1>
          <p className="mt-1 text-sm text-neutral-400">Log masuk untuk teruskan</p>
        </div>

        {authError && (
          <p className="animate-fade-in-up mb-4 rounded-xl bg-danger-soft px-3.5 py-2.5 text-center text-sm text-danger dark:bg-danger/15">
            {authError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              className={inputClass}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (authError) clearAuthError()
              }}
              placeholder="awak@contoh.com"
            />
          </div>
          <div>
            <label className={labelClass}>Kata laluan</label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="animate-fade-in-up text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !email || !password}
            className={primaryButtonClass}
          >
            {submitting ? 'Log masuk...' : 'Log masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}
