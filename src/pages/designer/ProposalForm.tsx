// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Designer Proposal Submission Form
// Route: /designer/proposal/:projectId
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Banknote,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { formatUGX } from '../../lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Milestone {
  id: string
  name: string
  deliverable: string
  submissionDeadline: string
  feedbackDeadline: string
}

interface ProposalFormData {
  coverLetter: string
  proposedTimeline: string
  proposedCost: string
  milestones: Milestone[]
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatBudgetInput(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('en-UG').format(Number(digits))
}

function parseBudget(formatted: string): number {
  return Number(formatted.replace(/[^\d]/g, '')) || 0
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

// ── Main Component ────────────────────────────────────────────────────────────

const ProposalForm: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { projects, user, addNotification } = useStore()

  const project = projects.find((p) => p.id === projectId)

  const [formData, setFormData] = useState<ProposalFormData>({
    coverLetter: '',
    proposedTimeline: '',
    proposedCost: '',
    milestones: [
      {
        id: '1',
        name: '',
        deliverable: '',
        submissionDeadline: '',
        feedbackDeadline: '',
      },
    ],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showToast, setShowToast] = useState(false)

  // ── Validation ────────────────────────────────────────────────────────────

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (formData.coverLetter.trim().length < 50) {
      newErrors.coverLetter = 'Cover letter must be at least 50 characters'
    }

    if (!formData.proposedTimeline || Number(formData.proposedTimeline) <= 0) {
      newErrors.proposedTimeline = 'Timeline must be greater than 0 days'
    }

    if (parseBudget(formData.proposedCost) < 50000) {
      newErrors.proposedCost = 'Minimum proposed cost is UGX 50,000'
    }

    if (formData.milestones.length === 0) {
      newErrors.milestones = 'At least one milestone is required'
    }

    formData.milestones.forEach((milestone, idx) => {
      if (!milestone.name.trim()) {
        newErrors[`milestone_${idx}_name`] = 'Milestone name is required'
      }
      if (!milestone.deliverable.trim()) {
        newErrors[`milestone_${idx}_deliverable`] = 'Deliverable description is required'
      }
      if (!milestone.submissionDeadline) {
        newErrors[`milestone_${idx}_submission`] = 'Submission deadline is required'
      }
      if (!milestone.feedbackDeadline) {
        newErrors[`milestone_${idx}_feedback`] = 'Feedback deadline is required'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleFormChange = (field: keyof Omit<ProposalFormData, 'milestones'>, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleMilestoneChange = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m: any) =>
        m.id === id ? { ...m, [field]: value } : m
      ),
    }))
    const idx = formData.milestones.findIndex((m: any) => m.id === id)
    const errorKey = `milestone_${idx}_${field}`
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: '' }))
    }
  }

  const addMilestone = () => {
    const newId = String(Math.max(...formData.milestones.map((m) => Number(m.id) || 0), 0) + 1)
    setFormData((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          id: newId,
          name: '',
          deliverable: '',
          submissionDeadline: '',
          feedbackDeadline: '',
        },
      ],
    }))
  }

  const removeMilestone = (id: string) => {
    if (formData.milestones.length > 1) {
      setFormData((prev) => ({
        ...prev,
        milestones: prev.milestones.filter((m) => m.id !== id),
      }))
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))

    const userId = user?.id ?? 'demo-designer-001'
    addNotification(
      userId,
      'Proposal Submitted!',
      `Your proposal for "${project?.title}" has been submitted and sent to the client.`,
      'project_update'
    )

    setIsSubmitting(false)
    setShowToast(true)

    setTimeout(() => {
      setShowToast(false)
      navigate('/designer/home')
    }, 1800)
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-mist-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-mist-400 font-inter">Project not found</p>
          <button
            onClick={() => navigate('/designer/home')}
            className="mt-4 px-4 py-2 bg-copper-700 text-white rounded-lg text-sm font-inter"
          >
            Back to Dashboard
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
              onClick={() => navigate('/designer/home')}
              className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white border border-mist-100 shadow-sm"
              whileTap={{ scale: 0.88 }}
            >
              <ArrowLeft size={18} strokeWidth={2} className="text-charcoal-800" />
            </motion.button>
            <div className="flex-1">
              <h1 className="text-base font-bold text-charcoal-900 font-grotesk">
                Submit Proposal
              </h1>
            </div>
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-5">
            {/* Project Summary Card */}
            <div className="bg-white rounded-2xl border border-mist-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-copper-700 font-inter uppercase tracking-wide mb-2">
                Project Brief
              </p>
              <p className="text-sm font-semibold text-charcoal-900 font-grotesk mb-1">
                {project.title}
              </p>
              <p className="text-xs text-mist-500 font-inter line-clamp-2">
                {project.description}
              </p>
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-mist-100">
                <div>
                  <p className="text-[10px] text-mist-400 font-inter uppercase tracking-wide mb-1">
                    Budget
                  </p>
                  <p className="text-sm font-semibold text-charcoal-900 font-grotesk">
                    UGX {formatUGX(project.budget)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-mist-400 font-inter uppercase tracking-wide mb-1">
                    Category
                  </p>
                  <p className="text-sm font-medium text-charcoal-800 font-inter capitalize">
                    {project.category.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-1.5">
                Cover Letter <span className="text-copper-700">*</span>
              </label>
              <div className="relative">
                <textarea
                  placeholder="Tell the client why you're the right fit for this project and what makes your approach unique…"
                  value={formData.coverLetter}
                  onChange={(e) => handleFormChange('coverLetter', e.target.value)}
                  rows={5}
                  className={[
                    'w-full px-3.5 pt-3 pb-8 rounded-2xl border text-sm text-charcoal-900 font-inter',
                    'placeholder:text-mist-300 bg-white resize-none',
                    'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700/50 transition-all',
                    errors.coverLetter ? 'border-red-300 bg-red-50' : 'border-mist-200',
                  ].join(' ')}
                />
                <div className="absolute bottom-2.5 right-3 flex items-center gap-1">
                  <span
                    className={[
                      'text-[10px] font-inter',
                      formData.coverLetter.length >= 50
                        ? 'text-emerald-500 font-semibold'
                        : 'text-mist-400',
                    ].join(' ')}
                  >
                    {formData.coverLetter.length}/50
                  </span>
                </div>
              </div>
              {errors.coverLetter && (
                <p className="text-xs text-red-500 font-inter mt-1">{errors.coverLetter}</p>
              )}
            </div>

            {/* Proposed Timeline */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} strokeWidth={2} className="text-copper-700" />
                Proposed Timeline (Days) <span className="text-copper-700">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 14"
                value={formData.proposedTimeline}
                onChange={(e) => handleFormChange('proposedTimeline', e.target.value)}
                min="1"
                className={[
                  'w-full h-11 px-3.5 rounded-2xl border text-sm text-charcoal-900 font-inter',
                  'placeholder:text-mist-300 bg-white',
                  'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700/50 transition-all',
                  errors.proposedTimeline ? 'border-red-300 bg-red-50' : 'border-mist-200',
                ].join(' ')}
              />
              {errors.proposedTimeline && (
                <p className="text-xs text-red-500 font-inter mt-1">{errors.proposedTimeline}</p>
              )}
            </div>

            {/* Proposed Cost */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-1.5 flex items-center gap-1.5">
                <Banknote size={13} strokeWidth={2} className="text-copper-700" />
                Proposed Cost (UGX) <span className="text-copper-700">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-mist-400 font-inter">
                  UGX
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={formData.proposedCost}
                  onChange={(e) => handleFormChange('proposedCost', formatBudgetInput(e.target.value))}
                  className={[
                    'w-full h-11 pl-12 pr-3.5 rounded-2xl border text-sm text-charcoal-900 font-inter font-semibold',
                    'placeholder:text-mist-300 bg-white',
                    'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700/50 transition-all',
                    errors.proposedCost ? 'border-red-300 bg-red-50' : 'border-mist-200',
                  ].join(' ')}
                />
              </div>
              {errors.proposedCost && (
                <p className="text-xs text-red-500 font-inter mt-1">{errors.proposedCost}</p>
              )}
              {parseBudget(formData.proposedCost) > 0 && (
                <p className="text-xs text-mist-400 font-inter mt-1">
                  = UGX {formatUGX(parseBudget(formData.proposedCost))}
                </p>
              )}
            </div>

            {/* Milestones Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-semibold text-charcoal-800 font-inter">
                  Milestone Definitions <span className="text-copper-700">*</span>
                </label>
              </div>

              {errors.milestones && (
                <p className="text-xs text-red-500 font-inter mb-2">{errors.milestones}</p>
              )}

              <div className="space-y-4">
                {formData.milestones.map((milestone, idx) => (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-mist-100 p-3.5 space-y-3"
                  >
                    {/* Milestone Name */}
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 font-inter mb-1">
                        Milestone {idx + 1} Name <span className="text-copper-700">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Design Concepts"
                        value={milestone.name}
                        onChange={(e) => handleMilestoneChange(milestone.id, 'name', e.target.value)}
                        className={[
                          'w-full h-10 px-3 rounded-xl border text-xs text-charcoal-900 font-inter',
                          'placeholder:text-mist-300 bg-white',
                          'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700/50 transition-all',
                          errors[`milestone_${idx}_name`] ? 'border-red-300 bg-red-50' : 'border-mist-200',
                        ].join(' ')}
                      />
                      {errors[`milestone_${idx}_name`] && (
                        <p className="text-xs text-red-500 font-inter mt-0.5">
                          {errors[`milestone_${idx}_name`]}
                        </p>
                      )}
                    </div>

                    {/* Deliverable Description */}
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 font-inter mb-1">
                        Deliverable Description <span className="text-copper-700">*</span>
                      </label>
                      <textarea
                        placeholder="What will you deliver in this milestone?"
                        value={milestone.deliverable}
                        onChange={(e) =>
                          handleMilestoneChange(milestone.id, 'deliverable', e.target.value)
                        }
                        rows={2}
                        className={[
                          'w-full px-3 py-2 rounded-xl border text-xs text-charcoal-900 font-inter',
                          'placeholder:text-mist-300 bg-white resize-none',
                          'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700/50 transition-all',
                          errors[`milestone_${idx}_deliverable`] ? 'border-red-300 bg-red-50' : 'border-mist-200',
                        ].join(' ')}
                      />
                      {errors[`milestone_${idx}_deliverable`] && (
                        <p className="text-xs text-red-500 font-inter mt-0.5">
                          {errors[`milestone_${idx}_deliverable`]}
                        </p>
                      )}
                    </div>

                    {/* Deadlines Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 font-inter mb-1">
                          Submission Deadline <span className="text-copper-700">*</span>
                        </label>
                        <input
                          type="date"
                          value={milestone.submissionDeadline}
                          onChange={(e) =>
                            handleMilestoneChange(milestone.id, 'submissionDeadline', e.target.value)
                          }
                          className={[
                            'w-full h-10 px-2.5 rounded-xl border text-xs text-charcoal-900 font-inter bg-white',
                            'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700/50 transition-all',
                            errors[`milestone_${idx}_submission`]
                              ? 'border-red-300 bg-red-50'
                              : 'border-mist-200',
                          ].join(' ')}
                        />
                        {errors[`milestone_${idx}_submission`] && (
                          <p className="text-xs text-red-500 font-inter mt-0.5">
                            {errors[`milestone_${idx}_submission`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 font-inter mb-1">
                          Feedback Deadline <span className="text-copper-700">*</span>
                        </label>
                        <input
                          type="date"
                          value={milestone.feedbackDeadline}
                          onChange={(e) =>
                            handleMilestoneChange(milestone.id, 'feedbackDeadline', e.target.value)
                          }
                          className={[
                            'w-full h-10 px-2.5 rounded-xl border text-xs text-charcoal-900 font-inter bg-white',
                            'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700/50 transition-all',
                            errors[`milestone_${idx}_feedback`]
                              ? 'border-red-300 bg-red-50'
                              : 'border-mist-200',
                          ].join(' ')}
                        />
                        {errors[`milestone_${idx}_feedback`] && (
                          <p className="text-xs text-red-500 font-inter mt-0.5">
                            {errors[`milestone_${idx}_feedback`]}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Remove Button */}
                    {formData.milestones.length > 1 && (
                      <motion.button
                        type="button"
                        onClick={() => removeMilestone(milestone.id)}
                        whileTap={{ scale: 0.95 }}
                        className="w-full h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 font-inter text-xs font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={14} strokeWidth={2} />
                        Remove Milestone
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Add Milestone Button */}
              <motion.button
                type="button"
                onClick={addMilestone}
                whileTap={{ scale: 0.97 }}
                className="w-full mt-3 h-11 rounded-2xl bg-mist-50 border border-mist-200 text-copper-700 font-inter text-sm font-medium flex items-center justify-center gap-2 hover:bg-mist-100 transition-colors"
              >
                <Plus size={16} strokeWidth={2} />
                Add Milestone
              </motion.button>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" strokeWidth={2} />
              <p className="text-xs text-amber-700 font-inter leading-relaxed">
                If you miss a submission deadline, it may count against you in dispute resolution.
                If the client misses a feedback deadline, it counts in your favour.
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
                Submit Proposal
              </>
            )}
          </motion.button>
        </div>
      </div>

      <Toast message="Proposal submitted successfully!" visible={showToast} />
    </div>
  )
}

export default ProposalForm
