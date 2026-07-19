import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Pencil,
  Camera,
  KeyRound,
  Sun,
  Moon,
  Info,
  LifeBuoy,
  Trash2,
  LogOut,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useToast } from '@/contexts/ToastContext'
import { PageHeader } from '@/components/PageHeader'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { deleteAccount } from '@/lib/api'
import { APP_NAME, APP_VERSION } from '@/lib/constants'

export default function SettingsPage() {
  const { signOut, profile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [confirmLogout, setConfirmLogout] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteAck, setDeleteAck] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleDelete() {
    setBusy(true)
    try {
      await deleteAccount()
      toast('Account deleted.', 'success')
      await signOut()
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not delete account.'
      toast(msg, 'error')
    } finally {
      setBusy(false)
      setConfirmDelete(false)
    }
  }

  async function handleLogout() {
    await signOut()
    toast('Signed out.', 'success')
    navigate('/login', { replace: true })
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" subtitle={profile?.full_name} />

      {/* Account */}
      <Section title="Account">
        <Item icon={Pencil} label="Edit Profile" onClick={() => navigate('/app/profile/edit')} />
        <Item icon={Camera} label="Change Profile Photo" onClick={() => navigate('/app/profile/edit')} />
        <Item
          icon={KeyRound}
          label="Change Password"
          onClick={() => navigate('/app/settings/password')}
        />
      </Section>

      {/* Appearance */}
      <Section title="Appearance">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400">
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          <button
            onClick={toggleTheme}
            role="switch"
            aria-checked={theme === 'dark'}
            className={`relative h-6 w-11 rounded-full transition ${
              theme === 'dark' ? 'bg-brand-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                theme === 'dark' ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>
        <Item
          icon={theme === 'dark' ? Sun : Moon}
          label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          onClick={toggleTheme}
        />
      </Section>

      {/* About & support */}
      <Section title="About & Support">
        <Item icon={Info} label="About MyBodaLink" onClick={() => navigate('/app/about')} />
        <Item
          icon={LifeBuoy}
          label="Contact Support"
          onClick={() => navigate('/app/contact')}
        />
      </Section>

      {/* Danger zone */}
      <Section title="Account Actions">
        <Item icon={LogOut} label="Logout" onClick={() => setConfirmLogout(true)} danger />
        <Item
          icon={Trash2}
          label="Delete Account"
          onClick={() => setConfirmDelete(true)}
          danger
        />
      </Section>

      <p className="pt-2 text-center text-xs text-gray-400">
        {APP_NAME} v{APP_VERSION}
      </p>

      {/* Logout confirm */}
      <Modal
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        title="Sign out?"
        footer={
          <>
            <button onClick={() => setConfirmLogout(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button onClick={handleLogout} className="btn-primary flex-1">
              Sign out
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          You can sign back in anytime with your phone number and password.
        </p>
      </Modal>

      {/* Delete account confirm */}
      <Modal
        open={confirmDelete}
        onClose={() => {
          setConfirmDelete(false)
          setDeleteAck(false)
        }}
        title="Delete account permanently?"
        footer={
          <>
            <button
              onClick={() => {
                setConfirmDelete(false)
                setDeleteAck(false)
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button onClick={handleDelete} disabled={!deleteAck || busy} className="btn-danger flex-1">
              {busy ? <Spinner /> : 'Delete forever'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-left text-xs text-red-700 dark:bg-red-900/20 dark:text-red-300">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <p>
              This permanently removes your profile, photo, and all history from{' '}
              {APP_NAME}. This action cannot be undone.
            </p>
          </div>
          <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={deleteAck}
              onChange={(e) => setDeleteAck(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            I understand this permanently deletes my account and data.
          </label>
        </div>
      </Modal>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {title}
      </h3>
      <div className="card divide-y divide-gray-100 dark:divide-neutral-800">{children}</div>
    </div>
  )
}

function Item({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Pencil
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50 dark:hover:bg-neutral-800/50"
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          danger
            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400'
        }`}
      >
        <Icon size={18} />
      </span>
      <span
        className={`flex-1 font-medium ${
          danger
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-900 dark:text-gray-100'
        }`}
      >
        {label}
      </span>
      <ChevronRight size={18} className="text-gray-300 dark:text-neutral-600" />
    </button>
  )
}
