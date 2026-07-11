// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – WalletCard Component
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Plus, ArrowUpRight, TrendingUp } from 'lucide-react'
import { Button } from '../ui/Button'
import type { Wallet } from '../../lib/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WalletCardProps {
  wallet: Wallet
  onTopUp?: () => void
  onWithdraw?: () => void
  className?: string
}

// ── Animated Counter ─────────────────────────────────────────────────────────

interface AnimatedNumberProps {
  value: number
  duration?: number
  className?: string
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1200,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const startValueRef = useRef(0)

  useEffect(() => {
    startValueRef.current = displayValue
    startRef.current = null

    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // Ease out expo
      const eased = 1 - Math.pow(2, -10 * progress)
      const current = Math.round(startValueRef.current + (value - startValueRef.current) * eased)
      setDisplayValue(current)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  const formatted = new Intl.NumberFormat('en-UG', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(displayValue)

  return <span className={className}>{formatted}</span>
}

// ── Decorative Pattern ────────────────────────────────────────────────────────

const DecorativePattern: React.FC = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none select-none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <pattern
        id="wallet-grid"
        x="0"
        y="0"
        width="40"
        height="40"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="1" cy="1" r="1.5" fill="white" />
      </pattern>
      <pattern
        id="wallet-circles"
        x="0"
        y="0"
        width="120"
        height="120"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="60" cy="60" r="50" fill="none" stroke="white" strokeWidth="1" />
        <circle cx="60" cy="60" r="30" fill="none" stroke="white" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#wallet-grid)" />
    <rect width="100%" height="100%" fill="url(#wallet-circles)" />
  </svg>
)

// ── WalletCard Component ──────────────────────────────────────────────────────

export const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  onTopUp,
  onWithdraw,
  className = '',
}) => {
  const total = wallet.available_balance + wallet.locked_balance
  const lockedPercent = total > 0 ? (wallet.locked_balance / total) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      className={[
        'relative overflow-hidden rounded-3xl',
        // Deep charcoal-to-copper gradient
        'bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-[#3D1A06]',
        'shadow-2xl shadow-charcoal-900/40',
        'min-h-[200px]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Decorative background pattern */}
      <DecorativePattern />

      {/* Glowing copper circle – top right */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(160,67,10,0.3) 0%, rgba(160,67,10,0.05) 60%, transparent 80%)',
        }}
        aria-hidden="true"
      />

      {/* Card content */}
      <div className="relative z-10 p-6 flex flex-col gap-5">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <p className="text-white/50 text-xs font-inter uppercase tracking-widest">
              Available Balance
            </p>
            <div className="flex items-end gap-1.5">
              <span className="text-white/60 text-sm font-inter self-end mb-0.5">
                UGX
              </span>
              <p className="text-white text-3xl font-bold font-grotesk leading-none tabular-nums">
                <AnimatedNumber value={wallet.available_balance} duration={1000} />
              </p>
            </div>
          </div>

          {/* Uganda flag icon / currency badge */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <TrendingUp size={20} className="text-copper-400" strokeWidth={2} />
          </div>
        </div>

        {/* Locked funds row */}
        {wallet.locked_balance > 0 && (
          <div className="space-y-2">
            {/* Lock info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-white/50 text-xs font-inter">
                <Lock size={11} strokeWidth={2} />
                <span>Locked in escrow</span>
              </div>
              <span className="text-white/60 text-xs font-semibold font-grotesk tabular-nums">
                UGX{' '}
                <AnimatedNumber
                  value={wallet.locked_balance}
                  duration={1000}
                />
              </span>
            </div>

            {/* Mini progress bar */}
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-copper-600 to-copper-400"
                initial={{ width: '0%' }}
                animate={{ width: `${lockedPercent}%` }}
                transition={{ duration: 1, ease: [0.34, 1.1, 0.64, 1], delay: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {onTopUp && (
            <Button
              variant="primary"
              size="sm"
              onClick={onTopUp}
              leftIcon={<Plus size={14} strokeWidth={2.5} />}
              className="flex-1 bg-gradient-to-r from-copper-700 to-copper-600 hover:from-copper-600 hover:to-copper-500 border-0 shadow-none"
            >
              Top Up
            </Button>
          )}

          {onWithdraw && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onWithdraw}
              rightIcon={<ArrowUpRight size={14} strokeWidth={2} />}
              className="flex-1 text-white/70 hover:text-white hover:bg-white/10 border border-white/15"
            >
              Withdraw
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── WalletCardCompact ─────────────────────────────────────────────────────────
// Smaller inline version for use within list items

export interface WalletCardCompactProps {
  available: number
  locked?: number
  currency?: string
  className?: string
}

export const WalletCardCompact: React.FC<WalletCardCompactProps> = ({
  available,
  locked = 0,
  currency = 'UGX',
  className = '',
}) => {
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-UG', { maximumFractionDigits: 0 }).format(n)

  return (
    <div
      className={[
        'flex items-center justify-between',
        'rounded-xl p-3',
        'bg-gradient-to-r from-charcoal-900 to-charcoal-800',
        'border border-white/10',
        className,
      ].join(' ')}
    >
      <div>
        <p className="text-white/40 text-[10px] font-inter uppercase tracking-wider mb-0.5">
          Available
        </p>
        <p className="text-white text-base font-bold font-grotesk">
          {currency} {fmt(available)}
        </p>
      </div>

      {locked > 0 && (
        <div className="text-right">
          <p className="text-white/40 text-[10px] font-inter uppercase tracking-wider mb-0.5 flex items-center justify-end gap-1">
            <Lock size={9} /> Locked
          </p>
          <p className="text-copper-400 text-sm font-semibold font-grotesk">
            {currency} {fmt(locked)}
          </p>
        </div>
      )}
    </div>
  )
}

export default WalletCard
