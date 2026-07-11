import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import * as eventsApi from '@/features/events/api/events.api'
import type {
  CreateEventPayload,
  EditableEventStatus,
  JoinEventPayload,
  ReplaceWinnersPayload,
  UpdateEventPayload,
} from '@/features/events/types/event.types'
import { useDebounce } from '@/hooks/useDebounce'
import { useEventFiltersStore } from '@/stores/eventFiltersStore'

export function useEventsQuery() {
  const filters = useEventFiltersStore(
    useShallow((state) => ({
      search: state.search,
      status: state.status,
      sort: state.sort,
    })),
  )
  const debouncedSearch = useDebounce(filters.search, 300)
  const queryFilters = { ...filters, search: debouncedSearch }

  return useQuery({
    queryKey: ['events', queryFilters],
    queryFn: () => eventsApi.getEvents(queryFilters),
  })
}

export function useEventQuery(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsApi.getEventById(eventId!),
    enabled: Boolean(eventId),
  })
}

export function useJoinEventMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: string
      payload?: JoinEventPayload
    }) => eventsApi.joinEvent(eventId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['events'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
      void queryClient.invalidateQueries({
        queryKey: ['event', variables.eventId],
      })
    },
  })
}

export function useLeaveEventMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: string) => eventsApi.leaveEvent(eventId),
    onSuccess: (_data, eventId) => {
      void queryClient.invalidateQueries({ queryKey: ['events'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
      void queryClient.invalidateQueries({ queryKey: ['event', eventId] })
    },
  })
}

function invalidateEventQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  eventId: string,
) {
  void queryClient.invalidateQueries({ queryKey: ['events'] })
  void queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
  void queryClient.invalidateQueries({ queryKey: ['event', eventId] })
}

function syncEventCache(
  queryClient: ReturnType<typeof useQueryClient>,
  event: Awaited<ReturnType<typeof eventsApi.getEventById>>,
  eventId: string,
) {
  if (!event) return
  queryClient.setQueryData(['event', eventId], event)
  void queryClient.invalidateQueries({ queryKey: ['events'] })
  void queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
}

export function useCreateEventMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => eventsApi.createEvent(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['event', data.id], data)
      void queryClient.invalidateQueries({ queryKey: ['events'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
    },
  })
}

export function useUpdateEventMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: string
      payload: UpdateEventPayload
    }) => eventsApi.updateEvent(eventId, payload),
    onSuccess: (data, variables) => {
      syncEventCache(queryClient, data, variables.eventId)
    },
  })
}

export function useUpdateEventStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      eventId,
      status,
    }: {
      eventId: string
      status: EditableEventStatus
    }) => eventsApi.updateEventStatus(eventId, status),
    onSuccess: (data, variables) => {
      syncEventCache(queryClient, data, variables.eventId)
    },
  })
}

export function useArchiveEventMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: string) => eventsApi.archiveEvent(eventId),
    onSuccess: (data, eventId) => {
      syncEventCache(queryClient, data, eventId)
    },
  })
}

export function useRemoveParticipantsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      eventId,
      userIds,
    }: {
      eventId: string
      userIds: string[]
    }) => eventsApi.removeParticipants(eventId, { userIds }),
    onSuccess: (data, variables) => {
      syncEventCache(queryClient, data, variables.eventId)
    },
  })
}

export function useReplaceWinnersMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: string
      payload: ReplaceWinnersPayload
    }) => eventsApi.replaceWinners(eventId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] })
      void queryClient.invalidateQueries({ queryKey: ['events'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
