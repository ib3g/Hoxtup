import { describe, it, expect, beforeAll } from 'vitest'
import type { Express } from 'express'
import type TestAgent from 'supertest'

let app: Express
let request: (app: Express) => TestAgent.Agent

beforeAll(async () => {
  const appModule = await import('../../app.js')
  app = appModule.app
  const supertestModule = await import('supertest')
  request = supertestModule.default as unknown as (app: Express) => TestAgent.Agent
})

describe('Auth — Rate limiting (Story 1.4)', () => {
  it('should rate limit login after 5 failed attempts (AC-2)', async () => {
    const email = `ratelimit-${Date.now()}@test.com`

    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/sign-in/email')
        .send({ email, password: 'WrongPass1!' })
    }

    const res = await request(app)
      .post('/api/auth/sign-in/email')
      .send({ email, password: 'WrongPass1!' })

    expect(res.status).toBe(429)
  })
})
