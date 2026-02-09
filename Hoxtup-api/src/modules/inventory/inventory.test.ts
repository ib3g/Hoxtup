import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../app.js'
import { prisma } from '../../config/database.js'

const TEST_PREFIX = `inv-${Date.now()}`

function extractSessionCookie(res: request.Response): string | undefined {
  const cookies = res.headers['set-cookie']
  const arr = Array.isArray(cookies) ? cookies : cookies ? [cookies] : []
  return arr.find((c: string) => c.includes('better-auth.session_token'))
}

describe('Epic 6: Inventory & Cost Management', () => {
  let sessionCookie: string
  let userId: string
  let orgId: string
  let propertyId: string

  beforeAll(async () => {
    const email = `${TEST_PREFIX}@test.com`
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'TestPass1!', name: 'Inv Tester' })
    expect(signUpRes.status).toBe(200)
    sessionCookie = extractSessionCookie(signUpRes)!

    const userRow = await prisma.user.findFirst({ where: { email } })
    userId = userRow!.id

    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Cookie', sessionCookie)
      .send({ organizationName: `${TEST_PREFIX} Org`, firstName: 'Inv', lastName: 'Test' })
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
        name: 'Villa Inventaire',
        address: '1 Rue Stock',
        capacity: 4,
        type: 'VILLA',
      })
    expect(propRes.status).toBe(201)
    propertyId = propRes.body.id
  })

  afterAll(async () => {
    try {
      await prisma.stockMovement.deleteMany({ where: { item: { organizationId: orgId } } })
      await prisma.consumableItem.deleteMany({ where: { organizationId: orgId } })
      await prisma.asset.deleteMany({ where: { organizationId: orgId } })
      await prisma.revenue.deleteMany({ where: { organizationId: orgId } })
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
    await prisma.stockMovement.deleteMany({ where: { item: { organizationId: orgId } } })
    await prisma.consumableItem.deleteMany({ where: { organizationId: orgId } })
    await prisma.asset.deleteMany({ where: { organizationId: orgId } })
    await prisma.revenue.deleteMany({ where: { organizationId: orgId } })
  })

  // ─── Story 6.1: Consumable Stock Tracking ───

  describe('Story 6.1 — Consumable Stock Tracking', () => {
    it('should create a consumable item (AC-2)', async () => {
      const res = await request(app)
        .post('/api/v1/inventory/items')
        .set('Cookie', sessionCookie)
        .send({ propertyId, name: 'Savon', category: 'GUEST_KIT', unit: 'pièce', currentQuantity: 20, threshold: 5 })
      expect(res.status).toBe(201)
      expect(res.body.name).toBe('Savon')
      expect(res.body.currentQuantity).toBe(20)
    })

    it('should list items per property (AC-1)', async () => {
      await prisma.consumableItem.create({
        data: { organizationId: orgId, propertyId, name: 'Serviettes', category: 'GUEST_KIT', currentQuantity: 10 },
      })
      const res = await request(app)
        .get(`/api/v1/properties/${propertyId}/inventory`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.items).toHaveLength(1)
      expect(res.body.items[0].name).toBe('Serviettes')
    })

    it('should increase stock on ENTRY movement (AC-3)', async () => {
      const item = await prisma.consumableItem.create({
        data: { organizationId: orgId, propertyId, name: 'Gel douche', currentQuantity: 10, threshold: 5 },
      })
      const res = await request(app)
        .post(`/api/v1/inventory/items/${item.id}/movements`)
        .set('Cookie', sessionCookie)
        .send({ type: 'ENTRY', quantity: 15, costCentimes: 750, note: 'Restock' })
      expect(res.status).toBe(201)
      expect(res.body.updatedItem.currentQuantity).toBe(25)
    })

    it('should decrease stock on EXIT movement (AC-4)', async () => {
      const item = await prisma.consumableItem.create({
        data: { organizationId: orgId, propertyId, name: 'Shampoing', currentQuantity: 20, threshold: 5 },
      })
      const res = await request(app)
        .post(`/api/v1/inventory/items/${item.id}/movements`)
        .set('Cookie', sessionCookie)
        .send({ type: 'EXIT', quantity: 8, reason: 'consumption' })
      expect(res.status).toBe(201)
      expect(res.body.updatedItem.currentQuantity).toBe(12)
    })

    it('should reject EXIT when insufficient stock', async () => {
      const item = await prisma.consumableItem.create({
        data: { organizationId: orgId, propertyId, name: 'Rare', currentQuantity: 2, threshold: 5 },
      })
      const res = await request(app)
        .post(`/api/v1/inventory/items/${item.id}/movements`)
        .set('Cookie', sessionCookie)
        .send({ type: 'EXIT', quantity: 10 })
      expect(res.status).toBe(422)
    })
  })

  // ─── Story 6.2: Stock Alerts & Thresholds ───

  describe('Story 6.2 — Stock Alerts & Thresholds', () => {
    it('should detect threshold breach on EXIT (AC-1)', async () => {
      const item = await prisma.consumableItem.create({
        data: { organizationId: orgId, propertyId, name: 'Alert Item', currentQuantity: 6, threshold: 5 },
      })
      const res = await request(app)
        .post(`/api/v1/inventory/items/${item.id}/movements`)
        .set('Cookie', sessionCookie)
        .send({ type: 'EXIT', quantity: 2 })
      expect(res.status).toBe(201)
      expect(res.body.updatedItem.currentQuantity).toBe(4)
      expect(res.body.updatedItem.currentQuantity).toBeLessThanOrEqual(res.body.updatedItem.threshold)
    })

    it('should allow updating threshold (AC-3)', async () => {
      const item = await prisma.consumableItem.create({
        data: { organizationId: orgId, propertyId, name: 'Threshold Test', currentQuantity: 10, threshold: 5 },
      })
      const res = await request(app)
        .patch(`/api/v1/inventory/items/${item.id}`)
        .set('Cookie', sessionCookie)
        .send({ threshold: 8 })
      expect(res.status).toBe(200)
      expect(res.body.threshold).toBe(8)
    })
  })

  // ─── Story 6.3: Mobile Consumption Feedback ───

  describe('Story 6.3 — Consumption Feedback', () => {
    it('should record consumption linked to a task (AC-3)', async () => {
      const item = await prisma.consumableItem.create({
        data: { organizationId: orgId, propertyId, name: 'Produit ménager', currentQuantity: 50, threshold: 10 },
      })
      const task = await prisma.task.create({
        data: { organizationId: orgId, propertyId, title: 'Nettoyage', status: 'IN_PROGRESS' },
      })

      const res = await request(app)
        .post(`/api/v1/inventory/items/${item.id}/movements`)
        .set('Cookie', sessionCookie)
        .send({ type: 'EXIT', quantity: 3, taskId: task.id, reason: 'consumption' })
      expect(res.status).toBe(201)
      expect(res.body.movement.taskId).toBe(task.id)
      expect(res.body.updatedItem.currentQuantity).toBe(47)

      await prisma.task.delete({ where: { id: task.id } })
    })

    it('should list movements for an item', async () => {
      const item = await prisma.consumableItem.create({
        data: { organizationId: orgId, propertyId, name: 'Tracked', currentQuantity: 100, threshold: 10 },
      })
      await prisma.stockMovement.create({
        data: { organizationId: orgId, itemId: item.id, type: 'ENTRY', quantity: 10, costCentimes: 500, recordedById: userId },
      })
      await prisma.stockMovement.create({
        data: { organizationId: orgId, itemId: item.id, type: 'EXIT', quantity: 10, recordedById: userId, reason: 'consumption' },
      })

      const res = await request(app)
        .get(`/api/v1/inventory/items/${item.id}/movements`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.movements).toHaveLength(2)
    })
  })

  // ─── Story 6.4: Asset & Purchase Log ───

  describe('Story 6.4 — Asset & Purchase Log', () => {
    it('should create an asset (AC-2)', async () => {
      const res = await request(app)
        .post('/api/v1/assets')
        .set('Cookie', sessionCookie)
        .send({ propertyId, name: 'Machine à laver', category: 'APPLIANCES', purchaseDate: '2026-01-15', costCentimes: 45000, supplier: 'Darty' })
      expect(res.status).toBe(201)
      expect(res.body.name).toBe('Machine à laver')
      expect(res.body.costCentimes).toBe(45000)
    })

    it('should list assets per property (AC-1)', async () => {
      await prisma.asset.create({
        data: { organizationId: orgId, propertyId, name: 'Lit king', category: 'FURNITURE', purchaseDate: new Date('2026-01-01'), costCentimes: 80000 },
      })
      const res = await request(app)
        .get(`/api/v1/properties/${propertyId}/assets`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.assets).toHaveLength(1)
    })

    it('should soft-delete an asset (AC-6)', async () => {
      const asset = await prisma.asset.create({
        data: { organizationId: orgId, propertyId, name: 'Old TV', category: 'ELECTRONICS', purchaseDate: new Date('2025-01-01'), costCentimes: 20000 },
      })
      const res = await request(app)
        .delete(`/api/v1/assets/${asset.id}`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.deleted).toBe(true)

      const deleted = await prisma.asset.findUnique({ where: { id: asset.id } })
      expect(deleted?.deletedAt).not.toBeNull()
    })

    it('should include soft-deleted when requested', async () => {
      await prisma.asset.create({
        data: { organizationId: orgId, propertyId, name: 'Active', category: 'OTHER', purchaseDate: new Date(), costCentimes: 1000 },
      })
      await prisma.asset.create({
        data: { organizationId: orgId, propertyId, name: 'Deleted', category: 'OTHER', purchaseDate: new Date(), costCentimes: 2000, deletedAt: new Date() },
      })

      const res = await request(app)
        .get(`/api/v1/properties/${propertyId}/assets?includeDeleted=true`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.assets).toHaveLength(2)

      const res2 = await request(app)
        .get(`/api/v1/properties/${propertyId}/assets`)
        .set('Cookie', sessionCookie)
      expect(res2.body.assets).toHaveLength(1)
    })
  })

  // ─── Story 6.5: Asset/Consumable Distinction ───

  describe('Story 6.5 — Inventory Summary', () => {
    it('should return combined summary stats (AC-4)', async () => {
      await prisma.consumableItem.createMany({
        data: [
          { organizationId: orgId, propertyId, name: 'A', currentQuantity: 10, threshold: 5 },
          { organizationId: orgId, propertyId, name: 'B', currentQuantity: 3, threshold: 5 },
          { organizationId: orgId, propertyId, name: 'C', currentQuantity: 0, threshold: 5 },
        ],
      })
      await prisma.asset.createMany({
        data: [
          { organizationId: orgId, propertyId, name: 'X', category: 'FURNITURE', purchaseDate: new Date(), costCentimes: 10000 },
          { organizationId: orgId, propertyId, name: 'Y', category: 'ELECTRONICS', purchaseDate: new Date(), costCentimes: 25000 },
        ],
      })

      const res = await request(app)
        .get(`/api/v1/properties/${propertyId}/inventory/summary`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.consumables.totalItems).toBe(3)
      expect(res.body.consumables.belowThreshold).toBe(2)
      expect(res.body.consumables.zeroStock).toBe(1)
      expect(res.body.assets.totalAssets).toBe(2)
      expect(res.body.assets.totalInvestment).toBe(35000)
    })
  })

  // ─── Story 6.6: Financial Reporting ───

  describe('Story 6.6 — Financial Reporting', () => {
    it('should add revenue entry (AC-4)', async () => {
      const res = await request(app)
        .post(`/api/v1/properties/${propertyId}/revenue`)
        .set('Cookie', sessionCookie)
        .send({ amountCentimes: 150000, date: '2026-06-15', source: 'AIRBNB', notes: 'Juin 1ère quinzaine' })
      expect(res.status).toBe(201)
      expect(res.body.amountCentimes).toBe(150000)
      expect(res.body.source).toBe('AIRBNB')
    })

    it('should list revenue entries', async () => {
      await prisma.revenue.createMany({
        data: [
          { organizationId: orgId, propertyId, amountCentimes: 100000, date: new Date('2026-06-01'), source: 'AIRBNB' },
          { organizationId: orgId, propertyId, amountCentimes: 80000, date: new Date('2026-06-15'), source: 'BOOKING' },
        ],
      })
      const res = await request(app)
        .get(`/api/v1/properties/${propertyId}/revenue`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.revenues).toHaveLength(2)
    })

    it('should compute property financials (AC-1)', async () => {
      await prisma.revenue.create({
        data: { organizationId: orgId, propertyId, amountCentimes: 200000, date: new Date('2026-06-10'), source: 'AIRBNB' },
      })
      await prisma.asset.create({
        data: { organizationId: orgId, propertyId, name: 'Canapé', category: 'FURNITURE', purchaseDate: new Date('2026-06-05'), costCentimes: 50000 },
      })

      const res = await request(app)
        .get(`/api/v1/properties/${propertyId}/financials?start=2026-06-01&end=2026-06-30`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.revenue.total).toBe(200000)
      expect(res.body.expenses.assets.total).toBe(50000)
      expect(res.body.profitLoss).toBe(150000)
    })

    it('should compute org-wide summary (AC-5)', async () => {
      await prisma.revenue.create({
        data: { organizationId: orgId, propertyId, amountCentimes: 300000, date: new Date('2026-06-10') },
      })

      const res = await request(app)
        .get('/api/v1/financials/summary?start=2026-06-01&end=2026-06-30')
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(200)
      expect(res.body.properties.length).toBeGreaterThanOrEqual(1)
      expect(res.body.totals.revenue).toBe(300000)
    })

    it('should return 400 for invalid date range', async () => {
      const res = await request(app)
        .get(`/api/v1/properties/${propertyId}/financials?start=bad&end=bad`)
        .set('Cookie', sessionCookie)
      expect(res.status).toBe(400)
    })
  })
})
