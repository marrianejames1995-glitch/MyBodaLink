import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Phone, Lock, Eye, EyeOff, Bike } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { isSupabaseConfigured } from '@/lib/supabase'
import { isValidKenyanPhone } from '@/lib/phone'
import { Spinner } from '@/components/ui/Spinner'
import { SupabaseNotConfigured } from '@/components/SupabaseNotConfigured'

export default function Login() {
  const { signIn } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [busy, setBusy] = useState(false)

  if (!isSupabaseConfigured) return <SupabaseNotConfigured />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isValidKenyanPhone(phone)) {
      toast('Enter a valid Kenyan phone number (e.g. 0712 345 678).', 'error')
      return
    }
    if (password.length < 6) {
      toast('Password must be at least 6 characters.', 'error')
      return
    }
    setBusy(true)
    try {
      await signIn(phone, password)
      toast('Welcome back!', 'success')
      navigate('/app/home', { replace: true })
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Sign-in failed. Check your details.'
      toast(friendlyAuthError(msg), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-10 safe-top">
      <Link to="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Bike size={22} />
        </div>
        <span className="text-xl font-extrabold">
          My<span className="text-brand-600">Boda</span>Link
        </span>
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Sign in to continue.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="phone">
            Phone Number
          </label>
          <div className="relative">
            <Phone
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className="input pl-10"
              placeholder="0712 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              id="password"
              type={showPwd ? 'text' : 'password'}
              autoComplete="current-password"
              className="input pl-10 pr-10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPwd ? 'Hide password' : 'Show password'}
            >
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={busy} className="btn-primary w-full py-3">
          {busy ? <Spinner /> : 'Sign in'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <Link to="/" className="font-semibold text-brand-600 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}

function friendlyAuthError(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('invalid login')) return 'Wrong phone number or password.'
  if (m.includes('not confirmed')) return 'Please confirm your account first.'
  if (m.includes('rate limit')) return 'Too many attempts. Please wait a moment.'
  return msg
}
