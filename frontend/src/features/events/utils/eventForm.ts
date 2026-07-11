import type { EventDetail, EventFormValues } from '@/features/events/types/event.types'
import { isValidImageUrl } from '@/features/uploads/utils/imageFileValidation'
import { parseIsoEventDate } from '@/utils/eventDate'
import { parseEventTime } from '@/utils/eventTime'

export function defaultEventFormValues(): EventFormValues {
  return {
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    locationId: '',
    maxParticipants: 10,
    seatingType: 'free',
    durationHours: 3,
    imageUrl: '',
    status: 'archived',
  }
}

export function eventToFormValues(event: EventDetail): EventFormValues {
  return {
    title: event.title,
    description: event.description,
    eventDate: event.eventDate,
    eventTime: event.eventTime,
    locationId: event.locationId,
    maxParticipants: event.maxParticipants,
    seatingType: event.seatingType,
    durationHours: event.durationHours,
    imageUrl: event.imageUrl,
    status: event.status,
  }
}

export type EventFormErrors = Partial<Record<keyof EventFormValues, string>>

export function validateEventForm(values: EventFormValues): EventFormErrors {
  const errors: EventFormErrors = {}

  if (!values.title.trim()) {
    errors.title = 'Укажите название'
  }

  if (!values.description.trim()) {
    errors.description = 'Укажите описание'
  }

  if (!values.eventDate.trim()) {
    errors.eventDate = 'Укажите дату'
  } else if (!parseIsoEventDate(values.eventDate.trim())) {
    errors.eventDate = 'Некорректная дата'
  }

  if (!values.eventTime.trim()) {
    errors.eventTime = 'Укажите время'
  } else if (!parseEventTime(values.eventTime.trim())) {
    errors.eventTime = 'Некорректное время'
  }

  if (!values.locationId) {
    errors.locationId = 'Выберите локацию'
  }

  if (!Number.isFinite(values.maxParticipants) || values.maxParticipants < 1) {
    errors.maxParticipants = 'Минимум 1 участник'
  }

  if (!Number.isFinite(values.durationHours) || values.durationHours < 1) {
    errors.durationHours = 'Минимум 1 час'
  }

  const imageUrl = values.imageUrl.trim()
  if (imageUrl && !isValidImageUrl(imageUrl)) {
    errors.imageUrl = 'Некорректный URL'
  }

  return errors
}

export function hasEventFormErrors(errors: EventFormErrors): boolean {
  return Object.keys(errors).length > 0
}
