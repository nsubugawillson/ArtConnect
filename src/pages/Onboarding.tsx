// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Onboarding Carousel (3 slides)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, ShieldCheck, Sparkles, ArrowRight, ChevronRight } from 'lucide-react'

// ── Slide data ────────────────────────────────────────────────────────────────

interface Slide {
  id: number
  icon: React.ReactNode
  title: string
  subtitle: string
  description: string
  bgClass: string        // Tailwind background class
  textClass: string      // primary text colour
  accentClass: string    // accent element colour
  isDark: boolean
  backgroundImage?: string
}

const SLIDES: Slide[] = [
  {
    id: 0,
    icon: <Palette size={72} strokeWidth={1.2} />,
    title: 'Discover Top Designers',
    subtitle: "Uganda's finest creative talent",
    description:
      "Browse curated portfolios from Uganda's most talented graphic, industrial, UI/UX, and branding designers. Every profile is verified and showcases real work.",
    bgClass: 'bg-mist-100',
    textClass: 'text-charcoal-900',
    accentClass: 'text-copper-700',
    isDark: false,
    backgroundImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd82?w=1200&auto=format&fit=crop',
  },
  {
    id: 1,
    icon: <ShieldCheck size={72} strokeWidth={1.2} />,
    title: 'Secure Escrow Payments',
    subtitle: "Pay only when you're satisfied",
    description:
      'Funds are held in secure escrow and released milestone by milestone. No more payment disputes — both clients and designers are fully protected.',
    bgClass: 'bg-copper-700',
    textClass: 'text-white',
    accentClass: 'text-copper-200',
    isDark: true,
    backgroundImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&auto=format&fit=crop',
  },
  {
    id: 2,
    icon: <Sparkles size={72} strokeWidth={1.2} />,
    title: 'Get Your Vision Realized',
    subtitle: 'End-to-end creative collaboration',
    description:
      'From initial brief to final delivery, collaborate seamlessly with your designer through built-in messaging, file sharing, and structured milestone tracking.',
    bgClass: 'bg-charcoal-900',
    textClass: 'text-white',
    accentClass: 'text-copper-400',
    isDark: true,
    backgroundImage: 'https://images.unsplash.com/photo-1541701494672-9d96629bd31c?w=1200&auto=format&fit=crop',
  },
]

// ── Slide variants ────────────────────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
}

const contentVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.46, ease: 'easeOut' },
  }),
}

// ── Progress dots ─────────────────────────────────────────────────────────────

interface DotsProps {
  total: number
  active: number
  isDark: boolean
}

function ProgressDots({ total, active, isDark }: DotsProps) {
  return (
    <div className="flex items-center gap-2" role="tablist" aria-label="Onboarding progress">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          role="tab"
          aria-selected={i === active}
          className={`rounded-full transition-all duration-300 ${
            isDark
              ? i === active
                ? 'bg-white'
                : 'bg-white/30'
              : i === active
              ? 'bg-copper-700'
              : 'bg-copper-700/25'
          }`}
          animate={{ width: i === active ? 28 : 8, height: 8 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        />
      ))}
    </div>
  )
}

// ── Icon frame ────────────────────────────────────────────────────────────────

interface IconFrameProps {
  icon: React.ReactNode
  isDark: boolean
}

function IconFrame({ icon, isDark }: IconFrameProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ring */}
      <motion.div
        className={`absolute rounded-full ${
          isDark ? 'bg-white/8' : 'bg-copper-700/10'
        }`}
        style={{ width: 200, height: 200 }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Inner ring */}
      <div
        className={`absolute rounded-full ${
          isDark ? 'bg-white/12' : 'bg-copper-700/15'
        }`}
        style={{ width: 152, height: 152 }}
      />
      {/* Icon */}
      <div
        className={`relative z-10 rounded-full p-7 ${
          isDark ? 'bg-white/15 text-white' : 'bg-copper-700/20 text-copper-700'
        }`}
      >
        {icon}
      </div>
    </div>
  )
}

// ── Onboarding page ───────────────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  const slide = SLIDES[activeIndex]
  const isLast = activeIndex === SLIDES.length - 1

  const goNext = () => {
    if (isLast) {
      navigate('/auth')
      return
    }
    setDirection(1)
    setActiveIndex((i) => i + 1)
  }

  const goTo = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1)
    setActiveIndex(index)
  }

  const handleSkip = () => navigate('/auth')

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={slide.id}
          className={`absolute inset-0 flex flex-col ${slide.bgClass}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', duration: 0.38, ease: 'easeInOut' }}
        >
          {/* Background image with overlay */}
          {slide.backgroundImage && (
            <>
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("${slide.backgroundImage}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: slide.isDark
                    ? 'rgba(160, 67, 10, 0.5)'
                    : 'rgba(223, 232, 230, 0.4)',
                }}
                aria-hidden="true"
              />
            </>
          )}
          {/* Top bar – skip */}
          <div className="relative z-10 flex items-center justify-between px-6 pt-12 pb-4">
            <ProgressDots
              total={SLIDES.length}
              active={activeIndex}
              isDark={slide.isDark}
            />

            <button
              onClick={handleSkip}
              className={`font-inter text-sm font-medium transition-opacity hover:opacity-70 focus-visible:outline-none ${
                slide.isDark ? 'text-white/70' : 'text-charcoal-900/50'
              }`}
            >
              Skip
            </button>
          </div>

          {/* Illustration area */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8">
            <motion.div
              custom={0}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="mb-12"
            >
              <IconFrame icon={slide.icon} isDark={slide.isDark} />
            </motion.div>

            {/* Text content */}
            <div className="w-full max-w-sm text-center">
              <motion.p
                custom={1}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className={`font-inter mb-2 text-sm font-medium uppercase tracking-widest ${
                  slide.isDark ? 'text-white/50' : 'text-copper-700/60'
                }`}
              >
                {slide.subtitle}
              </motion.p>

              <motion.h2
                custom={2}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className={`font-grotesk mb-5 text-3xl font-bold leading-tight ${slide.textClass}`}
              >
                {slide.title}
              </motion.h2>

              <motion.p
                custom={3}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className={`font-inter text-base leading-relaxed ${
                  slide.isDark ? 'text-white/65' : 'text-charcoal-900/60'
                }`}
              >
                {slide.description}
              </motion.p>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="relative z-10 px-6 pb-12 pt-4">
            <motion.button
              onClick={goNext}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-grotesk text-base font-semibold shadow-lg transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                slide.isDark
                  ? 'bg-white text-charcoal-900 shadow-black/20 hover:bg-mist-100 focus-visible:ring-white'
                  : 'gradient-copper text-white shadow-copper-700/30 hover:brightness-110 focus-visible:ring-copper-700'
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {isLast ? (
                <>
                  Get Started
                  <ChevronRight size={20} className="mt-0.5" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight size={20} className="mt-0.5" />
                </>
              )}
            </motion.button>

            {/* Slide tap navigation hint */}
            <div className="mt-5 flex items-center justify-center gap-4">
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none ${
                    i === activeIndex
                      ? slide.isDark
                        ? 'w-7 bg-white'
                        : 'w-7 bg-copper-700'
                      : slide.isDark
                      ? 'w-2 bg-white/25'
                      : 'w-2 bg-copper-700/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
