import clsx from 'clsx'
import { BrandLogo } from '@/components/brand/BrandLogo'
import styles from './BrandLoader.module.css'

type BrandLoaderProps = {
  label?: string
  inline?: boolean
  className?: string
}

export function BrandLoader({ label, inline, className }: BrandLoaderProps) {
  return (
    <div
      className={clsx(styles.root, inline && styles.inline, className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <BrandLogo size="lg" animated="loading" aria-hidden />
      {label ? <p className={styles.label}>{label}</p> : null}
    </div>
  )
}
