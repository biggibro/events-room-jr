import { Outlet } from 'react-router-dom'
import { SessionExpiredRedirect } from '@/components/auth/SessionExpiredRedirect'
import { MobileNav } from '@/layouts/MainLayout/MobileNav'
import { Navbar } from '@/layouts/MainLayout/Navbar'
import styles from './MainLayout.module.css'

export function MainLayout() {
  return (
    <div className={styles.shell}>
      <SessionExpiredRedirect />
      <Navbar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <MobileNav />
    </div>
  )
}
