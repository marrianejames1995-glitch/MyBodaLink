import { useCallback, useEffect, useState } from 'react'
import {
  History as HistoryIcon,
  Trash2,
  Phone,
  MessageSquare,
  Search,
  MapPin,
  Bike,
  Car,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { PageHeader } from '@/components/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { connectAndLog } from '@/lib/connect'
import {
  listHistory,
  deleteHistoryItem,
  clearAllHistory,
} from '@/lib/api'
import { formatPhone, normalizePhone } from '@/lib/phone'
import { VEHICLE_TYPE_ICONS } from '@/lib/constants'
import type { ConnectionHistoryItem } from '@/lib/types'

export default function HistoryPage() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [items, setItems] = useState<ConnectionHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<ConnectionHistoryItem | null>(null)

  const load = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    try {
      const rows = await listHistory(profile.id, search)
      setItems(rows)
    } catch (e) {
      console.error(e)
      toast('Could not load history.', 'error')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, search])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

  async function handleDelete(item: ConnectionHistoryItem) {
    try {
      await deleteHistoryItem(item.id)
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      toast('History item deleted.', 'success')
    } catch {
      toast('Could not delete item.', 'error')
    } finally {
      setConfirmDelete(null)
    }
  }

  async function handleClearAll() {
    if (!profile) return
    try {
      await clearAllHistory(profile.id)
      setItems([])
      toast('All history cleared.', 'success')
    } catch {
      toast('Could not clear history.', 'error')
    } finally {
      setConfirmClear(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="History"
        subtitle="Your connection log"
        right={
          items.length > 0 ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Clear all
            </button>
          ) : undefined
        }
      />

      {items.length > 0 && (
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            className="input pl-10"
            placeholder="Search history…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="text-brand-600" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title={search ? 'No matches' : 'No connections yet'}
          description={
            search
              ? 'Try a different search term.'
              : 'When you call or text a rider or driver, it appears here automatically.'
          }
        />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="card p-4">
              <div className="flex items-start gap-3">
                <Avatar src={item.provider_photo_url} name={item.provider_name} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="truncate font-semibold text-gray-900 dark:text-gray-100">
                      {item.provider_name}
                    </h3>
                    <span
                      className={`flex items-center gap-0.5 text-[11px] font-medium ${
                        item.provider_role === 'taxi_driver'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {item.provider_role === 'taxi_driver' ? (
                        <Car size={11} />
                      ) : (
                        <Bike size={11} />
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-brand-700 dark:text-brand-400">
                    {formatPhone(item.provider_phone)}
                  </p>
                  {item.county && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin size={11} />
                      {[item.area, item.town, item.county].filter(Boolean).join(', ')}
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      {item.action === 'call' ? (
                        <>
                          <Phone size={11} /> Called
                        </>
                      ) : (
                        <>
                          <MessageSquare size={11} /> Texted
                        </>
                      )}
                    </span>
                    <span>•</span>
                    <span>{formatRelative(item.created_at)}</span>
                    {item.vehicle_type && (
                      <>
                        <span>•</span>
                        <span>{VEHICLE_TYPE_ICONS[item.vehicle_type]} {item.vehicle_type}</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setConfirmDelete(item)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Re-connect quick actions */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href={`tel:${normalizePhone(item.provider_phone)}`}
                  onClick={() =>
                    profile &&
                    connectAndLog(
                      'call',
                      {
                        id: item.provider_id,
                        full_name: item.provider_name,
                        phone_number: item.provider_phone,
                        role: item.provider_role,
                        profile_photo_url: item.provider_photo_url,
                        motorcycle_registration_number: null,
                        vehicle_registration_number: item.vehicle_registration_number,
                        vehicle_type: item.vehicle_type,
                        county: item.county,
                        town: item.town,
                        area: item.area,
                        created_at: '',
                        updated_at: '',
                      },
                      profile.id,
                    )
                  }
                  className="btn bg-brand-600 text-white hover:bg-brand-700"
                >
                  <Phone size={15} /> Call again
                </a>
                <a
                  href={`sms:${normalizePhone(item.provider_phone)}`}
                  onClick={() =>
                    profile &&
                    connectAndLog(
                      'text',
                      {
                        id: item.provider_id,
                        full_name: item.provider_name,
                        phone_number: item.provider_phone,
                        role: item.provider_role,
                        profile_photo_url: item.provider_photo_url,
                        motorcycle_registration_number: null,
                        vehicle_registration_number: item.vehicle_registration_number,
                        vehicle_type: item.vehicle_type,
                        county: item.county,
                        town: item.town,
                        area: item.area,
                        created_at: '',
                        updated_at: '',
                      },
                      profile.id,
                    )
                  }
                  className="btn bg-blue-600 text-white hover:bg-blue-700"
                >
                  <MessageSquare size={15} /> Text again
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Delete single */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete this entry?"
        footer={
          <>
            <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              className="btn-danger flex-1"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This will permanently remove the connection record with{' '}
          <strong>{confirmDelete?.provider_name}</strong>. This cannot be undone.
        </p>
      </Modal>

      {/* Clear all */}
      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear all history?"
        footer={
          <>
            <button onClick={() => setConfirmClear(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button onClick={handleClearAll} className="btn-danger flex-1">
              Clear all
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This permanently deletes all {items.length} connection records from your history.
          This cannot be undone.
        </p>
      </Modal>
    </div>
  )
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.max(0, now - then)
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}
