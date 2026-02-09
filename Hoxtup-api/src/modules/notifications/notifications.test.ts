import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../app.js'
import { prisma } from '../../config/database.js'
import { createNotification } from './notification.service.js'
import { renderEmail } from './email-template.service.js'
import { resolveTemplate, NOTIFICATION_TRIGGERS } from './notification-triggers.config.js'
import { seedDefaultPreferences, updatePreferences } from './preferences.service.js'

const TEST_PREFIX = `notif-${Date.now()}`

function extractSessionCookie(res: request.Response): string | undefined {
  const cookies = res.headers['set-cookie']
  const arr = Array.isArray(cookies) ? cookies : cookies ? [cookies] : []
  return arr.find((c: string) => c.includes('better-auth.session_token'))
}

describe('Epic 4: Notifications & Alerts', () => {
  let sessionCookie: string
  let userId: string
  let orgId: string

  beforeAll(async () => {
    const email = `${TEST_PREFIX}@test.com`
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'TestPass1!', name: 'Notif Tester' })
    expect(signUpRes.status).toBe(200)
    sessionCookie = extractSessionCookie(signUpRes)!

    const userRow = await prisma.user.findFirst({ where: { email } })
    userId = userRow!.id

    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Cookie', sessionCookie)
      .send({ organizationName: `${TEST_PREFIX} Org`, firstName: 'Notif', lastName: 'Test' })
    expect(orgRes.status).toBe(201)
    orgId = orgRes.body.id

    await request(app)
      .post('/api/auth/organization/set-active')
      .set('Cookie', sessionCookie)
      .send({ organizationId: orgId })
  })

  afterAll(async () => {
    try {
      await prisma.notificationPreference.deleteMany({ where: { userId } })
      await prisma.notification.deleteMany({ where: { organizationId: orgId } })
      await prisma.task.deleteMany({ where: { organizationId: orgId } })
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
    await prisma.notificationPreference.deleteMany({ where: { userId } })
    await prisma.notification.deleteMany({ where: { organizationId: orgId } })
  })

  // ─── Story 4.1: Notification Infrastructure ───

  describe('Story 4.1 — Notification Infrastructure', () => {
    it('should create a notification record (AC-2)', async () => {
      const notif = await createNotification(
        orgId, userId, 'TASK_ASSIGNED',
        'Tâche assignée', 'Nettoyage — Villa Test le 01/05/2026',
        { taskId: 'test-123' }, '/tasks',
      )
      expect(notif.id).toBeTruthy()
      expect(notif.type).toBe('TASK_ASSIGNED')
      expect(notif.title).toBe('Tâche assignée')
      expect(notif.readAt).toBeNull()
    })

    it('should have all event types in trigger config (AC-6)', () => {
      expect(NOTIFICATION_TRIGGERS.TASK_ASSIGNED).toBeTruthy()
      expect(NOTIFICATION_TRIGGERS.INCIDENT_REPORTED).toBeTruthy()
      expect(NOTIFICATION_TRIGGERS.RESERVATION_CREATED).toBeTruthy()
      expect(NOTIFICATION_TRIGGERS.TASK_OVERDUE).toBeTruthy()
      expect(NOTIFICATION_TRIGGERS.TASK_COMPLETED).toBeTruthy()
      expect(NOTIFICATION_TRIGGERS.STOCK_ALERT).toBeTruthy()
      expect(NOTIFICATION_TRIGGERS.ICAL_SYNC_FAILURE).toBeTruthy()
    })

    it('should resolve templates with variables', () => {
      const result = resolveTemplate('Hello {name}, your task {task} is ready', {
        name: 'Fatima',
        task: 'Nettoyage',
      })
      expect(result).toBe('Hello Fatima, your task Nettoyage is ready')
    })
  })

  // ─── Story 4.2: In-App Notification Feed ───

  describe('Story 4.2 — In-App Notification Feed', () => {
    it('should list notifications with cursor pagination (AC-1, AC-5)', async () => {
      for (let i = 0; i < 5; i++) {
        await createNotification(orgId, userId, 'TASK_ASSIGNED', `Notif ${i}`, `Body ${i}`)
      }

      const res = await request(app)
        .get('/api/v1/notifications?limit=3')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.notifications).toHaveLength(3)
      expect(res.body.hasMore).toBe(true)
      expect(res.body.nextCursor).toBeTruthy()

      const res2 = await request(app)
        .get(`/api/v1/notifications?limit=3&cursor=${encodeURIComponent(res.body.nextCursor)}`)
        .set('Cookie', sessionCookie)
      expect(res2.status).toBe(200)
      expect(res2.body.notifications).toHaveLength(2)
      expect(res2.body.hasMore).toBe(false)
    })

    it('should return unread count (AC-2)', async () => {
      await createNotification(orgId, userId, 'TASK_ASSIGNED', 'Unread 1', 'Body')
      await createNotification(orgId, userId, 'TASK_ASSIGNED', 'Unread 2', 'Body')

      const res = await request(app)
        .get('/api/v1/notifications/unread-count')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.count).toBe(2)
    })

    it('should mark single notification as read (AC-3)', async () => {
      const notif = await createNotification(orgId, userId, 'TASK_ASSIGNED', 'Read me', 'Body')

      const res = await request(app)
        .patch(`/api/v1/notifications/${notif.id}/read`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)

      const count = await request(app)
        .get('/api/v1/notifications/unread-count')
        .set('Cookie', sessionCookie)
      expect(count.body.count).toBe(0)
    })

    it('should mark all as read (AC-4)', async () => {
      await createNotification(orgId, userId, 'TASK_ASSIGNED', 'All 1', 'Body')
      await createNotification(orgId, userId, 'TASK_ASSIGNED', 'All 2', 'Body')

      const res = await request(app)
        .patch('/api/v1/notifications/read-all')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.updated).toBe(2)

      const count = await request(app)
        .get('/api/v1/notifications/unread-count')
        .set('Cookie', sessionCookie)
      expect(count.body.count).toBe(0)
    })
  })

  // ─── Story 4.3: Email Notification Engine ───

  describe('Story 4.3 — Email Template Engine', () => {
    it('should render email with branded template (AC-1)', () => {
      const email = renderEmail('Incident signalé', 'Fatima a signalé un problème sur Villa Mer')
      expect(email.subject).toBe('Incident signalé')
      expect(email.html).toContain('Hoxtup')
      expect(email.html).toContain('#264653')
      expect(email.html).toContain('Incident signalé')
      expect(email.html).toContain('Fatima a signalé un problème sur Villa Mer')
    })

    it('should include action button and unsubscribe link (AC-2)', () => {
      const email = renderEmail('Test', 'Body', {
        actionUrl: 'https://app.hoxtup.com/tasks',
        actionLabel: 'Voir la tâche',
      })
      expect(email.html).toContain('https://app.hoxtup.com/tasks')
      expect(email.html).toContain('Voir la tâche')
      expect(email.html).toContain('Se désabonner')
    })

    it('should have incident trigger as critical priority (AC-1)', () => {
      expect(NOTIFICATION_TRIGGERS.INCIDENT_REPORTED.priority).toBe('critical')
      expect(NOTIFICATION_TRIGGERS.INCIDENT_REPORTED.channels).toContain('EMAIL')
    })
  })

  // ─── Story 4.4: Notification Triggers ───

  describe('Story 4.4 — Notification Triggers', () => {
    it('should have correct recipients for each event type (AC-1 to AC-7)', () => {
      expect(NOTIFICATION_TRIGGERS.RESERVATION_CREATED.recipients).toContain('org_owners')
      expect(NOTIFICATION_TRIGGERS.TASK_ASSIGNED.recipients).toBe('assigned_staff')
      expect(NOTIFICATION_TRIGGERS.TASK_OVERDUE.recipients).toContain('assigned_staff')
      expect(NOTIFICATION_TRIGGERS.TASK_COMPLETED.recipients).toContain('property_managers')
      expect(NOTIFICATION_TRIGGERS.INCIDENT_REPORTED.recipients).toContain('all_owners')
      expect(NOTIFICATION_TRIGGERS.INCIDENT_REPORTED.recipients).toContain('all_admins')
      expect(NOTIFICATION_TRIGGERS.STOCK_ALERT.recipients).toContain('org_owners')
      expect(NOTIFICATION_TRIGGERS.ICAL_SYNC_FAILURE.recipients).toContain('org_owners')
    })

    it('should have email channel for critical types', () => {
      expect(NOTIFICATION_TRIGGERS.INCIDENT_REPORTED.channels).toContain('EMAIL')
      expect(NOTIFICATION_TRIGGERS.ICAL_SYNC_FAILURE.channels).toContain('EMAIL')
      expect(NOTIFICATION_TRIGGERS.STOCK_ALERT.channels).toContain('EMAIL')
    })

    it('should have deep link templates for all types', () => {
      for (const [, config] of Object.entries(NOTIFICATION_TRIGGERS)) {
        expect(config.deepLinkTemplate).toBeTruthy()
      }
    })
  })

  // ─── Story 4.5: Notification Preferences ───

  describe('Story 4.5 — Notification Preferences', () => {
    it('should seed default preferences for owner (AC-2, AC-7)', async () => {
      await seedDefaultPreferences(orgId, userId, 'owner')

      const prefs = await prisma.notificationPreference.findMany({ where: { userId, organizationId: orgId } })
      expect(prefs.length).toBeGreaterThanOrEqual(14) // 7 types × 2 channels

      const emailIncident = prefs.find((p) => p.notificationType === 'INCIDENT_REPORTED' && p.channel === 'EMAIL')
      expect(emailIncident?.enabled).toBe(true)

      const emailTaskAssigned = prefs.find((p) => p.notificationType === 'TASK_ASSIGNED' && p.channel === 'EMAIL')
      expect(emailTaskAssigned?.enabled).toBe(false)
    })

    it('should seed fewer types for staff (AC-5)', async () => {
      await seedDefaultPreferences(orgId, userId, 'staff_autonomous')

      const prefs = await prisma.notificationPreference.findMany({ where: { userId, organizationId: orgId } })
      expect(prefs.length).toBe(8) // 4 staff types × 2 channels

      const hasReservation = prefs.some((p) => p.notificationType === 'RESERVATION_CREATED')
      expect(hasReservation).toBe(false)
    })

    it('should not allow disabling critical in-app (AC-4)', async () => {
      await seedDefaultPreferences(orgId, userId, 'owner')

      await updatePreferences(userId, orgId, [
        { notificationType: 'INCIDENT_REPORTED', channel: 'IN_APP', enabled: false },
      ])

      const pref = await prisma.notificationPreference.findUnique({
        where: { organizationId_userId_notificationType_channel: { organizationId: orgId, userId, notificationType: 'INCIDENT_REPORTED', channel: 'IN_APP' } },
      })
      expect(pref?.enabled).toBe(true) // should remain enabled
    })

    it('should allow disabling non-critical email (AC-3)', async () => {
      await seedDefaultPreferences(orgId, userId, 'owner')

      await updatePreferences(userId, orgId, [
        { notificationType: 'TASK_ASSIGNED', channel: 'EMAIL', enabled: false },
      ])

      const pref = await prisma.notificationPreference.findUnique({
        where: { organizationId_userId_notificationType_channel: { organizationId: orgId, userId, notificationType: 'TASK_ASSIGNED', channel: 'EMAIL' } },
      })
      expect(pref?.enabled).toBe(false)
    })

    it('should get preferences via API (AC-1)', async () => {
      await seedDefaultPreferences(orgId, userId, 'owner')

      const res = await request(app)
        .get('/api/v1/notifications/preferences')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.preferences.length).toBeGreaterThanOrEqual(14)

      const critical = res.body.preferences.find(
        (p: { notificationType: string; channel: string; isCritical: boolean }) =>
          p.notificationType === 'INCIDENT_REPORTED' && p.channel === 'IN_APP',
      )
      expect(critical.isCritical).toBe(true)
    })

    it('should update preferences via API', async () => {
      await seedDefaultPreferences(orgId, userId, 'owner')

      const res = await request(app)
        .patch('/api/v1/notifications/preferences')
        .set('Cookie', sessionCookie)
        .send({
          updates: [
            { notificationType: 'STOCK_ALERT', channel: 'EMAIL', enabled: false },
          ],
        })
      expect(res.status).toBe(200)
      expect(res.body.updated).toBe(1)
    })
  })
})
