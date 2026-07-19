import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Siren, Bike, Car, MapPin, ChevronRight, History } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/lib/types'

export function ClientHome() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [location, setLocation] = useState('')

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  // One smart search: jump to the Search page with the location; results
  // (with autocomplete) load there instantly.
  function go(role: UserRole | 'all') {
    const params = new URLSearchParams()
    if (location.trim()) params.set('loc', location.trim())
    if (role !== 'all') params.set('role', role)
    navigate(`/app/search?${params.toString()}`)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    go('all')
  }

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back,</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Hi, {firstName} 👋
        </h1>
      </div>

      {/* Smart search bar — single input, jumps to the Search page where
          autocomplete + results live. */}
      <form onSubmit={submit} className="card p-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
          <MapPin size={13} className="text-brand-600" /> Find riders & taxi drivers near you
        </p>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              className="input pl-10 pr-2 py-3"
              placeholder="Type a location — e.g. Nairobi, Westlands, Ogembo, Kisii…"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              aria-label="Search by location"
            />
          </div>
          <button
            type="submit"
            aria-label="Search"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm transition hover:bg-brand-700 active:scale-95"
          >
            <Search size={20} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => navigate('/app/search')}
          className="mt-2 flex w-full items-center justify-center gap-1 text-xs font-medium text-gray-500 hover:text-brand-600 dark:text-gray-400"
        >
          <Search size={12} /> Advanced search with autocomplete
        </button>
      </form>

      {/* Quick type filters */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => go('rider')}
          className="card flex items-center gap-3 p-4 text-left transition hover:border-amber-400"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <Bike size={22} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">Boda Rider</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">2-wheel quick trips</p>
          </div>
        </button>
        <button
          onClick={() => go('taxi_driver')}
          className="card flex items-center gap-3 p-4 text-left transition hover:border-blue-400"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Car size={22} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">Taxi Driver</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">4-wheel comfort</p>
          </div>
        </button>
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/app/history')}
          className="card flex items-center gap-3 p-4 text-left transition hover:border-brand-400"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-300">
            <History size={20} />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">History</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Recent connections</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/app/emergency')}
          className="card flex items-center gap-3 p-4 text-left transition hover:border-red-400"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <Siren size={20} />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Emergency</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Quick SOS</p>
          </div>
        </button>
      </div>

      {/* Tip */}
      <div className="card flex items-start gap-3 bg-brand-50 p-4 dark:bg-brand-900/20">
        <MapPin size={20} className="mt-0.5 shrink-0 text-brand-600" />
        <div>
          <p className="text-sm font-medium text-brand-900 dark:text-brand-200">
            Tip: tap Call or Text to instantly reach a rider or driver.
          </p>
          <p className="mt-0.5 text-xs text-brand-700/80 dark:text-brand-300/80">
            Every connection is saved to your History automatically.
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate('/app/search')}
        className="flex w-full items-center justify-center gap-1 text-sm font-medium text-brand-600 hover:underline"
      >
        Advanced search <ChevronRight size={16} />
      </button>
    </div>
  )
}
