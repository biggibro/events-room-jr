import clsx from 'clsx'
import { Clock3 } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useIsMobile } from '@/hooks/useMediaQuery'
import {
  EVENT_TIME_HOURS,
  EVENT_TIME_MINUTES,
  formatEventTime,
  normalizeEventTime,
  parseEventTime,
} from '@/utils/eventTime'
import styles from './TimePicker.module.css'

export type TimePickerProps = {
  label?: string
  name?: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  placeholder?: string
  id?: string
}

export function TimePicker({
  label,
  name,
  value,
  onChange,
  error,
  disabled = false,
  placeholder = 'Выберите время',
  id,
}: TimePickerProps) {
  const isMobile = useIsMobile()
  const autoId = useId()
  const inputId = id ?? name ?? autoId
  const popoverId = `${inputId}-popover`
  const wrapRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const parsed = parseEventTime(value)
  const selectedHours = parsed?.hours ?? 19
  const selectedMinutes = parsed?.minutes ?? 0
  const displayValue = normalizeEventTime(value)

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

  function handleSelectHour(hours: number) {
    onChange(formatEventTime(hours, parsed?.minutes ?? 0))
  }

  function handleSelectMinute(minutes: number) {
    onChange(formatEventTime(parsed?.hours ?? 19, minutes))
  }

  function toggleOpen() {
    if (disabled) return
    setOpen((current) => !current)
  }

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
          type="time"
          className={styles.nativeInput}
          value={displayValue}
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
        <span className={clsx(!displayValue && styles.placeholder)}>
          {displayValue || placeholder}
        </span>
        <Clock3 size={18} className={styles.icon} aria-hidden />
      </button>

      {open ? (
        <div
          id={popoverId}
          className={styles.popover}
          role="dialog"
          aria-label="Выбор времени"
        >
          <div className={styles.columns}>
            <div>
              <p className={styles.columnTitle}>Часы</p>
              <div className={styles.hourGrid}>
                {EVENT_TIME_HOURS.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    className={clsx(
                      styles.option,
                      parsed && selectedHours === hour && styles.optionSelected,
                    )}
                    aria-label={`${hour} часов`}
                    aria-pressed={parsed ? selectedHours === hour : false}
                    onClick={() => handleSelectHour(hour)}
                  >
                    {String(hour).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className={styles.columnTitle}>Минуты</p>
              <div className={styles.minuteGrid}>
                {EVENT_TIME_MINUTES.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    className={clsx(
                      styles.option,
                      parsed && selectedMinutes === minute && styles.optionSelected,
                    )}
                    aria-label={`${minute} минут`}
                    aria-pressed={parsed ? selectedMinutes === minute : false}
                    onClick={() => handleSelectMinute(minute)}
                  >
                    {String(minute).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {error ? <p className={styles.errorText}>{error}</p> : null}
    </div>
  )
}
