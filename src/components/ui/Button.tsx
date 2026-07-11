// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Button Component
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children' | 'ref'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  disabled?: boolean
  className?: string
  children?: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

// ── Style Maps ────────────────────────────────────────────────────────────────

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-gradient-to-r from-copper-700 to-copper-600',
    'text-white',
    'shadow-md shadow-copper-700/30',
    'hover:from-copper-600 hover:to-copper-500',
    'hover:shadow-lg hover:shadow-copper-600/40',
    'active:from-copper-800 active:to-copper-700',
    'disabled:from-copper-700/50 disabled:to-copper-600/50 disabled:shadow-none',
    'border border-transparent',
    'transition-all duration-200',
  ].join(' '),

  secondary: [
    'bg-mist-100',
    'text-charcoal-900',
    'border border-mist-200',
    'hover:bg-mist-200 hover:border-mist-300',
    'disabled:opacity-50',
    'transition-all duration-200',
  ].join(' '),

  outline: [
    'bg-transparent',
    'text-copper-700',
    'border-2 border-copper-700',
    'hover:bg-copper-700 hover:text-white',
    'disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-copper-700',
    'transition-all duration-200',
  ].join(' '),

  ghost: [
    'bg-transparent',
    'text-copper-700',
    'border border-transparent',
    'hover:bg-copper-700/10 hover:border-copper-700/20',
    'disabled:opacity-50',
    'transition-all duration-200',
  ].join(' '),

  danger: [
    'bg-gradient-to-r from-red-600 to-red-500',
    'text-white',
    'shadow-md shadow-red-600/25',
    'hover:from-red-500 hover:to-red-400',
    'hover:shadow-lg hover:shadow-red-500/35',
    'disabled:opacity-50 disabled:shadow-none',
    'border border-transparent',
    'transition-all duration-200',
  ].join(' '),
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
}

// ── Component ─────────────────────────────────────────────────────────────────

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled = false,
      className = '',
      children,
      type = 'button',
      onClick,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    const baseStyles = [
      'inline-flex items-center justify-center',
      'font-medium',
      'font-inter',
      'select-none',
      'cursor-pointer',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-copper-600',
      'focus-visible:ring-offset-2',
      isDisabled ? 'cursor-not-allowed' : '',
      fullWidth ? 'w-full' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        whileTap={isDisabled ? {} : { scale: 0.97 }}
        whileHover={isDisabled ? {} : { scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={[baseStyles, variantStyles[variant], sizeStyles[size], className]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {loading ? (
          <>
            <Loader2
              className="animate-spin shrink-0"
              size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
            />
            {children && (
              <span className="opacity-70">{children}</span>
            )}
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="shrink-0 flex items-center">{leftIcon}</span>
            )}
            {children}
            {rightIcon && (
              <span className="shrink-0 flex items-center">{rightIcon}</span>
            )}
          </>
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export default Button
