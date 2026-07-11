import { CalendarDays, Grid } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import styles from './MobileNav.module.css'

const items = [
  { to: '/', label: 'Главное', icon: Grid },
  { to: '/events', label: 'События', icon: CalendarDays },
]

export function MobileNav() {
  return (
    <nav className={styles.nav} aria-label="Мобильная навигация">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `${styles.item} ${isActive ? styles.itemActive : ''}`
          }
        >
          <Icon size={20} aria-hidden />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
