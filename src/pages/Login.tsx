import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { PasswordInput } from '../components/PasswordInput'
import { inputClass, labelClass, primaryButtonClass } from '../components/ui'

export function Login() {
  const { login, signupOpen, configLoading } = useAuth()
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
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900">
            <Home className="h-7 w-7 text-white" strokeWidth={1.75} />
          </div>
          <h1 className="text-xl font-semibold text-neutral-900">House App</h1>
          <p className="mt-1 text-sm text-neutral-400">Log masuk untuk teruskan</p>
        </div>

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
              onChange={(e) => setEmail(e.target.value)}
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

        {!configLoading && signupOpen && (
          <p className="mt-6 text-center text-sm text-neutral-400">
            Setup kali pertama?{' '}
            <Link to="/signup" className="font-medium text-accent">
              Daftar akaun
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
