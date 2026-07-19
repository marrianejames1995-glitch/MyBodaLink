import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  User,
  Bike,
  Car,
  Camera,
  MapPin,
  X,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { isSupabaseConfigured } from '@/lib/supabase'
import { isValidKenyanPhone } from '@/lib/phone'
import { uploadProfilePhoto, createProfile } from '@/lib/api'
import { KENYA_COUNTIES, VEHICLE_TYPES, APP_NAME } from '@/lib/constants'
import { Spinner } from '@/components/ui/Spinner'
import { Avatar } from '@/components/ui/Avatar'
import { SupabaseNotConfigured } from '@/components/SupabaseNotConfigured'
import type { UserRole, VehicleType } from '@/lib/types'

const roleMeta: Record<
  UserRole,
  { label: string; icon: typeof Bike; color: string }
> = {
  client: { label: 'Client', icon: User, color: 'text-brand-600' },
  rider: { label: 'Boda Rider', icon: Bike, color: 'text-amber-600' },
  taxi_driver: { label: 'Taxi Driver', icon: Car, color: 'text-blue-600' },
}

export default function Register() {
  const { role } = useParams<{ role: string }>()
  const userRole = (role as UserRole) || 'client'
  const meta = roleMeta[userRole] ?? roleMeta.client
  const { signUp } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Rider
  const [motoReg, setMotoReg] = useState('')
  // Taxi
  const [vehicleReg, setVehicleReg] = useState('')
  const [vehicleType, setVehicleType] = useState<VehicleType | ''>('')

  // Location (riders & taxi)
  const [county, setCounty] = useState('')
  const [town, setTown] = useState('')
  const [area, setArea] = useState('')

  const [busy, setBusy] = useState(false)

  const isProvider = userRole === 'rider' || userRole === 'taxi_driver'

  if (!isSupabaseConfigured) return <SupabaseNotConfigured />

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) {
      toast('Please choose an image file.', 'error')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      toast('Image must be under 5 MB.', 'error')
      return
    }
    setPhoto(f)
    setPhotoPreview(URL.createObjectURL(f))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (fullName.trim().length < 2) return toast('Enter your full name.', 'error')
    if (!isValidKenyanPhone(phone))
      return toast('Enter a valid Kenyan phone number.', 'error')
    if (password.length < 6)
      return toast('Password must be at least 6 characters.', 'error')
    if (password !== confirm) return toast('Passwords do not match.', 'error')

    if (isProvider) {
      if (!county) return toast('Select your county.', 'error')
      if (!town.trim()) return toast('Enter your town.', 'error')
      if (!area.trim()) return toast('Enter your area.', 'error')
      if (userRole === 'rider' && !motoReg.trim())
        return toast('Enter your motorcycle registration number.', 'error')
      if (userRole === 'taxi_driver') {
        if (!vehicleType) return toast('Select your vehicle type.', 'error')
        if (!vehicleReg.trim())
          return toast('Enter your vehicle registration number.', 'error')
      }
    }

    setBusy(true)
    try {
      const { userId } = await signUp({
        role: userRole,
        phone,
        password,
        fullName: fullName.trim(),
      })

      let photoUrl: string | null = null
      if (photo) {
        const { url } = await uploadProfilePhoto(photo, userId)
        photoUrl = url
      }

      await createProfile({
        id: userId,
        full_name: fullName.trim(),
        phone_number: phone,
        role: userRole,
        profile_photo_url: photoUrl,
        motorcycle_registration_number: userRole === 'rider' ? motoReg.trim() : null,
        vehicle_registration_number:
          userRole === 'taxi_driver' ? vehicleReg.trim() : null,
        vehicle_type: (vehicleType || null) as VehicleType | null,
        county: isProvider ? county : null,
        town: isProvider ? town.trim() : null,
        area: isProvider ? area.trim() : null,
      })

      toast('Account created. Welcome to MyBodaLink!', 'success')
      navigate('/app/home', { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed.'
      toast(friendlyAuthError(msg), 'error')
    } finally {
      setBusy(false)
    }
  }

  const Icon = meta.icon

  return (
    <div className="mx-auto min-h-screen max-w-md px-5 py-6 safe-top">
      <Link to="/" className="mb-5 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400">
        ← Back
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
          <Icon size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Create {meta.label} account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Join {APP_NAME} in seconds.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Profile photo (providers) */}
        {isProvider && (
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative"
            >
              <Avatar src={photoPreview} name={fullName || meta.label} size={88} />
              <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow ring-2 ring-white dark:ring-neutral-900">
                <Camera size={16} />
              </span>
            </button>
            {photo && (
              <button
                type="button"
                onClick={() => {
                  setPhoto(null)
                  setPhotoPreview(null)
                }}
                className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-600"
              >
                <X size={12} /> Remove photo
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickPhoto}
            />
            <p className="mt-1 text-xs text-gray-500">Profile photo (optional)</p>
          </div>
        )}

        <Field label="Full Name" icon={<User size={18} />}>
          <input
            className="input pl-10"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </Field>

        <Field label="Phone Number" icon={<Phone size={18} />}>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="input pl-10"
            placeholder="0712 345 678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </Field>

        <Field label="Password" icon={<Lock size={18} />}>
          <input
            type={showPwd ? 'text' : 'password'}
            autoComplete="new-password"
            className="input pl-10 pr-10"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPwd ? 'Hide password' : 'Show password'}
          >
            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </Field>

        <Field label="Confirm Password" icon={<Lock size={18} />}>
          <input
            type={showPwd ? 'text' : 'password'}
            autoComplete="new-password"
            className="input pl-10"
            placeholder="Re-enter password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </Field>

        {/* Rider-only */}
        {userRole === 'rider' && (
          <Field label="Motorcycle Registration Number" icon={<Bike size={18} />}>
            <input
              className="input pl-10 uppercase"
              placeholder="KMEA 123A"
              value={motoReg}
              onChange={(e) => setMotoReg(e.target.value)}
              required
            />
          </Field>
        )}

        {/* Taxi-only */}
        {userRole === 'taxi_driver' && (
          <>
            <div>
              <label className="label">Vehicle Type</label>
              <div className="grid grid-cols-3 gap-2">
                {VEHICLE_TYPES.map((v) => {
                  const active = vehicleType === v.value
                  return (
                    <button
                      type="button"
                      key={v.value}
                      onClick={() => setVehicleType(v.value)}
                      className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2.5 text-xs font-medium transition ${
                        active
                          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-neutral-700 dark:text-gray-400'
                      }`}
                    >
                      <span className="text-2xl">{v.icon}</span>
                      {v.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <Field label="Vehicle Registration Number" icon={<Car size={18} />}>
              <input
                className="input pl-10 uppercase"
                placeholder="KDA 123A"
                value={vehicleReg}
                onChange={(e) => setVehicleReg(e.target.value)}
                required
              />
            </Field>
          </>
        )}

        {/* Location (providers) */}
        {isProvider && (
          <div className="space-y-4 rounded-2xl border border-gray-200 p-4 dark:border-neutral-800">
            <p className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <MapPin size={16} className="text-brand-600" /> Your operating area
            </p>
            <div>
              <label className="label">County</label>
              <select
                className="input"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                required
              >
                <option value="">Select county…</option>
                {KENYA_COUNTIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <Field label="Town">
              <input
                className="input"
                placeholder="e.g. Westlands"
                value={town}
                onChange={(e) => setTown(e.target.value)}
                required
              />
            </Field>
            <Field label="Area / Estate">
              <input
                className="input"
                placeholder="e.g. Sarit Centre"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
              />
            </Field>
          </div>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full py-3">
          {busy ? <Spinner /> : `Create ${meta.label} account`}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
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

function friendlyAuthError(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('already') && m.includes('registered'))
    return 'An account with this phone number already exists. Try signing in.'
  if (m.includes('already been registered'))
    return 'This phone number is already registered. Try signing in.'
  if (m.includes('weak') || m.includes('password'))
    return 'Please choose a stronger password (at least 6 characters).'
  if (m.includes('rate limit')) return 'Too many attempts. Please wait a moment.'
  return msg
}
