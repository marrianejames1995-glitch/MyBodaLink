import { useAuth } from '@/contexts/AuthContext'
import { ClientHome } from '@/pages/home/ClientHome'
import { ProviderHome } from '@/pages/home/ProviderHome'

export default function Home() {
  const { profile } = useAuth()
  if (!profile) return null
  if (profile.role === 'client') return <ClientHome />
  return <ProviderHome role={profile.role} />
}
