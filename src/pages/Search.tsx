import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, Bike, Car, MapPin, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { ProviderCard } from '@/components/ProviderCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader } from '@/components/PageHeader'
import {
  fetchRegisteredLocations,
  searchProvidersByLocation,
  subscribeToProviders,
} from '@/lib/api'
import { KENYA_COUNTIES, KENYA_TOWNS } from '@/lib/constants'
import type { Profile, UserRole } from '@/lib/types'

export default function SearchPage() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [params, setParams] = useSearchParams()

  // Seed from URL (homepage quick-search, deep links).
  const [location, setLocation] = useState(params.get('loc') || '')
  const [role, setRole] = useState<UserRole | 'all'>(
    (params.get('role') as UserRole | 'all') || 'all',
  )

  const [results, setResults] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Autocomplete: seeded with counties + well-known towns, then merged with
  // live registered locations from Supabase. Refreshes in real time.
  const seedLocations = useMemo(() => {
    const set = new Set<string>([...KENYA_COUNTIES, ...KENYA_TOWNS])
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [])
  const [registeredLocations, setRegisteredLocations] = useState<string[]>([])
  const allLocations = useMemo(() => {
    const set = new Set<string>([...seedLocations, ...registeredLocations])
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [seedLocations, registeredLocations])

  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load registered locations once, then keep them fresh via realtime.
  useEffect(() => {
    let mounted = true
    const refresh = () => {
      fetchRegisteredLocations()
        .then((locs) => mounted && setRegisteredLocations(locs))
        .catch((e) => console.warn('[MyBodaLink] location fetch failed', e))
    }
    refresh()
    const unsubscribe = subscribeToProviders(refresh)
    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  // Close the suggestion dropdown on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Filtered suggestions for what's currently typed (case-insensitive, partial).
  const suggestions = useMemo(() => {
    const term = location.trim().toLowerCase()
    if (!term) return []
    return allLocations
      .filter((l) => l.toLowerCase().includes(term))
      .slice(0, 8)
  }, [location, allLocations])

  async function runSearch(text: string, currentRole: UserRole | 'all') {
    const term = text.trim()
    if (!term) return
    setLoading(true)
    setHasSearched(true)
    // reflect in URL (deep-linkable + refresh-safe)
    const p = new URLSearchParams()
    p.set('loc', term)
    if (currentRole !== 'all') p.set('role', currentRole)
    setParams(p, { replace: true })

    try {
      const rows = await searchProvidersByLocation(term, currentRole)
      setResults(rows)
    } catch (e) {
      console.error(e)
      toast('Search failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Initial run if a location came from the URL (homepage quick-search).
  const didInitial = useRef(false)
  useEffect(() => {
    if (didInitial.current) return
    didInitial.current = true
    if (location.trim()) runSearch(location, role)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
      const chosen = suggestions[activeSuggestion]
      setLocation(chosen)
      setShowSuggestions(false)
      setActiveSuggestion(-1)
      runSearch(chosen, role)
    } else {
      setShowSuggestions(false)
      runSearch(location, role)
    }
  }

  function pickSuggestion(s: string) {
    setLocation(s)
    setShowSuggestions(false)
    setActiveSuggestion(-1)
    runSearch(s, role)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') submit(e)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSuggestion((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSuggestion((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      submit(e)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setActiveSuggestion(-1)
    }
  }

  function clearAll() {
    setLocation('')
    setRole('all')
    setResults([])
    setHasSearched(false)
    setActiveSuggestion(-1)
    setParams({}, { replace: true })
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Search" subtitle="Find riders & taxi drivers by location" />

      {/* Smart search bar with autocomplete */}
      <div className="relative" ref={containerRef}>
        <form onSubmit={submit}>
          <div className="relative">
            <SearchIcon
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              className="input pl-10 pr-10 py-3"
              placeholder="Type a location — e.g. Nairobi, Westlands, Ogembo, Kisii…"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value)
                setShowSuggestions(true)
                setActiveSuggestion(-1)
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              aria-label="Search by location"
            />
            {location && (
              <button
                type="button"
                onClick={() => {
                  setLocation('')
                  setResults([])
                  setHasSearched(false)
                  setShowSuggestions(false)
                }}
                aria-label="Clear"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ×
              </button>
            )}
          </div>
        </form>

        {/* Autocomplete dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
            {suggestions.map((s, i) => (
              <li key={s}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveSuggestion(i)}
                  onClick={() => pickSuggestion(s)}
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition ${
                    i === activeSuggestion
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <MapPin size={14} className="shrink-0 text-brand-500" />
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Role chips */}
      <div className="flex gap-2">
        <RoleChip active={role === 'all'} onClick={() => setRole('all')}>
          All
        </RoleChip>
        <RoleChip active={role === 'rider'} onClick={() => setRole('rider')}>
          <Bike size={14} /> Riders
        </RoleChip>
        <RoleChip active={role === 'taxi_driver'} onClick={() => setRole('taxi_driver')}>
          <Car size={14} /> Taxis
        </RoleChip>
      </div>

      {/* Active search summary + clear */}
      {hasSearched && location && (
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <MapPin size={13} className="text-brand-500" />
            Showing {role === 'all' ? 'all' : role === 'rider' ? 'riders' : 'taxis'} near{' '}
            <span className="font-medium text-gray-700 dark:text-gray-200">{location}</span>
          </p>
          <button onClick={clearAll} className="text-xs font-medium text-gray-500 hover:text-red-600">
            Clear
          </button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="text-brand-600" />
        </div>
      ) : results.length > 0 ? (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {results.length} {results.length === 1 ? 'result' : 'results'} found
          </p>
          <div className="space-y-3">
            {results.map((p) => (
              <ProviderCard key={p.id} provider={p} clientId={profile?.id} />
            ))}
          </div>
        </>
      ) : hasSearched ? (
        <EmptyState
          icon={SearchIcon}
          title="No Riders or Taxi Drivers are currently registered in this location."
          description="Try a nearby town, a broader county name, or check the spelling."
        />
      ) : (
        <EmptyState
          icon={SearchIcon}
          title="Search for a ride"
          description="Type any location — county, town or area. Results appear instantly as you search."
        />
      )}

      {/* Live-update indicator */}
      <p className="flex items-center justify-center gap-1.5 pt-2 text-center text-[11px] text-gray-400 dark:text-gray-500">
        <Loader2 size={11} className="animate-spin" />
        Auto-updates as new riders & taxi drivers register
      </p>
    </div>
  )
}

function RoleChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? 'bg-brand-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-neutral-800 dark:text-gray-300'
      }`}
    >
      {children}
    </button>
  )
}
