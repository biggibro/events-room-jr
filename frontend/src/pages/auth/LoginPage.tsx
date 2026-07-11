import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button/Button'
import { Input } from '@/components/ui/Input/Input'
import { SeedAccountsHint } from '@/pages/auth/SeedAccountsHint'
import styles from './AuthPage.module.css'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const clearLogoutReason = useAuthStore((state) => state.clearLogoutReason)
  const [email, setEmail] = useState('player@jackaroo.local')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const sessionExpired =
    (location.state as { reason?: string } | null)?.reason === 'expired'

  useEffect(() => {
    if (sessionExpired) {
      clearLogoutReason()
    }
  }, [sessionExpired, clearLogoutReason])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)
    try {
      await login(email, password)
      const redirectTo =
        (location.state as { from?: { pathname: string } } | null)?.from
          ?.pathname ?? '/events'
      navigate(redirectTo)
    } catch {
      setError('Не удалось войти. Попробуйте ещё раз.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className={`page-shell ${styles.wrap}`}>
      <h1 className={styles.title}>С возвращением</h1>
      <p className={styles.lead}>Войдите в аккаунт Events Room Jackaroo.</p>
      {sessionExpired ? (
        <p className={styles.error} role="status">
          Сессия истекла. Войдите снова.
        </p>
      ) : null}
      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          label="Пароль"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" fullWidth disabled={pending}>
          {pending ? 'Вход…' : 'Войти'}
        </Button>
        <SeedAccountsHint
          onSelect={(account) => {
            setEmail(account.email)
            setPassword(account.password)
            setError(null)
          }}
        />
      </form>
      <p className={styles.footer}>
        Нет аккаунта?{' '}
        <Link className={styles.link} to="/register">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  )
}
