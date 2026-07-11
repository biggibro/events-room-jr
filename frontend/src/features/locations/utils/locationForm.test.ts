import { describe, expect, it } from 'vitest'
import {
  defaultLocationFormValues,
  hasLocationFormErrors,
  locationFormToPayload,
  locationToFormValues,
  validateLocationForm,
} from '@/features/locations/utils/locationForm'
import type { Location } from '@/features/locations/types/location.types'

const sampleLocation: Location = {
  id: 'loc-1',
  name: 'Level-Up Lounge',
  address: 'ул. Примерная, 12',
  description: 'Описание зала',
  phone: '+7 (900) 123-45-67',
  mapUrl: 'https://yandex.ru/maps/-/CCUqY0V~',
  isArchived: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('locationForm', () => {
  it('requires name, address and description', () => {
    const errors = validateLocationForm(defaultLocationFormValues())
    expect(hasLocationFormErrors(errors)).toBe(true)
    expect(errors.name).toBeDefined()
    expect(errors.address).toBeDefined()
    expect(errors.description).toBeDefined()
  })

  it('validates map url when provided', () => {
    const errors = validateLocationForm({
      ...defaultLocationFormValues(),
      name: 'Зал',
      address: 'ул. Тестовая, 1',
      description: 'Описание',
      mapUrl: 'not-a-url',
    })

    expect(errors.mapUrl).toBeDefined()
  })

  it('maps location to form values and payload', () => {
    expect(locationToFormValues(sampleLocation)).toEqual({
      name: 'Level-Up Lounge',
      address: 'ул. Примерная, 12',
      description: 'Описание зала',
      phone: '+7 (900) 123-45-67',
      mapUrl: 'https://yandex.ru/maps/-/CCUqY0V~',
    })

    expect(
      locationFormToPayload({
        name: '  Новый зал ',
        address: ' ул. Новая, 1 ',
        description: ' Описание ',
        phone: '',
        mapUrl: ' https://2gis.ru/firm/1 ',
      }),
    ).toEqual({
      name: 'Новый зал',
      address: 'ул. Новая, 1',
      description: 'Описание',
      mapUrl: 'https://2gis.ru/firm/1',
    })
  })
})
