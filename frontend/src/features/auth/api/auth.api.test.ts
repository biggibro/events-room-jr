import { describe, expect, it } from 'vitest'
import { loginApi, refreshApi } from '@/features/auth/api/auth.api'

describe('auth.api', () => {
  it('logs in and returns user', async () => {
    const result = await loginApi({
      email: 'player@jackaroo.local',
      password: 'password123',
    })

    expect(result.accessToken).toBe('test-token')
    expect(result.refreshToken).toBe('test-refresh')
    expect(result.user.email).toBe('player@jackaroo.local')
  })

  it('refreshes tokens', async () => {
    const result = await refreshApi('test-refresh')

    expect(result.accessToken).toBe('refreshed-token')
    expect(result.refreshToken).toBe('refreshed-refresh')
    expect(result.user.email).toBe('player@jackaroo.local')
  })
})
