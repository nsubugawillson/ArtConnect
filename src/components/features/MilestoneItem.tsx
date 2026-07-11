// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – MilestoneItem Component
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Banknote,
  Play,
  Upload,
  ThumbsUp,
  RefreshCw,
  ClipboardList,
  FileText,
  Check,
} from 'lucide-react'
import { format, isValid, parseISO } from 'date-fns'
import { StatusBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import type { Milestone, MilestoneStatus, UserRole } from '../../lib/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MilestoneItemProps {
  milestone: Milestone
  userRole: UserRole
  onStatusChange?: (milestoneId: string, status: MilestoneStatus) => void
  onSubmit?: (milestoneId: string) => void
  onApprove?: (milestoneId: string) => void
  onRevision?: (milestoneId: string) => void
  isFirst?: boolean
  isLast?: boolean
  className?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatUGX(amount: number): string {
  return new Intl.NumberFormat('en-UG', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null
  const d = parseISO(dateStr)
  if (!isValid(d)) return null
  return format(d, 'MMM d, yyyy')
}

// Order index circle colours by status
const statusCircleConfig: Record<
  MilestoneStatus,
  { bg: string; text: string; ring: string }
> = {
  pending: { bg: 'bg-mist-100', text: 'text-mist-500', ring: 'ring-mist-200' },
  in_progress: { bg: 'bg-copper-700/10', text: 'text-copper-700', ring: 'ring-copper-700/30' },
  submitted: { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-300' },
  approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-300' },
  revision_requested: { bg: 'bg-copper-700/10', text: 'text-copper-700', ring: 'ring-copper-700/30' },
  disputed: { bg: 'bg-red-100', text: 'text-red-500', ring: 'ring-red-200' },
}

// ── Component ─────────────────────────────────────────────────────────────────

export const MilestoneItem: React.FC<MilestoneItemProps> = ({
  milestone,
  userRole,
  onStatusChange,
  onSubmit,
  onApprove,
  onRevision,
  isFirst = false,
  isLast = false,
  className = '',
}) => {
  const dueDate = formatDate(milestone.due_date)
  const circleConfig = statusCircleConfig[milestone.status]

  // ── Derive available actions by role + status ────────────────────────────────
  const showDesignerStart =
    userRole === 'designer' && milestone.status === 'pending'

  const showDesignerSubmit =
    userRole === 'designer' && milestone.status === 'in_progress'

  const showClientApprove =
    userRole === 'client' && milestone.status === 'submitted'

  const showClientRevision =
    userRole === 'client' && milestone.status === 'submitted'

  const isApproved = milestone.status === 'approved'

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleStart = () =>
    onStatusChange?.(milestone.id, 'in_progress')

  const handleSubmit = () =>
    onSubmit?.(milestone.id)

  const handleApprove = () =>
    onApprove?.(milestone.id)

  const handleRevision = () =>
    onRevision?.(milestone.id)

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={['flex gap-3', className].join(' ')}
    >
      {/* Left column: order circle + connector line */}
      <div className="flex flex-col items-center shrink-0">
        {/* Order number circle */}
        <div
          className={[
            'w-9 h-9 rounded-full flex items-center justify-center',
            'ring-2 shrink-0',
            circleConfig.bg,
            circleConfig.text,
            circleConfig.ring,
            'transition-colors duration-300',
          ].join(' ')}
          aria-label={`Milestone ${milestone.order_index}`}
        >
          {isApproved ? (
            <Check size={16} strokeWidth={2.5} />
          ) : (
            <span className="text-sm font-semibold font-grotesk">
              {milestone.order_index}
            </span>
          )}
        </div>

        {/* Connector line (hidden for last item) */}
        {!isLast && (
          <div
            className={[
              'w-0.5 flex-1 mt-1 min-h-[24px] rounded-full',
              isApproved ? 'bg-emerald-200' : 'bg-mist-200',
            ].join(' ')}
          />
        )}
      </div>

      {/* Right column: content */}
      <div
        className={[
          'flex-1 pb-5',
          isLast ? 'pb-2' : '',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-semibold text-charcoal-900 font-grotesk leading-snug">
                {milestone.title}
              </h4>
              {milestone.mrr_required && (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-medium font-inter"
                  title="Material Requirements Record required"
                >
                  <ClipboardList size={10} strokeWidth={2} />
                  MRR
                </span>
              )}
            </div>
          </div>
          <StatusBadge status={milestone.status} size="sm" className="shrink-0" />
        </div>

        {/* Description */}
        <p className="text-xs text-mist-500 font-inter leading-relaxed mb-3">
          {milestone.description}
        </p>

        {/* Meta row: amount + due date */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5">
            <Banknote size={13} className="text-copper-700/60 shrink-0" strokeWidth={1.8} />
            <span className="text-xs font-semibold text-charcoal-900 font-grotesk">
              UGX {formatUGX(milestone.amount)}
            </span>
          </div>

          {dueDate && (
            <div className="flex items-center gap-1.5 text-xs text-mist-400 font-inter">
              <Calendar size={12} strokeWidth={1.8} className="shrink-0" />
              <span>Due {dueDate}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {(showDesignerStart || showDesignerSubmit || showClientApprove) && (
          <div className="flex items-center gap-2 flex-wrap">
            {showDesignerStart && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStart}
                leftIcon={<Play size={13} strokeWidth={2} />}
              >
                Start Work
              </Button>
            )}

            {showDesignerSubmit && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                leftIcon={<Upload size={13} strokeWidth={2} />}
              >
                Submit Milestone
              </Button>
            )}

            {showClientApprove && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApprove}
                  leftIcon={<ThumbsUp size={13} strokeWidth={2} />}
                >
                  Approve
                </Button>
                {showClientRevision && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRevision}
                    leftIcon={<RefreshCw size={13} strokeWidth={2} />}
                  >
                    Request Revision
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {/* Approved confirmation strip */}
        {isApproved && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-inter">
              <Check size={13} strokeWidth={2.5} />
              <span>Funds released to designer</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-inter">
              <FileText size={13} strokeWidth={2} />
              <span>Files released to client</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── MilestoneList ─────────────────────────────────────────────────────────────

export interface MilestoneListProps {
  milestones: Milestone[]
  userRole: UserRole
  onStatusChange?: (milestoneId: string, status: MilestoneStatus) => void
  onSubmit?: (milestoneId: string) => void
  onApprove?: (milestoneId: string) => void
  onRevision?: (milestoneId: string) => void
  className?: string
}

export const MilestoneList: React.FC<MilestoneListProps> = ({
  milestones,
  userRole,
  onStatusChange,
  onSubmit,
  onApprove,
  onRevision,
  className = '',
}) => {
  const sorted = [...milestones].sort((a, b) => a.order_index - b.order_index)

  return (
    <div className={['space-y-0', className].join(' ')}>
      {sorted.map((milestone, index) => (
        <MilestoneItem
          key={milestone.id}
          milestone={milestone}
          userRole={userRole}
          onStatusChange={onStatusChange}
          onSubmit={onSubmit}
          onApprove={onApprove}
          onRevision={onRevision}
          isFirst={index === 0}
          isLast={index === sorted.length - 1}
        />
      ))}
    </div>
  )
}

export default MilestoneItem
