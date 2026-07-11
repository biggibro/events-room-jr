import type {
  EventDetail,
  EventWinner,
  WinnerInput,
} from '@/features/events/types/event.types'

export type WinnerCandidate =
  | {
      key: string
      kind: 'user'
      userId: string
      label: string
    }
  | {
      key: string
      kind: 'guest'
      guestId: string
      label: string
    }

export type WinnerSelectionState = Record<string, { selected: boolean; count: number }>

export function buildWinnerCandidates(event: EventDetail): WinnerCandidate[] {
  const candidates: WinnerCandidate[] = []

  for (const participant of event.participants ?? []) {
    candidates.push({
      key: `user:${participant.userId}`,
      kind: 'user',
      userId: participant.userId,
      label: participant.name,
    })

    for (const guest of participant.guests ?? []) {
      candidates.push({
        key: `guest:${guest.id}`,
        kind: 'guest',
        guestId: guest.id,
        label: `${guest.name} (гость ${participant.name})`,
      })
    }
  }

  return candidates
}

export function buildWinnerSelectionFromEvent(
  event: EventDetail,
  candidates: WinnerCandidate[],
): WinnerSelectionState {
  const selection: WinnerSelectionState = {}

  for (const candidate of candidates) {
    selection[candidate.key] = { selected: false, count: 1 }
  }

  for (const winner of event.winners ?? []) {
    const key =
      winner.type === 'user' ? `user:${winner.userId}` : `guest:${winner.guestId}`

    if (selection[key]) {
      selection[key] = { selected: true, count: winner.count }
    }
  }

  return selection
}

export function buildWinnerPayload(
  candidates: WinnerCandidate[],
  selection: WinnerSelectionState,
): WinnerInput[] {
  return candidates.flatMap((candidate) => {
    const state = selection[candidate.key]
    if (!state?.selected) return []

    if (candidate.kind === 'user') {
      return [{ userId: candidate.userId, count: state.count }]
    }

    return [{ guestId: candidate.guestId, count: state.count }]
  })
}

export function formatWinnerLabel(winner: EventWinner): string {
  if (winner.type === 'guest') {
    return `${winner.name} (гость ${winner.hostName})`
  }

  return winner.name
}
