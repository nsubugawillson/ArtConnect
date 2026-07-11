// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Splash Screen
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

// ── Animated particle dot ─────────────────────────────────────────────────────

interface ParticleProps {
  style: React.CSSProperties
  delay: number
  duration: number
}

function Particle({ style, delay, duration }: ParticleProps) {
  return (
    <motion.div
      className="absolute rounded-full bg-copper-700 opacity-40"
      style={style}
      initial={{ y: 0, opacity: 0 }}
      animate={{
        y: [0, -120, -240],
        opacity: [0, 0.5, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  )
}

// ── Particle field configuration ─────────────────────────────────────────────

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${5 + (i * 5.5) % 92}%`,
  bottom: `${(i * 7) % 30}%`,
  width: `${4 + (i % 4) * 2}px`,
  height: `${4 + (i % 4) * 2}px`,
  delay: (i * 0.35) % 3.5,
  duration: 3 + (i % 5) * 0.6,
}))

// ── Logo mark SVG ─────────────────────────────────────────────────────────────

function LogoMark() {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ArtConnect logo mark"
    >
      {/* Copper circle base */}
      <circle cx="50" cy="50" r="48" fill="#A0430A" />
      <circle cx="50" cy="50" r="44" fill="#B84D10" />

      {/* Paintbrush stroke decorative arc */}
      <path
        d="M 22 72 Q 50 18 78 72"
        stroke="#E4521F"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M 26 68 Q 50 24 74 68"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* "AC" monogram */}
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontFamily="Space Grotesk, sans-serif"
        fontWeight="700"
        fontSize="28"
        fill="white"
        letterSpacing="-1"
      >
        AC
      </text>

      {/* Paintbrush tip detail at bottom right */}
      <circle cx="72" cy="72" r="5" fill="#E4521F" />
      <circle cx="72" cy="72" r="2.5" fill="white" opacity="0.6" />
    </svg>
  )
}

// ── Splash Screen ─────────────────────────────────────────────────────────────

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding', { replace: true })
    }, 2500)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div
      className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#1A1A1A' }}
    >
      {/* Full-screen background image with overlay */}
      <div
        className="absolute inset-0 blur-sm"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden="true"
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        aria-hidden="true"
      />

      {/* Particle field */}
      {PARTICLES.map((p) => (
        <Particle
          key={p.id}
          delay={p.delay}
          duration={p.duration}
          style={{
            left: p.left,
            bottom: p.bottom,
            width: p.width,
            height: p.height,
            position: 'absolute',
          }}
        />
      ))}

      {/* Radial glow behind logo */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(160,67,10,0.18) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Logo container */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo mark – scales in */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.1,
          }}
          className="drop-shadow-2xl"
        >
          <LogoMark />
        </motion.div>

        {/* Brand name */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.45, ease: 'easeOut' }}
        >
          <h1
            className="font-grotesk text-4xl font-bold tracking-tight text-white"
            style={{ letterSpacing: '-0.02em' }}
          >
            ArtConnect
            <span className="text-copper-500">.Ug</span>
          </h1>

          <motion.p
            className="font-inter text-base tracking-wide"
            style={{ color: 'rgba(223,232,230,0.70)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.75 }}
          >
            Where creativity meets craft
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Bottom loading indicator */}
      <motion.div
        className="absolute bottom-14 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.4 }}
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 rounded-full bg-copper-700"
              initial={{ width: 6 }}
              animate={{ width: i === 1 ? 24 : 6, opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.2,
                delay: 1.2 + i * 0.15,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
