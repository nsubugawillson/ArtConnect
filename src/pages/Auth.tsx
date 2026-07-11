// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Phone + OTP Authentication Screen
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, ArrowLeft, RefreshCw, Loader2, CircleUser as UserCircle2, Check, User, Lock, Eye, EyeOff } from 'lucide-react'
import { useStore, getDashboardPath } from '../lib/store'
import * as api from '../lib/api'
import type { User as UserType } from '../lib/types'

// ── Animation variants ────────────────────────────────────────────────────────

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.22 } },
}

// ── OTP Input Component ───────────────────────────────────────────────────────

interface OTPInputProps {
  length: number
  value: string
  onChange: (val: string) => void
  hasError: boolean
}

function OTPInput({ length, value, onChange, hasError }: OTPInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([])

  const digits = value.padEnd(length, '').slice(0, length).split('')

  const focusAt = (i: number) => {
    refs.current[Math.max(0, Math.min(i, length - 1))]?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (digits[i]) {
        const next = digits.map((d, idx) => (idx === i ? '' : d)).join('').trimEnd()
        onChange(next)
      } else if (i > 0) {
        const next = digits.map((d, idx) => (idx === i - 1 ? '' : d)).join('').trimEnd()
        onChange(next)
        focusAt(i - 1)
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focusAt(i - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      focusAt(i + 1)
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1)
    if (!char) return
    const newDigits = [...digits]
    newDigits[i] = char
    const newVal = newDigits.join('').replace(/\s/g, '')
    onChange(newVal)
    focusAt(i + 1)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted) {
      onChange(pasted)
      focusAt(Math.min(pasted.length, length - 1))
    }
  }

  return (
    <div className="flex gap-3" role="group" aria-label="One-time passcode input">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => handleInput(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`h-14 w-14 rounded-xl border-2 text-center font-grotesk text-2xl font-bold transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-1 ${
            hasError
              ? 'border-red-400 bg-red-50 text-red-600 focus:border-red-500 focus:ring-red-400/30'
              : digit
              ? 'border-copper-700 bg-copper-50 text-copper-700 focus:border-copper-700 focus:ring-copper-700/25'
              : 'border-mist-200 bg-white text-charcoal-900 focus:border-copper-700 focus:ring-copper-700/20'
          }`}
        />
      ))}
    </div>
  )
}

// ── Countdown hook ────────────────────────────────────────────────────────────

function useCountdown(seconds: number, active: boolean) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (!active) { setRemaining(seconds); return }
    if (remaining <= 0) return
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [active, remaining, seconds])

  const reset = useCallback(() => setRemaining(seconds), [seconds])

  return { remaining, reset }
}

// ── Demo login button ─────────────────────────────────────────────────────────

interface DemoButtonProps {
  label: string
  sublabel: string
  onClick: () => void
  colour: 'copper' | 'mist' | 'dark'
}

function DemoButton({ label, sublabel, onClick, colour }: DemoButtonProps) {
  const base =
    'flex flex-col items-center gap-0.5 rounded-xl border-2 px-4 py-3 text-center transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper-700 focus-visible:ring-offset-1 hover:shadow-md'

  const styles = {
    copper: 'border-copper-700 bg-copper-50 text-copper-700 hover:bg-copper-700 hover:text-white',
    mist: 'border-mist-200 bg-mist-50 text-charcoal-900 hover:bg-mist-200',
    dark: 'border-charcoal-900 bg-charcoal-900 text-white hover:bg-charcoal-800',
  }

  return (
    <button onClick={onClick} className={`${base} ${styles[colour]}`}>
      <UserCircle2 size={20} className="mb-0.5" />
      <span className="font-grotesk text-xs font-semibold">{label}</span>
      <span className="font-inter text-[10px] opacity-60">{sublabel}</span>
    </button>
  )
}

// ── Auth Page ─────────────────────────────────────────────────────────────────

type AuthStep = 'login' | 'phone' | 'otp'

export default function Auth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUser, setProfile, loadInitialData } = useStore()

  const role = searchParams.get('role') || 'client'
  const isDesigner = role === 'designer'

  const [step, setStep] = useState<AuthStep>('login')
  const [phone, setPhone] = useState('')
  const [tin, setTin] = useState('')
  const [otp, setOtp] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [tinError, setTinError] = useState('')
  const [otpError, setOtpError] = useState('')
  const [loginError, setLoginError] = useState('')

  const { remaining, reset: resetCountdown } = useCountdown(30, step === 'otp')

  const isTinValid = tin.length === 10 && /^\d+$/.test(tin)

  // ── Helpers ──────────────────────────────────────────────────────────────

  const formattedPhone = `+256 ${phone}`

  const resolveAndNavigate = (user: UserType) => {
    setUser(user)
    navigate(getDashboardPath(user.role))
  }

  // ── Username/Password Login ─────────────────────────────────────────────

  const handleLogin = async () => {
    if (!username.trim()) {
      setLoginError('Please enter your username.')
      return
    }
    if (!password) {
      setLoginError('Please enter your password.')
      return
    }
    setLoginError('')
    setIsLoading(true)

    try {
      const email = `${username.trim().toLowerCase()}@artconnect.ug`
      const { data, error } = await api.signIn(email, password)

      if (error) {
        setLoginError(error.message || 'Invalid username or password.')
        setIsLoading(false)
        return
      }

      if (!data || !data.session) {
        setLoginError('Login failed. No session created.')
        setIsLoading(false)
        return
      }

      const { data: profile, error: profileError } = await api.getCurrentProfile()

      if (profileError || !profile) {
        setLoginError('Failed to load profile. Please try again.')
        setIsLoading(false)
        return
      }

      const user: UserType = {
        id: profile.id,
        phone: profile.phone ?? '',
        name: profile.name,
        username: profile.username ?? null,
        role: (profile.role as UserType['role']) ?? (role as UserType['role']),
        avatar_url: profile.avatar_url ?? null,
        created_at: profile.created_at ?? new Date().toISOString(),
      }
      await loadInitialData(user.id)
      if (user.role === 'designer') {
        const { data: dp } = await api.getDesignerProfile(user.id)
        if (dp) setProfile(dp as any)
      }
      setIsLoading(false)
      resolveAndNavigate(user)
    } catch (err) {
      console.error('Login error:', err)
      setLoginError('Login failed. Please try again.')
      setIsLoading(false)
    }
  }

  // ── Send OTP ──────────────────────────────────────────────────────────────

  const handleSendOTP = async () => {
    const stripped = phone.replace(/\D/g, '')
    if (stripped.length < 7) {
      setPhoneError('Please enter a valid Ugandan phone number.')
      return
    }
    setPhoneError('')

    if (isDesigner && !isTinValid) {
      setTinError('TIN must be 10 digits (Uganda URA format).')
      return
    }
    setTinError('')

    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setIsLoading(false)
    setStep('otp')
  }

  // ── Verify OTP ────────────────────────────────────────────────────────────

  const handleVerifyOTP = async () => {
    if (otp.length < 4) {
      setOtpError('Please enter a 4-digit code.')
      return
    }
    setOtpError('')
    setIsLoading(true)

    try {
      const fullPhone = `+256${phone.replace(/\D/g, '')}`
      const email = `${fullPhone.replace('+', '')}@artconnect.ug`
      const phonePassword = `AC${fullPhone.replace('+', '')}`

      const { data: signInData, error: signInError } = await api.signIn(email, phonePassword)

      if (signInError) {
        // User doesn't exist - go to registration
        navigate(`/role-selection?phone=${encodeURIComponent(fullPhone)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(phonePassword)}`)
        setIsLoading(false)
        return
      }

      if (signInData && signInData.session) {
        const { data: profile, error: profileError } = await api.getCurrentProfile()
        if (profileError || !profile) {
          setOtpError('Failed to load profile. Please try again.')
          setIsLoading(false)
          return
        }
        const user: UserType = {
          id: profile.id,
          phone: profile.phone ?? fullPhone,
          name: profile.name,
          username: profile.username ?? null,
          role: (profile.role as UserType['role']) ?? (role as UserType['role']),
          avatar_url: profile.avatar_url ?? null,
          created_at: profile.created_at ?? new Date().toISOString(),
        }
        await loadInitialData(user.id)
        if (user.role === 'designer') {
          const { data: dp } = await api.getDesignerProfile(user.id)
          if (dp) setProfile(dp as any)
        }
        setIsLoading(false)
        resolveAndNavigate(user)
      } else {
        setOtpError('Verification failed. Please try again.')
        setIsLoading(false)
      }
    } catch (err) {
      console.error('OTP verification error:', err)
      setOtpError('Verification failed. Please try again.')
      setIsLoading(false)
    }
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────

  const handleResend = async () => {
    if (remaining > 0) return
    setOtp('')
    setOtpError('')
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setIsLoading(false)
    resetCountdown()
  }

  // ── Demo quick logins ───────────────────────────────────────────────────

  const handleDemoLogin = async (demoRole: 'client' | 'designer' | 'admin') => {
    setIsLoading(true)
    setLoginError('')
    try {
      const demoUsername = `demo_${demoRole}_${Date.now()}`
      const demoEmail = `${demoUsername}@artconnect.ug`
      const demoPassword = 'demo123456'
      const demoName = demoRole === 'client' ? 'Amara Okafor' : demoRole === 'designer' ? 'Sarah Nakato' : 'Admin User'
      const { data, error } = await api.signUp(
        demoEmail,
        demoPassword,
        demoName,
        demoRole,
        demoUsername
      )
      if (error) {
        setLoginError(error.message || 'Demo login failed. Please try again.')
        setIsLoading(false)
        return
      }
      if (!data || !data.user) {
        setLoginError('Demo login failed. Please try again.')
        setIsLoading(false)
        return
      }

      const userId = data.user.id

      if (data.session) {
        const user: UserType = {
          id: userId,
          phone: '',
          name: demoName,
          username: demoUsername,
          role: demoRole,
          avatar_url: null,
          created_at: new Date().toISOString(),
        }
        await loadInitialData(userId)
        if (demoRole === 'designer') {
          const { data: dp } = await api.getDesignerProfile(userId)
          if (dp) setProfile(dp as any)
        }
        setIsLoading(false)
        resolveAndNavigate(user)
      } else {
        // Try to sign in with the created credentials
        const { data: signInData, error: signInError } = await api.signIn(demoEmail, demoPassword)
        if (signInError || !signInData) {
          setLoginError('Demo login failed. Please try again.')
          setIsLoading(false)
          return
        }
        const { data: profile } = await api.getCurrentProfile()
        if (profile) {
          const user: UserType = {
            id: profile.id,
            phone: '',
            name: demoName,
            username: demoUsername,
            role: demoRole,
            avatar_url: null,
            created_at: new Date().toISOString(),
          }
          await loadInitialData(user.id)
          if (demoRole === 'designer') {
            const { data: dp } = await api.getDesignerProfile(user.id)
            if (dp) setProfile(dp as any)
          }
          setIsLoading(false)
          resolveAndNavigate(user)
        } else {
          setLoginError('Demo login failed. Could not load profile.')
          setIsLoading(false)
        }
      }
    } catch (err) {
      console.error('Demo login error:', err)
      setLoginError('Demo login failed.')
      setIsLoading(false)
    }
  }

  // ── OTP auto-submit ──────────────────────────────────────────────────────

  useEffect(() => {
    if (otp.length === 4) {
      handleVerifyOTP()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col bg-mist-100">
      {/* Decorative top strip */}
      <div className="gradient-copper h-1.5 w-full" />

      <div className="flex flex-1 flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          {/* Logo mark */}
          <motion.div
            className="mb-8 flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-copper shadow-lg shadow-copper-700/30">
              <span className="font-grotesk text-xl font-bold text-white">AC</span>
            </div>
            <p className="font-inter text-xs font-medium tracking-widest text-charcoal-900/40 uppercase">
              ArtConnect.Ug
            </p>
          </motion.div>

          {/* Card */}
          <AnimatePresence mode="wait">
            {step === 'login' ? (
              <motion.div
                key="login-step"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="card p-7 shadow-xl shadow-charcoal-900/8"
              >
                <h1 className="font-grotesk mb-1 text-2xl font-bold text-charcoal-900">
                  Welcome Back
                </h1>
                <p className="font-inter mb-7 text-sm text-charcoal-900/50">
                  Sign in with your username and password
                </p>

                <label className="font-inter mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-900/50">
                  Username
                </label>

                <div className="mb-4 flex items-stretch overflow-hidden rounded-xl border-2 border-mist-200 bg-white transition-all focus-within:border-copper-700 focus-within:ring-2 focus-within:ring-copper-700/20">
                  <div className="flex items-center gap-1.5 border-r-2 border-mist-200 bg-mist-50 px-3.5 py-3">
                    <User size={16} className="text-charcoal-900/50" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setLoginError('') }}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="flex-1 bg-transparent px-4 py-3 font-inter text-sm text-charcoal-900 placeholder-charcoal-900/25 outline-none"
                    autoFocus
                  />
                </div>

                <label className="font-inter mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-900/50">
                  Password
                </label>

                <div className="mb-1 flex items-stretch overflow-hidden rounded-xl border-2 border-mist-200 bg-white transition-all focus-within:border-copper-700 focus-within:ring-2 focus-within:ring-copper-700/20">
                  <div className="flex items-center gap-1.5 border-r-2 border-mist-200 bg-mist-50 px-3.5 py-3">
                    <Lock size={16} className="text-charcoal-900/50" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setLoginError('') }}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="flex-1 bg-transparent px-4 py-3 font-inter text-sm text-charcoal-900 placeholder-charcoal-900/25 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center px-3 text-charcoal-900/40 hover:text-charcoal-900/70 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {loginError && (
                  <p className="font-inter mt-1.5 text-xs text-red-500">{loginError}</p>
                )}

                <p className="font-inter mt-2 mb-6 text-xs text-charcoal-900/35">
                  New user?{' '}
                  <button
                    onClick={() => navigate('/role-selection')}
                    className="text-copper-700 font-medium hover:underline"
                  >
                    Create an account
                  </button>
                </p>

                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="btn-primary btn-lg w-full rounded-xl"
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Lock size={18} />
                  )}
                  {isLoading ? 'Signing in…' : 'Sign In'}
                </button>

                {/* Divider */}
                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-charcoal-900/10" />
                  <span className="font-inter text-xs text-charcoal-900/35">or</span>
                  <div className="h-px flex-1 bg-charcoal-900/10" />
                </div>

                {/* Phone login option */}
                <button
                  onClick={() => setStep('phone')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-mist-200 bg-white py-3 font-inter text-sm font-medium text-charcoal-900 transition-all hover:border-copper-700/40 hover:bg-mist-50"
                >
                  <Phone size={16} />
                  Sign in with Phone
                </button>
              </motion.div>
            ) : step === 'phone' ? (
              <motion.div
                key="phone-step"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="card p-7 shadow-xl shadow-charcoal-900/8"
              >
                {/* Back button */}
                <button
                  onClick={() => setStep('login')}
                  className="mb-5 flex items-center gap-1.5 font-inter text-xs font-medium text-charcoal-900/50 transition-opacity hover:opacity-100 focus-visible:outline-none"
                >
                  <ArrowLeft size={14} />
                  Back to login
                </button>

                <h1 className="font-grotesk mb-1 text-2xl font-bold text-charcoal-900">
                  Phone Number
                </h1>
                <p className="font-inter mb-7 text-sm text-charcoal-900/50">
                  Enter your phone number to continue
                </p>

                <label className="font-inter mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-900/50">
                  Phone Number
                </label>

                <div className="mb-1 flex items-stretch overflow-hidden rounded-xl border-2 border-mist-200 bg-white transition-all focus-within:border-copper-700 focus-within:ring-2 focus-within:ring-copper-700/20">
                  {/* Country prefix */}
                  <div className="flex items-center gap-1.5 border-r-2 border-mist-200 bg-mist-50 px-3.5 py-3">
                    <span className="text-base">🇺🇬</span>
                    <span className="font-grotesk text-sm font-semibold text-charcoal-900">
                      +256
                    </span>
                  </div>
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="7XX XXX XXX"
                    value={phone}
                    onChange={(e) => {
                      setPhoneError('')
                      setPhone(e.target.value.replace(/[^\d\s]/g, ''))
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                    className="flex-1 bg-transparent px-4 py-3 font-inter text-sm text-charcoal-900 placeholder-charcoal-900/25 outline-none"
                    autoFocus
                  />
                </div>

                {phoneError && (
                  <p className="font-inter mt-1.5 text-xs text-red-500">{phoneError}</p>
                )}

                {/* TIN field for designers */}
                {isDesigner && (
                  <>
                    <label className="font-inter mt-5 mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-900/50">
                      TIN Number (Uganda URA)
                    </label>

                    <div className="mb-1 flex items-stretch overflow-hidden rounded-xl border-2 border-mist-200 bg-white transition-all focus-within:border-copper-700 focus-within:ring-2 focus-within:ring-copper-700/20">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="1234567890"
                        value={tin}
                        maxLength={10}
                        onChange={(e) => {
                          setTinError('')
                          setTin(e.target.value.replace(/\D/g, ''))
                        }}
                        className="flex-1 bg-transparent px-4 py-3 font-inter text-sm text-charcoal-900 placeholder-charcoal-900/25 outline-none"
                      />
                      {isTinValid && (
                        <div className="flex items-center px-3">
                          <Check size={18} className="text-green-600" />
                        </div>
                      )}
                    </div>

                    {tinError && (
                      <p className="font-inter mt-1.5 text-xs text-red-500">{tinError}</p>
                    )}
                  </>
                )}

                <p className="font-inter mt-2 mb-6 text-xs text-charcoal-900/35">
                  Demo: Any phone number works
                </p>

                <button
                  onClick={handleSendOTP}
                  disabled={isLoading}
                  className="btn-primary btn-lg w-full rounded-xl"
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Phone size={18} />
                  )}
                  {isLoading ? 'Sending…' : 'Send OTP'}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="otp-step"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="card p-7 shadow-xl shadow-charcoal-900/8"
              >
                {/* Back button */}
                <button
                  onClick={() => { setStep('phone'); setOtp(''); setOtpError('') }}
                  className="mb-5 flex items-center gap-1.5 font-inter text-xs font-medium text-charcoal-900/50 transition-opacity hover:opacity-100 focus-visible:outline-none"
                >
                  <ArrowLeft size={14} />
                  Change number
                </button>

                <h1 className="font-grotesk mb-1 text-2xl font-bold text-charcoal-900">
                  Enter Code
                </h1>
                <p className="font-inter mb-7 text-sm text-charcoal-900/50">
                  We sent a code to{' '}
                  <span className="font-semibold text-copper-700">{formattedPhone}</span>
                </p>

                <div className="mb-2 flex justify-center">
                  <OTPInput
                    length={4}
                    value={otp}
                    onChange={(val) => { setOtp(val); setOtpError('') }}
                    hasError={!!otpError}
                  />
                </div>

                {otpError && (
                  <p className="font-inter mt-1 text-center text-xs text-red-500">{otpError}</p>
                )}

                {/* Demo hint */}
                <div className="mt-3 mb-6 rounded-lg border border-copper-700/20 bg-copper-50 px-3 py-2 text-center">
                  <p className="font-inter text-xs text-copper-700">
                    Demo code:{' '}
                    <button
                      className="font-bold underline underline-offset-2 hover:opacity-80"
                      onClick={() => setOtp('1234')}
                    >
                      1234
                    </button>
                  </p>
                </div>

                <button
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otp.length < 4}
                  className="btn-primary btn-lg mb-4 w-full rounded-xl"
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : null}
                  {isLoading ? 'Verifying…' : 'Verify'}
                </button>

                {/* Resend */}
                <div className="flex items-center justify-center gap-1.5 font-inter text-sm text-charcoal-900/50">
                  <RefreshCw size={13} />
                  {remaining > 0 ? (
                    <span>Resend in {remaining}s</span>
                  ) : (
                    <button
                      onClick={handleResend}
                      className="font-medium text-copper-700 underline underline-offset-2 hover:opacity-80 focus-visible:outline-none"
                    >
                      Resend code
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Demo Quick Login Section */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-charcoal-900/10" />
              <span className="font-inter text-xs font-medium text-charcoal-900/35 uppercase tracking-wider">
                Demo Quick Login
              </span>
              <div className="h-px flex-1 bg-charcoal-900/10" />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <DemoButton
                label="Demo Client"
                sublabel="Amara Okafor"
                colour="mist"
                onClick={() => handleDemoLogin('client')}
              />
              <DemoButton
                label="Demo Designer"
                sublabel="Sarah Nakato"
                colour="copper"
                onClick={() => handleDemoLogin('designer')}
              />
              <DemoButton
                label="Demo Admin"
                sublabel="Admin User"
                colour="dark"
                onClick={() => handleDemoLogin('admin')}
              />
            </div>

            <button
              onClick={() => navigate('/admin/dashboard')}
              className="mt-4 text-center text-[10px] text-charcoal-900/30 hover:text-copper-700 transition-colors font-inter focus-visible:outline-none w-full"
            >
              Admin Dashboard
            </button>
          </motion.div>
        </div>
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && step !== 'login' && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/20 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="rounded-2xl bg-white p-5 shadow-2xl">
              <Loader2 size={28} className="animate-spin text-copper-700" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
