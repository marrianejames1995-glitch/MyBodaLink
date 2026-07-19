import { Link } from 'react-router-dom'
import {
  Bike,
  Shield,
  MapPin,
  Phone,
  Heart,
  Lock,
  Zap,
  Globe,
} from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { APP_NAME, APP_VERSION } from '@/lib/constants'

const features = [
  { icon: MapPin, title: 'Location search', desc: 'Find riders and taxi drivers by county, town and area across all 47 Kenyan counties.' },
  { icon: Phone, title: 'Instant contact', desc: 'One tap to call or text — opens your phone dialer and SMS app immediately.' },
  { icon: Shield, title: 'Verified profiles', desc: 'Every rider and driver registers with their details so you know who you are reaching.' },
  { icon: Zap, title: 'History tracking', desc: 'Every connection is saved automatically so you can reach trusted contacts again.' },
  { icon: Lock, title: 'Secure & private', desc: 'Your data is encrypted and stored securely. You can delete your account anytime.' },
  { icon: Globe, title: 'Works offline-ready', desc: 'Installable as an app on your phone for quick access from your home screen.' },
]

export default function About() {
  return (
    <div className="space-y-5">
      <PageHeader title="About" back />

      {/* Hero */}
      <div className="card overflow-hidden text-center">
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 px-6 py-8 text-white">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <Bike size={32} />
          </div>
          <h1 className="text-2xl font-extrabold">
            My<span className="opacity-90">Boda</span>Link
          </h1>
          <p className="mt-1 text-sm opacity-90">Version {APP_VERSION}</p>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {APP_NAME} connects people across Kenya with trusted boda boda riders and taxi
            drivers. Search by location, view profiles, and connect in a single tap.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3">
        {features.map((f) => (
          <div key={f.title} className="card flex items-start gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
              <f.icon size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card flex items-center justify-center gap-1.5 p-4 text-sm text-gray-500 dark:text-gray-400">
        Made with <Heart size={14} className="text-red-500" /> in Kenya
      </div>

      <p className="text-center text-xs text-gray-400">
        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </p>

      <div className="flex justify-center">
        <Link to="/app/contact" className="text-sm font-medium text-brand-600 hover:underline">
          Need help? Contact support →
        </Link>
      </div>
    </div>
  )
}
