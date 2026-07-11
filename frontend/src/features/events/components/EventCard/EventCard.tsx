import { Calendar, MapPin, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge/Badge'
import { Button } from '@/components/ui/Button/Button'
import { Card } from '@/components/ui/Card/Card'
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal'
import { JoinEventModal } from '@/features/events/components/JoinEventModal/JoinEventModal'
import {
  EVENT_STATUS_LABELS,
  type EventDetail,
} from '@/features/events/types/event.types'
import {
  getEventParticipationState,
  isEventParticipant,
} from '@/features/events/utils/eventParticipation'
import { formatEventDateFromIso } from '@/utils/eventDate'
import { useAuthStore } from '@/stores/authStore'
import styles from './EventCard.module.css'

type EventCardProps = {
  event: EventDetail
  onJoin?: (eventId: string, guestNames: string[]) => void | Promise<void>
  onLeave?: (eventId: string) => void
  onJoinDismiss?: () => void
  actionLoading?: boolean
  joinError?: string
}

export function EventCard({
  event,
  onJoin,
  onLeave,
  onJoinDismiss,
  actionLoading,
  joinError,
}: EventCardProps) {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const location = useLocation()
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false)
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const isGuest = !user
  const isParticipant = isEventParticipant(event.participantUserIds, user?.id)
  const isFull = event.currentParticipants >= event.maxParticipants
  const participation = getEventParticipationState({
    isGuest,
    isParticipant,
    status: event.status,
    isFull,
  })

  const progress =
    event.maxParticipants > 0
      ? Math.min(
          100,
          (event.currentParticipants / event.maxParticipants) * 100,
        )
      : 0

  function handleActionClick() {
    if (participation.action === 'login') {
      navigate('/login', { state: { from: location } })
      return
    }

    if (participation.action === 'join') {
      setJoinModalOpen(true)
      return
    }

    if (participation.action === 'leave') {
      setLeaveConfirmOpen(true)
    }
  }

  async function handleJoinConfirm(guestNames: string[]) {
    try {
      await onJoin?.(event.id, guestNames)
      setJoinModalOpen(false)
    } catch {
    }
  }

  function handleLeaveConfirm() {
    setLeaveConfirmOpen(false)
    onLeave?.(event.id)
  }

  return (
    <>
      <Card className={styles.card}>
        <div className={styles.media}>
          <img
            className={styles.image}
            src={event.imageUrl}
            alt={event.title}
            loading="lazy"
          />
          <div className={styles.badges}>
            <Badge tone="neutral">{EVENT_STATUS_LABELS[event.status]}</Badge>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.metaRow}>
            <Calendar size={14} aria-hidden />
            <span>
              {formatEventDateFromIso(event.eventDate)} • {event.eventTime}
            </span>
          </div>

          <h3 className={styles.title}>
            {isGuest ? (
              <span>{event.title}</span>
            ) : (
              <Link to={`/events/${event.id}`}>{event.title}</Link>
            )}
          </h3>

          <div className={styles.row}>
            <MapPin size={16} color="var(--color-outline)" aria-hidden />
            <span className={styles.location}>{event.location}</span>
          </div>

          <div className={styles.row}>
            <User size={16} color="var(--color-outline)" aria-hidden />
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${progress}%`,
                  background: 'var(--color-primary-fixed-dim)',
                }}
              />
            </div>
            <span
              className={styles.slotsLabel}
              style={{
                color: isFull ? 'var(--color-error)' : 'var(--color-primary-fixed-dim)',
              }}
            >
              {isFull
                ? 'Мест нет'
                : `${event.currentParticipants}/${event.maxParticipants}`}
            </span>
          </div>

          <div className={styles.actions}>
            <Button
              type="button"
              variant={participation.variant}
              fullWidth
              disabled={participation.disabled || actionLoading}
              onClick={handleActionClick}
            >
              {participation.label}
            </Button>
          </div>
        </div>
      </Card>

      <JoinEventModal
        open={joinModalOpen}
        event={event}
        mode="join"
        userId={user?.id}
        loading={actionLoading}
        error={joinError}
        onConfirm={handleJoinConfirm}
        onCancel={() => {
          setJoinModalOpen(false)
          onJoinDismiss?.()
        }}
      />

      <ConfirmModal
        open={leaveConfirmOpen}
        title="Отмена записи"
        message="Вы уверены, что хотите отменить запись на это событие?"
        confirmLabel="Отменить запись"
        cancelLabel="Назад"
        danger
        onConfirm={handleLeaveConfirm}
        onCancel={() => setLeaveConfirmOpen(false)}
      />
    </>
  )
}
