// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Contract Detail Screen
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  FileText,
  MessageCircle,
  Lock,
  CheckCircle2,
  Banknote,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  Smartphone,
  Loader2,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { MilestoneItem } from '../../components/features/MilestoneItem'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import type { ContractStatus, MilestoneStatus } from '../../lib/types'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatUGX(n: number): string {
  return new Intl.NumberFormat('en-UG', { maximumFractionDigits: 0 }).format(n)
}

const statusConfig: Record<ContractStatus, { label: string; variant: 'success' | 'info' | 'mist' | 'warning' | 'danger' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  active: { label: 'Active', variant: 'success' },
  completed: { label: 'Completed', variant: 'mist' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
  disputed: { label: 'Disputed', variant: 'danger' },
}

// ── Particle confetti effect ──────────────────────────────────────────────────

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
}

const COPPER_COLORS = ['#A0430A', '#C05515', '#D07040', '#F0A060', '#E8C090', '#B05818']

function useParticles(active: boolean, count = 28) {
  const [particles, setParticles] = useState<Particle[]>([])
  const animRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active) {
      setParticles([])
      return
    }

    const initial: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 50,
      y: 50,
      vx: (Math.random() - 0.5) * 6,
      vy: -(Math.random() * 4 + 2),
      color: COPPER_COLORS[Math.floor(Math.random() * COPPER_COLORS.length)],
      size: Math.random() * 8 + 4,
    }))

    setParticles(initial)

    const animate = () => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.2, // gravity
        }))
      )
      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    const timeout = setTimeout(() => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      setParticles([])
    }, 2000)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      clearTimeout(timeout)
    }
  }, [active]) // eslint-disable-line react-hooks/exhaustive-deps

  return particles
}

// ── USSD Modal ────────────────────────────────────────────────────────────────

type USSDStep = 'confirm' | 'typing' | 'loading' | 'success'

interface USSDLine {
  text: string
  delay: number
}

const USSD_LINES: USSDLine[] = [
  { text: 'Dialing *165#...', delay: 0 },
  { text: 'Connected to MTN Mobile Money', delay: 400 },
  { text: 'Enter amount: [AMOUNT]', delay: 800 },
  { text: '1. Confirm payment', delay: 1200 },
  { text: '2. Cancel', delay: 1500 },
  { text: '> Sending 1...', delay: 1800 },
  { text: 'Processing transaction...', delay: 2200 },
]

interface USSDModalProps {
  isOpen: boolean
  amount: number
  label: string
  onSuccess: () => void
  onClose: () => void
}

const USSDModal: React.FC<USSDModalProps> = ({ isOpen, amount, label, onSuccess, onClose }) => {
  const [step, setStep] = useState<USSDStep>('confirm')
  const [visibleLines, setVisibleLines] = useState<string[]>([])
  const particles = useParticles(step === 'success')

  useEffect(() => {
    if (!isOpen) {
      setStep('confirm')
      setVisibleLines([])
    }
  }, [isOpen])

  const startUSSD = () => {
    setStep('typing')
    setVisibleLines([])

    USSD_LINES.forEach(({ text, delay }) => {
      setTimeout(() => {
        const line = text.replace('[AMOUNT]', formatUGX(amount))
        setVisibleLines((prev) => [...prev, line])
      }, delay)
    })

    setTimeout(() => {
      setStep('loading')
    }, 2800)

    setTimeout(() => {
      setStep('success')
    }, 4000)
  }

  const handleSuccess = () => {
    onSuccess()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="ussd-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="ussd-modal"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm bg-charcoal-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">

              {/* MTN header bar */}
              <div className="bg-[#FFCC00] px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-black text-xs font-bold font-grotesk">MTN Mobile Money</p>
                  <p className="text-black/60 text-[10px] font-inter">Uganda</p>
                </div>
                <Smartphone size={18} className="text-black/70" strokeWidth={2} />
              </div>

              <div className="p-5">
                {/* Step: confirm */}
                {step === 'confirm' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <p className="text-white/50 text-xs font-inter mb-1">{label}</p>
                      <p className="text-white text-3xl font-bold font-grotesk tabular-nums">
                        UGX {formatUGX(amount)}
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-3 space-y-2 border border-white/10">
                      <div className="flex justify-between text-xs font-inter">
                        <span className="text-white/40">From</span>
                        <span className="text-white/80">+256 7XX XXX XXX</span>
                      </div>
                      <div className="flex justify-between text-xs font-inter">
                        <span className="text-white/40">To</span>
                        <span className="text-white/80">ArtConnect.Ug Escrow</span>
                      </div>
                      <div className="flex justify-between text-xs font-inter">
                        <span className="text-white/40">Fee</span>
                        <span className="text-white/80">UGX 0</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        onClick={onClose}
                        whileTap={{ scale: 0.96 }}
                        className="flex-1 h-11 rounded-2xl border border-white/15 text-white/60 text-sm font-inter"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={startUSSD}
                        whileTap={{ scale: 0.97 }}
                        className="flex-1 h-11 rounded-2xl bg-[#FFCC00] text-black font-semibold text-sm font-inter"
                      >
                        Confirm Payment
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Step: typing (USSD simulation) */}
                {step === 'typing' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="bg-black rounded-2xl p-4 font-mono text-xs min-h-[160px]">
                      {visibleLines.map((line, i) => (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          className={[
                            'leading-relaxed',
                            line.startsWith('>') ? 'text-[#FFCC00]' : 'text-green-400',
                          ].join(' ')}
                        >
                          {line}
                        </motion.p>
                      ))}
                      {/* Blinking cursor */}
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6 }}
                        className="text-green-400"
                      >
                        _
                      </motion.span>
                    </div>
                    <p className="text-white/30 text-xs font-inter text-center mt-3">
                      Simulating USSD session…
                    </p>
                  </motion.div>
                )}

                {/* Step: loading */}
                {step === 'loading' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-8 gap-4"
                  >
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full border-2 border-white/10 flex items-center justify-center">
                        <Loader2 size={24} className="text-[#FFCC00] animate-spin" strokeWidth={2} />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-white text-sm font-semibold font-grotesk">
                        Processing…
                      </p>
                      <p className="text-white/40 text-xs font-inter mt-1">
                        Please do not close this screen
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Step: success */}
                {step === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="flex flex-col items-center justify-center py-6 gap-4 relative"
                  >
                    {/* Particle canvas */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {particles.map((p) => (
                        <div
                          key={p.id}
                          className="absolute rounded-sm"
                          style={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            width: p.size,
                            height: p.size / 2,
                            backgroundColor: p.color,
                            transform: `rotate(${p.vx * 15}deg)`,
                            opacity: Math.max(0, 1 - p.y / 120),
                          }}
                        />
                      ))}
                    </div>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center"
                    >
                      <CheckCircle2 size={32} className="text-white" strokeWidth={2} />
                    </motion.div>

                    <div className="text-center">
                      <p className="text-white text-lg font-bold font-grotesk">
                        Payment Successful!
                      </p>
                      <p className="text-white/50 text-xs font-inter mt-1">
                        UGX {formatUGX(amount)} sent to escrow
                      </p>
                    </div>

                    <motion.button
                      onClick={handleSuccess}
                      whileTap={{ scale: 0.97 }}
                      className="w-full h-11 rounded-2xl bg-emerald-500 text-white font-semibold text-sm font-inter"
                    >
                      Continue
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Escrow Status Card ────────────────────────────────────────────────────────

interface EscrowCardProps {
  amount: number
  releasedAmount: number
  isEscrowFunded: boolean
  isCompleted: boolean
  onFund: () => void
}

const EscrowCard: React.FC<EscrowCardProps> = ({ amount, releasedAmount, isEscrowFunded, isCompleted, onFund }) => {
  const remaining = amount - releasedAmount
  const progressPct = amount > 0 ? Math.round((releasedAmount / amount) * 100) : 0

  return (
    <div
      className={[
        'rounded-2xl border p-4',
        isCompleted
          ? 'bg-emerald-50 border-emerald-300'
          : isEscrowFunded
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-amber-50 border-amber-200',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            isCompleted
              ? 'bg-emerald-200'
              : isEscrowFunded
                ? 'bg-emerald-100'
                : 'bg-amber-100',
          ].join(' ')}
        >
          {isCompleted ? (
            <CheckCircle2 size={18} className="text-emerald-600" strokeWidth={2} />
          ) : isEscrowFunded ? (
            <Lock size={18} className="text-emerald-600" strokeWidth={2} />
          ) : (
            <AlertCircle size={18} className="text-amber-600" strokeWidth={2} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p
              className={[
                'text-sm font-semibold font-grotesk',
                isCompleted
                  ? 'text-emerald-800'
                  : isEscrowFunded
                    ? 'text-emerald-800'
                    : 'text-amber-800',
              ].join(' ')}
            >
              {isCompleted ? 'Escrow Fully Released' : isEscrowFunded ? 'Escrow Funded' : 'Escrow Unfunded'}
            </p>
            <span
              className={[
                'text-xs font-bold font-grotesk tabular-nums',
                isCompleted
                  ? 'text-emerald-700'
                  : isEscrowFunded
                    ? 'text-emerald-700'
                    : 'text-amber-700',
              ].join(' ')}
            >
              UGX {formatUGX(amount)}
            </span>
          </div>
          {isCompleted ? (
            <p className="text-xs text-emerald-600 font-inter mt-0.5">
              All funds released to designer. Design files delivered. Project complete!
            </p>
          ) : isEscrowFunded ? (
            <div className="mt-2 space-y-1.5">
              <div className="flex justify-between text-[10px] font-inter">
                <span className="text-emerald-600">Released: UGX {formatUGX(releasedAmount)}</span>
                <span className="text-emerald-800 font-medium">{progressPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-copper-700 to-copper-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-emerald-600/70 font-inter">
                UGX {formatUGX(remaining)} remaining in escrow
              </p>
            </div>
          ) : (
            <p className="text-xs text-amber-600 font-inter mt-0.5">
              Fund the escrow to activate the contract and allow work to begin.
            </p>
          )}
        </div>
      </div>

      {!isEscrowFunded && !isCompleted && (
        <motion.button
          onClick={onFund}
          whileTap={{ scale: 0.97 }}
          className="mt-3 w-full h-10 rounded-xl bg-amber-600 text-white text-sm font-semibold font-inter shadow-sm flex items-center justify-center gap-2"
        >
          <Banknote size={16} strokeWidth={2} />
          Fund Escrow via MTN MoMo
        </motion.button>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

const ContractDetail: React.FC = () => {
  const navigate = useNavigate()
  const { contractId } = useParams<{ contractId: string }>()
  const {
    contracts,
    projects,
    designers,
    milestones,
    wallets,
    user,
    lockFunds,
    addNotification,
    updateMilestoneStatus,
    approveMilestone,
    initializeDemoData,
  } = useStore()

  const [showUSSD, setShowUSSD] = useState(false)
  const [isEscrowFunded, setIsEscrowFunded] = useState(false)

  useEffect(() => {
    if (designers.length === 0) initializeDemoData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const resolvedId = contractId ?? 'demo-contract-001'
  const contract = contracts.find((c) => c.id === resolvedId)

  if (!contract) {
    return (
      <div className="min-h-screen bg-mist-100 flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-mist-500 font-inter">Contract not found</p>
        <motion.button
          className="px-5 py-2.5 rounded-xl bg-copper-700 text-white text-sm font-inter"
          onClick={() => navigate(-1)}
          whileTap={{ scale: 0.96 }}
        >
          Go back
        </motion.button>
      </div>
    )
  }

  const project = projects.find((p) => p.id === contract.project_id)
  const designer = designers.find((d) => d.user_id === contract.designer_id)
  const clientId = user?.id ?? 'demo-client-001'
  const clientWallet = wallets[clientId]
  const clientName = user?.name ?? 'Amara Okafor'

  const contractMilestones = milestones
    .filter((m) => m.contract_id === resolvedId)
    .sort((a, b) => a.order_index - b.order_index)

  // Calculate how much has been released from escrow (sum of approved milestone amounts)
  const releasedAmount = contractMilestones
    .filter((m) => m.status === 'approved')
    .reduce((sum, m) => sum + m.amount, 0)

  const isCompleted = contract.status === 'completed'
  const allApproved = contractMilestones.length > 0 &&
    contractMilestones.every((m) => m.status === 'approved')

  const statusConf = statusConfig[contract.status] ?? statusConfig.active

  const handleEscrowSuccess = () => {
    lockFunds(clientId, contract.agreed_amount)
    setIsEscrowFunded(true)
    addNotification(
      clientId,
      'Escrow Funded!',
      `UGX ${formatUGX(contract.agreed_amount)} locked in escrow for "${project?.title ?? 'your project'}".`,
      'payment'
    )
    if (contract.designer_id) {
      addNotification(
        contract.designer_id,
        'Escrow Funded',
        'The client has funded the escrow. You can now start work on the contract milestones.',
        'payment'
      )
    }
  }

  const handleMilestoneStatusChange = (milestoneId: string, status: MilestoneStatus) => {
    updateMilestoneStatus(milestoneId, status)
  }

  const handleMilestoneApprove = (milestoneId: string) => {
    approveMilestone(milestoneId)
  }

  const handleRevision = (milestoneId: string) => {
    updateMilestoneStatus(milestoneId, 'revision_requested')
  }

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
                {project?.title ?? 'Contract Detail'}
              </h1>
              <p className="text-xs text-mist-500 font-inter mt-0.5">
                Contract #{resolvedId.slice(-6)}
              </p>
            </div>
            <Badge variant={statusConf.variant} size="sm" dot>
              {statusConf.label}
            </Badge>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="px-4 space-y-4 pt-2"
        >

          {/* ── Contract amount card ──────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-mist-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-copper-700/10 flex items-center justify-center">
                  <Banknote size={16} className="text-copper-700" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[10px] text-mist-400 font-inter uppercase tracking-wide">
                    Contract Value
                  </p>
                  <p className="text-lg font-bold text-charcoal-900 font-grotesk tabular-nums">
                    UGX {formatUGX(contract.agreed_amount)}
                  </p>
                </div>
              </div>
              <Badge variant={statusConf.variant} size="sm" dot>
                {statusConf.label}
              </Badge>
            </div>
          </div>

          {/* ── Parties ───────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-mist-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-mist-400 font-inter uppercase tracking-wide mb-3">
              Parties
            </p>
            <div className="flex items-center gap-3">
              {/* Client */}
              <div className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl bg-mist-100">
                <Avatar
                  src={user?.avatar_url ?? null}
                  name={clientName}
                  size="md"
                />
                <div className="text-center">
                  <p className="text-xs font-semibold text-charcoal-900 font-grotesk truncate max-w-[80px]">
                    {clientName.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-mist-400 font-inter">Client</p>
                </div>
              </div>

              {/* Contract icon */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-copper-700/10 flex items-center justify-center">
                  <FileText size={16} className="text-copper-700" strokeWidth={1.8} />
                </div>
                <div className="flex gap-0.5">
                  <div className="w-6 h-0.5 bg-gradient-to-r from-mist-300 to-copper-700/50 rounded" />
                  <div className="w-6 h-0.5 bg-gradient-to-r from-copper-700/50 to-mist-300 rounded" />
                </div>
              </div>

              {/* Designer */}
              <div className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl bg-mist-100">
                <Avatar
                  src={designer?.avatar_url ?? null}
                  name={designer?.name ?? 'Designer'}
                  size="md"
                />
                <div className="text-center">
                  <p className="text-xs font-semibold text-charcoal-900 font-grotesk truncate max-w-[80px]">
                    {designer?.name?.split(' ')[0] ?? 'Designer'}
                  </p>
                  <p className="text-[10px] text-mist-400 font-inter">Designer</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Escrow card ────────────────────────────────────────────────────── */}
          <EscrowCard
            amount={contract.agreed_amount}
            releasedAmount={releasedAmount}
            isEscrowFunded={isEscrowFunded || clientWallet?.locked_balance > 0}
            isCompleted={isCompleted}
            onFund={() => setShowUSSD(true)}
          />

          {/* ── Contract Completed Celebration ────────────────────────────────── */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
              className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 p-5 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                className="w-14 h-14 rounded-full bg-emerald-200 flex items-center justify-center mx-auto mb-3"
              >
                <CheckCircle2 size={28} className="text-emerald-600" strokeWidth={1.5} />
              </motion.div>
              <h3 className="font-grotesk font-bold text-emerald-800 text-lg">Project Complete!</h3>
              <p className="text-xs text-emerald-600/80 font-inter mt-1 leading-relaxed">
                All milestones approved. Full escrow of UGX {formatUGX(contract.agreed_amount)} released to {designer?.name ?? 'designer'}. All design files are now yours.
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-emerald-700 font-inter">
                <CheckCircle2 size={14} strokeWidth={2} />
                <span>Files delivered to you</span>
                <span className="text-emerald-400">|</span>
                <CheckCircle2 size={14} strokeWidth={2} />
                <span>Escrow fully released</span>
              </div>
            </motion.div>
          )}

          {/* ── Milestones ─────────────────────────────────────────────────────── */}
          {contractMilestones.length > 0 && (
            <div className="bg-white rounded-2xl border border-mist-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-mist-400 font-inter uppercase tracking-wide mb-4">
                Milestones
              </p>
              <div className="space-y-0">
                {contractMilestones.map((milestone, idx) => (
                  <MilestoneItem
                    key={milestone.id}
                    milestone={milestone}
                    userRole="client"
                    onStatusChange={handleMilestoneStatusChange}
                    onApprove={handleMilestoneApprove}
                    onRevision={handleRevision}
                    isFirst={idx === 0}
                    isLast={idx === contractMilestones.length - 1}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Action buttons ────────────────────────────────────────────────── */}
          <div className="flex gap-3">
            {!isEscrowFunded && (
              <motion.button
                onClick={() => setShowUSSD(true)}
                whileTap={{ scale: 0.97 }}
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-copper-700 to-copper-600 text-white font-semibold font-inter text-sm shadow-lg shadow-copper-700/25 flex items-center justify-center gap-2"
              >
                <Lock size={16} strokeWidth={2} />
                Fund Escrow
              </motion.button>
            )}

            <motion.button
              onClick={() => navigate(`/chat/${resolvedId}`)}
              whileTap={{ scale: 0.97 }}
              className={[
                'h-12 rounded-2xl font-medium font-inter text-sm flex items-center justify-center gap-2 border transition-all',
                isEscrowFunded
                  ? 'flex-1 bg-gradient-to-r from-copper-700 to-copper-600 text-white border-transparent shadow-lg shadow-copper-700/25'
                  : 'px-4 bg-white border-mist-200 text-charcoal-700',
              ].join(' ')}
            >
              <MessageCircle size={16} strokeWidth={1.8} />
              {isEscrowFunded ? 'Open Chat' : 'Chat'}
            </motion.button>

            <motion.button
              onClick={() => navigate(`/dispute/${resolvedId}`)}
              whileTap={{ scale: 0.97 }}
              className="h-12 px-4 rounded-2xl font-medium font-inter text-sm flex items-center justify-center gap-2 border border-red-200 bg-white text-red-600 transition-all hover:bg-red-50"
            >
              <AlertTriangle size={16} strokeWidth={1.8} />
              Dispute
            </motion.button>
          </div>

          <div className="h-4" />
        </motion.div>
      </div>

      {/* ── USSD Modal ─────────────────────────────────────────────────────── */}
      <USSDModal
        isOpen={showUSSD}
        amount={contract.agreed_amount}
        label="Fund Contract Escrow"
        onSuccess={handleEscrowSuccess}
        onClose={() => setShowUSSD(false)}
      />
    </div>
  )
}

export default ContractDetail
