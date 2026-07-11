import clsx from 'clsx'
import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Badge.module.css'

export type BadgeTone =
  | 'official'
  | 'community'
  | 'neutral'
  | 'success'
  | 'danger'
  | 'limited'
  | 'bestseller'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone: BadgeTone
  children: ReactNode
}

export function Badge({ tone, className, children, ...rest }: BadgeProps) {
  return (
    <span className={clsx(styles.badge, styles[tone], className)} {...rest}>
      {children}
    </span>
  )
}
