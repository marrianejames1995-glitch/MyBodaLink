import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { InstallAppButton } from '@/components/InstallAppButton'
import { AppBackground } from '@/components/AppBackground'
import { Phone, Shield, MapPin, Bike, Car, User, ChevronRight } from 'lucide-react'
import type { UserRole } from '@/lib/types'

const roleCards: {
  role: UserRole
  title: string
  desc: string
  icon: typeof Bike
  accent: string
}[] = [
  {
    role: 'client',
    title: 'I need a ride',
    desc: 'Find riders & taxi drivers near you',
    icon: User,
    accent: 'from-brand-500 to-brand-700',
  },
  {
    role: 'rider',
    title: "I'm a Boda Rider",
    desc: 'Get discovered by clients',
    icon: Bike,
    accent: 'from-amber-500 to-orange-600',
  },
  {
    role: 'taxi_driver',
    title: "I'm a Taxi Driver",
    desc: 'Connect with passengers',
    icon: Car,
    accent: 'from-blue-500 to-indigo-600',
  },
]

export default function Landing() {
  const { session, profile } = useAuth()
  const navigate = useNavigate()

  if (session && profile) {
    navigate('/app/home', { replace: true })
  }

  return (
    <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col px-5 pb-10 pt-10 safe-top">
      {/* Themed background (shared with logged-in dashboards) */}
      <AppBackground />

      {/* Install app — top right */}
      <div className="absolute right-4 top-4 safe-top">
        <InstallAppButton compact />
      </div>

      {/* Credit — top left */}
      <div className="absolute left-4 top-4 safe-top">
        <p className="text-[10px] leading-tight text-gray-400 dark:text-gray-500">
          Built by
          <br />
          <span className="font-medium text-gray-500 dark:text-gray-400">
            John @ BinaryBrothers
          </span>
        </p>
      </div>

      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
          <Bike size={40} />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          My<span className="text-brand-600">Boda</span>Link
        </h1>
        <p className="mt-3 max-w-sm text-base text-gray-600 dark:text-gray-400">
          Connect instantly with trusted riders and taxi drivers across Kenya. Search by
          county, town and area — then call or text in one tap.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="chip">
            <Shield size={12} /> Verified profiles
          </span>
          <span className="chip">
            <MapPin size={12} /> 47 counties
          </span>
          <span className="chip">
            <Phone size={12} /> One-tap call
          </span>
        </div>
      </div>

      {/* Role selection */}
      <div className="space-y-3">
        <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
          Get started — choose your account type
        </p>
        <div className="space-y-2.5">
          {roleCards.map(({ role, title, desc, icon: Icon, accent }) => (
            <Link
              key={role}
              to={`/register/${role}`}
              className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-brand-400 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white ${accent}`}
              >
                <Icon size={24} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
              <ChevronRight
                size={20}
                className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-brand-600"
              />
            </Link>
          ))}
        </div>

        <p className="pt-3 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>

        <InstallAppButton />
      </div>
    </div>
  )
}
