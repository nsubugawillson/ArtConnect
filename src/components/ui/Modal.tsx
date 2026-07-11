// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Modal & ConfirmModal Components
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from './Button'

// ── Types ─────────────────────────────────────────────────────────────────────

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children?: React.ReactNode
  size?: ModalSize
  showClose?: boolean
  className?: string
}

// ── Size Map ──────────────────────────────────────────────────────────────────

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

// ── Animation Variants ────────────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.92,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 380,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
}

// ── Modal Component ───────────────────────────────────────────────────────────

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  className = '',
}) => {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [isOpen])

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    },
    [isOpen, onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            key="modal-card"
            className={[
              'relative w-full',
              'bg-white',
              'rounded-2xl',
              'shadow-2xl',
              'overflow-hidden',
              // Copper accent top border
              'before:absolute before:inset-x-0 before:top-0 before:h-1',
              'before:bg-gradient-to-r before:from-copper-700 before:to-copper-500',
              sizeStyles[size],
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Top copper accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-copper-700 to-copper-500" />

            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-center justify-between px-6 pt-5 pb-4">
                {title && (
                  <h2
                    id="modal-title"
                    className="text-lg font-semibold text-charcoal-900 font-grotesk"
                  >
                    {title}
                  </h2>
                )}
                {!title && <span />}
                {showClose && (
                  <button
                    onClick={onClose}
                    className="ml-auto -mr-1 p-1.5 rounded-lg text-mist-400 hover:text-charcoal-900 hover:bg-mist-100 transition-colors"
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="px-6 pb-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ── ConfirmModal Component ────────────────────────────────────────────────────

export interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
  variant?: 'danger' | 'copper'
  loading?: boolean
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'copper',
  loading = false,
}) => {
  const handleCancel = () => {
    onCancel?.()
    onClose()
  }

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
      <div className="flex flex-col items-center text-center gap-4 pt-2 pb-1">
        {/* Icon */}
        <div
          className={[
            'w-14 h-14 rounded-full flex items-center justify-center',
            variant === 'danger' ? 'bg-red-100' : 'bg-copper-700/10',
          ].join(' ')}
        >
          <AlertTriangle
            size={26}
            className={variant === 'danger' ? 'text-red-500' : 'text-copper-700'}
          />
        </div>

        {/* Text */}
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-charcoal-900 font-grotesk">
            {title}
          </h3>
          <p className="text-sm text-mist-500 font-inter leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full pt-2">
          <Button
            variant="secondary"
            fullWidth
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            fullWidth
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default Modal
