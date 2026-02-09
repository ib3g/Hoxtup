import type { PlanTier } from '../generated/prisma/client.js'

export interface PlanConfig {
  tier: PlanTier
  price: number | null
  maxProperties: number
  polarProductId: string | null
  features: string[]
}

export const PLANS: Record<PlanTier, PlanConfig> = {
  FREE: {
    tier: 'FREE',
    price: 0,
    maxProperties: 1,
    polarProductId: null,
    features: ['1 propriété', 'Tâches de base', 'Calendrier'],
  },
  STARTER: {
    tier: 'STARTER',
    price: 6900,
    maxProperties: 7,
    polarProductId: process.env.POLAR_PRODUCT_STARTER ?? 'polar_prod_starter',
    features: ['2-7 propriétés', 'Équipe illimitée', 'Notifications', 'iCal sync'],
  },
  PRO: {
    tier: 'PRO',
    price: 19900,
    maxProperties: 15,
    polarProductId: process.env.POLAR_PRODUCT_PRO ?? 'polar_prod_pro',
    features: ['15 propriétés', 'Inventaire', 'Rapports financiers', 'Dashboard avancé'],
  },
  SCALE: {
    tier: 'SCALE',
    price: 39900,
    maxProperties: 25,
    polarProductId: process.env.POLAR_PRODUCT_SCALE ?? 'polar_prod_scale',
    features: ['16-25 propriétés', 'API accès', 'Support prioritaire'],
  },
  AGENCY: {
    tier: 'AGENCY',
    price: null,
    maxProperties: Infinity,
    polarProductId: process.env.POLAR_PRODUCT_AGENCY ?? 'polar_prod_agency',
    features: ['Propriétés illimitées', 'Account manager', 'SLA garanti'],
  },
}

export function getPlanByTier(tier: PlanTier): PlanConfig {
  return PLANS[tier]
}

export function getPlanByProductId(productId: string): PlanConfig | undefined {
  return Object.values(PLANS).find((p) => p.polarProductId === productId)
}

export const TRIAL_DURATION_DAYS = 30
export const DEFAULT_TRIAL_PLAN: PlanTier = 'PRO'
export const GRACE_PERIOD_DAYS = 15
export const ARCHIVE_RETENTION_MONTHS = 6
