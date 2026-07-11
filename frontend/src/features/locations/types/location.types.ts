export type Location = {
  id: string
  name: string
  address: string
  description: string
  phone: string | null
  mapUrl: string | null
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export type LocationFormValues = {
  name: string
  address: string
  description: string
  phone: string
  mapUrl: string
}

export type LocationCreatePayload = {
  name: string
  address: string
  description: string
  phone?: string
  mapUrl?: string
}

export type LocationUpdatePayload = Partial<LocationCreatePayload>
