import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getProfile } from '@/lib/api'
import { phoneToEmail } from '@/lib/phone'
import type { Profile, UserRole } from '@/lib/types'

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (phone: string, password: string) => Promise<void>
  signUp: (params: {
    role: UserRole
    phone: string
    password: string
    fullName: string
  }) => Promise<{ userId: string }>
  signOut: () => Promise<void>
  resetPassword: (phone: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Bootstrap session + subscribe to auth changes.
  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      if (!data.session) setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      if (!newSession) {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // Load the profile whenever the user changes.
  useEffect(() => {
    if (!user) {
      setProfile(null)
      return
    }
    let mounted = true
    setLoading(true)
    getProfile(user.id)
      .then((p) => {
        if (mounted) setProfile(p)
      })
      .catch((e) => {
        console.error('[MyBodaLink] Failed to load profile:', e)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      loading,
      async signIn(phone, password) {
        const { error } = await supabase.auth.signInWithPassword({
          email: phoneToEmail(phone),
          password,
        })
        if (error) throw error
      },
      async signUp({ role, phone, password, fullName }) {
        const { data, error } = await supabase.auth.signUp({
          email: phoneToEmail(phone),
          password,
          options: { data: { full_name: fullName, role, phone_number: phone } },
        })
        if (error) throw error
        const userId = data.user?.id
        if (!userId) throw new Error('Sign-up did not return a user id.')
        return { userId }
      },
      async signOut() {
        await supabase.auth.signOut()
        setProfile(null)
      },
      async resetPassword(phone) {
        const { error } = await supabase.auth.resetPasswordForEmail(
          phoneToEmail(phone),
          // Honour the deployment subpath (e.g. /MyBodaLink/) so the reset
          // link points back into this app rather than the domain root.
          { redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}reset-password` },
        )
        if (error) throw error
      },
      async updatePassword(newPassword) {
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) throw error
      },
      async refreshProfile() {
        if (!user) return
        const p = await getProfile(user.id)
        setProfile(p)
      },
    }),
    [session, user, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
