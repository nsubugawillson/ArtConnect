// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Designer Milestone Workspace
// Route: /designer/workspace/:contractId
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckSquare,
  Square,
  Upload,
  Lock,
  FileText,
  MessageCircle,
  Play,
  CheckCircle,
  ClipboardList,
  Banknote,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
  AlertTriangle,
  Layers,
  ArrowLeft,
  File,
  Check,
} from 'lucide-react'
import { format, isValid, parseISO } from 'date-fns'
import { useStore, selectContractMilestones } from '../../lib/store'
import { Header } from '../../components/layout/Header'
import { Button } from '../../components/ui/Button'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { Modal } from '../../components/ui/Modal'
import type { Milestone } from '../../lib/types'

// ── Constants ─────────────────────────────────────────────────────────────────

const MRR_CHECKLIST_ITEMS = [
  'Technical specifications documented',
  'Bill of Materials (BOM) complete',
  'Material samples approved',
  'Manufacturing tolerances specified',
  'Quality control criteria defined',
]

const MOCK_FILES = [
  { name: 'brand_identity_v1.pdf', size: '2.4 MB', type: 'pdf' },
  { name: 'logo_files.ai', size: '8.7 MB', type: 'ai' },
  { name: 'brand_guidelines.pdf', size: '5.1 MB', type: 'pdf' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatUGX = (n: number): string =>
  new Intl.NumberFormat('en-UG', { maximumFractionDigits: 0 }).format(n)

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—'
  const d = parseISO(dateStr)
  return isValid(d) ? format(d, 'MMM d, yyyy') : '—'
}

const getDaysRemaining = (dateStr: string | null): number | null => {
  if (!dateStr) return null
  const d = parseISO(dateStr)
  if (!isValid(d)) return null
  const diff = d.getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ── MRR Checklist Panel ───────────────────────────────────────────────────────

interface MRRChecklistPanelProps {
  checked: boolean[]
  onToggle: (index: number) => void
  bomUploaded: boolean
  adminApproved: boolean
  onUploadBOM: () => void
  onSubmitMRR: () => void
  submitting: boolean
}

const MRRChecklistPanel: React.FC<MRRChecklistPanelProps> = ({
  checked,
  onToggle,
  bomUploaded,
  adminApproved,
  onUploadBOM,
  onSubmitMRR,
  submitting,
}) => {
  const allChecked = checked.every(Boolean)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <ClipboardList size={16} className="text-amber-600" strokeWidth={2} />
        <span className="text-sm font-semibold text-charcoal-900 font-grotesk">
          MRR Checklist
        </span>
        <span className="ml-auto text-xs text-mist-400 font-inter">
          {checked.filter(Boolean).length}/{checked.length}
        </span>
      </div>

      <div className="space-y-2">
        {MRR_CHECKLIST_ITEMS.map((item, i) => (
          <motion.button
            key={i}
            onClick={() => !adminApproved && onToggle(i)}
            className={[
              'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors',
              checked[i]
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-mist-50 border-mist-200 hover:border-mist-300',
              adminApproved ? 'cursor-default' : 'cursor-pointer',
            ].join(' ')}
            whileTap={adminApproved ? {} : { scale: 0.98 }}
          >
            {checked[i] ? (
              <CheckSquare size={16} className="text-emerald-500 shrink-0" strokeWidth={2} />
            ) : (
              <Square size={16} className="text-mist-300 shrink-0" strokeWidth={1.8} />
            )}
            <span
              className={[
                'text-xs font-inter leading-snug',
                checked[i] ? 'text-emerald-700 line-through' : 'text-charcoal-900',
              ].join(' ')}
            >
              {item}
            </span>
          </motion.button>
        ))}
      </div>

      {/* BOM Upload */}
      <div className={[
        'rounded-xl border p-3 flex items-center justify-between',
        bomUploaded ? 'bg-emerald-50 border-emerald-200' : 'bg-mist-50 border-mist-200',
      ].join(' ')}>
        <div className="flex items-center gap-2">
          <File
            size={15}
            className={bomUploaded ? 'text-emerald-500' : 'text-mist-400'}
            strokeWidth={2}
          />
          <div>
            <p className={[
              'text-xs font-semibold font-inter',
              bomUploaded ? 'text-emerald-700' : 'text-charcoal-900',
            ].join(' ')}>
              Bill of Materials (BOM)
            </p>
            <p className="text-[10px] text-mist-400 font-inter">
              {bomUploaded ? 'bom_v1.xlsx uploaded' : 'Required document'}
            </p>
          </div>
        </div>
        {!adminApproved && (
          <Button
            variant={bomUploaded ? 'secondary' : 'outline'}
            size="sm"
            onClick={onUploadBOM}
          >
            {bomUploaded ? 'Re-upload' : 'Upload BOM'}
          </Button>
        )}
        {adminApproved && bomUploaded && (
          <Check size={16} className="text-emerald-500" strokeWidth={2.5} />
        )}
      </div>

      {/* Admin Approval Status */}
      {adminApproved ? (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle size={16} className="text-emerald-500" strokeWidth={2} />
          <span className="text-sm font-semibold text-emerald-700 font-inter">
            Admin Approved
          </span>
        </div>
      ) : (
        <Button
          variant="primary"
          fullWidth
          size="sm"
          onClick={onSubmitMRR}
          disabled={!allChecked || !bomUploaded || submitting}
          loading={submitting}
          leftIcon={<ClipboardList size={14} strokeWidth={2} />}
        >
          Submit for MRR Review
        </Button>
      )}

      {!allChecked && (
        <p className="text-xs text-center text-mist-400 font-inter">
          Complete all checklist items to submit for review
        </p>
      )}
    </div>
  )
}

// ── File Upload Section ───────────────────────────────────────────────────────

interface FileUploadSectionProps {
  files: typeof MOCK_FILES
  onAddFiles: () => void
  submitted: boolean
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  files,
  onAddFiles,
  submitted,
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between mb-1">
      <span className="text-sm font-semibold text-charcoal-900 font-grotesk">
        Deliverable Files
      </span>
      {submitted && (
        <Badge variant="warning" size="sm" dot>Pending Approval</Badge>
      )}
    </div>

    {/* Drop zone */}
    {!submitted && (
      <motion.button
        onClick={onAddFiles}
        whileHover={{ borderColor: '#A0430A' }}
        whileTap={{ scale: 0.99 }}
        className={[
          'w-full rounded-2xl border-2 border-dashed border-mist-200 p-6',
          'flex flex-col items-center gap-2 text-center',
          'hover:border-copper-700/50 hover:bg-copper-700/4',
          'transition-colors duration-200',
        ].join(' ')}
      >
        <div className="w-10 h-10 rounded-xl bg-mist-100 flex items-center justify-center">
          <Upload size={20} className="text-mist-400" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-sm font-semibold text-charcoal-900 font-grotesk">
            Drag & drop or click to upload
          </p>
          <p className="text-xs text-mist-400 font-inter mt-0.5">
            PDF, AI, PSD, Figma, ZIP — up to 100MB
          </p>
        </div>
      </motion.button>
    )}

    {/* File list */}
    {files.length > 0 && (
      <div className="space-y-2">
        {files.map((file, i) => (
          <motion.div
            key={file.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-3 bg-mist-50 rounded-xl px-3 py-2.5 border border-mist-100"
          >
            <div className="w-7 h-7 rounded-lg bg-copper-700/10 flex items-center justify-center shrink-0">
              <FileText size={13} className="text-copper-700" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-charcoal-900 font-inter truncate">
                {file.name}
              </p>
              <p className="text-[10px] text-mist-400 font-inter">{file.size}</p>
            </div>
            <div className="flex items-center gap-1 text-mist-400">
              <Lock size={11} strokeWidth={2} />
              <span className="text-[10px] font-inter">Watermarked</span>
            </div>
          </motion.div>
        ))}
      </div>
    )}

    {files.length > 0 && (
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-start gap-2">
        <Lock size={13} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-700 font-inter leading-relaxed">
          Files are watermarked and locked until the client approves this milestone. Download is disabled; screenshot protection enabled.
        </p>
      </div>
    )}
  </div>
)

// ── Current Milestone Panel ───────────────────────────────────────────────────

interface CurrentMilestonePanelProps {
  milestone: Milestone
  onStart: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

const CurrentMilestonePanel: React.FC<CurrentMilestonePanelProps> = ({
  milestone,
  onStart,
  onSubmit,
  isSubmitting,
}) => {
  const [mrrChecked, setMrrChecked] = useState<boolean[]>(
    MRR_CHECKLIST_ITEMS.map(() => false)
  )
  const [bomUploaded, setBomUploaded] = useState(false)
  const [mrrAdminApproved, setMrrAdminApproved] = useState(false)
  const [submittingMRR, setSubmittingMRR] = useState(false)
  const [pendingMRRReview, setPendingMRRReview] = useState(false)
  const [files, setFiles] = useState<typeof MOCK_FILES>([])

  const daysRemaining = getDaysRemaining(milestone.due_date)
  const isMRRApproved = !milestone.mrr_required || mrrAdminApproved
  const canSubmit =
    milestone.status === 'in_progress' &&
    isMRRApproved &&
    files.length > 0

  const handleToggleMRR = (index: number) => {
    setMrrChecked((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  const handleUploadBOM = () => {
    setBomUploaded(true)
  }

  const handleSubmitMRR = () => {
    setSubmittingMRR(true)
    setTimeout(() => {
      setSubmittingMRR(false)
      setPendingMRRReview(true)
      // Simulate admin approval after 2s
      setTimeout(() => {
        setMrrAdminApproved(true)
        setPendingMRRReview(false)
      }, 2000)
    }, 1200)
  }

  const handleAddFiles = () => {
    // Simulate file selection
    if (files.length === 0) {
      setFiles(MOCK_FILES)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-mist-100 shadow-sm overflow-hidden">
      {/* Copper accent top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-copper-700 to-copper-500" />

      <div className="p-5 space-y-5">
        {/* Milestone header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-copper-700/10 text-copper-700 font-inter font-medium">
                  Current Milestone
                </span>
                {milestone.mrr_required && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 font-inter font-medium flex items-center gap-1">
                    <ClipboardList size={9} strokeWidth={2} />
                    MRR
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-charcoal-900 font-grotesk leading-snug">
                {milestone.title}
              </h3>
            </div>
            <StatusBadge status={milestone.status} />
          </div>

          <p className="text-xs text-mist-500 font-inter leading-relaxed">
            {milestone.description}
          </p>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Banknote size={14} className="text-copper-700/60" strokeWidth={1.8} />
            <span className="text-sm font-bold text-charcoal-900 font-grotesk">
              UGX {formatUGX(milestone.amount)}
            </span>
          </div>
          {milestone.due_date && (
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-mist-400" strokeWidth={1.8} />
              <span className="text-xs text-mist-500 font-inter">
                Due {formatDate(milestone.due_date)}
              </span>
              {daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0 && (
                <Badge variant="warning" size="sm">
                  {daysRemaining}d left
                </Badge>
              )}
              {daysRemaining !== null && daysRemaining <= 0 && (
                <Badge variant="danger" size="sm">Overdue</Badge>
              )}
            </div>
          )}
        </div>

        {/* Start Work CTA */}
        {milestone.status === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={onStart}
              leftIcon={<Play size={16} strokeWidth={2} />}
              className="shadow-lg shadow-copper-700/25"
            >
              Start Work on this Milestone
            </Button>
          </motion.div>
        )}

        {/* MRR Section */}
        {milestone.mrr_required && milestone.status !== 'pending' && (
          <div className={[
            'rounded-2xl border p-4 space-y-4',
            mrrAdminApproved
              ? 'bg-emerald-50 border-emerald-200'
              : pendingMRRReview
              ? 'bg-amber-50 border-amber-200'
              : 'bg-mist-50 border-mist-100',
          ].join(' ')}>
            {pendingMRRReview && !mrrAdminApproved && (
              <div className="flex items-center gap-2 bg-amber-100 rounded-xl px-3 py-2.5">
                <AlertCircle size={15} className="text-amber-600" strokeWidth={2} />
                <span className="text-xs font-semibold text-amber-800 font-inter">
                  Pending Admin Review — checking...
                </span>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="ml-auto"
                >
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full" />
                </motion.div>
              </div>
            )}

            <MRRChecklistPanel
              checked={mrrChecked}
              onToggle={handleToggleMRR}
              bomUploaded={bomUploaded}
              adminApproved={mrrAdminApproved}
              onUploadBOM={handleUploadBOM}
              onSubmitMRR={handleSubmitMRR}
              submitting={submittingMRR}
            />
          </div>
        )}

        {/* File Submission (show when in_progress and MRR approved or not required) */}
        {milestone.status === 'in_progress' && isMRRApproved && (
          <div className="rounded-2xl border border-mist-100 bg-mist-50/50 p-4">
            <FileUploadSection
              files={files}
              onAddFiles={handleAddFiles}
              submitted={false}
            />
          </div>
        )}

        {/* Submitted state */}
        {milestone.status === 'submitted' && (
          <div className="space-y-3">
            <FileUploadSection
              files={MOCK_FILES}
              onAddFiles={() => {}}
              submitted={true}
            />
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertCircle size={15} className="text-amber-600" strokeWidth={2} />
              <div>
                <p className="text-xs font-semibold text-amber-800 font-inter">
                  Awaiting Client Approval
                </p>
                <p className="text-[11px] text-amber-600 font-inter">
                  The client is reviewing your submission
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Approved state */}
        {milestone.status === 'approved' && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <CheckCircle size={20} className="text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 font-grotesk">
                Milestone Approved
              </p>
              <p className="text-xs text-emerald-600 font-inter">
                UGX {formatUGX(milestone.amount)} released to your wallet. Design files delivered to client.
              </p>
            </div>
          </div>
        )}

        {/* Submit Milestone Button */}
        {milestone.status === 'in_progress' && canSubmit && (
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={onSubmit}
            loading={isSubmitting}
            leftIcon={<Upload size={16} strokeWidth={2} />}
            className="shadow-lg shadow-copper-700/25"
          >
            Submit Milestone
          </Button>
        )}

        {milestone.status === 'in_progress' && !canSubmit && files.length === 0 && isMRRApproved && (
          <p className="text-center text-xs text-mist-400 font-inter">
            Upload deliverable files to submit this milestone
          </p>
        )}
      </div>
    </div>
  )
}

// ── Milestone List Item (compact) ─────────────────────────────────────────────

interface MilestoneListItemProps {
  milestone: Milestone
  isCurrent: boolean
}

const MilestoneListItem: React.FC<MilestoneListItemProps> = ({ milestone, isCurrent }) => (
  <div
    className={[
      'flex items-center gap-3 p-3 rounded-xl border transition-colors',
      isCurrent
        ? 'bg-copper-700/5 border-copper-700/20'
        : 'bg-white border-mist-100',
    ].join(' ')}
  >
    <div
      className={[
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold font-grotesk',
        milestone.status === 'approved'
          ? 'bg-emerald-100 text-emerald-600'
          : isCurrent
          ? 'bg-copper-700/15 text-copper-700'
          : 'bg-mist-100 text-mist-400',
      ].join(' ')}
    >
      {milestone.status === 'approved' ? (
        <Check size={14} strokeWidth={2.5} />
      ) : (
        milestone.order_index
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p
        className={[
          'text-xs font-semibold font-grotesk truncate',
          isCurrent ? 'text-copper-700' : 'text-charcoal-900',
        ].join(' ')}
      >
        {milestone.title}
        {isCurrent && (
          <span className="ml-1.5 text-[10px] font-normal text-copper-600 font-inter">
            (current)
          </span>
        )}
      </p>
      <p className="text-[10px] text-mist-400 font-inter">
        UGX {formatUGX(milestone.amount)}
      </p>
    </div>
    <StatusBadge status={milestone.status} size="sm" showDot={false} />
  </div>
)

// ── Main Component ────────────────────────────────────────────────────────────

export const MilestoneWorkspace: React.FC = () => {
  const { contractId } = useParams<{ contractId: string }>()
  const navigate = useNavigate()

  const contracts = useStore((s) => s.contracts)
  const projects = useStore((s) => s.projects)
  const user = useStore((s) => s.user ?? s.currentUser)
  const updateMilestoneStatus = useStore((s) => s.updateMilestoneStatus)
  const submitMilestone = useStore((s) => s.submitMilestone)
  const initializeDemoData = useStore((s) => s.initializeDemoData)

  const milestones = useStore(selectContractMilestones(contractId ?? ''))

  const [milestonesExpanded, setMilestonesExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const messages = useStore((s) =>
    s.messages.filter((m) => m.contract_id === contractId)
  )
  const addMessage = useStore((s) => s.addMessage)

  useEffect(() => {
    initializeDemoData()
  }, [initializeDemoData])

  const contract = contracts.find((c) => c.id === contractId)
  const project = projects.find((p) => p.id === contract?.project_id)

  // Find the "current" active milestone (first non-approved, non-pending)
  const currentMilestone =
    milestones.find(
      (m) =>
        m.status === 'in_progress' ||
        m.status === 'submitted' ||
        m.status === 'revision_requested'
    ) ?? milestones.find((m) => m.status === 'pending') ?? milestones[0]

  const approved = milestones.filter((m) => m.status === 'approved').length
  const progressPct = milestones.length > 0 ? (approved / milestones.length) * 100 : 0

  const handleStartMilestone = useCallback(() => {
    if (!currentMilestone) return
    updateMilestoneStatus(currentMilestone.id, 'in_progress')
  }, [currentMilestone, updateMilestoneStatus])

  const handleSubmitMilestone = useCallback(() => {
    if (!currentMilestone) return
    setIsSubmitting(true)
    setTimeout(() => {
      submitMilestone(currentMilestone.id, [])
      setIsSubmitting(false)
    }, 1000)
  }, [currentMilestone, submitMilestone])

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !contractId || !user) return
    addMessage(contractId, user.id ?? 'demo-designer-001', chatMessage.trim())
    setChatMessage('')
  }

  if (!contract || !project) {
    return (
      <div className="min-h-screen bg-mist-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-mist-400 font-inter">Contract not found</p>
          <Button variant="secondary" size="sm" onClick={() => navigate('/designer/contracts')}>
            Back to Contracts
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mist-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-mist-50 border-b border-mist-200">
        <div className="flex items-center h-14 px-4 gap-3">
          <button
            onClick={() => navigate('/designer/contracts')}
            className="p-2 rounded-xl hover:bg-mist-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-charcoal-900" strokeWidth={2} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-charcoal-900 font-grotesk truncate">
              {project.title}
            </p>
            <p className="text-[11px] text-mist-400 font-inter">
              UGX {formatUGX(contract.agreed_amount)} · {milestones.length} milestones
            </p>
          </div>
          <Badge variant={contract.status === 'completed' ? 'success' : 'copper'} dot size="sm">
            {contract.status === 'completed' ? 'Completed' : 'Active'}
          </Badge>
        </div>
      </div>

      <div className="px-4 pt-5 pb-6 space-y-5">
        {/* ── Contract Completed Banner ─────────────────────────────────────────── */}
        {contract.status === 'completed' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 p-4 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="w-12 h-12 rounded-full bg-emerald-200 flex items-center justify-center mx-auto mb-2"
            >
              <CheckCircle size={24} className="text-emerald-600" strokeWidth={1.5} />
            </motion.div>
            <h3 className="font-grotesk font-bold text-emerald-800">Contract Complete!</h3>
            <p className="text-xs text-emerald-600/80 font-inter mt-1">
              Full escrow of UGX {formatUGX(contract.agreed_amount)} released to your wallet. All files delivered.
            </p>
          </motion.div>
        )}

        {/* ── Progress Bar ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-mist-100 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-mist-400" strokeWidth={2} />
              <span className="text-xs font-semibold text-charcoal-900 font-grotesk">
                Contract Progress
              </span>
            </div>
            <span className="text-xs font-bold text-copper-700 font-grotesk">
              {approved}/{milestones.length} milestones
            </span>
          </div>
          <ProgressBar
            value={progressPct}
            max={100}
            size="md"
            showPercentage
            animated
          />
        </div>

        {/* ── Current Milestone Panel ───────────────────────────────────────────── */}
        {currentMilestone && (
          <CurrentMilestonePanel
            milestone={currentMilestone}
            onStart={handleStartMilestone}
            onSubmit={handleSubmitMilestone}
            isSubmitting={isSubmitting}
          />
        )}

        {/* ── All Milestones (collapsible) ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-mist-100 overflow-hidden">
          <button
            onClick={() => setMilestonesExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-mist-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Layers size={15} className="text-mist-400" strokeWidth={2} />
              <span className="text-sm font-semibold text-charcoal-900 font-grotesk">
                All Milestones
              </span>
              <span className="text-xs text-mist-400 font-inter">
                ({approved}/{milestones.length} done)
              </span>
            </div>
            {milestonesExpanded ? (
              <ChevronUp size={16} className="text-mist-400" />
            ) : (
              <ChevronDown size={16} className="text-mist-400" />
            )}
          </button>

          <AnimatePresence>
            {milestonesExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-2">
                  {milestones.map((m) => (
                    <MilestoneListItem
                      key={m.id}
                      milestone={m}
                      isCurrent={m.id === currentMilestone?.id}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Floating Action Buttons ──────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-4 z-40 flex flex-col gap-3">
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 400 }}
          onClick={() => navigate(`/dispute/${contractId}`)}
          className="w-12 h-12 rounded-full bg-white border border-red-200 text-red-500 shadow-lg flex items-center justify-center hover:bg-red-50 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AlertTriangle size={20} strokeWidth={2} />
        </motion.button>
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 400 }}
          onClick={() => setChatOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-copper-700 to-copper-600 text-white shadow-xl shadow-copper-700/40 flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle size={22} strokeWidth={2} />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {messages.length > 9 ? '9+' : messages.length}
            </span>
          )}
        </motion.button>
      </div>

      {/* ── Chat Modal ────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        title="Project Chat"
        size="lg"
      >
        <div className="space-y-4">
          {/* Messages */}
          <div className="h-64 overflow-y-auto space-y-3 pr-1">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle size={28} className="text-mist-200 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-xs text-mist-400 font-inter">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === (user?.id ?? 'demo-designer-001')
                return (
                  <div
                    key={msg.id}
                    className={['flex', isMe ? 'justify-end' : 'justify-start'].join(' ')}
                  >
                    <div
                      className={[
                        'max-w-[80%] px-3 py-2 rounded-2xl text-xs font-inter leading-relaxed',
                        isMe
                          ? 'bg-copper-700 text-white rounded-br-sm'
                          : 'bg-mist-100 text-charcoal-900 rounded-bl-sm',
                      ].join(' ')}
                    >
                      {msg.content}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className={[
                'flex-1 h-10 px-3 rounded-xl border text-sm font-inter',
                'bg-white border-mist-200 text-charcoal-900 placeholder:text-mist-300',
                'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700',
              ].join(' ')}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendMessage}
              disabled={!chatMessage.trim()}
            >
              Send
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default MilestoneWorkspace
