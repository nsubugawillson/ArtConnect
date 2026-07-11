// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Bottom Navigation Bar
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home,
  Search,
  Briefcase,
  Wallet,
  User,
  Image,
  FileText,
} from 'lucide-react'
import type { UserRole } from '../../lib/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
}

export interface BottomNavProps {
  role?: UserRole
}

// ── Nav Config ────────────────────────────────────────────────────────────────

const clientNavItems: NavItem[] = [
  { label: 'Home', path: '/client/dashboard', icon: Home },
  { label: 'Browse', path: '/client/browse', icon: Search },
  { label: 'Projects', path: '/client/projects', icon: Briefcase },
  { label: 'Wallet', path: '/client/wallet', icon: Wallet },
  { label: 'Profile', path: '/client/profile', icon: User },
]

const designerNavItems: NavItem[] = [
  { label: 'Home', path: '/designer/dashboard', icon: Home },
  { label: 'Portfolio', path: '/designer/portfolio', icon: Image },
  { label: 'Contracts', path: '/designer/contracts', icon: FileText },
  { label: 'Wallet', path: '/designer/wallet', icon: Wallet },
  { label: 'Profile', path: '/designer/profile', icon: User },
]

// ── NavItem Component ─────────────────────────────────────────────────────────

interface NavItemComponentProps {
  item: NavItem
  isActive: boolean
}

const NavItemComponent: React.FC<NavItemComponentProps> = ({ item, isActive }) => {
  const Icon = item.icon

  return (
    <Link
      to={item.path}
      className="relative flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-h-[56px] group"
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Active indicator dot */}
      {isActive && (
        <motion.span
          layoutId="bottom-nav-dot"
          className="absolute top-1 w-1 h-1 rounded-full bg-copper-700"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}

      {/* Icon */}
      <motion.span
        animate={
          isActive
            ? { scale: 1.1, y: 0 }
            : { scale: 1, y: 0 }
        }
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={[
          'flex items-center justify-center transition-colors duration-200',
          isActive ? 'text-copper-700' : 'text-mist-400 group-hover:text-charcoal-800',
        ].join(' ')}
      >
        <Icon
          size={22}
          strokeWidth={isActive ? 2.2 : 1.8}
        />
      </motion.span>

      {/* Label */}
      <span
        className={[
          'text-[10px] font-medium font-inter transition-colors duration-200 leading-none',
          isActive ? 'text-copper-700' : 'text-mist-400 group-hover:text-charcoal-800',
        ].join(' ')}
      >
        {item.label}
      </span>
    </Link>
  )
}

// ── BottomNav Component ───────────────────────────────────────────────────────

export const BottomNav: React.FC<BottomNavProps> = ({ role = 'client' }) => {
  const location = useLocation()
  const navItems = role === 'designer' ? designerNavItems : clientNavItems

  const isActive = (path: string): boolean => {
    // Exact match for dashboard, prefix match for sub-routes
    if (path.endsWith('/dashboard')) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <nav
      className={[
        'fixed bottom-0 left-0 right-0 z-40',
        'flex items-stretch',
        'bg-white border-t border-mist-100',
        'shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.08)]',
        // Safe area for iOS home indicator
        'pb-safe',
      ].join(' ')}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Main navigation"
    >
      {navItems.map((item) => (
        <NavItemComponent
          key={item.path}
          item={item}
          isActive={isActive(item.path)}
        />
      ))}
    </nav>
  )
}

// ── Dark variant (for dark-background screens) ────────────────────────────────

export const BottomNavDark: React.FC<BottomNavProps> = ({ role = 'client' }) => {
  const location = useLocation()
  const navItems = role === 'designer' ? designerNavItems : clientNavItems

  const isActive = (path: string): boolean => {
    if (path.endsWith('/dashboard')) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <nav
      className={[
        'fixed bottom-0 left-0 right-0 z-40',
        'flex items-stretch',
        'bg-charcoal-900 border-t border-white/10',
        'shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.3)]',
      ].join(' ')}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Main navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const active = isActive(item.path)
        return (
          <Link
            key={item.path}
            to={item.path}
            className="relative flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-h-[56px] group"
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
          >
            {active && (
              <motion.span
                layoutId="bottom-nav-dark-dot"
                className="absolute top-1 w-1 h-1 rounded-full bg-copper-500"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span
              className={[
                active ? 'text-copper-400' : 'text-white/40 group-hover:text-white/70',
                'transition-colors duration-200',
              ].join(' ')}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            </span>
            <span
              className={[
                'text-[10px] font-medium font-inter leading-none transition-colors duration-200',
                active ? 'text-copper-400' : 'text-white/40 group-hover:text-white/70',
              ].join(' ')}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

export default BottomNav
