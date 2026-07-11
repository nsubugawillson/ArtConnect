// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Avatar Component
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface AvatarProps {
  src?: string | null
  name?: string
  size?: AvatarSize
  className?: string
  ring?: boolean
  alt?: string
}

// ── Size Map ──────────────────────────────────────────────────────────────────

const sizeConfig: Record<
  AvatarSize,
  { container: string; text: string; border: string }
> = {
  xs: {
    container: 'w-6 h-6',
    text: 'text-[10px]',
    border: 'ring-1',
  },
  sm: {
    container: 'w-8 h-8',
    text: 'text-xs',
    border: 'ring-2',
  },
  md: {
    container: 'w-10 h-10',
    text: 'text-sm',
    border: 'ring-2',
  },
  lg: {
    container: 'w-14 h-14',
    text: 'text-base',
    border: 'ring-2',
  },
  xl: {
    container: 'w-20 h-20',
    text: 'text-xl',
    border: 'ring-4',
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// Deterministic colour from name for consistent avatar colours
function getInitialsGradient(name: string): string {
  const gradients = [
    'from-copper-700 to-copper-500',
    'from-copper-600 to-amber-500',
    'from-mist-400 to-mist-300',
    'from-copper-800 to-copper-600',
    'from-amber-600 to-copper-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradients[Math.abs(hash) % gradients.length]
}

// ── Component ─────────────────────────────────────────────────────────────────

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '',
  size = 'md',
  className = '',
  ring = false,
  alt,
}) => {
  const [imgError, setImgError] = useState(false)
  const config = sizeConfig[size]

  const showImage = src && !imgError
  const initials = name ? getInitials(name) : '?'
  const gradient = name ? getInitialsGradient(name) : 'from-copper-700 to-copper-500'

  const containerStyles = [
    'relative inline-flex items-center justify-center',
    'rounded-full',
    'overflow-hidden',
    'shrink-0',
    'select-none',
    config.container,
    ring
      ? `${config.border} ring-white ring-offset-0`
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (showImage) {
    return (
      <div className={containerStyles}>
        <img
          src={src}
          alt={alt ?? name ?? 'Avatar'}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          draggable={false}
        />
      </div>
    )
  }

  return (
    <div
      className={[
        containerStyles,
        `bg-gradient-to-br ${gradient}`,
      ].join(' ')}
      aria-label={name ?? 'User avatar'}
      role="img"
    >
      <span
        className={[
          'font-semibold text-white font-grotesk leading-none',
          config.text,
        ].join(' ')}
      >
        {initials}
      </span>
    </div>
  )
}

// ── AvatarGroup ───────────────────────────────────────────────────────────────

export interface AvatarGroupProps {
  avatars: Array<{ src?: string | null; name?: string }>
  max?: number
  size?: AvatarSize
  className?: string
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'sm',
  className = '',
}) => {
  const shown = avatars.slice(0, max)
  const overflow = avatars.length - max

  return (
    <div className={['flex -space-x-2', className].join(' ')}>
      {shown.map((avatar, i) => (
        <Avatar
          key={i}
          src={avatar.src}
          name={avatar.name}
          size={size}
          ring
          className="border-2 border-white"
        />
      ))}
      {overflow > 0 && (
        <div
          className={[
            sizeConfig[size].container,
            'inline-flex items-center justify-center',
            'rounded-full bg-mist-200 border-2 border-white',
            'text-mist-500 font-semibold font-inter',
            sizeConfig[size].text,
          ].join(' ')}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}

export default Avatar
