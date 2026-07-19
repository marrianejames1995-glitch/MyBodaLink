import { NavLink } from 'react-router-dom'
import { Home, Search, History, Siren, User, Settings } from 'lucide-react'

const items = [
  { to: '/app/home', label: 'Home', icon: Home },
  { to: '/app/search', label: 'Search', icon: Search },
  { to: '/app/history', label: 'History', icon: History },
  { to: '/app/emergency', label: 'SOS', icon: Siren, accent: true },
  { to: '/app/profile', label: 'Profile', icon: User },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/95 safe-bottom">
      <ul className="mx-auto flex max-w-2xl items-stretch justify-between">
        {items.map(({ to, label, icon: Icon, accent }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex h-16 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                  isActive
                    ? accent
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-brand-600 dark:text-brand-400'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                }`
              }
            >
              <Icon size={20} strokeWidth={2.2} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
