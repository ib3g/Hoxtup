/**
 * Seed script for Hoxtup dev database.
 *
 * Creates users via Better Auth sign-up API so that password hashing
 * and Account entries are handled correctly. Falls back to direct
 * Prisma inserts for the staff-managed user (no account).
 *
 * Prerequisites: the API server must NOT be running (we only need the DB).
 * Run with: pnpm prisma db seed
 */
import 'dotenv/config'
import { PrismaClient, Role } from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { randomUUID } from 'node:crypto'
import { hashPassword } from 'better-auth/crypto'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const DEMO_PASSWORD = 'Demo1234!'

interface SeedUser {
  email: string
  name: string
  firstName: string
  lastName: string
  role: Role
  hasAccount: boolean
}

const SEED_USERS: SeedUser[] = [
  {
    email: 'barry@hoxtup.com',
    name: 'Barry Owner',
    firstName: 'Barry',
    lastName: 'Owner',
    role: Role.OWNER,
    hasAccount: true,
  },
  {
    email: 'admin@hoxtup.com',
    name: 'Alice Admin',
    firstName: 'Alice',
    lastName: 'Admin',
    role: Role.ADMIN,
    hasAccount: true,
  },
  {
    email: 'manager@hoxtup.com',
    name: 'Marc Manager',
    firstName: 'Marc',
    lastName: 'Manager',
    role: Role.MANAGER,
    hasAccount: true,
  },
  {
    email: 'staff.auto@hoxtup.com',
    name: 'Sophie Autonomous',
    firstName: 'Sophie',
    lastName: 'Autonomous',
    role: Role.STAFF_AUTONOMOUS,
    hasAccount: true,
  },
  {
    email: 'staff.managed@hoxtup.com',
    name: 'Paul Managed',
    firstName: 'Paul',
    lastName: 'Managed',
    role: Role.STAFF_MANAGED,
    hasAccount: false,
  },
]

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: 'hoxtup-demo' },
    update: {},
    create: {
      name: 'Hoxtup Demo',
      slug: 'hoxtup-demo',
      currencyCode: 'EUR',
      timezone: 'Europe/Paris',
    },
  })

  for (const seedUser of SEED_USERS) {
    const existing = await prisma.user.findUnique({
      where: {
        organizationId_email: {
          organizationId: org.id,
          email: seedUser.email,
        },
      },
    })

    if (existing) {
      console.log(`  [skip] ${seedUser.email} already exists`)
      continue
    }

    const userId = randomUUID()
    const now = new Date()

    await prisma.user.create({
      data: {
        id: userId,
        organizationId: org.id,
        name: seedUser.name,
        email: seedUser.email,
        emailVerified: true,
        firstName: seedUser.firstName,
        lastName: seedUser.lastName,
        role: seedUser.role,
        hasAccount: seedUser.hasAccount,
        createdAt: now,
        updatedAt: now,
      },
    })

    if (seedUser.hasAccount) {
      const hashedPassword = await hashPassword(DEMO_PASSWORD)

      await prisma.account.create({
        data: {
          id: randomUUID(),
          accountId: userId,
          providerId: 'credential',
          userId: userId,
          password: hashedPassword,
          createdAt: now,
          updatedAt: now,
        },
      })
    }

    // Create Member entry for Better Auth organization plugin
    await prisma.member.create({
      data: {
        id: randomUUID(),
        organizationId: org.id,
        userId: userId,
        role: seedUser.role === Role.OWNER ? 'owner' : 'member',
        createdAt: now,
      },
    })

    console.log(`  [created] ${seedUser.email} (${seedUser.role})`)
  }

  // Create default subscription (FREE plan, trialing)
  await prisma.subscription.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      planTier: 'FREE',
      status: 'TRIALING',
      trialEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  console.log(`\nSeeded org "${org.name}" (${org.id}) with ${SEED_USERS.length} users`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
