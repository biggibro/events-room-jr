import { useEffect, useRef, useState } from 'react'
import { CalendarPlus, LayoutDashboard, LogOut, User } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal'
import { useAuthStore } from '@/stores/authStore'
import { isAdminRole } from '@/utils/roles'
import styles from './Navbar.module.css'

const nav: Array<{ to: string; label: string; end?: boolean }> = [
  { to: '/', label: 'Главная', end: true },
  { to: '/events', label: 'События' },
]

export function Navbar() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpen])

  function handleProfileClick() {
    setMenuOpen(false)
    navigate('/profile')
  }

  function handleAdminClick() {
    setMenuOpen(false)
    navigate('/admin')
  }

  function handleLogoutClick() {
    setMenuOpen(false)
    setLogoutConfirmOpen(true)
  }

  function handleLogoutConfirm() {
    setLogoutConfirmOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.logo} to="/">
          <BrandLogo
            size="md"
            className={styles.logoMark}
            animated="idle"
            aria-hidden
          />
          <span className={styles.logoText}>
            <span className={styles.logoLine}>EVENTS ROOM</span>
            <span className={styles.logoLine}>JACKAROO</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Основная навигация">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.linkActive : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          {user ? (
            <>
              {isAdminRole(user.role) ? (
                <Link
                  to="/events/new"
                  className={styles.createEventBtn}
                  aria-label="Создать событие"
                >
                  <CalendarPlus size={20} aria-hidden />
                </Link>
              ) : null}
              <div className={styles.avatarWrap} ref={menuRef}>
              <button
                type="button"
                className={styles.avatar}
                aria-label="Меню профиля"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <img
                  src={
                    user.avatarUrl ??
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop'
                  }
                  alt=""
                />
              </button>
              {menuOpen && (
                <div className={styles.menu} role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.menuItem}
                    onClick={handleProfileClick}
                  >
                    <User size={16} aria-hidden />
                    Профиль
                  </button>
                  {isAdminRole(user.role) ? (
                    <button
                      type="button"
                      role="menuitem"
                      className={styles.menuItem}
                      onClick={handleAdminClick}
                    >
                      <LayoutDashboard size={16} aria-hidden />
                      Админка
                    </button>
                  ) : null}
                  <button
                    type="button"
                    role="menuitem"
                    className={`${styles.menuItem} ${styles.menuItemDanger}`}
                    onClick={handleLogoutClick}
                  >
                    <LogOut size={16} aria-hidden />
                    Выйти
                  </button>
                </div>
              )}
              <span className={styles.online} aria-hidden />
            </div>
            </>
          ) : (
            <div className={styles.authActions}>
              <Link className={styles.authLink} to="/login">
                Войти
              </Link>
              <Link className={styles.authButton} to="/register">
                Регистрация
              </Link>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={logoutConfirmOpen}
        title="Выход из аккаунта"
        message="Вы уверены, что хотите выйти?"
        confirmLabel="Выйти"
        cancelLabel="Отмена"
        danger
        onConfirm={handleLogoutConfirm}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </header>
  )
}
