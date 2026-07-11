import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BrandLoader } from '@/components/brand/BrandLoader'
import { Card } from '@/components/ui/Card/Card'
import { LocationForm } from '@/features/locations/components/LocationForm/LocationForm'
import {
  useArchiveLocationMutation,
  useLocationQuery,
  useUpdateLocationMutation,
} from '@/features/locations/api/useLocationsQuery'
import {
  locationFormToPayload,
  locationToFormValues,
} from '@/features/locations/utils/locationForm'
import {
  ADMIN_LOCATIONS_TAB_STATE,
  navigateToAdminLocations,
} from '@/pages/create-location/CreateLocationPage'
import styles from '../edit-event/EditEventPage.module.css'

export function EditLocationPage() {
  const { locationId } = useParams()
  const navigate = useNavigate()
  const { data: location, isLoading, isError } = useLocationQuery(locationId)
  const updateMutation = useUpdateLocationMutation()
  const archiveMutation = useArchiveLocationMutation()
  const [submitError, setSubmitError] = useState<string | undefined>()

  const actionLoading = updateMutation.isPending || archiveMutation.isPending

  if (isLoading) {
    return (
      <div className="page-shell">
        <BrandLoader label="Загрузка формы…" />
      </div>
    )
  }

  if (isError || !location || !locationId) {
    return (
      <div className="page-shell">
        <p>Локация не найдена.</p>
        <Link to="/admin" state={ADMIN_LOCATIONS_TAB_STATE}>Вернуться в админку</Link>
      </div>
    )
  }

  async function handleSubmit(values: Parameters<typeof locationFormToPayload>[0]) {
    setSubmitError(undefined)

    try {
      await updateMutation.mutateAsync({
        locationId: location.id,
        payload: locationFormToPayload(values),
      })
      navigateToAdminLocations(navigate)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не удалось сохранить локацию')
    }
  }

  async function handleArchive() {
    setSubmitError(undefined)

    try {
      await archiveMutation.mutateAsync(location.id)
      navigateToAdminLocations(navigate)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не удалось архивировать локацию')
    }
  }

  return (
    <div className="page-shell">
      <header className={styles.head}>
        <Link to="/admin" state={ADMIN_LOCATIONS_TAB_STATE} className={styles.backLink}>
          ← Назад
        </Link>
        <h1 className={styles.title}>Редактирование локации</h1>
        <p className={styles.subtitle}>{location.name}</p>
      </header>

      <Card className={styles.formCard}>
        <LocationForm
          mode="edit"
          defaultValues={locationToFormValues(location)}
          isArchived={location.isArchived}
          loading={actionLoading}
          submitError={submitError}
          onSubmit={handleSubmit}
          onCancel={() => navigateToAdminLocations(navigate)}
          onArchive={handleArchive}
        />
      </Card>
    </div>
  )
}
