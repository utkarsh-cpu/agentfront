import { describe, it, expect } from 'vitest'
import app from '../app.js'

describe('Health endpoint', () => {
  it('GET /api/health returns 200', async () => {
    const res = await app.request('/api/health')
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body).toEqual({ status: 'ok' })
  })
})

describe('CORS', () => {
  it('responds with CORS headers on preflight', async () => {
    const res = await app.request('/api/health', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
      },
    })
    expect(res.headers.get('access-control-allow-origin')).toBe(
      'http://localhost:5173',
    )
  })
})

describe('Error handling', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await app.request('/api/nonexistent')
    expect(res.status).toBe(404)
  })
})
