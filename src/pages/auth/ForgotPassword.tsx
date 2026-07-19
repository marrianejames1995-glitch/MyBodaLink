import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Phone, MailCheck, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { isSupabaseConfigured } from '@/lib/supabase'
import { isValidKenyanPhone, AUTH_EMAIL_DOMAIN } from '@/lib/phone'
import { Spinner } from '@/components/ui/Spinner'
import { SupabaseNotConfigured } from '@/components/SupabaseNotConfigured'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const { toast } = useToast()
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  if (!isSupabaseConfigured) return <SupabaseNotConfigured />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isValidKenyanPhone(phone))
      return toast('Enter a valid Kenyan phone number.', 'error')
    setBusy(true)
    try {
      await resetPassword(phone)
      setSent(true)
      toast('Password reset instructions sent.', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not send reset email.'
      toast(msg, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8 safe-top">
      <Link
        to="/login"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400"
      >
        <ArrowLeft size={16} /> Back to sign in
      </Link>

      {sent ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <MailCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Check your inbox</h1>
          <p className="mt-2 max-w-sm text-sm text-gray-600 dark:text-gray-400">
            If an account exists for this phone number, a password reset email has been
            sent to its linked address (<code className="font-mono">@{AUTH_EMAIL_DOMAIN}</code>).
            Open the link in the email to choose a new password.
          </p>
          <Link to="/login" className="btn-primary mt-6">
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Forgot password?
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Enter the phone number linked to your account. We'll send reset instructions.
            </p>
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
                  className="input pl-10"
                  placeholder="0712 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={busy} className="btn-primary w-full py-3">
              {busy ? <Spinner /> : 'Send reset instructions'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
