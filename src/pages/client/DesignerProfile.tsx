// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Designer Profile Screen
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  Star,
  MapPin,
  Briefcase,
  Clock,
  MessageCircle,
  ZoomIn,
  ThumbsUp,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import type { DesignerSpecialization } from '../../lib/types'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatUGX(n: number): string {
  return new Intl.NumberFormat('en-UG', { maximumFractionDigits: 0 }).format(n)
}

const specializationLabel: Record<DesignerSpecialization, string> = {
  graphic: 'Graphic Design',
  industrial: 'Industrial Design',
  branding: 'Branding',
  ui_ux: 'UI/UX Design',
  motion: 'Motion Design',
  packaging: 'Packaging',
}

// ── Star Rating ───────────────────────────────────────────────────────────────

const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 16 }) => {
  const full = Math.floor(rating)
  const total = 5
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={0}
          fill={i < full ? '#A0430A' : i === full && rating % 1 >= 0.5 ? '#D07040' : '#DFE8E6'}
        />
      ))}
    </span>
  )
}

// ── Mock Reviews ─────────────────────────────────────────────────────────────

const MOCK_REVIEWS = [
  {
    id: 'r1',
    name: 'Kemi Adeyemi',
    avatar: 'https://i.pravatar.cc/150?u=kemi.adeyemi',
    rating: 5,
    date: '2 weeks ago',
    comment:
      'Outstanding work and great communication throughout the project. Delivered exactly what we envisioned and even exceeded our expectations on the final handover package.',
  },
  {
    id: 'r2',
    name: 'Joseph Otieno',
    avatar: 'https://i.pravatar.cc/150?u=joseph.otieno',
    rating: 4,
    date: '1 month ago',
    comment:
      'Very professional and responsive designer. Took feedback well and made revisions promptly. Will definitely hire again for our next campaign.',
  },
]

// ── Portfolio Image ───────────────────────────────────────────────────────────

interface PortfolioImageProps {
  src: string
  alt: string
  index: number
}

const PortfolioImage: React.FC<PortfolioImageProps> = ({ src, alt, index }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.07, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="relative aspect-square rounded-2xl overflow-hidden bg-mist-100 cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center"
          >
            <ZoomIn size={24} className="text-white" strokeWidth={1.8} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Stat Pill ─────────────────────────────────────────────────────────────────

interface StatPillProps {
  icon: React.ElementType
  label: string
  value: string
}

const StatPill: React.FC<StatPillProps> = ({ icon: Icon, label, value }) => (
  <div className="flex-1 flex flex-col items-center gap-1.5 py-3 px-2">
    <div className="w-9 h-9 rounded-xl bg-copper-700/10 flex items-center justify-center">
      <Icon size={17} className="text-copper-700" strokeWidth={1.8} />
    </div>
    <span className="text-xs font-bold text-charcoal-900 font-grotesk text-center leading-snug">
      {value}
    </span>
    <span className="text-[10px] text-mist-400 font-inter text-center leading-none">{label}</span>
  </div>
)

// ── Main Component ────────────────────────────────────────────────────────────

const DesignerProfile: React.FC = () => {
  const navigate = useNavigate()
  const { designerId } = useParams<{ designerId: string }>()
  const { designers, initializeDemoData } = useStore()
  const [coverLoaded, setCoverLoaded] = useState(false)

  useEffect(() => {
    if (designers.length === 0) {
      initializeDemoData()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const designer = designers.find((d) => d.user_id === designerId)

  if (!designer) {
    return (
      <div className="min-h-screen bg-mist-100 flex flex-col items-center justify-center gap-4">
        <p className="text-mist-500 font-inter">Designer not found</p>
        <motion.button
          className="px-5 py-2.5 rounded-xl bg-copper-700 text-white text-sm font-inter"
          onClick={() => navigate('/client/browse')}
          whileTap={{ scale: 0.96 }}
        >
          Back to Browse
        </motion.button>
      </div>
    )
  }

  // Build portfolio images (duplicate for demo depth)
  const portfolioImages = [
    ...designer.portfolio_images,
    ...designer.portfolio_images,
    designer.cover_image,
  ].slice(0, 6)

  return (
    <div className="min-h-screen bg-mist-100 pb-28">
      <div className="max-w-md mx-auto">

        {/* ── Hero Section ────────────────────────────────────────────────── */}
        <div className="relative">
          {/* Cover image */}
          <div className="relative w-full aspect-[16/9] overflow-hidden bg-mist-200">
            <img
              src={designer.cover_image}
              alt={`${designer.name}'s portfolio cover`}
              className={[
                'w-full h-full object-cover transition-opacity duration-500',
                coverLoaded ? 'opacity-100' : 'opacity-0',
              ].join(' ')}
              onLoad={() => setCoverLoaded(true)}
            />
            {!coverLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-mist-200 to-mist-300 animate-pulse" />
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          </div>

          {/* Back button */}
          <motion.button
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
            onClick={() => navigate(-1)}
            whileTap={{ scale: 0.88 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ArrowLeft size={18} className="text-white" strokeWidth={2} />
          </motion.button>

          {/* Avatar – overlaps cover bottom edge */}
          <div className="absolute -bottom-10 left-4">
            <div className="relative">
              <Avatar
                src={designer.avatar_url}
                name={designer.name}
                size="xl"
                ring
                className="border-4 border-white shadow-xl"
              />
              {designer.is_vetted && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <CheckCircle2 size={13} className="text-white" strokeWidth={2.5} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Profile Body ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="mt-14 px-4 space-y-5"
        >

          {/* Name + vetted + location */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold text-charcoal-900 font-grotesk leading-tight">
                  {designer.name}
                </h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin size={13} strokeWidth={2} className="text-mist-400 shrink-0" />
                  <span className="text-sm text-mist-500 font-inter">{designer.location}</span>
                </div>
              </div>
              {designer.is_vetted && (
                <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium font-inter">
                  <CheckCircle2 size={12} strokeWidth={2.5} />
                  Vetted
                </span>
              )}
            </div>

            {/* Specialization badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {designer.specializations.map((spec) => (
                <Badge key={spec} variant="copper" size="sm">
                  {specializationLabel[spec] ?? spec}
                </Badge>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="bg-white rounded-2xl border border-mist-100 shadow-sm overflow-hidden">
            <div className="flex divide-x divide-mist-100">
              <StatPill
                icon={Star}
                label="Rating"
                value={designer.rating > 0 ? designer.rating.toFixed(1) : 'New'}
              />
              <StatPill
                icon={Briefcase}
                label="Projects"
                value={String(designer.completed_projects)}
              />
              <StatPill
                icon={Clock}
                label="Rate / hr"
                value={`UGX ${formatUGX(designer.hourly_rate)}`}
              />
            </div>
            {/* Rating stars underline */}
            {designer.rating > 0 && (
              <div className="px-4 pb-3 flex items-center gap-2">
                <StarRating rating={designer.rating} size={13} />
                <span className="text-xs text-mist-400 font-inter">
                  Based on {designer.completed_projects} project{designer.completed_projects !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="bg-white rounded-2xl border border-mist-100 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-charcoal-900 font-grotesk mb-2">About</h2>
            <p className="text-sm text-mist-500 font-inter leading-relaxed">{designer.bio}</p>
          </div>

          {/* Portfolio grid */}
          {portfolioImages.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-charcoal-900 font-grotesk mb-3">
                Portfolio
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                {portfolioImages.map((img, idx) => (
                  <PortfolioImage
                    key={`${img}-${idx}`}
                    src={img}
                    alt={`Portfolio work ${idx + 1}`}
                    index={idx}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-charcoal-900 font-grotesk">
                Client Reviews
              </h2>
              <span className="text-xs text-mist-400 font-inter">
                {MOCK_REVIEWS.length} reviews
              </span>
            </div>
            <div className="space-y-3">
              {MOCK_REVIEWS.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl border border-mist-100 shadow-sm p-4"
                >
                  <div className="flex items-start gap-3">
                    <Avatar src={review.avatar} name={review.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-charcoal-900 font-grotesk">
                          {review.name}
                        </p>
                        <span className="text-[10px] text-mist-300 font-inter">{review.date}</span>
                      </div>
                      <StarRating rating={review.rating} size={11} />
                      <p className="text-xs text-mist-500 font-inter leading-relaxed mt-1.5">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom spacer for sticky button */}
          <div className="h-4" />
        </motion.div>
      </div>

      {/* ── Sticky Hire Button ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-mist-100 p-4"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
      >
        <div className="max-w-md mx-auto flex gap-3">
          {/* Message button */}
          <motion.button
            className="w-12 h-12 rounded-2xl bg-mist-100 border border-mist-200 flex items-center justify-center shrink-0"
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate(`/inquiry/${designer.user_id}`)}
          >
            <MessageCircle size={20} strokeWidth={1.8} className="text-charcoal-700" />
          </motion.button>

          {/* Hire button */}
          <motion.button
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-copper-700 to-copper-600 text-white font-semibold font-inter text-sm shadow-lg shadow-copper-700/30 flex items-center justify-center gap-2"
            whileTap={{ scale: 0.97 }}
            onClick={() =>
              navigate(`/client/post-brief?designerId=${designer.user_id}`)
            }
          >
            <ThumbsUp size={18} strokeWidth={2} />
            Hire {designer.name.split(' ')[0]}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default DesignerProfile
