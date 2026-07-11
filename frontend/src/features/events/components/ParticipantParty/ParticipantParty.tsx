import { useEffect, useId, useRef, useState } from 'react'
import type { EventParticipant } from '@/features/events/types/event.types'
import {
  getGuestAvatarColorsByIndex,
  getGuestInitial,
} from '@/features/events/utils/guestAvatar'
import styles from './ParticipantParty.module.css'

const MAX_VISIBLE_GUESTS = 2
const MAX_CAPTION_GUESTS = 4

type ParticipantPartyProps = {
  participant: EventParticipant
  fallbackAvatarUrl: string
}

type GuestCaption =
  | { type: 'none' }
  | { type: 'full'; text: string }
  | { type: 'truncated'; preview: string[]; hiddenCount: number }

function getGuestCaption(guestNames: string[]): GuestCaption {
  if (guestNames.length === 0) return { type: 'none' }
  if (guestNames.length <= MAX_CAPTION_GUESTS) {
    return { type: 'full', text: guestNames.join(', ') }
  }

  return {
    type: 'truncated',
    preview: guestNames.slice(0, 2),
    hiddenCount: guestNames.length - 2,
  }
}

export function ParticipantParty({ participant, fallbackAvatarUrl }: ParticipantPartyProps) {
  const { guestNames } = participant
  const visibleGuests = guestNames.slice(0, MAX_VISIBLE_GUESTS)
  const overflowCount = Math.max(0, guestNames.length - MAX_VISIBLE_GUESTS)
  const guestCaption = getGuestCaption(guestNames)
  const showGuestPopover = guestNames.length > MAX_CAPTION_GUESTS
  const popoverId = useId()
  const partyRef = useRef<HTMLDivElement>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)

  useEffect(() => {
    if (!popoverOpen) return

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target
      if (!(target instanceof Node) || !partyRef.current?.contains(target)) {
        setPopoverOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setPopoverOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [popoverOpen])

  function openGuestPopover() {
    if (!showGuestPopover) return
    setPopoverOpen(true)
  }

  const clusterLabel =
    guestNames.length > 0
      ? `${participant.name} с гостями: ${guestNames.join(', ')}`
      : participant.name

  return (
    <div className={styles.party} ref={partyRef}>
      <div className={styles.avatarCluster} aria-label={clusterLabel}>
        <div className={styles.hostAvatar}>
          <img src={participant.avatarUrl || fallbackAvatarUrl} alt="" />
        </div>

        {visibleGuests.map((guestName, index) => {
          const colors = getGuestAvatarColorsByIndex(index)

          return (
            <div
              key={`${guestName}-${index}`}
              className={styles.guestAvatar}
              title={`Гость: ${guestName}`}
              style={{
                zIndex: MAX_VISIBLE_GUESTS - index,
                background: colors.background,
                color: colors.color,
              }}
              aria-hidden
            >
              {getGuestInitial(guestName)}
            </div>
          )
        })}

        {overflowCount > 0 ? (
          showGuestPopover ? (
            <button
              type="button"
              className={styles.guestAvatarOverflowButton}
              style={{ zIndex: 0 }}
              aria-expanded={popoverOpen}
              aria-controls={popoverId}
              aria-label={`Показать всех гостей: ${guestNames.join(', ')}`}
              onClick={openGuestPopover}
            >
              +{overflowCount}
            </button>
          ) : (
            <div
              className={styles.guestAvatarOverflow}
              style={{ zIndex: 0 }}
              title={guestNames.slice(MAX_VISIBLE_GUESTS).join(', ')}
              aria-hidden
            >
              +{overflowCount}
            </div>
          )
        ) : null}
      </div>

      <div className={styles.hostName}>{participant.name}</div>

      {guestCaption.type === 'full' ? (
        <div className={styles.guestCaption}>{guestCaption.text}</div>
      ) : guestCaption.type === 'truncated' ? (
        <div className={styles.guestCaption}>
          {guestCaption.preview.join(', ')},{' '}
          <button
            type="button"
            className={styles.moreButton}
            aria-expanded={popoverOpen}
            aria-controls={popoverId}
            onClick={openGuestPopover}
          >
            и ещё {guestCaption.hiddenCount}
          </button>
        </div>
      ) : (
        <div className={styles.soloNote}>{participant.note}</div>
      )}

      {showGuestPopover && popoverOpen ? (
        <div id={popoverId} className={styles.guestPopover} role="dialog" aria-label="Список гостей">
          <p className={styles.guestPopoverTitle}>Гости</p>
          <ul className={styles.guestPopoverList}>
            {guestNames.map((guestName, index) => {
              const colors = getGuestAvatarColorsByIndex(index)

              return (
                <li key={`${guestName}-${index}`} className={styles.guestPopoverItem}>
                  <span
                    className={styles.guestPopoverInitial}
                    style={{
                      background: colors.background,
                      color: colors.color,
                    }}
                    aria-hidden
                  >
                    {getGuestInitial(guestName)}
                  </span>
                  <span>{guestName}</span>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
