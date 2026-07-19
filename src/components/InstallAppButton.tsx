import { useState } from 'react'
import { Download, X, Share } from 'lucide-react'
import { usePwaInstall, isIosSafari } from '@/lib/usePwaInstall'
import { Modal } from '@/components/ui/Modal'

/**
 * A "Install App" button for the top of the homepage.
 *
 * Behaviour:
 *  - Standalone installable browsers (Chrome/Edge/Brave on Android & desktop):
 *    tapping triggers the native install prompt.
 *  - iOS Safari: opens a small modal with Share → Add to Home Screen steps.
 *  - Already installed (standalone mode): the button is hidden entirely.
 */
export function InstallAppButton({ compact = false }: { compact?: boolean }) {
  const { canInstall, isInstalled, promptInstall } = usePwaInstall()
  const [iosOpen, setIosOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  // Hide once installed.
  if (isInstalled) return null

  async function handleInstall() {
    // On iOS there's no programmatic install — show the guide instead.
    if (isIosSafari()) {
      setIosOpen(true)
      return
    }
    if (canInstall) {
      setBusy(true)
      await promptInstall()
      setBusy(false)
      return
    }
    // Other browsers where we couldn't capture the prompt: show the guide too,
    // since the steps are generally helpful (or they can use their browser menu).
    setIosOpen(true)
  }

  if (compact) {
    // Small icon-only version for a header / top bar.
    return (
      <>
        <button
          type="button"
          onClick={handleInstall}
          aria-label="Install MyBodaLink app"
          title="Install app"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-brand-600 shadow-sm transition hover:border-brand-400 hover:bg-brand-50 active:scale-95 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
        >
          <Download size={18} />
        </button>
        <IosGuide open={iosOpen} onClose={() => setIosOpen(false)} />
      </>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstall}
        disabled={busy}
        className="btn-secondary w-full"
      >
        <Download size={16} /> {busy ? 'Starting…' : 'Install app'}
      </button>
      <IosGuide open={iosOpen} onClose={() => setIosOpen(false)} />
    </>
  )
}

function IosGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Install MyBodaLink">
      <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
        <p>Add MyBodaLink to your home screen so it opens like a real app:</p>
        <ol className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
              1
            </span>
            <span>
              Tap the <strong>Share</strong> button in Safari&apos;s toolbar
              <Share size={14} className="ml-1 inline text-brand-600" />.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
              2
            </span>
            <span>
              Scroll down and tap <strong>Add to Home Screen</strong>.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
              3
            </span>
            <span>
              Tap <strong>Add</strong>. MyBodaLink will appear with its own icon.
            </span>
          </li>
        </ol>
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          Tip: you must be in <strong>Safari</strong> to add to the Home Screen
          on iPhone.
        </p>
        <button onClick={onClose} className="btn-primary w-full">
          <X size={16} /> Got it
        </button>
      </div>
    </Modal>
  )
}
