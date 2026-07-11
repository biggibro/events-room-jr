import clsx from 'clsx'
import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import styles from './Input.module.css'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  leftIcon?: ReactNode
}

export function Input({
  label,
  error,
  leftIcon,
  className,
  id,
  ...rest
}: InputProps) {
  const autoId = useId()
  const inputId = id ?? rest.name ?? autoId
  return (
    <div className={styles.wrap}>
      {label ? (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <div className={clsx(leftIcon && styles.iconSlot)}>
        {leftIcon ? <span className={styles.icon}>{leftIcon}</span> : null}
        <input
          id={inputId}
          className={clsx(styles.input, leftIcon && styles.withIcon, className)}
          {...rest}
        />
      </div>
      {error ? <p className={styles.errorText}>{error}</p> : null}
    </div>
  )
}
