// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – App Header Component
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Bell } from 'lucide-react'
import { useStore, selectUnreadNotifications } from '../../lib/store'

// ── Types ─────────────────────────────────────────────────────────────────────

export type HeaderVariant = 'light' | 'dark' | 'transparent'

export interface HeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
  rightActions?: React.ReactNode
  variant?: HeaderVariant
  showNotifications?: boolean
  onNotificationsClick?: () => void
  className?: string
}

// ── Style Maps ────────────────────────────────────────────────────────────────

const variantStyles: Record<
  HeaderVariant,
  { container: string; title: string; icon: string; border: string }
> = {
  light: {
    container: 'bg-mist-100',
    title: 'text-charcoal-900',
    icon: 'text-charcoal-900 hover:bg-mist-200',
    border: 'border-b border-mist-200',
  },
  dark: {
    container: 'bg-charcoal-900',
    title: 'text-white',
    icon: 'text-white hover:bg-white/10',
    border: 'border-b border-white/10',
  },
  transparent: {
    container: 'bg-transparent',
    title: 'text-charcoal-900',
    icon: 'text-charcoal-900 hover:bg-black/5',
    border: '',
  },
}

// ── Notification Bell ─────────────────────────────────────────────────────────

interface NotificationBellProps {
  userId: string
  variant: HeaderVariant
  onClick?: () => void
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  userId,
  variant,
  onClick,
}) => {
  const unread = useStore(selectUnreadNotifications(userId))
  const count = unread.length
  const styles = variantStyles[variant]

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={[
        'relative p-2 rounded-xl transition-colors',
        styles.icon,
      ].join(' ')}
      aria-label={
        count > 0 ? `${count} unread notifications` : 'Notifications'
      }
    >
      <Bell size={22} strokeWidth={1.8} />
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          className={[
            'absolute top-1 right-1',
            'min-w-[16px] h-4 px-1',
            'bg-copper-700 text-white',
            'text-[10px] font-bold font-inter leading-4',
            'rounded-full flex items-center justify-center',
            'shadow-sm',
          ].join(' ')}
          aria-hidden="true"
        >
          {count > 9 ? '9+' : count}
        </motion.span>
      )}
    </motion.button>
  )
}

// ── Header Component ──────────────────────────────────────────────────────────

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightActions,
  variant = 'light',
  showNotifications = true,
  onNotificationsClick,
  className = '',
}) => {
  const navigate = useNavigate()
  const user = useStore((s) => s.user ?? s.currentUser)
  const styles = variantStyles[variant]

  const handleNotificationsClick = onNotificationsClick || (() => navigate('/notifications'))

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <header
      className={[
        'sticky top-0 z-30 w-full',
        styles.container,
        styles.border,
        // Safe area for iOS notch
        'pt-safe',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center h-14 px-3 gap-2">
        {/* Back Button */}
        {showBack && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleBack}
            className={[
              'p-2 rounded-xl transition-colors shrink-0',
              styles.icon,
            ].join(' ')}
            aria-label="Go back"
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </motion.button>
        )}

        {/* ArtConnect logo mark (when no back & no title) */}
        {!showBack && !title && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-copper-700 to-copper-500 flex items-center justify-center">
              <span className="text-white font-grotesk font-bold text-xs leading-none">
                AC
              </span>
            </div>
            <span
              className={[
                'font-grotesk font-bold text-base tracking-tight',
                styles.title,
              ].join(' ')}
            >
              ArtConnect
            </span>
          </div>
        )}

        {/* Title */}
        {title && (
          <h1
            className={[
              'text-base font-semibold font-grotesk tracking-tight flex-1',
              showBack ? 'text-left' : 'text-left',
              styles.title,
            ].join(' ')}
          >
            {title}
          </h1>
        )}

        {/* Spacer */}
        {!title && <div className="flex-1" />}

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-1 shrink-0">
          {rightActions}
          {showNotifications && user && (
            <NotificationBell
              userId={user.id}
              variant={variant}
              onClick={handleNotificationsClick}
            />
          )}
        </div>
      </div>
    </header>
  )
}

// ── Transparent overlay variant (for hero screens) ───────────────────────────

export const OverlayHeader: React.FC<Omit<HeaderProps, 'variant'>> = (props) => (
  <Header
    {...props}
    variant="transparent"
    className={['absolute inset-x-0 top-0', props.className ?? ''].join(' ')}
  />
)

export default Header
