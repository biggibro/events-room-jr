import type { Location, LocationCreatePayload, LocationFormValues } from '@/features/locations/types/location.types'

export type LocationFormErrors = Partial<Record<keyof LocationFormValues, string>>

export function defaultLocationFormValues(): LocationFormValues {
  return {
    name: '',
    address: '',
    description: '',
    phone: '',
    mapUrl: '',
  }
}

export function locationToFormValues(location: Location): LocationFormValues {
  return {
    name: location.name,
    address: location.address,
    description: location.description,
    phone: location.phone ?? '',
    mapUrl: location.mapUrl ?? '',
  }
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateLocationForm(values: LocationFormValues): LocationFormErrors {
  const errors: LocationFormErrors = {}

  if (!values.name.trim()) {
    errors.name = 'Укажите название'
  }

  if (!values.address.trim()) {
    errors.address = 'Укажите адрес'
  }

  if (!values.description.trim()) {
    errors.description = 'Укажите описание'
  }

  const mapUrl = values.mapUrl.trim()
  if (mapUrl && !isValidUrl(mapUrl)) {
    errors.mapUrl = 'Укажите корректную ссылку (http или https)'
  }

  return errors
}

export function hasLocationFormErrors(errors: LocationFormErrors): boolean {
  return Object.keys(errors).length > 0
}

export function locationFormToPayload(values: LocationFormValues): LocationCreatePayload {
  const phone = values.phone.trim()
  const mapUrl = values.mapUrl.trim()

  return {
    name: values.name.trim(),
    address: values.address.trim(),
    description: values.description.trim(),
    ...(phone ? { phone } : {}),
    ...(mapUrl ? { mapUrl } : {}),
  }
}
