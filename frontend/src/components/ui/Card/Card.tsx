import clsx from 'clsx'
import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Card.module.css'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div className={clsx('glass-card', styles.root, className)} {...rest}>
      {children}
    </div>
  )
}
