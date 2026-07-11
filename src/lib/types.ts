// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Core TypeScript Types
// ─────────────────────────────────────────────────────────────────────────────

// ── User & Auth ──────────────────────────────────────────────────────────────

export type UserRole = 'client' | 'designer' | 'admin'

export interface User {
  id: string
  phone: string
  name: string
  username: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
}

// ── Designer Profile ─────────────────────────────────────────────────────────

export type DesignerSpecialization =
  | 'graphic'
  | 'industrial'
  | 'branding'
  | 'ui_ux'
  | 'motion'
  | 'packaging'

export interface DesignerProfile {
  id: string
  user_id: string
  bio: string
  specializations: DesignerSpecialization[]
  is_vetted: boolean
  portfolio_images: string[]
  rating: number
  completed_projects: number
  hourly_rate: number
  location: string
}

// ── Portfolio ─────────────────────────────────────────────────────────────────

export interface PortfolioItem {
  id: string
  designer_id: string
  title: string
  description: string
  category: DesignerSpecialization
  image_url: string
  tags: string[]
  created_at: string
}

// ── Projects ──────────────────────────────────────────────────────────────────

export type ProjectStatus =
  | 'draft'
  | 'open'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed'

export interface Project {
  id: string
  client_id: string
  title: string
  description: string
  category: DesignerSpecialization
  budget: number
  requires_mrr: boolean
  status: ProjectStatus
  created_at: string
  deadline: string | null
}

// ── Contracts ─────────────────────────────────────────────────────────────────

export type ContractStatus =
  | 'pending'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'disputed'

export interface Contract {
  id: string
  project_id: string
  client_id: string
  designer_id: string
  agreed_amount: number
  status: ContractStatus
  created_at: string
}

// ── Milestones ────────────────────────────────────────────────────────────────

export type MilestoneStatus =
  | 'pending'
  | 'in_progress'
  | 'submitted'
  | 'approved'
  | 'revision_requested'
  | 'disputed'

export interface Milestone {
  id: string
  contract_id: string
  title: string
  description: string
  amount: number
  status: MilestoneStatus
  due_date: string | null
  order_index: number
  mrr_required: boolean
  created_at: string
}

// ── Deliverables ──────────────────────────────────────────────────────────────

export interface Deliverable {
  id: string
  milestone_id: string
  file_name: string
  file_url: string
  is_locked: boolean
  uploaded_at: string
}

// ── Messaging ─────────────────────────────────────────────────────────────────

export interface Message {
  id: string
  contract_id: string
  sender_id: string
  content: string
  created_at: string
}

// ── Wallet & Payments ─────────────────────────────────────────────────────────

export interface Wallet {
  id: string
  user_id: string
  available_balance: number
  locked_balance: number
  currency: string
}

export type TransactionType = 'top_up' | 'lock' | 'release' | 'refund'

export interface Transaction {
  id: string
  wallet_id: string
  type: TransactionType
  amount: number
  description: string
  created_at: string
}

export interface EscrowHold {
  id: string
  contract_id: string
  client_wallet_id: string
  designer_wallet_id: string
  amount: number
  status: 'held' | 'released' | 'refunded'
  created_at: string
}

// ── MRR (Material Requirements Record) ───────────────────────────────────────

export interface MRRRecord {
  id: string
  milestone_id: string
  checklist_items: string[]
  bom_uploaded: boolean
  admin_approved: boolean
  created_at: string
}

// ── Notifications ─────────────────────────────────────────────────────────────

export type NotificationType =
  | 'project_update'
  | 'contract_update'
  | 'milestone_update'
  | 'payment'
  | 'message'
  | 'dispute'
  | 'admin'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  created_at: string
}

// ── Disputes ──────────────────────────────────────────────────────────────────

export interface Dispute {
  id: string
  contract_id: string
  raised_by: string
  reason: string
  status: 'open' | 'resolved'
  admin_notes: string | null
  created_at: string
}

// ── Utility / UI ──────────────────────────────────────────────────────────────

/**
 * Generic paginated response wrapper for API calls.
 */
export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
  total_pages: number
}

/**
 * Generic API error shape.
 */
export interface ApiError {
  message: string
  code?: string
  status?: number
}

/**
 * Lightweight user reference used in joined queries.
 */
export interface UserRef {
  id: string
  name: string
  avatar_url: string | null
}

/**
 * Designer card preview used on marketplace listing pages.
 */
export interface DesignerCard {
  user: UserRef
  profile: DesignerProfile
  latest_portfolio_item: PortfolioItem | null
}

/**
 * Project card preview used on browse pages.
 */
export interface ProjectCard {
  project: Project
  client: UserRef
  proposals_count: number
}

/**
 * Form state helper – tracks submission and error state.
 */
export interface FormState {
  isSubmitting: boolean
  error: string | null
  success: boolean
}
