import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AdminEventsTab } from '@/features/admin/tabs/AdminEventsTab'
import { AdminLocationsTab } from '@/features/admin/tabs/AdminLocationsTab'
import { AdminUsersTab } from '@/features/admin/tabs/AdminUsersTab'
import styles from './AdminPage.module.css'

export const ADMIN_TABS = ['События', 'Пользователи', 'Локации'] as const
export type AdminTab = (typeof ADMIN_TABS)[number]

type AdminPageLocationState = {
  tab?: AdminTab
}

export function AdminPage() {
  const location = useLocation()
  const [tab, setTab] = useState<AdminTab>(() => {
    const state = location.state as AdminPageLocationState | null
    return state?.tab && ADMIN_TABS.includes(state.tab) ? state.tab : ADMIN_TABS[0]
  })

  useEffect(() => {
    const state = location.state as AdminPageLocationState | null
    if (state?.tab && ADMIN_TABS.includes(state.tab)) {
      setTab(state.tab)
    }
  }, [location.key, location.state])

  return (
    <div className={`page-shell ${styles.page}`}>
      <header className={styles.head}>
        <h1 className={styles.title}>Админ-панель</h1>
        <p className={styles.subtitle}>
          Управление событиями, локациями и пользователями платформы.
        </p>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Разделы админ-панели">
        {ADMIN_TABS.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            className={`${styles.tab} ${tab === item ? styles.tabActive : ''}`}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {tab === ADMIN_TABS[0] ? (
          <AdminEventsTab />
        ) : tab === ADMIN_TABS[1] ? (
          <AdminUsersTab />
        ) : (
          <AdminLocationsTab />
        )}
      </div>
    </div>
  )
}
