import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button/Button'
import { Input } from '@/components/ui/Input/Input'
import { SeedAccountsHint } from '@/pages/auth/SeedAccountsHint'
import styles from './AuthPage.module.css'

export function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)
  const [name, setName] = useState('Новый игрок')
  const [email, setEmail] = useState('new@jackaroo.local')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)
    try {
      await register(name, email, password)
      navigate('/events')
    } catch {
      setError('Не удалось зарегистрироваться. Попробуйте ещё раз.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className={`page-shell ${styles.wrap}`}>
      <h1 className={styles.title}>Регистрация</h1>
      <p className={styles.lead}>
        Создайте аккаунт, чтобы записываться на игры и видеть статистику.
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          label="Имя"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
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
          autoComplete="new-password"
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
          {pending ? 'Создание…' : 'Зарегистрироваться'}
        </Button>
        <SeedAccountsHint />
      </form>
      <p className={styles.footer}>
        Уже есть аккаунт?{' '}
        <Link className={styles.link} to="/login">
          Войти
        </Link>
      </p>
    </div>
  )
}
