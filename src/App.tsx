// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Main App Component with Routing
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useStore } from './lib/store'
import { supabase } from './lib/supabase'
import * as api from './lib/api'

// ── Page Imports ──────────────────────────────────────────────────────────────

import Splash from './pages/Splash'
import Onboarding from './pages/Onboarding'
import Auth from './pages/Auth'
import RoleSelection from './pages/RoleSelection'

// Client pages
import ClientHome from './pages/client/ClientHome'
import BrowseDesigners from './pages/client/BrowseDesigners'
import DesignerProfile from './pages/client/DesignerProfile'
import PostBrief from './pages/client/PostBrief'
import Proposals from './pages/client/Proposals'
import ContractDetail from './pages/client/ContractDetail'
import ClientWallet from './pages/client/ClientWallet'
import ProjectsList from './pages/client/ProjectsList'
import ClientProfile from './pages/client/ClientProfile'
import ChatList from './pages/client/ChatList'

// Designer pages
import DesignerHome from './pages/designer/DesignerHome'
import MyPortfolio from './pages/designer/MyPortfolio'
import DesignerContracts from './pages/designer/DesignerContracts'
import MilestoneWorkspace from './pages/designer/MilestoneWorkspace'
import DesignerWallet from './pages/designer/DesignerWallet'
import DesignerProfileScreen from './pages/designer/DesignerProfileScreen'
import ProposalForm from './pages/designer/ProposalForm'
import DesignerRegistration from './pages/designer/DesignerRegistration'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'

// Shared pages
import Chat from './pages/shared/Chat'
import Notifications from './pages/shared/Notifications'
import Profile from './pages/shared/Profile'
import DisputeForm from './pages/shared/DisputeForm'
import InquiryChat from './pages/shared/InquiryChat'

// ── Protected Route ───────────────────────────────────────────────────────────

interface ProtectedRouteProps {
  children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return <>{children}</>
}

// ── App Routes ────────────────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public routes ───────────────────────────────────────────────── */}
      <Route path="/" element={<Splash />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/role-selection" element={<RoleSelection />} />

      {/* ── Client routes ───────────────────────────────────────────────── */}
      <Route
        path="/client/dashboard"
        element={
          <ProtectedRoute>
            <ClientHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/browse"
        element={
          <ProtectedRoute>
            <BrowseDesigners />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/designer/:designerId"
        element={
          <ProtectedRoute>
            <DesignerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/post-brief"
        element={
          <ProtectedRoute>
            <PostBrief />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/proposals/:projectId"
        element={
          <ProtectedRoute>
            <Proposals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/contract/:contractId"
        element={
          <ProtectedRoute>
            <ContractDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/wallet"
        element={
          <ProtectedRoute>
            <ClientWallet />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/projects"
        element={
          <ProtectedRoute>
            <ProjectsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/profile"
        element={
          <ProtectedRoute>
            <ClientProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/messages"
        element={
          <ProtectedRoute>
            <ChatList />
          </ProtectedRoute>
        }
      />

      {/* ── Designer routes ─────────────────────────────────────────────── */}
      <Route
        path="/designer/dashboard"
        element={
          <ProtectedRoute>
            <DesignerHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/designer/portfolio"
        element={
          <ProtectedRoute>
            <MyPortfolio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/designer/contracts"
        element={
          <ProtectedRoute>
            <DesignerContracts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/designer/workspace/:contractId"
        element={
          <ProtectedRoute>
            <MilestoneWorkspace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/designer/wallet"
        element={
          <ProtectedRoute>
            <DesignerWallet />
          </ProtectedRoute>
        }
      />
      <Route
        path="/designer/profile"
        element={
          <ProtectedRoute>
            <DesignerProfileScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/designer/proposal/:projectId"
        element={
          <ProtectedRoute>
            <ProposalForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/designer/register"
        element={
          <ProtectedRoute>
            <DesignerRegistration />
          </ProtectedRoute>
        }
      />

      {/* ── Admin routes ────────────────────────────────────────────────── */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ── Shared routes ───────────────────────────────────────────────── */}
      <Route
        path="/chat/:contractId"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dispute/:contractId"
        element={
          <ProtectedRoute>
            <DisputeForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inquiry/:designerId"
        element={
          <ProtectedRoute>
            <InquiryChat />
          </ProtectedRoute>
        }
      />

      {/* ── Catch-all ───────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// ── Root App ──────────────────────────────────────────────────────────────────

export default function App() {
  const darkMode = useStore((s) => s.darkMode)
  const setUser = useStore((s) => s.setUser)
  const setProfile = useStore((s) => s.setProfile)
  const loadInitialData = useStore((s) => s.loadInitialData)

  // Sync Supabase auth state with Zustand store
  useEffect(() => {
    // Check for existing session on mount (page reload / tab restore)
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await api.getCurrentProfile()
        if (profile) {
          const user = {
            id: profile.id,
            phone: profile.phone ?? '',
            name: profile.name,
            username: profile.username ?? null,
            role: profile.role as 'client' | 'designer' | 'admin',
            avatar_url: profile.avatar_url ?? null,
            created_at: profile.created_at ?? new Date().toISOString(),
          }
          setUser(user)

          if (user.role === 'designer') {
            const { data: dp } = await api.getDesignerProfile(user.id)
            if (dp) setProfile(dp as any)
          }

          await loadInitialData(user.id)
        }
      }
    }
    initSession()

    // IMPORTANT: Never call supabase.auth.* inside onAuthStateChange — the
    // Supabase client holds an internal lock while firing this event, so calling
    // getSession() / signIn() etc. from here deadlocks signInWithPassword() and
    // causes the login button to spin forever.
    //
    // Instead: read userId from the session argument directly, query our DB, and
    // defer all async work with setTimeout so signInWithPassword() can finish first.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userId = session.user.id
          setTimeout(async () => {
            // The explicit login/signup flows already call setUser() before
            // navigating — skip here to avoid a race condition.
            if (useStore.getState().isAuthenticated) return

            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single()

            if (profile) {
              const user = {
                id: profile.id,
                phone: profile.phone ?? '',
                name: profile.name,
                username: profile.username ?? null,
                role: profile.role as 'client' | 'designer' | 'admin',
                avatar_url: profile.avatar_url ?? null,
                created_at: profile.created_at ?? new Date().toISOString(),
              }
              setUser(user)
              if (user.role === 'designer') {
                const { data: dp } = await api.getDesignerProfile(user.id)
                if (dp) setProfile(dp as any)
              }
              await loadInitialData(user.id)
            }
          }, 0)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={darkMode ? 'dark' : ''}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  )
}
