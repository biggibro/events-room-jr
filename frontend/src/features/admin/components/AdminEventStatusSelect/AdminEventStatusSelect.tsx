import { useCallback } from 'react'
import { Select } from '@/components/ui/Select/Select'
import {
  useArchiveEventMutation,
  useUpdateEventStatusMutation,
} from '@/features/events/api/useEventsQuery'
import {
  EVENT_STATUS_LABELS,
  type EditableEventStatus,
  type EventStatus,
} from '@/features/events/types/event.types'

const STATUS_OPTIONS: EventStatus[] = [
  'registration_open',
  'registration_closed',
  'completed',
  'archived',
]

type AdminEventStatusSelectProps = {
  eventId: string
  status: EventStatus
  disabled?: boolean
}

export function AdminEventStatusSelect({
  eventId,
  status,
  disabled = false,
}: AdminEventStatusSelectProps) {
  const statusMutation = useUpdateEventStatusMutation()
  const archiveMutation = useArchiveEventMutation()
  const isPending = statusMutation.isPending || archiveMutation.isPending

  const handleChange = useCallback(
    async (nextStatus: EventStatus) => {
      if (nextStatus === status) return

      if (nextStatus === 'archived') {
        await archiveMutation.mutateAsync(eventId)
        return
      }

      await statusMutation.mutateAsync({
        eventId,
        status: nextStatus as EditableEventStatus,
      })
    },
    [archiveMutation, eventId, status, statusMutation],
  )

  return (
    <Select
      selectSize="sm"
      value={status}
      disabled={disabled || isPending}
      aria-label="Изменить статус события"
      onChange={(event) => void handleChange(event.target.value as EventStatus)}
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {EVENT_STATUS_LABELS[option]}
        </option>
      ))}
    </Select>
  )
}
