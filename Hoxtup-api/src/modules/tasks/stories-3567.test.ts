import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../app.js'
import { prisma } from '../../config/database.js'
import { eventBus } from '../../common/events/event-bus.js'
import { EVENT } from '../../common/events/event-types.js'
import { detectPropertyConflicts, detectStaffConflicts } from './task-conflict.service.js'

const TEST_PREFIX = `s3567-${Date.now()}`

function extractSessionCookie(res: request.Response): string | undefined {
  const cookies = res.headers['set-cookie']
  const arr = Array.isArray(cookies) ? cookies : cookies ? [cookies] : []
  return arr.find((c: string) => c.includes('better-auth.session_token'))
}

describe('Stories 3.5/3.6/3.7', () => {
  let sessionCookie: string
  let userId: string
  let orgId: string
  let propertyId: string

  beforeAll(async () => {
    const email = `${TEST_PREFIX}@test.com`
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'TestPass1!', name: 'S3567 Tester' })
    expect(signUpRes.status).toBe(200)
    sessionCookie = extractSessionCookie(signUpRes)!

    const userRow = await prisma.user.findFirst({ where: { email } })
    userId = userRow!.id

    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Cookie', sessionCookie)
      .send({ organizationName: `${TEST_PREFIX} Org`, firstName: 'S3567', lastName: 'Test' })
    expect(orgRes.status).toBe(201)
    orgId = orgRes.body.id

    await request(app)
      .post('/api/auth/organization/set-active')
      .set('Cookie', sessionCookie)
      .send({ organizationId: orgId })

    const propRes = await request(app)
      .post('/api/v1/properties')
      .set('Cookie', sessionCookie)
      .send({ name: 'Villa S3567', address: '1 Rue S3567' })
    expect(propRes.status).toBe(201)
    propertyId = propRes.body.id
  })

  afterAll(async () => {
    try {
      await prisma.incident.deleteMany({ where: { organizationId: orgId } })
      await prisma.taskConflict.deleteMany({ where: { organizationId: orgId } })
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
    await prisma.incident.deleteMany({ where: { organizationId: orgId } })
    await prisma.taskConflict.deleteMany({ where: { organizationId: orgId } })
    await prisma.taskHistory.deleteMany({ where: { task: { organizationId: orgId } } })
    await prisma.task.deleteMany({ where: { organizationId: orgId } })
  })

  // ─── Story 3.5: Conflict Detection ───

  describe('Story 3.5 — Conflict Detection', () => {
    it('should detect property overlap (AC-1)', async () => {
      const t1 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Overlap A', status: 'TODO', scheduledAt: new Date('2026-05-01T10:00:00Z'), durationMinutes: 120 },
      })
      const t2 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Overlap B', status: 'TODO', scheduledAt: new Date('2026-05-01T11:00:00Z'), durationMinutes: 60 },
      })

      const conflicts = await detectPropertyConflicts(t2.id, orgId, propertyId, new Date('2026-05-01T11:00:00Z'), 60)
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0]).toBe(t1.id)

      const stored = await prisma.taskConflict.findMany({ where: { organizationId: orgId } })
      expect(stored).toHaveLength(1)
      expect(stored[0].conflictType).toBe('PROPERTY')
      expect(stored[0].status).toBe('detected')
    })

    it('should NOT detect non-overlapping tasks', async () => {
      await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'NoOverlap A', status: 'TODO', scheduledAt: new Date('2026-05-01T08:00:00Z'), durationMinutes: 60 },
      })
      const t2 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'NoOverlap B', status: 'TODO', scheduledAt: new Date('2026-05-01T14:00:00Z'), durationMinutes: 60 },
      })

      const conflicts = await detectPropertyConflicts(t2.id, orgId, propertyId, new Date('2026-05-01T14:00:00Z'), 60)
      expect(conflicts).toHaveLength(0)
    })

    it('should detect staff overlap (AC-3)', async () => {
      const t1 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Staff A', status: 'TODO', scheduledAt: new Date('2026-06-01T10:00:00Z'), durationMinutes: 120, assignedUserId: userId },
      })
      const t2 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Staff B', status: 'TODO', scheduledAt: new Date('2026-06-01T11:00:00Z'), durationMinutes: 60, assignedUserId: userId },
      })

      const conflicts = await detectStaffConflicts(t2.id, orgId, userId, new Date('2026-06-01T11:00:00Z'), 60)
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0]).toBe(t1.id)
    })

    it('should acknowledge conflict (AC-5)', async () => {
      const t1 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Ack A', status: 'TODO', scheduledAt: new Date('2026-07-01T10:00:00Z'), durationMinutes: 120 },
      })
      const t2 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Ack B', status: 'TODO', scheduledAt: new Date('2026-07-01T11:00:00Z'), durationMinutes: 60 },
      })
      await detectPropertyConflicts(t2.id, orgId, propertyId, new Date('2026-07-01T11:00:00Z'), 60)

      const conflicts = await prisma.taskConflict.findMany({ where: { organizationId: orgId } })
      const res = await request(app)
        .patch(`/api/v1/conflicts/${conflicts[0].id}/acknowledge`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('acknowledged')

      // Should not re-detect acknowledged pair
      const conflicts2 = await detectPropertyConflicts(t1.id, orgId, propertyId, new Date('2026-07-01T10:00:00Z'), 120)
      expect(conflicts2).toHaveLength(0)
    })

    it('should emit task_conflict_detected event (AC-4)', async () => {
      const events: unknown[] = []
      const handler = (e: unknown) => events.push(e)
      eventBus.on(EVENT.TASK_CONFLICT_DETECTED, handler)

      await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Evt A', status: 'TODO', scheduledAt: new Date('2026-08-01T10:00:00Z'), durationMinutes: 120 },
      })
      const t2 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Evt B', status: 'TODO', scheduledAt: new Date('2026-08-01T11:00:00Z'), durationMinutes: 60 },
      })
      await detectPropertyConflicts(t2.id, orgId, propertyId, new Date('2026-08-01T11:00:00Z'), 60)

      expect(events).toHaveLength(1)
      eventBus.off(EVENT.TASK_CONFLICT_DETECTED, handler)
    })

    it('should list conflicts via API', async () => {
      await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'List A', status: 'TODO', scheduledAt: new Date('2026-09-01T10:00:00Z'), durationMinutes: 120 },
      })
      const t2 = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'List B', status: 'TODO', scheduledAt: new Date('2026-09-01T11:00:00Z'), durationMinutes: 60 },
      })
      await detectPropertyConflicts(t2.id, orgId, propertyId, new Date('2026-09-01T11:00:00Z'), 60)

      const res = await request(app)
        .get('/api/v1/conflicts')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.conflicts.length).toBeGreaterThanOrEqual(1)
    })
  })

  // ─── Story 3.6: Incident Reporting ───

  describe('Story 3.6 — Incident Reporting', () => {
    it('should report incident on IN_PROGRESS task (AC-1, AC-2)', async () => {
      const task = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Incident task', status: 'IN_PROGRESS', startedAt: new Date() },
      })

      const res = await request(app)
        .post(`/api/v1/tasks/${task.id}/incident`)
        .set('Cookie', sessionCookie)
        .send({ type: 'EQUIPMENT', description: 'Lave-vaisselle cassé' })
      expect(res.status).toBe(201)
      expect(res.body.type).toBe('EQUIPMENT')

      const updated = await prisma.task.findUnique({ where: { id: task.id } })
      expect(updated!.status).toBe('INCIDENT')
    })

    it('should NOT report incident on non-IN_PROGRESS task', async () => {
      const task = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Not started', status: 'TODO' },
      })

      const res = await request(app)
        .post(`/api/v1/tasks/${task.id}/incident`)
        .set('Cookie', sessionCookie)
        .send({ type: 'STOCK', description: 'Missing supplies' })
      expect(res.status).toBe(404)
    })

    it('should resolve incident and create repair task (AC-4, AC-5)', async () => {
      const task = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Repair source', status: 'IN_PROGRESS', startedAt: new Date() },
      })

      const incRes = await request(app)
        .post(`/api/v1/tasks/${task.id}/incident`)
        .set('Cookie', sessionCookie)
        .send({ type: 'EQUIPMENT', description: 'Broken faucet' })
      expect(incRes.status).toBe(201)

      const resolveRes = await request(app)
        .patch(`/api/v1/incidents/${incRes.body.id}/resolve`)
        .set('Cookie', sessionCookie)
        .send({ resolution: 'Create repair', createRepairTask: true })
      expect(resolveRes.status).toBe(200)
      expect(resolveRes.body.incident.status).toBe('resolved')
      expect(resolveRes.body.repairTask).toBeTruthy()
      expect(resolveRes.body.repairTask.type).toBe('MAINTENANCE')
      expect(resolveRes.body.repairTask.status).toBe('TODO')
    })

    it('should list incidents via API', async () => {
      const task = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'List inc', status: 'IN_PROGRESS', startedAt: new Date() },
      })
      await request(app)
        .post(`/api/v1/tasks/${task.id}/incident`)
        .set('Cookie', sessionCookie)
        .send({ type: 'CLEANLINESS' })

      const res = await request(app)
        .get('/api/v1/incidents')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.incidents.length).toBeGreaterThanOrEqual(1)
    })

    it('should emit task_incident_reported event (AC-7)', async () => {
      const events: unknown[] = []
      const handler = (e: unknown) => events.push(e)
      eventBus.on(EVENT.TASK_INCIDENT_REPORTED, handler)

      const task = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Evt inc', status: 'IN_PROGRESS', startedAt: new Date() },
      })
      await request(app)
        .post(`/api/v1/tasks/${task.id}/incident`)
        .set('Cookie', sessionCookie)
        .send({ type: 'OTHER' })

      expect(events).toHaveLength(1)
      eventBus.off(EVENT.TASK_INCIDENT_REPORTED, handler)
    })
  })

  // ─── Story 3.7: Proxy Task Management ───

  describe('Story 3.7 — Proxy Task Management', () => {
    it('should proxy-transition a task (AC-1, AC-2)', async () => {
      const task = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Proxy task', status: 'TODO', assignedUserId: userId },
      })

      const res = await request(app)
        .patch(`/api/v1/tasks/${task.id}/proxy-transition`)
        .set('Cookie', sessionCookie)
        .send({ action: 'start', onBehalfOfId: userId })
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('IN_PROGRESS')

      const history = await prisma.taskHistory.findMany({ where: { taskId: task.id } })
      expect(history).toHaveLength(1)
      expect(history[0].isProxy).toBe(true)
      expect(history[0].onBehalfOfId).toBe(userId)
    })

    it('should record proxy metadata in audit trail (AC-2)', async () => {
      const task = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Audit proxy', status: 'TODO', assignedUserId: userId },
      })

      await request(app)
        .patch(`/api/v1/tasks/${task.id}/proxy-transition`)
        .set('Cookie', sessionCookie)
        .send({ action: 'start', onBehalfOfId: userId, note: 'Retroactive update' })

      const history = await prisma.taskHistory.findMany({ where: { taskId: task.id } })
      expect(history[0].isProxy).toBe(true)
      expect(history[0].note).toBe('Retroactive update')
      expect(history[0].actorId).toBe(userId)
      expect(history[0].onBehalfOfId).toBe(userId)
    })

    it('should emit same events as normal transition (AC-7)', async () => {
      const events: unknown[] = []
      const handler = (e: unknown) => events.push(e)
      eventBus.on(EVENT.TASK_STATE_CHANGED, handler)

      const task = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Evt proxy', status: 'TODO', assignedUserId: userId },
      })

      await request(app)
        .patch(`/api/v1/tasks/${task.id}/proxy-transition`)
        .set('Cookie', sessionCookie)
        .send({ action: 'start', onBehalfOfId: userId })

      expect(events.length).toBeGreaterThanOrEqual(1)
      eventBus.off(EVENT.TASK_STATE_CHANGED, handler)
    })

    it('should return 422 for invalid proxy transition', async () => {
      const task = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Bad proxy', status: 'COMPLETED' },
      })

      const res = await request(app)
        .patch(`/api/v1/tasks/${task.id}/proxy-transition`)
        .set('Cookie', sessionCookie)
        .send({ action: 'start', onBehalfOfId: userId })
      expect(res.status).toBe(422)
    })
  })
})
