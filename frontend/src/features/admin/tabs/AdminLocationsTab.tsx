import { MapPin, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrandLoader } from '@/components/brand/BrandLoader'
import { Badge } from '@/components/ui/Badge/Badge'
import { Button } from '@/components/ui/Button/Button'
import { Card } from '@/components/ui/Card/Card'
import { AdminListRow } from '@/features/admin/components/AdminListRow/AdminListRow'
import { AdminToolbar } from '@/features/admin/components/AdminToolbar/AdminToolbar'
import { useLocationsQuery } from '@/features/locations/api/useLocationsQuery'
import styles from './AdminTab.module.css'

export function AdminLocationsTab() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data, isLoading, isError } = useLocationsQuery({ includeArchived: true })

  const locations = useMemo(() => {
    const items = data ?? []
    const query = search.trim().toLowerCase()
    if (!query) return items
    return items.filter((location) => location.name.toLowerCase().includes(query))
  }, [data, search])

  if (isLoading && !data) {
    return <BrandLoader label="Загрузка локаций…" />
  }

  if (isError) {
    return (
      <Card className={styles.state}>
        <p className={styles.stateText}>Не удалось загрузить список локаций.</p>
      </Card>
    )
  }

  return (
    <>
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Поиск по названию…"
        searchAriaLabel="Поиск локаций"
        action={
          <Button
            variant="primary"
            size="sm"
            className={styles.createLocationBtn}
            aria-label="Создать локацию"
            onClick={() => navigate('/admin/locations/new')}
          >
            <Plus size={18} aria-hidden />
          </Button>
        }
      />

      <div className={styles.listHeader}>
        <span className={styles.totalCount}>
          Всего: <strong>{locations.length}</strong>
        </span>
      </div>

      {locations.length ? (
        <div className={styles.list}>
          {locations.map((location) => (
            <AdminListRow
              key={location.id}
              thumb={<MapPin size={22} color="var(--color-primary-fixed-dim)" aria-hidden />}
              title={location.name}
              meta={
                <div className={styles.metaLine}>
                  <MapPin size={14} aria-hidden />
                  {location.address}
                </div>
              }
              actions={
                <>
                  {location.isArchived ? (
                    <Badge tone="neutral">Архив</Badge>
                  ) : null}
                  <div className={styles.actionBtn}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/admin/locations/${location.id}/edit`)}
                    >
                      Редактировать
                    </Button>
                  </div>
                </>
              }
            />
          ))}
        </div>
      ) : (
        <Card className={styles.state}>
          <p className={styles.stateText}>Локации не найдены.</p>
        </Card>
      )}
    </>
  )
}
