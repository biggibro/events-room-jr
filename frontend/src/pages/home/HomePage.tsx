import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button/Button'
import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.bg} aria-hidden />
      <div className={`page-shell ${styles.shell}`}>
        <div className={styles.content}>
          <div className={styles.badge}>
            <span className={styles.dot} />
            Игровые встречи Jackaroo
          </div>
          <h1 id="hero-title" className={styles.title}>
            Находите встречи.
            <br />
            Играйте офлайн.
          </h1>
          <p className={styles.lead}>
            Events Room Jackaroo — платформа для записи на игры,
            общения в чате события и ведения личной статистики.
          </p>
          <div className={styles.actions}>
            <Link to="/events">
              <Button size="lg">Смотреть расписание</Button>
            </Link>
            <Link to="/register">
              <Button variant="ghost" size="lg">
                Создать аккаунт
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
