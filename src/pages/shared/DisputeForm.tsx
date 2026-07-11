// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Dispute Submission Form
// Route: /dispute/:contractId
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Upload,
  Shield,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { formatUGX } from '../../lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type DisputeCategory = 'payment_issue' | 'quality_concern' | 'missed_deadline' | 'communication_breakdown' | 'other'

interface DisputeFormData {
  yourSide: 'client' | 'designer'
  category: DisputeCategory | ''
  description: string
  evidenceUploaded: boolean
}

const DISPUTE_CATEGORIES: Array<{ value: DisputeCategory; label: string; description: string }> = [
  { value: 'payment_issue', label: 'Payment Issue', description: 'Non-payment or incorrect payment' },
  { value: 'quality_concern', label: 'Quality Concern', description: 'Work doesn\'t meet standards' },
  { value: 'missed_deadline', label: 'Missed Deadline', description: 'Deliverables late' },
  { value: 'communication_breakdown', label: 'Communication Breakdown', description: 'Lack of communication' },
  { value: 'other', label: 'Other', description: 'Other issues' },
]

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

// ── Main Component ────────────────────────────────────────────────────────────

const DisputeForm: React.FC = () => {
  const { contractId } = useParams<{ contractId: string }>()
  const navigate = useNavigate()
  const { contracts, user, addNotification } = useStore()

  const contract = contracts.find((c) => c.id === contractId)

  const [formData, setFormData] = useState<DisputeFormData>({
    yourSide: user?.role === 'client' ? 'client' : 'designer',
    category: '',
    description: '',
    evidenceUploaded: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showToast, setShowToast] = useState(false)

  // ── Validation ────────────────────────────────────────────────────────

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.category) {
      newErrors.category = 'Please select a dispute category'
    }

    if (formData.description.trim().length < 100) {
      newErrors.description = `Description must be at least 100 characters (currently ${formData.description.trim().length})`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── Handlers ────────────────────────────────────────────────────────

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleEvidenceUpload = () => {
    setFormData((prev) => ({
      ...prev,
      evidenceUploaded: !prev.evidenceUploaded,
    }))
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))

    const userId = user?.id ?? 'demo-user-001'
    addNotification(
      userId,
      'Dispute Submitted',
      'Your dispute has been submitted and assigned to an admin for review. You will be notified when a resolution is reached.',
      'dispute'
    )

    setIsSubmitting(false)
    setShowToast(true)

    setTimeout(() => {
      setShowToast(false)
      navigate(-1)
    }, 1800)
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-mist-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-mist-400 font-inter">Contract not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-copper-700 text-white rounded-lg text-sm font-inter"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mist-100 flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col flex-1">
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-mist-100/95 backdrop-blur-sm pt-4 pb-3 px-4 border-b border-mist-200">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white border border-mist-100 shadow-sm"
              whileTap={{ scale: 0.88 }}
            >
              <ArrowLeft size={18} strokeWidth={2} className="text-charcoal-800" />
            </motion.button>
            <div className="flex-1">
              <h1 className="text-base font-bold text-charcoal-900 font-grotesk">
                Raise a Dispute
              </h1>
            </div>
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-5">
            {/* Contract Summary Card */}
            <div className="bg-white rounded-2xl border border-mist-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-copper-700 font-inter uppercase tracking-wide mb-2">
                Contract Details
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] text-mist-400 font-inter uppercase tracking-wide mb-0.5">
                    Contract ID
                  </p>
                  <p className="text-xs font-medium text-charcoal-800 font-inter">{contract.id}</p>
                </div>
                <div>
                  <p className="text-[10px] text-mist-400 font-inter uppercase tracking-wide mb-0.5">
                    Amount
                  </p>
                  <p className="text-sm font-semibold text-charcoal-900 font-grotesk">
                    UGX {formatUGX(contract.agreed_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-mist-400 font-inter uppercase tracking-wide mb-0.5">
                    Status
                  </p>
                  <p className="text-xs font-medium text-charcoal-800 font-inter capitalize">
                    {contract.status.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Your Side Selector */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-2">
                Your Role <span className="text-copper-700">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['client', 'designer'] as const).map((side) => (
                  <motion.button
                    key={side}
                    type="button"
                    onClick={() => handleChange('yourSide', side)}
                    whileTap={{ scale: 0.96 }}
                    className={[
                      'p-3 rounded-xl border text-center transition-all duration-200',
                      formData.yourSide === side
                        ? 'bg-copper-700/10 border-copper-700 ring-1 ring-copper-700/30'
                        : 'bg-white border-mist-200 hover:border-copper-700/30',
                    ].join(' ')}
                  >
                    <p
                      className={[
                        'text-xs font-semibold font-grotesk',
                        formData.yourSide === side ? 'text-copper-700' : 'text-charcoal-800',
                      ].join(' ')}
                    >
                      {side === 'client' ? 'I am the Client' : 'I am the Designer'}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Dispute Category */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-2">
                Dispute Category <span className="text-copper-700">*</span>
              </label>
              <div className="space-y-2">
                {DISPUTE_CATEGORIES.map((cat) => (
                  <motion.button
                    key={cat.value}
                    type="button"
                    onClick={() => handleChange('category', cat.value)}
                    whileTap={{ scale: 0.98 }}
                    className={[
                      'w-full p-3 rounded-xl border text-left transition-all duration-200',
                      formData.category === cat.value
                        ? 'bg-copper-700/10 border-copper-700 ring-1 ring-copper-700/30'
                        : 'bg-white border-mist-200 hover:border-copper-700/30',
                    ].join(' ')}
                  >
                    <p
                      className={[
                        'text-xs font-semibold font-grotesk',
                        formData.category === cat.value ? 'text-copper-700' : 'text-charcoal-800',
                      ].join(' ')}
                    >
                      {cat.label}
                    </p>
                    <p className="text-[10px] text-mist-400 font-inter mt-0.5">{cat.description}</p>
                  </motion.button>
                ))}
              </div>
              {errors.category && (
                <p className="text-xs text-red-500 font-inter mt-1">{errors.category}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-1.5">
                Dispute Description <span className="text-copper-700">*</span>
              </label>
              <div className="relative">
                <textarea
                  placeholder="Provide detailed information about the dispute, including relevant dates, communications, and any context…"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={6}
                  className={[
                    'w-full px-3.5 pt-3 pb-8 rounded-2xl border text-sm text-charcoal-900 font-inter',
                    'placeholder:text-mist-300 bg-white resize-none',
                    'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700/50 transition-all',
                    errors.description ? 'border-red-300 bg-red-50' : 'border-mist-200',
                  ].join(' ')}
                />
                <div className="absolute bottom-2.5 right-3 flex items-center gap-1">
                  <span
                    className={[
                      'text-[10px] font-inter',
                      formData.description.length >= 100
                        ? 'text-emerald-500 font-semibold'
                        : 'text-mist-400',
                    ].join(' ')}
                  >
                    {formData.description.length}/100
                  </span>
                </div>
              </div>
              {errors.description && (
                <p className="text-xs text-red-500 font-inter mt-1">{errors.description}</p>
              )}
            </div>

            {/* Evidence Upload Simulation */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-2">
                Supporting Evidence <span className="text-mist-400 font-normal">(optional)</span>
              </label>
              <motion.button
                type="button"
                onClick={handleEvidenceUpload}
                whileTap={{ scale: 0.97 }}
                className={[
                  'w-full h-12 rounded-2xl border-2 border-dashed transition-all duration-200',
                  formData.evidenceUploaded
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-mist-50 border-mist-300 hover:border-copper-700/50',
                ].join(' ')}
              >
                <div className="flex items-center justify-center gap-2">
                  {formData.evidenceUploaded ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-600" strokeWidth={2} />
                      <span className="text-xs font-medium text-emerald-700 font-inter">
                        Document Uploaded
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="text-mist-400" strokeWidth={2} />
                      <span className="text-xs font-medium text-mist-600 font-inter">
                        Upload Evidence
                      </span>
                    </>
                  )}
                </div>
              </motion.button>
            </div>

            {/* Consequence Info Boxes */}
            <div className="space-y-3">
              {/* Client at Fault */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                <Shield size={14} className="text-blue-600 shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="text-xs font-semibold text-blue-700 font-inter mb-0.5">
                    If Client is Found at Fault
                  </p>
                  <p className="text-xs text-blue-600 font-inter leading-relaxed">
                    A dispute fee is charged to the client account and paid to the designer as compensation.
                  </p>
                </div>
              </div>

              {/* Designer at Fault */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="text-xs font-semibold text-amber-700 font-inter mb-0.5">
                    If Designer is Found at Fault
                  </p>
                  <p className="text-xs text-amber-600 font-inter leading-relaxed">
                    A negative review is added to the designer's profile and a full refund is issued to the client.
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-mist-50 border border-mist-200">
              <AlertCircle size={14} className="text-mist-500 shrink-0 mt-0.5" strokeWidth={2} />
              <p className="text-xs text-mist-700 font-inter leading-relaxed">
                Disputes are reviewed by ArtConnect.Ug administrators. Submitting false claims or evidence may result in account suspension.
              </p>
            </div>
          </div>
        </div>

        {/* ── Submit Button ─────────────────────────────────────────────────── */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-mist-100 p-4">
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            whileTap={isSubmitting ? {} : { scale: 0.97 }}
            className="w-full h-13 rounded-2xl bg-gradient-to-r from-copper-700 to-copper-600 text-white font-semibold font-inter text-sm shadow-lg shadow-copper-700/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <CheckCircle2 size={18} strokeWidth={2} />
                Submit Dispute
              </>
            )}
          </motion.button>
        </div>
      </div>

      <Toast message="Dispute submitted successfully!" visible={showToast} />
    </div>
  )
}

export default DisputeForm
