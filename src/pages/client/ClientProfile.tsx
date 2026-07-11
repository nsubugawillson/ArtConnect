// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Client Profile Screen
// Route: /client/profile
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
  Heart,
  Bell,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import { Header } from '../../components/layout/Header'
import { formatUGX } from '../../lib/utils'

// ── Interfaces ────────────────────────────────────────────────────────────────

interface ClientProfileState {
  name: string
  location: string
  bio: string
  preferredStyles: string[]
  avatarUrl: string | null
}

const STYLE_OPTIONS = ['Minimalist', 'Bold', 'Editorial', 'Playful', 'Corporate', 'Organic']

// ── Client Profile Screen ─────────────────────────────────────────────────────

export default function ClientProfile() {
  const navigate = useNavigate()
  const { user, wallets, projects, logout } = useStore((s) => ({
    user: s.user,
    wallets: s.wallets,
    projects: s.projects,
    logout: s.logout,
  }))

  const [editMode, setEditMode] = useState(false)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [profileData, setProfileData] = useState<ClientProfileState>({
    name: user?.name || 'Amara Okafor',
    location: 'Kampala, Uganda',
    bio: 'Entrepreneur and creative enthusiast looking for top-tier design talent for our growing brand.',
    preferredStyles: ['Minimalist', 'Bold'],
    avatarUrl: user?.avatar_url || 'https://i.pravatar.cc/150?u=amara.okafor',
  })

  if (!user) {
    return <Navigate to="/auth" />
  }

  const wallet = wallets[user.id] || { available_balance: 0, locked_balance: 0 }
  const clientProjects = projects.filter((p) => p.client_id === user.id)
  const completedProjects = clientProjects.filter((p) => p.status === 'completed').length

  const handleLogout = () => {
    setLogoutModalOpen(false)
    logout()
    navigate('/auth')
  }

  const handleSaveProfile = () => {
    setEditMode(false)
  }

  const toggleStyle = (style: string) => {
    setProfileData((prev) => ({
      ...prev,
      preferredStyles: prev.preferredStyles.includes(style)
        ? prev.preferredStyles.filter((s) => s !== style)
        : [...prev.preferredStyles, style],
    }))
  }

  return (
    <div className="min-h-screen bg-mist-100">
      <Header title="My Profile" variant="light" showBack={false} />

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
                    Verified Client
                  </Badge>
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

        {/* ── Stats Row ───────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          <Card variant="default" className="text-center p-4">
            <p className="text-2xl font-bold text-copper-700 font-grotesk">
              {clientProjects.length}
            </p>
            <p className="text-xs text-charcoal-900/60 font-inter">Projects Posted</p>
          </Card>
          <Card variant="default" className="text-center p-4">
            <p className="text-2xl font-bold text-copper-700 font-grotesk">
              {completedProjects}
            </p>
            <p className="text-xs text-charcoal-900/60 font-inter">Completed</p>
          </Card>
          <Card variant="default" className="text-center p-4">
            <p className="text-lg font-bold text-copper-700 font-grotesk">
              {formatUGX(wallet.available_balance + wallet.locked_balance).split(' ')[1]}
            </p>
            <p className="text-xs text-charcoal-900/60 font-inter">Total Spent</p>
          </Card>
        </motion.div>

        {/* ── Personal Information ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <h2 className="font-grotesk font-bold text-charcoal-900 mb-3 px-2">
            Personal Information
          </h2>
          <Card variant="default" className="p-4 space-y-4">
            {editMode ? (
              <>
                <Input
                  value={profileData.location}
                  onChange={(e) =>
                    setProfileData({ ...profileData, location: e.target.value })
                  }
                  leftIcon={<MapPin size={16} />}
                  placeholder="City, Country"
                  label="Location"
                />
                <Textarea
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  placeholder="Tell designers about your project style..."
                  label="Bio"
                  rows={3}
                />
                <div>
                  <label className="text-xs font-medium text-charcoal-900/60 mb-2 block">
                    Preferred Styles
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_OPTIONS.map((style) => (
                      <button
                        key={style}
                        onClick={() => toggleStyle(style)}
                        className={[
                          'px-3 py-1.5 rounded-lg text-sm font-medium font-inter transition-all border',
                          profileData.preferredStyles.includes(style)
                            ? 'border-copper-700 bg-copper-50 text-copper-700'
                            : 'border-mist-200 bg-white text-charcoal-900/60',
                        ].join(' ')}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={14} className="text-copper-700" />
                  <span className="text-charcoal-900">{profileData.location}</span>
                </div>
                <p className="text-sm text-charcoal-900/70 leading-relaxed">{profileData.bio}</p>
                {profileData.preferredStyles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profileData.preferredStyles.map((style) => (
                      <Badge key={style} variant="copper" size="sm">{style}</Badge>
                    ))}
                  </div>
                )}
              </>
            )}
          </Card>
        </motion.div>

        {/* ── Quick Actions ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="font-grotesk font-bold text-charcoal-900 mb-3 px-2">
            Quick Actions
          </h2>
          <div className="space-y-2">
            <QuickActionCard
              icon={Briefcase}
              title="My Projects"
              description="View and manage all your project briefs"
              onClick={() => navigate('/client/projects')}
            />
            <QuickActionCard
              icon={Shield}
              title="Wallet & Escrow"
              description="Monitor funds and transaction history"
              onClick={() => navigate('/client/wallet')}
            />
            <QuickActionCard
              icon={Heart}
              title="Saved Designers"
              description="Your favorite vetted professionals"
              onClick={() => navigate('/client/browse')}
            />
            <QuickActionCard
              icon={Bell}
              title="Notification Settings"
              description="Control alerts and updates"
              onClick={() => navigate('/notifications')}
            />
          </div>
        </motion.div>

        {/* ── Account Settings ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="font-grotesk font-bold text-charcoal-900 mb-3 px-2">Account</h2>
          <Card variant="default" className="overflow-hidden">
            <div className="px-4 py-3 border-b border-mist-100">
              <p className="text-sm font-medium text-charcoal-900">Phone Number</p>
              <p className="text-xs text-charcoal-900/60 mt-1">{user.phone}</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-charcoal-900">Email</p>
              <p className="text-xs text-charcoal-900/60 mt-1">Not linked</p>
            </div>
          </Card>
        </motion.div>

        {/* ── Logout Button ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
