import clsx from 'clsx'
import { Plus, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/Button/Button'
import { Input } from '@/components/ui/Input/Input'
import type { EventDetail } from '@/features/events/types/event.types'
import {
  getAvailableSlots,
  getParticipantSlots,
  normalizeGuestNames,
} from '@/features/events/utils/eventSlots'
import styles from './JoinEventModal.module.css'

const EMPTY_GUEST_NAMES: string[] = []

export type JoinEventModalProps = {
  open: boolean
  event: EventDetail
  mode: 'join' | 'edit'
  userId?: string
  initialGuestNames?: string[]
  loading?: boolean
  error?: string
  onConfirm: (guestNames: string[]) => void
  onCancel: () => void
}

export function JoinEventModal({
  open,
  event,
  mode,
  userId,
  initialGuestNames = EMPTY_GUEST_NAMES,
  loading = false,
  error,
  onConfirm,
  onCancel,
}: JoinEventModalProps) {
  const titleId = useId()
  const descId = useId()
  const [guestRows, setGuestRows] = useState<string[]>([])
  const initialGuestNamesKey = initialGuestNames.join('\0')

  useEffect(() => {
    if (!open) return
    setGuestRows(initialGuestNames.length > 0 ? [...initialGuestNames] : [])
  }, [open, initialGuestNamesKey, initialGuestNames])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onCancel])

  if (!open) return null

  const normalizedGuests = normalizeGuestNames(guestRows)
  const slotsNeeded = getParticipantSlots(normalizedGuests.length)
  const availableSlots = getAvailableSlots(event, userId)
  const notEnoughSlots = slotsNeeded > availableSlots

  function handleGuestChange(index: number, value: string) {
    setGuestRows((rows) => rows.map((row, rowIndex) => (rowIndex === index ? value : row)))
  }

  function handleAddGuest() {
    setGuestRows((rows) => [...rows, ''])
  }

  function handleRemoveGuest(index: number) {
    setGuestRows((rows) => rows.filter((_, rowIndex) => rowIndex !== index))
  }

  function handleSubmit() {
    onConfirm(normalizedGuests)
  }

  return createPortal(
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={clsx('glass-card', styles.dialog)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        <h2 id={titleId} className={styles.title}>
          {mode === 'join' ? 'Запись на событие' : 'Изменить гостей'}
        </h2>
        <p id={descId} className={styles.hint}>
          Можно записаться одному или указать гостей. При сохранении список гостей
          полностью перезаписывается.
        </p>
        <p
          className={clsx(styles.slotsInfo, notEnoughSlots && styles.slotsError)}
          role="status"
        >
          Займёт {slotsNeeded} {slotsLabel(slotsNeeded)} из {availableSlots}{' '}
          {slotsLabel(availableSlots, true)}
        </p>

        {guestRows.length > 0 ? (
          <div className={styles.guestList}>
            {guestRows.map((guestName, index) => (
              <div key={index} className={styles.guestRow}>
                <Input
                  label={`Гость ${index + 1}`}
                  value={guestName}
                  placeholder="Имя гостя"
                  onChange={(changeEvent) => handleGuestChange(index, changeEvent.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={styles.removeButton}
                  aria-label={`Удалить гостя ${index + 1}`}
                  onClick={() => handleRemoveGuest(index)}
                >
                  <X size={16} aria-hidden />
                </Button>
              </div>
            ))}
          </div>
        ) : null}

        <Button type="button" variant="ghost" size="sm" onClick={handleAddGuest}>
          <Plus size={16} aria-hidden style={{ marginRight: '0.35rem' }} />
          Добавить гостя
        </Button>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.actions}>
          <Button variant="ghost" size="sm" disabled={loading} onClick={onCancel}>
            Отмена
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={loading || notEnoughSlots}
            onClick={handleSubmit}
          >
            {mode === 'join' ? 'Записаться' : 'Сохранить'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function slotsLabel(count: number, free = false): string {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) {
    return free ? 'свободного' : 'место'
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return free ? 'свободных' : 'места'
  }

  return free ? 'свободных' : 'мест'
}
