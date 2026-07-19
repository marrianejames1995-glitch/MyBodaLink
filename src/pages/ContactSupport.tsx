import { useState, type FormEvent } from 'react'
import { Mail, Phone, MessageCircle, Send, MapPin } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { PageHeader } from '@/components/PageHeader'
import { Spinner } from '@/components/ui/Spinner'
import { SUPPORT_EMAIL, SUPPORT_PHONE, APP_NAME } from '@/lib/constants'

export default function ContactSupport() {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (message.trim().length < 5) return toast('Please enter a message.', 'error')
    setBusy(true)
    // Compose an email via the user's mail client as the support channel.
    setTimeout(() => {
      const subject = encodeURIComponent(`${APP_NAME} support request`)
      const body = encodeURIComponent(`${message}\n\n— ${name || 'A MyBodaLink user'}`)
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
      setBusy(false)
      toast('Opening your email app…', 'success')
    }, 400)
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Contact Support" back />

      <div className="card space-y-1 p-5 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
          <MessageCircle size={24} />
        </div>
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">We're here to help</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Questions, feedback or issues? Reach us any of these ways.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <a href={`mailto:${SUPPORT_EMAIL}`} className="card flex items-center gap-3 p-4 hover:border-brand-400">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-300">
            <Mail size={18} />
          </span>
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-gray-100">Email</p>
            <p className="text-sm text-brand-700 dark:text-brand-400">{SUPPORT_EMAIL}</p>
          </div>
        </a>
        <a href={`tel:${SUPPORT_PHONE}`} className="card flex items-center gap-3 p-4 hover:border-brand-400">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-300">
            <Phone size={18} />
          </span>
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-gray-100">Call</p>
            <p className="text-sm text-brand-700 dark:text-brand-400">{SUPPORT_PHONE}</p>
          </div>
        </a>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-3 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Send a message</h3>
        <div>
          <label className="label">Your name (optional)</label>
          <input className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Message</label>
          <textarea
            className="input min-h-[120px] resize-y"
            placeholder="How can we help?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full py-3">
          {busy ? <Spinner /> : <><Send size={16} /> Send message</>}
        </button>
      </form>

      <div className="card flex items-start gap-2 p-4 text-xs text-gray-500 dark:text-gray-400">
        <MapPin size={16} className="mt-0.5 shrink-0" />
        <p>{APP_NAME} connects clients with riders and taxi drivers across Kenya. For emergencies, use the Emergency tab.</p>
      </div>
    </div>
  )
}
