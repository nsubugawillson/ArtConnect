// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Designer Portfolio Management Screen
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CreditCard as Edit2, Shield, CheckCircle, X, Image as ImageIcon, Tag, AlertCircle, ChevronRight, ExternalLink, Star, Eye } from 'lucide-react'
import { useStore } from '../../lib/store'
import { Header } from '../../components/layout/Header'
import { BottomNav } from '../../components/layout/BottomNav'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Badge, CategoryBadge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import type { DesignerSpecialization } from '../../lib/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface PortfolioItemData {
  id: string
  title: string
  category: DesignerSpecialization
  image_url: string
  description: string
  tags: string[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

const UNSPLASH_COVERS = [
  'https://images.unsplash.com/photo-1541701494672-9d96629bd31c?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1586717799252-bd134ad00e26?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop',
]

const SPECIALIZATION_OPTIONS: { value: DesignerSpecialization; label: string }[] = [
  { value: 'graphic', label: 'Graphic Design' },
  { value: 'industrial', label: 'Industrial Design' },
  { value: 'branding', label: 'Branding' },
  { value: 'ui_ux', label: 'UI/UX Design' },
  { value: 'motion', label: 'Motion Graphics' },
  { value: 'packaging', label: 'Packaging Design' },
]

const DEMO_PORTFOLIO_ITEMS: PortfolioItemData[] = [
  {
    id: 'pf-001',
    title: 'Kampala Coffee Rebrand',
    category: 'branding',
    image_url: UNSPLASH_COVERS[0],
    description: 'Complete brand identity for a specialty coffee shop in Kampala.',
    tags: ['logo', 'identity', 'packaging'],
  },
  {
    id: 'pf-002',
    title: 'FinTech App Dashboard',
    category: 'ui_ux',
    image_url: UNSPLASH_COVERS[3],
    description: 'Mobile-first dashboard design for a Ugandan fintech startup.',
    tags: ['figma', 'mobile', 'fintech'],
  },
  {
    id: 'pf-003',
    title: 'Botanical Skincare Packaging',
    category: 'packaging',
    image_url: UNSPLASH_COVERS[1],
    description: 'Premium eco-friendly packaging for artisan skincare range.',
    tags: ['packaging', 'print', 'eco'],
  },
  {
    id: 'pf-004',
    title: 'NGO Annual Report',
    category: 'graphic',
    image_url: UNSPLASH_COVERS[2],
    description: 'Multi-page editorial design for an East African NGO.',
    tags: ['editorial', 'print', 'infographics'],
  },
]

// ── Input component ───────────────────────────────────────────────────────────

interface FormInputProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  hint?: string
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-charcoal-900 font-inter uppercase tracking-wide">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={[
        'w-full h-10 px-3 rounded-xl border text-sm font-inter',
        'bg-white border-mist-200 text-charcoal-900',
        'placeholder:text-mist-300',
        'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700',
        'transition-colors duration-200',
      ].join(' ')}
    />
    {hint && <p className="text-[10px] text-mist-400 font-inter">{hint}</p>}
  </div>
)

// ── Add Portfolio Item Modal ──────────────────────────────────────────────────

interface AddWorkModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (item: PortfolioItemData) => void
}

const AddWorkModal: React.FC<AddWorkModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<DesignerSpecialization>('graphic')
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')

  const handleSubmit = () => {
    if (!title.trim()) return
    const newItem: PortfolioItemData = {
      id: `pf-${Date.now()}`,
      title: title.trim(),
      category,
      image_url: imageUrl.trim() || UNSPLASH_COVERS[0],
      description: description.trim(),
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }
    onAdd(newItem)
    // reset
    setTitle('')
    setCategory('graphic')
    setImageUrl('')
    setDescription('')
    setTags('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Portfolio Work" size="lg">
      <div className="space-y-4 pt-1 pb-2">
        <FormInput
          label="Title"
          value={title}
          onChange={setTitle}
          placeholder="e.g. Brand Identity for Coffee Shop"
        />

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-charcoal-900 font-inter uppercase tracking-wide">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as DesignerSpecialization)}
            className={[
              'w-full h-10 px-3 rounded-xl border text-sm font-inter appearance-none',
              'bg-white border-mist-200 text-charcoal-900',
              'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700',
              'transition-colors duration-200',
            ].join(' ')}
          >
            {SPECIALIZATION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <FormInput
          label="Image URL"
          value={imageUrl}
          onChange={setImageUrl}
          placeholder="https://images.unsplash.com/..."
          hint="Paste an Unsplash URL or leave blank for a placeholder image"
        />

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-charcoal-900 font-inter uppercase tracking-wide">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this project briefly..."
            rows={3}
            className={[
              'w-full px-3 py-2.5 rounded-xl border text-sm font-inter resize-none',
              'bg-white border-mist-200 text-charcoal-900',
              'placeholder:text-mist-300',
              'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700',
              'transition-colors duration-200',
            ].join(' ')}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-charcoal-900 font-inter uppercase tracking-wide flex items-center gap-1.5">
            <Tag size={12} />
            Tags
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="logo, branding, identity"
            className={[
              'w-full h-10 px-3 rounded-xl border text-sm font-inter',
              'bg-white border-mist-200 text-charcoal-900',
              'placeholder:text-mist-300',
              'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700',
            ].join(' ')}
          />
          <p className="text-[10px] text-mist-400 font-inter">Separate tags with commas</p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleSubmit}
            disabled={!title.trim()}
          >
            Add to Portfolio
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ── Vetting Info Modal ────────────────────────────────────────────────────────

interface VettingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  submitted: boolean
}

const VettingModal: React.FC<VettingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  submitted,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={submitted ? 'Application Submitted!' : 'Designer Vetting Process'}
    size="md"
  >
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4 space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
            className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto"
          >
            <CheckCircle size={32} className="text-emerald-500" />
          </motion.div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-charcoal-900 font-grotesk">
              Application Received
            </h3>
            <p className="text-sm text-mist-500 font-inter leading-relaxed">
              Our team will review your portfolio within 24 hours. You will receive a notification once reviewed.
            </p>
          </div>
          <Button variant="primary" fullWidth onClick={onClose}>
            Got it
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4 pt-1 pb-2"
        >
          <div className="bg-mist-50 rounded-xl p-4 space-y-3">
            {[
              {
                step: '1',
                title: 'Portfolio Review',
                desc: 'Our curators assess the quality, consistency, and breadth of your work.',
              },
              {
                step: '2',
                title: 'Skills Assessment',
                desc: 'We verify your stated specializations against your submitted portfolio.',
              },
              {
                step: '3',
                title: 'Profile Approval',
                desc: 'Approved designers receive a Vetted badge and priority listing.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-copper-700/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[11px] font-bold text-copper-700 font-grotesk">
                    {item.step}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal-900 font-grotesk">
                    {item.title}
                  </p>
                  <p className="text-xs text-mist-500 font-inter">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 rounded-xl p-3 flex gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 font-inter leading-relaxed">
              Ensure your portfolio has at least 3 high-quality work samples before submitting.
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" fullWidth onClick={onClose}>
              Not Yet
            </Button>
            <Button variant="primary" fullWidth onClick={onSubmit}>
              Submit for Review
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </Modal>
)

// ── Watermarked Preview Modal ─────────────────────────────────────────────────

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  item: PortfolioItemData | null
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, item }) => {
  if (!item) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Portfolio Preview" size="lg">
      <div className="space-y-4">
        {/* Watermarked Image */}
        <div className="relative rounded-xl overflow-hidden bg-mist-100 aspect-video">
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          {/* Watermark Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="text-white text-6xl font-bold opacity-30"
              style={{
                transform: 'rotate(-45deg)',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              }}
            >
              WATERMARK
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-3">
          <div>
            <p className="text-xs text-mist-400 font-inter uppercase tracking-wide font-semibold">
              Title
            </p>
            <p className="text-sm font-semibold text-charcoal-900 font-grotesk mt-1">
              {item.title}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-mist-500 font-inter bg-mist-50 rounded-lg p-2.5">
            <div className="w-4 h-4 rounded-full bg-amber-300 shrink-0" />
            <span className="font-semibold">Download Disabled</span>
          </div>

          <p className="text-xs text-mist-400 font-inter italic">
            Screenshot protection enabled - Your work is watermarked and cannot be downloaded.
          </p>
        </div>

        {/* Close Button */}
        <Button variant="secondary" fullWidth onClick={onClose}>
          Close Preview
        </Button>
      </div>
    </Modal>
  )
}

// ── Portfolio Grid Item ───────────────────────────────────────────────────────

interface PortfolioGridItemProps {
  item: PortfolioItemData
  onEdit: (item: PortfolioItemData) => void
  onPreview: (item: PortfolioItemData) => void
}

const PortfolioGridItem: React.FC<PortfolioGridItemProps> = ({ item, onEdit, onPreview }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-2xl overflow-hidden bg-white border border-mist-100 shadow-sm"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-mist-100 overflow-hidden">
        <img
          src={item.image_url}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
          loading="lazy"
        />

        {/* Edit/Preview overlay */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 bg-charcoal-900/60 flex items-center justify-center gap-2"
            >
              <motion.button
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                onClick={() => onPreview(item)}
                className="flex items-center gap-2 bg-white/90 hover:bg-white text-charcoal-900 text-xs font-semibold font-inter px-3 py-2 rounded-lg transition-colors shadow-md"
              >
                <Eye size={13} strokeWidth={2} />
                Preview
              </motion.button>
              <motion.button
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                onClick={() => onEdit(item)}
                className="flex items-center gap-2 bg-white/90 hover:bg-white text-charcoal-900 text-xs font-semibold font-inter px-3 py-2 rounded-lg transition-colors shadow-md"
              >
                <Edit2 size={13} strokeWidth={2} />
                Edit
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <p className="text-sm font-semibold text-charcoal-900 font-grotesk truncate">
          {item.title}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <CategoryBadge category={item.category} size="sm" />
          {item.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-mist-400 font-inter"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export const MyPortfolio: React.FC = () => {
  const user = useStore((s) => s.user ?? s.currentUser)
  const designers = useStore((s) => s.designers)
  const initializeDemoData = useStore((s) => s.initializeDemoData)

  const [items, setItems] = useState<PortfolioItemData[]>(DEMO_PORTFOLIO_ITEMS)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [vettingModalOpen, setVettingModalOpen] = useState(false)
  const [vettingSubmitted, setVettingSubmitted] = useState(false)
  const [editItem, setEditItem] = useState<PortfolioItemData | null>(null)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewItem, setPreviewItem] = useState<PortfolioItemData | null>(null)
  const [tinNumber, setTinNumber] = useState('')
  const [isPortfolioSubmitted, setIsPortfolioSubmitted] = useState(false)

  useEffect(() => {
    initializeDemoData()
  }, [initializeDemoData])

  const designerId = user?.id ?? 'demo-designer-001'
  const designerProfile = designers.find((d) => d.user_id === designerId)
  const isVetted = designerProfile?.is_vetted ?? false
  const designerRating = designerProfile?.rating ?? 0
  const reviewCount = designerProfile?.completed_projects ?? 0

  const handleAddItem = (item: PortfolioItemData) => {
    setItems((prev) => [item, ...prev])
  }

  const handleVettingSubmit = () => {
    setVettingSubmitted(true)
  }

  const handleEditItem = (item: PortfolioItemData) => {
    setEditItem(item)
    setAddModalOpen(true)
  }

  const handlePreviewItem = (item: PortfolioItemData) => {
    setPreviewItem(item)
    setPreviewModalOpen(true)
  }

  const handlePortfolioSubmit = () => {
    if (tinNumber.trim().length === 10) {
      setIsPortfolioSubmitted(true)
      setTinNumber('')
    }
  }

  return (
    <div className="min-h-screen bg-mist-50 pb-24">
      <Header
        title="My Portfolio"
        showNotifications
        rightActions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setAddModalOpen(true)}
            leftIcon={<Plus size={14} strokeWidth={2.5} />}
          >
            Add Work
          </Button>
        }
      />

      <div className="px-4 pt-5 pb-6 space-y-5">
        {/* ── Designer Rating Display ──────────────────────────────────────────── */}
        {designerProfile && (
          <div className="flex items-center gap-2">
            {designerRating > 0 ? (
              <>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.floor(designerRating) ? 'fill-copper-700 text-copper-700' : 'text-mist-300'}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-copper-700 font-inter">
                  {designerRating.toFixed(1)}
                </span>
                <span className="text-sm text-mist-500 font-inter">
                  ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </>
            ) : (
              <span className="text-sm text-mist-400 font-inter">Rating: Not yet rated</span>
            )}
          </div>
        )}

        {/* ── Vetting Banner / TIN Form ───────────────────────────────────────── */}
        {!isVetted && !vettingSubmitted && !isPortfolioSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-red-50 border border-red-200 p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-charcoal-900 font-grotesk">
                  Your portfolio is not yet vetted
                </p>
                <p className="text-xs text-mist-500 font-inter mt-1 leading-relaxed">
                  You cannot receive job proposals until verified. Submit your TIN number for review.
                </p>
              </div>
            </div>

            {/* TIN Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-charcoal-900 font-inter uppercase tracking-wide">
                TIN Number
              </label>
              <input
                type="text"
                value={tinNumber}
                onChange={(e) => setTinNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit TIN"
                maxLength={10}
                className={[
                  'w-full h-10 px-3 rounded-xl border text-sm font-inter',
                  'bg-white border-mist-200 text-charcoal-900',
                  'placeholder:text-mist-300',
                  'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700',
                  'transition-colors duration-200',
                ].join(' ')}
              />
              <p className="text-[10px] text-mist-400 font-inter">10 digits required</p>
            </div>

            {/* Submit Button */}
            <Button
              variant="primary"
              fullWidth
              onClick={handlePortfolioSubmit}
              disabled={tinNumber.length !== 10}
            >
              Submit Portfolio for Review
            </Button>
          </motion.div>
        )}

        {/* ── Portfolio Submitted State ────────────────────────────────────────── */}
        {!isVetted && !vettingSubmitted && isPortfolioSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3"
          >
            <CheckCircle size={20} className="text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 font-grotesk">
                Portfolio Submitted
              </p>
              <p className="text-xs text-emerald-600 font-inter mt-0.5">
                Your portfolio is under review. You will be notified once verified.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Submitted State ──────────────────────────────────────────────────── */}
        {!isVetted && vettingSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3"
          >
            <CheckCircle size={20} className="text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 font-grotesk">
                Application Submitted
              </p>
              <p className="text-xs text-emerald-600 font-inter mt-0.5">
                Admin will review your portfolio within 24 hours
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Vetted Badge ─────────────────────────────────────────────────────── */}
        {isVetted && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <Shield size={16} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-800 font-grotesk">
                Verified Designer
              </p>
              <p className="text-xs text-emerald-600 font-inter">
                Your profile is vetted and publicly visible
              </p>
            </div>
            <Badge variant="success" size="sm" dot>Vetted</Badge>
          </div>
        )}

        {/* ── Stats Row ────────────────────────────────────────────────────────── */}
        <div className="flex gap-3">
          {[
            { label: 'Portfolio Items', value: items.length },
            { label: 'Categories', value: new Set(items.map((i) => i.category)).size },
          ].map((s) => (
            <div
              key={s.label}
              className="flex-1 bg-white border border-mist-100 rounded-xl p-3 text-center"
            >
              <p className="text-xl font-bold font-grotesk text-charcoal-900">{s.value}</p>
              <p className="text-[11px] text-mist-400 font-inter mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Portfolio Grid ───────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-charcoal-900 font-grotesk">
              My Work
            </h2>
            {items.length > 0 && (
              <button className="flex items-center gap-1 text-xs text-mist-400 font-inter hover:text-copper-700 transition-colors">
                <ExternalLink size={12} strokeWidth={2} />
                View public profile
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border-2 border-dashed border-mist-200 p-12 text-center space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-mist-100 flex items-center justify-center mx-auto">
                <ImageIcon size={24} className="text-mist-300" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-charcoal-900 font-grotesk">
                  No portfolio items yet
                </p>
                <p className="text-xs text-mist-400 font-inter mt-1">
                  Showcase your best work to attract clients
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setAddModalOpen(true)}
                leftIcon={<Plus size={14} strokeWidth={2.5} />}
              >
                Add Your First Work
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {items.map((item) => (
                <PortfolioGridItem
                  key={item.id}
                  item={item}
                  onEdit={handleEditItem}
                  onPreview={handlePreviewItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Submit for Vetting CTA (prominent, bottom) ──────────────────────── */}
        {!isVetted && !vettingSubmitted && items.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => setVettingModalOpen(true)}
              leftIcon={<Shield size={18} strokeWidth={2} />}
              className="shadow-lg shadow-copper-700/25"
            >
              Submit Portfolio for Vetting
            </Button>
            <p className="text-center text-xs text-mist-400 font-inter mt-2">
              Free to apply · Results within 24 hours
            </p>
          </motion.div>
        )}
      </div>

      {/* ── Add Work Modal ─────────────────────────────────────────────────────── */}
      <AddWorkModal
        isOpen={addModalOpen && !editItem}
        onClose={() => { setAddModalOpen(false); setEditItem(null) }}
        onAdd={handleAddItem}
      />

      {/* Edit modal reuses Add modal shape */}
      <Modal
        isOpen={addModalOpen && !!editItem}
        onClose={() => { setAddModalOpen(false); setEditItem(null) }}
        title="Edit Portfolio Item"
        size="lg"
      >
        <div className="py-4 text-center space-y-3">
          {editItem && (
            <>
              <img
                src={editItem.image_url}
                alt={editItem.title}
                className="w-full aspect-video object-cover rounded-xl"
              />
              <p className="text-sm font-semibold text-charcoal-900 font-grotesk">
                {editItem.title}
              </p>
              <CategoryBadge category={editItem.category} />
            </>
          )}
          <p className="text-xs text-mist-400 font-inter">
            Full edit functionality would connect to your storage backend in production.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (editItem) {
                  setItems((prev) => prev.filter((i) => i.id !== editItem.id))
                }
                setAddModalOpen(false)
                setEditItem(null)
              }}
              leftIcon={<X size={13} />}
            >
              Remove
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => { setAddModalOpen(false); setEditItem(null) }}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Vetting Modal ──────────────────────────────────────────────────────── */}
      <VettingModal
        isOpen={vettingModalOpen}
        onClose={() => setVettingModalOpen(false)}
        onSubmit={handleVettingSubmit}
        submitted={vettingSubmitted}
      />

      {/* ── Preview Modal ──────────────────────────────────────────────────────── */}
      <PreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        item={previewItem}
      />

      <BottomNav role="designer" />
    </div>
  )
}

export default MyPortfolio
