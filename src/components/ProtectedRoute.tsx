import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { FullPageSpinner } from '@/components/ui/Spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Optional role guard. */
  roles?: Array<'client' | 'rider' | 'taxi_driver'>
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageSpinner />
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (!profile) return <FullPageSpinner label="Setting up your profile…" />
  if (roles && !roles.includes(profile.role)) {
    return <Navigate to="/app/home" replace />
  }
  return <>{children}</>
}
