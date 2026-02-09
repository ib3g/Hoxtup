import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../app.js'
import { prisma } from '../../config/database.js'
import { detectFusionCandidates, acceptFusion, rejectFusion } from './task-fusion.service.js'

const TEST_PREFIX = `fusion-${Date.now()}`

function extractSessionCookie(res: request.Response): string | undefined {
  const cookies = res.headers['set-cookie']
  const arr = Array.isArray(cookies) ? cookies : cookies ? [cookies] : []
  return arr.find((c: string) => c.includes('better-auth.session_token'))
}

describe('Task Fusion Engine (Story 3.4)', () => {
  let sessionCookie: string
  let userId: string
  let orgId: string
  let propertyId: string

  beforeAll(async () => {
    const email = `${TEST_PREFIX}@test.com`
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'TestPass1!', name: 'Fusion Tester' })
    expect(signUpRes.status).toBe(200)
    sessionCookie = extractSessionCookie(signUpRes)!

    const userRow = await prisma.user.findFirst({ where: { email } })
    userId = userRow!.id

    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Cookie', sessionCookie)
      .send({ organizationName: `${TEST_PREFIX} Org`, firstName: 'Fusion', lastName: 'Test' })
    expect(orgRes.status).toBe(201)
    orgId = orgRes.body.id

    await request(app)
      .post('/api/auth/organization/set-active')
      .set('Cookie', sessionCookie)
      .send({ organizationId: orgId })

    const propRes = await request(app)
      .post('/api/v1/properties')
      .set('Cookie', sessionCookie)
      .send({ name: 'Villa Fusion', address: '1 Rue Fusion' })
    expect(propRes.status).toBe(201)
    propertyId = propRes.body.id
  })

  afterAll(async () => {
    try {
      await prisma.fusionRejection.deleteMany({ where: { taskAId: { startsWith: '' } } })
      await prisma.fusionPair.deleteMany({ where: { organizationId: orgId } })
      await prisma.taskHistory.deleteMany({ where: { task: { organizationId: orgId } } })
      await prisma.task.deleteMany({ where: { organizationId: orgId } })
      await prisma.taskAutoRule.deleteMany({ where: { organizationId: orgId } })
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
    await prisma.fusionRejection.deleteMany({ where: { taskAId: { startsWith: '' } } })
    await prisma.fusionPair.deleteMany({ where: { organizationId: orgId } })
    await prisma.taskHistory.deleteMany({ where: { task: { organizationId: orgId } } })
    await prisma.task.deleteMany({ where: { organizationId: orgId } })
  })

  describe('Fusion detection (AC-1)', () => {
    it('should detect overlapping tasks within 4h window', async () => {
      const t1 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Clean A', status: 'PENDING_VALIDATION', scheduledAt: new Date('2026-05-01T10:00:00Z') },
      })
      const t2 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Clean B', status: 'PENDING_VALIDATION', scheduledAt: new Date('2026-05-01T12:00:00Z') },
      })

      const pairId = await detectFusionCandidates(t2.id, orgId, propertyId, new Date('2026-05-01T12:00:00Z'))
      expect(pairId).toBeTruthy()

      const pair = await prisma.fusionPair.findUnique({ where: { id: pairId! } })
      expect(pair!.status).toBe('pending')

      const updatedT1 = await prisma.task.findUnique({ where: { id: t1.id } })
      const updatedT2 = await prisma.task.findUnique({ where: { id: t2.id } })
      expect(updatedT1!.status).toBe('FUSION_SUGGESTED')
      expect(updatedT2!.status).toBe('FUSION_SUGGESTED')
    })

    it('should NOT detect tasks outside 4h window', async () => {
      await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Far A', status: 'PENDING_VALIDATION', scheduledAt: new Date('2026-05-01T08:00:00Z') },
      })
      const t2 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Far B', status: 'PENDING_VALIDATION', scheduledAt: new Date('2026-05-01T18:00:00Z') },
      })

      const pairId = await detectFusionCandidates(t2.id, orgId, propertyId, new Date('2026-05-01T18:00:00Z'))
      expect(pairId).toBeNull()
    })
  })

  describe('Accept fusion (AC-3)', () => {
    it('should create merged TURNOVER task and cancel originals', async () => {
      const t1 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Merge A', status: 'PENDING_VALIDATION', scheduledAt: new Date('2026-06-01T10:00:00Z'), durationMinutes: 60 },
      })
      const t2 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Merge B', status: 'PENDING_VALIDATION', scheduledAt: new Date('2026-06-01T12:00:00Z'), durationMinutes: 60 },
      })

      const pairId = await detectFusionCandidates(t2.id, orgId, propertyId, new Date('2026-06-01T12:00:00Z'))
      expect(pairId).toBeTruthy()

      const result = await acceptFusion(pairId!, orgId, userId)
      expect(result).toBeTruthy()
      expect(result!.mergedTask.type).toBe('TURNOVER')
      expect(result!.mergedTask.status).toBe('PENDING_VALIDATION')
      expect(result!.mergedTask.durationMinutes).toBe(84) // 120 * 0.7
      expect(result!.cancelledTaskIds).toHaveLength(2)

      const cancelled1 = await prisma.task.findUnique({ where: { id: t1.id } })
      const cancelled2 = await prisma.task.findUnique({ where: { id: t2.id } })
      expect(cancelled1!.status).toBe('CANCELLED')
      expect(cancelled2!.status).toBe('CANCELLED')
    })
  })

  describe('Reject fusion (AC-4)', () => {
    it('should restore tasks and record rejection', async () => {
      const t1 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Reject A', status: 'PENDING_VALIDATION', scheduledAt: new Date('2026-07-01T10:00:00Z') },
      })
      const t2 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Reject B', status: 'PENDING_VALIDATION', scheduledAt: new Date('2026-07-01T12:00:00Z') },
      })

      const pairId = await detectFusionCandidates(t2.id, orgId, propertyId, new Date('2026-07-01T12:00:00Z'))
      expect(pairId).toBeTruthy()

      const result = await rejectFusion(pairId!, orgId)
      expect(result).toBeTruthy()
      expect(result!.restoredTaskIds).toHaveLength(2)

      const restored1 = await prisma.task.findUnique({ where: { id: t1.id } })
      const restored2 = await prisma.task.findUnique({ where: { id: t2.id } })
      expect(restored1!.status).toBe('PENDING_VALIDATION')
      expect(restored2!.status).toBe('PENDING_VALIDATION')
    })

    it('should not re-suggest rejected pair (AC-4)', async () => {
      const t1 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'NoRe A', status: 'PENDING_VALIDATION', scheduledAt: new Date('2026-08-01T10:00:00Z') },
      })
      const t2 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'NoRe B', status: 'PENDING_VALIDATION', scheduledAt: new Date('2026-08-01T12:00:00Z') },
      })

      const pairId = await detectFusionCandidates(t2.id, orgId, propertyId, new Date('2026-08-01T12:00:00Z'))
      expect(pairId).toBeTruthy()
      await rejectFusion(pairId!, orgId)

      // Reset task statuses to allow re-detection attempt
      await prisma.task.updateMany({ where: { id: { in: [t1.id, t2.id] } }, data: { status: 'PENDING_VALIDATION' } })

      const pairId2 = await detectFusionCandidates(t2.id, orgId, propertyId, new Date('2026-08-01T12:00:00Z'))
      expect(pairId2).toBeNull()
    })
  })

  describe('Fusion API', () => {
    it('should list fusion suggestions', async () => {
      const t1 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'API A', status: 'PENDING_VALIDATION', scheduledAt: new Date('2026-09-01T10:00:00Z') },
      })
      const t2 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'API B', status: 'PENDING_VALIDATION', scheduledAt: new Date('2026-09-01T12:00:00Z') },
      })
      await detectFusionCandidates(t2.id, orgId, propertyId, new Date('2026-09-01T12:00:00Z'))

      const res = await request(app)
        .get('/api/v1/tasks/fusion-suggestions')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.suggestions).toHaveLength(1)
      expect(res.body.suggestions[0].taskA).toBeTruthy()
      expect(res.body.suggestions[0].taskB).toBeTruthy()
    })

    it('should accept fusion via API', async () => {
      await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'AccAPI A', status: 'PENDING_VALIDATION', scheduledAt: new Date('2026-10-01T10:00:00Z'), durationMinutes: 60 },
      })
      const t2 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'AccAPI B', status: 'PENDING_VALIDATION', scheduledAt: new Date('2026-10-01T12:00:00Z'), durationMinutes: 60 },
      })
      const pairId = await detectFusionCandidates(t2.id, orgId, propertyId, new Date('2026-10-01T12:00:00Z'))

      const res = await request(app)
        .post(`/api/v1/tasks/fusion/${pairId}/accept`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.mergedTask.type).toBe('TURNOVER')
    })

    it('should reject fusion via API', async () => {
      await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'RejAPI A', status: 'PENDING_VALIDATION', scheduledAt: new Date('2026-11-01T10:00:00Z') },
      })
      const t2 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'RejAPI B', status: 'PENDING_VALIDATION', scheduledAt: new Date('2026-11-01T12:00:00Z') },
      })
      const pairId = await detectFusionCandidates(t2.id, orgId, propertyId, new Date('2026-11-01T12:00:00Z'))

      const res = await request(app)
        .post(`/api/v1/tasks/fusion/${pairId}/reject`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.restoredTaskIds).toHaveLength(2)
    })
  })
})
