// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – ProjectCard Component
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'
import { Calendar, Banknote, AlertCircle } from 'lucide-react'
import { format, isValid, parseISO } from 'date-fns'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Avatar } from '../ui/Avatar'
import type { Project, ProjectStatus, DesignerSpecialization } from '../../lib/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProjectCardProps {
  project: Project
  clientName?: string
  clientAvatar?: string | null
  onClick?: (projectId: string) => void
  className?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatUGX(amount: number): string {
  return new Intl.NumberFormat('en-UG', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDeadline(dateStr: string | null): string | null {
  if (!dateStr) return null
  const date = parseISO(dateStr)
  if (!isValid(date)) return null
  return format(date, 'MMM d, yyyy')
}

const statusConfig: Record<
  ProjectStatus,
  { label: string; variant: 'copper' | 'mist' | 'success' | 'warning' | 'danger' | 'info' }
> = {
  draft: { label: 'Draft', variant: 'mist' },
  open: { label: 'Open', variant: 'success' },
  in_progress: { label: 'In Progress', variant: 'info' },
  completed: { label: 'Completed', variant: 'mist' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
  disputed: { label: 'Disputed', variant: 'warning' },
}

const categoryLabels: Record<DesignerSpecialization, string> = {
  graphic: 'Graphic Design',
  industrial: 'Industrial Design',
  branding: 'Branding',
  ui_ux: 'UI/UX Design',
  motion: 'Motion Design',
  packaging: 'Packaging',
}

const MAX_DESCRIPTION_LENGTH = 110

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '…'
}

// ── Component ─────────────────────────────────────────────────────────────────

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  clientName,
  clientAvatar,
  onClick,
  className = '',
}) => {
  const statusConf = statusConfig[project.status] ?? statusConfig.open
  const deadline = formatDeadline(project.deadline)
  const description = truncate(project.description, MAX_DESCRIPTION_LENGTH)

  const handleClick = () => onClick?.(project.id)

  return (
    <Card
      variant="default"
      hoverable={Boolean(onClick)}
      onClick={onClick ? handleClick : undefined}
      className={['w-full', className].join(' ')}
    >
      <div className="p-4 space-y-3">
        {/* Header row: category + status */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Badge variant="copper" size="sm">
            {categoryLabels[project.category] ?? project.category}
          </Badge>
          <div className="flex items-center gap-1.5">
            {project.requires_mrr && (
              <Badge variant="warning" size="sm" dot>
                MRR Required
              </Badge>
            )}
            <Badge variant={statusConf.variant} size="sm" dot>
              {statusConf.label}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-charcoal-900 font-grotesk leading-snug">
            {project.title}
          </h3>
          <p className="text-xs text-mist-500 font-inter leading-relaxed">
            {description}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-mist-100" />

        {/* Footer row */}
        <div className="flex items-center justify-between gap-2">
          {/* Budget */}
          <div className="flex items-center gap-1.5">
            <Banknote size={14} className="text-copper-700/70 shrink-0" strokeWidth={1.8} />
            <div>
              <p className="text-[10px] text-mist-400 font-inter leading-none mb-0.5">
                Budget
              </p>
              <p className="text-sm font-semibold text-charcoal-900 font-grotesk leading-none">
                UGX {formatUGX(project.budget)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Deadline */}
            {deadline && (
              <div className="flex items-center gap-1 text-xs text-mist-500 font-inter">
                <Calendar size={12} strokeWidth={1.8} className="shrink-0" />
                <span>{deadline}</span>
              </div>
            )}

            {/* Client avatar */}
            {clientName && (
              <Avatar
                src={clientAvatar}
                name={clientName}
                size="xs"
                className="shrink-0"
              />
            )}
          </div>
        </div>

        {/* MRR info banner */}
        {project.requires_mrr && (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
            <AlertCircle
              size={13}
              className="text-amber-600 shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <p className="text-[11px] text-amber-700 font-inter leading-snug">
              This project requires Material Requirements Record (MRR) documentation
              from the designer.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

// ── ProjectCardSkeleton ───────────────────────────────────────────────────────

export const ProjectCardSkeleton: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <div
    className={[
      'w-full rounded-2xl bg-white border border-mist-100 animate-pulse p-4 space-y-3',
      className,
    ].join(' ')}
  >
    <div className="flex items-center justify-between">
      <div className="h-5 w-24 bg-mist-100 rounded-full" />
      <div className="h-5 w-16 bg-mist-100 rounded-full" />
    </div>
    <div className="space-y-2">
      <div className="h-4 w-3/4 bg-mist-100 rounded" />
      <div className="h-3 w-full bg-mist-100 rounded" />
      <div className="h-3 w-2/3 bg-mist-100 rounded" />
    </div>
    <div className="border-t border-mist-100" />
    <div className="flex items-center justify-between">
      <div className="h-5 w-32 bg-mist-100 rounded" />
      <div className="h-3 w-20 bg-mist-100 rounded" />
    </div>
  </div>
)

export default ProjectCard
