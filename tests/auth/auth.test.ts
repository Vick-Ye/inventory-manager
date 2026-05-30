import { describe, it, expect } from 'vitest'
import { api, apiJson } from '../helpers'

describe('auth', () => {
  it('blocks unauthenticated API requests with 401', async () => {
    const res = await api('/api/categories', {}, false)
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('allows authenticated requests', async () => {
    const { res } = await apiJson('/api/categories')
    expect(res.status).toBe(200)
  })

  it('returns session data from get-session endpoint', async () => {
    const { res, data } = await apiJson('/api/auth/get-session')
    expect(res.status).toBe(200)
    expect(data.user).toBeDefined()
    expect(data.user.email).toBe('test-runner@test.local')
  })

  it('rejects sign-in with wrong password', async () => {
    const { res, data } = await apiJson(
      '/api/auth/sign-in/email',
      {
        method: 'POST',
        body: { email: 'test-runner@test.local', password: 'wrong-password' },
      },
      false,
    )
    expect(res.status).toBe(401)
    expect(data).toBeDefined()
  })

  it('rejects sign-up when disabled', async () => {
    const { res } = await apiJson(
      '/api/auth/sign-up/email',
      {
        method: 'POST',
        body: { name: 'Dup', email: 'test-runner@test.local', password: 'test-password-123!' },
      },
      false,
    )
    expect([403, 422]).toContain(res.status)
  })
})
