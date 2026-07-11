import type {
  CreateEventPayload,
  EditableEventStatus,
  EventFormValues,
} from '@/features/events/types/event.types'

export function isEditableEventStatus(
  status: EventFormValues['status'],
): status is EditableEventStatus {
  return status !== 'archived'
}

export function buildCreateEventPayload(values: EventFormValues): CreateEventPayload {
  const imageUrl = values.imageUrl.trim()

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    eventDate: values.eventDate.trim(),
    eventTime: values.eventTime.trim(),
    locationId: values.locationId,
    maxParticipants: values.maxParticipants,
    seatingType: values.seatingType,
    durationHours: values.durationHours,
    imageUrl: imageUrl || undefined,
  }
}

export type SubmitCreateEventDeps = {
  createEvent: (payload: CreateEventPayload) => Promise<{ id: string }>
  updateEventStatus: (args: {
    eventId: string
    status: EditableEventStatus
  }) => Promise<unknown>
  navigate: (path: string) => void
  onError: (message: string) => void
}

export async function submitCreateEvent(
  values: EventFormValues,
  deps: SubmitCreateEventDeps,
): Promise<void> {
  try {
    const created = await deps.createEvent(buildCreateEventPayload(values))

    if (values.status !== 'archived' && isEditableEventStatus(values.status)) {
      await deps.updateEventStatus({
        eventId: created.id,
        status: values.status,
      })
    }

    deps.navigate(`/events/${created.id}`)
  } catch (error) {
    deps.onError(error instanceof Error ? error.message : 'Не удалось создать событие')
  }
}
