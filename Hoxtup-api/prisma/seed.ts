import 'dotenv/config'
import { PrismaClient, Role } from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { randomBytes, scryptSync } from 'node:crypto'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

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

  const users = [
    {
      email: 'barry@hoxtup.com',
      name: 'Barry Owner',
      firstName: 'Barry',
      lastName: 'Owner',
      role: Role.OWNER,
      hasAccount: true,
      password: 'Demo1234!',
    },
    {
      email: 'admin@hoxtup.com',
      name: 'Alice Admin',
      firstName: 'Alice',
      lastName: 'Admin',
      role: Role.ADMIN,
      hasAccount: true,
      password: 'Demo1234!',
    },
    {
      email: 'manager@hoxtup.com',
      name: 'Marc Manager',
      firstName: 'Marc',
      lastName: 'Manager',
      role: Role.MANAGER,
      hasAccount: true,
      password: 'Demo1234!',
    },
    {
      email: 'staff.auto@hoxtup.com',
      name: 'Sophie Autonomous',
      firstName: 'Sophie',
      lastName: 'Autonomous',
      role: Role.STAFF_AUTONOMOUS,
      hasAccount: true,
      password: 'Demo1234!',
    },
    {
      email: 'staff.managed@hoxtup.com',
      name: 'Paul Managed',
      firstName: 'Paul',
      lastName: 'Managed',
      role: Role.STAFF_MANAGED,
      hasAccount: false,
      password: null,
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: {
        organizationId_email: {
          organizationId: org.id,
          email: user.email,
        },
      },
      update: {},
      create: {
        organizationId: org.id,
        name: user.name,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        hasAccount: user.hasAccount,
        passwordHash: user.password ? hashPassword(user.password) : null,
      },
    })
  }

  console.log(`Seeded org "${org.name}" (${org.id}) with ${users.length} users`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
