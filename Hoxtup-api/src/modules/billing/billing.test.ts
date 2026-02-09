import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../app.js'
import { prisma } from '../../config/database.js'

const TEST_PREFIX = `bill-${Date.now()}`

function extractSessionCookie(res: request.Response): string | undefined {
  const cookies = res.headers['set-cookie']
  const arr = Array.isArray(cookies) ? cookies : cookies ? [cookies] : []
  return arr.find((c: string) => c.includes('better-auth.session_token'))
}

describe('Epic 8: Billing & Subscription', () => {
  let sessionCookie: string
  let userId: string
  let orgId: string
  let propertyId: string

  beforeAll(async () => {
    const email = `${TEST_PREFIX}@test.com`
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'TestPass1!', name: 'Bill Tester' })
    expect(signUpRes.status).toBe(200)
    sessionCookie = extractSessionCookie(signUpRes)!

    const userRow = await prisma.user.findFirst({ where: { email } })
    userId = userRow!.id

    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Cookie', sessionCookie)
      .send({ organizationName: `${TEST_PREFIX} Org`, firstName: 'Bill', lastName: 'Test' })
    expect(orgRes.status).toBe(201)
    orgId = orgRes.body.id

    await request(app)
      .post('/api/auth/organization/set-active')
      .set('Cookie', sessionCookie)
      .send({ organizationId: orgId })

    const propRes = await request(app)
      .post('/api/v1/properties')
      .set('Cookie', sessionCookie)
      .send({
        name: 'Villa Billing',
        address: '1 Rue Paiement',
        capacity: 2,
        type: 'APARTMENT',
      })
    expect(propRes.status).toBe(201)
    propertyId = propRes.body.id
  })

  afterAll(async () => {
    try {
      await prisma.subscription.deleteMany({ where: { organizationId: orgId } })
      await prisma.taskAutoRule.deleteMany({ where: { organizationId: orgId } })
      await prisma.notification.deleteMany({ where: { organizationId: orgId } })
      await prisma.notificationPreference.deleteMany({ where: { userId } })
      await prisma.property.deleteMany({ where: { organizationId: orgId } })
      const members = await prisma.member.findMany({ where: { userId } })
      for (const m of members) await prisma.member.delete({ where: { id: m.id } })
      await prisma.user.updateMany({ where: { id: userId }, data: { organizationId: null } })
      await prisma.invitation.deleteMany({ where: { organizationId: orgId } })
      await prisma.organization.delete({ where: { id: orgId } })
      await prisma.account.deleteMany({ where: { userId } })
      await prisma.session.deleteMany({ where: { userId } })
      await prisma.user.deleteMany({ where: { id: userId } })
    } catch {
      // cleanup best-effort
    }
  })

  beforeEach(async () => {
    await prisma.subscription.deleteMany({ where: { organizationId: orgId } })
  })

  // ─── Story 8.1: Polar Integration & Subscription Plans ───

  describe('Story 8.1 — Subscription Plans', () => {
    it('should list all plans (AC-1)', async () => {
      const res = await request(app)
        .get('/api/v1/billing/plans')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.plans).toHaveLength(5)
      expect(res.body.plans.map((p: { tier: string }) => p.tier)).toEqual(['FREE', 'STARTER', 'PRO', 'SCALE', 'AGENCY'])
      expect(res.body.plans[0].price).toBe(0)
      expect(res.body.plans[0].maxProperties).toBe(1)
    })

    it('should return subscription with usage (AC-8)', async () => {
      await prisma.subscription.create({
        data: { organizationId: orgId, planTier: 'STARTER', status: 'ACTIVE', currentPeriodEnd: new Date('2026-07-01') },
      })

      const res = await request(app)
        .get('/api/v1/billing')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.planTier).toBe('STARTER')
      expect(res.body.status).toBe('ACTIVE')
      expect(res.body.usage.properties).toBe(1)
      expect(res.body.usage.maxProperties).toBe(5)
      expect(res.body.usage.percentage).toBe(20)
    })

    it('should handle webhook subscription.created (AC-3)', async () => {
      const res = await request(app)
        .post('/api/v1/webhooks/polar')
        .send({
          type: 'subscription.created',
          data: {
            id: 'polar_sub_123',
            customerId: 'polar_cust_456',
            metadata: { organizationId: orgId },
            planTier: 'PRO',
            currentPeriodEnd: '2026-07-15T00:00:00Z',
          },
        })
      expect(res.status).toBe(200)
      expect(res.body.received).toBe(true)

      const sub = await prisma.subscription.findUnique({ where: { organizationId: orgId } })
      expect(sub?.status).toBe('ACTIVE')
      expect(sub?.planTier).toBe('PRO')
      expect(sub?.polarSubscriptionId).toBe('polar_sub_123')
    })

    it('should handle webhook subscription.canceled (AC-4)', async () => {
      await prisma.subscription.create({
        data: { organizationId: orgId, planTier: 'PRO', status: 'ACTIVE', polarSubscriptionId: 'polar_sub_cancel' },
      })

      const res = await request(app)
        .post('/api/v1/webhooks/polar')
        .send({
          type: 'subscription.canceled',
          data: { id: 'polar_sub_cancel' },
        })
      expect(res.status).toBe(200)

      const sub = await prisma.subscription.findUnique({ where: { organizationId: orgId } })
      expect(sub?.status).toBe('CANCELLED')
      expect(sub?.cancelledAt).not.toBeNull()
    })

    it('should enforce property limit (AC-5)', async () => {
      await prisma.subscription.create({
        data: { organizationId: orgId, planTier: 'FREE', status: 'ACTIVE' },
      })

      const { checkPropertyLimit } = await import('./billing.service.js')
      const result = await checkPropertyLimit(orgId)
      expect(result.allowed).toBe(false)
      expect(result.message).toContain('STARTER')
    })
  })

  // ─── Story 8.2: Trial Management & Plan Transitions ───

  describe('Story 8.2 — Trial & Transitions', () => {
    it('should init trial subscription (AC-1)', async () => {
      const { initTrialSubscription } = await import('./billing.service.js')
      await initTrialSubscription(orgId)

      const sub = await prisma.subscription.findUnique({ where: { organizationId: orgId } })
      expect(sub?.status).toBe('TRIALING')
      expect(sub?.planTier).toBe('PRO')
      expect(sub?.trialEnd).not.toBeNull()

      const daysRemaining = Math.ceil((sub!.trialEnd!.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      expect(daysRemaining).toBeGreaterThanOrEqual(29)
      expect(daysRemaining).toBeLessThanOrEqual(31)
    })

    it('should not create duplicate trial (AC-1)', async () => {
      const { initTrialSubscription } = await import('./billing.service.js')
      await initTrialSubscription(orgId)
      await initTrialSubscription(orgId)

      const subs = await prisma.subscription.findMany({ where: { organizationId: orgId } })
      expect(subs).toHaveLength(1)
    })

    it('should compute trial days remaining', async () => {
      const { getTrialDaysRemaining } = await import('./billing.service.js')

      const future = new Date()
      future.setDate(future.getDate() + 7)
      const remaining = getTrialDaysRemaining(future)
      expect(remaining).toBeGreaterThanOrEqual(7)
      expect(remaining).toBeLessThanOrEqual(8)

      const past = new Date()
      past.setDate(past.getDate() - 1)
      expect(getTrialDaysRemaining(past)).toBe(0)

      expect(getTrialDaysRemaining(null)).toBe(0)
    })

    it('should detect read-only for PAST_DUE (AC-4)', async () => {
      await prisma.subscription.create({
        data: { organizationId: orgId, planTier: 'PRO', status: 'PAST_DUE' },
      })

      const { isReadOnly } = await import('./billing.service.js')
      expect(await isReadOnly(orgId)).toBe(true)
    })

    it('should detect active subscription', async () => {
      await prisma.subscription.create({
        data: { organizationId: orgId, planTier: 'PRO', status: 'ACTIVE' },
      })

      const { isSubscriptionActive } = await import('./billing.service.js')
      expect(await isSubscriptionActive(orgId)).toBe(true)
    })
  })

  // ─── Story 8.3: Billing Settings & Invoice Management ───

  describe('Story 8.3 — Billing Settings', () => {
    it('should return billing overview with usage (AC-1)', async () => {
      await prisma.subscription.create({
        data: { organizationId: orgId, planTier: 'PRO', status: 'ACTIVE', currentPeriodEnd: new Date('2026-08-01') },
      })

      const res = await request(app)
        .get('/api/v1/billing')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.plan).toHaveProperty('tier', 'PRO')
      expect(res.body.plan).toHaveProperty('price', 19900)
      expect(res.body.plan).toHaveProperty('features')
      expect(res.body.usage).toHaveProperty('properties')
      expect(res.body.usage).toHaveProperty('percentage')
    })

    it('should cancel subscription (AC-6)', async () => {
      await prisma.subscription.create({
        data: { organizationId: orgId, planTier: 'PRO', status: 'ACTIVE' },
      })

      const res = await request(app)
        .post('/api/v1/billing/cancel')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('CANCELLED')
      expect(res.body.cancelledAt).not.toBeNull()
    })

    it('should return 404 for missing subscription', async () => {
      const res = await request(app)
        .get('/api/v1/billing')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(404)
    })

    it('should detect 80% usage threshold (AC-5)', async () => {
      await prisma.subscription.create({
        data: { organizationId: orgId, planTier: 'STARTER', status: 'ACTIVE' },
      })

      const res = await request(app)
        .get('/api/v1/billing')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.usage.percentage).toBe(20)
    })
  })
})
