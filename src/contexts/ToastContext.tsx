import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

let counter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = ++counter
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => remove(id), 4000)
    },
    [remove],
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 p-4 safe-top">
        {toasts.map((t) => (
          <ToastView key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastView({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const styles: Record<ToastType, { icon: ReactNode; ring: string }> = {
    success: {
      icon: <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />,
      ring: 'border-green-200 dark:border-green-900/50',
    },
    error: {
      icon: <AlertCircle size={18} className="text-red-600 dark:text-red-400" />,
      ring: 'border-red-200 dark:border-red-900/50',
    },
    info: {
      icon: <Info size={18} className="text-brand-600 dark:text-brand-400" />,
      ring: 'border-brand-200 dark:border-brand-900/50',
    },
  }
  return (
    <div
      className={`pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-xl border ${styles[toast.type].ring} bg-white px-4 py-3 shadow-lg dark:bg-neutral-900`}
      role="alert"
    >
      <span className="mt-0.5">{styles[toast.type].icon}</span>
      <p className="flex-1 text-sm text-gray-800 dark:text-gray-100">{toast.message}</p>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
