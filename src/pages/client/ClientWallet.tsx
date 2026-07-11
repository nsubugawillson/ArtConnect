// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Client Wallet Screen
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  TrendingUp,
  Lock,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Plus,
  Smartphone,
  CheckCircle2,
  Loader2,
  FileText,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { WalletCard } from '../../components/features/WalletCard'
import { BottomNav } from '../../components/layout/BottomNav'
import { Avatar } from '../../components/ui/Avatar'

// ── Types ─────────────────────────────────────────────────────────────────────

interface MockTransaction {
  id: string
  type: 'top_up' | 'lock' | 'release' | 'refund'
  amount: number
  description: string
  createdAt: string
  sign: '+' | '-'
}

type USSDTopUpStep = 'select_amount' | 'confirm' | 'typing' | 'loading' | 'success'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatUGX(n: number): string {
  return new Intl.NumberFormat('en-UG', { maximumFractionDigits: 0 }).format(n)
}

function parseBudget(raw: string): number {
  return Number(raw.replace(/[^\d]/g, '')) || 0
}

function formatBudgetInput(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('en-UG').format(Number(digits))
}

// ── Mock Transaction Data ─────────────────────────────────────────────────────

const MOCK_TRANSACTIONS: MockTransaction[] = [
  {
    id: 'tx-001',
    type: 'top_up',
    amount: 5000000,
    description: 'Top-up via MTN Mobile Money',
    createdAt: '2 days ago',
    sign: '+',
  },
  {
    id: 'tx-002',
    type: 'lock',
    amount: 3500000,
    description: 'Escrow: Product Packaging Design',
    createdAt: '1 day ago',
    sign: '-',
  },
  {
    id: 'tx-003',
    type: 'top_up',
    amount: 10000000,
    description: 'Top-up via Airtel Money',
    createdAt: '5 days ago',
    sign: '+',
  },
  {
    id: 'tx-004',
    type: 'release',
    amount: 700000,
    description: 'Released: Research & Concept Development',
    createdAt: '3 days ago',
    sign: '-',
  },
  {
    id: 'tx-005',
    type: 'lock',
    amount: 5000000,
    description: 'Escrow: Mobile App UI/UX Design',
    createdAt: '4 days ago',
    sign: '-',
  },
]

const QUICK_AMOUNTS = [500000, 1000000, 2000000, 5000000]

const USSD_LINES = [
  { text: 'Dialing *165#...', delay: 0 },
  { text: 'Connected to MTN Mobile Money', delay: 400 },
  { text: 'Select service:', delay: 700 },
  { text: '  1. Send Money', delay: 900 },
  { text: '  2. Top Up Account', delay: 1100 },
  { text: '> Sending 2...', delay: 1400 },
  { text: 'Enter Amount: [AMOUNT]', delay: 1700 },
  { text: 'Recipient: ArtConnect.Ug', delay: 2000 },
  { text: '> Confirm: 1', delay: 2300 },
]

// ── Transaction Icon & Color ──────────────────────────────────────────────────

function txConfig(type: MockTransaction['type']): {
  icon: React.ElementType
  iconColor: string
  bgColor: string
  amountColor: string
} {
  switch (type) {
    case 'top_up':
      return {
        icon: ArrowDownLeft,
        iconColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        amountColor: 'text-emerald-600',
      }
    case 'lock':
      return {
        icon: Lock,
        iconColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
        amountColor: 'text-amber-600',
      }
    case 'release':
      return {
        icon: ArrowUpRight,
        iconColor: 'text-copper-700',
        bgColor: 'bg-copper-700/10',
        amountColor: 'text-copper-700',
      }
    case 'refund':
      return {
        icon: TrendingUp,
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        amountColor: 'text-blue-600',
      }
  }
}

// ── USSD Top-Up Modal ─────────────────────────────────────────────────────────

interface USSDTopUpModalProps {
  isOpen: boolean
  onSuccess: (amount: number) => void
  onClose: () => void
}

const USSDTopUpModal: React.FC<USSDTopUpModalProps> = ({ isOpen, onSuccess, onClose }) => {
  const [step, setStep] = useState<USSDTopUpStep>('select_amount')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [visibleLines, setVisibleLines] = useState<string[]>([])

  useEffect(() => {
    if (!isOpen) {
      setStep('select_amount')
      setSelectedAmount(null)
      setCustomAmount('')
      setVisibleLines([])
    }
  }, [isOpen])

  const finalAmount = selectedAmount ?? parseBudget(customAmount)

  const handleProceed = () => {
    if (finalAmount < 10000) return
    setStep('confirm')
  }

  const startUSSD = () => {
    setStep('typing')
    setVisibleLines([])

    USSD_LINES.forEach(({ text, delay }) => {
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, text.replace('[AMOUNT]', `UGX ${formatUGX(finalAmount)}`)])
      }, delay)
    })

    setTimeout(() => setStep('loading'), 2800)
    setTimeout(() => setStep('success'), 4200)
  }

  const handleDone = () => {
    onSuccess(finalAmount)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="topup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={step === 'select_amount' ? onClose : undefined}
          />

          <motion.div
            key="topup-modal"
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
          >
            <div className="w-full max-w-sm bg-charcoal-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              {/* Header bar */}
              <div className="bg-[#FFCC00] px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-black text-xs font-bold font-grotesk">MTN Mobile Money</p>
                  <p className="text-black/60 text-[10px] font-inter">Wallet Top-Up</p>
                </div>
                <Smartphone size={18} className="text-black/70" strokeWidth={2} />
              </div>

              <div className="p-5">
                {/* Step: Select amount */}
                {step === 'select_amount' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <p className="text-white text-sm font-semibold font-grotesk">Choose Amount</p>

                    {/* Quick amounts */}
                    <div className="grid grid-cols-2 gap-2">
                      {QUICK_AMOUNTS.map((amt) => (
                        <motion.button
                          key={amt}
                          onClick={() => {
                            setSelectedAmount(amt)
                            setCustomAmount('')
                          }}
                          whileTap={{ scale: 0.95 }}
                          className={[
                            'py-3 px-4 rounded-2xl text-sm font-semibold font-grotesk transition-all border',
                            selectedAmount === amt
                              ? 'bg-[#FFCC00] text-black border-transparent'
                              : 'bg-white/5 text-white border-white/10 hover:border-white/30',
                          ].join(' ')}
                        >
                          {formatUGX(amt)}
                        </motion.button>
                      ))}
                    </div>

                    {/* Custom amount */}
                    <div>
                      <p className="text-white/40 text-xs font-inter mb-1.5">Or enter custom amount</p>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm font-inter">
                          UGX
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={customAmount}
                          onChange={(e) => {
                            setCustomAmount(formatBudgetInput(e.target.value))
                            setSelectedAmount(null)
                          }}
                          className="w-full h-11 pl-12 pr-3.5 bg-white/5 border border-white/10 rounded-2xl text-white text-sm font-inter font-semibold placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#FFCC00]/50 focus:border-[#FFCC00]/30"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        onClick={onClose}
                        whileTap={{ scale: 0.96 }}
                        className="flex-none px-4 h-11 rounded-2xl border border-white/10 text-white/50 text-sm font-inter"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={handleProceed}
                        disabled={finalAmount < 10000}
                        whileTap={finalAmount < 10000 ? {} : { scale: 0.97 }}
                        className="flex-1 h-11 rounded-2xl bg-[#FFCC00] text-black font-semibold text-sm font-inter disabled:opacity-40 flex items-center justify-center gap-2"
                      >
                        <Plus size={15} strokeWidth={2.5} />
                        Top Up {finalAmount >= 10000 ? `UGX ${formatUGX(finalAmount)}` : ''}
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Step: Confirm */}
                {step === 'confirm' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="text-center">
                      <p className="text-white/50 text-xs font-inter mb-1">You are topping up</p>
                      <p className="text-white text-3xl font-bold font-grotesk tabular-nums">
                        UGX {formatUGX(finalAmount)}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 space-y-2 border border-white/10">
                      <div className="flex justify-between text-xs font-inter">
                        <span className="text-white/40">From</span>
                        <span className="text-white/80">+256 7XX XXX XXX</span>
                      </div>
                      <div className="flex justify-between text-xs font-inter">
                        <span className="text-white/40">To</span>
                        <span className="text-white/80">ArtConnect.Ug Wallet</span>
                      </div>
                      <div className="flex justify-between text-xs font-inter">
                        <span className="text-white/40">Fee</span>
                        <span className="text-white/80">UGX 0</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <motion.button
                        onClick={() => setStep('select_amount')}
                        whileTap={{ scale: 0.96 }}
                        className="flex-1 h-11 rounded-2xl border border-white/15 text-white/60 text-sm font-inter"
                      >
                        Back
                      </motion.button>
                      <motion.button
                        onClick={startUSSD}
                        whileTap={{ scale: 0.97 }}
                        className="flex-1 h-11 rounded-2xl bg-[#FFCC00] text-black font-semibold text-sm font-inter"
                      >
                        Confirm
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Step: USSD terminal */}
                {step === 'typing' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="bg-black rounded-2xl p-4 font-mono text-xs min-h-[160px]">
                      {visibleLines.map((line, i) => (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          className={line.startsWith('>') ? 'text-[#FFCC00]' : 'text-green-400'}
                        >
                          {line}
                        </motion.p>
                      ))}
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

                {/* Step: Loading */}
                {step === 'loading' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-8 gap-4"
                  >
                    <Loader2 size={32} className="text-[#FFCC00] animate-spin" strokeWidth={2} />
                    <div className="text-center">
                      <p className="text-white text-sm font-semibold font-grotesk">Processing…</p>
                      <p className="text-white/40 text-xs font-inter mt-1">
                        Please do not close this screen
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Step: Success */}
                {step === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="flex flex-col items-center justify-center py-6 gap-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center"
                    >
                      <CheckCircle2 size={32} className="text-white" strokeWidth={2} />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-white text-lg font-bold font-grotesk">Top-Up Successful!</p>
                      <p className="text-white/50 text-xs font-inter mt-1">
                        UGX {formatUGX(finalAmount)} added to your wallet
                      </p>
                    </div>
                    <motion.button
                      onClick={handleDone}
                      whileTap={{ scale: 0.97 }}
                      className="w-full h-11 rounded-2xl bg-emerald-500 text-white font-semibold text-sm font-inter"
                    >
                      Done
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

// ── Transaction Item ──────────────────────────────────────────────────────────

interface TransactionItemProps {
  tx: MockTransaction
  index: number
}

const TransactionItem: React.FC<TransactionItemProps> = ({ tx, index }) => {
  const conf = txConfig(tx.type)
  const Icon = conf.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="flex items-center gap-3"
    >
      <div className={['w-9 h-9 rounded-xl flex items-center justify-center shrink-0', conf.bgColor].join(' ')}>
        <Icon size={16} strokeWidth={2} className={conf.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-charcoal-900 font-grotesk leading-snug truncate">
          {tx.description}
        </p>
        <p className="text-[10px] text-mist-400 font-inter mt-0.5">{tx.createdAt}</p>
      </div>
      <span className={['text-sm font-bold font-grotesk tabular-nums shrink-0', conf.amountColor].join(' ')}>
        {tx.sign}{formatUGX(tx.amount)}
      </span>
    </motion.div>
  )
}

// ── Locked Funds Row ──────────────────────────────────────────────────────────

interface LockedFundsRowProps {
  contractId: string
  projectTitle: string
  amount: number
  designerName: string
  designerAvatar: string | null
}

const LockedFundsRow: React.FC<LockedFundsRowProps> = ({
  contractId,
  projectTitle,
  amount,
  designerName,
  designerAvatar,
}) => {
  const navigate = useNavigate()
  return (
    <motion.div
      className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 border border-amber-100 cursor-pointer hover:border-amber-300 transition-all"
      onClick={() => navigate(`/client/contract/${contractId}`)}
      whileTap={{ scale: 0.985 }}
    >
      <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
        <Lock size={16} className="text-amber-600" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-amber-800 font-grotesk truncate">{projectTitle}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Avatar src={designerAvatar} name={designerName} size="xs" />
          <span className="text-[10px] text-amber-600 font-inter">{designerName}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-amber-700 font-grotesk tabular-nums">
          {formatUGX(amount)}
        </p>
        <p className="text-[10px] text-amber-500 font-inter">UGX</p>
      </div>
      <ChevronRight size={14} className="text-amber-400 shrink-0" strokeWidth={2} />
    </motion.div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

const ClientWallet: React.FC = () => {
  const navigate = useNavigate()
  const { user, wallets, contracts, projects, designers, topUpWallet, addNotification, initializeDemoData } = useStore()

  const [showTopUp, setShowTopUp] = useState(false)
  const [transactions, setTransactions] = useState<MockTransaction[]>(MOCK_TRANSACTIONS)

  useEffect(() => {
    if (designers.length === 0) initializeDemoData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const userId = user?.id ?? 'demo-client-001'
  const wallet = wallets[userId]

  const handleTopUpSuccess = (amount: number) => {
    topUpWallet(userId, amount)
    addNotification(userId, 'Wallet Topped Up', `UGX ${formatUGX(amount)} added to your wallet.`, 'payment')

    // Add to local transactions list
    const newTx: MockTransaction = {
      id: `tx-${Date.now()}`,
      type: 'top_up',
      amount,
      description: 'Top-up via MTN Mobile Money',
      createdAt: 'Just now',
      sign: '+',
    }
    setTransactions((prev) => [newTx, ...prev])
  }

  // Active contracts with locked funds
  const lockedContracts = contracts.filter(
    (c) => c.client_id === userId && (c.status === 'active' || c.status === 'pending')
  )

  const totalLocked = lockedContracts.reduce((sum, c) => sum + c.agreed_amount, 0)

  return (
    <div className="min-h-screen bg-mist-100 pb-24">
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
            <div>
              <h1 className="text-base font-bold text-charcoal-900 font-grotesk">My Wallet</h1>
              <p className="text-xs text-mist-500 font-inter">UGX · Uganda Shillings</p>
            </div>
          </div>
        </motion.div>

        <div className="px-4 space-y-5 pt-2">

          {/* ── WalletCard ─────────────────────────────────────────────────── */}
          {wallet ? (
            <WalletCard
              wallet={wallet}
              onTopUp={() => setShowTopUp(true)}
            />
          ) : (
            <div className="h-48 rounded-3xl bg-charcoal-900 animate-pulse" />
          )}

          {/* ── Locked Funds section ──────────────────────────────────────── */}
          {lockedContracts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lock size={14} strokeWidth={2} className="text-amber-600" />
                  <h2 className="text-sm font-semibold text-charcoal-900 font-grotesk">
                    Locked in Escrow
                  </h2>
                </div>
                <span className="text-xs font-bold text-amber-700 font-grotesk">
                  UGX {formatUGX(totalLocked)}
                </span>
              </div>
              <div className="space-y-2">
                {lockedContracts.map((contract) => {
                  const project = projects.find((p) => p.id === contract.project_id)
                  const designer = designers.find((d) => d.user_id === contract.designer_id)
                  return (
                    <LockedFundsRow
                      key={contract.id}
                      contractId={contract.id}
                      projectTitle={project?.title ?? 'Project'}
                      amount={contract.agreed_amount}
                      designerName={designer?.name ?? 'Designer'}
                      designerAvatar={designer?.avatar_url ?? null}
                    />
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── Transaction History ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-charcoal-900 font-grotesk">
                Transaction History
              </h2>
              <span className="text-xs text-mist-400 font-inter">{transactions.length} records</span>
            </div>

            <div className="bg-white rounded-2xl border border-mist-100 shadow-sm">
              {transactions.length > 0 ? (
                <div className="divide-y divide-mist-100">
                  {transactions.map((tx, idx) => (
                    <div key={tx.id} className="px-4 py-3.5">
                      <TransactionItem tx={tx} index={idx} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-mist-100 flex items-center justify-center">
                    <FileText size={20} className="text-mist-400" strokeWidth={1.8} />
                  </div>
                  <p className="text-sm font-semibold text-charcoal-800 font-grotesk">
                    No transactions yet
                  </p>
                  <p className="text-xs text-mist-500 font-inter">
                    Top up your wallet to get started
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Top Up CTA card ───────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.35 }}
            className="bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-[#3D1A06] rounded-3xl p-5 relative overflow-hidden"
          >
            {/* Background glow */}
            <div
              className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(160,67,10,0.3) 0%, transparent 70%)',
              }}
              aria-hidden="true"
            />
            <div className="relative z-10">
              <p className="text-white text-sm font-semibold font-grotesk mb-1">
                Ready to start a new project?
              </p>
              <p className="text-white/50 text-xs font-inter mb-4">
                Top up your wallet and hire vetted Ugandan designers
              </p>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowTopUp(true)}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 h-10 rounded-xl bg-[#FFCC00] text-black font-semibold text-xs font-inter flex items-center justify-center gap-1.5"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  Top Up Now
                </motion.button>
                <Link
                  to="/client/browse"
                  className="flex-1 h-10 rounded-xl border border-white/15 text-white/70 text-xs font-inter flex items-center justify-center gap-1.5 hover:border-white/30 hover:text-white transition-all"
                >
                  Browse Designers
                  <ChevronRight size={13} strokeWidth={2} />
                </Link>
              </div>
            </div>
          </motion.div>

          <div className="h-4" />
        </div>
      </div>

      {/* ── Top-Up Modal ──────────────────────────────────────────────────── */}
      <USSDTopUpModal
        isOpen={showTopUp}
        onSuccess={handleTopUpSuccess}
        onClose={() => setShowTopUp(false)}
      />

      <BottomNav role="client" />
    </div>
  )
}

export default ClientWallet
