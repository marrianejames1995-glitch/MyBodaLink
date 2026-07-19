import { Link } from 'react-router-dom'
import {
  Bike,
  Car,
  MapPin,
  Phone,
  Eye,
  CheckCircle2,
  Siren,
  Settings,
  Star,
  Pencil,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/ui/Avatar'
import { formatPhone } from '@/lib/phone'
import { VEHICLE_TYPE_ICONS } from '@/lib/constants'
import type { UserRole } from '@/lib/types'

export function ProviderHome({ role }: { role: UserRole }) {
  const { profile } = useAuth()
  if (!profile) return null

  const isTaxi = role === 'taxi_driver'
  const Icon = isTaxi ? Car : Bike
  const accent = isTaxi
    ? 'from-blue-500 to-indigo-600'
    : 'from-amber-500 to-orange-600'
  const firstName = profile.full_name?.split(' ')[0] ?? 'there'
  const regNumber = isTaxi
    ? profile.vehicle_registration_number
    : profile.motorcycle_registration_number

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back,</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Hi, {firstName} 👋
        </h1>
      </div>

      {/* Listing preview card */}
      <div className="card overflow-hidden">
        <div className={`flex items-center gap-3 bg-gradient-to-r ${accent} p-4 text-white`}>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
            <Icon size={22} />
          </div>
          <div>
            <p className="text-sm font-medium opacity-90">
              {isTaxi ? 'Taxi Driver' : 'Boda Rider'} listing
            </p>
            <p className="flex items-center gap-1 text-lg font-bold">
              <CheckCircle2 size={16} /> Active
            </p>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3">
            <Avatar src={profile.profile_photo_url} name={profile.full_name} size={56} />
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-gray-900 dark:text-gray-100">
                {profile.full_name}
              </h3>
              <p className="text-sm text-brand-700 dark:text-brand-400">
                {formatPhone(profile.phone_number)}
              </p>
              {profile.county && (
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <MapPin size={12} />
                  {[profile.area, profile.town, profile.county].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {isTaxi && profile.vehicle_type && (
              <Info label="Vehicle">
                {VEHICLE_TYPE_ICONS[profile.vehicle_type]} {profile.vehicle_type}
              </Info>
            )}
            <Info label={isTaxi ? 'Reg. Number' : 'Motorcycle Reg.'}>
              <span className="font-mono font-semibold uppercase">{regNumber || '—'}</span>
            </Info>
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Eye size={13} /> Clients searching your area can find and call you.
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/app/profile" className="card flex items-center gap-3 p-4 hover:border-brand-400">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <Pencil size={18} />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Edit listing</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Update your details</p>
          </div>
        </Link>
        <Link to="/app/settings" className="card flex items-center gap-3 p-4 hover:border-gray-400">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-300">
            <Settings size={18} />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Settings</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Preferences</p>
          </div>
        </Link>
      </div>

      {/* Tips */}
      <div className="card p-5">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
          <Star size={18} className="text-amber-500" /> Get more clients
        </h3>
        <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-300">
          <Tip>Add a clear profile photo so clients recognise you.</Tip>
          <Tip>Keep your town and area up to date when you move.</Tip>
          <Tip>Answer calls and texts promptly to build trust.</Tip>
        </ul>
      </div>

      <Link
        to="/app/emergency"
        className="card flex items-center gap-3 border-red-200 p-4 hover:border-red-400 dark:border-red-900/40"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
          <Siren size={18} />
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900 dark:text-gray-100">Emergency contacts</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Kenya helplines, one-tap call</p>
        </div>
        <Phone size={16} className="text-gray-400" />
      </Link>
    </div>
  )
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-neutral-800/50">
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 text-gray-900 dark:text-gray-100">{children}</p>
    </div>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand-600" />
      <span>{children}</span>
    </li>
  )
}
