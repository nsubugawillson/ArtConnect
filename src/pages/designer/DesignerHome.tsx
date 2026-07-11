// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Designer Dashboard Home
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Star,
  CheckCircle2,
  Briefcase,
  TrendingUp,
  ArrowRight,
  Clock,
  Banknote,
  Shield,
  ChevronRight,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { BottomNav } from '../../components/layout/BottomNav'
import { Header } from '../../components/layout/Header'
import { Badge, StatusBadge, CategoryBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import type { Contract, Project } from '../../lib/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatUGX = (n: number): string =>
  new Intl.NumberFormat('en-UG', { maximumFractionDigits: 0 }).format(n)

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] } },
}

// ── Wallet Mini Card ──────────────────────────────────────────────────────────

interface WalletMiniCardProps {
  available: number
  pending: number
}

const WalletMiniCard: React.FC<WalletMiniCardProps> = ({ available, pending }) => (
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-charcoal-900 via-charcoal-800 to-[#3D1A06] p-4 shadow-lg shadow-charcoal-900/30">
    {/* subtle grid */}
    <div
      className="absolute inset-0 opacity-[0.04] pointer-events-none"
      style={{
        backgroundImage:
          'repeating-linear-gradient(0deg,transparent,transparent 39px,#fff 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,#fff 40px)',
      }}
      aria-hidden="true"
    />
    {/* copper glow */}
    <div
      className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
      style={{
        background: 'radial-gradient(circle, rgba(160,67,10,0.35) 0%, transparent 70%)',
      }}
      aria-hidden="true"
    />
    <div className="relative z-10 flex items-center justify-between">
      <div>
        <p className="text-white/40 text-[10px] font-inter uppercase tracking-widest mb-0.5">
          Available Balance
        </p>
        <p className="text-white text-2xl font-bold font-grotesk leading-none">
          <span className="text-white/50 text-sm mr-1">UGX</span>
          {formatUGX(available)}
        </p>
        {pending > 0 && (
          <p className="text-copper-400 text-xs font-inter mt-1 flex items-center gap-1">
            <Clock size={10} />
            UGX {formatUGX(pending)} pending release
          </p>
        )}
      </div>
      <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center">
        <TrendingUp size={18} className="text-copper-400" />
      </div>
    </div>
  </div>
)

// ── Stats Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ElementType
  highlight?: boolean
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, highlight }) => (
  <motion.div
    variants={itemVariants}
    className={[
      'flex-1 rounded-xl p-3 flex flex-col gap-1.5 border',
      highlight
        ? 'bg-copper-700/8 border-copper-700/20'
        : 'bg-white border-mist-100',
    ].join(' ')}
  >
    <div
      className={[
        'w-7 h-7 rounded-lg flex items-center justify-center',
        highlight ? 'bg-copper-700/15' : 'bg-mist-100',
      ].join(' ')}
    >
      <Icon
        size={14}
        className={highlight ? 'text-copper-700' : 'text-mist-500'}
        strokeWidth={2}
      />
    </div>
    <p
      className={[
        'text-lg font-bold font-grotesk leading-none',
        highlight ? 'text-copper-700' : 'text-charcoal-900',
      ].join(' ')}
    >
      {value}
    </p>
    <p className="text-[10px] text-mist-400 font-inter leading-snug">{label}</p>
  </motion.div>
)

// ── Active Contract Card ──────────────────────────────────────────────────────

interface ActiveContractCardProps {
  contract: Contract
  project: Project | undefined
  onOpen: (contractId: string) => void
}

const ActiveContractCard: React.FC<ActiveContractCardProps> = ({
  contract,
  project,
  onOpen,
}) => {
  if (!project) return null

  return (
    <motion.div variants={itemVariants}>
      <Card
        hoverable
        className="p-4"
        onClick={() => onOpen(contract.id)}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-charcoal-900 font-grotesk text-sm truncate">
              {project.title}
            </p>
            <p className="text-xs text-mist-400 font-inter mt-0.5">
              Contract #{contract.id.slice(-6).toUpperCase()}
            </p>
          </div>
          <Badge variant="success" dot>Active</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Banknote size={13} className="text-copper-700/60" strokeWidth={1.8} />
            <span className="text-sm font-bold font-grotesk text-charcoal-900">
              UGX {formatUGX(contract.agreed_amount)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-copper-700">
            <span className="text-xs font-medium font-inter">Open Workspace</span>
            <ChevronRight size={14} strokeWidth={2.5} />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ── Open Brief Card ───────────────────────────────────────────────────────────

interface OpenBriefCardProps {
  project: Project
  onSubmitProposal: (projectId: string) => void
}

const OpenBriefCard: React.FC<OpenBriefCardProps> = ({ project, onSubmitProposal }) => (
  <motion.div variants={itemVariants}>
    <Card className="p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="font-semibold text-charcoal-900 font-grotesk text-sm">
              {project.title}
            </h4>
            {project.requires_mrr && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 font-inter font-medium">
                MRR Required
              </span>
            )}
          </div>
          <p className="text-xs text-mist-500 font-inter leading-relaxed line-clamp-2">
            {project.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CategoryBadge category={project.category} size="sm" />
          <span className="text-xs font-bold text-copper-700 font-grotesk">
            UGX {formatUGX(project.budget)}
          </span>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onSubmitProposal(project.id)}
          rightIcon={<ArrowRight size={13} strokeWidth={2.5} />}
        >
          Submit Proposal
        </Button>
      </div>
    </Card>
  </motion.div>
)

// ── Main Component ────────────────────────────────────────────────────────────

export const DesignerHome: React.FC = () => {
  const navigate = useNavigate()
  const user = useStore((s) => s.user ?? s.currentUser)
  const designers = useStore((s) => s.designers)
  const contracts = useStore((s) => s.contracts)
  const projects = useStore((s) => s.projects)
  const wallets = useStore((s) => s.wallets)
  const initializeDemoData = useStore((s) => s.initializeDemoData)

  useEffect(() => {
    initializeDemoData()
  }, [initializeDemoData])

  const designerId = user?.id ?? 'demo-designer-001'
  const designerProfile = designers.find((d) => d.user_id === designerId)
  const wallet = wallets[designerId]

  const myContracts = contracts.filter((c) => c.designer_id === designerId)
  const activeContracts = myContracts.filter((c) => c.status === 'active')
  const completedContracts = myContracts.filter((c) => c.status === 'completed')

  const openProjects = projects.filter((p) => p.status === 'open')

  const displayName = designerProfile?.name ?? user?.name ?? 'Designer'
  const isVetted = designerProfile?.is_vetted ?? false
  const rating = designerProfile?.rating ?? 0
  const completedCount = designerProfile?.completed_projects ?? completedContracts.length

  const handleOpenWorkspace = (contractId: string) => {
    navigate(`/designer/workspace/${contractId}`)
  }

  const handleSubmitProposal = (projectId: string) => {
    navigate(`/designer/proposal/${projectId}`)
  }

  return (
    <div className="min-h-screen bg-mist-50 pb-24">
      <Header variant="light" showNotifications />

      <motion.div
        className="px-4 pt-5 pb-6 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Greeting ────────────────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-charcoal-900 font-grotesk">
              Studio, {displayName.split(' ')[0]}
            </h1>
            {isVetted && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold font-inter"
              >
                <Shield size={10} strokeWidth={2.5} />
                Vetted
              </motion.span>
            )}
          </div>
          <p className="text-sm text-mist-500 font-inter">
            {activeContracts.length > 0
              ? `You have ${activeContracts.length} active contract${activeContracts.length !== 1 ? 's' : ''}`
              : 'Browse open briefs to find your next project'}
          </p>
        </motion.div>

        {/* ── Wallet Mini Card ─────────────────────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <WalletMiniCard
            available={wallet?.available_balance ?? 0}
            pending={wallet?.locked_balance ?? 0}
          />
        </motion.div>

        {/* ── Artistic Hero Banner ────────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl h-28"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1541701494672-9d96629bd31c?w=800&auto=format&fit=crop")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/70 to-copper-700/40" />
          <div className="relative z-10 flex items-center justify-between px-5 h-full">
            <div>
              <p className="text-white/70 text-xs font-inter">ArtConnect.Ug</p>
              <p className="text-white font-grotesk font-bold text-sm mt-0.5">Showcase Your Craft</p>
            </div>
            <button
              onClick={() => navigate('/designer/portfolio')}
              className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-xs font-semibold font-inter border border-white/20 hover:bg-white/30 transition-colors"
            >
              Portfolio
            </button>
          </div>
        </motion.div>

        {/* ── Stats Row ────────────────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="flex gap-3">
          <StatCard
            label="Completed Projects"
            value={completedCount}
            icon={CheckCircle2}
          />
          <StatCard
            label="Rating"
            value={rating > 0 ? rating.toFixed(1) : '—'}
            icon={Star}
            highlight={rating > 0}
          />
          <StatCard
            label="Active Contracts"
            value={activeContracts.length}
            icon={Briefcase}
            highlight={activeContracts.length > 0}
          />
        </motion.div>

        {/* ── Active Contracts ─────────────────────────────────────────────────── */}
        {activeContracts.length > 0 && (
          <motion.section variants={itemVariants} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-charcoal-900 font-grotesk">
                Active Contracts
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/designer/contracts')}
                rightIcon={<ArrowRight size={13} strokeWidth={2.5} />}
              >
                View All
              </Button>
            </div>
            <motion.div className="space-y-3" variants={containerVariants}>
              {activeContracts.map((contract) => (
                <ActiveContractCard
                  key={contract.id}
                  contract={contract}
                  project={projects.find((p) => p.id === contract.project_id)}
                  onOpen={handleOpenWorkspace}
                />
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* ── Open Briefs ──────────────────────────────────────────────────────── */}
        <motion.section variants={itemVariants} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-charcoal-900 font-grotesk">
              Open Briefs
            </h2>
            <Badge variant="copper" size="sm">
              {openProjects.length} available
            </Badge>
          </div>

          {openProjects.length === 0 ? (
            <Card className="p-8 text-center">
              <Briefcase size={32} className="text-mist-200 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm text-mist-400 font-inter">No open briefs at the moment</p>
            </Card>
          ) : (
            <motion.div className="space-y-3" variants={containerVariants}>
              {openProjects.map((project) => (
                <OpenBriefCard
                  key={project.id}
                  project={project}
                  onSubmitProposal={handleSubmitProposal}
                />
              ))}
            </motion.div>
          )}
        </motion.section>

        {/* ── Vetting CTA (if not yet vetted) ─────────────────────────────────── */}
        {!isVetted && (
          <motion.div
            variants={itemVariants}
            className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Shield size={18} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-charcoal-900 font-grotesk mb-0.5">
                  Get Vetted
                </p>
                <p className="text-xs text-mist-500 font-inter leading-relaxed mb-3">
                  Vetted designers get priority placement and client trust. Submit your portfolio for review.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/designer/portfolio')}
                  className="bg-gradient-to-r from-amber-600 to-amber-500 border-0 shadow-amber-600/20"
                >
                  Submit for Vetting
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      <BottomNav role="designer" />
    </div>
  )
}

export default DesignerHome
