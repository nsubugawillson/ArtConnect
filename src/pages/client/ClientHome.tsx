// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Client Dashboard Home
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  PlusSquare,
  Search,
  Wallet,
  MessageCircle,
  ChevronRight,
  Lock,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  Star,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { BottomNav } from '../../components/layout/BottomNav'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import type { DesignerWithUser } from '../../lib/store'
import type { Contract } from '../../lib/types'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatUGX(n: number): string {
  return new Intl.NumberFormat('en-UG', { maximumFractionDigits: 0 }).format(n)
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function todayLabel(): string {
  return new Date().toLocaleDateString('en-UG', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

const categoryLabel: Record<string, string> = {
  graphic: 'Graphic',
  industrial: 'Industrial',
  branding: 'Branding',
  ui_ux: 'UI/UX',
  motion: 'Motion',
  packaging: 'Packaging',
}

// ── Animation Variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] } },
}

// ── Compact Balance Card ──────────────────────────────────────────────────────

interface BalanceCardProps {
  available: number
  locked: number
}

const BalanceCard: React.FC<BalanceCardProps> = ({ available, locked }) => {
  const navigate = useNavigate()
  return (
    <motion.div
      variants={itemVariants}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-[#3D1A06] shadow-xl shadow-charcoal-900/30 mx-4"
      onClick={() => navigate('/client/wallet')}
    >
      {/* Decorative glow */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(160,67,10,0.35) 0%, rgba(160,67,10,0.04) 70%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 p-5">
        <p className="text-white/40 text-[11px] font-inter uppercase tracking-widest mb-1">
          Available Balance
        </p>
        <div className="flex items-end gap-1.5 mb-4">
          <span className="text-white/50 text-sm font-inter self-end mb-0.5">UGX</span>
          <span className="text-white text-3xl font-bold font-grotesk leading-none tabular-nums">
            {formatUGX(available)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          {locked > 0 ? (
            <div className="flex items-center gap-1.5">
              <Lock size={12} className="text-copper-400" strokeWidth={2} />
              <span className="text-white/50 text-xs font-inter">
                UGX {formatUGX(locked)} in escrow
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <TrendingUp size={12} className="text-copper-400" strokeWidth={2} />
              <span className="text-white/50 text-xs font-inter">No funds locked</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-copper-400 text-xs font-inter">
            <span>Wallet</span>
            <ChevronRight size={13} strokeWidth={2} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Active Project Card ───────────────────────────────────────────────────────

interface ActiveProjectCardProps {
  contract: Contract
  projectTitle: string
  projectCategory: string
  designerName: string
  designerAvatar: string | null
  contractId: string
}

const ActiveProjectCard: React.FC<ActiveProjectCardProps> = ({
  projectTitle,
  projectCategory,
  designerName,
  designerAvatar,
  contractId,
}) => {
  const navigate = useNavigate()
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-2xl border border-mist-100 p-4 shadow-sm hover:shadow-md hover:border-copper-700/30 transition-all duration-200 cursor-pointer"
      onClick={() => navigate(`/client/contract/${contractId}`)}
      whileTap={{ scale: 0.985 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="info" size="sm" dot>
              In Progress
            </Badge>
            <Badge variant="copper" size="sm">
              {categoryLabel[projectCategory] ?? projectCategory}
            </Badge>
          </div>
          <h3 className="text-sm font-semibold text-charcoal-900 font-grotesk leading-snug truncate">
            {projectTitle}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Avatar src={designerAvatar} name={designerName} size="xs" />
            <span className="text-xs text-mist-500 font-inter">{designerName}</span>
          </div>
        </div>
        <ChevronRight size={16} className="text-mist-300 shrink-0 mt-1" strokeWidth={2} />
      </div>
    </motion.div>
  )
}

// ── Quick Action Button ───────────────────────────────────────────────────────

interface QuickActionProps {
  icon: React.ElementType
  label: string
  onClick: () => void
  accent?: boolean
}

const QuickAction: React.FC<QuickActionProps> = ({ icon: Icon, label, onClick, accent }) => (
  <motion.button
    variants={itemVariants}
    className="flex flex-col items-center gap-2 flex-1"
    onClick={onClick}
    whileTap={{ scale: 0.92 }}
  >
    <div
      className={[
        'w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-200',
        accent
          ? 'bg-gradient-to-br from-copper-700 to-copper-600 shadow-copper-700/25'
          : 'bg-white border border-mist-100',
      ].join(' ')}
    >
      <Icon
        size={22}
        strokeWidth={1.8}
        className={accent ? 'text-white' : 'text-charcoal-800'}
      />
    </div>
    <span
      className={[
        'text-[11px] font-inter font-medium text-center leading-tight',
        accent ? 'text-copper-700' : 'text-mist-500',
      ].join(' ')}
    >
      {label}
    </span>
  </motion.button>
)

// ── Compact Designer Preview Card ─────────────────────────────────────────────

interface DesignerPreviewCardProps {
  designer: DesignerWithUser
  onClick: () => void
}

const DesignerPreviewCard: React.FC<DesignerPreviewCardProps> = ({ designer, onClick }) => (
  <motion.div
    variants={itemVariants}
    className="shrink-0 w-40 bg-white rounded-2xl border border-mist-100 overflow-hidden shadow-sm hover:shadow-md hover:border-copper-700/30 transition-all duration-200 cursor-pointer"
    onClick={onClick}
    whileTap={{ scale: 0.97 }}
  >
    <div className="relative aspect-[4/3] overflow-hidden bg-mist-100">
      <img
        src={designer.cover_image}
        alt={designer.name}
        className="w-full h-full object-cover"
      />
      {designer.is_vetted && (
        <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-0.5">
          <CheckCircle2 size={11} className="text-white" strokeWidth={2.5} />
        </div>
      )}
    </div>
    <div className="p-2.5">
      <p className="text-xs font-semibold text-charcoal-900 font-grotesk truncate">{designer.name}</p>
      <p className="text-[10px] text-mist-400 font-inter truncate mt-0.5">
        {designer.specializations
          .slice(0, 2)
          .map((s) => categoryLabel[s] ?? s)
          .join(' · ')}
      </p>
      {designer.rating > 0 && (
        <div className="flex items-center gap-1 mt-1.5">
          <Star size={10} fill="#A0430A" className="text-copper-700" />
          <span className="text-[10px] font-semibold text-charcoal-900 font-grotesk">
            {designer.rating.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  </motion.div>
)

// ── Notification Bell ─────────────────────────────────────────────────────────

interface NotificationBellProps {
  count: number
  onClick: () => void
}

const NotificationBell: React.FC<NotificationBellProps> = ({ count, onClick }) => (
  <motion.button
    onClick={onClick}
    className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-mist-100 shadow-sm"
    whileTap={{ scale: 0.9 }}
  >
    <Bell size={18} strokeWidth={1.8} className="text-charcoal-800" />
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key="badge"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-copper-700 text-white text-[9px] font-bold font-grotesk px-1"
        >
          {count > 9 ? '9+' : count}
        </motion.span>
      )}
    </AnimatePresence>
  </motion.button>
)

// ── Main Component ────────────────────────────────────────────────────────────

const ClientHome: React.FC = () => {
  const navigate = useNavigate()
  const {
    user,
    designers,
    contracts,
    projects,
    notifications,
    wallets,
    initializeDemoData,
  } = useStore()

  const [isReady, setIsReady] = useState(false)

  // Initialize demo data on first mount
  useEffect(() => {
    if (designers.length === 0) {
      initializeDemoData()
    }
    // Small delay to let stagger animation look intentional
    const t = setTimeout(() => setIsReady(true), 60)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const userId = user?.id ?? 'demo-client-001'
  const wallet = wallets[userId]
  const available = wallet?.available_balance ?? 0
  const locked = wallet?.locked_balance ?? 0

  // Unread notifications for this user
  const unreadCount = notifications.filter(
    (n) => n.user_id === userId && !n.is_read
  ).length

  // Active contracts for this client
  const activeContracts = contracts.filter(
    (c) => c.client_id === userId && (c.status === 'active' || c.status === 'pending')
  )

  // Find designer info for a contract
  const getDesignerForContract = (designerId: string) =>
    designers.find((d) => d.user_id === designerId)

  // Find project info for a contract
  const getProjectForContract = (projectId: string) =>
    projects.find((p) => p.id === projectId)

  // Designer preview (first 3)
  const previewDesigners = designers.slice(0, 4)

  if (!isReady) {
    return (
      <div className="min-h-screen bg-mist-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-copper-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mist-100 pb-24">
      <div className="max-w-md mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-5 pt-4"
        >
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between px-4"
          >
            <div>
              <p className="text-mist-500 text-xs font-inter">{todayLabel()}</p>
              <h1 className="text-xl font-bold text-charcoal-900 font-grotesk mt-0.5">
                {getGreeting()},{' '}
                <span className="text-copper-700">{user?.name?.split(' ')[0] ?? 'Amara'}</span>
                !
              </h1>
            </div>
            <NotificationBell count={unreadCount} onClick={() => navigate('/notifications')} />
          </motion.div>

          {/* ── Artistic Hero Banner ────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl mx-4 h-28"
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1558618666-fcd25c85cd82?w=800&auto=format&fit=crop")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-copper-700/80 to-copper-900/60" />
            <div className="relative z-10 flex items-center justify-between px-5 h-full">
              <div>
                <p className="text-white/70 text-xs font-inter">ArtConnect.Ug</p>
                <p className="text-white font-grotesk font-bold text-sm mt-0.5">Find Your Perfect Designer</p>
              </div>
              <button
                onClick={() => navigate('/client/browse')}
                className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-xs font-semibold font-inter border border-white/20 hover:bg-white/30 transition-colors"
              >
                Browse
              </button>
            </div>
          </motion.div>

          {/* ── Balance Card ───────────────────────────────────────────────── */}
          <BalanceCard available={available} locked={locked} />

          {/* ── Quick Actions ──────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="px-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-charcoal-900 font-grotesk">Quick Actions</h2>
            </div>
            <div className="flex items-start gap-2">
              <QuickAction
                icon={PlusSquare}
                label="Post Brief"
                onClick={() => navigate('/client/post-brief')}
                accent
              />
              <QuickAction
                icon={Search}
                label="Browse"
                onClick={() => navigate('/client/browse')}
              />
              <QuickAction
                icon={Wallet}
                label="Wallet"
                onClick={() => navigate('/client/wallet')}
              />
              <QuickAction
                icon={MessageCircle}
                label="Messages"
                onClick={() => navigate('/client/messages')}
              />
            </div>
          </motion.div>

          {/* ── Active Projects ────────────────────────────────────────────── */}
          {activeContracts.length > 0 && (
            <motion.div variants={itemVariants} className="px-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Briefcase size={15} strokeWidth={2} className="text-copper-700" />
                  <h2 className="text-sm font-semibold text-charcoal-900 font-grotesk">
                    Active Projects
                  </h2>
                </div>
                <Link
                  to="/client/projects"
                  className="text-xs text-copper-700 font-inter font-medium flex items-center gap-0.5"
                >
                  See all <ChevronRight size={13} strokeWidth={2.5} />
                </Link>
              </div>
              <div className="space-y-3">
                {activeContracts.slice(0, 3).map((contract) => {
                  const designer = getDesignerForContract(contract.designer_id)
                  const project = getProjectForContract(contract.project_id)
                  if (!project) return null
                  return (
                    <ActiveProjectCard
                      key={contract.id}
                      contract={contract}
                      projectTitle={project.title}
                      projectCategory={project.category}
                      designerName={designer?.name ?? 'Designer'}
                      designerAvatar={designer?.avatar_url ?? null}
                      contractId={contract.id}
                    />
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── Browse Designers Preview ────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-3 px-4">
              <div className="flex items-center gap-2">
                <Star size={15} strokeWidth={2} className="text-copper-700" />
                <h2 className="text-sm font-semibold text-charcoal-900 font-grotesk">
                  Top Designers
                </h2>
              </div>
              <Link
                to="/client/browse"
                className="text-xs text-copper-700 font-inter font-medium flex items-center gap-0.5"
              >
                See all <ChevronRight size={13} strokeWidth={2.5} />
              </Link>
            </div>

            {/* Horizontal scroll row */}
            <div className="pl-4 overflow-x-auto scrollbar-none">
              <div className="flex gap-3 pb-2 pr-4">
                {previewDesigners.map((designer) => (
                  <DesignerPreviewCard
                    key={designer.id}
                    designer={designer}
                    onClick={() => navigate(`/client/designer/${designer.user_id}`)}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Empty state if no active contracts ─────────────────────────── */}
          {activeContracts.length === 0 && (
            <motion.div variants={itemVariants} className="px-4">
              <div className="rounded-2xl border-2 border-dashed border-mist-200 p-8 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-copper-700/10 flex items-center justify-center">
                  <Briefcase size={22} className="text-copper-700" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal-900 font-grotesk">
                    No active projects
                  </p>
                  <p className="text-xs text-mist-500 font-inter mt-1">
                    Post a brief to connect with vetted designers
                  </p>
                </div>
                <motion.button
                  className="mt-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-copper-700 to-copper-600 text-white text-sm font-medium font-inter shadow-md shadow-copper-700/25"
                  onClick={() => navigate('/client/post-brief')}
                  whileTap={{ scale: 0.97 }}
                >
                  Post Your First Brief
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <BottomNav role="client" />
    </div>
  )
}

export default ClientHome
