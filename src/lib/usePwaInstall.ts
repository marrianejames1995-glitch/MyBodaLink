import { useCallback, useEffect, useState } from 'react'

/**
 * Captures the browser's "beforeinstallprompt" event (Chrome, Edge, Brave,
 * Android browsers) and exposes a way to trigger the native install prompt.
 *
 * Returns:
 *   - canInstall  : true once the browser has fired beforeinstallprompt
 *                   (i.e. the app is installable and not already installed).
 *   - isInstalled : true if the app is already running in standalone (installed) mode.
 *   - promptInstall: triggers the native install prompt. Resolves to
 *                    'accepted' | 'dismissed' | 'unavailable'.
 *
 * iOS Safari never fires beforeinstallprompt, so canInstall stays false there —
 * callers should fall back to showing iOS instructions (Share → Add to Home Screen).
 */

type InstallOutcome = 'accepted' | 'dismissed' | 'unavailable'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState<boolean>(
    typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        // iOS Safari sets navigator.standalone
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window.navigator as any).standalone === true),
  )

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      // Prevent the mini-infobar from showing on mobile Chrome.
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    function onInstalled() {
      setIsInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)

    // Update if the display mode changes (e.g. user launches from home screen).
    const mq = window.matchMedia('(display-mode: standalone)')
    const onDisplayChange = (e: MediaQueryListEvent) => setIsInstalled(e.matches)
    mq.addEventListener('change', onDisplayChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
      mq.removeEventListener('change', onDisplayChange)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<InstallOutcome> => {
    if (!deferred) return 'unavailable'
    await deferred.prompt()
    const choice = await deferred.userChoice
    setDeferred(null)
    return choice.outcome
  }, [deferred])

  // The native prompt isn't available (iOS, desktop Firefox, already installed).
  const canInstall = Boolean(deferred) && !isInstalled

  return { canInstall, isInstalled, promptInstall }
}

/** Best-effort detection of iOS + Safari, where Add-to-Home-Screen is manual. */
export function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isIos = /iphone|ipad|ipod/i.test(ua)
  // Treat Chrome/Brave/Firefox on iOS (which use the same WebKit engine and
  // can't add to home screen from their own menus) as needing Safari guidance.
  const webkit = /webkit/i.test(ua) && !/crios|fxios/i.test(ua)
  return isIos && webkit
}
