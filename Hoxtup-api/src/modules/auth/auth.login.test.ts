import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '../../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import type { Express } from 'express'
import type TestAgent from 'supertest'

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://hoxtup:hoxtup_dev@localhost:5433/hoxtup_dev'

function createTestClient() {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  return new PrismaClient({ adapter })
}

function extractSessionCookie(res: { headers: Record<string, string | string[]> }): string | undefined {
  const cookies = res.headers['set-cookie']
  const cookieArr = Array.isArray(cookies) ? cookies : cookies ? [cookies] : []
  return cookieArr.find((c: string) => c.includes('better-auth.session_token'))
}

let app: Express
let request: (app: Express) => TestAgent.Agent

beforeAll(async () => {
  const appModule = await import('../../app.js')
  app = appModule.app
  const supertestModule = await import('supertest')
  request = supertestModule.default as unknown as (app: Express) => TestAgent.Agent
})

describe('Auth — Login & Logout (Story 1.4)', () => {
  let prisma: PrismaClient
  const testEmail = `login-${Date.now()}@test.com`
  const testPassword = 'TestPass1!'
  const testName = 'Login Test'

  beforeAll(async () => {
    prisma = createTestClient()
    await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email: testEmail, password: testPassword, name: testName })
  })

  afterAll(async () => {
    const dbUser = await prisma.user.findFirst({ where: { email: testEmail } })
    if (dbUser) {
      await prisma.account.deleteMany({ where: { userId: dbUser.id } })
      await prisma.session.deleteMany({ where: { userId: dbUser.id } })
      await prisma.user.delete({ where: { id: dbUser.id } })
    }
    await prisma.$disconnect()
  })

  it('should login with valid credentials and return session cookie (AC-1)', async () => {
    const res = await request(app)
      .post('/api/auth/sign-in/email')
      .send({ email: testEmail, password: testPassword })

    expect(res.status).toBe(200)
    expect(res.body.user).toBeDefined()
    expect(res.body.user.email).toBe(testEmail)

    const sessionCookie = extractSessionCookie(res)
    expect(sessionCookie).toBeDefined()
    expect(sessionCookie).toContain('HttpOnly')
  })

  it('should return error for invalid credentials (AC-2)', async () => {
    const res = await request(app)
      .post('/api/auth/sign-in/email')
      .send({ email: testEmail, password: 'WrongPassword1!' })

    expect(res.status).not.toBe(200)
  })

  it('should return error for non-existent email (AC-2)', async () => {
    const res = await request(app)
      .post('/api/auth/sign-in/email')
      .send({ email: 'nonexistent@test.com', password: testPassword })

    expect(res.status).not.toBe(200)
  })

  it('should validate session via get-session with cookie (AC-3)', async () => {
    const loginRes = await request(app)
      .post('/api/auth/sign-in/email')
      .send({ email: testEmail, password: testPassword })

    const sessionCookie = extractSessionCookie(loginRes)
    expect(sessionCookie).toBeDefined()

    const sessionRes = await request(app)
      .get('/api/auth/get-session')
      .set('Cookie', sessionCookie!)

    expect(sessionRes.status).toBe(200)
    expect(sessionRes.body.user).toBeDefined()
    expect(sessionRes.body.user.email).toBe(testEmail)
  })

  it('should return null session without cookie (AC-4)', async () => {
    const res = await request(app)
      .get('/api/auth/get-session')

    expect(res.body).toBeNull()
  })

  it('should invalidate session on logout (AC-5)', async () => {
    const loginRes = await request(app)
      .post('/api/auth/sign-in/email')
      .send({ email: testEmail, password: testPassword })

    const sessionCookie = extractSessionCookie(loginRes)
    expect(sessionCookie).toBeDefined()

    const logoutRes = await request(app)
      .post('/api/auth/sign-out')
      .set('Cookie', sessionCookie!)

    expect(logoutRes.status).toBe(200)

    const sessionRes = await request(app)
      .get('/api/auth/get-session')
      .set('Cookie', sessionCookie!)

    expect(sessionRes.body).toBeNull()
  })
})

describe('Auth — Auth middleware (Story 1.4)', () => {
  let prisma: PrismaClient
  const testEmail = `mw-${Date.now()}@test.com`
  const testPassword = 'TestPass1!'

  beforeAll(async () => {
    prisma = createTestClient()
    await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email: testEmail, password: testPassword, name: 'MW Test' })
  })

  afterAll(async () => {
    const dbUser = await prisma.user.findFirst({ where: { email: testEmail } })
    if (dbUser) {
      await prisma.account.deleteMany({ where: { userId: dbUser.id } })
      await prisma.session.deleteMany({ where: { userId: dbUser.id } })
      await prisma.member.deleteMany({ where: { userId: dbUser.id } })
      await prisma.user.delete({ where: { id: dbUser.id } })
    }
    await prisma.$disconnect()
  })

  it('should return 401 for protected route without session (AC-3)', async () => {
    const res = await request(app)
      .post('/api/v1/organizations')
      .send({ organizationName: 'Test Org', firstName: 'A', lastName: 'B' })

    expect(res.status).toBe(401)
    expect(res.body.title).toBe('Unauthorized')
  })

  it('should allow access to protected route with valid session (AC-3)', async () => {
    const freshEmail = `mw-access-${Date.now()}@test.com`
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email: freshEmail, password: testPassword, name: 'MW Access' })

    const sessionCookie = extractSessionCookie(signUpRes)
    expect(sessionCookie).toBeDefined()

    const res = await request(app)
      .post('/api/v1/organizations')
      .set('Cookie', sessionCookie!)
      .send({ organizationName: 'MW Org Test', firstName: 'MW', lastName: 'Test' })

    expect(res.status).toBe(201)

    const dbUser = await prisma.user.findFirst({ where: { email: freshEmail } })
    if (dbUser) {
      await prisma.member.deleteMany({ where: { userId: dbUser.id } })
      await prisma.account.deleteMany({ where: { userId: dbUser.id } })
      await prisma.session.deleteMany({ where: { userId: dbUser.id } })
      await prisma.user.update({ where: { id: dbUser.id }, data: { organizationId: null } })
      const org = await prisma.organization.findFirst({ where: { name: 'MW Org Test' } })
      if (org) {
        await prisma.organization.delete({ where: { id: org.id } })
      }
      await prisma.user.delete({ where: { id: dbUser.id } })
    }
  })

  it('should return 401 for protected route with invalid cookie (AC-4)', async () => {
    const res = await request(app)
      .post('/api/v1/organizations')
      .set('Cookie', 'better-auth.session_token=invalid-token-value')
      .send({ organizationName: 'Test Org', firstName: 'A', lastName: 'B' })

    expect(res.status).toBe(401)
  })
})
