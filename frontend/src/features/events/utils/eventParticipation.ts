import type { EventStatus } from '@/features/events/types/event.types'

type ParticipationAction = 'login' | 'join' | 'leave' | 'none'

export type EventParticipationState = {
  label: string
  action: ParticipationAction
  disabled: boolean
  variant: 'primary' | 'secondary'
}

type GetParticipationStateParams = {
  isGuest: boolean
  isParticipant: boolean
  status: EventStatus
  isFull: boolean
}

export function getEventParticipationState({
  isGuest,
  isParticipant,
  status,
  isFull,
}: GetParticipationStateParams): EventParticipationState {
  if (isGuest) {
    return {
      label: 'Авторизоваться',
      action: 'login',
      disabled: false,
      variant: 'primary',
    }
  }

  if (isParticipant && status === 'registration_open') {
    return {
      label: 'Отменить запись',
      action: 'leave',
      disabled: false,
      variant: 'secondary',
    }
  }

  if (isParticipant) {
    return {
      label: 'Вы записаны',
      action: 'none',
      disabled: true,
      variant: 'primary',
    }
  }

  if (status === 'registration_open' && !isFull) {
    return {
      label: 'Записаться',
      action: 'join',
      disabled: false,
      variant: 'primary',
    }
  }

  if (isFull) {
    return {
      label: 'Мест нет',
      action: 'none',
      disabled: true,
      variant: 'primary',
    }
  }

  return {
    label: 'Регистрация закрыта',
    action: 'none',
    disabled: true,
    variant: 'primary',
  }
}

export function isEventParticipant(
  participantUserIds: string[] | undefined,
  userId: string | undefined,
): boolean {
  return Boolean(userId && participantUserIds?.includes(userId))
}
