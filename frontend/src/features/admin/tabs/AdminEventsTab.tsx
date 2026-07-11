import { Calendar, MapPin, Users } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrandLoader } from '@/components/brand/BrandLoader'
import { Button } from '@/components/ui/Button/Button'
import { Card } from '@/components/ui/Card/Card'
import { useAdminEventsInfiniteQuery } from '@/features/admin/api/useAdminQueries'
import { AdminEventStatusSelect } from '@/features/admin/components/AdminEventStatusSelect/AdminEventStatusSelect'
import { AdminListRow } from '@/features/admin/components/AdminListRow/AdminListRow'
import { AdminToolbar } from '@/features/admin/components/AdminToolbar/AdminToolbar'
import {
  EVENT_STATUS_LABELS,
  type EventStatus,
} from '@/features/events/types/event.types'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { formatEventDateFromIso } from '@/utils/eventDate'
import styles from './AdminTab.module.css'

const STATUS_FILTER_OPTIONS: Array<{ value: EventStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Все' },
  { value: 'registration_open', label: EVENT_STATUS_LABELS.registration_open },
  { value: 'registration_closed', label: EVENT_STATUS_LABELS.registration_closed },
  { value: 'completed', label: EVENT_STATUS_LABELS.completed },
  { value: 'archived', label: EVENT_STATUS_LABELS.archived },
]

export function AdminEventsTab() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<EventStatus | 'ALL'>('ALL')
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useAdminEventsInfiniteQuery({
      search,
      status,
      sort: 'newest',
    })

  const events = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  )
  const total = data?.pages[0]?.total ?? 0

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const sentinelRef = useInfiniteScroll(handleLoadMore, {
    enabled: hasNextPage && !isFetchingNextPage,
  })

  if (isLoading && !data) {
    return <BrandLoader label="Загрузка событий…" />
  }

  if (isError) {
    return (
      <Card className={styles.state}>
        <p className={styles.stateText}>Не удалось загрузить список событий.</p>
      </Card>
    )
  }

  return (
    <>
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Поиск по названию…"
        searchAriaLabel="Поиск событий"
        filterOptions={STATUS_FILTER_OPTIONS}
        filterValue={status}
        onFilterChange={setStatus}
        filterAriaLabel="Фильтр статуса события"
      />

      <div className={styles.listHeader}>
        <span className={styles.totalCount}>
          Всего: <strong>{total}</strong>
        </span>
      </div>

      {events.length ? (
        <div className={styles.list}>
          {events.map((event) => (
            <AdminListRow
              key={event.id}
              thumb={<img src={event.imageUrl} alt="" />}
              title={event.title}
              onTitleClick={() => navigate(`/events/${event.id}`)}
              meta={
                <>
                  <div className={styles.metaLine}>
                    <Calendar size={14} aria-hidden />
                    {formatEventDateFromIso(event.eventDate)} · {event.eventTime}
                  </div>
                  <div className={styles.metaLine}>
                    <MapPin size={14} aria-hidden />
                    {event.location}
                  </div>
                  <div className={styles.metaLine}>
                    <Users size={14} aria-hidden />
                    {event.currentParticipants} / {event.maxParticipants} участников
                  </div>
                </>
              }
              actions={
                <div className={styles.eventActions}>
                  <AdminEventStatusSelect eventId={event.id} status={event.status} />
                  <div className={styles.editBtn}>
                    <Button
                      variant="primary"
                      size="sm"
                      aria-label="Редактировать событие"
                      onClick={() => navigate(`/events/${event.id}/edit`)}
                    >
                      <span className={styles.editLabelShort}>Изменить</span>
                      <span className={styles.editLabelFull}>Редактировать</span>
                    </Button>
                  </div>
                </div>
              }
            />
          ))}
          <div ref={sentinelRef} className={styles.sentinel} aria-hidden />
          {isFetchingNextPage ? (
            <BrandLoader label="Загрузка…" inline />
          ) : null}
        </div>
      ) : (
        <Card className={styles.state}>
          <p className={styles.stateText}>События не найдены.</p>
        </Card>
      )}
    </>
  )
}
