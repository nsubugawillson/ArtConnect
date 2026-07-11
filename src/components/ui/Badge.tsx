// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Badge & StatusBadge Components
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'
import type { MilestoneStatus } from '../../lib/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export type BadgeVariant =
  | 'copper'
  | 'mist'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'

export type BadgeSize = 'sm' | 'md'

export interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
  children?: React.ReactNode
  dot?: boolean
}

// ── Style Maps ────────────────────────────────────────────────────────────────

const variantStyles: Record<BadgeVariant, string> = {
  copper: 'bg-copper-700/10 text-copper-700 border border-copper-700/20',
  mist: 'bg-mist-100 text-mist-500 border border-mist-200',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  danger: 'bg-red-50 text-red-600 border border-red-200',
  info: 'bg-blue-50 text-blue-600 border border-blue-200',
}

const dotStyles: Record<BadgeVariant, string> = {
  copper: 'bg-copper-700',
  mist: 'bg-mist-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
}

// ── Badge Component ───────────────────────────────────────────────────────────

export const Badge: React.FC<BadgeProps> = ({
  variant = 'mist',
  size = 'md',
  className = '',
  children,
  dot = false,
}) => {
  return (
    <span
      className={[
        'inline-flex items-center font-medium rounded-full font-inter whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {dot && (
        <span
          className={[
            'shrink-0 rounded-full',
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
            dotStyles[variant],
          ].join(' ')}
        />
      )}
      {children}
    </span>
  )
}

// ── StatusBadge Component ─────────────────────────────────────────────────────

const milestoneStatusConfig: Record<
  MilestoneStatus,
  { variant: BadgeVariant; label: string }
> = {
  pending: { variant: 'mist', label: 'Pending' },
  in_progress: { variant: 'info', label: 'In Progress' },
  submitted: { variant: 'warning', label: 'Submitted' },
  approved: { variant: 'success', label: 'Approved' },
  revision_requested: { variant: 'copper', label: 'Revision Requested' },
  disputed: { variant: 'danger', label: 'Disputed' },
}

export interface StatusBadgeProps {
  status: MilestoneStatus
  size?: BadgeSize
  className?: string
  showDot?: boolean
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
  showDot = true,
}) => {
  const config = milestoneStatusConfig[status] ?? {
    variant: 'mist' as BadgeVariant,
    label: status,
  }

  return (
    <Badge
      variant={config.variant}
      size={size}
      dot={showDot}
      className={className}
    >
      {config.label}
    </Badge>
  )
}

// ── Category Label Badge ──────────────────────────────────────────────────────

export type DesignerSpecializationLabel =
  | 'graphic'
  | 'industrial'
  | 'branding'
  | 'ui_ux'
  | 'motion'
  | 'packaging'

const specializationLabels: Record<DesignerSpecializationLabel, string> = {
  graphic: 'Graphic',
  industrial: 'Industrial',
  branding: 'Branding',
  ui_ux: 'UI/UX',
  motion: 'Motion',
  packaging: 'Packaging',
}

export interface CategoryBadgeProps {
  category: DesignerSpecializationLabel
  size?: BadgeSize
  className?: string
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  className = '',
}) => (
  <Badge variant="copper" size={size} className={className}>
    {specializationLabels[category] ?? category}
  </Badge>
)

export default Badge
