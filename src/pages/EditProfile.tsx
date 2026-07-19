import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, User, MapPin, Bike, Car, Phone, Save, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { PageHeader } from '@/components/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Spinner } from '@/components/ui/Spinner'
import { supabase } from '@/lib/supabase'
import { uploadProfilePhoto, updateProfile } from '@/lib/api'
import { phoneToEmail, isValidKenyanPhone } from '@/lib/phone'
import { KENYA_COUNTIES, VEHICLE_TYPES } from '@/lib/constants'
import type { VehicleType } from '@/lib/types'

export default function EditProfile() {
  const { profile, refreshProfile } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone_number ?? '')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    profile?.profile_photo_url ?? null,
  )

  const [motoReg, setMotoReg] = useState(profile?.motorcycle_registration_number ?? '')
  const [vehicleReg, setVehicleReg] = useState(profile?.vehicle_registration_number ?? '')
  const [vehicleType, setVehicleType] = useState<VehicleType | ''>(
    profile?.vehicle_type ?? '',
  )
  const [county, setCounty] = useState(profile?.county ?? '')
  const [town, setTown] = useState(profile?.town ?? '')
  const [area, setArea] = useState(profile?.area ?? '')

  const [busy, setBusy] = useState(false)

  if (!profile) return null
  const isProvider = profile.role !== 'client'

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) return toast('Choose an image file.', 'error')
    if (f.size > 5 * 1024 * 1024) return toast('Image must be under 5 MB.', 'error')
    setPhoto(f)
    setPhotoPreview(URL.createObjectURL(f))
  }

  async function handleSave() {
    if (!profile) return
    if (fullName.trim().length < 2) return toast('Enter your full name.', 'error')
    if (!isValidKenyanPhone(phone))
      return toast('Enter a valid Kenyan phone number.', 'error')
    if (isProvider) {
      if (!county) return toast('Select your county.', 'error')
      if (!town.trim()) return toast('Enter your town.', 'error')
      if (!area.trim()) return toast('Enter your area.', 'error')
      if (profile.role === 'rider' && !motoReg.trim())
        return toast('Enter your motorcycle registration number.', 'error')
      if (profile.role === 'taxi_driver') {
        if (!vehicleType) return toast('Select your vehicle type.', 'error')
        if (!vehicleReg.trim()) return toast('Enter your vehicle registration number.', 'error')
      }
    }

    setBusy(true)
    try {
      let photoUrl = profile.profile_photo_url
      if (photo) {
        const { url } = await uploadProfilePhoto(photo, profile.id)
        photoUrl = url
      }

      const phoneChanged = phone !== profile.phone_number

      await updateProfile(profile.id, {
        full_name: fullName.trim(),
        phone_number: phone,
        profile_photo_url: photoUrl,
        motorcycle_registration_number:
          profile.role === 'rider' ? motoReg.trim().toUpperCase() : null,
        vehicle_registration_number:
          profile.role === 'taxi_driver' ? vehicleReg.trim().toUpperCase() : null,
        vehicle_type: (vehicleType || null) as VehicleType | null,
        county: isProvider ? county : null,
        town: isProvider ? town.trim() : null,
        area: isProvider ? area.trim() : null,
      })

      // If phone changed, also update the underlying auth email so login stays
      // in sync. Requires "Confirm email changes" to be OFF for instant change.
      if (phoneChanged) {
        const { error: authErr } = await supabase.auth.updateUser({
          email: phoneToEmail(phone),
        })
        if (authErr) {
          toast('Profile saved, but login phone could not be updated.', 'error')
        } else {
          toast('Profile updated. Use your new phone number to log in.', 'success')
        }
      } else {
        toast('Profile updated.', 'success')
      }

      await refreshProfile()
      navigate('/app/profile')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not save profile.'
      toast(msg, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Edit Profile" back />

      {/* Photo */}
      <div className="flex flex-col items-center">
        <button type="button" onClick={() => fileRef.current?.click()} className="relative">
          <Avatar src={photoPreview} name={fullName || 'You'} size={88} />
          <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow ring-2 ring-white dark:ring-neutral-900">
            <Camera size={16} />
          </span>
        </button>
        {photo && (
          <button
            type="button"
            onClick={() => {
              setPhoto(null)
              setPhotoPreview(profile.profile_photo_url ?? null)
            }}
            className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-600"
          >
            <X size={12} /> Remove new photo
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
        <p className="mt-1 text-xs text-gray-500">Tap to change profile photo</p>
      </div>

      <div className="card space-y-4 p-4">
        <Field label="Full Name" icon={<User size={18} />}>
          <input
            className="input pl-10"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </Field>

        <Field label="Phone Number (your login)" icon={<Phone size={18} />}>
          <input
            type="tel"
            inputMode="tel"
            className="input pl-10"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>
        <p className="-mt-2 pl-1 text-xs text-gray-400">
          Changing this updates your login number.
        </p>

        {profile.role === 'rider' && (
          <Field label="Motorcycle Registration Number" icon={<Bike size={18} />}>
            <input
              className="input pl-10 uppercase"
              value={motoReg}
              onChange={(e) => setMotoReg(e.target.value)}
            />
          </Field>
        )}

        {profile.role === 'taxi_driver' && (
          <>
            <div>
              <label className="label">Vehicle Type</label>
              <div className="grid grid-cols-3 gap-2">
                {VEHICLE_TYPES.map((v) => (
                  <button
                    type="button"
                    key={v.value}
                    onClick={() => setVehicleType(v.value)}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2.5 text-xs font-medium transition ${
                      vehicleType === v.value
                        ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                        : 'border-gray-200 text-gray-600 dark:border-neutral-700 dark:text-gray-400'
                    }`}
                  >
                    <span className="text-2xl">{v.icon}</span>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            <Field label="Vehicle Registration Number" icon={<Car size={18} />}>
              <input
                className="input pl-10 uppercase"
                value={vehicleReg}
                onChange={(e) => setVehicleReg(e.target.value)}
              />
            </Field>
          </>
        )}

        {isProvider && (
          <div className="space-y-3 rounded-xl border border-gray-200 p-3 dark:border-neutral-800">
            <p className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <MapPin size={15} className="text-brand-600" /> Operating area
            </p>
            <div>
              <label className="label">County</label>
              <select className="input" value={county} onChange={(e) => setCounty(e.target.value)}>
                <option value="">Select county…</option>
                {KENYA_COUNTIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Town</label>
                <input className="input" value={town} onChange={(e) => setTown(e.target.value)} />
              </div>
              <div>
                <label className="label">Area</label>
                <input className="input" value={area} onChange={(e) => setArea(e.target.value)} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary flex-1">
          Cancel
        </button>
        <button onClick={handleSave} disabled={busy} className="btn-primary flex-1">
          {busy ? <Spinner /> : <><Save size={16} /> Save</>}
        </button>
      </div>
    </div>
  )
}

function Field({
  label,
  icon,
  children,
}: {
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        {children}
      </div>
    </div>
  )
}
