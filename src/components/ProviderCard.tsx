import { Phone, MessageSquare, MapPin, Bike, Car } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { connectAndLog } from '@/lib/connect'
import { formatPhone } from '@/lib/phone'
import { VEHICLE_TYPE_ICONS } from '@/lib/constants'
import type { Profile } from '@/lib/types'

interface ProviderCardProps {
  provider: Profile
  clientId?: string
}

export function ProviderCard({ provider, clientId }: ProviderCardProps) {
  const isTaxi = provider.role === 'taxi_driver'
  const regNumber = isTaxi
    ? provider.vehicle_registration_number
    : provider.motorcycle_registration_number

  return (
    <div className="card animate-fade-in overflow-hidden p-4">
      <div className="flex items-start gap-3">
        <Avatar src={provider.profile_photo_url} name={provider.full_name} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-gray-900 dark:text-gray-100">
              {provider.full_name}
            </h3>
            <span
              className={`chip ${
                isTaxi
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
              }`}
            >
              {isTaxi ? (
                <>
                  <Car size={12} /> Taxi Driver
                </>
              ) : (
                <>
                  <Bike size={12} /> Rider
                </>
              )}
            </span>
          </div>
          <a
            href={`tel:${provider.phone_number}`}
            className="mt-0.5 block text-sm text-brand-700 dark:text-brand-400"
          >
            {formatPhone(provider.phone_number)}
          </a>

          {(provider.county || provider.town || provider.area) && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">
                {[provider.area, provider.town, provider.county].filter(Boolean).join(', ')}
              </span>
            </p>
          )}

          {isTaxi && provider.vehicle_type && (
            <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-300">
              <span className="mr-1">{VEHICLE_TYPE_ICONS[provider.vehicle_type]}</span>
              {provider.vehicle_type}
              {regNumber && (
                <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 font-mono font-semibold uppercase text-gray-700 dark:bg-neutral-800 dark:text-gray-300">
                  {regNumber}
                </span>
              )}
            </p>
          )}
          {!isTaxi && regNumber && (
            <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-300">
              Reg.{' '}
              <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono font-semibold uppercase text-gray-700 dark:bg-neutral-800 dark:text-gray-300">
                {regNumber}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={`tel:${provider.phone_number}`}
          onClick={() => connectAndLog('call', provider, clientId)}
          className="btn bg-brand-600 text-white hover:bg-brand-700"
        >
          <Phone size={16} /> Call
        </a>
        <a
          href={`sms:${provider.phone_number}`}
          onClick={() => connectAndLog('text', provider, clientId)}
          className="btn bg-blue-600 text-white hover:bg-blue-700"
        >
          <MessageSquare size={16} /> Text
        </a>
      </div>
    </div>
  )
}
