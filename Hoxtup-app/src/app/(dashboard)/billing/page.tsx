'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { CreditCard, Check, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { SkeletonCard } from '@/components/common/Skeleton'

interface Plan {
  tier: string
  price: number | null
  maxProperties: number | null
  features: string[]
}

interface Subscription {
  planTier: string
  status: string
  currentPeriodEnd?: string
  trialEnd?: string
  plan: Plan
  usage: { properties: number; maxProperties: number; percentage: number }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

function formatPrice(centimes: number | null): string {
  if (centimes === null) return 'Sur devis'
  if (centimes === 0) return 'Gratuit'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(centimes / 100) + '/mois'
}

function statusLabel(status: string): { text: string; color: string } {
  switch (status) {
    case 'ACTIVE': return { text: 'Actif', color: 'text-[#2D8A6E] bg-green-50' }
    case 'TRIALING': return { text: 'Essai gratuit', color: 'text-blue-700 bg-blue-50' }
    case 'PAST_DUE': return { text: 'Paiement en retard', color: 'text-amber-700 bg-amber-50' }
    case 'CANCELLED': return { text: 'Annulé', color: 'text-red-700 bg-red-50' }
    default: return { text: status, color: 'text-foreground bg-muted' }
  }
}

export default function BillingPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { t } = useTranslation(['billing', 'common'])

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [subRes, plansRes] = await Promise.all([
        fetch(`${API_URL}/billing`, { credentials: 'include' }),
        fetch(`${API_URL}/billing/plans`, { credentials: 'include' }),
      ])
      if (subRes.ok) setSubscription(await subRes.json())
      if (plansRes.ok) { const d = await plansRes.json(); setPlans(d.plans ?? []) }
    } catch { /* */ } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.replace('/login'); return }
    if (isAuthenticated) loadData()
  }, [isAuthenticated, authLoading, router, loadData])

  if (authLoading || loading) return <div className="p-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>

  const st = subscription ? statusLabel(subscription.status) : null

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-xl font-semibold text-foreground">{t('billing:title')}</h1>

      {/* Current subscription */}
      {subscription && (
        <div className="mb-6 rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-muted-foreground" />
                <h2 className="font-medium text-foreground">{t('billing:subscription')}</h2>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${st?.color}`}>{st?.text}</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-foreground">{subscription.plan.tier}</p>
              <p className="text-sm text-muted-foreground">{formatPrice(subscription.plan.price)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {subscription.usage.properties}/{subscription.usage.maxProperties ?? '∞'} {t('common:properties', { defaultValue: 'propriétés' })}
              </p>
              {/* Usage bar */}
              <div className="mt-1 h-2 w-32 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${subscription.usage.percentage >= 80 ? 'bg-amber-500' : 'bg-[#2D8A6E]'}`}
                  style={{ width: `${Math.min(subscription.usage.percentage, 100)}%` }}
                />
              </div>
              {subscription.usage.percentage >= 80 && (
                <p className="mt-1 flex items-center gap-1 text-[10px] text-amber-600">
                  <AlertTriangle size={10} />
                  {t('billing:upgrade')}
                </p>
              )}
            </div>
          </div>
          {subscription.currentPeriodEnd && (
            <p className="mt-2 text-xs text-muted-foreground">
              {t('common:nextBilling', { defaultValue: 'Prochain renouvellement' })}: {new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR')}
            </p>
          )}
          {subscription.trialEnd && subscription.status === 'TRIALING' && (
            <p className="mt-1 text-xs text-blue-600">
              {t('common:trialEnds', { defaultValue: 'Fin de l\'essai' })}: {new Date(subscription.trialEnd).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
      )}

      {/* Plans */}
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">{t('common:availablePlans', { defaultValue: 'Plans disponibles' })}</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = subscription?.planTier === plan.tier
          return (
            <div
              key={plan.tier}
              className={`rounded-lg border p-4 ${isCurrent ? 'border-accent ring-1 ring-accent' : 'bg-card'}`}
            >
              <h3 className="font-semibold text-foreground">{plan.tier}</h3>
              <p className="text-lg font-bold text-foreground">{formatPrice(plan.price)}</p>
              <p className="mb-3 text-xs text-muted-foreground">
                {plan.maxProperties ? `${plan.maxProperties} propriétés` : 'Illimité'}
              </p>
              <ul className="space-y-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Check size={12} className="mt-0.5 shrink-0 text-[#2D8A6E]" />
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent && (
                <p className="mt-3 text-center text-xs font-medium text-accent-foreground">
                  {t('common:currentPlan', { defaultValue: 'Plan actuel' })}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
