import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { BrandLoader } from '@/components/brand/BrandLoader'
import { Card } from '@/components/ui/Card/Card'
import { EventForm } from '@/features/events/components/EventForm/EventForm'
import {
  useArchiveEventMutation,
  useEventQuery,
  useRemoveParticipantsMutation,
  useUpdateEventMutation,
  useUpdateEventStatusMutation,
} from '@/features/events/api/useEventsQuery'
import type {
  EditableEventStatus,
  EventFormSubmitMeta,
  EventFormValues,
} from '@/features/events/types/event.types'
import { eventToFormValues } from '@/features/events/utils/eventForm'
import { useLocationsQuery } from '@/features/locations/api/useLocationsQuery'
import styles from './EditEventPage.module.css'

type EditEventLocationState = {
  returnTo?: string
}

function isEditableStatus(status: EventFormValues['status']): status is EditableEventStatus {
  return status !== 'archived'
}

export function EditEventPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo =
    (location.state as EditEventLocationState | null)?.returnTo ??
    (eventId ? `/events/${eventId}` : '/events')

  const { data: event, isLoading, isError } = useEventQuery(eventId)
  const { data: locations = [], isLoading: locationsLoading } = useLocationsQuery()
  const updateMutation = useUpdateEventMutation()
  const updateStatusMutation = useUpdateEventStatusMutation()
  const archiveMutation = useArchiveEventMutation()
  const removeParticipantsMutation = useRemoveParticipantsMutation()
  const [submitError, setSubmitError] = useState<string | undefined>()

  const actionLoading =
    updateMutation.isPending ||
    updateStatusMutation.isPending ||
    archiveMutation.isPending ||
    removeParticipantsMutation.isPending

  if (isLoading || locationsLoading) {
    return (
      <div className="page-shell">
        <BrandLoader label="Загрузка формы…" />
      </div>
    )
  }

  if (isError || !event || !eventId) {
    return (
      <div className="page-shell">
        <p>Событие не найдено.</p>
        <Link to="/events">Вернуться к расписанию</Link>
      </div>
    )
  }

  async function handleSubmit(values: EventFormValues, meta?: EventFormSubmitMeta) {
    setSubmitError(undefined)

    const imageUrl = values.imageUrl.trim()
    const removedParticipantIds = meta?.removedParticipantIds ?? []

    try {
      await updateMutation.mutateAsync({
        eventId,
        payload: {
          title: values.title.trim(),
          description: values.description.trim(),
          eventDate: values.eventDate.trim(),
          eventTime: values.eventTime.trim(),
          locationId: values.locationId,
          maxParticipants: values.maxParticipants,
          seatingType: values.seatingType,
          durationHours: values.durationHours,
          imageUrl: imageUrl || undefined,
        },
      })

      if (values.status !== event.status && isEditableStatus(values.status)) {
        await updateStatusMutation.mutateAsync({
          eventId,
          status: values.status,
        })
      }

      if (removedParticipantIds.length > 0) {
        await removeParticipantsMutation.mutateAsync({
          eventId,
          userIds: removedParticipantIds,
        })
      }

      navigate(returnTo)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не удалось сохранить событие')
    }
  }

  async function handleArchive() {
    setSubmitError(undefined)

    try {
      await archiveMutation.mutateAsync(eventId)
      navigate(returnTo)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не удалось архивировать событие')
    }
  }

  return (
    <div className="page-shell">
      <header className={styles.head}>
        <Link to={returnTo} className={styles.backLink}>
          ← Назад
        </Link>
        <h1 className={styles.title}>Редактирование события</h1>
        <p className={styles.subtitle}>{event.title}</p>
      </header>

      <Card className={styles.formCard}>
        <EventForm
          mode="edit"
          defaultValues={eventToFormValues(event)}
          locations={locations}
          participants={event.participants}
          loading={actionLoading}
          submitError={submitError}
          onSubmit={handleSubmit}
          onCancel={() => navigate(returnTo)}
          onArchive={handleArchive}
        />
      </Card>
    </div>
  )
}
