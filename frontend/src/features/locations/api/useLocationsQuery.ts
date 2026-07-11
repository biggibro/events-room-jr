import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as locationsApi from '@/features/locations/api/locations.api'
import type {
  LocationCreatePayload,
  LocationUpdatePayload,
} from '@/features/locations/types/location.types'

type UseLocationsQueryOptions = {
  enabled?: boolean
  includeArchived?: boolean
}

export function useLocationsQuery(options: UseLocationsQueryOptions = {}) {
  const { enabled = true, includeArchived = false } = options

  return useQuery({
    queryKey: ['locations', { includeArchived }],
    queryFn: () => locationsApi.getLocations({ includeArchived }),
    enabled,
  })
}

export function useLocationQuery(locationId: string | undefined) {
  return useQuery({
    queryKey: ['locations', locationId],
    queryFn: () => locationsApi.getLocationById(locationId!),
    enabled: Boolean(locationId),
  })
}

export function useCreateLocationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LocationCreatePayload) => locationsApi.createLocation(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
  })
}

export function useUpdateLocationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      locationId,
      payload,
    }: {
      locationId: string
      payload: LocationUpdatePayload
    }) => locationsApi.updateLocation(locationId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['locations'] })
      void queryClient.invalidateQueries({ queryKey: ['locations', variables.locationId] })
    },
  })
}

export function useArchiveLocationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (locationId: string) => locationsApi.archiveLocation(locationId),
    onSuccess: (_data, locationId) => {
      void queryClient.invalidateQueries({ queryKey: ['locations'] })
      void queryClient.invalidateQueries({ queryKey: ['locations', locationId] })
    },
  })
}
