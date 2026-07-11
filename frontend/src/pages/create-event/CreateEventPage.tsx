import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BrandLoader } from '@/components/brand/BrandLoader'
import { Card } from '@/components/ui/Card/Card'
import { EventForm } from '@/features/events/components/EventForm/EventForm'
import {
  useCreateEventMutation,
  useUpdateEventStatusMutation,
} from '@/features/events/api/useEventsQuery'
import type { EventFormValues } from '@/features/events/types/event.types'
import { defaultEventFormValues } from '@/features/events/utils/eventForm'
import { useLocationsQuery } from '@/features/locations/api/useLocationsQuery'
import { submitCreateEvent } from '@/pages/create-event/createEventSubmit'
import styles from '../edit-event/EditEventPage.module.css'

export function CreateEventPage() {
  const navigate = useNavigate()
  const { data: locations = [], isLoading: locationsLoading } = useLocationsQuery()
  const createMutation = useCreateEventMutation()
  const updateStatusMutation = useUpdateEventStatusMutation()
  const [submitError, setSubmitError] = useState<string | undefined>()

  const actionLoading = createMutation.isPending || updateStatusMutation.isPending
  const defaultValues = useMemo(() => defaultEventFormValues(), [])

  if (locationsLoading) {
    return (
      <div className="page-shell">
        <BrandLoader label="Загрузка формы…" />
      </div>
    )
  }

  async function handleSubmit(values: EventFormValues) {
    setSubmitError(undefined)

    await submitCreateEvent(values, {
      createEvent: (payload) => createMutation.mutateAsync(payload),
      updateEventStatus: (args) => updateStatusMutation.mutateAsync(args),
      navigate,
      onError: setSubmitError,
    })
  }

  return (
    <div className="page-shell">
      <header className={styles.head}>
        <Link to="/events" className={styles.backLink}>
          ← Назад
        </Link>
        <h1 className={styles.title}>Создание события</h1>
      </header>

      <Card className={styles.formCard}>
        <EventForm
          mode="create"
          defaultValues={defaultValues}
          locations={locations}
          loading={actionLoading}
          submitError={submitError}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/events')}
        />
      </Card>
    </div>
  )
}
