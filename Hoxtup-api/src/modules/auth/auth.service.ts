import { prisma } from '../../config/database.js'
import { BadRequestError } from '../../common/errors/bad-request.error.js'
import { auth } from './auth.config.js'
import { Role } from '../../generated/prisma/client.js'
import { seedDefaultPreferences } from '../notifications/preferences.service.js'
import { initTrialSubscription } from '../billing/billing.service.js'

interface CreateOrganizationInput {
  name: string
  userId: string
  userEmail: string
  firstName: string
  lastName: string
}

export async function createOrganizationForUser(input: CreateOrganizationInput) {
  // Use Better Auth's native organization plugin to create the organization
  // and manage membership/roles properly.
  const org = await auth.api.createOrganization({
    body: {
      name: input.name,
      slug: input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      userId: input.userId,
    },
  })

  if (!org) {
    throw new BadRequestError('Failed to create organization')
  }

  // Still update our User model with the organizationId for RLS
  // and update profile fields.
  await prisma.user.update({
    where: { id: input.userId },
    data: {
      organizationId: org.id,
      firstName: input.firstName,
      lastName: input.lastName,
      role: Role.OWNER,
      hasAccount: true,
    },
  })

  // Seed default notification preferences for the owner
  await seedDefaultPreferences(org.id, input.userId, 'owner')

  // Initialize a 30-day Pro trial (AC-1)
  await initTrialSubscription(org.id)

  return org
}
