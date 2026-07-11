import { create } from 'zustand'
import type {
  EventListFilters,
  EventStatus,
} from '@/features/events/types/event.types'

type EventFiltersState = EventListFilters & {
  setSearch: (search: string) => void
  setStatus: (status: EventStatus | 'ALL') => void
  setSort: (sort: EventListFilters['sort']) => void
}

export const useEventFiltersStore = create<EventFiltersState>((set) => ({
  search: '',
  status: 'ALL',
  sort: 'newest',
  setSearch: (search) => set({ search }),
  setStatus: (status) => set({ status }),
  setSort: (sort) => set({ sort }),
}))
