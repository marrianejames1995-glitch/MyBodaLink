import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Spinner } from '@/components/ui/Spinner'

export default function ResetPassword() {
  const { updatePassword } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password.length < 6)
      return toast('Password must be at least 6 characters.', 'error')
    if (password !== confirm) return toast('Passwords do not match.', 'error')
    setBusy(true)
    try {
      await updatePassword(password)
      toast('Password updated. Please sign in.', 'success')
      navigate('/login', { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not update password.'
      toast(msg, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-8 safe-top">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
          <KeyRound size={28} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Set a new password</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">New Password</label>
          <div className="relative">
            <Lock
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type={showPwd ? 'text' : 'password'}
              className="input pl-10 pr-10"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
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
        <div>
          <label className="label">Confirm New Password</label>
          <div className="relative">
            <Lock
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type={showPwd ? 'text' : 'password'}
              className="input pl-10"
              placeholder="Re-enter new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full py-3">
          {busy ? <Spinner /> : 'Update password'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
