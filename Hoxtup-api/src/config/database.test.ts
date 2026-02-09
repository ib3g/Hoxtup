import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

const OWNER_URL = process.env.DATABASE_URL ?? 'postgresql://hoxtup:hoxtup_dev@localhost:5433/hoxtup_dev'
const APP_URL = 'postgresql://app_user:app_user_dev@localhost:5433/hoxtup_dev'

function createOwnerClient() {
  const adapter = new PrismaPg({ connectionString: OWNER_URL })
  return new PrismaClient({ adapter })
}

function createAppClient() {
  const adapter = new PrismaPg({ connectionString: APP_URL })
  return new PrismaClient({ adapter })
}

describe('Database & RLS', () => {
  let ownerPrisma: PrismaClient
  let appPrisma: PrismaClient
  let orgAId: string
  let orgBId: string

  beforeAll(async () => {
    ownerPrisma = createOwnerClient()
    appPrisma = createAppClient()

    const orgA = await ownerPrisma.organization.create({
      data: { name: 'Test Org A', slug: `test-org-a-${Date.now()}`, currencyCode: 'EUR', timezone: 'Europe/Paris' },
    })
    orgAId = orgA.id

    const orgB = await ownerPrisma.organization.create({
      data: { name: 'Test Org B', slug: `test-org-b-${Date.now()}`, currencyCode: 'USD', timezone: 'America/New_York' },
    })
    orgBId = orgB.id

    await ownerPrisma.user.create({
      data: {
        organizationId: orgAId,
        name: 'User A',
        email: 'user-a@test.com',
        firstName: 'User',
        lastName: 'A',
        role: 'OWNER',
        hasAccount: true,
      },
    })

    await ownerPrisma.user.create({
      data: {
        organizationId: orgBId,
        name: 'User B',
        email: 'user-b@test.com',
        firstName: 'User',
        lastName: 'B',
        role: 'OWNER',
        hasAccount: true,
      },
    })
  })

  afterAll(async () => {
    await ownerPrisma.user.deleteMany({
      where: { organizationId: { in: [orgAId, orgBId] } },
    })
    await ownerPrisma.organization.deleteMany({
      where: { id: { in: [orgAId, orgBId] } },
    })
    await ownerPrisma.$disconnect()
    await appPrisma.$disconnect()
  })

  it('should filter users by tenant when RLS context is set', async () => {
    const users = await appPrisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${orgAId}, TRUE)`
      return tx.user.findMany()
    })

    expect(users.length).toBeGreaterThanOrEqual(1)
    for (const user of users) {
      expect(user.organizationId).toBe(orgAId)
    }
  })

  it('should return empty when querying with wrong tenant context', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000'
    const users = await appPrisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${fakeId}, TRUE)`
      return tx.user.findMany()
    })

    expect(users).toHaveLength(0)
  })

  it('should isolate Org B users from Org A tenant context', async () => {
    const users = await appPrisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${orgAId}, TRUE)`
      return tx.user.findMany()
    })

    const orgBUsers = users.filter((u) => u.organizationId === orgBId)
    expect(orgBUsers).toHaveLength(0)
  })
})

describe('Seed idempotency', () => {
  it('should not duplicate data when seed runs twice', async () => {
    const prisma = createOwnerClient()

    const usersBefore = await prisma.user.findMany({
      where: { organization: { slug: 'hoxtup-demo' } },
    })

    const { execSync } = await import('node:child_process')
    execSync('npx prisma db seed', {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: OWNER_URL },
      stdio: 'pipe',
    })

    const usersAfter = await prisma.user.findMany({
      where: { organization: { slug: 'hoxtup-demo' } },
    })

    expect(usersAfter.length).toBe(usersBefore.length)
    await prisma.$disconnect()
  })
})
