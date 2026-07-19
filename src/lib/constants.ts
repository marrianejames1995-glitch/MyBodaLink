import type { VehicleType } from '@/lib/types'

/** All 47 counties of Kenya. */
export const KENYA_COUNTIES: string[] = [
  'Nairobi',
  'Mombasa',
  'Kwale',
  'Kilifi',
  'Tana River',
  'Lamu',
  'Taita-Taveta',
  'Garissa',
  'Wajir',
  'Mandera',
  'Marsabit',
  'Isiolo',
  'Meru',
  'Tharaka-Nithi',
  'Embu',
  'Kitui',
  'Machakos',
  'Makueni',
  'Nyandarua',
  'Nyeri',
  'Kirinyaga',
  "Murang'a",
  'Kiambu',
  'Turkana',
  'West Pokot',
  'Samburu',
  'Trans Nzoia',
  'Uasin Gishu',
  'Elgeyo-Marakwet',
  'Nandi',
  'Baringo',
  'Laikipia',
  'Nakuru',
  'Narok',
  'Kajiado',
  'Kericho',
  'Bomet',
  'Kakamega',
  'Vihiga',
  'Bungoma',
  'Busia',
  'Siaya',
  'Kisumu',
  'Homa Bay',
  'Migori',
  'Kisii',
  'Nyamira',
]

/** Well-known Kenyan towns/areas to seed autocomplete before any providers
 *  register. Merged with live Supabase locations at runtime. */
export const KENYA_TOWNS: string[] = [
  'Westlands',
  'Ogembo',
  'Kisii',
  'Mombasa',
  'Nakuru',
  'Eldoret',
  'Rongai',
  'Nairobi',
  'Kisumu',
  'Thika',
  'Kitale',
  'Malindi',
  'Nyeri',
  'Machakos',
  'Kericho',
  'Kakamega',
  'Bungoma',
  'Garissa',
  'Meru',
  'Embu',
  'Voi',
  'Naivasha',
  'Limuru',
  'Kikuyu',
  'Ruaka',
  'Kitengela',
  'Kasarani',
  'Embakasi',
  'Karen',
  'Lavington',
  'Kilimani',
  'Ruiru',
  'Juja',
  'Athi River',
  'Wote',
  'Marsabit',
  'Isiolo',
  'Lodwar',
  'Kapenguria',
  'Bomet',
  'Nyamira',
  'Migori',
  'Homa Bay',
  'Siaya',
  'Vihiga',
]

/** Small emoji icons for each vehicle type (lightweight, no extra deps). */
export const VEHICLE_TYPES: { value: VehicleType; label: string; icon: string }[] = [
  { value: 'Sedan', label: 'Sedan', icon: '🚗' },
  { value: 'SUV', label: 'SUV', icon: '🚙' },
  { value: 'Van', label: 'Van', icon: '🚐' },
  { value: 'Pickup', label: 'Pickup', icon: '🛻' },
  { value: 'Taxi', label: 'Taxi', icon: '🚕' },
  { value: 'Minibus', label: 'Minibus', icon: '🚌' },
]

export const VEHICLE_TYPE_ICONS: Record<VehicleType, string> = VEHICLE_TYPES.reduce(
  (acc, v) => ({ ...acc, [v.value]: v.icon }),
  {} as Record<VehicleType, string>,
)

/** Key national emergency & helpline contacts for Kenya. */
export interface EmergencyContact {
  id: string
  name: string
  description: string
  phone: string
  category: 'Police' | 'Medical' | 'Fire' | 'General' | 'Helpline'
}

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: 'police-general', name: 'Police Emergency', description: 'General police emergency hotline.', phone: '999', category: 'Police' },
  { id: 'police-112', name: 'Kenya Police', description: 'Nationwide police assistance.', phone: '112', category: 'Police' },
  { id: 'police-tourist', name: 'Tourist Police Hotline', description: 'Toll-free help for travellers.', phone: '0800722222', category: 'Police' },
  { id: 'ambulance-redcross', name: 'Kenya Red Cross Ambulance', description: 'Emergency medical services & rescue.', phone: '1199', category: 'Medical' },
  { id: 'ambulance-stjohn', name: 'St John Ambulance', description: 'First aid & ambulance services.', phone: '0703032700', category: 'Medical' },
  { id: 'amref-flying', name: 'AMREF Flying Doctors', description: 'Air evacuation across the region.', phone: '+254711226996', category: 'Medical' },
  { id: 'fire-rescue', name: 'Fire & Rescue', description: 'Nairobi fire brigade & rescue.', phone: '0202222181', category: 'Fire' },
  { id: 'gbv', name: 'Gender-Based Violence Hotline', description: 'National toll-free GBV support.', phone: '1195', category: 'Helpline' },
  { id: 'childline', name: 'Childline Kenya', description: 'Child protection, 24/7 toll-free.', phone: '116', category: 'Helpline' },
  { id: 'disaster', name: 'National Disaster Operations Centre', description: 'Disaster response & coordination.', phone: '0202390000', category: 'General' },
]

export const EMERGENCY_CATEGORIES = [
  'Police',
  'Medical',
  'Fire',
  'Helpline',
  'General',
] as const

/** LocalStorage keys. */
export const STORAGE_KEYS = {
  theme: 'mybodalink-theme',
  lastRole: 'mybodalink-last-role',
} as const

export const APP_NAME = 'MyBodaLink'
export const APP_VERSION = '1.0.0'
export const SUPPORT_EMAIL = 'support@mybodalink.app'
export const SUPPORT_PHONE = '+254700000000'
