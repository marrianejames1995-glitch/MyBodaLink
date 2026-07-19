import { AlertTriangle, Database } from 'lucide-react'

/** Shown when Supabase env vars are missing, so users get a clear message. */
export function SupabaseNotConfigured() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-10 text-center safe-top">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
        <Database size={30} />
      </div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        Connect Supabase to continue
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        MyBodaLink needs a Supabase project. Copy{' '}
        <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs dark:bg-neutral-800">
          .env.example
        </code>{' '}
        to{' '}
        <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs dark:bg-neutral-800">
          .env
        </code>{' '}
        and add your project URL and anon key, then restart the dev server.
      </p>
      <div className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-left text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <p>
          See <code className="font-mono">supabase/schema.sql</code> and{' '}
          <code className="font-mono">README.md</code> in the project for step-by-step
          database, auth and storage configuration.
        </p>
      </div>
    </div>
  )
}
