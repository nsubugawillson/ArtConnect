// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

import type { Milestone, MilestoneStatus } from './types'

// ── Currency Formatting ───────────────────────────────────────────────────────

/**
 * Formats a number as "UGX 1,250,000"
 */
export function formatUGX(amount: number): string {
  return `UGX ${new Intl.NumberFormat('en-UG', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount)}`
}

/**
 * Formats a number compactly: "UGX 1.25M", "UGX 500K"
 */
export function formatCompact(amount: number): string {
  if (amount >= 1_000_000) {
    const val = (amount / 1_000_000).toFixed(2).replace(/\.?0+$/, '')
    return `UGX ${val}M`
  }
  if (amount >= 1_000) {
    const val = (amount / 1_000).toFixed(1).replace(/\.?0+$/, '')
    return `UGX ${val}K`
  }
  return formatUGX(amount)
}

// ── Time Formatting ───────────────────────────────────────────────────────────

/**
 * Returns a human-readable relative time string: "2 hours ago", "3 days ago"
 */
export function timeAgo(date: string): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diffMs = now - then

  if (isNaN(then)) return 'Unknown time'

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`
  if (weeks < 5) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`
  return `${years} ${years === 1 ? 'year' : 'years'} ago`
}

// ── String Helpers ────────────────────────────────────────────────────────────

/**
 * Returns initials from a full name: "John Doe" → "JD", "Alice" → "A"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Truncates text to maxLength, appending "…" if needed
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

// ── Milestone Utilities ───────────────────────────────────────────────────────

/**
 * Returns a Tailwind text color class for a given milestone status
 */
export function getMilestoneStatusColor(status: MilestoneStatus | string): string {
  const colorMap: Record<string, string> = {
    pending: 'text-mist-500',
    in_progress: 'text-blue-600',
    submitted: 'text-amber-600',
    approved: 'text-emerald-600',
    revision_requested: 'text-copper-700',
    disputed: 'text-red-600',
  }
  return colorMap[status] ?? 'text-mist-500'
}

// ── Contract Progress ─────────────────────────────────────────────────────────

export interface ContractProgress {
  completed: number
  total: number
  percentage: number
}

/**
 * Calculates contract completion progress from milestone statuses
 */
export function getContractProgress(milestones: Milestone[]): ContractProgress {
  const total = milestones.length
  if (total === 0) return { completed: 0, total: 0, percentage: 0 }
  const completed = milestones.filter((m) => m.status === 'approved').length
  const percentage = Math.round((completed / total) * 100)
  return { completed, total, percentage }
}

// ── Class Name Merger ─────────────────────────────────────────────────────────

/**
 * Simple className merger — filters falsy values and joins with a space.
 * Use in place of clsx/classnames for lightweight class composition.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
