// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Client's Projects List Screen
// Route: /client/projects
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderOpen, Users } from 'lucide-react'
import { useStore } from '../../lib/store'
import { ProjectCard } from '../../components/features/ProjectCard'
import { Badge } from '../../components/ui/Badge'
import type { Project, ProjectStatus } from '../../lib/types'

// ── Types ─────────────────────────────────────────────────────────────────────

type TabId = 'active' | 'open' | 'completed'

interface TabConfig {
  id: TabId
  label: string
  statuses: ProjectStatus[]
}

const TABS: TabConfig[] = [
  {
    id: 'active',
    label: 'Active',
    statuses: ['in_progress'],
  },
  {
    id: 'open',
    label: 'Open',
    statuses: ['open', 'draft'],
  },
  {
    id: 'completed',
    label: 'Completed',
    statuses: ['completed', 'cancelled', 'disputed'],
  },
]

// ── Proposal count helper (demo: random between 2–8) ─────────────────────────

function getDemoProposalCount(projectId: string): number {
  let hash = 0
  for (let i = 0; i < projectId.length; i++) {
    hash = projectId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return 2 + (Math.abs(hash) % 7)
}

// ── Empty State ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  tab: TabId
  onPostBrief: () => void
}

const EmptyState: React.FC<EmptyStateProps> = ({ tab, onPostBrief }) => {
  const config: Record<TabId, { icon: React.ReactNode; title: string; description: string; showCta: boolean }> = {
    active: {
      icon: <FolderOpen size={36} className="text-mist-300" strokeWidth={1.5} />,
      title: 'No active projects',
      description: "Projects move here once you've hired a designer and the contract is active.",
      showCta: false,
    },
    open: {
      icon: <FolderOpen size={36} className="text-mist-300" strokeWidth={1.5} />,
      title: 'No open briefs',
      description: 'Post a brief to start receiving proposals from talented designers.',
      showCta: true,
    },
    completed: {
      icon: <FolderOpen size={36} className="text-mist-300" strokeWidth={1.5} />,
      title: 'No completed projects yet',
      description: "Finished projects will appear here once all milestones are approved.",
      showCta: false,
    },
  }

  const { icon, title, description, showCta } = config[tab]

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
      <div className="w-20 h-20 rounded-2xl bg-mist-100 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="font-grotesk font-semibold text-base text-charcoal-900">{title}</p>
        <p className="font-inter text-sm text-mist-400 mt-1 max-w-xs mx-auto">{description}</p>
      </div>
      {showCta && (
        <button
          onClick={onPostBrief}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-copper text-white font-inter text-sm font-medium shadow-md shadow-copper-700/25 hover:shadow-copper-700/40 active:scale-95 transition-all duration-200"
        >
          <Plus size={16} strokeWidth={2.5} />
          Post a Brief
        </button>
      )}
    </div>
  )
}

// ── ActiveProjectCard ─────────────────────────────────────────────────────────

interface ActiveProjectCardProps {
  project: Project
  onViewContract: (projectId: string) => void
}

const ActiveProjectCard: React.FC<ActiveProjectCardProps> = ({ project, onViewContract }) => {
  const contracts = useStore((s) => s.contracts)
  const milestones = useStore((s) => s.milestones)

  const contract = contracts.find((c) => c.project_id === project.id)
  const projectMilestones = contract
    ? milestones.filter((m) => m.contract_id === contract.id)
    : []

  const currentMilestone = projectMilestones.find(
    (m) => m.status === 'in_progress' || m.status === 'submitted'
  ) ?? projectMilestones.find((m) => m.status === 'pending')

  const completedCount = projectMilestones.filter((m) => m.status === 'approved').length
  const totalCount = projectMilestones.length

  return (
    <div className="bg-white rounded-2xl border border-mist-100 shadow-sm overflow-hidden">
      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="h-1 bg-mist-100">
          <div
            className="h-full gradient-copper transition-all duration-500"
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-grotesk font-semibold text-sm text-charcoal-900 leading-snug flex-1">
            {project.title}
          </h3>
          <Badge variant="info" size="sm" dot>
            Active
          </Badge>
        </div>

        {/* Current milestone */}
        {currentMilestone && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-mist-50 border border-mist-100">
            <div className="w-1.5 h-1.5 rounded-full bg-copper-700 shrink-0" />
            <p className="font-inter text-xs text-charcoal-900/70 flex-1 truncate">
              <span className="text-mist-400">Current: </span>
              {currentMilestone.title}
            </p>
            <Badge
              variant={
                currentMilestone.status === 'submitted'
                  ? 'warning'
                  : currentMilestone.status === 'in_progress'
                  ? 'info'
                  : 'mist'
              }
              size="sm"
            >
              {currentMilestone.status === 'submitted'
                ? 'Review'
                : currentMilestone.status === 'in_progress'
                ? 'In Progress'
                : 'Pending'}
            </Badge>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="font-inter text-xs text-mist-400">
            {completedCount}/{totalCount} milestones done
          </p>
          <button
            onClick={() => onViewContract(project.id)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl gradient-copper text-white font-inter text-xs font-medium shadow-sm shadow-copper-700/25 hover:shadow-copper-700/40 active:scale-95 transition-all duration-200"
          >
            View Contract
          </button>
        </div>
      </div>
    </div>
  )
}

// ── OpenProjectCard ───────────────────────────────────────────────────────────

interface OpenProjectCardProps {
  project: Project
  onViewProposals: (projectId: string) => void
}

const OpenProjectCard: React.FC<OpenProjectCardProps> = ({ project, onViewProposals }) => {
  const proposalCount = getDemoProposalCount(project.id)

  return (
    <div className="bg-white rounded-2xl border border-mist-100 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-grotesk font-semibold text-sm text-charcoal-900 leading-snug flex-1">
            {project.title}
          </h3>
          <Badge variant={project.status === 'open' ? 'success' : 'mist'} size="sm" dot>
            {project.status === 'open' ? 'Open' : 'Draft'}
          </Badge>
        </div>

        {/* Proposals count */}
        {project.status === 'open' && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
            <Users size={13} className="text-emerald-600 shrink-0" strokeWidth={2} />
            <p className="font-inter text-xs text-emerald-700 font-medium">
              {proposalCount} proposal{proposalCount !== 1 ? 's' : ''} received
            </p>
          </div>
        )}

        <p className="font-inter text-xs text-mist-400 line-clamp-2 mb-3">
          {project.description}
        </p>

        <div className="flex items-center justify-between">
          <p className="font-inter text-xs text-mist-400">
            Budget: <span className="font-medium text-charcoal-900">UGX {project.budget.toLocaleString()}</span>
          </p>
          {project.status === 'open' && (
            <button
              onClick={() => onViewProposals(project.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 border-copper-700 text-copper-700 font-inter text-xs font-medium hover:bg-copper-700 hover:text-white active:scale-95 transition-all duration-200"
            >
              <Users size={12} strokeWidth={2.5} />
              View Proposals
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ProjectsList() {
  const navigate = useNavigate()
  const user = useStore((s) => s.user)
  const projects = useStore((s) => s.projects)

  const [activeTab, setActiveTab] = useState<TabId>('active')

  // Filter to current user's projects
  const userProjects = projects.filter((p) => p.client_id === user?.id)

  // Get projects for current tab
  const currentTab = TABS.find((t) => t.id === activeTab)!
  const filteredProjects = userProjects.filter((p) =>
    currentTab.statuses.includes(p.status)
  )

  // Tab counts
  const tabCounts: Record<TabId, number> = {
    active: userProjects.filter((p) => TABS.find((t) => t.id === 'active')!.statuses.includes(p.status)).length,
    open: userProjects.filter((p) => TABS.find((t) => t.id === 'open')!.statuses.includes(p.status)).length,
    completed: userProjects.filter((p) => TABS.find((t) => t.id === 'completed')!.statuses.includes(p.status)).length,
  }

  const handleViewContract = (projectId: string) => {
    const contracts = useStore.getState().contracts
    const contract = contracts.find((c) => c.project_id === projectId)
    if (contract) navigate(`/client/contract/${contract.id}`)
  }

  const handleViewProposals = (projectId: string) => {
    navigate(`/client/proposals/${projectId}`)
  }

  const handlePostBrief = () => {
    navigate('/client/post-brief')
  }

  return (
    <div className="flex flex-col min-h-screen bg-mist-100 max-w-2xl mx-auto pb-24">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex-none bg-white border-b border-mist-100 shadow-sm">
        <div className="px-4 pt-5 pb-3">
          <h1 className="font-grotesk text-xl font-bold text-charcoal-900">My Projects</h1>
          <p className="font-inter text-sm text-mist-400 mt-0.5">
            {userProjects.length} project{userProjects.length !== 1 ? 's' : ''} total
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 px-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'relative px-4 py-2.5 font-inter text-sm font-medium transition-colors duration-150',
                activeTab === tab.id
                  ? 'text-copper-700'
                  : 'text-mist-400 hover:text-charcoal-900',
              ].join(' ')}
            >
              {tab.label}
              {tabCounts[tab.id] > 0 && (
                <span
                  className={[
                    'ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full font-inter text-[10px] font-bold',
                    activeTab === tab.id
                      ? 'gradient-copper text-white'
                      : 'bg-mist-100 text-mist-400',
                  ].join(' ')}
                >
                  {tabCounts[tab.id]}
                </span>
              )}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full gradient-copper" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ── Project List ────────────────────────────────────────────────────── */}
      <div className="flex-1 px-4 pt-4 space-y-3">
        {filteredProjects.length === 0 ? (
          <EmptyState tab={activeTab} onPostBrief={handlePostBrief} />
        ) : (
          <>
            {activeTab === 'active' &&
              filteredProjects.map((project) => (
                <ActiveProjectCard
                  key={project.id}
                  project={project}
                  onViewContract={handleViewContract}
                />
              ))}

            {activeTab === 'open' &&
              filteredProjects.map((project) => (
                <OpenProjectCard
                  key={project.id}
                  project={project}
                  onViewProposals={handleViewProposals}
                />
              ))}

            {activeTab === 'completed' &&
              filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => {}}
                />
              ))}
          </>
        )}
      </div>

      {/* ── FAB: Post New Brief ──────────────────────────────────────────────── */}
      <button
        onClick={handlePostBrief}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3.5 rounded-2xl gradient-copper text-white font-grotesk text-sm font-semibold shadow-xl shadow-copper-700/40 hover:shadow-copper-700/60 active:scale-95 transition-all duration-200 z-20"
        aria-label="Post New Brief"
      >
        <Plus size={18} strokeWidth={2.5} />
        Post New Brief
      </button>
    </div>
  )
}
