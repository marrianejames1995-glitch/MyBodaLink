import { Outlet } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { AppBackground } from '@/components/AppBackground'

export function AppLayout() {
  return (
    <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col">
      {/* Themed background behind all logged-in screens */}
      <AppBackground />
      <main className="flex-1 px-4 pb-24 pt-4 safe-top">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
