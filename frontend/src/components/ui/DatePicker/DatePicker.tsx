import clsx from 'clsx'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useIsMobile } from '@/hooks/useMediaQuery'
import {
  addMonths,
  formatDayAriaLabel,
  formatEventDateFromIso,
  formatMonthTitle,
  getCalendarDays,
  isSameDay,
  parseIsoEventDate,
  startOfMonth,
  toIsoEventDate,
  WEEKDAY_LABELS,
} from '@/utils/eventDate'
import styles from './DatePicker.module.css'

export type DatePickerProps = {
  label?: string
  name?: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  placeholder?: string
  id?: string
}

export function DatePicker({
  label,
  name,
  value,
  onChange,
  error,
  disabled = false,
  placeholder = 'Выберите дату',
  id,
}: DatePickerProps) {
  const isMobile = useIsMobile()
  const autoId = useId()
  const inputId = id ?? name ?? autoId
  const popoverId = `${inputId}-popover`
  const wrapRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const selectedDate = parseIsoEventDate(value)
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(selectedDate ?? today),
  )

  useEffect(() => {
    if (selectedDate) {
      setViewMonth(startOfMonth(selectedDate))
    }
  }, [value])

  useEffect(() => {
    if (!open || isMobile) return

    function handleClickOutside(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, isMobile])

  function handleSelectDay(date: Date) {
    onChange(toIsoEventDate(date))
    setOpen(false)
  }

  function toggleOpen() {
    if (disabled) return
    setOpen((current) => !current)
  }

  const calendarDays = getCalendarDays(viewMonth)

  if (isMobile) {
    return (
      <div className={styles.wrap}>
        {label ? (
          <label className={styles.label} htmlFor={inputId}>
            {label}
          </label>
        ) : null}
        <input
          id={inputId}
          name={name}
          type="date"
          className={styles.nativeInput}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
        {error ? <p className={styles.errorText}>{error}</p> : null}
      </div>
    )
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      {label ? (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <button
        type="button"
        id={inputId}
        name={name}
        className={clsx(styles.trigger, open && styles.triggerOpen)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        disabled={disabled}
        onClick={toggleOpen}
      >
        <span className={clsx(!value && styles.placeholder)}>
          {value ? formatEventDateFromIso(value) : placeholder}
        </span>
        <CalendarDays size={18} className={styles.icon} aria-hidden />
      </button>

      {open ? (
        <div
          id={popoverId}
          className={styles.popover}
          role="dialog"
          aria-label="Выбор даты"
        >
          <div className={styles.header}>
            <button
              type="button"
              className={styles.navButton}
              aria-label="Предыдущий месяц"
              onClick={() => setViewMonth((current) => addMonths(current, -1))}
            >
              <ChevronLeft size={18} aria-hidden />
            </button>
            <span className={styles.monthTitle}>{formatMonthTitle(viewMonth)}</span>
            <button
              type="button"
              className={styles.navButton}
              aria-label="Следующий месяц"
              onClick={() => setViewMonth((current) => addMonths(current, 1))}
            >
              <ChevronRight size={18} aria-hidden />
            </button>
          </div>

          <div className={styles.weekdays}>
            {WEEKDAY_LABELS.map((weekday) => (
              <span key={weekday} className={styles.weekday}>
                {weekday}
              </span>
            ))}
          </div>

          <div className={styles.grid}>
            {calendarDays.map(({ date, inMonth }) => {
              const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
              const isToday = isSameDay(date, today)

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  className={clsx(
                    styles.day,
                    !inMonth && styles.dayOutside,
                    isToday && styles.dayToday,
                    isSelected && styles.daySelected,
                  )}
                  aria-label={formatDayAriaLabel(date)}
                  aria-pressed={isSelected}
                  onClick={() => handleSelectDay(date)}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {error ? <p className={styles.errorText}>{error}</p> : null}
    </div>
  )
}
