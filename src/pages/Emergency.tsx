import { useMemo, useState } from 'react'
import {
  Phone,
  Siren,
  Shield,
  HeartPulse,
  Flame,
  LifeBuoy,
  PhoneCall,
} from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { EMERGENCY_CONTACTS, EMERGENCY_CATEGORIES } from '@/lib/constants'
import type { EmergencyContact } from '@/lib/constants'
import { normalizePhone } from '@/lib/phone'

const categoryIcons: Record<string, typeof Phone> = {
  Police: Shield,
  Medical: HeartPulse,
  Fire: Flame,
  Helpline: LifeBuoy,
  General: Phone,
}

export default function EmergencyPage() {
  const [active, setActive] = useState<string>('All')

  const categories = useMemo(() => ['All', ...EMERGENCY_CATEGORIES], [])
  const filtered = useMemo(
    () =>
      active === 'All'
        ? EMERGENCY_CONTACTS
        : EMERGENCY_CONTACTS.filter((c) => c.category === active),
    [active],
  )

  // Primary big buttons
  const primary = EMERGENCY_CONTACTS.filter(
    (c) => c.id === 'police-general' || c.id === 'ambulance-redcross',
  )

  return (
    <div className="space-y-5">
      <PageHeader title="Emergency" subtitle="Kenya helplines · one-tap call" />

      {/* Big SOS buttons */}
      <div className="grid grid-cols-2 gap-3">
        {primary.map((c) => {
          const Icon = categoryIcons[c.category] ?? PhoneCall
          return (
            <a
              key={c.id}
              href={`tel:${normalizePhone(c.phone)}`}
              className="flex flex-col items-center gap-2 rounded-2xl bg-red-600 p-4 text-center text-white shadow-md transition active:scale-95"
            >
              <Icon size={28} />
              <div>
                <p className="text-sm font-bold">{c.name.replace('Emergency', 'SOS')}</p>
                <p className="text-lg font-extrabold tracking-wide">{c.phone}</p>
              </div>
            </a>
          )
        })}
      </div>

      {/* Category tabs */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              active === cat
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-neutral-800 dark:text-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Contact list */}
      <div className="space-y-2.5">
        {filtered.map((c) => (
          <ContactRow key={c.id} contact={c} />
        ))}
      </div>

      <div className="card flex items-start gap-3 bg-amber-50 p-4 dark:bg-amber-900/20">
        <Siren size={20} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-xs text-amber-800 dark:text-amber-300">
          In a life-threatening situation, call <strong>999</strong> or{' '}
          <strong>112</strong> first and clearly state your location. Keep this screen
          accessible — you can add it to your home screen as an app.
        </p>
      </div>
    </div>
  )
}

function ContactRow({ contact }: { contact: EmergencyContact }) {
  const Icon = categoryIcons[contact.category] ?? Phone
  return (
    <a
      href={`tel:${normalizePhone(contact.phone)}`}
      className="card flex items-center gap-3 p-3.5 transition hover:border-brand-400 active:scale-[0.99]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-gray-900 dark:text-gray-100">
          {contact.name}
        </p>
        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
          {contact.description}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-semibold text-gray-700 dark:text-gray-300">
          {contact.phone}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white">
          <Phone size={16} />
        </span>
      </div>
    </a>
  )
}
