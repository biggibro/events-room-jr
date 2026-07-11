import { Armchair, Clock, Shuffle, Users } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EventChat } from '@/features/chat/components/EventChat/EventChat'
import { AssignWinnersModal } from '@/features/events/components/AssignWinnersModal/AssignWinnersModal'
import { EventWinsTable } from '@/features/events/components/EventWinsTable/EventWinsTable'
import { JoinEventModal } from '@/features/events/components/JoinEventModal/JoinEventModal'
import { ParticipantParty } from '@/features/events/components/ParticipantParty/ParticipantParty'
import {
  useEventQuery,
  useJoinEventMutation,
  useLeaveEventMutation,
  useReplaceWinnersMutation,
} from '@/features/events/api/useEventsQuery'
import {
  EVENT_STATUS_LABELS,
  type EventStatus,
  type WinnerInput,
} from '@/features/events/types/event.types'
import {
  getEventParticipationState,
  isEventParticipant,
} from '@/features/events/utils/eventParticipation'
import { Badge } from '@/components/ui/Badge/Badge'
import { BrandLoader } from '@/components/brand/BrandLoader'
import { Button } from '@/components/ui/Button/Button'
import { Card } from '@/components/ui/Card/Card'
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal'
import { useAuthStore } from '@/stores/authStore'
import { isAdminRole } from '@/utils/roles'
import { formatEventDateFromIso } from '@/utils/eventDate'
import styles from './EventDetailsPage.module.css'

const DEFAULT_PARTICIPANT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop'

function statusTone(status: EventStatus) {
  if (status === 'registration_open') return 'success' as const
  if (status === 'completed') return 'neutral' as const
  return 'official' as const
}

export function EventDetailsPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { data: event, isLoading, isError } = useEventQuery(eventId)
  const joinMutation = useJoinEventMutation()
  const leaveMutation = useLeaveEventMutation()
  const replaceWinnersMutation = useReplaceWinnersMutation()
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false)
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [winnersModalOpen, setWinnersModalOpen] = useState(false)
  const actionLoading = joinMutation.isPending || leaveMutation.isPending

  if (isLoading) {
    return (
      <div className="page-shell">
        <BrandLoader label="Загрузка события…" />
      </div>
    )
  }

  if (isError || !event) {
    return (
      <div className="page-shell">
        <p>Событие не найдено.</p>
        <Link to="/events">Вернуться к расписанию</Link>
      </div>
    )
  }

  const isFull = event.currentParticipants >= event.maxParticipants
  const isParticipant = isEventParticipant(event.participantUserIds, user?.id)
  const participation = getEventParticipationState({
    isGuest: false,
    isParticipant,
    status: event.status,
    isFull,
  })

  const currentGuestNames =
    event.participants?.find((participant) => participant.userId === user?.id)?.guestNames ?? []
  const canEditGuests = isParticipant && event.status === 'registration_open'
  const isAdmin = Boolean(user && isAdminRole(user.role))

  async function handleJoinConfirm(guestNames: string[]) {
    if (!eventId) return

    try {
      await joinMutation.mutateAsync({ eventId, payload: { guestNames } })
      setJoinModalOpen(false)
    } catch {
    }
  }

  async function handleWinnersConfirm(winners: WinnerInput[]) {
    if (!eventId) return

    try {
      await replaceWinnersMutation.mutateAsync({ eventId, payload: { winners } })
      setWinnersModalOpen(false)
    } catch {
    }
  }

  return (
    <div className={`page-shell ${styles.layout}`}>
      <div style={{ gridColumn: '1 / -1' }}>
        <div
          className={styles.hero}
          style={
            {
              ['--hero-image' as string]: `url(${event.imageUrl})`,
            } as CSSProperties
          }
        >
          <div className={styles.heroBg} aria-hidden />
          <div className={styles.heroTop}>
            <Badge tone={statusTone(event.status)}>
              {EVENT_STATUS_LABELS[event.status]}
            </Badge>
            {isAdmin ? (
              <button
                type="button"
                className={styles.editHero}
                aria-label="Редактировать событие"
                onClick={() =>
                  navigate(`/events/${event.id}/edit`, {
                    state: { returnTo: `/events/${event.id}` },
                  })
                }
              >
                ✎
              </button>
            ) : null}
          </div>
          <h1 className={styles.title}>{event.title}</h1>
          <p className={styles.meta}>
            {formatEventDateFromIso(event.eventDate)} • {event.eventTime}
          </p>
        </div>
      </div>

      <EventChat eventId={event.id} locked={!isParticipant} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <Card>
          <h2 className={styles.sectionTitle}>О событии</h2>
          <p style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.6 }}>
            {event.description}
          </p>
          <div className={styles.statsRow} style={{ marginTop: 'var(--space-6)' }}>
            <div className={styles.stat}>
              <Users size={18} aria-hidden />
              <div className={styles.statLabel}>Участники</div>
              <div className={styles.statValue}>
                {event.currentParticipants}/{event.maxParticipants}
              </div>
            </div>
            <div className={styles.stat}>
              {event.seatingType === 'random' ? (
                <Shuffle size={18} aria-hidden />
              ) : (
                <Armchair size={18} aria-hidden />
              )}
              <div className={styles.statLabel}>Рассадка</div>
              <div className={`${styles.statValue} ${styles.statValueText}`}>
                {event.seatingType === 'random' ? 'Случайная' : 'Свободная'}
              </div>
            </div>
            <div className={styles.stat}>
              <Clock size={18} aria-hidden />
              <div className={styles.statLabel}>Длительность</div>
              <div className={styles.statValue}>{event.durationHours} ч</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Участники</h2>
            {isAdmin ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWinnersModalOpen(true)}
              >
                Итоги игры
              </Button>
            ) : null}
          </div>
          {event.participants?.length ? (
            <div className={styles.participants}>
              {event.participants.map((person) => (
                <ParticipantParty
                  key={person.userId}
                  participant={person}
                  fallbackAvatarUrl={DEFAULT_PARTICIPANT_AVATAR}
                />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-on-surface-variant)' }}>
              Пока никто не записался.
            </p>
          )}
          <EventWinsTable winners={event.winners ?? []} />
        </Card>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <Card>
          <h2 className={styles.sectionTitle}>Запись на событие</h2>
          <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '1rem' }}>
            Можно прийти одному или указать гостей при записи. Список гостей при
            повторной записи полностью перезаписывается.
          </p>
          {participation.action === 'join' ? (
            <Button
              variant={participation.variant}
              fullWidth
              disabled={participation.disabled || actionLoading}
              onClick={() => setJoinModalOpen(true)}
            >
              {participation.label}
            </Button>
          ) : canEditGuests ? (
            <div className={styles.participationActions}>
              <Button
                variant="primary"
                fullWidth
                disabled={actionLoading}
                onClick={() => setJoinModalOpen(true)}
              >
                Изменить гостей
              </Button>
              <Button
                variant="secondary"
                fullWidth
                disabled={actionLoading}
                onClick={() => setLeaveConfirmOpen(true)}
              >
                Отменить запись
              </Button>
            </div>
          ) : (
            <Button
              variant={participation.variant}
              fullWidth
              disabled={participation.disabled || actionLoading}
            >
              {participation.label}
            </Button>
          )}
        </Card>

        <Card>
          <h2 className={styles.sectionTitle}>Локация</h2>
          <p style={{ fontWeight: 700, marginBottom: '0.35rem' }}>{event.location}</p>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.9rem' }}>
            {event.locationAddress}
          </p>
          {event.locationMapUrl ? (
            <a
              href={event.locationMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mapLink}
            >
              Открыть на карте
            </a>
          ) : null}
        </Card>
      </div>

      <AssignWinnersModal
        open={winnersModalOpen}
        event={event}
        loading={replaceWinnersMutation.isPending}
        error={
          replaceWinnersMutation.error
            ? (replaceWinnersMutation.error as Error).message
            : undefined
        }
        onConfirm={handleWinnersConfirm}
        onCancel={() => {
          setWinnersModalOpen(false)
          replaceWinnersMutation.reset()
        }}
      />

      <JoinEventModal
        open={joinModalOpen}
        event={event}
        mode={isParticipant ? 'edit' : 'join'}
        userId={user?.id}
        initialGuestNames={currentGuestNames}
        loading={joinMutation.isPending}
        error={joinMutation.error ? (joinMutation.error as Error).message : undefined}
        onConfirm={handleJoinConfirm}
        onCancel={() => {
          setJoinModalOpen(false)
          joinMutation.reset()
        }}
      />

      <ConfirmModal
        open={leaveConfirmOpen}
        title="Отмена записи"
        message="Вы уверены, что хотите отменить запись на это событие?"
        confirmLabel="Отменить запись"
        cancelLabel="Назад"
        danger
        onConfirm={() => {
          setLeaveConfirmOpen(false)
          leaveMutation.mutate(event.id)
        }}
        onCancel={() => setLeaveConfirmOpen(false)}
      />
    </div>
  )
}
