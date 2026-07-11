const EVENT_MONTHS = [
  'янв',
  'фев',
  'мар',
  'апр',
  'май',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
] as const

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export function parseIsoEventDate(value: string): Date | null {
  const trimmed = value.trim()
  if (!ISO_DATE_REGEX.test(trimmed)) return null

  const [year, month, day] = trimmed.split('-').map(Number)
  if (!year || !month || !day) return null

  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }

  return date
}

export function toIsoEventDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function formatEventDate(date: Date): string {
  const day = date.getDate()
  const month = EVENT_MONTHS[date.getMonth()]
  return `${day} ${month}`
}

export function formatEventDateFromIso(iso: string): string {
  const parsed = parseIsoEventDate(iso)
  if (!parsed) return iso
  return formatEventDate(parsed)
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, 1)
}

export function getCalendarDays(viewMonth: Date): { date: Date; inMonth: boolean }[] {
  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  let startOffset = firstDay.getDay() - 1
  if (startOffset < 0) startOffset = 6

  const start = new Date(year, month, 1 - startOffset)
  const days: { date: Date; inMonth: boolean }[] = []

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
    days.push({ date, inMonth: date.getMonth() === month })
  }

  return days
}

export function formatMonthTitle(date: Date): string {
  const formatted = new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
  }).format(date)

  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function formatDayAriaLabel(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export { WEEKDAY_LABELS }
