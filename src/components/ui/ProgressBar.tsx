// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – ProgressBar Component
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProgressBarSize = 'xs' | 'sm' | 'md' | 'lg'

export interface ProgressBarProps {
  value: number          // 0-100
  max?: number           // defaults to 100
  size?: ProgressBarSize
  showPercentage?: boolean
  label?: string
  className?: string
  trackClassName?: string
  fillClassName?: string
  animated?: boolean
  delay?: number         // animation delay in seconds
}

// ── Size Map ──────────────────────────────────────────────────────────────────

const sizeStyles: Record<ProgressBarSize, string> = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

// ── Component ─────────────────────────────────────────────────────────────────

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  showPercentage = false,
  label,
  className = '',
  trackClassName = '',
  fillClassName = '',
  animated = true,
  delay = 0,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const [displayValue, setDisplayValue] = useState(animated ? 0 : percentage)

  useEffect(() => {
    if (!animated) {
      setDisplayValue(percentage)
      return
    }
    // Small delay then animate to target
    const timer = setTimeout(() => {
      setDisplayValue(percentage)
    }, delay * 1000 + 50)
    return () => clearTimeout(timer)
  }, [percentage, animated, delay])

  // Percentage counter animation
  const [countedPercent, setCountedPercent] = useState(animated ? 0 : Math.round(percentage))

  useEffect(() => {
    if (!animated || !showPercentage) {
      setCountedPercent(Math.round(percentage))
      return
    }
    const duration = 800 // ms
    const steps = 40
    const stepTime = duration / steps
    const step = percentage / steps
    let current = 0
    let count = 0
    const timer = setInterval(() => {
      count++
      current = Math.min(Math.round(step * count), Math.round(percentage))
      setCountedPercent(current)
      if (current >= Math.round(percentage)) clearInterval(timer)
    }, stepTime)
    return () => clearInterval(timer)
  }, [percentage, animated, showPercentage])

  // Colour based on value
  const getFillColour = (): string => {
    if (fillClassName) return fillClassName
    if (percentage >= 80) return 'bg-gradient-to-r from-emerald-500 to-emerald-400'
    if (percentage >= 50) return 'bg-gradient-to-r from-copper-700 to-copper-500'
    return 'bg-gradient-to-r from-copper-700 to-amber-500'
  }

  return (
    <div className={['w-full space-y-1.5', className].filter(Boolean).join(' ')}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-xs font-medium text-charcoal-900 font-inter">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-xs font-semibold text-copper-700 font-grotesk tabular-nums">
              {countedPercent}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        className={[
          'w-full rounded-full overflow-hidden',
          'bg-mist-100',
          sizeStyles[size],
          trackClassName,
        ]
          .filter(Boolean)
          .join(' ')}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        {/* Fill */}
        <motion.div
          className={['h-full rounded-full', getFillColour()]
            .filter(Boolean)
            .join(' ')}
          initial={{ width: '0%' }}
          animate={{ width: `${displayValue}%` }}
          transition={{
            duration: animated ? 0.9 : 0,
            ease: [0.34, 1.1, 0.64, 1],
            delay: animated ? delay : 0,
          }}
        />
      </div>
    </div>
  )
}

// ── MilestoneProgress ─────────────────────────────────────────────────────────
// A specialised multi-segment progress bar for milestone tracking

export interface MilestoneProgressProps {
  total: number
  approved: number
  inProgress: number
  className?: string
}

export const MilestoneProgress: React.FC<MilestoneProgressProps> = ({
  total,
  approved,
  inProgress,
  className = '',
}) => {
  if (total === 0) return null

  const approvedPct = (approved / total) * 100
  const inProgressPct = (inProgress / total) * 100

  return (
    <div className={['w-full space-y-1', className].join(' ')}>
      <div className="h-2 w-full bg-mist-100 rounded-full overflow-hidden flex">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
          initial={{ width: '0%' }}
          animate={{ width: `${approvedPct}%` }}
          transition={{ duration: 0.9, ease: [0.34, 1.1, 0.64, 1], delay: 0.1 }}
        />
        <motion.div
          className="h-full bg-gradient-to-r from-copper-700 to-copper-500"
          initial={{ width: '0%' }}
          animate={{ width: `${inProgressPct}%` }}
          transition={{ duration: 0.9, ease: [0.34, 1.1, 0.64, 1], delay: 0.2 }}
        />
      </div>
      <div className="flex items-center gap-3 text-xs text-mist-500 font-inter">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          {approved} approved
        </span>
        {inProgress > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-copper-700 inline-block" />
            {inProgress} in progress
          </span>
        )}
        <span className="ml-auto">{total} total</span>
      </div>
    </div>
  )
}

export default ProgressBar
