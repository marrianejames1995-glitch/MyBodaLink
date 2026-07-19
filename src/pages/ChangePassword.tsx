import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { PageHeader } from '@/components/PageHeader'
import { Spinner } from '@/components/ui/Spinner'

export default function ChangePassword() {
  const { updatePassword } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (next.length < 6) return toast('New password must be at least 6 characters.', 'error')
    if (next !== confirm) return toast('New passwords do not match.', 'error')
    setBusy(true)
    try {
      await updatePassword(next)
      toast('Password changed successfully.', 'success')
      navigate('/app/settings')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not change password.'
      toast(msg, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Change Password" back />
      <div className="card flex items-center gap-3 bg-brand-50 p-4 dark:bg-brand-900/20">
        <KeyRound size={22} className="text-brand-600" />
        <p className="text-sm text-brand-900 dark:text-brand-200">
          Choose a strong, unique password you don't use elsewhere.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-4">
        <div>
          <label className="label">Current Password</label>
          <div className="relative">
            <Lock size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              className="input pl-10 pr-10"
              placeholder="••••••••"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={show ? 'Hide' : 'Show'}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label className="label">New Password</label>
          <div className="relative">
            <Lock size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              className="input pl-10"
              placeholder="At least 6 characters"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="label">Confirm New Password</label>
          <div className="relative">
            <Lock size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
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
    </div>
  )
}
