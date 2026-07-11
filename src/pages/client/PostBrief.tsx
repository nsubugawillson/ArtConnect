// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Post a Project Brief (Multi-Step Form)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Info,
  FileText,
  Settings,
  Eye,
  Banknote,
  Calendar,
  Tag,
  AlertCircle,
  Check,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import type { DesignerSpecialization, ProjectStatus } from '../../lib/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BriefFormData {
  title: string
  description: string
  category: DesignerSpecialization | ''
  budget: string
  deadline: string
  requiresMRR: boolean
  additionalNotes: string
}

type FormStep = 1 | 2 | 3

interface CategoryOption {
  value: DesignerSpecialization
  label: string
  description: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES: CategoryOption[] = [
  { value: 'graphic', label: 'Graphic Design', description: 'Logos, posters, illustrations' },
  { value: 'industrial', label: 'Industrial Design', description: 'Product & physical design' },
  { value: 'branding', label: 'Branding', description: 'Brand identity & strategy' },
  { value: 'ui_ux', label: 'UI/UX Design', description: 'Apps, websites, prototypes' },
  { value: 'motion', label: 'Motion Design', description: 'Animation & video' },
  { value: 'packaging', label: 'Packaging', description: 'Product packaging & labels' },
]

const MRR_CATEGORIES: DesignerSpecialization[] = ['industrial', 'packaging']

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatBudgetInput(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('en-UG').format(Number(digits))
}

function parseBudget(formatted: string): number {
  return Number(formatted.replace(/[^\d]/g, '')) || 0
}

function formatUGX(n: number): string {
  return new Intl.NumberFormat('en-UG', { maximumFractionDigits: 0 }).format(n)
}

function estimateTimeline(deadline: string): string {
  if (!deadline) return 'TBD'
  const days = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  if (days <= 0) return 'Overdue'
  if (days < 7) return `${days} days`
  if (days < 30) return `${Math.round(days / 7)} weeks`
  return `${Math.round(days / 30)} months`
}

// ── Progress Indicator ────────────────────────────────────────────────────────

interface StepIndicatorProps {
  current: FormStep
  total: number
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ current, total }) => {
  const steps = [
    { n: 1 as FormStep, icon: FileText, label: 'Details' },
    { n: 2 as FormStep, icon: Settings, label: 'Requirements' },
    { n: 3 as FormStep, icon: Eye, label: 'Review' },
  ]

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, idx) => {
        const Icon = step.icon
        const isDone = current > step.n
        const isActive = current === step.n

        return (
          <React.Fragment key={step.n}>
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={
                  isDone
                    ? { backgroundColor: '#16a34a', scale: 1 }
                    : isActive
                    ? { backgroundColor: '#A0430A', scale: 1.05 }
                    : { backgroundColor: '#DFE8E6', scale: 1 }
                }
                transition={{ duration: 0.3 }}
                className="w-9 h-9 rounded-full flex items-center justify-center"
              >
                {isDone ? (
                  <Check size={16} className="text-white" strokeWidth={2.5} />
                ) : (
                  <Icon
                    size={15}
                    strokeWidth={2}
                    className={isActive ? 'text-white' : 'text-mist-400'}
                  />
                )}
              </motion.div>
              <span
                className={[
                  'text-[10px] font-inter font-medium',
                  isActive ? 'text-copper-700' : isDone ? 'text-emerald-600' : 'text-mist-400',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {idx < total - 1 && (
              <div className="flex-1 h-0.5 mb-4 mx-1">
                <motion.div
                  className="h-full rounded-full"
                  animate={{
                    backgroundColor: current > step.n ? '#16a34a' : '#DFE8E6',
                  }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ── Toast notification ────────────────────────────────────────────────────────

interface ToastProps {
  message: string
  visible: boolean
}

const Toast: React.FC<ToastProps> = ({ message, visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.95 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        className="fixed bottom-8 left-4 right-4 z-50 max-w-md mx-auto"
      >
        <div className="bg-charcoal-900 text-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-2xl shadow-charcoal-900/40">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" strokeWidth={2} />
          <span className="text-sm font-inter font-medium">{message}</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
)

// ── Step 1: Project Details ───────────────────────────────────────────────────

interface Step1Props {
  data: BriefFormData
  onChange: (field: keyof BriefFormData, value: string | boolean) => void
  errors: Partial<Record<keyof BriefFormData, string>>
}

const Step1: React.FC<Step1Props> = ({ data, onChange, errors }) => {
  const descLength = data.description.length
  const descMin = 100

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-1.5">
          Project Title <span className="text-copper-700">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Brand Identity for Coffee Shop"
          value={data.title}
          onChange={(e) => onChange('title', e.target.value)}
          className={[
            'w-full h-11 px-3.5 rounded-2xl border text-sm text-charcoal-900 font-inter',
            'placeholder:text-mist-300 bg-white',
            'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700/50 transition-all',
            errors.title ? 'border-red-300 bg-red-50' : 'border-mist-200',
          ].join(' ')}
          maxLength={80}
        />
        {errors.title && (
          <p className="text-xs text-red-500 font-inter mt-1">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-1.5">
          Project Description <span className="text-copper-700">*</span>
        </label>
        <div className="relative">
          <textarea
            placeholder="Describe your project goals, target audience, deliverables, and any specific requirements…"
            value={data.description}
            onChange={(e) => onChange('description', e.target.value)}
            rows={5}
            className={[
              'w-full px-3.5 pt-3 pb-8 rounded-2xl border text-sm text-charcoal-900 font-inter',
              'placeholder:text-mist-300 bg-white resize-none',
              'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700/50 transition-all',
              errors.description ? 'border-red-300 bg-red-50' : 'border-mist-200',
            ].join(' ')}
          />
          {/* Character counter */}
          <div className="absolute bottom-2.5 right-3 flex items-center gap-1">
            <span
              className={[
                'text-[10px] font-inter',
                descLength >= descMin ? 'text-emerald-500 font-semibold' : 'text-mist-400',
              ].join(' ')}
            >
              {descLength}/{descMin}
            </span>
            {descLength >= descMin && (
              <Check size={10} className="text-emerald-500" strokeWidth={3} />
            )}
          </div>
        </div>
        {errors.description && (
          <p className="text-xs text-red-500 font-inter mt-1">{errors.description}</p>
        )}
        {descLength < descMin && (
          <p className="text-xs text-mist-400 font-inter mt-1">
            At least {descMin - descLength} more characters needed for a good brief
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-2">
          Category <span className="text-copper-700">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = data.category === cat.value
            return (
              <motion.button
                key={cat.value}
                type="button"
                onClick={() => onChange('category', cat.value)}
                whileTap={{ scale: 0.96 }}
                className={[
                  'p-3 rounded-2xl border text-left transition-all duration-200',
                  isSelected
                    ? 'bg-copper-700/10 border-copper-700 ring-1 ring-copper-700/30'
                    : 'bg-white border-mist-200 hover:border-copper-700/30',
                ].join(' ')}
              >
                <p
                  className={[
                    'text-xs font-semibold font-grotesk',
                    isSelected ? 'text-copper-700' : 'text-charcoal-800',
                  ].join(' ')}
                >
                  {cat.label}
                </p>
                <p className="text-[10px] text-mist-400 font-inter mt-0.5">{cat.description}</p>
              </motion.button>
            )
          })}
        </div>
        {errors.category && (
          <p className="text-xs text-red-500 font-inter mt-1">{errors.category}</p>
        )}
      </div>

      {/* Budget */}
      <div>
        <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-1.5">
          Budget (UGX) <span className="text-copper-700">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-mist-400 font-inter">
            UGX
          </span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={data.budget}
            onChange={(e) => onChange('budget', formatBudgetInput(e.target.value))}
            className={[
              'w-full h-11 pl-12 pr-3.5 rounded-2xl border text-sm text-charcoal-900 font-inter font-semibold',
              'placeholder:text-mist-300 bg-white',
              'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700/50 transition-all',
              errors.budget ? 'border-red-300 bg-red-50' : 'border-mist-200',
            ].join(' ')}
          />
        </div>
        {errors.budget && (
          <p className="text-xs text-red-500 font-inter mt-1">{errors.budget}</p>
        )}
        {parseBudget(data.budget) > 0 && (
          <p className="text-xs text-mist-400 font-inter mt-1">
            = UGX {formatUGX(parseBudget(data.budget))}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Step 2: Requirements ──────────────────────────────────────────────────────

interface Step2Props {
  data: BriefFormData
  onChange: (field: keyof BriefFormData, value: string | boolean) => void
  errors: Partial<Record<keyof BriefFormData, string>>
}

const Step2: React.FC<Step2Props> = ({ data, onChange, errors }) => {
  const [showMRRTooltip, setShowMRRTooltip] = useState(false)
  const showMRRToggle = MRR_CATEGORIES.includes(data.category as DesignerSpecialization)

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 3)
  const minDateStr = minDate.toISOString().split('T')[0]

  return (
    <div className="space-y-5">
      {/* Deadline */}
      <div>
        <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-1.5 flex items-center gap-1.5">
          <Calendar size={13} strokeWidth={2} className="text-copper-700" />
          Deadline <span className="text-copper-700">*</span>
        </label>
        <input
          type="date"
          min={minDateStr}
          value={data.deadline}
          onChange={(e) => onChange('deadline', e.target.value)}
          className={[
            'w-full h-11 px-3.5 rounded-2xl border text-sm text-charcoal-900 font-inter bg-white',
            'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700/50 transition-all',
            errors.deadline ? 'border-red-300 bg-red-50' : 'border-mist-200',
          ].join(' ')}
        />
        {errors.deadline && (
          <p className="text-xs text-red-500 font-inter mt-1">{errors.deadline}</p>
        )}
        {data.deadline && (
          <p className="text-xs text-mist-400 font-inter mt-1">
            Estimated timeline: {estimateTimeline(data.deadline)}
          </p>
        )}
      </div>

      {/* MRR Toggle – only for industrial/packaging */}
      {showMRRToggle && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-amber-800 font-grotesk">
                  Requires MRR
                </p>
                <button
                  type="button"
                  onClick={() => setShowMRRTooltip((v) => !v)}
                  className="text-amber-600"
                >
                  <Info size={14} strokeWidth={2} />
                </button>
              </div>
              <p className="text-xs text-amber-700 font-inter">
                Material Requirements Record documentation
              </p>
            </div>

            {/* Toggle switch */}
            <motion.button
              type="button"
              onClick={() => onChange('requiresMRR', !data.requiresMRR)}
              className={[
                'relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 mt-0.5',
                data.requiresMRR ? 'bg-amber-600' : 'bg-mist-200',
              ].join(' ')}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                animate={{ x: data.requiresMRR ? 26 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>

          <AnimatePresence>
            {showMRRTooltip && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-3 pt-3 border-t border-amber-200"
              >
                <p className="text-xs text-amber-700 font-inter leading-relaxed">
                  An MRR (Material Requirements Record) is a document provided by the designer
                  listing all materials, specifications, and sourcing details required to produce
                  your physical product. It helps ensure your design is manufacturable and
                  cost-effective.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Additional notes */}
      <div>
        <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-1.5">
          Additional Notes <span className="text-mist-400 font-normal">(optional)</span>
        </label>
        <textarea
          placeholder="Any references, inspiration, brand guidelines, or other details to share with the designer…"
          value={data.additionalNotes}
          onChange={(e) => onChange('additionalNotes', e.target.value)}
          rows={5}
          className="w-full px-3.5 py-3 rounded-2xl border border-mist-200 text-sm text-charcoal-900 font-inter placeholder:text-mist-300 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700/50 transition-all"
        />
      </div>

      {/* Hint card */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-100">
        <AlertCircle size={14} className="text-blue-500 shrink-0 mt-0.5" strokeWidth={2} />
        <p className="text-xs text-blue-700 font-inter leading-relaxed">
          The more detail you provide, the better matched proposals you will receive from
          designers.
        </p>
      </div>
    </div>
  )
}

// ── Step 3: Review & Post ─────────────────────────────────────────────────────

interface Step3Props {
  data: BriefFormData
  isSubmitting: boolean
  onPost: () => void
}

const Step3: React.FC<Step3Props> = ({ data, isSubmitting, onPost }) => {
  const category = CATEGORIES.find((c) => c.value === data.category)

  return (
    <div className="space-y-4">
      {/* Review card */}
      <div className="bg-white rounded-2xl border border-mist-100 shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-mist-100 bg-gradient-to-r from-copper-700/5 to-transparent">
          <p className="text-xs font-semibold text-copper-700 font-inter uppercase tracking-wide">
            Brief Summary
          </p>
        </div>
        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <p className="text-[10px] text-mist-400 font-inter uppercase tracking-wide mb-1">
              Title
            </p>
            <p className="text-sm font-semibold text-charcoal-900 font-grotesk">
              {data.title || '—'}
            </p>
          </div>

          {/* Category + Budget row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-mist-400 font-inter uppercase tracking-wide mb-1 flex items-center gap-1">
                <Tag size={9} /> Category
              </p>
              <p className="text-sm font-medium text-charcoal-800 font-inter">
                {category?.label ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-mist-400 font-inter uppercase tracking-wide mb-1 flex items-center gap-1">
                <Banknote size={9} /> Budget
              </p>
              <p className="text-sm font-semibold text-charcoal-900 font-grotesk">
                {parseBudget(data.budget) > 0 ? `UGX ${formatUGX(parseBudget(data.budget))}` : '—'}
              </p>
            </div>
          </div>

          {/* Deadline + Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-mist-400 font-inter uppercase tracking-wide mb-1 flex items-center gap-1">
                <Calendar size={9} /> Deadline
              </p>
              <p className="text-sm font-medium text-charcoal-800 font-inter">
                {data.deadline
                  ? new Date(data.deadline).toLocaleDateString('en-UG', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-mist-400 font-inter uppercase tracking-wide mb-1">
                Timeline
              </p>
              <p className="text-sm font-medium text-charcoal-800 font-inter">
                {estimateTimeline(data.deadline)}
              </p>
            </div>
          </div>

          {/* Description excerpt */}
          <div>
            <p className="text-[10px] text-mist-400 font-inter uppercase tracking-wide mb-1">
              Description
            </p>
            <p className="text-xs text-mist-600 font-inter leading-relaxed line-clamp-3">
              {data.description || '—'}
            </p>
          </div>

          {/* Flags */}
          {data.requiresMRR && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 w-fit">
              <AlertCircle size={11} className="text-amber-600" strokeWidth={2} />
              <span className="text-[10px] text-amber-700 font-inter font-medium">
                MRR documentation required
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Post button */}
      <motion.button
        type="button"
        onClick={onPost}
        disabled={isSubmitting}
        whileTap={isSubmitting ? {} : { scale: 0.97 }}
        className="w-full h-13 rounded-2xl bg-gradient-to-r from-copper-700 to-copper-600 text-white font-semibold font-inter text-sm shadow-lg shadow-copper-700/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed py-3.5"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Posting…
          </>
        ) : (
          <>
            <CheckCircle2 size={18} strokeWidth={2} />
            Post Brief
          </>
        )}
      </motion.button>

      <p className="text-center text-xs text-mist-400 font-inter">
        Your brief will be visible to all vetted designers on ArtConnect.Ug
      </p>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

const PostBrief: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, projects, addNotification, initializeDemoData, designers, createProject } = useStore()

  const [step, setStep] = useState<FormStep>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [direction, setDirection] = useState<1 | -1>(1)
  const scrollRef = useRef<HTMLDivElement>(null)

  const initialDesignerId = searchParams.get('designerId') ?? ''

  const [formData, setFormData] = useState<BriefFormData>({
    title: '',
    description: '',
    category: '',
    budget: '',
    deadline: '',
    requiresMRR: false,
    additionalNotes: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof BriefFormData, string>>>({})

  useEffect(() => {
    if (designers.length === 0) {
      initializeDemoData()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field: keyof BriefFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof BriefFormData, string>> = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (formData.description.length < 100) {
      newErrors.description = `Description must be at least 100 characters (currently ${formData.description.length})`
    }
    if (!formData.category) newErrors.category = 'Please select a category'
    if (parseBudget(formData.budget) < 100000) {
      newErrors.budget = 'Minimum budget is UGX 100,000'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof BriefFormData, string>> = {}
    if (!formData.deadline) {
      newErrors.deadline = 'Please set a deadline'
    } else {
      const d = new Date(formData.deadline)
      const minD = new Date()
      minD.setDate(minD.getDate() + 3)
      if (d < minD) newErrors.deadline = 'Deadline must be at least 3 days from today'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const goNext = () => {
    let valid = false
    if (step === 1) valid = validateStep1()
    if (step === 2) valid = validateStep2()
    if (step === 3) valid = true

    if (!valid) return

    if (step < 3) {
      setDirection(1)
      setStep((s) => (s + 1) as FormStep)
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goBack = () => {
    if (step > 1) {
      setDirection(-1)
      setStep((s) => (s - 1) as FormStep)
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate(-1)
    }
  }

  const handlePost = async () => {
    setIsSubmitting(true)

    const userId = user?.id ?? 'demo-client-001'

    // Create project via Supabase API
    const project = await createProject({
      client_id: userId,
      title: formData.title,
      description: formData.description,
      category: (formData.category || 'graphic') as DesignerSpecialization,
      budget: parseInt(formData.budget) || 0,
      requires_mrr: formData.requiresMRR,
      status: 'open',
      deadline: formData.deadline || null,
    })

    if (project) {
      addNotification(
        userId,
        'Brief Posted!',
        `Your brief "${formData.title}" is live and visible to designers.`,
        'project_update'
      )
    }

    setIsSubmitting(false)
    setShowToast(true)

    setTimeout(() => {
      setShowToast(false)
      navigate('/client/projects')
    }, 1800)
  }

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '30%' : '-30%',
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? '-30%' : '30%',
      opacity: 0,
    }),
  }

  return (
    <div className="min-h-screen bg-mist-100 flex flex-col" ref={scrollRef}>
      <div className="max-w-md mx-auto w-full flex flex-col flex-1">

        {/* ── Top Bar ──────────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-mist-100/95 backdrop-blur-sm pt-4 pb-3 px-4">
          <div className="flex items-center gap-3 mb-4">
            <motion.button
              onClick={goBack}
              className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white border border-mist-100 shadow-sm"
              whileTap={{ scale: 0.88 }}
            >
              <ArrowLeft size={18} strokeWidth={2} className="text-charcoal-800" />
            </motion.button>
            <div className="flex-1">
              <h1 className="text-base font-bold text-charcoal-900 font-grotesk">
                Post a Brief
              </h1>
              <p className="text-xs text-mist-500 font-inter">Step {step} of 3</p>
            </div>
          </div>

          {/* Step indicator */}
          <StepIndicator current={step} total={3} />
        </div>

        {/* ── Form Content ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="px-4 pt-5 pb-6"
            >
              {step === 1 && (
                <Step1 data={formData} onChange={handleChange} errors={errors} />
              )}
              {step === 2 && (
                <Step2 data={formData} onChange={handleChange} errors={errors} />
              )}
              {step === 3 && (
                <Step3 data={formData} isSubmitting={isSubmitting} onPost={handlePost} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Navigation Buttons ────────────────────────────────────────────── */}
        {step < 3 && (
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-mist-100 p-4">
            <div className="flex gap-3 max-w-md mx-auto">
              {step > 1 && (
                <motion.button
                  onClick={goBack}
                  whileTap={{ scale: 0.97 }}
                  className="flex-none px-5 h-12 rounded-2xl bg-mist-100 border border-mist-200 text-charcoal-700 text-sm font-medium font-inter flex items-center gap-1.5"
                >
                  <ArrowLeft size={16} strokeWidth={2} />
                  Back
                </motion.button>
              )}
              <motion.button
                onClick={goNext}
                whileTap={{ scale: 0.97 }}
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-copper-700 to-copper-600 text-white font-semibold font-inter text-sm shadow-lg shadow-copper-700/25 flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight size={16} strokeWidth={2} />
              </motion.button>
            </div>
          </div>
        )}
      </div>

      <Toast message="Brief posted successfully!" visible={showToast} />
    </div>
  )
}

export default PostBrief
