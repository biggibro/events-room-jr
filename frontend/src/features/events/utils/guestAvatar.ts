export type GuestAvatarColors = {
  background: string
  color: string
}

export const GUEST_AVATAR_PALETTE: readonly GuestAvatarColors[] = [
  {
    background:
      'color-mix(in srgb, var(--color-primary-fixed-dim) 18%, var(--color-surface-container-high))',
    color: 'var(--color-primary-fixed-dim)',
  },
  {
    background:
      'color-mix(in srgb, var(--color-secondary-container) 55%, var(--color-surface-container-high))',
    color: 'var(--color-secondary-fixed-dim)',
  },
  {
    background:
      'color-mix(in srgb, var(--color-tertiary-fixed-dim) 22%, var(--color-surface-container-high))',
    color: 'var(--color-tertiary-fixed-dim)',
  },
  {
    background:
      'color-mix(in srgb, var(--color-on-primary-fixed-variant) 55%, var(--color-surface-container))',
    color: 'var(--color-primary-fixed)',
  },
  {
    background:
      'color-mix(in srgb, var(--color-on-secondary-fixed-variant) 50%, var(--color-surface-container))',
    color: 'var(--color-secondary-brand)',
  },
  {
    background:
      'color-mix(in srgb, var(--color-on-tertiary-fixed-variant) 45%, var(--color-surface-container))',
    color: 'var(--color-tertiary-fixed)',
  },
] as const

export function getGuestInitial(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  return trimmed[0]?.toLocaleUpperCase('ru-RU') ?? '?'
}

export function getGuestAvatarColorsByIndex(index: number): GuestAvatarColors {
  return GUEST_AVATAR_PALETTE[index % GUEST_AVATAR_PALETTE.length]
}
