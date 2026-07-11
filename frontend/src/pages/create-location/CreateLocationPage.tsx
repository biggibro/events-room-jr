import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card/Card'
import { LocationForm } from '@/features/locations/components/LocationForm/LocationForm'
import { useCreateLocationMutation } from '@/features/locations/api/useLocationsQuery'
import {
  defaultLocationFormValues,
  locationFormToPayload,
} from '@/features/locations/utils/locationForm'
import styles from '../edit-event/EditEventPage.module.css'

export const ADMIN_LOCATIONS_TAB = 'Локации' as const

export const ADMIN_LOCATIONS_TAB_STATE = { tab: ADMIN_LOCATIONS_TAB } as const

export function navigateToAdminLocations(
  navigate: (to: string, options?: { state?: typeof ADMIN_LOCATIONS_TAB_STATE }) => void,
) {
  navigate('/admin', { state: ADMIN_LOCATIONS_TAB_STATE })
}

export function CreateLocationPage() {
  const navigate = useNavigate()
  const createMutation = useCreateLocationMutation()
  const [submitError, setSubmitError] = useState<string | undefined>()

  async function handleSubmit(values: Parameters<typeof locationFormToPayload>[0]) {
    setSubmitError(undefined)

    try {
      await createMutation.mutateAsync(locationFormToPayload(values))
      navigateToAdminLocations(navigate)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не удалось создать локацию')
    }
  }

  return (
    <div className="page-shell">
      <header className={styles.head}>
        <Link to="/admin" state={ADMIN_LOCATIONS_TAB_STATE} className={styles.backLink}>
          ← Назад
        </Link>
        <h1 className={styles.title}>Создание локации</h1>
      </header>

      <Card className={styles.formCard}>
        <LocationForm
          mode="create"
          defaultValues={defaultLocationFormValues()}
          loading={createMutation.isPending}
          submitError={submitError}
          onSubmit={handleSubmit}
          onCancel={() => navigateToAdminLocations(navigate)}
        />
      </Card>
    </div>
  )
}
