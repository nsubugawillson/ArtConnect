// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Input & Textarea Components
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'

// ── Input ─────────────────────────────────────────────────────────────────────

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
  labelClassName?: string
  inputClassName?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      containerClassName = '',
      labelClassName = '',
      inputClassName = '',
      id,
      disabled,
      ...rest
    },
    ref
  ) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2)}`
    const hasError = Boolean(error)

    const inputBaseStyles = [
      'w-full',
      'h-11',
      'px-3',
      'bg-mist-50',
      'border',
      'rounded-xl',
      'text-sm',
      'text-charcoal-900',
      'font-inter',
      'placeholder:text-mist-400',
      'outline-none',
      'transition-all duration-200',
      // Focus ring
      'focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700',
      // Error state
      hasError
        ? 'border-red-400 bg-red-50/30 focus:ring-red-400/30 focus:border-red-400'
        : 'border-mist-200 hover:border-mist-300',
      // Icon padding
      leftIcon ? 'pl-10' : '',
      rightIcon ? 'pr-10' : '',
      // Disabled
      disabled ? 'opacity-50 cursor-not-allowed bg-mist-100' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={['flex flex-col gap-1.5', containerClassName].join(' ')}>
        {label && (
          <label
            htmlFor={inputId}
            className={[
              'text-sm font-medium text-charcoal-900 font-inter',
              labelClassName,
            ].join(' ')}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mist-400 pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            className={[inputBaseStyles, inputClassName].join(' ')}
            {...rest}
          />

          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-mist-400">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-red-500 font-inter flex items-center gap-1"
          >
            <span className="inline-block w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold leading-none">
              !
            </span>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="text-xs text-mist-500 font-inter"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// ── Textarea ──────────────────────────────────────────────────────────────────

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  containerClassName?: string
  labelClassName?: string
  textareaClassName?: string
  rows?: number
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      containerClassName = '',
      labelClassName = '',
      textareaClassName = '',
      rows = 4,
      id,
      disabled,
      ...rest
    },
    ref
  ) => {
    const textareaId = id ?? `textarea-${Math.random().toString(36).slice(2)}`
    const hasError = Boolean(error)

    const textareaBaseStyles = [
      'w-full',
      'px-3 py-3',
      'bg-mist-50',
      'border',
      'rounded-xl',
      'text-sm',
      'text-charcoal-900',
      'font-inter',
      'placeholder:text-mist-400',
      'outline-none',
      'resize-y',
      'min-h-[88px]',
      'transition-all duration-200',
      'focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700',
      hasError
        ? 'border-red-400 bg-red-50/30 focus:ring-red-400/30 focus:border-red-400'
        : 'border-mist-200 hover:border-mist-300',
      disabled ? 'opacity-50 cursor-not-allowed bg-mist-100' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={['flex flex-col gap-1.5', containerClassName].join(' ')}>
        {label && (
          <label
            htmlFor={textareaId}
            className={[
              'text-sm font-medium text-charcoal-900 font-inter',
              labelClassName,
            ].join(' ')}
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : helperText
              ? `${textareaId}-helper`
              : undefined
          }
          className={[textareaBaseStyles, textareaClassName].join(' ')}
          {...rest}
        />

        {error && (
          <p
            id={`${textareaId}-error`}
            role="alert"
            className="text-xs text-red-500 font-inter flex items-center gap-1"
          >
            <span className="inline-block w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold leading-none">
              !
            </span>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${textareaId}-helper`}
            className="text-xs text-mist-500 font-inter"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Input
