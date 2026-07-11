// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Zustand Global Store (Supabase-backed)
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  User,
  UserRole,
  DesignerProfile,
  Project,
  Contract,
  Milestone,
  Notification,
  Message,
  Wallet,
  NotificationType,
  MilestoneStatus,
  Deliverable,
} from './types'
import * as api from './api'

// ── Extended DesignerProfile with display fields ──────────────────────────────

export interface DesignerWithUser extends DesignerProfile {
  name: string
  phone: string
  avatar_url: string | null
  cover_image: string
}

export type WalletMap = Record<string, Wallet>

// ─────────────────────────────────────────────────────────────────────────────
// Slice interfaces
// ─────────────────────────────────────────────────────────────────────────────

interface AuthSlice {
  user: User | null
  profile: DesignerProfile | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: DesignerProfile | null) => void
  logout: () => void
}

interface DataSlice {
  designers: DesignerWithUser[]
  projects: Project[]
  contracts: Contract[]
  milestones: Milestone[]
  notifications: Notification[]
  messages: Message[]
  wallets: WalletMap
}

interface UISlice {
  isLoading: boolean
  isDataLoaded: boolean
  currentContractId: string | null
  darkMode: boolean
  lastError: string | null
  setCurrentContractId: (id: string | null) => void
  toggleDarkMode: () => void
  setError: (msg: string | null) => void
}

interface ActionsSlice {
  initializeDemoData: () => void
  loadInitialData: (userId?: string) => Promise<void>
  topUpWallet: (userId: string, amount: number) => Promise<void>
  lockFunds: (userId: string, amount: number, contractId?: string) => Promise<void>
  releaseFunds: (fromUserId: string, toUserId: string, amount: number, contractId?: string) => Promise<void>
  addNotification: (userId: string, title: string, message: string, type: NotificationType) => Promise<void>
  addMessage: (contractId: string, senderId: string, content: string) => Promise<void>
  updateMilestoneStatus: (milestoneId: string, status: MilestoneStatus) => Promise<void>
  approveMilestone: (milestoneId: string) => Promise<void>
  submitMilestone: (milestoneId: string, deliverables: Deliverable[]) => Promise<void>
  completeContract: (contractId: string) => Promise<void>
  createProject: (project: Omit<Project, 'id' | 'created_at'>) => Promise<Project | null>
  createProposal: (proposal: api.ProposalInput) => Promise<string | null>
  createContract: (contract: Omit<Contract, 'id' | 'created_at'>, milestoneDefs: Array<Omit<Milestone, 'id' | 'created_at'>>) => Promise<Contract | null>
  updateProjectStatus: (id: string, status: Project['status']) => Promise<void>
  markNotificationRead: (id: string) => Promise<void>
  createDispute: (contractId: string, raisedBy: string, reason: string) => Promise<void>
}

// Legacy selectors support
interface LegacySlice {
  currentUser: User | null
  designerProfile: DesignerProfile | null
  users: User[]
  setCurrentUser: (user: User | null) => void
  setIsLoading: (loading: boolean) => void
  setDesignerProfile: (profile: DesignerProfile | null) => void
  addUser: (user: User) => void
  getUserById: (id: string) => User | undefined
  getUserByPhone: (phone: string) => User | undefined
}

type AppStore = AuthSlice & DataSlice & UISlice & ActionsSlice & LegacySlice

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

export const useStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      // ── AuthSlice ────────────────────────────────────────────────────────────
      user: null,
      profile: null,
      isAuthenticated: false,

      setUser: (user) =>
        set(
          { user, isAuthenticated: !!user, currentUser: user },
          false,
          'auth/setUser'
        ),

      setProfile: (profile) =>
        set({ profile, designerProfile: profile }, false, 'auth/setProfile'),

      logout: () => {
        api.signOut()
        set(
          {
            user: null,
            currentUser: null,
            profile: null,
            designerProfile: null,
            isAuthenticated: false,
            designers: [],
            projects: [],
            contracts: [],
            milestones: [],
            notifications: [],
            messages: [],
            wallets: {},
            isDataLoaded: false,
          },
          false,
          'auth/logout'
        )
      },

      // ── DataSlice ────────────────────────────────────────────────────────────
      designers: [],
      projects: [],
      contracts: [],
      milestones: [],
      notifications: [],
      messages: [],
      wallets: {},

      // ── UISlice ──────────────────────────────────────────────────────────────
      isLoading: false,
      isDataLoaded: false,
      currentContractId: null,
      darkMode: localStorage.getItem('darkMode') === 'true',
      lastError: null,

      setCurrentContractId: (id) =>
        set({ currentContractId: id }, false, 'ui/setCurrentContractId'),

      toggleDarkMode: () =>
        set(
          (state) => {
            const next = !state.darkMode
            localStorage.setItem('darkMode', String(next))
            return { darkMode: next }
          },
          false,
          'ui/toggleDarkMode'
        ),

      setError: (msg) => set({ lastError: msg }, false, 'ui/setError'),

      // ── ActionsSlice ─────────────────────────────────────────────────────────

      initializeDemoData: () => {
        const user = get().user
        get().loadInitialData(user?.id)
      },

      loadInitialData: async (userId) => {
        const { isDataLoaded, isLoading } = get()
        // Guard against concurrent calls (login flow + onAuthStateChange firing simultaneously)
        if (isDataLoaded || isLoading) return
        set({ isLoading: true }, false, 'data/loading')

        try {
          const [designersRes, projectsRes, notificationsRes] = await Promise.all([
            api.getDesigners(),
            api.getProjects(),
            userId ? api.getNotifications(userId) : { data: [], error: null },
          ])

          const designers: DesignerWithUser[] = (designersRes.data ?? []).map(
            (d: any) => ({
              id: d.id,
              user_id: d.user_id,
              bio: d.bio ?? '',
              specializations: d.specializations ?? [],
              is_vetted: d.is_vetted ?? false,
              portfolio_images: [],
              rating: Number(d.rating ?? 0),
              completed_projects: d.completed_projects ?? 0,
              hourly_rate: d.hourly_rate ?? 0,
              location: d.location ?? 'Kampala, Uganda',
              name: d.profiles?.name ?? '',
              phone: d.profiles?.phone ?? '',
              avatar_url: d.profiles?.avatar_url ?? null,
              cover_image:
                d.profiles?.avatar_url ??
                'https://images.unsplash.com/photo-1541701494672-9d96629bd31c?w=800&auto=format&fit=crop',
            })
          )

          const projects: Project[] = (projectsRes.data ?? []).map((p: any) => ({
            id: p.id,
            client_id: p.client_id,
            title: p.title,
            description: p.description ?? '',
            category: p.category,
            budget: p.budget,
            requires_mrr: p.requires_mrr ?? false,
            status: p.status,
            created_at: p.created_at,
            deadline: p.deadline,
          }))

          const notifications: Notification[] = (notificationsRes.data ?? []).map(
            (n: any) => ({
              id: n.id,
              user_id: n.user_id,
              title: n.title,
              message: n.message,
              type: n.type as NotificationType,
              is_read: n.is_read ?? false,
              created_at: n.created_at,
            })
          )

          // Load user-specific data if logged in
          let contracts: Contract[] = []
          let milestones: Milestone[] = []
          let messages: Message[] = []
          let wallets: WalletMap = {}

          if (userId) {
            const [contractsRes, walletRes] = await Promise.all([
              api.getContractsForUser(userId),
              api.getWallet(userId),
            ])

            contracts = (contractsRes.data ?? []).map((c: any) => ({
              id: c.id,
              project_id: c.project_id,
              client_id: c.client_id,
              designer_id: c.designer_id,
              agreed_amount: c.agreed_amount,
              status: c.status as Contract['status'],
              created_at: c.created_at,
            }))

            // Load milestones for all contracts
            const milestoneResults = await Promise.all(
              contracts.map((c) => api.getMilestonesForContract(c.id))
            )
            milestones = milestoneResults.flatMap((r) =>
              (r.data ?? []).map((m: any) => ({
                id: m.id,
                contract_id: m.contract_id,
                title: m.title,
                description: m.description ?? '',
                amount: m.amount,
                status: m.status as MilestoneStatus,
                due_date: m.due_date,
                order_index: m.order_index,
                mrr_required: m.mrr_required ?? false,
                created_at: m.created_at,
              }))
            )

            // Load messages for all contracts
            const messageResults = await Promise.all(
              contracts.map((c) => api.getMessages(c.id))
            )
            messages = messageResults.flatMap((r) =>
              (r.data ?? []).map((m: any) => ({
                id: m.id,
                contract_id: m.contract_id,
                sender_id: m.sender_id,
                content: m.content,
                created_at: m.created_at,
              }))
            )

            if (walletRes.data) {
              const w = walletRes.data as any
              wallets[userId] = {
                id: w.id,
                user_id: w.user_id,
                available_balance: w.available_balance,
                locked_balance: w.locked_balance,
                currency: w.currency ?? 'UGX',
              }
            }
          }

          set(
            {
              designers,
              projects,
              contracts,
              milestones,
              notifications,
              messages,
              wallets,
              isDataLoaded: true,
              isLoading: false,
            },
            false,
            'data/loaded'
          )
        } catch (err) {
          console.error('Failed to load initial data:', err)
          set({ isLoading: false, lastError: 'Failed to load data' }, false, 'data/error')
        }
      },

      topUpWallet: async (userId, amount) => {
        try {
          const { error } = await api.topUpWallet(userId, amount, 'Wallet top-up via MTN MoMo')
          if (error) {
            set({ lastError: error.message }, false, 'wallet/topUpError')
            return
          }
          // Refresh wallet from DB
          const { data: w } = await api.getWallet(userId)
          if (w) {
            set(
              (state) => ({
                wallets: { ...state.wallets, [userId]: w as Wallet },
              }),
              false,
              'wallet/topUp'
            )
          }
          await get().addNotification(userId, 'Wallet Topped Up', `UGX ${amount.toLocaleString()} added to your wallet.`, 'payment')
        } catch (err) {
          set({ lastError: 'Top-up failed' }, false, 'wallet/topUpError')
        }
      },

      lockFunds: async (userId, amount, contractId) => {
        const wallet = get().wallets[userId]
        if (!wallet || wallet.available_balance < amount) {
          set({ lastError: 'Insufficient balance' }, false, 'wallet/lockError')
          return
        }

        // Optimistic update
        set(
          (state) => ({
            wallets: {
              ...state.wallets,
              [userId]: {
                ...wallet,
                available_balance: wallet.available_balance - amount,
                locked_balance: wallet.locked_balance + amount,
              },
            },
          }),
          false,
          'wallet/lockOptimistic'
        )

        try {
          const { error } = await api.lockFunds(userId, amount, contractId ?? '')
          if (error) {
            // Rollback
            set(
              (state) => ({
                wallets: { ...state.wallets, [userId]: wallet },
              }),
              false,
              'wallet/lockRollback'
            )
            set({ lastError: error.message }, false, 'wallet/lockError')
            return
          }
        } catch (err) {
          // Rollback
          set(
            (state) => ({
              wallets: { ...state.wallets, [userId]: wallet },
            }),
            false,
            'wallet/lockRollback'
          )
          set({ lastError: 'Failed to lock funds' }, false, 'wallet/lockError')
        }
      },

      releaseFunds: async (fromUserId, toUserId, amount, contractId) => {
        try {
          const { error } = await api.releaseFunds(fromUserId, toUserId, amount, contractId ?? '')
          if (error) {
            set({ lastError: error.message }, false, 'wallet/releaseError')
            return
          }
          // Refresh both wallets
          const [fromRes, toRes] = await Promise.all([
            api.getWallet(fromUserId),
            api.getWallet(toUserId),
          ])
          set(
            (state) => ({
              wallets: {
                ...state.wallets,
                ...(fromRes.data ? { [fromUserId]: fromRes.data as Wallet } : {}),
                ...(toRes.data ? { [toUserId]: toRes.data as Wallet } : {}),
              },
            }),
            false,
            'wallet/release'
          )
        } catch (err) {
          set({ lastError: 'Failed to release funds' }, false, 'wallet/releaseError')
        }
      },

      addNotification: async (userId, title, message, type) => {
        try {
          const { data } = await api.addNotification(userId, title, message, type)
          if (data) {
            set(
              (state) => ({
                notifications: [data as Notification, ...state.notifications],
              }),
              false,
              'notifications/add'
            )
          }
        } catch {
          // Non-critical, silently fail
        }
      },

      addMessage: async (contractId, senderId, content) => {
        try {
          const { data } = await api.sendMessage(contractId, senderId, content)
          if (data) {
            set(
              (state) => ({
                messages: [...state.messages, data as Message],
              }),
              false,
              'messages/add'
            )
          }
        } catch {
          // Non-critical
        }
      },

      updateMilestoneStatus: async (milestoneId, status) => {
        try {
          const { data } = await api.updateMilestoneStatus(milestoneId, status)
          if (data) {
            set(
              (state) => ({
                milestones: state.milestones.map((m) =>
                  m.id === milestoneId ? { ...m, status } : m
                ),
              }),
              false,
              'milestone/updateStatus'
            )
          }
        } catch {
          set({ lastError: 'Failed to update milestone' }, false, 'milestone/error')
        }
      },

      approveMilestone: async (milestoneId) => {
        const state = get()
        const milestone = state.milestones.find((m) => m.id === milestoneId)
        if (!milestone) return
        const contract = state.contracts.find((c) => c.id === milestone.contract_id)
        if (!contract) return

        // Update milestone status
        await get().updateMilestoneStatus(milestoneId, 'approved')

        // Release funds from client escrow to designer wallet
        await get().releaseFunds(contract.client_id, contract.designer_id, milestone.amount, contract.id)

        // Notify both parties
        await get().addNotification(
          contract.designer_id,
          'Milestone Approved!',
          `"${milestone.title}" approved. UGX ${milestone.amount.toLocaleString()} released to your wallet. Design files released to client.`,
          'payment'
        )
        await get().addNotification(
          contract.client_id,
          'Milestone Approved',
          `"${milestone.title}" approved. Design files are now available to you. UGX ${milestone.amount.toLocaleString()} released from escrow.`,
          'payment'
        )

        // Check if ALL milestones are now approved
        const contractMilestones = get().milestones.filter(
          (m) => m.contract_id === contract.id
        )
        const allApproved =
          contractMilestones.length > 0 &&
          contractMilestones.every((m) => m.status === 'approved')

        if (allApproved) {
          await get().completeContract(contract.id)
        }
      },

      submitMilestone: async (milestoneId, _deliverables) => {
        await get().updateMilestoneStatus(milestoneId, 'submitted')
      },

      completeContract: async (contractId) => {
        const state = get()
        const contract = state.contracts.find((c) => c.id === contractId)
        if (!contract) return

        // Release any remaining locked escrow balance
        const clientWallet = state.wallets[contract.client_id]
        if (clientWallet && clientWallet.locked_balance > 0) {
          await get().releaseFunds(contract.client_id, contract.designer_id, clientWallet.locked_balance, contractId)
        }

        // Mark contract as completed in DB
        await api.updateContractStatus(contractId, 'completed')

        // Update local state
        set(
          (state) => ({
            contracts: state.contracts.map((c) =>
              c.id === contractId ? { ...c, status: 'completed' as const } : c
            ),
          }),
          false,
          'contract/complete'
        )

        // Notify both parties
        await get().addNotification(
          contract.designer_id,
          'Contract Completed!',
          'Full escrow balance has been released to your wallet. All design files delivered. Thank you!',
          'payment'
        )
        await get().addNotification(
          contract.client_id,
          'Project Complete',
          'All milestones approved, full escrow released, and all design files are now yours. Consider leaving a review!',
          'payment'
        )
      },

      createProject: async (projectInput) => {
        try {
          const { data, error } = await api.createProject(projectInput as any)
          if (error || !data) {
            set({ lastError: error?.message ?? 'Failed to create project' }, false, 'project/createError')
            return null
          }
          const project = data as Project
          set(
            (state) => ({ projects: [...state.projects, project] }),
            false,
            'project/created'
          )
          return project
        } catch {
          set({ lastError: 'Failed to create project' }, false, 'project/createError')
          return null
        }
      },

      createProposal: async (proposalInput) => {
        try {
          const { data, error } = await api.createProposal(proposalInput)
          if (error || !data) {
            set({ lastError: error?.message ?? 'Failed to submit proposal' }, false, 'proposal/createError')
            return null
          }
          return (data as any).id as string
        } catch {
          set({ lastError: 'Failed to submit proposal' }, false, 'proposal/createError')
          return null
        }
      },

      createContract: async (contractInput, milestoneDefs) => {
        try {
          const { data: contractData, error: contractError } = await api.createContract(contractInput as any)
          if (contractError || !contractData) {
            set({ lastError: contractError?.message ?? 'Failed to create contract' }, false, 'contract/createError')
            return null
          }
          const contract = contractData as Contract

          // Create milestones
          if (milestoneDefs.length > 0) {
            const milestonesWithContract = milestoneDefs.map((m, i) => ({
              ...m,
              contract_id: contract.id,
              order_index: i + 1,
            }))
            await api.createMilestones(milestonesWithContract as any)
          }

          // Update local state
          set(
            (state) => ({
              contracts: [...state.contracts, contract],
            }),
            false,
            'contract/created'
          )
          return contract
        } catch {
          set({ lastError: 'Failed to create contract' }, false, 'contract/createError')
          return null
        }
      },

      updateProjectStatus: async (id, status) => {
        try {
          await api.updateProjectStatus(id, status)
          set(
            (state) => ({
              projects: state.projects.map((p) =>
                p.id === id ? { ...p, status } : p
              ),
            }),
            false,
            'project/updateStatus'
          )
        } catch {
          set({ lastError: 'Failed to update project' }, false, 'project/error')
        }
      },

      markNotificationRead: async (id) => {
        try {
          await api.markNotificationRead(id)
          set(
            (state) => ({
              notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, is_read: true } : n
              ),
            }),
            false,
            'notifications/markRead'
          )
        } catch {
          // Non-critical
        }
      },

      createDispute: async (contractId, raisedBy, reason) => {
        try {
          const { data, error } = await api.createDispute(contractId, raisedBy, reason)
          if (error) {
            set({ lastError: error.message }, false, 'dispute/createError')
            return
          }
          // Update contract status to disputed
          await api.updateContractStatus(contractId, 'disputed')
          set(
            (state) => ({
              contracts: state.contracts.map((c) =>
                c.id === contractId ? { ...c, status: 'disputed' as const } : c
              ),
            }),
            false,
            'dispute/created'
          )
        } catch {
          set({ lastError: 'Failed to create dispute' }, false, 'dispute/createError')
        }
      },

      // ── LegacySlice ─────────────────────────────────────────────────────────
      currentUser: null,
      designerProfile: null,
      users: [],

      setCurrentUser: (user) =>
        set({ currentUser: user, user, isAuthenticated: !!user }, false, 'legacy/setCurrentUser'),

      setIsLoading: (loading) =>
        set({ isLoading: loading }, false, 'legacy/setIsLoading'),

      setDesignerProfile: (profile) =>
        set({ designerProfile: profile, profile }, false, 'legacy/setDesignerProfile'),

      addUser: (user) =>
        set((state) => ({ users: [...state.users, user] }), false, 'legacy/addUser'),

      getUserById: (id) => get().users.find((u) => u.id === id),

      getUserByPhone: (phone) => get().users.find((u) => u.phone === phone),
    }),
    { name: 'ArtConnectStore' }
  )
)

// ─────────────────────────────────────────────────────────────────────────────
// Selectors
// ─────────────────────────────────────────────────────────────────────────────

export const selectCurrentUser = (state: AppStore) => state.currentUser
export const selectIsAuthenticated = (state: AppStore) => state.isAuthenticated
export const selectUserRole = (state: AppStore): UserRole | null =>
  state.currentUser?.role ?? null

export const selectUnreadNotifications =
  (userId: string) =>
  (state: AppStore): Notification[] =>
    state.notifications.filter((n) => n.user_id === userId && !n.is_read)

export const selectContractMessages =
  (contractId: string) =>
  (state: AppStore): Message[] =>
    state.messages.filter((m) => m.contract_id === contractId)

export const selectContractMilestones =
  (contractId: string) =>
  (state: AppStore): Milestone[] =>
    state.milestones
      .filter((m) => m.contract_id === contractId)
      .sort((a, b) => a.order_index - b.order_index)

export const selectUserWallet =
  (userId: string) =>
  (state: AppStore): Wallet | null =>
    state.wallets[userId] ?? null

export const getDashboardPath = (role: UserRole | null): string => {
  switch (role) {
    case 'client':
      return '/client/dashboard'
    case 'designer':
      return '/designer/dashboard'
    case 'admin':
      return '/admin/dashboard'
    default:
      return '/'
  }
}
