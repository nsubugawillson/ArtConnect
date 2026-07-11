// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Designer Profile Screen
// Route: /designer/profile
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut,
  MapPin,
  Briefcase,
  CheckCircle,
  CreditCard as Edit2,
  Camera,
  Shield,
  Star,
  Clock,
  TrendingUp,
  Link as LinkIcon,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import { Header } from '../../components/layout/Header'

// ── Interfaces ────────────────────────────────────────────────────────────────

interface DesignerProfileState {
  name: string
  bio: string
  location: string
  yearsExperience: number
  specializations: string[]
  avatarUrl: string | null
  isAvailable: boolean
}

// ── Specialization Configuration ──────────────────────────────────────────────

const SPECIALIZATIONS = [
  { id: 'graphic', label: 'Graphic Design' },
  { id: 'industrial', label: 'Industrial Design' },
  { id: 'branding', label: 'Branding' },
  { id: 'ui_ux', label: 'UI/UX Design' },
  { id: 'motion', label: 'Motion Design' },
  { id: 'packaging', label: 'Packaging' },
]

// ── Designer Profile Screen ───────────────────────────────────────────────────

export default function DesignerProfileScreen() {
  const navigate = useNavigate()
  const { user, designers, wallets, logout } = useStore((s) => ({
    user: s.user,
    designers: s.designers,
    wallets: s.wallets,
    logout: s.logout,
  }))

  const [editMode, setEditMode] = useState(false)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)

  const designerProfile = designers.find((d) => d.user_id === user?.id)

  const [profileData, setProfileData] = useState<DesignerProfileState>({
    name: user?.name || 'Sarah Nakato',
    bio: designerProfile?.bio || 'Award-winning UI/UX designer crafting digital experiences.',
    location: designerProfile?.location || 'Kampala, Uganda',
    yearsExperience: 6,
    specializations: designerProfile?.specializations || ['ui_ux', 'branding'],
    avatarUrl: user?.avatar_url || 'https://i.pravatar.cc/150?u=sarah.nakato',
    isAvailable: true,
  })

  if (!user) {
    return <Navigate to="/auth" />
  }

  const wallet = wallets[user.id] || { available_balance: 0, locked_balance: 0 }
  const totalEarnings = wallet.available_balance + wallet.locked_balance

  const handleLogout = () => {
    setLogoutModalOpen(false)
    logout()
    navigate('/auth')
  }

  const handleSaveProfile = () => {
    setEditMode(false)
  }

  const toggleSpecialization = (id: string) => {
    setProfileData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(id)
        ? prev.specializations.filter((s) => s !== id)
        : [...prev.specializations, id],
    }))
  }

  // Portfolio preview items
  const portfolioPreviews = designerProfile?.portfolio_images?.slice(0, 4) || [
    'https://images.unsplash.com/photo-1541701494672-9d96629bd31c?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1586717799252-bd134ad00e26?w=400&auto=format&fit=crop',
  ]

  return (
    <div className="min-h-screen bg-mist-100">
      <Header title="Studio Profile" variant="light" showBack={false} />

      <div className="max-w-2xl mx-auto px-4 pb-24 pt-20">
        {/* ── Hero Section ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          <div className="h-32 gradient-copper rounded-t-3xl" />

          <Card variant="default" className="-mt-16 pt-0">
            <div className="flex flex-col items-center px-6 pb-6">
              <div className="relative mb-4">
                <Avatar
                  name={profileData.name}
                  src={profileData.avatarUrl}
                  size="lg"
                  className="ring-4 ring-white"
                />
                {editMode && (
                  <button className="absolute bottom-0 right-0 p-2 bg-copper-700 text-white rounded-full shadow-lg hover:bg-copper-800 transition-colors">
                    <Camera size={16} />
                  </button>
                )}
              </div>

              <div className="text-center">
                {editMode ? (
                  <Input
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="text-center font-grotesk font-bold text-lg mb-2"
                    placeholder="Your name"
                  />
                ) : (
                  <h1 className="font-grotesk font-bold text-2xl text-charcoal-900 mb-2">
                    {profileData.name}
                  </h1>
                )}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Badge variant="success" size="sm">
                    <CheckCircle size={12} className="inline mr-1" />
                    Verified Designer
                  </Badge>
                  {profileData.isAvailable && (
                    <Badge variant="copper" size="sm">Available</Badge>
                  )}
                </div>
              </div>

              <Button
                variant={editMode ? 'primary' : 'outline'}
                size="sm"
                onClick={() => (editMode ? handleSaveProfile() : setEditMode(true))}
                leftIcon={editMode ? <CheckCircle size={16} /> : <Edit2 size={16} />}
              >
                {editMode ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* ── Professional Stats ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-2 mb-8"
        >
          <StatCard
            icon={Clock}
            value={`${profileData.yearsExperience}+`}
            label="Years Exp."
          />
          <StatCard
            icon={Star}
            value={designerProfile?.rating?.toFixed(1) || '4.8'}
            label="Rating"
          />
          <StatCard
            icon={Briefcase}
            value={String(designerProfile?.completed_projects ?? 32)}
            label="Completed"
          />
          <StatCard
            icon={TrendingUp}
            value={designerProfile?.rating ? '98%' : '95%'}
            label="Success"
          />
        </motion.div>

        {/* ── Specializations ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="font-grotesk font-bold text-charcoal-900 mb-3 px-2">Specializations</h2>
          {editMode ? (
            <Card variant="default" className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {SPECIALIZATIONS.map((spec) => (
                  <button
                    key={spec.id}
                    onClick={() => toggleSpecialization(spec.id)}
                    className={[
                      'px-3 py-2.5 rounded-lg transition-all duration-200 border text-sm font-medium font-inter',
                      profileData.specializations.includes(spec.id)
                        ? 'border-copper-700 bg-copper-50 text-copper-700'
                        : 'border-mist-200 bg-white text-charcoal-900/60',
                    ].join(' ')}
                  >
                    {spec.label}
                  </button>
                ))}
              </div>
            </Card>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profileData.specializations.map((spec) => {
                const label = SPECIALIZATIONS.find((s) => s.id === spec)?.label || spec
                return <Badge key={spec} variant="copper">{label}</Badge>
              })}
            </div>
          )}
        </motion.div>

        {/* ── Portfolio Preview Grid ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <h2 className="font-grotesk font-bold text-charcoal-900 mb-3 px-2">Portfolio</h2>
          <div className="grid grid-cols-3 gap-2">
            {portfolioPreviews.map((img, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-mist-200">
                <img
                  src={img}
                  alt={`Portfolio item ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            fullWidth
            className="mt-3"
            onClick={() => navigate('/designer/portfolio')}
          >
            View Full Portfolio
          </Button>
        </motion.div>

        {/* ── About Section ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="font-grotesk font-bold text-charcoal-900 mb-3 px-2">About</h2>
          <Card variant="default" className="p-4">
            {editMode ? (
              <>
                <Textarea
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  placeholder="Tell clients about your expertise..."
                  rows={4}
                />
                <Input
                  value={profileData.location}
                  onChange={(e) =>
                    setProfileData({ ...profileData, location: e.target.value })
                  }
                  leftIcon={<MapPin size={16} />}
                  placeholder="City, Country"
                  label="Location"
                  className="mt-4"
                />
              </>
            ) : (
              <>
                <p className="text-sm text-charcoal-900 leading-relaxed font-inter">
                  {profileData.bio}
                </p>
                <div className="flex items-center gap-2 mt-3 text-sm text-charcoal-900/60">
                  <MapPin size={14} className="text-copper-700" />
                  {profileData.location}
                </div>
              </>
            )}
          </Card>
        </motion.div>

        {/* ── Quick Actions ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="font-grotesk font-bold text-charcoal-900 mb-3 px-2">Quick Actions</h2>
          <div className="space-y-2">
            <QuickActionCard
              icon={LinkIcon}
              title="My Portfolio"
              description="View and manage your work"
              onClick={() => navigate('/designer/portfolio')}
            />
            <QuickActionCard
              icon={Briefcase}
              title="Active Contracts"
              description="View current projects and milestones"
              onClick={() => navigate('/designer/contracts')}
            />
            <QuickActionCard
              icon={TrendingUp}
              title="Earnings & Wallet"
              description="Track income and withdraw funds"
              onClick={() => navigate('/designer/wallet')}
            />
            <AvailabilityToggle
              value={profileData.isAvailable}
              onChange={(v) => setProfileData({ ...profileData, isAvailable: v })}
            />
          </div>
        </motion.div>

        {/* ── Account Info ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="font-grotesk font-bold text-charcoal-900 mb-3 px-2">Account</h2>
          <Card variant="default" className="overflow-hidden">
            <div className="px-4 py-3 border-b border-mist-100">
              <p className="text-sm font-medium text-charcoal-900">Phone Number</p>
              <p className="text-xs text-charcoal-900/60 mt-1">{user.phone}</p>
            </div>
            <div className="px-4 py-3 border-b border-mist-100">
              <p className="text-sm font-medium text-charcoal-900">Verification Status</p>
              <div className="flex items-center gap-2 mt-1">
                <CheckCircle size={14} className="text-emerald-600" />
                <p className="text-xs text-emerald-600 font-medium">Portfolio Verified</p>
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-charcoal-900">Total Earned</p>
              <p className="text-sm font-bold text-copper-700 mt-1">
                UGX {(totalEarnings / 1000000).toFixed(1)}M
              </p>
            </div>
          </Card>
        </motion.div>

        {/* ── Logout Button ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            variant="danger"
            fullWidth
            onClick={() => setLogoutModalOpen(true)}
            leftIcon={<LogOut size={16} />}
          >
            Logout
          </Button>
        </motion.div>
      </div>

      {/* ── Logout Confirmation Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {logoutModalOpen && (
          <Modal
            isOpen={logoutModalOpen}
            onClose={() => setLogoutModalOpen(false)}
            title="Logout?"
            size="sm"
          >
            <div className="space-y-4">
              <p className="text-sm text-charcoal-900/70">
                You will be signed out of your account. You can log back in anytime.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setLogoutModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="danger" fullWidth onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Stat Card Component ────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType
  value: string
  label: string
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, value, label }) => (
  <Card variant="default" className="p-3 text-center">
    <Icon size={16} className="mx-auto mb-1.5 text-copper-700" />
    <p className="text-sm font-bold text-copper-700 font-grotesk">{value}</p>
    <p className="text-[10px] text-charcoal-900/60 font-inter">{label}</p>
  </Card>
)

// ── Quick Action Card Component ────────────────────────────────────────────────

interface QuickActionCardProps {
  icon: React.ElementType
  title: string
  description: string
  onClick: () => void
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon: Icon,
  title,
  description,
  onClick,
}) => (
  <motion.button
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full"
  >
    <Card variant="default" hoverable className="flex items-start gap-3 p-4 text-left">
      <div className="flex-none p-3 bg-copper-50 rounded-xl">
        <Icon size={20} className="text-copper-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-inter font-medium text-charcoal-900">{title}</p>
        <p className="text-xs text-charcoal-900/60">{description}</p>
      </div>
    </Card>
  </motion.button>
)

// ── Availability Toggle ────────────────────────────────────────────────────────

interface AvailabilityToggleProps {
  value: boolean
  onChange: (v: boolean) => void
}

const AvailabilityToggle: React.FC<AvailabilityToggleProps> = ({ value, onChange }) => (
  <Card variant="default" className="flex items-center justify-between p-4">
    <div className="flex items-start gap-3">
      <div className="flex-none p-3 bg-copper-50 rounded-xl">
        <Shield size={20} className="text-copper-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-inter font-medium text-charcoal-900">Availability</p>
        <p className="text-xs text-charcoal-900/60">
          {value ? 'Visible to clients' : 'Hidden from clients'}
        </p>
      </div>
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
  </Card>
)
