// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Supabase Service Layer (API)
// ─────────────────────────────────────────────────────────────────────────────
// This is the ONLY place where Supabase queries happen.
// All store functions call these exported functions.
// ─────────────────────────────────────────────────────────────────────────────

import supabase from './supabase'
import {
  User,
  DesignerProfile,
  DesignerSpecialization,
  Project,
  ProjectStatus,
  Contract,
  ContractStatus,
  Milestone,
  MilestoneStatus,
  Deliverable,
  Message,
  Wallet,
  Transaction,
  TransactionType,
  EscrowHold,
  PortfolioItem,
  MRRRecord,
  Notification,
  Dispute,
  NotificationType,
  UserRole,
} from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Generic Response Types
// ─────────────────────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  data: T | null
  error: Error | null
}

interface ApiListResponse<T> {
  data: T[]
  error: Error | null
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sign up a new user (client, designer, or admin).
 * `emailOrPhone` can be:
 *   - a full email address (e.g. from RoleSelection / Auth demo flow)
 *   - a phone number (legacy path from Auth screen OTP flow)
 * Creates:
 * 1. Auth user
 * 2. Profile row
 * 3. Wallet row (with starter balance)
 * 4. Designer profile row (if role is 'designer')
 */
export async function signUp(
  emailOrPhone: string,
  password: string,
  name: string,
  role: UserRole,
  username?: string
): Promise<ApiResponse<{ user: any; session: any }>> {
  try {
    // If the caller already passed a proper email, use it directly.
    // Otherwise treat it as a phone and build a local email from it.
    const isEmail = emailOrPhone.includes('@')
    const email = isEmail ? emailOrPhone : `${emailOrPhone}@artconnect.local`
    const phone = isEmail ? '' : emailOrPhone

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone,
          name,
          role,
          username: username || null,
        },
      },
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create auth user')

    // Profile, wallet, and designer_profile are created automatically by the
    // handle_new_user DB trigger (SECURITY DEFINER)
    // The trigger reads username from auth metadata

    // If session exists, user is auto-confirmed
    if (authData.session) {
      return { data: { user: authData.user, session: authData.session }, error: null }
    }

    // Try to sign in to get a session (for email confirmation disabled cases)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      // Account created but needs email confirmation
      return { data: { user: authData.user, session: null }, error: null }
    }

    return { data: { user: authData.user, session: signInData.session }, error: null }
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : typeof (err as any)?.message === 'string'
          ? (err as any).message
          : 'Registration failed. Please try again.'
    return { data: null, error: new Error(msg) }
  }
}

/**
 * Sign in with phone and password.
 */
export async function signIn(
  emailOrPhone: string,
  password: string
): Promise<ApiResponse<{ session: any }>> {
  try {
    const isEmail = emailOrPhone.includes('@')
    const email = isEmail ? emailOrPhone : `${emailOrPhone}@artconnect.local`
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    if (!data.session) throw new Error('No session returned')

    return { data: { session: data.session }, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Sign in with username and password.
 * Looks up the user's email by username, then signs in.
 */
export async function signInWithUsername(
  username: string,
  password: string
): Promise<ApiResponse<{ session: any }>> {
  try {
    // Look up the user's email by username using RPC function
    const { data: emailData, error: rpcError } = await supabase.rpc('get_email_by_username', { p_username: username })

    if (rpcError || !emailData) {
      throw new Error('Could not find user with that username')
    }

    const email = emailData as string

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    if (!data.session) throw new Error('No session returned')

    return { data: { session: data.session }, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Check if a username is available.
 */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .limit(1)

    if (error) return true
    return data.length === 0
  } catch {
    return true
  }
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Get current session.
 */
export async function getSession(): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return { data: data.session, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Get the profile row for the current authenticated user.
 */
export async function getCurrentProfile(): Promise<ApiResponse<User>> {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    if (!sessionData.session) throw new Error('No active session')

    const userId = sessionData.session.user.id

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    if (!data) throw new Error('Profile not found')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a profile by user ID.
 */
export async function getProfile(userId: string): Promise<ApiResponse<User>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    if (!data) throw new Error('Profile not found')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Update a profile.
 */
export async function updateProfile(
  userId: string,
  updates: Partial<User>
): Promise<ApiResponse<User>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select('*')
      .single()

    if (error) throw error
    if (!data) throw new Error('Profile not found')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Get all designers with their profile data (name, phone, avatar_url).
 */
export async function getDesigners(): Promise<ApiListResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('designer_profiles')
      .select('*, profiles!designer_profiles_user_id_fkey(id, name, phone, avatar_url)')
      .order('rating', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Get a single designer profile with joined profile data.
 */
export async function getDesignerProfile(userId: string): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('designer_profiles')
      .select('*, profiles!designer_profiles_user_id_fkey(*)')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    if (!data) throw new Error('Designer profile not found')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new project.
 */
export async function createProject(
  project: Omit<Project, 'id' | 'created_at'>
): Promise<ApiResponse<Project>> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select('*')
      .single()

    if (error) throw error
    if (!data) throw new Error('Failed to create project')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Get all projects with client name joined.
 * Optional filters: status, category, client_id, etc.
 */
export async function getProjects(filters?: {
  status?: ProjectStatus
  category?: DesignerSpecialization
  client_id?: string
}): Promise<ApiListResponse<any>> {
  try {
    let query = supabase
      .from('projects')
      .select('*, profiles!projects_client_id_fkey(id, name, avatar_url, phone)')

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.client_id) {
      query = query.eq('client_id', filters.client_id)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Get a single project by ID.
 */
export async function getProjectById(id: string): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, profiles!projects_client_id_fkey(id, name, avatar_url, phone)')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) throw new Error('Project not found')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Update project status.
 */
export async function updateProjectStatus(
  id: string,
  status: ProjectStatus
): Promise<ApiResponse<Project>> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    if (!data) throw new Error('Project not found')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROPOSAL FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface ProposalInput {
  project_id: string
  designer_id: string
  cover_letter: string
  proposed_amount: number
  timeline_days: number
}

/**
 * Create a new proposal.
 */
export async function createProposal(
  proposal: ProposalInput
): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('proposals')
      .insert([{ ...proposal, status: 'pending' }])
      .select('*')
      .single()

    if (error) throw error
    if (!data) throw new Error('Failed to create proposal')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Get all proposals for a project with designer name joined.
 */
export async function getProposalsForProject(projectId: string): Promise<ApiListResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('proposals')
      .select(
        '*, profiles!proposals_designer_id_fkey(id, name, avatar_url), designer_profiles!proposals_designer_id_fkey(rating, completed_projects)'
      )
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Update proposal status.
 */
export async function updateProposalStatus(
  id: string,
  status: string
): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('proposals')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    if (!data) throw new Error('Proposal not found')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTRACT FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new contract.
 */
export async function createContract(
  contract: Omit<Contract, 'id' | 'created_at'>
): Promise<ApiResponse<Contract>> {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .insert([contract])
      .select('*')
      .single()

    if (error) throw error
    if (!data) throw new Error('Failed to create contract')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Get all contracts for a user (where user is client or designer).
 * Includes project, designer, and client names.
 */
export async function getContractsForUser(userId: string): Promise<ApiListResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select(
        `*,
        projects!contracts_project_id_fkey(id, title, category),
        client:profiles!contracts_client_id_fkey(id, name, avatar_url),
        designer:profiles!contracts_designer_id_fkey(id, name, avatar_url)`
      )
      .or(`client_id.eq.${userId},designer_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Get a single contract by ID with all joins.
 */
export async function getContractById(id: string): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select(
        `*,
        projects!contracts_project_id_fkey(id, title, category, description),
        client:profiles!contracts_client_id_fkey(id, name, avatar_url, phone),
        designer:profiles!contracts_designer_id_fkey(id, name, avatar_url, phone)`
      )
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) throw new Error('Contract not found')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Update contract status.
 */
export async function updateContractStatus(
  id: string,
  status: ContractStatus
): Promise<ApiResponse<Contract>> {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    if (!data) throw new Error('Contract not found')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MILESTONE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create multiple milestones for a contract.
 */
export async function createMilestones(
  milestones: Array<Omit<Milestone, 'id' | 'created_at'>>
): Promise<ApiListResponse<Milestone>> {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .insert(milestones)
      .select('*')

    if (error) throw error

    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Get all milestones for a contract.
 */
export async function getMilestonesForContract(
  contractId: string
): Promise<ApiListResponse<Milestone>> {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('contract_id', contractId)
      .order('order_index', { ascending: true })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Update milestone status.
 */
export async function updateMilestoneStatus(
  id: string,
  status: MilestoneStatus
): Promise<ApiResponse<Milestone>> {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    if (!data) throw new Error('Milestone not found')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// WALLET & TRANSACTION FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get wallet for a user.
 */
export async function getWallet(userId: string): Promise<ApiResponse<Wallet>> {
  try {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    if (!data) throw new Error('Wallet not found')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Top up wallet by adding to available_balance.
 * Creates a transaction record.
 */
export async function topUpWallet(
  userId: string,
  amount: number,
  description: string
): Promise<ApiResponse<Wallet>> {
  try {
    if (amount <= 0) throw new Error('Amount must be positive')

    // Get wallet
    const walletRes = await getWallet(userId)
    if (walletRes.error) throw walletRes.error
    if (!walletRes.data) throw new Error('Wallet not found')

    const wallet = walletRes.data

    // Update wallet
    const { data: updatedWallet, error: updateError } = await supabase
      .from('wallets')
      .update({
        available_balance: wallet.available_balance + amount,
      })
      .eq('id', wallet.id)
      .select('*')
      .single()

    if (updateError) throw updateError
    if (!updatedWallet) throw new Error('Failed to update wallet')

    // Create transaction record
    const { error: transError } = await supabase.from('transactions').insert([
      {
        wallet_id: wallet.id,
        type: 'top_up' as TransactionType,
        amount,
        description,
      },
    ])

    if (transError) throw transError

    return { data: updatedWallet, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Lock funds by moving from available_balance to locked_balance.
 * Creates transaction record and escrow_hold record.
 */
export async function lockFunds(
  userId: string,
  amount: number,
  contractId: string
): Promise<ApiResponse<Wallet>> {
  try {
    if (amount <= 0) throw new Error('Amount must be positive')

    // Get wallet
    const walletRes = await getWallet(userId)
    if (walletRes.error) throw walletRes.error
    if (!walletRes.data) throw new Error('Wallet not found')

    const wallet = walletRes.data

    // Check sufficient available balance
    if (wallet.available_balance < amount) {
      throw new Error('Insufficient available balance')
    }

    // Update wallet
    const { data: updatedWallet, error: updateError } = await supabase
      .from('wallets')
      .update({
        available_balance: wallet.available_balance - amount,
        locked_balance: wallet.locked_balance + amount,
      })
      .eq('id', wallet.id)
      .select('*')
      .single()

    if (updateError) throw updateError
    if (!updatedWallet) throw new Error('Failed to update wallet')

    // Create transaction record
    const { error: transError } = await supabase.from('transactions').insert([
      {
        wallet_id: wallet.id,
        type: 'lock' as TransactionType,
        amount,
        description: `Funds locked for contract ${contractId}`,
      },
    ])

    if (transError) throw transError

    // Create escrow hold
    const { error: escrowError } = await supabase.from('escrow_holds').insert([
      {
        contract_id: contractId,
        client_wallet_id: wallet.id,
        amount,
        status: 'held',
      },
    ])

    if (escrowError) throw escrowError

    return { data: updatedWallet, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Release funds: decrease locked_balance on one user, increase available_balance on another.
 * Creates transaction records for both wallets.
 * Updates escrow_hold status to 'released'.
 */
export async function releaseFunds(
  fromUserId: string,
  toUserId: string,
  amount: number,
  contractId: string
): Promise<ApiResponse<{ from: Wallet; to: Wallet }>> {
  try {
    if (amount <= 0) throw new Error('Amount must be positive')

    // Get both wallets
    const fromWalletRes = await getWallet(fromUserId)
    if (fromWalletRes.error) throw fromWalletRes.error
    if (!fromWalletRes.data) throw new Error('From wallet not found')

    const toWalletRes = await getWallet(toUserId)
    if (toWalletRes.error) throw toWalletRes.error
    if (!toWalletRes.data) throw new Error('To wallet not found')

    const fromWallet = fromWalletRes.data
    const toWallet = toWalletRes.data

    // Check sufficient locked balance
    if (fromWallet.locked_balance < amount) {
      throw new Error('Insufficient locked balance')
    }

    // Update from wallet (decrease locked)
    const { data: updatedFromWallet, error: fromError } = await supabase
      .from('wallets')
      .update({
        locked_balance: fromWallet.locked_balance - amount,
      })
      .eq('id', fromWallet.id)
      .select('*')
      .single()

    if (fromError) throw fromError
    if (!updatedFromWallet) throw new Error('Failed to update from wallet')

    // Update to wallet (increase available)
    const { data: updatedToWallet, error: toError } = await supabase
      .from('wallets')
      .update({
        available_balance: toWallet.available_balance + amount,
      })
      .eq('id', toWallet.id)
      .select('*')
      .single()

    if (toError) throw toError
    if (!updatedToWallet) throw new Error('Failed to update to wallet')

    // Create transaction records
    const { error: fromTransError } = await supabase.from('transactions').insert([
      {
        wallet_id: fromWallet.id,
        type: 'release' as TransactionType,
        amount,
        description: `Funds released to designer for contract ${contractId}`,
      },
    ])

    if (fromTransError) throw fromTransError

    const { error: toTransError } = await supabase.from('transactions').insert([
      {
        wallet_id: toWallet.id,
        type: 'release' as TransactionType,
        amount,
        description: `Funds received from client for contract ${contractId}`,
      },
    ])

    if (toTransError) throw toTransError

    // Update escrow hold
    const { error: escrowError } = await supabase
      .from('escrow_holds')
      .update({ status: 'released' })
      .eq('contract_id', contractId)
      .eq('status', 'held')

    if (escrowError) throw escrowError

    return {
      data: { from: updatedFromWallet, to: updatedToWallet },
      error: null,
    }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Get transaction history for a wallet.
 */
export async function getTransactions(walletId: string): Promise<ApiListResponse<Transaction>> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('wallet_id', walletId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: err instanceof Error ? err : new Error(String(err)) }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a message in a contract.
 */
export async function sendMessage(
  contractId: string,
  senderId: string,
  content: string
): Promise<ApiResponse<Message>> {
  try {
    if (!content.trim()) throw new Error('Message content cannot be empty')

    const { data, error } = await supabase
      .from('messages')
      .insert([{ contract_id: contractId, sender_id: senderId, content }])
      .select('*')
      .single()

    if (error) throw error
    if (!data) throw new Error('Failed to send message')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Get all messages for a contract.
 */
export async function getMessages(contractId: string): Promise<ApiListResponse<Message>> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: err instanceof Error ? err : new Error(String(err)) }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Add a notification for a user.
 */
export async function addNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType
): Promise<ApiResponse<Notification>> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          title,
          message,
          type,
          is_read: false,
        },
      ])
      .select('*')
      .single()

    if (error) throw error
    if (!data) throw new Error('Failed to create notification')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Get all notifications for a user.
 */
export async function getNotifications(userId: string): Promise<ApiListResponse<Notification>> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Mark a notification as read.
 */
export async function markNotificationRead(id: string): Promise<ApiResponse<Notification>> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    if (!data) throw new Error('Notification not found')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPUTE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a dispute for a contract.
 */
export async function createDispute(
  contractId: string,
  raisedBy: string,
  reason: string
): Promise<ApiResponse<Dispute>> {
  try {
    const { data, error } = await supabase
      .from('disputes')
      .insert([
        {
          contract_id: contractId,
          raised_by: raisedBy,
          reason,
          status: 'open',
        },
      ])
      .select('*')
      .single()

    if (error) throw error
    if (!data) throw new Error('Failed to create dispute')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Get all disputes (admin view).
 */
export async function getDisputes(): Promise<ApiListResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('disputes')
      .select(
        `*,
        contracts!disputes_contract_id_fkey(id, project_id, client_id, designer_id),
        raised_by_user:profiles!disputes_raised_by_fkey(id, name, avatar_url)`
      )
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Update a dispute.
 */
export async function updateDispute(
  id: string,
  updates: Partial<Dispute>
): Promise<ApiResponse<Dispute>> {
  try {
    const { data, error } = await supabase
      .from('disputes')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    if (!data) throw new Error('Dispute not found')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PORTFOLIO FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a portfolio item.
 */
export async function createPortfolioItem(
  item: Omit<PortfolioItem, 'id' | 'created_at'>
): Promise<ApiResponse<PortfolioItem>> {
  try {
    const { data, error } = await supabase
      .from('portfolio_items')
      .insert([item])
      .select('*')
      .single()

    if (error) throw error
    if (!data) throw new Error('Failed to create portfolio item')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Get all portfolio items for a designer.
 */
export async function getPortfolioItems(designerId: string): Promise<ApiListResponse<PortfolioItem>> {
  try {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('designer_id', designerId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: err instanceof Error ? err : new Error(String(err)) }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MRR (MATERIAL REQUIREMENTS RECORD) FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create an MRR record for a milestone.
 */
export async function createMRR(
  milestoneId: string,
  checklistItems: string[]
): Promise<ApiResponse<MRRRecord>> {
  try {
    const { data, error } = await supabase
      .from('mrr_records')
      .insert([
        {
          milestone_id: milestoneId,
          checklist_items: checklistItems,
          bom_uploaded: false,
          admin_approved: false,
        },
      ])
      .select('*')
      .single()

    if (error) throw error
    if (!data) throw new Error('Failed to create MRR record')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Update an MRR record.
 */
export async function updateMRR(
  id: string,
  updates: Partial<MRRRecord>
): Promise<ApiResponse<MRRRecord>> {
  try {
    const { data, error } = await supabase
      .from('mrr_records')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    if (!data) throw new Error('MRR record not found')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}
