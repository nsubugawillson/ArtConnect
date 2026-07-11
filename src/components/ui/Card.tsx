// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Card Component
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

// ── Types ─────────────────────────────────────────────────────────────────────

export type CardVariant = 'default' | 'dark' | 'glass'

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  variant?: CardVariant
  hoverable?: boolean
  className?: string
  children?: React.ReactNode
  onClick?: () => void
}

// ── Style Maps ────────────────────────────────────────────────────────────────

const variantStyles: Record<CardVariant, string> = {
  default: [
    'bg-white',
    'border border-mist-100',
    'shadow-sm',
  ].join(' '),

  dark: [
    'bg-charcoal-800',
    'border border-white/10',
    'shadow-lg',
    'text-white',
  ].join(' '),

  glass: [
    'bg-white/10',
    'backdrop-blur-md',
    'border border-white/20',
    'shadow-xl',
    'text-white',
  ].join(' '),
}

const hoverableVariantStyles: Record<CardVariant, string> = {
  default: 'hover:border-copper-700/40 hover:shadow-copper-700/10',
  dark: 'hover:border-copper-700/50 hover:shadow-copper-700/20',
  glass: 'hover:border-copper-500/40 hover:bg-white/15',
}

// ── Component ─────────────────────────────────────────────────────────────────

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      hoverable = false,
      className = '',
      children,
      onClick,
      ...rest
    },
    ref
  ) => {
    const baseStyles = [
      'rounded-2xl',
      'overflow-hidden',
      'transition-all duration-300',
      onClick || hoverable ? 'cursor-pointer' : '',
    ]
      .filter(Boolean)
      .join(' ')

    const hoverStyles = hoverable
      ? [
          'hover:shadow-md',
          hoverableVariantStyles[variant],
        ].join(' ')
      : ''

    return (
      <motion.div
        ref={ref}
        onClick={onClick}
        whileHover={
          hoverable
            ? {
                y: -4,
                boxShadow: '0 12px 32px -4px rgba(160, 67, 10, 0.15)',
                transition: { type: 'spring', stiffness: 350, damping: 28 },
              }
            : undefined
        }
        whileTap={onClick ? { scale: 0.99 } : undefined}
        className={[baseStyles, variantStyles[variant], hoverStyles, className]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'

// ── Card Sub-components ───────────────────────────────────────────────────────

export interface CardHeaderProps {
  className?: string
  children?: React.ReactNode
}

export const CardHeader: React.FC<CardHeaderProps> = ({ className = '', children }) => (
  <div className={['px-5 pt-5 pb-3', className].join(' ')}>{children}</div>
)

export interface CardBodyProps {
  className?: string
  children?: React.ReactNode
}

export const CardBody: React.FC<CardBodyProps> = ({ className = '', children }) => (
  <div className={['px-5 py-4', className].join(' ')}>{children}</div>
)

export interface CardFooterProps {
  className?: string
  children?: React.ReactNode
}

export const CardFooter: React.FC<CardFooterProps> = ({ className = '', children }) => (
  <div
    className={[
      'px-5 py-4 border-t border-mist-100/60',
      className,
    ].join(' ')}
  >
    {children}
  </div>
)

export default Card
