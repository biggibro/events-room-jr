import { describe, expect, it } from 'vitest'
import {
  formatEventDate,
  formatEventDateFromIso,
  parseIsoEventDate,
  toIsoEventDate,
} from '@/utils/eventDate'

describe('eventDate utils', () => {
  it('formats date as day and short russian month', () => {
    expect(formatEventDate(new Date(2026, 9, 24))).toBe('24 окт')
    expect(formatEventDate(new Date(2026, 10, 2))).toBe('2 ноя')
  })

  it('parses ISO event date strings', () => {
    const parsed = parseIsoEventDate('2026-10-24')

    expect(parsed).not.toBeNull()
    expect(parsed?.getDate()).toBe(24)
    expect(parsed?.getMonth()).toBe(9)
    expect(parsed?.getFullYear()).toBe(2026)
  })

  it('rejects invalid ISO dates', () => {
    expect(parseIsoEventDate('2026-02-31')).toBeNull()
    expect(parseIsoEventDate('24 окт')).toBeNull()
    expect(parseIsoEventDate('')).toBeNull()
  })

  it('roundtrips ISO values', () => {
    const date = new Date(2026, 11, 15)
    const iso = toIsoEventDate(date)
    const parsed = parseIsoEventDate(iso)

    expect(iso).toBe('2026-12-15')
    expect(parsed).not.toBeNull()
    expect(toIsoEventDate(parsed!)).toBe(iso)
  })

  it('formats ISO values for display', () => {
    expect(formatEventDateFromIso('2026-10-24')).toBe('24 окт')
    expect(formatEventDateFromIso('2026-11-02')).toBe('2 ноя')
  })
})
