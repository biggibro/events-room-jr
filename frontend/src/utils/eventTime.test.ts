import { describe, expect, it } from 'vitest'
import {
  formatEventTime,
  normalizeEventTime,
  parseEventTime,
} from '@/utils/eventTime'

describe('eventTime utils', () => {
  it('formats hours and minutes as HH:mm', () => {
    expect(formatEventTime(19, 0)).toBe('19:00')
    expect(formatEventTime(8, 30)).toBe('08:30')
  })

  it('parses stored event time strings', () => {
    expect(parseEventTime('19:00')).toEqual({ hours: 19, minutes: 0 })
    expect(parseEventTime('8:30')).toEqual({ hours: 8, minutes: 30 })
  })

  it('normalizes time values', () => {
    expect(normalizeEventTime('8:30')).toBe('08:30')
    expect(normalizeEventTime('invalid')).toBe('')
  })
})
