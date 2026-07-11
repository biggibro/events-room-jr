import { http } from '@/api/http'
import type {
  Location,
  LocationCreatePayload,
  LocationUpdatePayload,
} from '@/features/locations/types/location.types'

type GetLocationsOptions = {
  includeArchived?: boolean
}

export async function getLocations(
  options: GetLocationsOptions = {},
): Promise<Location[]> {
  const { data } = await http.get<Location[]>('/locations', {
    params: options.includeArchived ? { includeArchived: 'true' } : undefined,
  })
  return data
}

export async function getLocationById(id: string): Promise<Location | null> {
  try {
    const { data } = await http.get<Location>(`/locations/${id}`)
    return data
  } catch {
    return null
  }
}

export async function createLocation(
  payload: LocationCreatePayload,
): Promise<Location> {
  const { data } = await http.post<Location>('/locations', payload)
  return data
}

export async function updateLocation(
  id: string,
  payload: LocationUpdatePayload,
): Promise<Location> {
  const { data } = await http.patch<Location>(`/locations/${id}`, payload)
  return data
}

export async function archiveLocation(id: string): Promise<Location> {
  const { data } = await http.patch<Location>(`/locations/${id}/archive`)
  return data
}
