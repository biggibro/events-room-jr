import { BarChart3, Calendar, MapPin, TrendingUp, Trophy, Users } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '@/api/http'
import { EditProfileModal } from '@/features/profile/components/EditProfileModal/EditProfileModal'
import {
  useProfileQuery,
  useUpdateCredentialsMutation,
  useUpdateProfileMutation,
} from '@/features/profile/api/useProfileQuery'
import type { PastEventBadge } from '@/features/profile/types/profile.types'
import { EVENT_STATUS_LABELS } from '@/features/events/types/event.types'
import { Badge } from '@/components/ui/Badge/Badge'
import { BrandLoader } from '@/components/brand/BrandLoader'
import { Button } from '@/components/ui/Button/Button'
import { Card } from '@/components/ui/Card/Card'
import { useAuthStore } from '@/stores/authStore'
import { formatEventDateFromIso } from '@/utils/eventDate'
import styles from './ProfilePage.module.css'

const TABS = ['Предстоящие игры', 'Прошедшие игры', 'Достижения'] as const

function outcomeBadge(badge: PastEventBadge) {
  if (badge === 'win') return { label: 'Победа', tone: 'success' as const }
  if (badge === 'second') return { label: 'Второе место', tone: 'danger' as const }
  return { label: 'Участие', tone: 'neutral' as const }
}

export function ProfilePage() {
  const { userId } = useParams()
  const currentUser = useAuthStore((state) => state.user)
  const isOwnProfile = !userId || userId === currentUser?.id
  const { data, isLoading, isError } = useProfileQuery(userId)
  const navigate = useNavigate()
  const [tab, setTab] = useState<(typeof TABS)[number]>(TABS[0])
  const [editOpen, setEditOpen] = useState(false)
  const profileMutation = useUpdateProfileMutation()
  const credentialsMutation = useUpdateCredentialsMutation()

  if (isLoading) {
    return (
      <div className="page-shell">
        <BrandLoader label="Загрузка профиля…" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="page-shell">
        <Card className={styles.state}>
          <p style={{ color: 'var(--color-on-surface-variant)' }}>
            Не удалось загрузить профиль. Возможно, сессия истекла.
          </p>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <Button variant="primary" onClick={() => navigate('/login')}>
              Войти
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="page-shell">
      <section className={styles.header}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatar}>
            <img src={data.avatarUrl} alt="" />
          </div>
          {isOwnProfile ? (
            <button
              type="button"
              className={styles.edit}
              aria-label="Редактировать профиль"
              onClick={() => setEditOpen(true)}
            >
              ✎
            </button>
          ) : null}
        </div>
        <div className={styles.identity}>
          <div className={styles.nameRow}>
            <h1 className={styles.displayName}>{data.displayName}</h1>
            <span className={styles.tag}>{data.tagline}</span>
          </div>
          {data.email ? <p className={styles.email}>{data.email}</p> : null}
          <p className={styles.bio}>{data.bio}</p>
        </div>
      </section>

      <section className={styles.stats}>
        <Card className={styles.statCard}>
          <Trophy size={20} color="var(--color-primary-fixed-dim)" aria-hidden />
          <div className={styles.statLabel}>Официальные победы</div>
          <div className={styles.statValue}>{data.stats.officialWins}</div>
        </Card>
        <Card className={styles.statCard}>
          <Users size={20} color="var(--color-secondary-fixed-dim)" aria-hidden />
          <div className={styles.statLabel}>Игр сыграно</div>
          <div className={styles.statValue}>{data.stats.gamesPlayed}</div>
        </Card>
        <Card className={styles.statCard}>
          <BarChart3 size={20} color="var(--color-on-surface-variant)" aria-hidden />
          <div className={styles.statLabel}>Процент побед</div>
          <div className={styles.statValue}>{data.stats.winrate}</div>
        </Card>
        <Card className={styles.statCard}>
          <TrendingUp size={20} color="var(--color-primary-fixed-dim)" aria-hidden />
          <div className={styles.statLabel}>Статистика</div>
          <div className={styles.statValue}>Jackaroo</div>
        </Card>
      </section>

      <div className={styles.tabs} role="tablist" aria-label="Разделы профиля">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            className={`${styles.tab} ${tab === item ? styles.tabActive : ''}`}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {tab === TABS[0] ? (
            data.upcomingEvents.length ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)',
                }}
              >
                {data.upcomingEvents.map((event) => (
                  <Card key={event.id}>
                    <div className={styles.eventRow}>
                      <div className={styles.thumb}>
                        <img src={event.imageUrl} alt="" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800 }}>{event.title}</div>
                        <div className={styles.eventMeta}>
                          <Calendar size={14} aria-hidden style={{ verticalAlign: 'middle' }} />{' '}
                          {formatEventDateFromIso(event.date)} · {event.time}
                        </div>
                        <div className={styles.eventMeta}>
                          <MapPin size={14} aria-hidden style={{ verticalAlign: 'middle' }} />{' '}
                          {event.location}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Badge tone="neutral">{EVENT_STATUS_LABELS[event.status]}</Badge>
                        <div style={{ marginTop: '0.5rem' }}>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/events/${event.id}`)}
                          >
                            В комнату
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <p style={{ color: 'var(--color-on-surface-variant)' }}>
                  Вы пока не записаны на предстоящие игры. Откройте расписание и выберите событие.
                </p>
              </Card>
            )
          ) : tab === TABS[1] ? (
            data.pastEvents.length ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)',
                }}
              >
                {data.pastEvents.map((event) => {
                  const badge = outcomeBadge(event.badge)
                  return (
                    <Card key={event.id}>
                      <div className={styles.eventRow}>
                        <div className={styles.thumb}>
                          <img src={event.imageUrl} alt="" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800 }}>{event.title}</div>
                          <div className={styles.eventMeta}>{formatEventDateFromIso(event.date)}</div>
                          {event.wins ? (
                            <div className={styles.eventMeta}>Побед: {event.wins}</div>
                          ) : null}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <Badge tone={badge.tone}>{badge.label}</Badge>
                          <div style={{ marginTop: '0.5rem' }}>
                            <Button variant="ghost" size="sm">
                              Подробнее
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card>
                <p style={{ color: 'var(--color-on-surface-variant)' }}>
                  Пока нет завершённых игр. Запишитесь на событие в расписании.
                </p>
              </Card>
            )
          ) : (
            <Card>
              <p style={{ color: 'var(--color-on-surface-variant)' }}>
                Раздел «Достижения» будет подключён в следующих итерациях.
              </p>
            </Card>
          )}
      </div>

      {isOwnProfile ? (
        <EditProfileModal
          open={editOpen}
          initialValues={{
            email: data.email,
            name: data.displayName,
            tagline: data.tagline,
            bio: data.bio,
            avatarUrl: data.avatarUrl,
          }}
          profileLoading={profileMutation.isPending}
          profileError={
            profileMutation.error
              ? getApiErrorMessage(profileMutation.error, 'Не удалось сохранить профиль')
              : undefined
          }
          credentialsLoading={credentialsMutation.isPending}
          credentialsError={
            credentialsMutation.error
              ? getApiErrorMessage(
                  credentialsMutation.error,
                  'Не удалось сохранить учётные данные',
                )
              : undefined
          }
          onSaveProfile={(payload) => {
            profileMutation.reset()
            profileMutation.mutate(payload)
          }}
          onSaveCredentials={(payload) => {
            credentialsMutation.reset()
            credentialsMutation.mutate(payload)
          }}
          onCancel={() => {
            setEditOpen(false)
            profileMutation.reset()
            credentialsMutation.reset()
          }}
        />
      ) : null}
    </div>
  )
}
