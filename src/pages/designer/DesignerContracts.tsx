// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Designer Contracts List Screen
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Banknote,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  Layers,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { Header } from '../../components/layout/Header'
import { BottomNav } from '../../components/layout/BottomNav'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { MilestoneProgress } from '../../components/ui/ProgressBar'
import type { Contract, ContractStatus, MilestoneStatus } from '../../lib/types'

// ── Types ─────────────────────────────────────────────────────────────────────

type TabKey = 'active' | 'completed' | 'all'

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatUGX = (n: number): string =>
  new Intl.NumberFormat('en-UG', { maximumFractionDigits: 0 }).format(n)

const contractStatusConfig: Record<
  ContractStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'mist' | 'copper' }
> = {
  pending: { label: 'Pending', variant: 'warning' },
  active: { label: 'Active', variant: 'success' },
  completed: { label: 'Completed', variant: 'info' },
  cancelled: { label: 'Cancelled', variant: 'mist' },
  disputed: { label: 'Disputed', variant: 'danger' },
}

// ── Tab Button ────────────────────────────────────────────────────────────────

interface TabButtonProps {
  label: string
  count: number
  active: boolean
  onClick: () => void
}

const TabButton: React.FC<TabButtonProps> = ({ label, count, active, onClick }) => (
  <button
    onClick={onClick}
    className={[
      'relative flex-1 py-2.5 text-sm font-semibold font-inter rounded-xl transition-colors',
      active
        ? 'text-copper-700'
        : 'text-mist-400 hover:text-charcoal-900',
    ].join(' ')}
  >
    {active && (
      <motion.div
        layoutId="contract-tab-indicator"
        className="absolute inset-0 bg-copper-700/8 border border-copper-700/20 rounded-xl"
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
    )}
    <span className="relative z-10 flex items-center justify-center gap-2">
      {label}
      <span
        className={[
          'text-[10px] px-1.5 py-0.5 rounded-full font-inter',
          active
            ? 'bg-copper-700 text-white'
            : 'bg-mist-200 text-mist-400',
        ].join(' ')}
      >
        {count}
      </span>
    </span>
  </button>
)

// ── Contract Card ─────────────────────────────────────────────────────────────

interface ContractCardProps {
  contract: Contract
  projectTitle: string
  clientName: string
  clientAvatar: string | null
  milestoneStats: { total: number; approved: number; inProgress: number; currentTitle: string; currentStatus: MilestoneStatus | null }
  onOpen: (contractId: string) => void
}

const ContractCard: React.FC<ContractCardProps> = ({
  contract,
  projectTitle,
  clientName,
  clientAvatar,
  milestoneStats,
  onOpen,
}) => {
  const statusCfg = contractStatusConfig[contract.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-charcoal-900 font-grotesk text-sm leading-snug mb-1">
              {projectTitle}
            </h3>
            <p className="text-[11px] text-mist-400 font-inter">
              #{contract.id.slice(-8).toUpperCase()}
            </p>
          </div>
          <Badge variant={statusCfg.variant} dot size="sm">
            {statusCfg.label}
          </Badge>
        </div>

        {/* Client row */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-mist-200 overflow-hidden shrink-0 flex items-center justify-center">
            {clientAvatar ? (
              <img src={clientAvatar} alt={clientName} className="w-full h-full object-cover" />
            ) : (
              <User size={14} className="text-mist-400" />
            )}
          </div>
          <span className="text-xs text-mist-500 font-inter">{clientName}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-mist-100 text-mist-400 font-inter ml-auto">
            Client
          </span>
        </div>

        {/* Amount */}
        <div className="flex items-center gap-1.5 bg-mist-50 rounded-xl px-3 py-2">
          <Banknote size={14} className="text-copper-700/60" strokeWidth={1.8} />
          <span className="text-sm font-bold text-charcoal-900 font-grotesk">
            UGX {formatUGX(contract.agreed_amount)}
          </span>
          <span className="text-xs text-mist-400 font-inter ml-auto">Contract value</span>
        </div>

        {/* Milestones progress */}
        {milestoneStats.total > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Layers size={12} className="text-mist-400" strokeWidth={2} />
                <span className="text-xs text-mist-500 font-inter">Milestones</span>
              </div>
              <span className="text-xs font-semibold text-charcoal-900 font-grotesk">
                {milestoneStats.approved}/{milestoneStats.total} done
              </span>
            </div>
            <MilestoneProgress
              total={milestoneStats.total}
              approved={milestoneStats.approved}
              inProgress={milestoneStats.inProgress}
            />

            {/* Current milestone */}
            {milestoneStats.currentTitle && milestoneStats.currentStatus && (
              <div className="flex items-center gap-2 pt-1">
                <Clock size={11} className="text-mist-400 shrink-0" />
                <span className="text-[11px] text-mist-500 font-inter truncate flex-1">
                  Current: {milestoneStats.currentTitle}
                </span>
                <StatusBadge
                  status={milestoneStats.currentStatus}
                  size="sm"
                  showDot={false}
                />
              </div>
            )}
          </div>
        )}

        {/* Start Project / Open Workspace */}
        {contract.status === 'active' && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => onOpen(contract.id)}
            rightIcon={<ArrowRight size={14} strokeWidth={2.5} />}
          >
            {milestoneStats.approved > 0 || milestoneStats.inProgress > 0
              ? 'Open Workspace'
              : 'Start Project'}
          </Button>
        )}
        {contract.status === 'completed' && (
          <div className="flex items-center justify-center gap-2 py-1 text-emerald-600">
            <CheckCircle2 size={15} strokeWidth={2} />
            <span className="text-xs font-semibold font-inter">Project Completed</span>
          </div>
        )}
      </Card>
    </motion.div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-16 px-8 space-y-3"
  >
    <div className="w-16 h-16 rounded-2xl bg-mist-100 flex items-center justify-center mx-auto">
      <FileText size={28} className="text-mist-300" strokeWidth={1.5} />
    </div>
    <p className="text-sm font-semibold text-charcoal-900 font-grotesk">No {label} contracts</p>
    <p className="text-xs text-mist-400 font-inter leading-relaxed">
      Contracts will appear here once you start working with clients.
    </p>
  </motion.div>
)

// ── Main Component ────────────────────────────────────────────────────────────

export const DesignerContracts: React.FC = () => {
  const navigate = useNavigate()
  const user = useStore((s) => s.user ?? s.currentUser)
  const contracts = useStore((s) => s.contracts)
  const projects = useStore((s) => s.projects)
  const milestones = useStore((s) => s.milestones)
  const initializeDemoData = useStore((s) => s.initializeDemoData)

  const [activeTab, setActiveTab] = useState<TabKey>('active')

  useEffect(() => {
    initializeDemoData()
  }, [initializeDemoData])

  const designerId = user?.id ?? 'demo-designer-001'

  // All contracts for this designer
  const myContracts = contracts.filter((c) => c.designer_id === designerId)
  const activeContracts = myContracts.filter((c) => c.status === 'active')
  const completedContracts = myContracts.filter((c) => c.status === 'completed')

  const tabContracts: Record<TabKey, Contract[]> = {
    active: activeContracts,
    completed: completedContracts,
    all: myContracts,
  }

  const displayContracts = tabContracts[activeTab]

  const getMilestoneStats = (contractId: string) => {
    const ms = milestones
      .filter((m) => m.contract_id === contractId)
      .sort((a, b) => a.order_index - b.order_index)

    const total = ms.length
    const approved = ms.filter((m) => m.status === 'approved').length
    const inProgressCount = ms.filter((m) => m.status === 'in_progress').length

    const current = ms.find(
      (m) => m.status === 'in_progress' || m.status === 'submitted' || m.status === 'pending'
    )

    return {
      total,
      approved,
      inProgress: inProgressCount,
      currentTitle: current?.title ?? '',
      currentStatus: (current?.status ?? null) as MilestoneStatus | null,
    }
  }

  const handleOpenWorkspace = (contractId: string) => {
    navigate(`/designer/workspace/${contractId}`)
  }

  return (
    <div className="min-h-screen bg-mist-50 pb-24">
      <Header title="My Contracts" showNotifications />

      <div className="px-4 pt-5 pb-6 space-y-5">
        {/* ── Summary Stats ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: myContracts.length, icon: FileText },
            { label: 'Active', value: activeContracts.length, icon: Clock },
            { label: 'Completed', value: completedContracts.length, icon: CheckCircle2 },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white border border-mist-100 rounded-xl p-3 text-center"
            >
              <s.icon size={16} className="text-mist-400 mx-auto mb-1" strokeWidth={1.8} />
              <p className="text-xl font-bold font-grotesk text-charcoal-900">{s.value}</p>
              <p className="text-[10px] text-mist-400 font-inter">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
        <div className="flex gap-2 bg-white border border-mist-100 rounded-2xl p-1.5">
          <TabButton
            label="Active"
            count={activeContracts.length}
            active={activeTab === 'active'}
            onClick={() => setActiveTab('active')}
          />
          <TabButton
            label="Completed"
            count={completedContracts.length}
            active={activeTab === 'completed'}
            onClick={() => setActiveTab('completed')}
          />
          <TabButton
            label="All"
            count={myContracts.length}
            active={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
          />
        </div>

        {/* ── Contract List ────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.22 }}
            className="space-y-3"
          >
            {displayContracts.length === 0 ? (
              <EmptyState label={activeTab === 'all' ? '' : activeTab} />
            ) : (
              displayContracts.map((contract) => {
                const project = projects.find((p) => p.id === contract.project_id)
                const milestoneStats = getMilestoneStats(contract.id)

                return (
                  <ContractCard
                    key={contract.id}
                    contract={contract}
                    projectTitle={project?.title ?? 'Untitled Project'}
                    clientName="Client"
                    clientAvatar={null}
                    milestoneStats={milestoneStats}
                    onOpen={handleOpenWorkspace}
                  />
                )
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav role="designer" />
    </div>
  )
}

export default DesignerContracts
