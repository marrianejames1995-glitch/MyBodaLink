import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/components/AppLayout'

import Landing from '@/pages/Landing'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'

import Home from '@/pages/home/Home'
import SearchPage from '@/pages/Search'
import HistoryPage from '@/pages/History'
import EmergencyPage from '@/pages/Emergency'
import ProfilePage from '@/pages/Profile'
import EditProfile from '@/pages/EditProfile'
import SettingsPage from '@/pages/Settings'
import ChangePassword from '@/pages/ChangePassword'
import About from '@/pages/About'
import ContactSupport from '@/pages/ContactSupport'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register/:role" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected app */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/app/home" replace />} />
                <Route path="home" element={<Home />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="emergency" element={<EmergencyPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="profile/edit" element={<EditProfile />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="settings/password" element={<ChangePassword />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<ContactSupport />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
