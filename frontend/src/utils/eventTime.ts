export function formatEventTime(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function parseEventTime(value: string): { hours: number; minutes: number } | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null

  const hours = Number(match[1])
  const minutes = Number(match[2])

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null

  return { hours, minutes }
}

export function normalizeEventTime(value: string): string {
  const parsed = parseEventTime(value)
  if (!parsed) return ''
  return formatEventTime(parsed.hours, parsed.minutes)
}

export const EVENT_TIME_HOURS = Array.from({ length: 24 }, (_, index) => index)

export const EVENT_TIME_MINUTES = [0, 15, 30, 45] as const
