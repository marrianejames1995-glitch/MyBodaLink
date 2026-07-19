import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  back?: boolean | string
  right?: ReactNode
}

export function PageHeader({ title, subtitle, back, right }: PageHeaderProps) {
  const navigate = useNavigate()
  return (
    <div className="mb-5 flex items-center gap-3">
      {back && (
        <button
          onClick={() =>
            typeof back === 'string' ? navigate(back) : navigate(-1)
          }
          className="-ml-1 rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800"
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  )
}
