import clsx from 'clsx'
import { useEffect, useId, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/Button/Button'
import { Input } from '@/components/ui/Input/Input'
import type { EventDetail, WinnerInput } from '@/features/events/types/event.types'
import {
  buildWinnerCandidates,
  buildWinnerPayload,
  buildWinnerSelectionFromEvent,
  type WinnerSelectionState,
} from '@/features/events/utils/eventWinners'
import styles from './AssignWinnersModal.module.css'

export type AssignWinnersModalProps = {
  open: boolean
  event: EventDetail
  loading?: boolean
  error?: string
  onConfirm: (winners: WinnerInput[]) => void
  onCancel: () => void
}

export function AssignWinnersModal({
  open,
  event,
  loading = false,
  error,
  onConfirm,
  onCancel,
}: AssignWinnersModalProps) {
  const titleId = useId()
  const descId = useId()
  const candidates = useMemo(() => buildWinnerCandidates(event), [event])
  const [selection, setSelection] = useState<WinnerSelectionState>(() =>
    buildWinnerSelectionFromEvent(event, candidates),
  )

  const candidatesKey = candidates.map((candidate) => candidate.key).join('\0')
  const winnersKey = (event.winners ?? [])
    .map((winner) =>
      winner.type === 'user'
        ? `user:${winner.userId}:${winner.count}`
        : `guest:${winner.guestId}:${winner.count}`,
    )
    .join('\0')

  useEffect(() => {
    if (!open) return
    setSelection(buildWinnerSelectionFromEvent(event, candidates))
  }, [open, candidatesKey, winnersKey, event, candidates])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleEscape(keyboardEvent: KeyboardEvent) {
      if (keyboardEvent.key === 'Escape') onCancel()
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onCancel])

  if (!open) return null

  function handleToggle(key: string, selected: boolean) {
    setSelection((current) => ({
      ...current,
      [key]: {
        selected,
        count: current[key]?.count ?? 1,
      },
    }))
  }

  function handleCountChange(key: string, value: string) {
    const parsed = Number.parseInt(value, 10)
    const count = Number.isFinite(parsed) && parsed >= 1 ? parsed : 1

    setSelection((current) => ({
      ...current,
      [key]: {
        selected: current[key]?.selected ?? false,
        count,
      },
    }))
  }

  function handleSubmit() {
    onConfirm(buildWinnerPayload(candidates, selection))
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
          Итоги игры
        </h2>
        <p id={descId} className={styles.hint}>
          Отметьте победителей среди участников и их гостей. Сохранение полностью
          перезаписывает список побед.
        </p>

        {candidates.length > 0 ? (
          <ul className={styles.list}>
            {candidates.map((candidate) => {
              const state = selection[candidate.key] ?? { selected: false, count: 1 }

              return (
                <li key={candidate.key} className={styles.row}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={state.selected}
                      onChange={(changeEvent) =>
                        handleToggle(candidate.key, changeEvent.target.checked)
                      }
                    />
                    <span>{candidate.label}</span>
                  </label>
                  <Input
                    label="Побед"
                    type="number"
                    min={1}
                    value={String(state.count)}
                    disabled={!state.selected}
                    onChange={(changeEvent) =>
                      handleCountChange(candidate.key, changeEvent.target.value)
                    }
                  />
                </li>
              )
            })}
          </ul>
        ) : (
          <p className={styles.empty}>На событие пока никто не записался.</p>
        )}

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
            disabled={loading || candidates.length === 0}
            onClick={handleSubmit}
          >
            Сохранить
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
