// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Notifications Screen
// Route: /notifications
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react'
import {
  CheckCircle,
  Wallet,
  MessageCircle,
  AlertTriangle,
  Info,
  Bell,
  Trash2,
  Inbox,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { timeAgo } from '../../lib/utils'
import type { Notification, NotificationType } from '../../lib/types'

// ── Filter tabs ───────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'unread' | 'milestones' | 'payments'

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'payments', label: 'Payments' },
]

// ── Notification icon config ──────────────────────────────────────────────────

interface NotifIconConfig {
  Icon: React.ElementType
  iconClass: string
  bgClass: string
}

const notifIconConfig: Record<NotificationType, NotifIconConfig> = {
  milestone_update: {
    Icon: CheckCircle,
    iconClass: 'text-copper-700',
    bgClass: 'bg-copper-700/10',
  },
  payment: {
    Icon: Wallet,
    iconClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50',
  },
  message: {
    Icon: MessageCircle,
    iconClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
  },
  dispute: {
    Icon: AlertTriangle,
    iconClass: 'text-red-600',
    bgClass: 'bg-red-50',
  },
  project_update: {
    Icon: Info,
    iconClass: 'text-mist-500',
    bgClass: 'bg-mist-100',
  },
  contract_update: {
    Icon: Info,
    iconClass: 'text-mist-500',
    bgClass: 'bg-mist-100',
  },
  admin: {
    Icon: Info,
    iconClass: 'text-mist-500',
    bgClass: 'bg-mist-100',
  },
}

// ── Filter helper ─────────────────────────────────────────────────────────────

function applyFilter(notifications: Notification[], tab: FilterTab): Notification[] {
  switch (tab) {
    case 'unread':
      return notifications.filter((n) => !n.is_read)
    case 'milestones':
      return notifications.filter((n) => n.type === 'milestone_update')
    case 'payments':
      return notifications.filter((n) => n.type === 'payment')
    default:
      return notifications
  }
}

// ── NotificationItem component ────────────────────────────────────────────────

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
  onDelete,
}) => {
  const [showDelete, setShowDelete] = useState(false)
  const config = notifIconConfig[notification.type] ?? notifIconConfig.project_update
  const { Icon, iconClass, bgClass } = config

  return (
    <div
      className={[
        'relative flex items-start gap-3 px-4 py-4 bg-white border-b border-mist-100',
        'transition-colors duration-150 cursor-pointer',
        !notification.is_read ? 'bg-copper-50/40' : '',
      ].join(' ')}
      onClick={() => onMarkRead(notification.id)}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onMarkRead(notification.id)}
      aria-label={`Notification: ${notification.title}`}
    >
      {/* Icon */}
      <div
        className={[
          'flex-none flex items-center justify-center w-10 h-10 rounded-xl mt-0.5',
          bgClass,
        ].join(' ')}
      >
        <Icon size={18} strokeWidth={2} className={iconClass} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={[
              'font-grotesk text-sm leading-snug',
              !notification.is_read ? 'font-semibold text-charcoal-900' : 'font-medium text-charcoal-900/80',
            ].join(' ')}
          >
            {notification.title}
          </p>
          <span className="font-inter text-[10px] text-mist-400 shrink-0 mt-0.5">
            {timeAgo(notification.created_at)}
          </span>
        </div>
        <p className="font-inter text-xs text-mist-500 mt-0.5 leading-relaxed line-clamp-2">
          {notification.message}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.is_read && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-copper-700 shrink-0" />
      )}

      {/* Delete button (hover) */}
      {showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(notification.id)
          }}
          className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
          aria-label="Delete notification"
        >
          <Trash2 size={14} strokeWidth={2} />
        </button>
      )}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ tab: FilterTab }> = ({ tab }) => {
  const messages: Record<FilterTab, string> = {
    all: "You're all caught up!",
    unread: 'No unread notifications.',
    milestones: 'No milestone updates yet.',
    payments: 'No payment notifications yet.',
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-4">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-mist-100 flex items-center justify-center">
          <Inbox size={36} className="text-mist-300" strokeWidth={1.5} />
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center border-2 border-white">
          <CheckCircle size={14} className="text-emerald-500" strokeWidth={2.5} />
        </div>
      </div>
      <div>
        <p className="font-grotesk font-semibold text-base text-charcoal-900">
          {messages[tab]}
        </p>
        <p className="font-inter text-sm text-mist-400 mt-1">
          {tab === 'all'
            ? 'Nothing new — enjoy the calm.'
            : 'Check back later for updates.'}
        </p>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Notifications() {
  const user = useStore((s) => s.user)

  // Local notification state so we can mark read / delete without mutating store
  const storeNotifications = useStore((s) => s.notifications)

  const [localNotifs, setLocalNotifs] = useState<Notification[]>([])
  const [initialized, setInitialized] = useState(false)

  // Sync from store once on first render and when store changes
  React.useEffect(() => {
    const userNotifs = storeNotifications.filter((n) => n.user_id === user?.id)
    setLocalNotifs(userNotifs)
    if (!initialized) setInitialized(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeNotifications, user?.id])

  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  const filtered = applyFilter(localNotifs, activeTab)
  const unreadCount = localNotifs.filter((n) => !n.is_read).length

  const handleMarkRead = (id: string) => {
    setLocalNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
  }

  const handleMarkAllRead = () => {
    setLocalNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const handleDelete = (id: string) => {
    setLocalNotifs((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="flex flex-col min-h-screen bg-mist-100 max-w-2xl mx-auto">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex-none bg-white border-b border-mist-100 shadow-sm">
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Bell size={22} className="text-charcoal-900" strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full gradient-copper text-white font-inter text-[9px] font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <h1 className="font-grotesk text-xl font-bold text-charcoal-900">
              Notifications
            </h1>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="font-inter text-xs font-medium text-copper-700 hover:text-copper-600 underline underline-offset-2 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-0 px-4 pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'relative px-4 py-2.5 font-inter text-sm font-medium transition-colors duration-150',
                activeTab === tab.id
                  ? 'text-copper-700'
                  : 'text-mist-400 hover:text-charcoal-900',
              ].join(' ')}
            >
              {tab.label}
              {tab.id === 'unread' && unreadCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-copper-700 text-white font-inter text-[9px] font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full gradient-copper" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ── Notification List ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="bg-white rounded-none sm:rounded-2xl sm:mx-4 sm:mt-4 sm:overflow-hidden border-b border-mist-100 sm:border sm:shadow-sm">
            {filtered.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
