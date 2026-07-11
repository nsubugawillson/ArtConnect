// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Designer Registration (Multi-Step Form)
// Route: /designer/register
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  User,
  Briefcase,
  CheckCircle2,
  Lock,
  Upload,
  AlertCircle,
  Eye,
} from 'lucide-react'
import type { DesignerSpecialization } from '../../lib/types'
import { useStore } from '../../lib/store'

// ── Types ─────────────────────────────────────────────────────────────────────

interface RegistrationData {
  // Step 1: Basic Info
  publicUsername: string
  fullLegalName: string
  phone: string

  // Step 2: Professional Details
  specializations: DesignerSpecialization[]
  yearsOfExperience: string
  bio: string
  hourlyRate: string

  // Step 3: Tax & Verification
  tinNumber: string
  tinValid: boolean
  documentUploaded: boolean

  // Step 4: Review & Submit
  agreedToTerms: boolean
}

type FormStep = 1 | 2 | 3 | 4

const SPECIALIZATIONS: Array<{ value: DesignerSpecialization; label: string }> = [
  { value: 'graphic', label: 'Graphic Design' },
  { value: 'industrial', label: 'Industrial Design' },
  { value: 'branding', label: 'Branding' },
  { value: 'ui_ux', label: 'UI/UX Design' },
  { value: 'motion', label: 'Motion Design' },
  { value: 'packaging', label: 'Packaging' },
]

// ── Step Indicator ────────────────────────────────────────────────────────────

interface StepIndicatorProps {
  current: FormStep
  total: number
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ current, total }) => {
  const steps = [
    { n: 1 as FormStep, icon: User, label: 'Basic Info' },
    { n: 2 as FormStep, icon: Briefcase, label: 'Professional' },
    { n: 3 as FormStep, icon: FileText, label: 'Tax & Docs' },
    { n: 4 as FormStep, icon: Eye, label: 'Review' },
  ]

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, idx) => {
        const Icon = step.icon
        const isDone = current > step.n
        const isActive = current === step.n

        return (
          <React.Fragment key={step.n}>
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={
                  isDone
                    ? { backgroundColor: '#16a34a', scale: 1 }
                    : isActive
                    ? { backgroundColor: '#A0430A', scale: 1.05 }
                    : { backgroundColor: '#DFE8E6', scale: 1 }
                }
                transition={{ duration: 0.3 }}
                className="w-9 h-9 rounded-full flex items-center justify-center"
              >
                {isDone ? (
                  <Check size={16} className="text-white" strokeWidth={2.5} />
                ) : (
                  <Icon
                    size={15}
                    strokeWidth={2}
                    className={isActive ? 'text-white' : 'text-mist-400'}
                  />
                )}
              </motion.div>
              <span
                className={[
                  'text-[10px] font-inter font-medium',
                  isActive ? 'text-copper-700' : isDone ? 'text-emerald-600' : 'text-mist-400',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>

            {idx < total - 1 && (
              <div className="flex-1 h-0.5 mb-4 mx-1">
                <motion.div
                  className="h-full rounded-full"
                  animate={{
                    backgroundColor: current > step.n ? '#16a34a' : '#DFE8E6',
                  }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ── Toast notification ────────────────────────────────────────────────────────

interface ToastProps {
  message: string
  visible: boolean
}

const Toast: React.FC<ToastProps> = ({ message, visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.95 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        className="fixed bottom-8 left-4 right-4 z-50 max-w-md mx-auto"
      >
        <div className="bg-charcoal-900 text-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-2xl shadow-charcoal-900/40">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" strokeWidth={2} />
          <span className="text-sm font-inter font-medium">{message}</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
)

// ── Step 1: Basic Info ─────────────────────────────────────────────────────────

interface Step1Props {
  data: RegistrationData
  onChange: (field: string, value: string) => void
  errors: Record<string, string>
}

const Step1: React.FC<Step1Props> = ({ data, onChange, errors }) => {
  return (
    <div className="space-y-5">
      {/* Public Username */}
      <div>
        <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-1.5">
          Public Username <span className="text-copper-700">*</span>
        </label>
        <input
          type="text"
          placeholder="Your display name on ArtConnect.Ug"
          value={data.publicUsername}
          onChange={(e) => onChange('publicUsername', e.target.value)}
          className={[
            'w-full h-11 px-3.5 rounded-2xl border text-sm text-charcoal-900 font-inter',
            'placeholder:text-mist-300 bg-white',
            'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700/50 transition-all',
            errors.publicUsername ? 'border-red-300 bg-red-50' : 'border-mist-200',
          ].join(' ')}
        />
        {errors.publicUsername && (
          <p className="text-xs text-red-500 font-inter mt-1">{errors.publicUsername}</p>
        )}
      </div>

      {/* Full Legal Name */}
      <div>
        <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-1.5 flex items-center gap-1.5">
          <Lock size={12} className="text-copper-700" strokeWidth={2} />
          Full Legal Name <span className="text-copper-700">*</span>
        </label>
        <input
          type="text"
          placeholder="Your legal name (admin-only, never public)"
          value={data.fullLegalName}
          onChange={(e) => onChange('fullLegalName', e.target.value)}
          className={[
            'w-full h-11 px-3.5 rounded-2xl border text-sm text-charcoal-900 font-inter',
            'placeholder:text-mist-300 bg-white',
            'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700/50 transition-all',
            errors.fullLegalName ? 'border-red-300 bg-red-50' : 'border-mist-200',
          ].join(' ')}
        />
        {errors.fullLegalName && (
          <p className="text-xs text-red-500 font-inter mt-1">{errors.fullLegalName}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-1.5">
          Phone Number <span className="text-copper-700">*</span>
        </label>
        <input
          type="tel"
          placeholder="+256..."
          value={data.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          disabled
          className="w-full h-11 px-3.5 rounded-2xl border border-mist-200 text-sm text-mist-400 font-inter bg-mist-50 cursor-not-allowed"
        />
        <p className="text-xs text-mist-400 font-inter mt-1">Pre-filled from your account</p>
      </div>
    </div>
  )
}

// ── Step 2: Professional Details ──────────────────────────────────────────────

interface Step2Props {
  data: RegistrationData
  onChange: (field: string, value: string | DesignerSpecialization[]) => void
  errors: Record<string, string>
}

const Step2: React.FC<Step2Props> = ({ data, onChange, errors }) => {
  const toggleSpecialization = (spec: DesignerSpecialization) => {
    const newSpecs = data.specializations.includes(spec)
      ? data.specializations.filter((s) => s !== spec)
      : [...data.specializations, spec]
    onChange('specializations', newSpecs)
  }

  return (
    <div className="space-y-5">
      {/* Specializations */}
      <div>
        <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-2">
          Specializations <span className="text-copper-700">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATIONS.map((spec) => {
            const isSelected = data.specializations.includes(spec.value)
            return (
              <motion.button
                key={spec.value}
                type="button"
                onClick={() => toggleSpecialization(spec.value)}
                whileTap={{ scale: 0.95 }}
                className={[
                  'px-3 py-2 rounded-lg border text-xs font-medium font-inter transition-all duration-200',
                  isSelected
                    ? 'bg-copper-700/10 border-copper-700 text-copper-700'
                    : 'bg-white border-mist-200 text-charcoal-700 hover:border-copper-700/30',
                ].join(' ')}
              >
                {spec.label}
              </motion.button>
            )
          })}
        </div>
        {errors.specializations && (
          <p className="text-xs text-red-500 font-inter mt-1">{errors.specializations}</p>
        )}
      </div>

      {/* Years of Experience */}
      <div>
        <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-1.5">
          Years of Experience <span className="text-copper-700">*</span>
        </label>
        <select
          value={data.yearsOfExperience}
          onChange={(e) => onChange('yearsOfExperience', e.target.value)}
          className={[
            'w-full h-11 px-3.5 rounded-2xl border text-sm text-charcoal-900 font-inter',
            'bg-white',
            'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700/50 transition-all',
            errors.yearsOfExperience ? 'border-red-300 bg-red-50' : 'border-mist-200',
          ].join(' ')}
        >
          <option value="">Select experience level</option>
          <option value="0-1">Less than 1 year</option>
          <option value="1-3">1-3 years</option>
          <option value="3-5">3-5 years</option>
          <option value="5-10">5-10 years</option>
          <option value="10+">10+ years</option>
        </select>
        {errors.yearsOfExperience && (
          <p className="text-xs text-red-500 font-inter mt-1">{errors.yearsOfExperience}</p>
        )}
      </div>

      {/* Bio */}
      <div>
        <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-1.5">
          Professional Bio <span className="text-copper-700">*</span>
        </label>
        <textarea
          placeholder="Tell clients about your background, approach, and what makes you unique…"
          value={data.bio}
          onChange={(e) => onChange('bio', e.target.value)}
          rows={4}
          className={[
            'w-full px-3.5 py-3 rounded-2xl border text-sm text-charcoal-900 font-inter',
            'placeholder:text-mist-300 bg-white resize-none',
            'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700/50 transition-all',
            errors.bio ? 'border-red-300 bg-red-50' : 'border-mist-200',
          ].join(' ')}
        />
        {errors.bio && <p className="text-xs text-red-500 font-inter mt-1">{errors.bio}</p>}
      </div>

      {/* Hourly Rate */}
      <div>
        <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-1.5">
          Hourly Rate (UGX) <span className="text-copper-700">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-mist-400 font-inter">
            UGX
          </span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={data.hourlyRate}
            onChange={(e) => {
              const digits = e.target.value.replace(/[^\d]/g, '')
              onChange('hourlyRate', digits ? String(Number(digits)) : '')
            }}
            className={[
              'w-full h-11 pl-12 pr-3.5 rounded-2xl border text-sm text-charcoal-900 font-inter font-semibold',
              'placeholder:text-mist-300 bg-white',
              'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700/50 transition-all',
              errors.hourlyRate ? 'border-red-300 bg-red-50' : 'border-mist-200',
            ].join(' ')}
          />
        </div>
        {errors.hourlyRate && (
          <p className="text-xs text-red-500 font-inter mt-1">{errors.hourlyRate}</p>
        )}
      </div>
    </div>
  )
}

// ── Step 3: Tax & Verification ────────────────────────────────────────────────

interface Step3Props {
  data: RegistrationData
  onChange: (field: string, value: string | boolean | DesignerSpecialization[]) => void
  errors: Record<string, string>
}

const Step3: React.FC<Step3Props> = ({ data, onChange, errors }) => {
  const validateTIN = (value: string) => {
    const digits = value.replace(/[^\d]/g, '')
    return digits.length === 10
  }

  const handleTINChange = (value: string) => {
    const digits = value.replace(/[^\d]/g, '')
    onChange('tinNumber', digits.slice(0, 10))
    if (digits.length === 10) {
      onChange('tinValid', true)
    } else {
      onChange('tinValid', false)
    }
  }

  return (
    <div className="space-y-5">
      {/* TIN Number */}
      <div>
        <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-1.5">
          TIN Number (Uganda URA) <span className="text-copper-700">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            placeholder="1234567890"
            value={data.tinNumber}
            onChange={(e) => handleTINChange(e.target.value)}
            maxLength={10}
            className={[
              'w-full h-11 px-3.5 rounded-2xl border text-sm text-charcoal-900 font-inter font-semibold',
              'placeholder:text-mist-300 bg-white',
              'focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700/50 transition-all',
              data.tinValid
                ? 'border-emerald-300 bg-emerald-50'
                : errors.tinNumber
                ? 'border-red-300 bg-red-50'
                : 'border-mist-200',
            ].join(' ')}
          />
          {data.tinValid && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Check size={16} className="text-emerald-600" strokeWidth={2.5} />
            </div>
          )}
        </div>
        <p className="text-xs text-mist-400 font-inter mt-1">
          Format: 10 digits (Uganda URA Tax Identification Number)
        </p>
        {errors.tinNumber && (
          <p className="text-xs text-red-500 font-inter mt-0.5">{errors.tinNumber}</p>
        )}
      </div>

      {/* Document Upload */}
      <div>
        <label className="block text-xs font-semibold text-charcoal-800 font-inter mb-2">
          ID Document <span className="text-copper-700">*</span>
        </label>
        <motion.button
          type="button"
          onClick={() => onChange('documentUploaded', !data.documentUploaded)}
          whileTap={{ scale: 0.97 }}
          className={[
            'w-full h-12 rounded-2xl border-2 border-dashed transition-all duration-200',
            data.documentUploaded
              ? 'bg-emerald-50 border-emerald-300'
              : 'bg-mist-50 border-mist-300 hover:border-copper-700/50',
          ].join(' ')}
        >
          <div className="flex items-center justify-center gap-2">
            {data.documentUploaded ? (
              <>
                <CheckCircle2 size={16} className="text-emerald-600" strokeWidth={2} />
                <span className="text-xs font-medium text-emerald-700 font-inter">
                  ID Uploaded
                </span>
              </>
            ) : (
              <>
                <Upload size={16} className="text-mist-400" strokeWidth={2} />
                <span className="text-xs font-medium text-mist-600 font-inter">
                  Upload ID Document
                </span>
              </>
            )}
          </div>
        </motion.button>
        {errors.documentUploaded && (
          <p className="text-xs text-red-500 font-inter mt-1">{errors.documentUploaded}</p>
        )}
      </div>

      {/* Privacy Info */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50 border border-blue-200">
        <Lock size={14} className="text-blue-600 shrink-0 mt-0.5" strokeWidth={2} />
        <p className="text-xs text-blue-700 font-inter leading-relaxed">
          Your TIN is used only for tax processing on withdrawal. It will never be displayed publicly on your profile.
        </p>
      </div>
    </div>
  )
}

// ── Step 4: Review & Submit ───────────────────────────────────────────────────

interface Step4Props {
  data: RegistrationData
  isSubmitting: boolean
  onSubmit: () => void
}

const Step4: React.FC<Step4Props> = ({ data, isSubmitting, onSubmit }) => {
  const expLabel =
    {
      '0-1': 'Less than 1 year',
      '1-3': '1-3 years',
      '3-5': '3-5 years',
      '5-10': '5-10 years',
      '10+': '10+ years',
    }[data.yearsOfExperience] || '—'

  return (
    <div className="space-y-4">
      {/* Review Card */}
      <div className="bg-white rounded-2xl border border-mist-100 shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-mist-100 bg-gradient-to-r from-copper-700/5 to-transparent">
          <p className="text-xs font-semibold text-copper-700 font-inter uppercase tracking-wide">
            Registration Summary
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* Basic Info */}
          <div className="pb-3 border-b border-mist-100">
            <p className="text-xs font-semibold text-mist-400 font-inter uppercase tracking-wide mb-2">
              Basic Information
            </p>
            <div className="space-y-1.5">
              <div>
                <p className="text-[10px] text-mist-400 font-inter uppercase tracking-wide mb-0.5">
                  Public Username
                </p>
                <p className="text-sm font-medium text-charcoal-800 font-inter">
                  {data.publicUsername || '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-mist-400 font-inter uppercase tracking-wide mb-0.5 flex items-center gap-1">
                  <Lock size={8} /> Legal Name (Admin-Only)
                </p>
                <p className="text-sm font-medium text-charcoal-800 font-inter">
                  {data.fullLegalName || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="pb-3 border-b border-mist-100">
            <p className="text-xs font-semibold text-mist-400 font-inter uppercase tracking-wide mb-2">
              Professional Details
            </p>
            <div className="space-y-1.5">
              <div>
                <p className="text-[10px] text-mist-400 font-inter uppercase tracking-wide mb-0.5">
                  Specializations
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.specializations.length > 0 ? (
                    data.specializations.map((spec) => (
                      <span key={spec} className="px-2 py-1 rounded-lg bg-copper-700/10 border border-copper-700/30 text-xs font-medium text-copper-700 font-inter">
                        {SPECIALIZATIONS.find((s) => s.value === spec)?.label || spec}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-mist-500 font-inter">—</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <p className="text-[10px] text-mist-400 font-inter uppercase tracking-wide mb-0.5">
                    Experience
                  </p>
                  <p className="text-xs font-medium text-charcoal-800 font-inter">{expLabel}</p>
                </div>
                <div>
                  <p className="text-[10px] text-mist-400 font-inter uppercase tracking-wide mb-0.5">
                    Hourly Rate
                  </p>
                  <p className="text-xs font-medium text-charcoal-800 font-inter">
                    UGX {data.hourlyRate || '—'}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-[10px] text-mist-400 font-inter uppercase tracking-wide mb-0.5">
                  Bio
                </p>
                <p className="text-xs text-mist-600 font-inter leading-relaxed line-clamp-2">
                  {data.bio || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div>
            <p className="text-xs font-semibold text-mist-400 font-inter uppercase tracking-wide mb-2">
              Verification Status
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                {data.tinValid ? (
                  <Check size={14} className="text-emerald-600" strokeWidth={2} />
                ) : (
                  <AlertCircle size={14} className="text-red-500" strokeWidth={2} />
                )}
                <p className="text-xs font-medium text-charcoal-800 font-inter">
                  TIN: {data.tinNumber ? '✓ Valid' : '✗ Pending'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {data.documentUploaded ? (
                  <Check size={14} className="text-emerald-600" strokeWidth={2} />
                ) : (
                  <AlertCircle size={14} className="text-red-500" strokeWidth={2} />
                )}
                <p className="text-xs font-medium text-charcoal-800 font-inter">
                  ID Document: {data.documentUploaded ? '✓ Uploaded' : '✗ Missing'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-mist-50 border border-mist-200">
        <Lock size={14} className="text-mist-600 shrink-0 mt-0.5" strokeWidth={2} />
        <p className="text-xs text-mist-700 font-inter leading-relaxed">
          Your full legal name and TIN are stored securely and visible only to admin during vetting. They will never appear on your public profile.
        </p>
      </div>

      {/* Submit Button */}
      <motion.button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        whileTap={isSubmitting ? {} : { scale: 0.97 }}
        className="w-full h-13 rounded-2xl bg-gradient-to-r from-copper-700 to-copper-600 text-white font-semibold font-inter text-sm shadow-lg shadow-copper-700/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed py-3.5"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            <CheckCircle2 size={18} strokeWidth={2} />
            Submit for Review
          </>
        )}
      </motion.button>
    </div>
  )
}

// ── Under Review Screen ────────────────────────────────────────────────────────

interface UnderReviewProps {
  userName: string
}

const UnderReview: React.FC<UnderReviewProps> = ({ userName }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-mist-100 to-mist-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <CheckCircle2 size={32} className="text-emerald-600" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        <h1 className="text-2xl font-bold text-charcoal-900 font-grotesk mb-2">
          Documents Under Review
        </h1>

        <p className="text-sm text-mist-600 font-inter mb-6 leading-relaxed">
          Thank you, {userName}! Your registration documents are being reviewed by our admin team. You'll receive a notification once your profile is approved.
        </p>

        <div className="bg-white rounded-2xl border border-mist-100 p-4 mb-6">
          <p className="text-xs font-semibold text-mist-400 font-inter uppercase tracking-wide mb-2">
            What Happens Next
          </p>
          <ul className="text-xs text-mist-600 font-inter space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-copper-700 mt-0.5">•</span>
              <span>Admin reviews your TIN and ID document</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-copper-700 mt-0.5">•</span>
              <span>Verification typically completes within 24-48 hours</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-copper-700 mt-0.5">•</span>
              <span>You'll be notified via app notification and email</span>
            </li>
          </ul>
        </div>

        <p className="text-xs text-mist-500 font-inter">
          In the meantime, you can browse project briefs and prepare your portfolio.
        </p>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

const DesignerRegistration: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useStore()

  const [step, setStep] = useState<FormStep>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [showUnderReview, setShowUnderReview] = useState(false)
  const [direction, setDirection] = useState<1 | -1>(1)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState<RegistrationData>({
    publicUsername: '',
    fullLegalName: '',
    phone: user?.phone || '',
    specializations: [],
    yearsOfExperience: '',
    bio: '',
    hourlyRate: '',
    tinNumber: '',
    tinValid: false,
    documentUploaded: false,
    agreedToTerms: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // ── Validation ────────────────────────────────────────────────────────

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.publicUsername.trim()) newErrors.publicUsername = 'Username is required'
    if (!formData.fullLegalName.trim()) newErrors.fullLegalName = 'Full legal name is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (formData.specializations.length === 0) newErrors.specializations = 'Select at least one specialization'
    if (!formData.yearsOfExperience) newErrors.yearsOfExperience = 'Select your experience level'
    if (!formData.bio.trim()) newErrors.bio = 'Bio is required'
    if (!formData.hourlyRate) newErrors.hourlyRate = 'Hourly rate is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.tinNumber || formData.tinNumber.length !== 10) {
      newErrors.tinNumber = 'TIN must be exactly 10 digits'
    }
    if (!formData.documentUploaded) newErrors.documentUploaded = 'ID document is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── Handlers ────────────────────────────────────────────────────────

  const handleChange = (field: string, value: string | boolean | DesignerSpecialization[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const goNext = () => {
    let valid = false
    if (step === 1) valid = validateStep1()
    if (step === 2) valid = validateStep2()
    if (step === 3) valid = validateStep3()

    if (!valid) return

    if (step < 4) {
      setDirection(1)
      setStep((s) => (s + 1) as FormStep)
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goBack = () => {
    if (step > 1) {
      setDirection(-1)
      setStep((s) => (s - 1) as FormStep)
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate(-1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))
    setIsSubmitting(false)
    setShowToast(true)

    setTimeout(() => {
      setShowToast(false)
      setShowUnderReview(true)
    }, 1800)
  }

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '30%' : '-30%',
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? '-30%' : '30%',
      opacity: 0,
    }),
  }

  if (showUnderReview) {
    return <UnderReview userName={formData.publicUsername} />
  }

  return (
    <div className="min-h-screen bg-mist-100 flex flex-col" ref={scrollRef}>
      <div className="max-w-md mx-auto w-full flex flex-col flex-1">
        {/* ── Top Bar ──────────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-mist-100/95 backdrop-blur-sm pt-4 pb-3 px-4">
          <div className="flex items-center gap-3 mb-4">
            <motion.button
              onClick={goBack}
              className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white border border-mist-100 shadow-sm"
              whileTap={{ scale: 0.88 }}
            >
              <ArrowLeft size={18} strokeWidth={2} className="text-charcoal-800" />
            </motion.button>
            <div className="flex-1">
              <h1 className="text-base font-bold text-charcoal-900 font-grotesk">
                Designer Registration
              </h1>
              <p className="text-xs text-mist-500 font-inter">Step {step} of 4</p>
            </div>
          </div>

          {/* Step indicator */}
          <StepIndicator current={step} total={4} />
        </div>

        {/* ── Form Content ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="px-4 pt-5 pb-6"
            >
              {step === 1 && (
                <Step1 data={formData} onChange={handleChange} errors={errors} />
              )}
              {step === 2 && (
                <Step2 data={formData} onChange={handleChange} errors={errors} />
              )}
              {step === 3 && (
                <Step3 data={formData} onChange={handleChange} errors={errors} />
              )}
              {step === 4 && (
                <Step4 data={formData} isSubmitting={isSubmitting} onSubmit={handleSubmit} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Navigation Buttons ────────────────────────────────────────────── */}
        {step < 4 && (
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-mist-100 p-4">
            <div className="flex gap-3 max-w-md mx-auto">
              {step > 1 && (
                <motion.button
                  onClick={goBack}
                  whileTap={{ scale: 0.97 }}
                  className="flex-none px-5 h-12 rounded-2xl bg-mist-100 border border-mist-200 text-charcoal-700 text-sm font-medium font-inter flex items-center gap-1.5"
                >
                  <ArrowLeft size={16} strokeWidth={2} />
                  Back
                </motion.button>
              )}
              <motion.button
                onClick={goNext}
                whileTap={{ scale: 0.97 }}
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-copper-700 to-copper-600 text-white font-semibold font-inter text-sm shadow-lg shadow-copper-700/25 flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight size={16} strokeWidth={2} />
              </motion.button>
            </div>
          </div>
        )}
      </div>

      <Toast message="Registration submitted successfully!" visible={showToast} />
    </div>
  )
}

export default DesignerRegistration
