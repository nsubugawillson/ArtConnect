// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Admin Dashboard
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Briefcase,
  DollarSign,
  AlertTriangle,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  ArrowDownLeft,
  Lock,
  Unlock,
  ClipboardList,
  Eye,
  ChevronDown,
  ChevronUp,
  Activity,
  Star,
  Layers,
  BadgeCheck,
  Package,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import type { DesignerSpecialization, ProjectStatus, Project } from '../../lib/types'
import type { DesignerWithUser } from '../../lib/store'

// ── Types ─────────────────────────────────────────────────────────────────────

type AdminTab = 'overview' | 'vetting' | 'disputes' | 'transactions' | 'projects'

interface MockTransaction {
  id: string
  type: 'top_up' | 'lock' | 'release' | 'refund'
  description: string
  amount: number
  user: string
  date: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const formatUGX = (n: number): string =>
  new Intl.NumberFormat('en-UG', { maximumFractionDigits: 0 }).format(n)

const MOCK_TRANSACTIONS: MockTransaction[] = [
  {
    id: 'atxn-001',
    type: 'top_up',
    description: 'Wallet top-up via MTN MoMo',
    amount: 5000000,
    user: 'Amara Okafor',
    date: 'Today, 09:14',
  },
  {
    id: 'atxn-002',
    type: 'lock',
    description: 'Funds locked – Product Packaging Contract',
    amount: 3500000,
    user: 'Amara Okafor',
    date: 'Today, 09:16',
  },
  {
    id: 'atxn-003',
    type: 'release',
    description: 'Milestone 1 approved – Research & Concepts',
    amount: 700000,
    user: 'David Ssemakula',
    date: 'Yesterday, 14:30',
  },
  {
    id: 'atxn-004',
    type: 'top_up',
    description: 'Wallet top-up via Airtel Money',
    amount: 7000000,
    user: 'Amara Okafor',
    date: 'Yesterday, 11:00',
  },
  {
    id: 'atxn-005',
    type: 'lock',
    description: 'Funds locked – Mobile App UI/UX Contract',
    amount: 5000000,
    user: 'Amara Okafor',
    date: '3 days ago',
  },
  {
    id: 'atxn-006',
    type: 'release',
    description: 'Milestone 4 approved – User Research',
    amount: 1000000,
    user: 'Sarah Nakato',
    date: '3 days ago',
  },
]

const ACTIVITY_FEED = [
  {
    id: 'af-001',
    icon: Briefcase,
    text: 'New contract created: Product Packaging Design',
    time: '2 hours ago',
    color: 'text-copper-700',
    bg: 'bg-copper-700/10',
  },
  {
    id: 'af-002',
    icon: CheckCircle,
    text: 'Milestone approved: Research & Concept Development',
    time: '5 hours ago',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
  {
    id: 'af-003',
    icon: Shield,
    text: 'Vetting application submitted: Mary Namulindwa',
    time: '1 day ago',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
  },
  {
    id: 'af-004',
    icon: DollarSign,
    text: 'UGX 1,000,000 released to Sarah Nakato',
    time: '3 days ago',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    id: 'af-005',
    icon: Users,
    text: 'New contract created: Mobile App UI/UX Design',
    time: '4 days ago',
    color: 'text-copper-700',
    bg: 'bg-copper-700/10',
  },
]

const EXTRA_VETTING_APPLICANTS = [
  {
    id: 'va-002',
    name: 'Joel Mutebi',
    avatar_url: 'https://i.pravatar.cc/150?u=joel.mutebi',
    specializations: ['graphic', 'branding'] as DesignerSpecialization[],
    location: 'Kampala, Uganda',
    bio: 'Graphic designer with 3 years experience in print and digital media. Passionate about East African visual identity.',
    portfolio_images: [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&auto=format&fit=crop',
    ],
    rating: 0,
    completed_projects: 0,
    user_id: 'va-user-002',
  },
]

const MRR_QUEUE = [
  {
    id: 'mrr-demo-001',
    designer: 'David Ssemakula',
    project: 'Product Packaging Design',
    milestone: 'Structural Packaging Design & MRR',
    submittedDate: '2 hours ago',
    items_completed: 5,
    items_total: 5,
    bom_uploaded: true,
  },
]

const specLabels: Record<DesignerSpecialization, string> = {
  graphic: 'Graphic',
  industrial: 'Industrial',
  branding: 'Branding',
  ui_ux: 'UI/UX',
  motion: 'Motion',
  packaging: 'Packaging',
}

const txnConfig: Record<
  MockTransaction['type'],
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  top_up: {
    icon: ArrowDownLeft,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    label: 'Top Up',
  },
  lock: { icon: Lock, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Lock' },
  release: {
    icon: Unlock,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    label: 'Release',
  },
  refund: {
    icon: ArrowDownLeft,
    color: 'text-red-500',
    bg: 'bg-red-100',
    label: 'Refund',
  },
}

const projectStatusConfig: Record<
  ProjectStatus,
  { label: string; variant: 'success' | 'warning' | 'info' | 'mist' | 'danger' | 'copper' }
> = {
  draft: { label: 'Draft', variant: 'mist' },
  open: { label: 'Open', variant: 'copper' },
  in_progress: { label: 'In Progress', variant: 'info' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'mist' },
  disputed: { label: 'Disputed', variant: 'danger' },
}

// ── Tab Bar ───────────────────────────────────────────────────────────────────

const TABS: { key: AdminTab; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Overview', icon: Activity },
  { key: 'vetting', label: 'Vetting', icon: Shield },
  { key: 'disputes', label: 'Disputes', icon: AlertTriangle },
  { key: 'transactions', label: 'Transactions', icon: DollarSign },
  { key: 'projects', label: 'Projects', icon: Briefcase },
]

// ── Toast Notification ────────────────────────────────────────────────────────

interface ToastProps {
  message: string
  visible: boolean
}

const Toast: React.FC<ToastProps> = ({ message, visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.96 }}
        transition={{ duration: 0.25 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-charcoal-900 text-white text-sm font-inter font-semibold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2"
      >
        <CheckCircle size={16} className="text-emerald-400" strokeWidth={2} />
        {message}
      </motion.div>
    )}
  </AnimatePresence>
)

// ── Overview Tab ──────────────────────────────────────────────────────────────

interface OverviewTabProps {
  totalDesigners: number
  activeProjects: number
  totalVolume: number
  openDisputes: number
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  totalDesigners,
  activeProjects,
  totalVolume,
  openDisputes,
}) => (
  <div className="space-y-6">
    {/* Stats grid */}
    <div className="grid grid-cols-2 gap-3">
      {[
        {
          label: 'Total Designers',
          value: totalDesigners,
          icon: Users,
          color: 'text-copper-400',
          bg: 'bg-copper-700/20',
        },
        {
          label: 'Active Projects',
          value: activeProjects,
          icon: Briefcase,
          color: 'text-blue-400',
          bg: 'bg-blue-500/15',
        },
        {
          label: 'Total Volume',
          value: `UGX ${formatUGX(totalVolume)}`,
          icon: TrendingUp,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/15',
          wide: true,
        },
        {
          label: 'Open Disputes',
          value: openDisputes,
          icon: AlertTriangle,
          color: 'text-red-400',
          bg: 'bg-red-500/15',
        },
      ].map((stat) => (
        <div
          key={stat.label}
          className={[
            'rounded-2xl border border-white/8 bg-white/5 p-4 space-y-3',
          ].join(' ')}
        >
          <div
            className={['w-9 h-9 rounded-xl flex items-center justify-center', stat.bg].join(' ')}
          >
            <stat.icon size={17} className={stat.color} strokeWidth={2} />
          </div>
          <div>
            <p className="text-lg font-bold text-white font-grotesk leading-none">
              {stat.value}
            </p>
            <p className="text-[11px] text-white/40 font-inter mt-0.5">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>

    {/* Recent Activity */}
    <div className="rounded-2xl border border-white/8 bg-white/5 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/8">
        <h3 className="text-sm font-semibold text-white font-grotesk">Recent Activity</h3>
      </div>
      <div className="divide-y divide-white/5">
        {ACTIVITY_FEED.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-3">
            <div
              className={[
                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                item.bg,
              ].join(' ')}
            >
              <item.icon size={14} className={item.color} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/80 font-inter truncate">{item.text}</p>
              <p className="text-[10px] text-white/30 font-inter">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Quick Actions */}
    <div className="rounded-2xl border border-white/8 bg-white/5 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-white font-grotesk">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        <button className="flex items-center gap-2 bg-copper-700/20 hover:bg-copper-700/30 border border-copper-700/30 rounded-xl px-3 py-2.5 transition-colors text-left">
          <BadgeCheck size={15} className="text-copper-400 shrink-0" strokeWidth={2} />
          <span className="text-xs font-medium text-white/80 font-inter">Review Vetting</span>
        </button>
        <button className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 rounded-xl px-3 py-2.5 transition-colors text-left">
          <AlertTriangle size={15} className="text-red-400 shrink-0" strokeWidth={2} />
          <span className="text-xs font-medium text-white/80 font-inter">View Disputes</span>
        </button>
      </div>
    </div>
  </div>
)

// ── Designer Vetting Row ──────────────────────────────────────────────────────

interface VettingRowProps {
  designer: DesignerWithUser | typeof EXTRA_VETTING_APPLICANTS[0]
  onApprove: (userId: string, name: string) => void
  onReject: (userId: string, name: string) => void
}

const VettingRow: React.FC<VettingRowProps> = ({ designer, onApprove, onReject }) => {
  const [expanded, setExpanded] = useState(false)
  const [approved, setApproved] = useState(false)
  const [rejected, setRejected] = useState(false)

  const handleApprove = () => {
    setApproved(true)
    onApprove(designer.user_id, designer.name)
  }

  const handleReject = () => {
    setRejected(true)
    onReject(designer.user_id, designer.name)
  }

  if (approved || rejected) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, height: 0 }}
        className={[
          'rounded-2xl border p-4 flex items-center gap-3',
          approved
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-red-500/10 border-red-500/20',
        ].join(' ')}
      >
        {approved ? (
          <CheckCircle size={18} className="text-emerald-400 shrink-0" />
        ) : (
          <XCircle size={18} className="text-red-400 shrink-0" />
        )}
        <div>
          <p className="text-sm font-semibold text-white font-grotesk">{designer.name}</p>
          <p className="text-xs text-white/40 font-inter">
            {approved ? 'Approved as vetted designer' : 'Application rejected'}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 overflow-hidden">
      <div className="p-4 space-y-4">
        {/* Designer header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 shrink-0">
            {designer.avatar_url ? (
              <img
                src={designer.avatar_url}
                alt={designer.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Users size={20} className="text-white/40" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white font-grotesk">{designer.name}</p>
            <p className="text-[11px] text-white/40 font-inter">{designer.location}</p>
            <div className="flex gap-1.5 mt-1 flex-wrap">
              {designer.specializations.map((s) => (
                <span
                  key={s}
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-copper-700/20 text-copper-400 font-inter"
                >
                  {specLabels[s]}
                </span>
              ))}
            </div>
          </div>
          <Badge variant="warning" size="sm">Pending</Badge>
        </div>

        {/* Bio excerpt */}
        <p className="text-xs text-white/60 font-inter leading-relaxed line-clamp-2">
          {designer.bio}
        </p>

        {/* Portfolio expandable */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between text-xs text-copper-400 font-inter font-medium"
        >
          <span className="flex items-center gap-1.5">
            <Eye size={13} strokeWidth={2} />
            View Portfolio
          </span>
          {expanded ? (
            <ChevronUp size={14} className="text-white/30" />
          ) : (
            <ChevronDown size={14} className="text-white/30" />
          )}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 overflow-x-auto pb-1">
                {designer.portfolio_images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Portfolio ${i + 1}`}
                    className="h-28 w-auto rounded-xl object-cover shrink-0 border border-white/10"
                  />
                ))}
                {designer.portfolio_images.length === 0 && (
                  <div className="h-28 w-40 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <p className="text-xs text-white/30 font-inter">No images</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="danger"
            size="sm"
            fullWidth
            onClick={handleReject}
            leftIcon={<XCircle size={14} strokeWidth={2} />}
          >
            Reject
          </Button>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={handleApprove}
            leftIcon={<CheckCircle size={14} strokeWidth={2} />}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 border-0 shadow-emerald-600/20"
          >
            Approve
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── MRR Queue Row ─────────────────────────────────────────────────────────────

interface MRRQueueRowProps {
  entry: typeof MRR_QUEUE[0]
  onApprove: (id: string) => void
}

const MRRQueueRow: React.FC<MRRQueueRowProps> = ({ entry, onApprove }) => {
  const [approved, setApproved] = useState(false)

  return (
    <div
      className={[
        'rounded-2xl border p-4 space-y-3 transition-colors',
        approved ? 'bg-emerald-500/10 border-emerald-500/20' : 'border-white/8 bg-white/5',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={14} className="text-amber-400" strokeWidth={2} />
            <span className="text-xs font-semibold text-amber-400 font-inter">MRR Review</span>
          </div>
          <p className="text-sm font-bold text-white font-grotesk">{entry.project}</p>
          <p className="text-xs text-white/50 font-inter">{entry.milestone}</p>
          <p className="text-[10px] text-white/30 font-inter mt-0.5">
            Submitted by {entry.designer} · {entry.submittedDate}
          </p>
        </div>
        {approved ? (
          <Badge variant="success" dot size="sm">Approved</Badge>
        ) : (
          <Badge variant="warning" dot size="sm">Pending</Badge>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-white/60 font-inter">
        <span className="flex items-center gap-1">
          <CheckCircle size={12} className="text-emerald-400" strokeWidth={2} />
          {entry.items_completed}/{entry.items_total} checklist items
        </span>
        <span className="flex items-center gap-1">
          {entry.bom_uploaded ? (
            <CheckCircle size={12} className="text-emerald-400" strokeWidth={2} />
          ) : (
            <Clock size={12} className="text-amber-400" strokeWidth={2} />
          )}
          BOM {entry.bom_uploaded ? 'uploaded' : 'missing'}
        </span>
      </div>

      {!approved && (
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={() => {
            setApproved(true)
            onApprove(entry.id)
          }}
          leftIcon={<CheckCircle size={14} strokeWidth={2} />}
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 border-0"
        >
          Approve MRR
        </Button>
      )}
    </div>
  )
}

// ── Vetting Tab ───────────────────────────────────────────────────────────────

interface VettingTabProps {
  pendingDesigners: (DesignerWithUser | typeof EXTRA_VETTING_APPLICANTS[0])[]
  onApproveDesigner: (userId: string, name: string) => void
  onRejectDesigner: (userId: string, name: string) => void
  onApproveMRR: (id: string) => void
}

const VettingTab: React.FC<VettingTabProps> = ({
  pendingDesigners,
  onApproveDesigner,
  onRejectDesigner,
  onApproveMRR,
}) => (
  <div className="space-y-6">
    {/* Pending designers */}
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white font-grotesk">
          Designer Applications
        </h3>
        <Badge variant="warning" size="sm">
          {pendingDesigners.length} pending
        </Badge>
      </div>
      {pendingDesigners.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/5 p-8 text-center">
          <Shield size={28} className="text-white/20 mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-xs text-white/40 font-inter">No pending applications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingDesigners.map((d) => (
            <VettingRow
              key={d.user_id}
              designer={d}
              onApprove={onApproveDesigner}
              onReject={onRejectDesigner}
            />
          ))}
        </div>
      )}
    </div>

    {/* MRR Queue */}
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white font-grotesk">MRR Review Queue</h3>
        <Badge variant="warning" size="sm">{MRR_QUEUE.length} pending</Badge>
      </div>
      <div className="space-y-3">
        {MRR_QUEUE.map((entry) => (
          <MRRQueueRow key={entry.id} entry={entry} onApprove={onApproveMRR} />
        ))}
      </div>
    </div>
  </div>
)

// ── Disputes Tab ──────────────────────────────────────────────────────────────

interface DisputeRow {
  id: string
  projectName: string
  disputingParty: 'client' | 'designer'
  category: string
  description: string
  amount: number
}

const MOCK_DISPUTES: DisputeRow[] = [
  {
    id: 'dispute-001',
    projectName: 'Mobile App UI/UX Design',
    disputingParty: 'client',
    category: 'Quality Mismatch',
    description: 'Designer did not follow brand guidelines for color palette and typography',
    amount: 5000000,
  },
  {
    id: 'dispute-002',
    projectName: 'Product Packaging Design',
    disputingParty: 'designer',
    category: 'Non-payment',
    description: 'Client has not released payment for completed milestone deliverables',
    amount: 1500000,
  },
  {
    id: 'dispute-003',
    projectName: 'Branding Package',
    disputingParty: 'client',
    category: 'Scope Creep',
    description: 'Designer demanding additional payment for changes within agreed scope',
    amount: 2200000,
  },
]

interface DisputesTabProps {
  onShowToast: (msg: string) => void
}

const DisputesTab: React.FC<DisputesTabProps> = ({ onShowToast }) => {
  const [disputes, setDisputes] = useState<DisputeRow[]>(MOCK_DISPUTES)

  const handleRuleForClient = (id: string) => {
    onShowToast('Dispute fee charged to client, refund issued to client, designer receives negative review')
    setDisputes((prev) =>
      prev.filter((d) => d.id !== id)
    )
  }

  const handleRuleForDesigner = (id: string) => {
    onShowToast('Dispute fee charged to client and paid to designer as compensation')
    setDisputes((prev) =>
      prev.filter((d) => d.id !== id)
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white font-grotesk">Active Disputes</h3>
        <Badge variant={disputes.length === 0 ? 'success' : 'danger'} size="sm">
          {disputes.length === 0 ? 'All Clear' : `${disputes.length} active`}
        </Badge>
      </div>

      {disputes.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/5 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <AlertTriangle size={28} className="text-emerald-400" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-base font-semibold text-white font-grotesk">
              No Active Disputes
            </p>
            <p className="text-xs text-white/40 font-inter mt-1">
              All contracts are running smoothly. Disputes will appear here when raised.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle size={14} className="text-emerald-400" strokeWidth={2} />
            <span className="text-xs text-emerald-400 font-inter font-medium">
              Platform health: Excellent
            </span>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {disputes.map((dispute) => (
              <motion.div
                key={dispute.id}
                initial={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="rounded-2xl border border-red-500/20 bg-red-500/8 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle size={13} className="text-red-400" strokeWidth={2} />
                      <span className="text-[10px] text-red-400 font-inter uppercase tracking-wide">
                        {dispute.category}
                      </span>
                      <Badge
                        variant={dispute.disputingParty === 'client' ? 'danger' : 'warning'}
                        size="sm"
                      >
                        {dispute.disputingParty === 'client' ? 'Client Dispute' : 'Designer Dispute'}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-white font-grotesk truncate">
                      {dispute.projectName}
                    </p>
                    <p className="text-xs text-white/60 font-inter mt-1 line-clamp-2">
                      {dispute.description}
                    </p>
                    <p className="text-xs text-white/40 font-inter mt-1">
                      Amount in dispute: UGX {formatUGX(dispute.amount)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    fullWidth
                    onClick={() => handleRuleForClient(dispute.id)}
                    leftIcon={<CheckCircle size={14} strokeWidth={2} />}
                  >
                    Rule for Client
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => handleRuleForDesigner(dispute.id)}
                    leftIcon={<CheckCircle size={14} strokeWidth={2} />}
                    className="bg-gradient-to-r from-amber-600 to-amber-500 border-0"
                  >
                    Rule for Designer
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}

// ── Transactions Tab ──────────────────────────────────────────────────────────

interface TransactionsTabProps {
  lockedEscrow: number
  totalReleased: number
}

const TransactionsTab: React.FC<TransactionsTabProps> = ({
  lockedEscrow,
  totalReleased,
}) => {
  const [filter, setFilter] = useState<'all' | 'top_up' | 'lock' | 'release'>('all')

  const filtered =
    filter === 'all'
      ? MOCK_TRANSACTIONS
      : MOCK_TRANSACTIONS.filter((t) => t.type === filter)

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/8 p-4 space-y-1">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-amber-400" strokeWidth={2} />
            <span className="text-xs text-amber-400 font-inter">Locked in Escrow</span>
          </div>
          <p className="text-lg font-bold text-white font-grotesk">
            UGX {formatUGX(lockedEscrow)}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-4 space-y-1">
          <div className="flex items-center gap-2">
            <Unlock size={14} className="text-emerald-400" strokeWidth={2} />
            <span className="text-xs text-emerald-400 font-inter">Total Released</span>
          </div>
          <p className="text-lg font-bold text-white font-grotesk">
            UGX {formatUGX(totalReleased)}
          </p>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: 'all', label: 'All' },
          { key: 'top_up', label: 'Top Ups' },
          { key: 'lock', label: 'Locks' },
          { key: 'release', label: 'Releases' },
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={[
              'text-xs px-3 py-1.5 rounded-lg font-inter font-medium transition-colors',
              filter === f.key
                ? 'bg-copper-700 text-white'
                : 'bg-white/8 text-white/50 hover:bg-white/12',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="rounded-2xl border border-white/8 bg-white/5 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="divide-y divide-white/5"
          >
            {filtered.map((txn) => {
              const cfg = txnConfig[txn.type]
              return (
                <div key={txn.id} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className={[
                      'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                      cfg.bg,
                    ].join(' ')}
                  >
                    <cfg.icon size={15} className={cfg.color} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white/90 font-inter truncate">
                      {txn.description}
                    </p>
                    <p className="text-[10px] text-white/30 font-inter">
                      {txn.user} · {txn.date}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={[
                        'text-sm font-bold font-grotesk',
                        txn.type === 'release'
                          ? 'text-emerald-400'
                          : txn.type === 'top_up'
                          ? 'text-emerald-400'
                          : txn.type === 'lock'
                          ? 'text-amber-400'
                          : 'text-red-400',
                      ].join(' ')}
                    >
                      UGX {formatUGX(txn.amount)}
                    </p>
                    <span
                      className={[
                        'text-[10px] font-inter',
                        cfg.color,
                      ].join(' ')}
                    >
                      {cfg.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Projects Tab ──────────────────────────────────────────────────────────────

interface PendingMilestoneApproval {
  id: string
  designerName: string
  projectName: string
  milestoneName: string
  amount: number
}

interface ProjectsTabProps {
  projects: Project[]
  onStatusChange: (projectId: string, status: ProjectStatus) => void
  onShowToast: (msg: string) => void
}

const ProjectsTab: React.FC<ProjectsTabProps> = ({ projects, onStatusChange, onShowToast }) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false)
  const [pendingMilestones, setPendingMilestones] = useState<PendingMilestoneApproval[]>([
    {
      id: 'pmr-001',
      designerName: 'David Ssemakula',
      projectName: 'Product Packaging Design',
      milestoneName: 'Final Design Variations',
      amount: 700000,
    },
    {
      id: 'pmr-002',
      designerName: 'Sarah Nakato',
      projectName: 'Mobile App UI/UX Design',
      milestoneName: 'Prototype Development',
      amount: 1200000,
    },
  ])

  const project = projects.find((p) => p.id === selectedProject)

  const handleReleaseFunds = (milestoneId: string) => {
    setPendingMilestones((prev) => prev.filter((m) => m.id !== milestoneId))
    onShowToast('Milestone funds released to designer')
  }

  const handleReleaseFiles = (milestoneId: string) => {
    setPendingMilestones((prev) => prev.filter((m) => m.id !== milestoneId))
    onShowToast('Files released to client')
  }

  const handleCloseContract = () => {
    if (project && project.id) {
      onStatusChange(project.id, 'completed')
      onShowToast('Final escrow released, contract marked as Completed')
      setCloseConfirmOpen(false)
      setStatusModalOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white font-grotesk">All Projects</h3>
          <Badge variant="copper" size="sm">{projects.length} projects</Badge>
        </div>

        <div className="space-y-2">
        {projects.map((p) => {
          const cfg = projectStatusConfig[p.status]
          return (
            <div
              key={p.id}
              className="rounded-2xl border border-white/8 bg-white/5 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Package size={13} className="text-white/30" strokeWidth={2} />
                    <span className="text-[10px] text-white/30 font-inter uppercase tracking-wide">
                      {p.category}
                    </span>
                    {p.requires_mrr && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-inter">
                        MRR
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white font-grotesk truncate">
                    {p.title}
                  </p>
                  <p className="text-xs text-white/50 font-grotesk mt-0.5">
                    UGX {formatUGX(p.budget)}
                  </p>
                </div>
                <Badge variant={cfg.variant} dot size="sm">{cfg.label}</Badge>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedProject(p.id)
                    setStatusModalOpen(true)
                  }}
                  className="flex-1 text-xs py-2 rounded-xl bg-white/8 hover:bg-white/12 text-white/60 hover:text-white font-inter transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          )
        })}
      </div>
      </div>

      {/* Milestone Release Section */}
      {pendingMilestones.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white font-grotesk">Pending Milestone Approvals</h3>
            <Badge variant="warning" size="sm">{pendingMilestones.length} pending</Badge>
          </div>
          <div className="space-y-2">
            {pendingMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className="rounded-2xl border border-amber-500/20 bg-amber-500/8 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Layers size={13} className="text-amber-400" strokeWidth={2} />
                      <span className="text-[10px] text-amber-400 font-inter uppercase tracking-wide">
                        Milestone Approval
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white font-grotesk truncate">
                      {milestone.projectName}
                    </p>
                    <p className="text-xs text-white/60 font-inter mt-1">
                      {milestone.milestoneName} · by {milestone.designerName}
                    </p>
                    <p className="text-xs text-white/40 font-inter mt-1">
                      UGX {formatUGX(milestone.amount)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => handleReleaseFunds(milestone.id)}
                    leftIcon={<Unlock size={14} strokeWidth={2} />}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-500 border-0"
                  >
                    Release Funds
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => handleReleaseFiles(milestone.id)}
                    leftIcon={<Package size={14} strokeWidth={2} />}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 border-0"
                  >
                    Release Files
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Update: ${project?.title ?? ''}`}
        size="sm"
      >
        {project && (
          <div className="space-y-3 pt-1 pb-2">
            <p className="text-xs text-mist-500 font-inter">Select new status:</p>
            <div className="space-y-2">
              {(['open', 'in_progress', 'completed', 'cancelled'] as ProjectStatus[]).map(
                (status) => {
                  const cfg = projectStatusConfig[status]
                  return (
                    <button
                      key={status}
                      onClick={() => {
                        onStatusChange(project.id, status)
                        setStatusModalOpen(false)
                      }}
                      className={[
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors',
                        project.status === status
                          ? 'bg-copper-700/8 border-copper-700/30'
                          : 'bg-mist-50 border-mist-200 hover:border-mist-300',
                      ].join(' ')}
                    >
                      <span className="text-sm font-inter text-charcoal-900">
                        {cfg.label}
                      </span>
                      {project.status === status && (
                        <CheckCircle size={15} className="text-copper-700" strokeWidth={2} />
                      )}
                    </button>
                  )
                }
              )}
            </div>

            {project.status === 'in_progress' && (
              <div className="pt-3 border-t border-mist-200">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => setCloseConfirmOpen(true)}
                  leftIcon={<CheckCircle size={14} strokeWidth={2} />}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 border-0"
                >
                  Close Contract & Release Escrow
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Close Contract Confirmation Modal */}
      <Modal
        isOpen={closeConfirmOpen}
        onClose={() => setCloseConfirmOpen(false)}
        title="Close Contract & Release Escrow"
        size="sm"
      >
        {project && (
          <div className="space-y-4 pt-1 pb-2">
            <p className="text-sm text-mist-600 font-inter">
              Are you sure you want to close this contract? This will mark it as Completed and release the final escrow to the designer.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => setCloseConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={handleCloseContract}
                leftIcon={<CheckCircle size={14} strokeWidth={2} />}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 border-0"
              >
                Confirm Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// ── Main AdminDashboard ───────────────────────────────────────────────────────

export const AdminDashboard: React.FC = () => {
  const designers = useStore((s) => s.designers)
  const projects = useStore((s) => s.projects)
  const contracts = useStore((s) => s.contracts)
  const milestones = useStore((s) => s.milestones)
  const wallets = useStore((s) => s.wallets)
  const initializeDemoData = useStore((s) => s.initializeDemoData)
  const updateMilestoneStatus = useStore((s) => s.updateMilestoneStatus)

  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  useEffect(() => {
    initializeDemoData()
  }, [initializeDemoData])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3000)
  }

  // Stats
  const totalDesigners = designers.length
  const activeProjects = projects.filter(
    (p) => p.status === 'in_progress' || p.status === 'open'
  ).length
  const totalVolume = contracts.reduce((sum, c) => sum + c.agreed_amount, 0)
  const openDisputes = 0

  const lockedEscrow = Object.values(wallets).reduce(
    (sum, w) => sum + w.locked_balance,
    0
  )
  const totalReleased = milestones
    .filter((m) => m.status === 'approved')
    .reduce((sum, m) => sum + m.amount, 0)

  const pendingDesigners: (DesignerWithUser | typeof EXTRA_VETTING_APPLICANTS[0])[] = [
    ...designers.filter((d) => !d.is_vetted),
    ...EXTRA_VETTING_APPLICANTS,
  ]

  const handleApproveDesigner = (_userId: string, name: string) => {
    showToast(`${name} approved as vetted designer`)
  }

  const handleRejectDesigner = (_userId: string, name: string) => {
    showToast(`${name}'s application rejected`)
  }

  const handleApproveMRR = (_id: string) => {
    // Simulate approval
    const submitted = milestones.find((m) => m.status === 'submitted' && m.mrr_required)
    if (submitted) {
      updateMilestoneStatus(submitted.id, 'approved')
    }
    showToast('MRR approved — designer can now submit milestone')
  }

  const handleProjectStatusChange = (_projectId: string, _status: ProjectStatus) => {
    showToast('Project status updated')
  }

  const tabContent: Record<AdminTab, React.ReactNode> = {
    overview: (
      <OverviewTab
        totalDesigners={totalDesigners}
        activeProjects={activeProjects}
        totalVolume={totalVolume}
        openDisputes={openDisputes}
      />
    ),
    vetting: (
      <VettingTab
        pendingDesigners={pendingDesigners}
        onApproveDesigner={handleApproveDesigner}
        onRejectDesigner={handleRejectDesigner}
        onApproveMRR={handleApproveMRR}
      />
    ),
    disputes: <DisputesTab onShowToast={showToast} />,
    transactions: (
      <TransactionsTab
        lockedEscrow={lockedEscrow}
        totalReleased={totalReleased}
      />
    ),
    projects: (
      <ProjectsTab
        projects={projects}
        onStatusChange={handleProjectStatusChange}
        onShowToast={showToast}
      />
    ),
  }

  return (
    <div className="min-h-screen bg-charcoal-900 pb-8">
      {/* ── Admin Header ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-charcoal-900 border-b border-white/8">
        <div className="flex items-center h-14 px-4 gap-3">
          {/* Logo mark */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-copper-700 to-copper-500 flex items-center justify-center shrink-0">
            <span className="text-white font-grotesk font-bold text-xs">AC</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-white font-grotesk">Admin Panel</h1>
            <p className="text-[10px] text-white/30 font-inter">ArtConnect.Ug</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-white/40 font-inter">Live</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 pb-6 space-y-5">
        {/* ── Tab Bar ───────────────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-white/5 border border-white/8 rounded-2xl p-1 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            const Icon = tab.icon
            return (
              <motion.button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium font-inter whitespace-nowrap transition-colors shrink-0',
                  isActive ? 'text-white' : 'text-white/40 hover:text-white/70',
                ].join(' ')}
                whileTap={{ scale: 0.96 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-tab-bg"
                    className="absolute inset-0 bg-copper-700/80 rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon size={13} strokeWidth={isActive ? 2.2 : 1.8} />
                  {tab.label}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* ── Tab Content ───────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {tabContent[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Toast ─────────────────────────────────────────────────────────────── */}
      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  )
}

export default AdminDashboard
