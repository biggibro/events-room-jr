import clsx from 'clsx'
import { useId } from 'react'
import type { SelectHTMLAttributes } from 'react'
import styles from './Select.module.css'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  selectSize?: 'md' | 'sm'
}

export function Select({
  label,
  error,
  selectSize = 'md',
  className,
  id,
  children,
  ...rest
}: SelectProps) {
  const autoId = useId()
  const selectId = id ?? rest.name ?? autoId

  return (
    <div className={styles.wrap}>
      {label ? (
        <label className={styles.label} htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={clsx(
          styles.select,
          selectSize === 'sm' && styles.selectSm,
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      {error ? <p className={styles.errorText}>{error}</p> : null}
    </div>
  )
}
