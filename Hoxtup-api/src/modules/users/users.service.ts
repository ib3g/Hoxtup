import { prisma } from '../../config/database.js'
import { auth } from '../auth/auth.config.js'
import { fromNodeHeaders } from 'better-auth/node'
import type { Request } from 'express'
import type { CreateStaffManagedInput, UpdateRoleInput } from './users.validation.js'
import { seedDefaultPreferences } from '../notifications/preferences.service.js'

export async function listTeamMembers(organizationId: string, scopePropertyIds: string[] | null) {
  const members = await prisma.member.findMany({
    where: { organizationId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          hasAccount: true,
          isActive: true,
          image: true,
        },
      },
    },
  })

  const flattened = members
    .filter((m) => m.user)
    .map((m) => ({
      id: m.id,
      userId: m.userId,
      organizationId: m.organizationId,
      role: m.role.toUpperCase(),
      createdAt: m.createdAt,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
      isActive: m.user.isActive,
      hasAccount: m.user.hasAccount,
    }))

  if (scopePropertyIds === null) {
    return flattened
  }

  const assignedUserIds = await prisma.propertyAssignment.findMany({
    where: { propertyId: { in: scopePropertyIds } },
    select: { userId: true },
  })
  const allowedIds = new Set(assignedUserIds.map((a) => a.userId))
  return flattened.filter((m) => allowedIds.has(m.userId))
}

export async function createStaffManaged(
  organizationId: string,
  input: CreateStaffManagedInput,
  actorId: string,
) {
  const email = `staff-managed-${Date.now()}@internal.hoxtup.local`

  const user = await prisma.user.create({
    data: {
      name: input.name,
      firstName: input.firstName,
      lastName: input.lastName,
      email,
      role: 'STAFF_MANAGED',
      hasAccount: false,
      isActive: true,
      organizationId,
    },
  })

  await prisma.member.create({
    data: {
      id: crypto.randomUUID(),
      organizationId,
      userId: user.id,
      role: 'staff_managed',
      createdAt: new Date(),
    },
  })

  // Seed default notification preferences for the new staff member
  await seedDefaultPreferences(organizationId, user.id, 'staff_managed')

  await logAudit(organizationId, actorId, user.id, 'STAFF_MANAGED_CREATED', `Created staff managed profile: ${input.name}`)

  return user
}

export async function updateMemberRole(
  memberId: string,
  organizationId: string,
  input: UpdateRoleInput,
  actorId: string,
  headers: Request['headers'],
) {
  const member = await prisma.member.findUnique({ where: { id: memberId } })
  if (!member || member.organizationId !== organizationId) return null

  const previousRole = member.role

  await auth.api.updateMemberRole({
    headers: fromNodeHeaders(headers),
    body: { memberId, role: input.role },
  })

  await logAudit(organizationId, actorId, member.userId, 'ROLE_CHANGED', `Role changed: ${previousRole} → ${input.role}`)

  return prisma.member.findUnique({
    where: { id: memberId },
    include: { user: { select: { id: true, name: true, email: true } } },
  })
}

export async function deactivateMember(memberId: string, organizationId: string, actorId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { user: true },
  })
  if (!member || member.organizationId !== organizationId) return null

  await prisma.user.update({
    where: { id: member.userId },
    data: { isActive: false },
  })

  await logAudit(organizationId, actorId, member.userId, 'MEMBER_DEACTIVATED', `Deactivated member: ${member.user.name}`)

  return { id: member.id, userId: member.userId, deactivated: true }
}

async function logAudit(organizationId: string, actorId: string, targetId: string | null, action: string, details: string) {
  await prisma.teamAuditLog.create({
    data: { organizationId, actorId, targetId, action, details },
  })
}
