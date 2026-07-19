import { Link } from 'react-router-dom'
import {
  Pencil,
  Phone,
  MapPin,
  Bike,
  Car,
  User,
  Shield,
  Settings as SettingsIcon,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/ui/Avatar'
import { PageHeader } from '@/components/PageHeader'
import { formatPhone } from '@/lib/phone'
import { VEHICLE_TYPE_ICONS } from '@/lib/constants'

const roleLabel: Record<string, string> = {
  client: 'Client',
  rider: 'Boda Rider',
  taxi_driver: 'Taxi Driver',
}

export default function ProfilePage() {
  const { profile } = useAuth()
  if (!profile) return null

  const isProvider = profile.role !== 'client'
  const regNumber =
    profile.role === 'taxi_driver'
      ? profile.vehicle_registration_number
      : profile.motorcycle_registration_number

  return (
    <div className="space-y-5">
      <PageHeader
        title="Profile"
        right={
          <Link
            to="/app/profile/edit"
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20"
          >
            <Pencil size={15} /> Edit
          </Link>
        }
      />

      {/* Profile card */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full ring-4 ring-white/30">
              <Avatar src={profile.profile_photo_url} name={profile.full_name} size={72} />
            </div>
            <div className="text-white">
              <h2 className="text-xl font-bold">{profile.full_name}</h2>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">
                {profile.role === 'rider' ? <Bike size={12} /> : profile.role === 'taxi_driver' ? <Car size={12} /> : <User size={12} />}
                {roleLabel[profile.role]}
              </span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-neutral-800">
          <Row icon={Phone} label="Phone Number" value={formatPhone(profile.phone_number)} />
          {isProvider && profile.county && (
            <Row
              icon={MapPin}
              label="Location"
              value={[profile.area, profile.town, profile.county].filter(Boolean).join(', ')}
            />
          )}
          {profile.role === 'rider' && regNumber && (
            <Row icon={Bike} label="Motorcycle Reg." value={regNumber.toUpperCase()} mono />
          )}
          {profile.role === 'taxi_driver' && (
            <>
              {profile.vehicle_type && (
                <Row
                  icon={Car}
                  label="Vehicle"
                  value={`${VEHICLE_TYPE_ICONS[profile.vehicle_type]} ${profile.vehicle_type}`}
                />
              )}
              {regNumber && (
                <Row icon={Car} label="Vehicle Reg." value={regNumber.toUpperCase()} mono />
              )}
            </>
          )}
          <Row
            icon={Shield}
            label="Member since"
            value={new Date(profile.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          />
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/app/profile/edit" className="card flex flex-col items-center gap-2 p-4 hover:border-brand-400">
          <Pencil size={20} className="text-brand-600" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Edit Profile</span>
        </Link>
        <Link to="/app/settings" className="card flex flex-col items-center gap-2 p-4 hover:border-gray-400">
          <SettingsIcon size={20} className="text-gray-600 dark:text-gray-300" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Settings</span>
        </Link>
      </div>
    </div>
  )
}

function Row({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof Phone
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400">
        <Icon size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
        <p className={`truncate text-gray-900 dark:text-gray-100 ${mono ? 'font-mono font-semibold uppercase' : 'font-medium'}`}>
          {value}
        </p>
      </div>
    </div>
  )
}
