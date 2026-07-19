import { User } from 'lucide-react'

interface AvatarProps {
  src?: string | null
  name?: string
  size?: number
  className?: string
}

export function Avatar({ src, name, size = 48, className = '' }: AvatarProps) {
  const initials = (name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Profile photo'}
        width={size}
        height={size}
        loading="lazy"
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
      />
    )
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 ${className}`}
      style={{ width: size, height: size }}
    >
      {initials && initials !== '?' ? (
        <span className="font-semibold" style={{ fontSize: size * 0.4 }}>
          {initials}
        </span>
      ) : (
        <User size={size * 0.5} />
      )}
    </div>
  )
}
