import { describe, expect, it } from 'vitest'
import {
  getGuestAvatarColorsByIndex,
  getGuestInitial,
  GUEST_AVATAR_PALETTE,
} from '@/features/events/utils/guestAvatar'

describe('guestAvatar', () => {
  it('returns uppercase first letter', () => {
    expect(getGuestInitial('валерон')).toBe('В')
  })

  it('cycles through the cyberpunk palette by index', () => {
    expect(getGuestAvatarColorsByIndex(0)).toEqual(GUEST_AVATAR_PALETTE[0])
    expect(getGuestAvatarColorsByIndex(6)).toEqual(GUEST_AVATAR_PALETTE[0])
  })

  it('uses only design-token-based palette entries', () => {
    for (const entry of GUEST_AVATAR_PALETTE) {
      expect(entry.background).toMatch(/^color-mix|var\(--color-/)
      expect(entry.color).toMatch(/^var\(--color-/)
    }
  })
})
