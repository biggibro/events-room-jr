import { EventCard } from '@/features/events/components/EventCard/EventCard'
import { EventFilters } from '@/features/events/components/EventFilters/EventFilters'
import {
  useEventsQuery,
  useJoinEventMutation,
  useLeaveEventMutation,
} from '@/features/events/api/useEventsQuery'
import { BrandLoader } from '@/components/brand/BrandLoader'
import styles from './EventsPage.module.css'

export function EventsPage() {
  const { data, isLoading, isError, error } = useEventsQuery()
  const joinMutation = useJoinEventMutation()
  const leaveMutation = useLeaveEventMutation()
  const actionLoading = joinMutation.isPending || leaveMutation.isPending

  return (
    <div className={`page-shell ${styles.page}`}>
      <header className={styles.head}>
        <h1 className={styles.title}>Расписание событий</h1>
        <p className={styles.subtitle}>
          Расписание игр Jackaroo. Запишитесь заранее и уточните детали в чате
          события.
        </p>
      </header>

      <EventFilters />

      {isLoading ? (
        <BrandLoader label="Загрузка событий…" inline />
      ) : isError ? (
        <p className={styles.state} role="alert">
          {(error as Error).message}
        </p>
      ) : !data?.length ? (
        <p className={styles.state}>Нет событий по выбранным фильтрам.</p>
      ) : (
        <div className={styles.grid}>
          {data.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              actionLoading={actionLoading}
              onJoin={(id, guestNames) =>
                joinMutation.mutateAsync({ eventId: id, payload: { guestNames } })
              }
              joinError={joinMutation.error ? (joinMutation.error as Error).message : undefined}
              onJoinDismiss={() => joinMutation.reset()}
              onLeave={(id) => leaveMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
