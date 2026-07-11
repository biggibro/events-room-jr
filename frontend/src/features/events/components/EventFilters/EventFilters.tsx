import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input/Input'
import {
  EVENT_STATUS_LABELS,
  type EventStatus,
} from '@/features/events/types/event.types'
import { useEventFiltersStore } from '@/stores/eventFiltersStore'
import styles from './EventFilters.module.css'

const FILTER_OPTIONS: Array<{ value: EventStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Все' },
  { value: 'registration_open', label: EVENT_STATUS_LABELS.registration_open },
  {
    value: 'registration_closed',
    label: EVENT_STATUS_LABELS.registration_closed,
  },
  { value: 'completed', label: EVENT_STATUS_LABELS.completed },
]

export function EventFilters() {
  const search = useEventFiltersStore((state) => state.search)
  const status = useEventFiltersStore((state) => state.status)
  const setSearch = useEventFiltersStore((state) => state.setSearch)
  const setStatus = useEventFiltersStore((state) => state.setStatus)

  return (
    <div className={styles.toolbar}>
      <div className={styles.search}>
        <Input
          placeholder="Поиск по названию или локации…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          leftIcon={<Search size={18} aria-hidden />}
          aria-label="Поиск событий"
        />
      </div>
      <div className={styles.filters}>
        <div className={styles.segment} role="group" aria-label="Статус события">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${styles.segmentBtn} ${status === option.value ? styles.segmentBtnActive : ''}`}
              onClick={() => setStatus(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
