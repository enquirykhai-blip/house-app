import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Home } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { SplashScreen } from '../components/SplashScreen'
import { PasswordInput } from '../components/PasswordInput'
import { inputClass, labelClass, primaryButtonClass, segmentClass } from '../components/ui'
import type { Person } from '../types'

export function Signup() {
  const { signup, signupOpen, config, configLoading } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const khaiTaken = !!config?.khaiUid
  const wifeTaken = !!config?.wifeUid
  const [role, setRole] = useState<Exclude<Person, 'both'> | null>(null)

  if (configLoading) return <SplashScreen />
  if (!signupOpen) return <Navigate to="/login" replace />

  const availableRole = khaiTaken ? 'wife' : wifeTaken ? 'khai' : role

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!availableRole) return
    setError(null)
    setSubmitting(true)
    try {
      await signup(email, password, availableRole, name.trim())
    } catch {
      setError('Gagal daftar. Cuba semak email / kata laluan (min. 6 aksara).')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6">
      <div className="animate-fade-in-up safe-top mx-auto w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900">
            <Home className="h-7 w-7 text-white" strokeWidth={1.75} />
          </div>
          <h1 className="text-xl font-semibold text-neutral-900">Setup House App</h1>
          <p className="mt-1 text-sm text-neutral-400">
            {khaiTaken || wifeTaken
              ? 'Satu akaun dah didaftar. Daftar akaun kedua.'
              : 'Daftar akaun pertama untuk berdua.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!khaiTaken && !wifeTaken && (
            <div>
              <label className={labelClass}>Akaun ini untuk siapa?</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={segmentClass(role === 'khai')}
                  onClick={() => setRole('khai')}
                >
                  Khai
                </button>
                <button
                  type="button"
                  className={segmentClass(role === 'wife')}
                  onClick={() => setRole('wife')}
                >
                  Wife
                </button>
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>Nama panggilan</label>
            <input
              type="text"
              required
              autoFocus={khaiTaken || wifeTaken}
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="cth. Khai"
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              required
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
              minLength={6}
              autoComplete="new-password"
              placeholder="Sekurang-kurangnya 6 aksara"
            />
          </div>
          {error && <p className="animate-fade-in-up text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !availableRole || !name.trim() || !email || password.length < 6}
            className={primaryButtonClass}
          >
            {submitting ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>
      </div>
    </div>
  )
}
