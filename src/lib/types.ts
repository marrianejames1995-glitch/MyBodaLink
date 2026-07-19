export type UserRole = 'client' | 'rider' | 'taxi_driver'

export type VehicleType = 'Sedan' | 'SUV' | 'Van' | 'Pickup' | 'Taxi' | 'Minibus'

export type ConnectionAction = 'call' | 'text'

export interface Profile {
  id: string
  full_name: string
  phone_number: string
  role: UserRole
  profile_photo_url: string | null
  // Rider-only
  motorcycle_registration_number: string | null
  // Taxi-only
  vehicle_registration_number: string | null
  vehicle_type: VehicleType | null
  // Location (riders & taxi)
  county: string | null
  town: string | null
  area: string | null
  created_at: string
  updated_at: string
}

/** Shape used when creating a profile (server fills timestamps). */
export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>

/** Connection log of a client contacting a rider/taxi driver. */
export interface ConnectionHistoryItem {
  id: string
  client_id: string
  provider_id: string
  provider_role: UserRole
  provider_name: string
  provider_phone: string
  provider_photo_url: string | null
  vehicle_type: VehicleType | null
  vehicle_registration_number: string | null
  county: string | null
  town: string | null
  area: string | null
  action: ConnectionAction
  created_at: string
}

export interface RegistrationData {
  role: UserRole
  full_name: string
  phone_number: string
  password: string
  profile_photo?: File | null
  motorcycle_registration_number?: string
  vehicle_registration_number?: string
  vehicle_type?: VehicleType
  county?: string
  town?: string
  area?: string
}
