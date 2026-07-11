// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – DesignerCard Component
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, CheckCircle2, Briefcase } from 'lucide-react'
import { Card } from '../ui/Card'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import type { DesignerWithUser } from '../../lib/store'
import type { DesignerSpecialization } from '../../lib/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DesignerCardProps {
  designer: DesignerWithUser
  onViewProfile?: (designerId: string) => void
  className?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const specializationLabel: Record<DesignerSpecialization, string> = {
  graphic: 'Graphic',
  industrial: 'Industrial',
  branding: 'Branding',
  ui_ux: 'UI/UX',
  motion: 'Motion',
  packaging: 'Packaging',
}

// Star rating renderer
const StarRating: React.FC<{ rating: number; size?: number }> = ({
  rating,
  size = 13,
}) => {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75
  const totalStars = 5

  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: totalStars }).map((_, i) => {
        let fill: string
        if (i < full) fill = '#A0430A'
        else if (i === full && hasHalf) fill = 'url(#half)'
        else fill = '#DFE8E6'

        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={fill}
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {i === full && hasHalf && (
              <defs>
                <linearGradient id="half" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="50%" stopColor="#A0430A" />
                  <stop offset="50%" stopColor="#DFE8E6" />
                </linearGradient>
              </defs>
            )}
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        )
      })}
    </span>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export const DesignerCard: React.FC<DesignerCardProps> = ({
  designer,
  onViewProfile,
  className = '',
}) => {
  const [coverError, setCoverError] = useState(false)

  const handleViewProfile = () => {
    onViewProfile?.(designer.user_id)
  }

  return (
    <Card
      variant="default"
      hoverable
      className={['w-full overflow-hidden', className].join(' ')}
      onClick={handleViewProfile}
    >
      {/* Portfolio Cover Image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-mist-100">
        {!coverError ? (
          <img
            src={designer.cover_image}
            alt={`${designer.name}'s portfolio`}
            className="w-full h-full object-cover"
            onError={() => setCoverError(true)}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-mist-100 to-mist-200 flex items-center justify-center">
            <span className="text-mist-400 text-sm font-inter">No image</span>
          </div>
        )}

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Vetted badge – top right */}
        {designer.is_vetted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="absolute top-3 right-3"
          >
            <span
              className={[
                'inline-flex items-center gap-1',
                'px-2 py-1 rounded-full',
                'bg-emerald-500/90 backdrop-blur-sm',
                'text-white text-[10px] font-semibold font-inter',
                'shadow-sm',
              ].join(' ')}
            >
              <CheckCircle2 size={11} strokeWidth={2.5} />
              Vetted
            </span>
          </motion.div>
        )}

        {/* Avatar overlapping bottom-left */}
        <div className="absolute -bottom-5 left-4">
          <Avatar
            src={designer.avatar_url}
            name={designer.name}
            size="lg"
            ring
            className="border-3 border-white shadow-md"
          />
        </div>
      </div>

      {/* Card Body */}
      <div className="pt-8 pb-4 px-4 space-y-3">
        {/* Name row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-charcoal-900 font-grotesk truncate">
              {designer.name}
            </h3>
            <p className="text-xs text-mist-500 font-inter truncate mt-0.5">
              {designer.location}
            </p>
          </div>

          {/* Rating */}
          {designer.rating > 0 ? (
            <div className="flex flex-col items-end shrink-0 gap-0.5">
              <StarRating rating={designer.rating} />
              <span className="text-[10px] text-charcoal-900 font-semibold font-grotesk">
                {designer.rating.toFixed(1)}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-mist-400 font-inter shrink-0">
              No reviews yet
            </span>
          )}
        </div>

        {/* Specializations */}
        <div className="flex flex-wrap gap-1.5">
          {designer.specializations.map((spec) => (
            <Badge key={spec} variant="copper" size="sm">
              {specializationLabel[spec] ?? spec}
            </Badge>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-1 text-xs text-mist-500 font-inter">
          <Briefcase size={12} strokeWidth={1.8} className="text-copper-700/60" />
          <span>
            {designer.completed_projects > 0
              ? `${designer.completed_projects} project${designer.completed_projects !== 1 ? 's' : ''} completed`
              : 'New designer'}
          </span>
        </div>

        {/* View Profile button */}
        <Button
          variant="outline"
          size="sm"
          fullWidth
          className="mt-1"
          onClick={(e) => {
            e.stopPropagation()
            handleViewProfile()
          }}
        >
          View Profile
        </Button>
      </div>
    </Card>
  )
}

// ── DesignerCardSkeleton ──────────────────────────────────────────────────────

export const DesignerCardSkeleton: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <div
    className={[
      'w-full rounded-2xl overflow-hidden bg-white border border-mist-100 animate-pulse',
      className,
    ].join(' ')}
  >
    <div className="aspect-[3/2] bg-mist-100" />
    <div className="pt-8 pb-4 px-4 space-y-3">
      <div className="h-4 w-2/3 bg-mist-100 rounded-lg" />
      <div className="flex gap-1.5">
        <div className="h-5 w-14 bg-mist-100 rounded-full" />
        <div className="h-5 w-10 bg-mist-100 rounded-full" />
      </div>
      <div className="h-3 w-1/2 bg-mist-100 rounded" />
      <div className="h-8 w-full bg-mist-100 rounded-xl" />
    </div>
  </div>
)

export default DesignerCard
