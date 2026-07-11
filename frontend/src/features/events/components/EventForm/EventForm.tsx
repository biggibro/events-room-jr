import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { getApiErrorMessage } from '@/api/http'
import { Button } from '@/components/ui/Button/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal'
import { DatePicker } from '@/components/ui/DatePicker/DatePicker'
import { Input } from '@/components/ui/Input/Input'
import { Select } from '@/components/ui/Select/Select'
import { TimePicker } from '@/components/ui/TimePicker/TimePicker'
import { useUploadEventCoverMutation } from '@/features/uploads/api/useUploads'
import {
  IMAGE_FILE_ACCEPT,
  validateImageFile,
} from '@/features/uploads/utils/imageFileValidation'
import {
  EVENT_STATUS_LABELS,
  type EditableEventStatus,
  type EventFormSubmitMeta,
  type EventFormValues,
  type EventParticipant,
  type EventStatus,
} from '@/features/events/types/event.types'
import type { Location } from '@/features/locations/types/location.types'
import {
  hasEventFormErrors,
  validateEventForm,
  type EventFormErrors,
} from '@/features/events/utils/eventForm'
import styles from './EventForm.module.css'

const EDITABLE_STATUSES: EditableEventStatus[] = [
  'registration_open',
  'registration_closed',
  'completed',
]

const ALL_STATUSES: EventStatus[] = ['archived', ...EDITABLE_STATUSES]

const EMPTY_PARTICIPANTS: EventParticipant[] = []

type CoverInputMode = 'file' | 'url'

export type EventFormProps = {
  mode: 'create' | 'edit'
  defaultValues: EventFormValues
  locations: Location[]
  participants?: EventParticipant[]
  loading?: boolean
  submitError?: string
  onSubmit: (values: EventFormValues, meta?: EventFormSubmitMeta) => void
  onCancel: () => void
  onArchive?: () => void
}

export function EventForm({
  mode,
  defaultValues,
  locations,
  participants = EMPTY_PARTICIPANTS,
  loading = false,
  submitError,
  onSubmit,
  onCancel,
  onArchive,
}: EventFormProps) {
  const [values, setValues] = useState(defaultValues)
  const [errors, setErrors] = useState<EventFormErrors>({})
  const [localParticipants, setLocalParticipants] = useState(participants)
  const [removedParticipantIds, setRemovedParticipantIds] = useState<string[]>([])
  const [participantToRemove, setParticipantToRemove] = useState<EventParticipant | null>(null)
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false)
  const [coverInputMode, setCoverInputMode] = useState<CoverInputMode>('file')
  const [coverUploadError, setCoverUploadError] = useState<string>()
  const coverFileInputRef = useRef<HTMLInputElement>(null)
  const coverUploadMutation = useUploadEventCoverMutation()
  const defaultValuesKey = JSON.stringify(defaultValues)
  const participantsKey = JSON.stringify(participants)

  useEffect(() => {
    setValues(defaultValues)
    setErrors({})
    setCoverUploadError(undefined)
    setCoverInputMode(defaultValues.imageUrl.trim().startsWith('http') ? 'url' : 'file')
    // defaultValuesKey captures content changes; defaultValues is read from the matching render
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync only when serialized values change
  }, [defaultValuesKey])

  function handleCoverFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const validationError = validateImageFile(file)
    if (validationError) {
      setCoverUploadError(validationError)
      return
    }

    setCoverUploadError(undefined)
    coverUploadMutation.mutate(file, {
      onSuccess: (result) => {
        updateField('imageUrl', result.url)
      },
      onError: (error) => {
        setCoverUploadError(getApiErrorMessage(error, 'Не удалось загрузить обложку'))
      },
    })
  }

  const formBusy = loading || coverUploadMutation.isPending

  useEffect(() => {
    if (mode !== 'edit') return
    setLocalParticipants(participants)
    setRemovedParticipantIds([])
  }, [mode, participantsKey])

  function updateField<K extends keyof EventFormValues>(field: K, value: EventFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const nextErrors = validateEventForm(values)
    setErrors(nextErrors)
    if (hasEventFormErrors(nextErrors)) return
    onSubmit(
      values,
      mode === 'edit' ? { removedParticipantIds } : undefined,
    )
  }

  const isArchived = values.status === 'archived'
  const statusOptions: EventStatus[] =
    mode === 'create'
      ? ALL_STATUSES
      : isArchived
        ? ['archived', ...EDITABLE_STATUSES]
        : EDITABLE_STATUSES

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Основное</h2>
          <div className={styles.grid}>
            <Input
              label="Название"
              name="title"
              value={values.title}
              onChange={(event) => updateField('title', event.target.value)}
              error={errors.title}
              disabled={formBusy}
            />
            <div className={clsx(styles.grid, styles.gridTwo)}>
              <DatePicker
                label="Дата"
                name="eventDate"
                value={values.eventDate}
                onChange={(eventDate) => updateField('eventDate', eventDate)}
                error={errors.eventDate}
                disabled={formBusy}
              />
              <TimePicker
                label="Время"
                name="eventTime"
                value={values.eventTime}
                onChange={(eventTime) => updateField('eventTime', eventTime)}
                error={errors.eventTime}
                disabled={formBusy}
              />
            </div>
            <div className={styles.coverField}>
              <div className={styles.coverModeTabs} role="tablist" aria-label="Способ обложки">
                <button
                  type="button"
                  role="tab"
                  aria-selected={coverInputMode === 'file'}
                  className={clsx(
                    styles.coverModeTab,
                    coverInputMode === 'file' && styles.coverModeTabActive,
                  )}
                  onClick={() => setCoverInputMode('file')}
                  disabled={formBusy}
                >
                  Загрузить файл
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={coverInputMode === 'url'}
                  className={clsx(
                    styles.coverModeTab,
                    coverInputMode === 'url' && styles.coverModeTabActive,
                  )}
                  onClick={() => setCoverInputMode('url')}
                  disabled={formBusy}
                >
                  Вставить URL
                </button>
              </div>

              {coverInputMode === 'file' ? (
                <div className={styles.coverUpload}>
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept={IMAGE_FILE_ACCEPT}
                    className={styles.hiddenFileInput}
                    onChange={handleCoverFileChange}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={formBusy}
                    onClick={() => coverFileInputRef.current?.click()}
                  >
                    {coverUploadMutation.isPending ? 'Загрузка…' : 'Выбрать файл'}
                  </Button>
                  {coverUploadError ? (
                    <p className={styles.errorText}>{coverUploadError}</p>
                  ) : null}
                </div>
              ) : (
                <Input
                  label="URL обложки"
                  name="imageUrl"
                  value={values.imageUrl}
                  onChange={(event) => updateField('imageUrl', event.target.value)}
                  error={errors.imageUrl}
                  disabled={formBusy}
                  placeholder="https://..."
                />
              )}
            </div>
            {values.imageUrl.trim() ? (
              <img
                className={styles.imagePreview}
                src={values.imageUrl}
                alt=""
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />
            ) : null}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Описание</h2>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="event-description">
              Текст
            </label>
            <textarea
              id="event-description"
              className={styles.textarea}
              value={values.description}
              onChange={(event) => updateField('description', event.target.value)}
              disabled={formBusy}
            />
            {errors.description ? (
              <p className={styles.errorText}>{errors.description}</p>
            ) : null}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Локация</h2>
          <Select
            id="event-location"
            label="Место проведения"
            value={values.locationId}
            onChange={(event) => updateField('locationId', event.target.value)}
            disabled={loading || locations.length === 0}
            error={errors.locationId}
          >
            <option value="">Выберите локацию</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name} — {location.address}
              </option>
            ))}
          </Select>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Параметры</h2>
          <div className={clsx(styles.grid, styles.gridTwo)}>
            <Input
              label="Макс. участников"
              name="maxParticipants"
              type="number"
              min={1}
              value={values.maxParticipants}
              onChange={(event) =>
                updateField('maxParticipants', Number(event.target.value))
              }
              error={errors.maxParticipants}
              disabled={formBusy}
            />
            <Input
              label="Длительность (ч)"
              name="durationHours"
              type="number"
              min={1}
              value={values.durationHours}
              onChange={(event) =>
                updateField('durationHours', Number(event.target.value))
              }
              error={errors.durationHours}
              disabled={formBusy}
            />
            <Select
              id="event-seating"
              label="Рассадка"
              value={values.seatingType}
              onChange={(event) =>
                updateField('seatingType', event.target.value as EventFormValues['seatingType'])
              }
              disabled={formBusy}
            >
              <option value="random">Случайная</option>
              <option value="free">Свободная</option>
            </Select>
          </div>
        </section>

        {mode === 'create' || mode === 'edit' ? (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Статус</h2>
            <div className={styles.statusRow}>
              <Select
                id="event-status"
                label="Статус события"
                value={values.status}
                onChange={(event) =>
                  updateField('status', event.target.value as EventStatus)
                }
                disabled={formBusy}
              >
                {statusOptions.map((status) => (
                  <option
                    key={status}
                    value={status}
                    disabled={mode === 'edit' && status === 'archived'}
                  >
                    {EVENT_STATUS_LABELS[status]}
                  </option>
                ))}
              </Select>
              {mode === 'edit' && onArchive ? (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={loading || isArchived}
                  onClick={() => setArchiveConfirmOpen(true)}
                >
                  В архив
                </Button>
              ) : null}
            </div>
          </section>
        ) : null}

        {mode === 'edit' ? (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Участники</h2>
            {localParticipants.length > 0 ? (
              <div className={styles.participants}>
                {localParticipants.map((participant) => (
                  <div key={participant.userId} className={styles.participantRow}>
                    <div className={styles.participantInfo}>
                      <div className={styles.participantName}>{participant.name}</div>
                      <div className={styles.participantNote}>{participant.note}</div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={formBusy}
                      onClick={() => setParticipantToRemove(participant)}
                    >
                      Удалить
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyParticipants}>Пока никто не записался.</p>
            )}
          </section>
        ) : null}

        {submitError ? <p className={styles.formError}>{submitError}</p> : null}

        <div className={styles.actions}>
          <Button type="button" variant="secondary" disabled={formBusy} onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" disabled={formBusy}>
            {formBusy ? 'Сохранение…' : mode === 'create' ? 'Создать' : 'Сохранить'}
          </Button>
        </div>
      </form>

      <ConfirmModal
        open={participantToRemove !== null}
        title="Удалить участника"
        message={
          participantToRemove
            ? `Удалить ${participantToRemove.name} из состава события?`
            : ''
        }
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        danger
        onConfirm={() => {
          if (participantToRemove) {
            setLocalParticipants((current) =>
              current.filter((participant) => participant.userId !== participantToRemove.userId),
            )
            setRemovedParticipantIds((current) =>
              current.includes(participantToRemove.userId)
                ? current
                : [...current, participantToRemove.userId],
            )
          }
          setParticipantToRemove(null)
        }}
        onCancel={() => setParticipantToRemove(null)}
      />

      <ConfirmModal
        open={archiveConfirmOpen}
        title="Архивировать событие"
        message="Перевести событие в архив? Оно исчезнет из публичного расписания."
        confirmLabel="В архив"
        cancelLabel="Отмена"
        danger
        onConfirm={() => {
          setArchiveConfirmOpen(false)
          onArchive?.()
        }}
        onCancel={() => setArchiveConfirmOpen(false)}
      />
    </>
  )
}
