// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Proposals List Screen
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Star,
  Clock,
  Banknote,
  CheckCircle2,
  X,
  ChevronRight,
  FileText,
  Users,
  Briefcase,
  AlertCircle,
  Plus,
  Calendar,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import type { Contract } from '../../lib/types'
import type { DesignerWithUser } from '../../lib/store'
import { formatUGX } from '../../lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface MockProposal {
  id: string
  designerId: string
  projectId: string
  proposedAmount: number
  timelineDays: number
  coverLetter: string
  submittedAt: string
}

interface MilestoneSetup {
  id: string
  name: string
  amount: number
  submissionDeadline: string
  feedbackDeadline: string
}

// ── Mock Proposal Data ────────────────────────────────────────────────────────

function buildMockProposals(projectId: string): MockProposal[] {
  return [
    {
      id: `proposal-${projectId}-1`,
      designerId: 'demo-designer-001',
      projectId,
      proposedAmount: 2800000,
      timelineDays: 21,
      coverLetter:
        'I have extensive experience in this exact type of project and have delivered similar work for 4 East African brands. My approach is research-first — I start by deeply understanding your users and market before putting pen to paper. I can start immediately and will keep you updated at every milestone.',
      submittedAt: '2 hours ago',
    },
    {
      id: `proposal-${projectId}-2`,
      designerId: 'demo-designer-002',
      projectId,
      proposedAmount: 3200000,
      timelineDays: 18,
      coverLetter:
        'With 28 completed projects and a 4.9 rating, I bring precision and premium quality to every engagement. I specialise in this category and have a proven process that delivers on time. My portfolio shows similar projects — I would love to bring that same energy to your brand.',
      submittedAt: '5 hours ago',
    },
    {
      id: `proposal-${projectId}-3`,
      designerId: 'demo-designer-003',
      projectId,
      proposedAmount: 2200000,
      timelineDays: 28,
      coverLetter:
        'I am passionate about this kind of creative challenge! My bold typographic style and vibrant colour palettes have delighted clients across Uganda and Kenya. I offer three free revision rounds and pride myself on clear, prompt communication throughout.',
      submittedAt: '1 day ago',
    },
  ]
}

// ── Helpers ──────────────────────────────────────────────────────────────────

// ── Wallet Balance Check Modal ────────────────────────────────────────────────

interface WalletCheckModalProps {
  isOpen: boolean
  amount: number
  onGoToWallet: () => void
  onCancel: () => void
}

const WalletCheckModal: React.FC<WalletCheckModalProps> = ({
  isOpen,
  amount,
  onGoToWallet,
  onCancel,
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        />
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-md mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-red-50 px-5 pt-5 pb-4 border-b border-red-100">
              <h3 className="text-base font-bold text-charcoal-900 font-grotesk">
                Insufficient Funds
              </h3>
              <p className="text-xs text-mist-500 font-inter mt-0.5">
                Your wallet balance is too low
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-xs text-red-700 font-inter leading-relaxed">
                  You need UGX {formatUGX(amount)} to accept this proposal, but your available balance is
                  insufficient. Please top up your wallet to proceed.
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={onCancel}
                  whileTap={{ scale: 0.96 }}
                  className="flex-1 h-11 rounded-2xl bg-mist-100 border border-mist-200 text-charcoal-700 text-sm font-medium font-inter"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={onGoToWallet}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-copper-700 to-copper-600 text-white text-sm font-semibold font-inter shadow-md shadow-copper-700/25 flex items-center justify-center gap-2"
                >
                  Go to Wallet
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
)

// ── Milestones Setup Modal ────────────────────────────────────────────────────

interface MilestonesSetupModalProps {
  isOpen: boolean
  contractAmount: number
  onConfirm: (milestones: MilestoneSetup[]) => void
  onCancel: () => void
  isLoading: boolean
}

const MilestonesSetupModal: React.FC<MilestonesSetupModalProps> = ({
  isOpen,
  contractAmount,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  const [milestones, setMilestones] = useState<MilestoneSetup[]>([])

  useEffect(() => {
    if (isOpen && milestones.length === 0) {
      // Initialize with 3 default milestones
      const defaultAmount = Math.round(contractAmount / 3)
      const remainder = contractAmount - defaultAmount * 2
      const today = new Date()
      const sub1 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const feed1 = new Date(sub1.getTime() + 3 * 24 * 60 * 60 * 1000)
      const sub2 = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
      const feed2 = new Date(sub2.getTime() + 3 * 24 * 60 * 60 * 1000)
      const sub3 = new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000)
      const feed3 = new Date(sub3.getTime() + 3 * 24 * 60 * 60 * 1000)

      setMilestones([
        {
          id: `milestone-1-${Date.now()}`,
          name: 'Milestone 1',
          amount: defaultAmount,
          submissionDeadline: sub1.toISOString().split('T')[0],
          feedbackDeadline: feed1.toISOString().split('T')[0],
        },
        {
          id: `milestone-2-${Date.now()}`,
          name: 'Milestone 2',
          amount: defaultAmount,
          submissionDeadline: sub2.toISOString().split('T')[0],
          feedbackDeadline: feed2.toISOString().split('T')[0],
        },
        {
          id: `milestone-3-${Date.now()}`,
          name: 'Milestone 3',
          amount: remainder,
          submissionDeadline: sub3.toISOString().split('T')[0],
          feedbackDeadline: feed3.toISOString().split('T')[0],
        },
      ])
    }
  }, [isOpen, contractAmount])

  const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0)
  const difference = contractAmount - totalAmount

  const handleMilestoneChange = (id: string, field: keyof MilestoneSetup, value: string | number) => {
    setMilestones(milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
  }

  const handleAddMilestone = () => {
    const today = new Date()
    const sub = new Date(today.getTime() + (milestones.length + 1) * 7 * 24 * 60 * 60 * 1000)
    const feed = new Date(sub.getTime() + 3 * 24 * 60 * 60 * 1000)

    setMilestones([
      ...milestones,
      {
        id: `milestone-${Date.now()}-${Math.random()}`,
        name: `Milestone ${milestones.length + 1}`,
        amount: 0,
        submissionDeadline: sub.toISOString().split('T')[0],
        feedbackDeadline: feed.toISOString().split('T')[0],
      },
    ])
  }

  const handleRemoveMilestone = (id: string) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((m) => m.id !== id))
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Set Up Milestones" size="lg" showClose={false}>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {/* Info box */}
        <div className="p-3 rounded-xl bg-copper-700/10 border border-copper-700/20">
          <p className="text-xs text-copper-800 font-inter leading-relaxed">
            Divide the contract amount across milestones. The total must equal{' '}
            <span className="font-semibold">{formatUGX(contractAmount)}</span>.
          </p>
        </div>

        {/* Milestones list */}
        <div className="space-y-3">
          {milestones.map((milestone, idx) => (
            <div key={milestone.id} className="p-4 rounded-xl border border-mist-200 bg-mist-50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-charcoal-800 font-inter">
                  Milestone {idx + 1}
                </label>
                {milestones.length > 1 && (
                  <button
                    onClick={() => handleRemoveMilestone(milestone.id)}
                    className="text-xs text-red-500 hover:text-red-600 font-medium font-inter"
                  >
                    Remove
                  </button>
                )}
              </div>

              <Input
                label="Milestone Name"
                value={milestone.name}
                onChange={(e) => handleMilestoneChange(milestone.id, 'name', e.target.value)}
                placeholder="e.g., Research & Concepts"
              />

              <Input
                label="Amount (UGX)"
                type="number"
                value={milestone.amount}
                onChange={(e) =>
                  handleMilestoneChange(milestone.id, 'amount', parseInt(e.target.value) || 0)
                }
                placeholder="0"
              />

              <Input
                label="Submission Deadline"
                type="date"
                value={milestone.submissionDeadline}
                onChange={(e) =>
                  handleMilestoneChange(milestone.id, 'submissionDeadline', e.target.value)
                }
              />

              <Input
                label="Feedback Deadline"
                type="date"
                value={milestone.feedbackDeadline}
                onChange={(e) =>
                  handleMilestoneChange(milestone.id, 'feedbackDeadline', e.target.value)
                }
                helperText="Client must provide feedback by this date"
              />
            </div>
          ))}
        </div>

        {/* Running total */}
        <div className="p-3 rounded-xl bg-mist-100 border border-mist-200">
          <div className="flex items-center justify-between text-xs font-inter">
            <span className="text-mist-600">Total allocated:</span>
            <span className="font-semibold text-charcoal-900">{formatUGX(totalAmount)}</span>
          </div>
          {difference !== 0 && (
            <div className={`flex items-center justify-between text-xs font-inter mt-1.5`}>
              <span className={difference > 0 ? 'text-amber-600' : 'text-red-600'}>
                {difference > 0 ? 'Remaining:' : 'Overage:'}
              </span>
              <span className={`font-semibold ${difference > 0 ? 'text-amber-700' : 'text-red-600'}`}>
                {formatUGX(Math.abs(difference))}
              </span>
            </div>
          )}
        </div>

        {/* Add milestone button */}
        <motion.button
          onClick={handleAddMilestone}
          whileTap={{ scale: 0.96 }}
          className="w-full h-10 rounded-xl border-2 border-dashed border-mist-300 text-charcoal-700 text-sm font-medium font-inter flex items-center justify-center gap-1.5 hover:border-copper-700 hover:text-copper-700 transition-colors"
        >
          <Plus size={14} strokeWidth={2.5} />
          Add Milestone
        </motion.button>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <motion.button
            onClick={onCancel}
            disabled={isLoading}
            whileTap={{ scale: 0.96 }}
            className="flex-1 h-11 rounded-2xl bg-mist-100 border border-mist-200 text-charcoal-700 text-sm font-medium font-inter disabled:opacity-50"
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={() => onConfirm(milestones)}
            disabled={isLoading || difference !== 0 || milestones.some((m) => m.amount <= 0)}
            whileTap={
              isLoading || difference !== 0 || milestones.some((m) => m.amount <= 0)
                ? {}
                : { scale: 0.97 }
            }
            className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-copper-700 to-copper-600 text-white text-sm font-semibold font-inter shadow-md shadow-copper-700/25 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={16} strokeWidth={2} />
                Activate Contract
              </>
            )}
          </motion.button>
        </div>
      </div>
    </Modal>
  )
}

// ── Confirmation Modal ────────────────────────────────────────────────────────

interface ConfirmModalProps {
  isOpen: boolean
  designer: DesignerWithUser | null
  amount: number
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  designer,
  amount,
  onConfirm,
  onCancel,
  isLoading,
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        />
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-md mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-copper-700/10 to-transparent px-5 pt-5 pb-4 border-b border-mist-100">
              <h3 className="text-base font-bold text-charcoal-900 font-grotesk">
                Accept Proposal
              </h3>
              <p className="text-xs text-mist-500 font-inter mt-0.5">
                This will create a contract between you and the designer
              </p>
            </div>
            <div className="p-5 space-y-4">
              {designer && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-mist-100">
                  <Avatar src={designer.avatar_url} name={designer.name} size="md" />
                  <div>
                    <p className="text-sm font-semibold text-charcoal-900 font-grotesk">
                      {designer.name}
                    </p>
                    <p className="text-xs text-mist-500 font-inter">{designer.location}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-mist-400 font-inter">Contract value</p>
                    <p className="text-sm font-bold text-charcoal-900 font-grotesk">
                      UGX {formatUGX(amount)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <Briefcase size={13} className="text-amber-600 shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-xs text-amber-700 font-inter leading-relaxed">
                  After accepting, you will be asked to fund the escrow to activate the contract
                  and release milestone work.
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={onCancel}
                  whileTap={{ scale: 0.96 }}
                  className="flex-1 h-11 rounded-2xl bg-mist-100 border border-mist-200 text-charcoal-700 text-sm font-medium font-inter"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={onConfirm}
                  disabled={isLoading}
                  whileTap={isLoading ? {} : { scale: 0.97 }}
                  className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-copper-700 to-copper-600 text-white text-sm font-semibold font-inter shadow-md shadow-copper-700/25 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={16} strokeWidth={2} />
                      Confirm
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
)

// ── Proposal Card ─────────────────────────────────────────────────────────────

interface ProposalCardProps {
  proposal: MockProposal
  designer: DesignerWithUser | undefined
  isDeclined: boolean
  onAccept: (proposal: MockProposal) => void
  onDecline: (proposalId: string) => void
  index: number
}

const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  designer,
  isDeclined,
  onAccept,
  onDecline,
  index,
}) => {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const previewLength = 130
  const isLong = proposal.coverLetter.length > previewLength

  if (isDeclined) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="bg-white rounded-2xl border border-mist-100 shadow-sm overflow-hidden"
    >
      {/* Card header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar
              src={designer?.avatar_url ?? null}
              name={designer?.name ?? 'Designer'}
              size="md"
            />
            {designer?.is_vetted && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-[1.5px] border-white">
                <CheckCircle2 size={9} className="text-white" strokeWidth={3} />
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-charcoal-900 font-grotesk leading-snug">
                  {designer?.name ?? 'Designer'}
                </p>
                <p className="text-xs text-mist-400 font-inter">{designer?.location}</p>
              </div>
              {designer && designer.rating > 0 && (
                <div className="flex items-center gap-1 shrink-0">
                  <Star size={11} fill="#A0430A" strokeWidth={0} />
                  <span className="text-xs font-semibold text-charcoal-900 font-grotesk">
                    {designer.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Specializations */}
            {designer && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {designer.specializations.slice(0, 2).map((s) => (
                  <Badge key={s} variant="copper" size="sm">
                    {s.replace('_', '/').toUpperCase()}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Proposed stats row */}
        <div className="flex items-center gap-4 mt-4 p-3 rounded-xl bg-mist-100">
          <div className="flex items-center gap-1.5">
            <Banknote size={14} className="text-copper-700" strokeWidth={1.8} />
            <div>
              <p className="text-[10px] text-mist-400 font-inter">Proposed</p>
              <p className="text-sm font-bold text-charcoal-900 font-grotesk">
                UGX {formatUGX(proposal.proposedAmount)}
              </p>
            </div>
          </div>
          <div className="w-px h-8 bg-mist-200 shrink-0" />
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-copper-700" strokeWidth={1.8} />
            <div>
              <p className="text-[10px] text-mist-400 font-inter">Timeline</p>
              <p className="text-sm font-semibold text-charcoal-900 font-grotesk">
                {proposal.timelineDays} days
              </p>
            </div>
          </div>
          <p className="ml-auto text-[10px] text-mist-300 font-inter">{proposal.submittedAt}</p>
        </div>

        {/* Cover letter */}
        <div className="mt-3">
          <p className="text-xs font-semibold text-charcoal-800 font-inter mb-1.5 flex items-center gap-1.5">
            <FileText size={12} strokeWidth={2} className="text-copper-700" />
            Cover Letter
          </p>
          <p className="text-xs text-mist-500 font-inter leading-relaxed">
            {expanded || !isLong
              ? proposal.coverLetter
              : proposal.coverLetter.slice(0, previewLength) + '…'}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-copper-700 font-inter font-medium mt-1"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 mt-4">
          {/* View profile link */}
          {designer && (
            <Link
              to={`/client/designer/${designer.user_id}`}
              className="flex items-center gap-1 text-xs text-mist-500 font-inter hover:text-copper-700 transition-colors"
            >
              View Profile
              <ChevronRight size={12} strokeWidth={2.5} />
            </Link>
          )}

          <div className="ml-auto flex items-center gap-2">
            {/* Decline */}
            <motion.button
              onClick={() => onDecline(proposal.id)}
              whileTap={{ scale: 0.93 }}
              className="h-9 px-4 rounded-xl border border-mist-200 text-xs font-medium font-inter text-mist-500 hover:border-red-200 hover:text-red-500 transition-all flex items-center gap-1.5"
            >
              <X size={13} strokeWidth={2.5} />
              Decline
            </motion.button>

            {/* Accept */}
            <motion.button
              onClick={() => onAccept(proposal)}
              whileTap={{ scale: 0.97 }}
              className="h-9 px-4 rounded-xl bg-gradient-to-r from-copper-700 to-copper-600 text-white text-xs font-semibold font-inter shadow-md shadow-copper-700/25 flex items-center gap-1.5"
            >
              <CheckCircle2 size={13} strokeWidth={2} />
              Accept
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

const Proposals: React.FC = () => {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const { projects, designers, contracts, user, wallets, addNotification, initializeDemoData, lockFunds } = useStore()

  const [declinedIds, setDeclinedIds] = useState<Set<string>>(new Set())
  const [confirmProposal, setConfirmProposal] = useState<MockProposal | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)
  const [showWalletCheck, setShowWalletCheck] = useState(false)
  const [showMilestonesSetup, setShowMilestonesSetup] = useState(false)
  const [proposalInFlight, setProposalInFlight] = useState<MockProposal | null>(null)

  useEffect(() => {
    if (designers.length === 0) initializeDemoData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const resolvedProjectId = projectId ?? projects[0]?.id ?? 'demo-project-001'
  const project = projects.find((p) => p.id === resolvedProjectId)
  const proposals = buildMockProposals(resolvedProjectId)

  const visibleProposals = proposals.filter((p) => !declinedIds.has(p.id))

  const handleDecline = (proposalId: string) => {
    setDeclinedIds((prev) => new Set([...prev, proposalId]))
  }

  const handleAccept = (proposal: MockProposal) => {
    // Step 1: Check wallet balance
    const clientId = user?.id ?? 'demo-client-001'
    const clientWallet = wallets[clientId]

    if (!clientWallet || clientWallet.available_balance < proposal.proposedAmount) {
      setProposalInFlight(proposal)
      setShowWalletCheck(true)
      return
    }

    // Sufficient funds, proceed to milestone setup
    setProposalInFlight(proposal)
    setShowMilestonesSetup(true)
  }

  const handleGoToWallet = () => {
    setShowWalletCheck(false)
    setProposalInFlight(null)
    navigate('/client/wallet')
  }

  const handleMilestonesConfirm = async (milestones: MilestoneSetup[]) => {
    if (!proposalInFlight) return
    setIsAccepting(true)

    await new Promise((r) => setTimeout(r, 1000))

    const clientId = user?.id ?? 'demo-client-001'
    const contractId = `contract-${Date.now()}`

    // Lock funds in wallet (Step 2)
    lockFunds(clientId, proposalInFlight.proposedAmount)

    // Add notification (Step 3)
    addNotification(
      clientId,
      'Contract Activated',
      `Contract activated! Funds locked in escrow.`,
      'contract_update'
    )

    setIsAccepting(false)
    setShowMilestonesSetup(false)
    setProposalInFlight(null)

    // Navigate to contract detail
    navigate(`/client/contract/demo-contract-001`)
  }

  const handleConfirmAccept = async () => {
    if (!confirmProposal) return
    setIsAccepting(true)

    await new Promise((r) => setTimeout(r, 1000))

    const clientId = user?.id ?? 'demo-client-001'
    const contractId = `contract-${Date.now()}`

    // Add notification
    addNotification(
      clientId,
      'Contract Created',
      `You have accepted a proposal. A contract has been created.`,
      'contract_update'
    )

    setIsAccepting(false)
    setConfirmProposal(null)

    // Navigate to contract – use demo-contract-001 for demo flow
    navigate(`/client/contract/demo-contract-001`)
  }

  const acceptingDesigner = confirmProposal
    ? designers.find((d) => d.user_id === confirmProposal.designerId)
    : null

  return (
    <div className="min-h-screen bg-mist-100 pb-10">
      <div className="max-w-md mx-auto">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="sticky top-0 z-20 bg-mist-100/95 backdrop-blur-sm pt-4 pb-3 px-4"
        >
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white border border-mist-100 shadow-sm"
              whileTap={{ scale: 0.88 }}
            >
              <ArrowLeft size={18} strokeWidth={2} className="text-charcoal-800" />
            </motion.button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-charcoal-900 font-grotesk truncate">
                Proposals
              </h1>
              {project && (
                <p className="text-xs text-mist-500 font-inter truncate mt-0.5">
                  {project.title}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-copper-700/10 border border-copper-700/20">
              <Users size={12} className="text-copper-700" strokeWidth={2} />
              <span className="text-xs font-semibold text-copper-700 font-grotesk">
                {visibleProposals.length}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Proposal list ─────────────────────────────────────────────────── */}
        <div className="px-4 pt-2 space-y-4">
          <AnimatePresence>
            {visibleProposals.length > 0 ? (
              visibleProposals.map((proposal, idx) => {
                const designer = designers.find((d) => d.user_id === proposal.designerId)
                return (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    designer={designer}
                    isDeclined={declinedIds.has(proposal.id)}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    index={idx}
                  />
                )
              })
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-16 h-16 rounded-3xl bg-mist-200 flex items-center justify-center mb-4">
                  <FileText size={28} strokeWidth={1.5} className="text-mist-400" />
                </div>
                <h3 className="text-base font-semibold text-charcoal-800 font-grotesk">
                  No proposals remaining
                </h3>
                <p className="text-sm text-mist-500 font-inter mt-1.5 max-w-[220px]">
                  All proposals have been declined. Browse designers to invite them directly.
                </p>
                <motion.button
                  className="mt-5 px-5 py-2.5 rounded-xl bg-copper-700 text-white text-sm font-medium font-inter"
                  onClick={() => navigate('/client/browse')}
                  whileTap={{ scale: 0.96 }}
                >
                  Browse Designers
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Wallet Check Modal ─────────────────────────────────────────────── */}
      <WalletCheckModal
        isOpen={showWalletCheck}
        amount={proposalInFlight?.proposedAmount ?? 0}
        onGoToWallet={handleGoToWallet}
        onCancel={() => {
          setShowWalletCheck(false)
          setProposalInFlight(null)
        }}
      />

      {/* ── Milestones Setup Modal ─────────────────────────────────────────── */}
      <MilestonesSetupModal
        isOpen={showMilestonesSetup}
        contractAmount={proposalInFlight?.proposedAmount ?? 0}
        onConfirm={handleMilestonesConfirm}
        onCancel={() => {
          setShowMilestonesSetup(false)
          setProposalInFlight(null)
        }}
        isLoading={isAccepting}
      />

      {/* ── Confirmation modal ─────────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={confirmProposal !== null}
        designer={acceptingDesigner ?? null}
        amount={confirmProposal?.proposedAmount ?? 0}
        onConfirm={handleConfirmAccept}
        onCancel={() => setConfirmProposal(null)}
        isLoading={isAccepting}
      />
    </div>
  )
}

export default Proposals
