import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal'
import { Input } from '@/components/ui/Input/Input'
import type { LocationFormValues } from '@/features/locations/types/location.types'
import {
  hasLocationFormErrors,
  validateLocationForm,
  type LocationFormErrors,
} from '@/features/locations/utils/locationForm'
import styles from './LocationForm.module.css'

export type LocationFormProps = {
  mode: 'create' | 'edit'
  defaultValues: LocationFormValues
  isArchived?: boolean
  loading?: boolean
  submitError?: string
  onSubmit: (values: LocationFormValues) => void
  onCancel: () => void
  onArchive?: () => void
}

export function LocationForm({
  mode,
  defaultValues,
  isArchived = false,
  loading = false,
  submitError,
  onSubmit,
  onCancel,
  onArchive,
}: LocationFormProps) {
  const [values, setValues] = useState(defaultValues)
  const [errors, setErrors] = useState<LocationFormErrors>({})
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false)
  const defaultValuesKey = JSON.stringify(defaultValues)

  useEffect(() => {
    setValues(defaultValues)
    setErrors({})
  }, [defaultValuesKey, defaultValues])

  function updateField<K extends keyof LocationFormValues>(
    field: K,
    value: LocationFormValues[K],
  ) {
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
    const nextErrors = validateLocationForm(values)
    setErrors(nextErrors)
    if (hasLocationFormErrors(nextErrors)) return
    onSubmit(values)
  }

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Основное</h2>
          <div className={styles.grid}>
            <Input
              label="Название"
              name="name"
              value={values.name}
              onChange={(event) => updateField('name', event.target.value)}
              error={errors.name}
              disabled={loading}
            />
            <Input
              label="Адрес"
              name="address"
              value={values.address}
              onChange={(event) => updateField('address', event.target.value)}
              error={errors.address}
              disabled={loading}
            />
            <Input
              label="Телефон"
              name="phone"
              type="tel"
              value={values.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              error={errors.phone}
              disabled={loading}
              placeholder="+7 (900) 000-00-00"
            />
            <div className={styles.field}>
              <Input
                label="Ссылка на карту"
                name="mapUrl"
                type="url"
                value={values.mapUrl}
                onChange={(event) => updateField('mapUrl', event.target.value)}
                error={errors.mapUrl}
                disabled={loading}
                placeholder="https://yandex.ru/maps/..."
              />
              <p className={styles.hint}>Яндекс Карты или 2ГИС</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Описание</h2>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="location-description">
              Текст
            </label>
            <textarea
              id="location-description"
              className={styles.textarea}
              name="description"
              value={values.description}
              onChange={(event) => updateField('description', event.target.value)}
              disabled={loading}
            />
            {errors.description ? (
              <span className={styles.errorText}>{errors.description}</span>
            ) : null}
          </div>
        </section>

        {submitError ? <p className={styles.formError}>{submitError}</p> : null}

        <div className={styles.actions}>
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
          <Button type="button" variant="secondary" disabled={loading} onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Сохранение…' : mode === 'create' ? 'Создать' : 'Сохранить'}
          </Button>
        </div>
      </form>

      <ConfirmModal
        open={archiveConfirmOpen}
        title="Архивировать локацию"
        message="Перевести локацию в архив? Она исчезнет из списка активных площадок."
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
