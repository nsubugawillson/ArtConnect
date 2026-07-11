// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – User Profile Screen
// Route: /profile
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Briefcase, Clock, MapPin, ChevronRight, LogOut, RotateCcw, Eye, CreditCard as Edit3, Bell, Lock, User, Shield } from 'lucide-react'
import { useStore } from '../../lib/store'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatUGX } from '../../lib/utils'

// ── Specialization Labels ─────────────────────────────────────────────────────

const specializationLabels: Record<string, string> = {
  graphic: 'Graphic Design',
  industrial: 'Industrial Design',
  branding: 'Branding',
  ui_ux: 'UI/UX Design',
  motion: 'Motion Design',
  packaging: 'Packaging',
}

// ── Toggle Row ────────────────────────────────────────────────────────────────

interface ToggleRowProps {
  label: string
  description?: string
  value: boolean
  onChange: (v: boolean) => void
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, description, value, onChange }) => (
  <div className="flex items-center justify-between py-3.5 px-4">
    <div className="flex-1 min-w-0 pr-4">
      <p className="font-inter text-sm font-medium text-charcoal-900">{label}</p>
      {description && (
        <p className="font-inter text-xs text-mist-400 mt-0.5">{description}</p>
      )}
    </div>
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={[
        'relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper-700 focus-visible:ring-offset-2 shrink-0',
        value ? 'gradient-copper' : 'bg-mist-200',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 mt-0.5',
          value ? 'translate-x-5' : 'translate-x-0.5',
        ].join(' ')}
      />
    </button>
  </div>
)

// ── Settings Row ──────────────────────────────────────────────────────────────

interface SettingsRowProps {
  icon: React.ReactNode
  label: string
  description?: string
  onClick?: () => void
  danger?: boolean
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  label,
  description,
  onClick,
  danger = false,
}) => (
  <button
    onClick={onClick}
    className={[
      'w-full flex items-center gap-3 px-4 py-3.5 transition-colors duration-150 text-left',
      danger
        ? 'hover:bg-red-50 active:bg-red-100'
        : 'hover:bg-mist-50 active:bg-mist-100',
    ].join(' ')}
  >
    <div
      className={[
        'flex-none flex items-center justify-center w-9 h-9 rounded-xl',
        danger ? 'bg-red-50' : 'bg-mist-100',
      ].join(' ')}
    >
      <span className={danger ? 'text-red-500' : 'text-charcoal-900/60'}>
        {icon}
      </span>
    </div>
    <div className="flex-1 min-w-0">
      <p
        className={[
          'font-inter text-sm font-medium',
          danger ? 'text-red-600' : 'text-charcoal-900',
        ].join(' ')}
      >
        {label}
      </p>
      {description && (
        <p className="font-inter text-xs text-mist-400 mt-0.5">{description}</p>
      )}
    </div>
    {!danger && (
      <ChevronRight size={16} className="text-mist-300 shrink-0" strokeWidth={2} />
    )}
  </button>
)

// ── Section Card ──────────────────────────────────────────────────────────────

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mx-4 mb-4">
    <p className="font-grotesk text-xs font-semibold text-mist-400 uppercase tracking-wider mb-2 px-1">
      {title}
    </p>
    <div className="bg-white rounded-2xl border border-mist-100 shadow-sm overflow-hidden divide-y divide-mist-100">
      {children}
    </div>
  </div>
)

// ── Main Component ────────────────────────────────────────────────────────────

export default function Profile() {
  const navigate = useNavigate()
  const user = useStore((s) => s.user)
  const profile = useStore((s) => s.profile)
  const designers = useStore((s) => s.designers)
  const logout = useStore((s) => s.logout)
  const initializeDemoData = useStore((s) => s.initializeDemoData)

  // Notification preference toggles
  const [notifPrefs, setNotifPrefs] = useState({
    milestones: true,
    payments: true,
    messages: true,
    disputes: true,
    marketing: false,
  })

  const updatePref = (key: keyof typeof notifPrefs) => (val: boolean) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: val }))
  }

  // Find the designer profile from the store (populated by initializeDemoData)
  const designerProfile =
    profile ??
    (user?.role === 'designer'
      ? designers.find((d) => d.user_id === user.id) ?? null
      : null)

  const isDesigner = user?.role === 'designer'

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  const handleResetDemoData = () => {
    initializeDemoData()
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-mist-100">
        <p className="font-inter text-mist-400">Not authenticated.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-mist-100 max-w-2xl mx-auto pb-8">
      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <div className="relative">
        {/* Cover gradient */}
        <div className="h-32 gradient-copper" />

        {/* Avatar + name card */}
        <div className="px-4 pb-4">
          <div className="bg-white rounded-2xl border border-mist-100 shadow-sm px-5 pb-5 -mt-12 pt-16 relative">
            {/* Avatar */}
            <div className="absolute -top-10 left-5">
              <Avatar
                src={
                  isDesigner && designerProfile
                    ? (designerProfile as any).avatar_url ?? user.avatar_url
                    : user.avatar_url
                }
                name={user.name}
                size="xl"
                ring
                className="border-4 border-white shadow-xl"
              />
            </div>

            {/* Edit button */}
            {isDesigner && (
              <div className="absolute top-3 right-4 flex gap-2">
                <button
                  onClick={() => navigate('/designer/portfolio')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-mist-200 bg-mist-50 hover:bg-mist-100 transition-colors font-inter text-xs font-medium text-charcoal-900"
                >
                  <Eye size={13} strokeWidth={2} />
                  Portfolio
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-copper-700/30 bg-copper-50 hover:bg-copper-100 transition-colors font-inter text-xs font-medium text-copper-700">
                  <Edit3 size={13} strokeWidth={2} />
                  Edit
                </button>
              </div>
            )}

            {/* Name + role */}
            <h1 className="font-grotesk text-xl font-bold text-charcoal-900">{user.name}</h1>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge
                variant={
                  user.role === 'client'
                    ? 'info'
                    : user.role === 'designer'
                    ? 'copper'
                    : 'mist'
                }
                size="sm"
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>

              {isDesigner && designerProfile?.is_vetted && (
                <Badge variant="success" size="sm">
                  Vetted
                </Badge>
              )}
            </div>

            <p className="font-inter text-sm text-mist-500 mt-1.5">{user.phone}</p>

            {/* Designer bio */}
            {isDesigner && designerProfile?.bio && (
              <p className="font-inter text-sm text-charcoal-900/70 mt-3 leading-relaxed">
                {designerProfile.bio}
              </p>
            )}

            {/* Designer specializations */}
            {isDesigner && designerProfile?.specializations && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {designerProfile.specializations.map((spec) => (
                  <Badge key={spec} variant="mist" size="sm">
                    {specializationLabels[spec] ?? spec}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Designer Stats ─────────────────────────────────────────────────── */}
      {isDesigner && designerProfile && (
        <div className="px-4 mb-4">
          <div className="bg-white rounded-2xl border border-mist-100 shadow-sm p-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Rating */}
              <div className="flex flex-col items-center gap-1 py-2">
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-amber-400 fill-amber-400" strokeWidth={0} />
                  <span className="font-grotesk font-bold text-lg text-charcoal-900">
                    {designerProfile.rating > 0 ? designerProfile.rating.toFixed(1) : '—'}
                  </span>
                </div>
                <p className="font-inter text-[11px] text-mist-400">Rating</p>
              </div>

              {/* Projects */}
              <div className="flex flex-col items-center gap-1 py-2 border-x border-mist-100">
                <div className="flex items-center gap-1">
                  <Briefcase size={14} className="text-copper-700" strokeWidth={2} />
                  <span className="font-grotesk font-bold text-lg text-charcoal-900">
                    {designerProfile.completed_projects}
                  </span>
                </div>
                <p className="font-inter text-[11px] text-mist-400">Completed</p>
              </div>

              {/* Hourly rate */}
              <div className="flex flex-col items-center gap-1 py-2">
                <div className="flex items-center gap-1">
                  <Clock size={14} className="text-copper-700" strokeWidth={2} />
                  <span className="font-grotesk font-bold text-sm text-charcoal-900">
                    {formatUGX(designerProfile.hourly_rate)}/hr
                  </span>
                </div>
                <p className="font-inter text-[11px] text-mist-400">Hourly Rate</p>
              </div>
            </div>

            {/* Location */}
            {designerProfile.location && (
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-mist-100">
                <MapPin size={13} className="text-mist-400 shrink-0" strokeWidth={2} />
                <p className="font-inter text-xs text-mist-400">{designerProfile.location}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Account Settings ────────────────────────────────────────────────── */}
      <SectionCard title="Account Settings">
        <SettingsRow
          icon={<User size={16} strokeWidth={2} />}
          label="Edit Profile"
          description="Update your name, phone, and avatar"
          onClick={() => {}}
        />
        <SettingsRow
          icon={<Shield size={16} strokeWidth={2} />}
          label="Verification"
          description="ID verification and trust badges"
          onClick={() => {}}
        />
        <SettingsRow
          icon={<Lock size={16} strokeWidth={2} />}
          label="Privacy & Security"
          description="Manage data access and login security"
          onClick={() => {}}
        />
      </SectionCard>

      {/* ── Notification Preferences ─────────────────────────────────────────── */}
      <SectionCard title="Notification Preferences">
        <ToggleRow
          label="Milestone Updates"
          description="When a milestone is submitted or approved"
          value={notifPrefs.milestones}
          onChange={updatePref('milestones')}
        />
        <ToggleRow
          label="Payments"
          description="When funds are released or received"
          value={notifPrefs.payments}
          onChange={updatePref('payments')}
        />
        <ToggleRow
          label="Messages"
          description="New messages in your contracts"
          value={notifPrefs.messages}
          onChange={updatePref('messages')}
        />
        <ToggleRow
          label="Disputes"
          description="Alerts for disputes on your contracts"
          value={notifPrefs.disputes}
          onChange={updatePref('disputes')}
        />
        <ToggleRow
          label="Marketing & Updates"
          description="ArtConnect product news and tips"
          value={notifPrefs.marketing}
          onChange={updatePref('marketing')}
        />
        <ToggleRow
          label="Dark Mode"
          description="Switch between light and dark themes"
          value={useStore((s) => s.darkMode)}
          onChange={(val) => {
            if (val !== useStore((s) => s.darkMode)) {
              useStore((s) => s.toggleDarkMode)()
            }
          }}
        />
      </SectionCard>

      {/* ── Demo Data ───────────────────────────────────────────────────────── */}
      <SectionCard title="Demo Data">
        <div className="px-4 py-4">
          <p className="font-inter text-xs text-mist-400 mb-3">
            Reset all demo data to its initial state. This re-seeds designers, projects, contracts, messages and notifications.
          </p>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCcw size={14} strokeWidth={2} />}
            onClick={handleResetDemoData}
          >
            Reset Demo Data
          </Button>
        </div>
      </SectionCard>

      {/* ── Logout ──────────────────────────────────────────────────────────── */}
      <div className="mx-4 mt-2">
        <div className="bg-white rounded-2xl border border-mist-100 shadow-sm overflow-hidden">
          <SettingsRow
            icon={<LogOut size={16} strokeWidth={2} />}
            label="Log Out"
            description="Sign out of your account"
            onClick={handleLogout}
            danger
          />
        </div>
      </div>

      {/* App version */}
      <p className="font-inter text-[11px] text-mist-300 text-center mt-6">
        ArtConnect.Ug · v1.0.0-demo
      </p>
    </div>
  )
}
