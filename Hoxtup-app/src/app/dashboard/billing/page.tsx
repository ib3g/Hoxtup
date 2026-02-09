'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CreditCard, Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface Plan {
  id: string
  name: string
  price: number
  currency: string
  interval: string
  maxProperties: number
  features: string[]
}

interface BillingInfo {
  currentPlan: string
  propertyCount: number
  renewalDate: string | null
}

export default function BillingPage() {
  const { t } = useTranslation('billing')
  const [plans, setPlans] = useState<Plan[]>([])
  const [billing, setBilling] = useState<BillingInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`${API_URL}/billing/plans`, { credentials: 'include' }).then((r) => r.ok ? r.json() : []),
      fetch(`${API_URL}/billing`, { credentials: 'include' }).then((r) => r.ok ? r.json() : null),
    ])
      .then(([plansData, billingData]: [Plan[], BillingInfo | null]) => {
        setPlans(plansData)
        setBilling(billingData)
      })
      .catch(() => { setPlans([]); setBilling(null) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
        </div>
      </div>
    )
  }

  const currentPlanId = billing?.currentPlan ?? 'free'

  return (
    <div className="space-y-6">
      <h2 className="text-heading">{t('title')}</h2>

      {billing && (
        <Card className="border-brand-primary">
          <CardContent className="p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <CreditCard className="size-5 text-brand-primary" />
                <div>
                  <p className="text-label">{t('currentPlan')}</p>
                  <p className="text-heading">{t(`plan.${currentPlanId}`)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-caption text-muted-foreground">
                  {t('properties', { count: billing.propertyCount })}
                </p>
                {billing.renewalDate && (
                  <p className="text-micro text-muted-foreground">
                    {t('renewalDate', { date: new Date(billing.renewalDate).toLocaleDateString('fr-FR') })}
                  </p>
                )}
              </div>
            </div>
            {currentPlanId === 'free' && (
              <div className="mt-3 p-3 bg-warning/10 rounded-md text-caption text-warning">
                {t('freeBanner')}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <h3 className="text-label">{t('availablePlans')}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId
          const isRecommended = plan.id === 'starter'
          const isAgency = plan.id === 'agency'

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative',
                isCurrent && 'border-brand-primary',
                isRecommended && !isCurrent && 'border-cta',
              )}
            >
              <CardContent className="p-5 space-y-4">
                {isCurrent && (
                  <Badge className="absolute top-3 right-3 bg-brand-primary text-white">
                    {t('currentBadge')}
                  </Badge>
                )}
                {isRecommended && !isCurrent && (
                  <Badge className="absolute top-3 right-3 bg-cta text-white">
                    {t('recommended')}
                  </Badge>
                )}

                <div>
                  <h4 className="text-label">{plan.name}</h4>
                  {isAgency ? (
                    <p className="text-heading mt-1">{t('custom')}</p>
                  ) : (
                    <p className="text-heading mt-1">
                      {plan.price}€<span className="text-caption text-muted-foreground">{t('perMonth')}</span>
                    </p>
                  )}
                  {plan.maxProperties > 0 && (
                    <p className="text-micro text-muted-foreground">
                      {t('propertiesMax', { max: plan.maxProperties })}
                    </p>
                  )}
                </div>

                <ul className="space-y-1.5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-caption">
                      <Check className="size-3.5 text-success shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button variant="secondary" className="w-full" disabled>
                    {t('currentBadge')}
                  </Button>
                ) : isAgency ? (
                  <Button variant="secondary" className="w-full" disabled>
                    {t('contactUs')}
                  </Button>
                ) : (
                  <Button className="w-full">
                    {t('upgrade')}
                    <ArrowRight className="size-4 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
