import { useLocation } from 'react-router-dom'

/**
 * The themed MyBodaLink background — light + dark variants of the
 * Kenyan boda/taxi artwork, fixed behind all app content with a readability
 * scrim so text and cards stay legible.
 *
 * Render once, high in the tree (e.g. in AppLayout / Landing). It's
 * pointer-events-none and fixed, so it sits behind everything.
 */
export function AppBackground() {
  // Resolve against the deploy base path (e.g. /MyBodaLink/) so the images
  // load correctly under a subpath. Inline url() isn't rewritten by Vite.
  const base = import.meta.env.BASE_URL
  const heroBg = `${base}hero-bg.jpg`
  const heroBgDark = `${base}hero-bg-dark.jpg`

  // A stable key prevents the cross-fade/flicker when navigating between
  // routes that all render this same background.
  void useLocation()

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat dark:hidden"
        style={{ backgroundImage: `url(${heroBg})` }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 hidden bg-cover bg-center bg-no-repeat dark:block"
        style={{ backgroundImage: `url(${heroBgDark})` }}
        aria-hidden
      />
      {/* Readability scrim — lighter in the middle so the artwork shows. */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-white/65 via-white/40 to-white/80 dark:from-neutral-950/70 dark:via-neutral-950/50 dark:to-neutral-950/85"
        aria-hidden
      />
    </>
  )
}
