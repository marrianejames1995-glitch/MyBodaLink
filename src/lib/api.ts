import { supabase } from '@/lib/supabase'
import type {
  ConnectionAction,
  ConnectionHistoryItem,
  Profile,
  ProfileInsert,
  UserRole,
  VehicleType,
} from '@/lib/types'

const PHOTOS_BUCKET = 'profile_photos'

/* ------------------------------------------------------------------ */
/* Profile photos                                                      */
/* ------------------------------------------------------------------ */

export async function uploadProfilePhoto(
  file: File,
  userId: string,
): Promise<{ url: string | null; error: Error | null }> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${userId}/avatar-${Date.now()}.${ext}`
  const { error: upErr } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(path, file, { upsert: true, cacheControl: '3600' })
  if (upErr) return { url: null, error: upErr }

  const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path)
  // Append a cache-busting param so updated photos refresh.
  return { url: `${data.publicUrl}?v=${Date.now()}`, error: null }
}

/* ------------------------------------------------------------------ */
/* Profiles                                                            */
/* ------------------------------------------------------------------ */

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return (data as Profile) ?? null
}

export async function createProfile(
  profile: ProfileInsert,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single()
  if (error) throw error
  return data as Profile
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data as Profile
}

export interface SearchFilters {
  role?: UserRole | 'all'
  county?: string
  town?: string
  area?: string
  query?: string
}

/** Search riders/taxi drivers by location and optional name/plate query. */
export async function searchProviders(
  filters: SearchFilters,
): Promise<Profile[]> {
  let query = supabase
    .from('profiles')
    .select('*')
    .in('role', ['rider', 'taxi_driver'])

  if (filters.county) query = query.eq('county', filters.county)
  if (filters.town) query = query.ilike('town', `%${filters.town}%`)
  if (filters.area) query = query.ilike('area', `%${filters.area}%`)
  if (filters.role && filters.role !== 'all') {
    query = query.eq('role', filters.role)
  }
  if (filters.query) {
    query = query.or(
      `full_name.ilike.%${filters.query}%,vehicle_registration_number.ilike.%${filters.query}%,motorcycle_registration_number.ilike.%${filters.query}%`,
    )
  }

  query = query.order('updated_at', { ascending: false }).limit(100)
  const { data, error } = await query
  if (error) throw error
  return (data as Profile[]) ?? []
}

/* ------------------------------------------------------------------ */
/* Location search (smart single-bar)                                  */
/* ------------------------------------------------------------------ */

/**
 * Fetch every distinct registered location (county + town + area) across all
 * riders/taxi drivers. Used for the autocomplete dropdown. Case is normalised
 * client-side so duplicates merge regardless of capitalisation. Auto-updates
 * via realtime subscriptions (see subscribeToProviders).
 */
export async function fetchRegisteredLocations(): Promise<string[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('county, town, area')
    .in('role', ['rider', 'taxi_driver'])

  if (error) throw error

  const set = new Set<string>()
  for (const row of data ?? []) {
    for (const field of [row.county, row.town, row.area]) {
      const v = (field ?? '').toString().trim()
      if (v) set.add(v.charAt(0).toUpperCase() + v.slice(1).toLowerCase())
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

/**
 * Smart location search: matches the text against County, Town OR Area at the
 * same time (case-insensitive, partial). Returns all riders + taxi drivers in
 * that location, newest first. Pass an optional role filter to narrow.
 */
export async function searchProvidersByLocation(
  text: string,
  role?: UserRole | 'all',
): Promise<Profile[]> {
  const term = text.trim()
  if (!term) return []

  // Supabase .or() with ilike gives us cross-field, case-insensitive, partial
  // matching in a single round-trip.
  const like = `%${term}%`
  let query = supabase
    .from('profiles')
    .select('*')
    .in('role', ['rider', 'taxi_driver'])
    .or(`county.ilike.${like},town.ilike.${like},area.ilike.${like}`)

  if (role && role !== 'all') {
    query = query.eq('role', role)
  }

  query = query.order('updated_at', { ascending: false }).limit(100)
  const { data, error } = await query
  if (error) throw error
  return (data as Profile[]) ?? []
}

/**
 * Subscribe to any change in the profiles table (new riders/taxis registering,
 * profile updates). Returns an unsubscribe function. The client refreshes its
 * location list + results so new providers appear automatically.
 */
export function subscribeToProviders(onChange: () => void): () => void {
  const channel = supabase
    .channel('profiles-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'profiles' },
      () => onChange(),
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}

/* ------------------------------------------------------------------ */
/* Connection history                                                  */
/* ------------------------------------------------------------------ */

export async function addHistoryEntry(params: {
  clientId: string
  provider: Profile
  action: ConnectionAction
}): Promise<void> {
  // De-duplicate: if the same client<->provider+action exists in the last hour,
  // just bump it instead of spamming rows.
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { data: existing } = await supabase
    .from('connection_history')
    .select('id')
    .eq('client_id', params.clientId)
    .eq('provider_id', params.provider.id)
    .eq('action', params.action)
    .gte('created_at', oneHourAgo)
    .maybeSingle()

  const payload = {
    client_id: params.clientId,
    provider_id: params.provider.id,
    provider_role: params.provider.role,
    provider_name: params.provider.full_name,
    provider_phone: params.provider.phone_number,
    provider_photo_url: params.provider.profile_photo_url,
    vehicle_type: (params.provider.vehicle_type as VehicleType | null) ?? null,
    vehicle_registration_number: params.provider.vehicle_registration_number,
    county: params.provider.county,
    town: params.provider.town,
    area: params.provider.area,
    action: params.action,
  }

  if (existing?.id) {
    await supabase
      .from('connection_history')
      .update({ created_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    await supabase.from('connection_history').insert(payload)
  }
}

export async function listHistory(
  clientId: string,
  searchTerm?: string,
): Promise<ConnectionHistoryItem[]> {
  let query = supabase
    .from('connection_history')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(500)

  if (searchTerm) {
    query = query.or(
      `provider_name.ilike.%${searchTerm}%,provider_phone.ilike.%${searchTerm}%,town.ilike.%${searchTerm}%,area.ilike.%${searchTerm}%`,
    )
  }
  const { data, error } = await query
  if (error) throw error
  return (data as ConnectionHistoryItem[]) ?? []
}

export async function deleteHistoryItem(id: string): Promise<void> {
  const { error } = await supabase.from('connection_history').delete().eq('id', id)
  if (error) throw error
}

export async function clearAllHistory(clientId: string): Promise<void> {
  const { error } = await supabase
    .from('connection_history')
    .delete()
    .eq('client_id', clientId)
  if (error) throw error
}

/* ------------------------------------------------------------------ */
/* Account deletion                                                    */
/* ------------------------------------------------------------------ */

export async function deleteAccount(): Promise<void> {
  // Uses a Postgres RPC (see schema.sql) so the user can delete their own
  // auth.users row, which cascades to profiles & history.
  const { error } = await supabase.rpc('delete_own_account')
  if (error) throw error
}
