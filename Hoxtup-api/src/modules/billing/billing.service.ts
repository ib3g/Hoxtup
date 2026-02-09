import { prisma } from '../../config/database.js'
import { PLANS, TRIAL_DURATION_DAYS, GRACE_PERIOD_DAYS, getPlanByTier, DEFAULT_TRIAL_PLAN } from '../../config/plans.js'
import type { PlanTier, SubscriptionStatus } from '../../generated/prisma/client.js'

export async function initTrialSubscription(organizationId: string): Promise<void> {
  const existing = await prisma.subscription.findUnique({ where: { organizationId } })
  if (existing) return

  const trialEnd = new Date()
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS)

  await prisma.subscription.create({
    data: {
      organizationId,
      planTier: DEFAULT_TRIAL_PLAN,
      status: 'TRIALING',
      trialEnd,
    },
  })
}

export async function getSubscription(organizationId: string) {
  const sub = await prisma.subscription.findUnique({ where: { organizationId } })
  if (!sub) return null

  const plan = getPlanByTier(sub.planTier)
  const propertyCount = await prisma.property.count({
    where: { organizationId, archivedAt: null },
  })

  return {
    ...sub,
    plan,
    usage: {
      properties: propertyCount,
      maxProperties: plan.maxProperties,
      percentage: plan.maxProperties === Infinity ? 0 : Math.round((propertyCount / plan.maxProperties) * 100),
    },
  }
}

export async function checkPropertyLimit(organizationId: string): Promise<{ allowed: boolean; message?: string; currentPlan?: PlanTier }> {
  const sub = await prisma.subscription.findUnique({ where: { organizationId } })
  const effectiveTier: PlanTier = sub?.planTier ?? 'FREE'
  const plan = getPlanByTier(effectiveTier)

  const propertyCount = await prisma.property.count({
    where: { organizationId, archivedAt: null },
  })

  if (propertyCount >= plan.maxProperties) {
    const nextPlan = getUpgradeSuggestion(effectiveTier)
    return {
      allowed: false,
      currentPlan: effectiveTier,
      message: nextPlan
        ? `Passez au plan ${nextPlan} pour ajouter plus de propriétés`
        : 'Limite de propriétés atteinte',
    }
  }

  return { allowed: true }
}

function getUpgradeSuggestion(currentTier: PlanTier): string | null {
  const order: PlanTier[] = ['FREE', 'STARTER', 'PRO', 'SCALE', 'AGENCY']
  const idx = order.indexOf(currentTier)
  return idx < order.length - 1 ? order[idx + 1] : null
}

export async function activateSubscription(
  organizationId: string,
  polarCustomerId: string,
  polarSubscriptionId: string,
  planTier: PlanTier,
  currentPeriodEnd: Date,
) {
  return prisma.subscription.upsert({
    where: { organizationId },
    update: {
      polarCustomerId,
      polarSubscriptionId,
      planTier,
      status: 'ACTIVE',
      currentPeriodEnd,
      cancelledAt: null,
      archivedAt: null,
    },
    create: {
      organizationId,
      polarCustomerId,
      polarSubscriptionId,
      planTier,
      status: 'ACTIVE',
      currentPeriodEnd,
    },
  })
}

export async function updateSubscriptionStatus(
  polarSubscriptionId: string,
  status: SubscriptionStatus,
  planTier?: PlanTier,
  currentPeriodEnd?: Date,
) {
  const sub = await prisma.subscription.findFirst({ where: { polarSubscriptionId } })
  if (!sub) return null

  const data: Record<string, unknown> = { status }
  if (planTier) data.planTier = planTier
  if (currentPeriodEnd) data.currentPeriodEnd = currentPeriodEnd
  if (status === 'CANCELLED') data.cancelledAt = new Date()
  if (status === 'ARCHIVED') data.archivedAt = new Date()

  return prisma.subscription.update({ where: { id: sub.id }, data })
}

export async function cancelSubscription(organizationId: string) {
  const sub = await prisma.subscription.findUnique({ where: { organizationId } })
  if (!sub || sub.status === 'CANCELLED') return null

  return prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
  })
}

export async function isSubscriptionActive(organizationId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({ where: { organizationId } })
  if (!sub) return false
  return ['TRIALING', 'ACTIVE'].includes(sub.status)
}

export async function isReadOnly(organizationId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({ where: { organizationId } })
  if (!sub) return false
  return ['PAST_DUE', 'ARCHIVED'].includes(sub.status)
}

export function getTrialDaysRemaining(trialEnd: Date | null): number {
  if (!trialEnd) return 0
  const diff = trialEnd.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function getAllPlans() {
  return Object.values(PLANS).map((p) => ({
    tier: p.tier,
    price: p.price,
    maxProperties: p.maxProperties === Infinity ? null : p.maxProperties,
    features: p.features,
  }))
}
