// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Role Selection Screen
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase,
  Palette,
  Settings,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Star,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useStore, getDashboardPath } from '../lib/store'
import type { UserRole, DesignerSpecialization, User } from '../lib/types'
import * as api from '../lib/api'

// ── Types ─────────────────────────────────────────────────────────────────────

interface RoleCard {
  role: UserRole
  title: string
  tagline: string
  description: string
  icon: React.ReactNode
  benefits: string[]
  recommended?: boolean
  cardStyle: string
  iconBg: string
  iconColor: string
  btnStyle: string
  labelStyle: string
}

// ── Role definitions ──────────────────────────────────────────────────────────

const ROLE_CARDS: RoleCard[] = [
  {
    role: 'client',
    title: 'Client',
    tagline: 'I want to hire designers',
    description:
      'Post projects, review proposals, collaborate with designers, and make secure milestone-based payments.',
    icon: <Briefcase size={32} strokeWidth={1.4} />,
    benefits: [
      'Post unlimited project briefs',
      'Secure escrow payment protection',
      'Direct messaging with designers',
    ],
    cardStyle:
      'bg-white border-2 border-mist-200 hover:border-copper-700/40 hover:shadow-lg hover:shadow-copper-700/8',
    iconBg: 'bg-mist-100',
    iconColor: 'text-charcoal-900',
    btnStyle:
      'border-2 border-charcoal-900 bg-charcoal-900 text-white hover:bg-charcoal-800',
    labelStyle: 'text-charcoal-900/50',
  },
  {
    role: 'designer',
    title: 'Designer',
    tagline: "I'm a professional designer",
    description:
      'Showcase your portfolio, receive project proposals, set your own rates, and get paid securely for every milestone.',
    icon: <Palette size={32} strokeWidth={1.4} />,
    benefits: [
      'Verified designer badge',
      'Set your own hourly rate (UGX)',
      'Built-in portfolio showcase',
    ],
    recommended: true,
    cardStyle:
      'gradient-copper border-2 border-transparent shadow-xl shadow-copper-700/25 hover:brightness-105',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
    btnStyle: 'bg-white text-copper-700 font-semibold hover:bg-mist-100',
    labelStyle: 'text-white/60',
  },
  {
    role: 'admin',
    title: 'Admin',
    tagline: 'Platform administrator',
    description:
      'Access platform analytics, manage disputes, approve designer verifications, and oversee all transactions.',
    icon: <Settings size={32} strokeWidth={1.4} />,
    benefits: [
      'Full platform oversight',
      'Dispute resolution tools',
      'Analytics & reporting dashboard',
    ],
    cardStyle:
      'bg-charcoal-900 border-2 border-charcoal-800 hover:border-copper-700/50 hover:shadow-lg hover:shadow-copper-700/15',
    iconBg: 'bg-white/10',
    iconColor: 'text-white',
    btnStyle: 'bg-copper-700 text-white hover:bg-copper-600',
    labelStyle: 'text-white/40',
  },
]

// ── Specialisation options ────────────────────────────────────────────────────

interface SpecOption {
  value: DesignerSpecialization
  label: string
}

const SPECIALISATIONS: SpecOption[] = [
  { value: 'graphic', label: 'Graphic Design' },
  { value: 'industrial', label: 'Industrial Design' },
  { value: 'branding', label: 'Branding' },
  { value: 'ui_ux', label: 'UI/UX Design' },
  { value: 'motion', label: 'Motion Design' },
  { value: 'packaging', label: 'Packaging' },
]

// ── Role card component ───────────────────────────────────────────────────────

interface RoleCardProps {
  card: RoleCard
  isSelected: boolean
  onSelect: () => void
}

function RoleCardItem({ card, isSelected, onSelect }: RoleCardProps) {
  const isDark = card.role === 'designer' || card.role === 'admin'

  return (
    <motion.div
      layout
      onClick={onSelect}
      className={`relative cursor-pointer rounded-2xl p-6 transition-all duration-300 ${card.cardStyle} ${
        isSelected ? 'ring-4 ring-copper-700 ring-offset-2' : ''
      }`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
      {/* Recommended badge */}
      {card.recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow-lg">
            <Star size={11} className="fill-copper-700 text-copper-700" />
            <span className="font-grotesk text-xs font-bold text-copper-700 uppercase tracking-wide">
              Recommended
            </span>
          </div>
        </div>
      )}

      {/* Icon */}
      <div className={`mb-4 inline-flex rounded-xl p-3 ${card.iconBg} ${card.iconColor}`}>
        {card.icon}
      </div>

      {/* Title & tagline */}
      <h3
        className={`font-grotesk mb-0.5 text-xl font-bold ${
          isDark ? 'text-white' : 'text-charcoal-900'
        }`}
      >
        {card.title}
      </h3>
      <p className={`font-inter mb-3 text-xs font-medium ${card.labelStyle}`}>
        {card.tagline}
      </p>

      {/* Description */}
      <p
        className={`font-inter mb-5 text-sm leading-relaxed ${
          isDark ? 'text-white/60' : 'text-charcoal-900/55'
        }`}
      >
        {card.description}
      </p>

      {/* Benefits list */}
      <ul className="mb-6 space-y-2">
        {card.benefits.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <CheckCircle2
              size={15}
              className={`mt-0.5 flex-shrink-0 ${
                isDark ? 'text-white/50' : 'text-copper-700'
              }`}
            />
            <span
              className={`font-inter text-xs ${
                isDark ? 'text-white/65' : 'text-charcoal-900/60'
              }`}
            >
              {b}
            </span>
          </li>
        ))}
      </ul>

      {/* Select button */}
      <button
        onClick={(e) => { e.stopPropagation(); onSelect() }}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 font-grotesk text-sm font-semibold transition-all duration-200 active:scale-95 focus-visible:outline-none ${card.btnStyle}`}
      >
        {isSelected ? 'Selected' : 'Select'}
        {isSelected ? <CheckCircle2 size={16} /> : <ChevronRight size={16} />}
      </button>
    </motion.div>
  )
}

// ── Designer Profile Form ─────────────────────────────────────────────────────

interface DesignerFormProps {
  onComplete: (data: {
    name: string
    username: string
    password: string
    specializations: DesignerSpecialization[]
    hourlyRate: string
    bio: string
  }) => void
  isLoading: boolean
}

function DesignerForm({ onComplete, isLoading }: DesignerFormProps) {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedSpecs, setSelectedSpecs] = useState<DesignerSpecialization[]>([])
  const [hourlyRate, setHourlyRate] = useState('')
  const [bio, setBio] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const toggleSpec = (spec: DesignerSpecialization) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec],
    )
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Please enter your full name.'
    if (!username.trim()) errs.username = 'Please enter a username.'
    else if (username.trim().length < 3) errs.username = 'Username must be at least 3 characters.'
    else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) errs.username = 'Username can only contain letters, numbers, and underscores.'
    if (!password) errs.password = 'Please enter a password.'
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.'
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.'
    if (selectedSpecs.length === 0) errs.specs = 'Select at least one specialisation.'
    if (!hourlyRate || isNaN(Number(hourlyRate)) || Number(hourlyRate) <= 0)
      errs.hourlyRate = 'Enter a valid hourly rate in UGX.'
    if (!bio.trim() || bio.trim().length < 20) errs.bio = 'Bio must be at least 20 characters.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onComplete({ name: name.trim(), username: username.trim().toLowerCase(), password, specializations: selectedSpecs, hourlyRate, bio: bio.trim() })
  }

  return (
    <motion.div
      className="card mt-8 p-7 shadow-xl shadow-charcoal-900/8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: 'easeOut' }}
    >
      <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-copper-100 px-3 py-1">
        <Palette size={13} className="text-copper-700" />
        <span className="font-grotesk text-xs font-semibold text-copper-700 uppercase tracking-wide">
          Designer Profile
        </span>
      </div>
      <h3 className="font-grotesk mt-3 mb-5 text-xl font-bold text-charcoal-900">
        Complete your profile
      </h3>

      {/* Name */}
      <div className="mb-4">
        <label className="font-inter mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-900/50">
          Full Name
        </label>
        <input
          type="text"
          placeholder="e.g. Sarah Nakato"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })) }}
          className={`input-base ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20' : ''}`}
        />
        {errors.name && <p className="font-inter mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Username */}
      <div className="mb-4">
        <label className="font-inter mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-900/50">
          Username
        </label>
        <input
          type="text"
          placeholder="e.g. sarah_designs"
          value={username}
          onChange={(e) => { setUsername(e.target.value.toLowerCase()); setErrors((p) => ({ ...p, username: '' })) }}
          className={`input-base ${errors.username ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20' : ''}`}
        />
        {errors.username && <p className="font-inter mt-1 text-xs text-red-500">{errors.username}</p>}
      </div>

      {/* Password */}
      <div className="mb-4">
        <label className="font-inter mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-900/50">
          Password
        </label>
        <input
          type="password"
          placeholder="Min. 6 characters"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })) }}
          className={`input-base ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20' : ''}`}
        />
        {errors.password && <p className="font-inter mt-1 text-xs text-red-500">{errors.password}</p>}
      </div>

      {/* Confirm Password */}
      <div className="mb-4">
        <label className="font-inter mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-900/50">
          Confirm Password
        </label>
        <input
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })) }}
          className={`input-base ${errors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20' : ''}`}
        />
        {errors.confirmPassword && <p className="font-inter mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
      </div>

      {/* Specialisations */}
      <div className="mb-4">
        <label className="font-inter mb-2 block text-xs font-semibold uppercase tracking-wider text-charcoal-900/50">
          Specialisations
        </label>
        <div className="flex flex-wrap gap-2">
          {SPECIALISATIONS.map((s) => {
            const active = selectedSpecs.includes(s.value)
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => { toggleSpec(s.value); setErrors((p) => ({ ...p, specs: '' })) }}
                className={`rounded-full border-2 px-3.5 py-1.5 font-inter text-xs font-medium transition-all duration-200 focus-visible:outline-none ${
                  active
                    ? 'border-copper-700 bg-copper-700 text-white'
                    : 'border-mist-200 bg-white text-charcoal-900/70 hover:border-copper-700/40'
                }`}
              >
                {s.label}
              </button>
            )
          })}
        </div>
        {errors.specs && <p className="font-inter mt-1.5 text-xs text-red-500">{errors.specs}</p>}
      </div>

      {/* Hourly rate */}
      <div className="mb-4">
        <label className="font-inter mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-900/50">
          Hourly Rate (UGX)
        </label>
        <div className="flex items-stretch overflow-hidden rounded-xl border-2 border-mist-200 bg-white transition-all focus-within:border-copper-700 focus-within:ring-2 focus-within:ring-copper-700/20">
          <div className="flex items-center border-r-2 border-mist-200 bg-mist-50 px-3.5 py-3">
            <span className="font-grotesk text-sm font-semibold text-charcoal-900/60">UGX</span>
          </div>
          <input
            type="number"
            inputMode="numeric"
            placeholder="50,000"
            value={hourlyRate}
            onChange={(e) => { setHourlyRate(e.target.value); setErrors((p) => ({ ...p, hourlyRate: '' })) }}
            className="flex-1 bg-transparent px-4 py-3 font-inter text-sm text-charcoal-900 placeholder-charcoal-900/25 outline-none"
          />
        </div>
        {errors.hourlyRate && (
          <p className="font-inter mt-1 text-xs text-red-500">{errors.hourlyRate}</p>
        )}
      </div>

      {/* Bio */}
      <div className="mb-6">
        <label className="font-inter mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-900/50">
          Short Bio
        </label>
        <textarea
          placeholder="Tell clients about your experience, style, and what makes you unique…"
          value={bio}
          rows={4}
          onChange={(e) => { setBio(e.target.value); setErrors((p) => ({ ...p, bio: '' })) }}
          className={`input-base resize-none ${errors.bio ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20' : ''}`}
        />
        <div className="mt-1 flex justify-between">
          {errors.bio ? (
            <p className="font-inter text-xs text-red-500">{errors.bio}</p>
          ) : (
            <span />
          )}
          <span className="font-inter text-xs text-charcoal-900/30">{bio.length} chars</span>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="btn-primary btn-lg w-full rounded-xl"
      >
        {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
        {isLoading ? 'Creating profile…' : 'Complete Profile'}
      </button>
    </motion.div>
  )
}

interface ClientFormProps {
  onComplete: (data: { name: string; username: string; password: string }) => void
  isLoading: boolean
}

function ClientForm({ onComplete, isLoading }: ClientFormProps) {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Please enter your full name.'
    if (!username.trim()) errs.username = 'Please enter a username.'
    else if (username.trim().length < 3) errs.username = 'Username must be at least 3 characters.'
    else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) errs.username = 'Username can only contain letters, numbers, and underscores.'
    if (!password) errs.password = 'Please enter a password.'
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.'
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onComplete({ name: name.trim(), username: username.trim().toLowerCase(), password })
  }

  return (
    <motion.div
      className="card mt-8 p-7 shadow-xl shadow-charcoal-900/8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: 'easeOut' }}
    >
      <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-mist-100 px-3 py-1">
        <Briefcase size={13} className="text-charcoal-900" />
        <span className="font-grotesk text-xs font-semibold text-charcoal-900/70 uppercase tracking-wide">
          Client Profile
        </span>
      </div>
      <h3 className="font-grotesk mt-3 mb-5 text-xl font-bold text-charcoal-900">
        Create Your Account
      </h3>

      {/* Name */}
      <div className="mb-4">
        <label className="font-inter mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-900/50">
          Full Name
        </label>
        <input
          type="text"
          placeholder="e.g. Amara Okafor"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })) }}
          className={`input-base ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20' : ''}`}
          autoFocus
        />
        {errors.name && <p className="font-inter mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Username */}
      <div className="mb-4">
        <label className="font-inter mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-900/50">
          Username
        </label>
        <input
          type="text"
          placeholder="e.g. amara_designs"
          value={username}
          onChange={(e) => { setUsername(e.target.value.toLowerCase()); setErrors((p) => ({ ...p, username: '' })) }}
          className={`input-base ${errors.username ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20' : ''}`}
        />
        {errors.username && <p className="font-inter mt-1 text-xs text-red-500">{errors.username}</p>}
      </div>

      {/* Password */}
      <div className="mb-4">
        <label className="font-inter mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-900/50">
          Password
        </label>
        <input
          type="password"
          placeholder="Min. 6 characters"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })) }}
          className={`input-base ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20' : ''}`}
        />
        {errors.password && <p className="font-inter mt-1 text-xs text-red-500">{errors.password}</p>}
      </div>

      {/* Confirm Password */}
      <div className="mb-6">
        <label className="font-inter mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-900/50">
          Confirm Password
        </label>
        <input
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })) }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className={`input-base ${errors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20' : ''}`}
        />
        {errors.confirmPassword && <p className="font-inter mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="btn-primary btn-lg w-full rounded-xl"
      >
        {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
        {isLoading ? 'Creating account…' : 'Get Started'}
      </button>
    </motion.div>
  )
}

interface AdminFormProps {
  onComplete: (data: { name: string; username: string; password: string }) => void
  isLoading: boolean
}

function AdminForm({ onComplete, isLoading }: AdminFormProps) {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Please enter your name.'
    if (!username.trim()) errs.username = 'Please enter a username.'
    else if (username.trim().length < 3) errs.username = 'Username must be at least 3 characters.'
    else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) errs.username = 'Username can only contain letters, numbers, and underscores.'
    if (!password) errs.password = 'Please enter a password.'
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.'
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onComplete({ name: name.trim(), username: username.trim().toLowerCase(), password })
  }

  return (
    <motion.div
      className="card mt-8 p-7 shadow-xl shadow-charcoal-900/8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: 'easeOut' }}
    >
      <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-charcoal-900 px-3 py-1">
        <Settings size={13} className="text-white" />
        <span className="font-grotesk text-xs font-semibold text-white uppercase tracking-wide">
          Admin Access
        </span>
      </div>
      <h3 className="font-grotesk mt-3 mb-5 text-xl font-bold text-charcoal-900">
        Admin Registration
      </h3>

      {/* Name */}
      <div className="mb-4">
        <label className="font-inter mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-900/50">
          Your Name
        </label>
        <input
          type="text"
          placeholder="e.g. Admin User"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })) }}
          className={`input-base ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20' : ''}`}
          autoFocus
        />
        {errors.name && <p className="font-inter mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Username */}
      <div className="mb-4">
        <label className="font-inter mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-900/50">
          Username
        </label>
        <input
          type="text"
          placeholder="e.g. admin_01"
          value={username}
          onChange={(e) => { setUsername(e.target.value.toLowerCase()); setErrors((p) => ({ ...p, username: '' })) }}
          className={`input-base ${errors.username ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20' : ''}`}
        />
        {errors.username && <p className="font-inter mt-1 text-xs text-red-500">{errors.username}</p>}
      </div>

      {/* Password */}
      <div className="mb-4">
        <label className="font-inter mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-900/50">
          Password
        </label>
        <input
          type="password"
          placeholder="Min. 6 characters"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })) }}
          className={`input-base ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20' : ''}`}
        />
        {errors.password && <p className="font-inter mt-1 text-xs text-red-500">{errors.password}</p>}
      </div>

      {/* Confirm Password */}
      <div className="mb-6">
        <label className="font-inter mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-900/50">
          Confirm Password
        </label>
        <input
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })) }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className={`input-base ${errors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20' : ''}`}
        />
        {errors.confirmPassword && <p className="font-inter mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="btn-dark btn-lg w-full rounded-xl"
      >
        {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
        {isLoading ? 'Creating account…' : 'Access Admin Panel'}
      </button>
    </motion.div>
  )
}

// ── Role Selection Page ───────────────────────────────────────────────────────

export default function RoleSelection() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const phoneFromQuery = searchParams.get('phone') ?? ''

  const { setUser, setProfile, loadInitialData } = useStore()

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [signUpError, setSignUpError] = useState<string | null>(null)

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setShowForm(true)
  }

  const handleBack = () => {
    setSelectedRole(null)
    setShowForm(false)
  }

  // ── Create user and navigate ─────────────────────────────────────────────

  const createAndNavigate = async (
    name: string,
    username: string,
    password: string,
    role: UserRole,
    designerExtra?: {
      specializations: DesignerSpecialization[]
      hourlyRate: number
      bio: string
    },
  ) => {
    setIsLoading(true)
    setSignUpError(null)

    try {
      // Create user via Supabase auth + profile + wallet with username
      const email = `${username}@artconnect.ug`
      const { data, error } = await api.signUp(email, password, name, role, username)
      if (error) {
        setSignUpError(error.message || 'Registration failed. Please try again.')
        setIsLoading(false)
        return
      }
      if (!data || !data.user) {
        setSignUpError('Registration failed. Please try again.')
        setIsLoading(false)
        return
      }

      const userData = data as any
      const userId = userData.user?.id ?? userData.id

      // If we have a session, user is logged in
      if (data.session) {
        const user: User = {
          id: userId,
          phone: phoneFromQuery || '',
          name,
          username,
          role,
          avatar_url: null,
          created_at: new Date().toISOString(),
        }
        setUser(user)

        // If designer, load designer profile
        if (role === 'designer') {
          const { data: dp } = await api.getDesignerProfile(userId)
          if (dp) setProfile(dp as any)
        }

        await loadInitialData(userId)
        navigate(getDashboardPath(role))
      } else {
        // No session - may need email confirmation, redirect to login
        setSignUpError('Account created! Please check your email to confirm, or try logging in.')
        setIsLoading(false)
        // Wait a moment then redirect to auth
        setTimeout(() => {
          navigate('/auth')
        }, 2000)
      }
    } catch (err) {
      console.error('Failed to create user:', err)
      setSignUpError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  const handleClientComplete = async ({ name, username, password }: { name: string; username: string; password: string }) => {
    await createAndNavigate(name, username, password, 'client')
  }

  const handleDesignerComplete = async (data: {
    name: string
    username: string
    password: string
    specializations: DesignerSpecialization[]
    hourlyRate: string
    bio: string
  }) => {
    await createAndNavigate(data.name, data.username, data.password, 'designer', {
      specializations: data.specializations,
      hourlyRate: Number(data.hourlyRate),
      bio: data.bio,
    })
  }

  const handleAdminComplete = async ({ name, username, password }: { name: string; username: string; password: string }) => {
    await createAndNavigate(name, username, password, 'admin')
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-mist-100">
      {/* Top copper stripe */}
      <div className="gradient-copper h-1.5 w-full" />

      <div className="mx-auto max-w-xl px-5 py-12">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-copper shadow-lg shadow-copper-700/30">
              <span className="font-grotesk text-xl font-bold text-white">AC</span>
            </div>
          </div>
          <h1 className="font-grotesk mb-2 text-3xl font-bold text-charcoal-900">
            {showForm ? 'Almost there!' : 'Join ArtConnect.Ug'}
          </h1>
          <p className="font-inter text-sm text-charcoal-900/50">
            {showForm
              ? 'Fill in your details to complete registration'
              : 'Choose how you want to use the platform'}
          </p>
        </motion.div>

        {/* Main content */}
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div
              key="role-cards"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.32 }}
              className="flex flex-col gap-5"
            >
              {ROLE_CARDS.map((card, i) => (
                <motion.div
                  key={card.role}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.35 }}
                >
                  <RoleCardItem
                    card={card}
                    isSelected={selectedRole === card.role}
                    onSelect={() => handleRoleSelect(card.role)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="profile-form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.32 }}
            >
              {/* Back button */}
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 font-inter text-sm font-medium text-charcoal-900/50 transition-opacity hover:opacity-100 focus-visible:outline-none"
              >
                <ArrowLeft size={15} />
                Change role
              </button>

              {/* Selected role badge */}
              {selectedRole && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="font-inter text-xs text-charcoal-900/40">Selected:</span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-grotesk text-xs font-semibold ${
                      selectedRole === 'designer'
                        ? 'bg-copper-100 text-copper-700'
                        : selectedRole === 'admin'
                        ? 'bg-charcoal-900 text-white'
                        : 'bg-mist-100 text-charcoal-900'
                    }`}
                  >
                    {selectedRole === 'client' && <Briefcase size={12} />}
                    {selectedRole === 'designer' && <Palette size={12} />}
                    {selectedRole === 'admin' && <Settings size={12} />}
                    {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                  </span>
                </div>
              )}

              {selectedRole === 'client' && (
                <ClientForm onComplete={handleClientComplete} isLoading={isLoading} />
              )}
              {selectedRole === 'designer' && (
                <DesignerForm onComplete={handleDesignerComplete} isLoading={isLoading} />
              )}
              {selectedRole === 'admin' && (
                <AdminForm onComplete={handleAdminComplete} isLoading={isLoading} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom actions */}
        {!showForm && (
          <>
            {/* Admin Dashboard link */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="text-[11px] text-charcoal-900/30 hover:text-copper-700 transition-colors font-inter focus-visible:outline-none"
              >
                Platform Administrator
              </button>
            </motion.div>

            {/* Bottom note */}
            <motion.p
              className="mt-6 text-center font-inter text-xs text-charcoal-900/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              By continuing you agree to ArtConnect.Ug's Terms of Service
            </motion.p>
          </>
        )}
      </div>

      {/* Full-page loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-charcoal-900/40 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl">
              <Loader2 size={36} className="animate-spin text-copper-700" />
              <p className="font-grotesk text-sm font-semibold text-charcoal-900">
                Setting up your account…
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error toast */}
      <AnimatePresence>
        {signUpError && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-8 left-4 right-4 z-50 max-w-md mx-auto"
          >
            <div className="bg-red-600 text-white rounded-2xl px-5 py-3.5 flex items-start gap-3 shadow-2xl">
              <span className="text-lg leading-none mt-0.5">⚠</span>
              <div className="flex-1">
                <p className="font-grotesk text-sm font-semibold">Registration failed</p>
                <p className="font-inter text-xs mt-0.5 text-white/80">{signUpError}</p>
              </div>
              <button onClick={() => setSignUpError(null)} className="text-white/70 hover:text-white text-lg leading-none">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
