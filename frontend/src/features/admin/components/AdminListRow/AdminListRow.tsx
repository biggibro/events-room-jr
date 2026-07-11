import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card/Card'
import styles from './AdminListRow.module.css'

type AdminListRowProps = {
  thumb: ReactNode
  title: ReactNode
  onTitleClick?: () => void
  meta?: ReactNode
  actions?: ReactNode
  isBlocked?: boolean
}

export function AdminListRow({
  thumb,
  title,
  onTitleClick,
  meta,
  actions,
  isBlocked = false,
}: AdminListRowProps) {
  return (
    <Card>
      <div className={`${styles.row} ${isBlocked ? styles.rowBlocked : ''}`.trim()}>
        <div className={`${styles.thumb} ${isBlocked ? styles.thumbBlocked : ''}`.trim()}>
          {thumb}
        </div>
        <div className={styles.content}>
          {onTitleClick ? (
            <button type="button" className={styles.titleLink} onClick={onTitleClick}>
              {title}
            </button>
          ) : (
            <div className={styles.title}>{title}</div>
          )}
          {meta ? <div className={styles.meta}>{meta}</div> : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    </Card>
  )
}
