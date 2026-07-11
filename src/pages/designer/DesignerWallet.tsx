// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Designer Wallet Screen
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  TrendingUp,
  Phone,
  CheckCircle,
  Banknote,
  Clock,
  ChevronRight,
  AlertCircle,
  Smartphone,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { Header } from '../../components/layout/Header'
import { BottomNav } from '../../components/layout/BottomNav'
import { WalletCard } from '../../components/features/WalletCard'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'

// ── Types ─────────────────────────────────────────────────────────────────────

type WithdrawStep = 'form' | 'confirm' | 'success'
type Provider = 'mtn' | 'airtel'

interface MockTransaction {
  id: string
  type: 'earning' | 'withdrawal' | 'pending'
  description: string
  amount: number
  date: string
  project?: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const formatUGX = (n: number): string =>
  new Intl.NumberFormat('en-UG', { maximumFractionDigits: 0 }).format(n)

const MOCK_TRANSACTIONS: MockTransaction[] = [
  {
    id: 'txn-001',
    type: 'earning',
    description: 'Milestone 1 approved',
    project: 'Product Packaging Design',
    amount: 700000,
    date: '2024-03-15',
  },
  {
    id: 'txn-002',
    type: 'withdrawal',
    description: 'MTN MoMo withdrawal',
    amount: -500000,
    date: '2024-03-12',
  },
  {
    id: 'txn-003',
    type: 'earning',
    description: 'Milestone 4 approved',
    project: 'Mobile App UI/UX',
    amount: 1000000,
    date: '2024-03-08',
  },
  {
    id: 'txn-004',
    type: 'earning',
    description: 'Project completed bonus',
    project: 'Brand Identity 2023',
    amount: 300000,
    date: '2024-03-01',
  },
  {
    id: 'txn-005',
    type: 'withdrawal',
    description: 'Airtel Money withdrawal',
    amount: -800000,
    date: '2024-02-25',
  },
  {
    id: 'txn-006',
    type: 'pending',
    description: 'Pending release – Packaging Milestone 2',
    project: 'Product Packaging Design',
    amount: 1050000,
    date: '2024-03-16',
  },
]

const RECENT_EARNINGS = [
  {
    id: 'earn-001',
    project: 'Product Packaging Design',
    milestone: 'Research & Concept Development',
    amount: 700000,
    date: 'Mar 15',
    status: 'released',
  },
  {
    id: 'earn-002',
    project: 'Mobile App UI/UX Design',
    milestone: 'Discovery & User Research',
    amount: 1000000,
    date: 'Mar 8',
    status: 'released',
  },
  {
    id: 'earn-003',
    project: 'Product Packaging Design',
    milestone: 'Structural Packaging Design & MRR',
    amount: 1050000,
    date: 'Pending',
    status: 'pending',
  },
]

// ── Withdraw Modal ────────────────────────────────────────────────────────────

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  maxAmount: number
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, maxAmount }) => {
  const [step, setStep] = useState<WithdrawStep>('form')
  const [provider, setProvider] = useState<Provider>('mtn')
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const amountNum = parseFloat(amount.replace(/,/g, '')) || 0
  const isValid = phone.length >= 10 && amountNum > 0 && amountNum <= maxAmount

  const handleConfirm = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('success')
    }, 1800)
  }

  const handleClose = () => {
    setStep('form')
    setPhone('')
    setAmount('')
    onClose()
  }

  const providerConfig = {
    mtn: { name: 'MTN MoMo', color: 'bg-yellow-400', textColor: 'text-yellow-800' },
    airtel: { name: 'Airtel Money', color: 'bg-red-500', textColor: 'text-white' },
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'success' ? 'Withdrawal Initiated' : 'Withdraw Funds'}
      size="md"
    >
      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-5 pt-1 pb-2"
          >
            {/* Available balance */}
            <div className="bg-charcoal-900 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-white/50 text-xs font-inter">Available</span>
              <span className="text-white font-bold font-grotesk">
                UGX {formatUGX(maxAmount)}
              </span>
            </div>

            {/* Provider selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-charcoal-900 font-inter uppercase tracking-wide">
                Mobile Money Provider
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['mtn', 'airtel'] as Provider[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setProvider(p)}
                    className={[
                      'flex items-center gap-2 p-3 rounded-xl border-2 transition-colors',
                      provider === p
                        ? 'border-copper-700 bg-copper-700/5'
                        : 'border-mist-200 bg-white hover:border-mist-300',
                    ].join(' ')}
                  >
                    <div
                      className={[
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        providerConfig[p].color,
                      ].join(' ')}
                    >
                      <Smartphone size={14} className={providerConfig[p].textColor} strokeWidth={2} />
                    </div>
                    <span className="text-xs font-semibold text-charcoal-900 font-inter">
                      {providerConfig[p].name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Phone number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-charcoal-900 font-inter uppercase tracking-wide">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-mist-400"
                  strokeWidth={1.8}
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+256 700 000 000"
                  className={[
                    'w-full h-10 pl-9 pr-3 rounded-xl border text-sm font-inter',
                    'bg-white border-mist-200 text-charcoal-900 placeholder:text-mist-300',
                    'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700',
                  ].join(' ')}
                />
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-charcoal-900 font-inter uppercase tracking-wide">
                Amount (UGX)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-mist-400 font-grotesk">
                  UGX
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500,000"
                  min={10000}
                  max={maxAmount}
                  className={[
                    'w-full h-10 pl-12 pr-3 rounded-xl border text-sm font-grotesk',
                    'bg-white border-mist-200 text-charcoal-900 placeholder:text-mist-300',
                    'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700',
                  ].join(' ')}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {[100000, 250000, 500000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(String(preset))}
                    disabled={preset > maxAmount}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-mist-100 text-charcoal-900 font-inter hover:bg-mist-200 disabled:opacity-40 transition-colors"
                  >
                    {formatUGX(preset)}
                  </button>
                ))}
              </div>
            </div>

            {amountNum > maxAmount && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-600 font-inter">
                  Amount exceeds available balance
                </p>
              </div>
            )}

            <Button
              variant="primary"
              fullWidth
              onClick={() => setStep('confirm')}
              disabled={!isValid}
              rightIcon={<ChevronRight size={15} strokeWidth={2.5} />}
            >
              Continue
            </Button>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-5 pt-1 pb-2"
          >
            <div className="bg-mist-50 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-semibold text-mist-500 font-inter uppercase tracking-wide">
                Withdrawal Summary
              </p>
              {[
                { label: 'Provider', value: providerConfig[provider].name },
                { label: 'Phone', value: phone },
                { label: 'Amount', value: `UGX ${formatUGX(amountNum)}` },
                { label: 'Fee', value: 'Free' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-xs text-mist-400 font-inter">{row.label}</span>
                  <span className="text-xs font-semibold text-charcoal-900 font-grotesk">
                    {row.value}
                  </span>
                </div>
              ))}
              <div className="border-t border-mist-200 pt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-charcoal-900 font-grotesk">You receive</span>
                <span className="text-sm font-bold text-copper-700 font-grotesk">
                  UGX {formatUGX(amountNum)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setStep('form')}
                disabled={loading}
              >
                Edit
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleConfirm}
                loading={loading}
              >
                Confirm
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-4"
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
                Withdrawal Initiated
              </h3>
              <p className="text-sm text-mist-500 font-inter">
                UGX {formatUGX(amountNum)} will arrive on {providerConfig[provider].name} shortly
              </p>
              <p className="text-xs text-mist-400 font-inter">
                Typically within 2–5 minutes
              </p>
            </div>
            <Button variant="primary" fullWidth onClick={handleClose}>
              Done
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}

// ── Transaction Item ──────────────────────────────────────────────────────────

const TransactionItem: React.FC<{ txn: MockTransaction }> = ({ txn }) => {
  const isEarning = txn.type === 'earning'
  const isPending = txn.type === 'pending'

  return (
    <div className="flex items-center gap-3 py-3 border-b border-mist-100 last:border-0">
      <div
        className={[
          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
          isEarning ? 'bg-emerald-100' : isPending ? 'bg-amber-100' : 'bg-mist-100',
        ].join(' ')}
      >
        {isEarning ? (
          <ArrowDownLeft size={16} className="text-emerald-500" strokeWidth={2} />
        ) : isPending ? (
          <Clock size={16} className="text-amber-500" strokeWidth={2} />
        ) : (
          <ArrowUpRight size={16} className="text-mist-500" strokeWidth={2} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-charcoal-900 font-inter truncate">
          {txn.description}
        </p>
        {txn.project && (
          <p className="text-[10px] text-mist-400 font-inter truncate">{txn.project}</p>
        )}
        <p className="text-[10px] text-mist-400 font-inter">{txn.date}</p>
      </div>
      <div className="text-right shrink-0">
        <p
          className={[
            'text-sm font-bold font-grotesk',
            isEarning
              ? 'text-emerald-600'
              : isPending
              ? 'text-amber-600'
              : 'text-charcoal-900',
          ].join(' ')}
        >
          {isEarning || isPending ? '+' : ''}
          UGX {formatUGX(Math.abs(txn.amount))}
        </p>
        {isPending && (
          <Badge variant="warning" size="sm">Pending</Badge>
        )}
      </div>
    </div>
  )
}

// ── Earnings Card ─────────────────────────────────────────────────────────────

const EarningsCard: React.FC<{
  project: string
  milestone: string
  amount: number
  date: string
  status: string
}> = ({ project, milestone, amount, date, status }) => (
  <div className="flex items-center gap-3 py-3 border-b border-mist-100/60 last:border-0">
    <div
      className={[
        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
        status === 'released' ? 'bg-emerald-100' : 'bg-amber-100',
      ].join(' ')}
    >
      <Banknote
        size={15}
        className={status === 'released' ? 'text-emerald-500' : 'text-amber-500'}
        strokeWidth={1.8}
      />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-charcoal-900 font-grotesk truncate">
        {project}
      </p>
      <p className="text-[10px] text-mist-400 font-inter truncate">{milestone}</p>
    </div>
    <div className="text-right shrink-0 space-y-0.5">
      <p
        className={[
          'text-sm font-bold font-grotesk',
          status === 'released' ? 'text-emerald-600' : 'text-amber-600',
        ].join(' ')}
      >
        +UGX {formatUGX(amount)}
      </p>
      <p className="text-[10px] text-mist-400 font-inter">{date}</p>
    </div>
  </div>
)

// ── Main Component ────────────────────────────────────────────────────────────

export const DesignerWallet: React.FC = () => {
  const user = useStore((s) => s.user ?? s.currentUser)
  const wallets = useStore((s) => s.wallets)
  const contracts = useStore((s) => s.contracts)
  const milestones = useStore((s) => s.milestones)
  const initializeDemoData = useStore((s) => s.initializeDemoData)

  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [txnFilter, setTxnFilter] = useState<'all' | 'earning' | 'withdrawal'>('all')

  useEffect(() => {
    initializeDemoData()
  }, [initializeDemoData])

  const designerId = user?.id ?? 'demo-designer-001'
  const wallet = wallets[designerId]

  // Compute lifetime earnings from approved milestones linked to designer's contracts
  const myContractIds = contracts
    .filter((c) => c.designer_id === designerId)
    .map((c) => c.id)

  const lifetimeEarned = milestones
    .filter((m) => myContractIds.includes(m.contract_id) && m.status === 'approved')
    .reduce((sum, m) => sum + m.amount, 0)

  const pendingRelease = milestones
    .filter(
      (m) =>
        myContractIds.includes(m.contract_id) &&
        (m.status === 'submitted' || m.status === 'in_progress')
    )
    .reduce((sum, m) => sum + m.amount, 0)

  const filteredTxns =
    txnFilter === 'all'
      ? MOCK_TRANSACTIONS
      : MOCK_TRANSACTIONS.filter((t) => t.type === txnFilter || (txnFilter === 'earning' && t.type === 'pending'))

  return (
    <div className="min-h-screen bg-mist-50 pb-24">
      <Header title="My Wallet" showNotifications />

      <div className="px-4 pt-5 pb-6 space-y-5">
        {/* ── Wallet Card ──────────────────────────────────────────────────────── */}
        {wallet ? (
          <WalletCard
            wallet={wallet}
            onWithdraw={() => setWithdrawOpen(true)}
          />
        ) : (
          <div className="rounded-3xl bg-charcoal-900 h-48 animate-pulse" />
        )}

        {/* ── Stats Row ────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'Lifetime Earned',
              value: `UGX ${formatUGX(lifetimeEarned)}`,
              icon: TrendingUp,
              color: 'text-emerald-500',
              bg: 'bg-emerald-50',
            },
            {
              label: 'Pending Release',
              value: `UGX ${formatUGX(pendingRelease)}`,
              icon: Clock,
              color: 'text-amber-500',
              bg: 'bg-amber-50',
            },
            {
              label: 'Locked',
              value: `UGX ${formatUGX(wallet?.locked_balance ?? 0)}`,
              icon: Lock,
              color: 'text-mist-500',
              bg: 'bg-mist-100',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white border border-mist-100 rounded-xl p-3 space-y-1.5"
            >
              <div className={['w-7 h-7 rounded-lg flex items-center justify-center', s.bg].join(' ')}>
                <s.icon size={14} className={s.color} strokeWidth={2} />
              </div>
              <p className="text-xs font-bold text-charcoal-900 font-grotesk leading-tight">
                {s.value}
              </p>
              <p className="text-[9px] text-mist-400 font-inter leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Recent Earnings ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-mist-100 overflow-hidden">
          <div className="px-4 py-3.5 border-b border-mist-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-charcoal-900 font-grotesk">
              Recent Earnings
            </h3>
            <Badge variant="copper" size="sm">{RECENT_EARNINGS.length} items</Badge>
          </div>
          <div className="px-4">
            {RECENT_EARNINGS.map((e) => (
              <EarningsCard key={e.id} {...e} />
            ))}
          </div>
        </div>

        {/* ── Transaction History ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-mist-100 overflow-hidden">
          <div className="px-4 py-3.5 border-b border-mist-100">
            <h3 className="text-sm font-semibold text-charcoal-900 font-grotesk mb-3">
              Transaction History
            </h3>
            {/* Filter tabs */}
            <div className="flex gap-2">
              {([
                { key: 'all', label: 'All' },
                { key: 'earning', label: 'Earnings' },
                { key: 'withdrawal', label: 'Withdrawals' },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setTxnFilter(tab.key)}
                  className={[
                    'text-xs px-3 py-1.5 rounded-lg font-inter font-medium transition-colors',
                    txnFilter === tab.key
                      ? 'bg-copper-700 text-white'
                      : 'bg-mist-100 text-mist-500 hover:bg-mist-200',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={txnFilter}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {filteredTxns.map((txn) => (
                  <TransactionItem key={txn.id} txn={txn} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Withdraw CTA ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={() => setWithdrawOpen(true)}
            leftIcon={<ArrowUpRight size={18} strokeWidth={2} />}
            disabled={!wallet || wallet.available_balance === 0}
            className="shadow-lg shadow-copper-700/25"
          >
            Withdraw Funds
          </Button>
          <p className="text-center text-xs text-mist-400 font-inter mt-2">
            Withdrawals processed via MTN MoMo or Airtel Money
          </p>
        </motion.div>
      </div>

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        maxAmount={wallet?.available_balance ?? 0}
      />

      <BottomNav role="designer" />
    </div>
  )
}

export default DesignerWallet
