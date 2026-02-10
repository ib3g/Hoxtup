'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { CreditCard, Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
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
  planTier: string
  status: string
  propertyCount: number
  maxProperties: number
  renewalDate: string | null
  cancelledAt: string | null
}

export default function BillingPage() {
  const { t } = useTranslation('billing')
  const searchParams = useSearchParams()
  const [plans, setPlans] = useState<Plan[]>([])
  const [billing, setBilling] = useState<BillingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchBilling = useCallback(() => {
    return Promise.all([
      fetch(`${API_URL}/billing/plans`, { credentials: 'include' }).then((r) => r.ok ? r.json() : []),
      fetch(`${API_URL}/billing`, { credentials: 'include' }).then((r) => r.ok ? r.json() : null),
    ])
      .then(([plansData, billingData]: [Plan[], BillingInfo | null]) => {
        setPlans(plansData)
        setBilling(billingData)
        return billingData
      })
      .catch(() => { setPlans([]); setBilling(null); return null })
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchBilling().finally(() => setLoading(false))
  }, [fetchBilling])

  // Poll after checkout redirect
  useEffect(() => {
    if (searchParams.get('checkout') !== 'success') return

    let attempts = 0
    const initialPlan = billing?.currentPlan

    pollRef.current = setInterval(async () => {
      attempts++
      const data = await fetchBilling()
      if (data && data.currentPlan !== initialPlan) {
        toast.success(t('planUpdated'))
        if (pollRef.current) clearInterval(pollRef.current)
      }
      if (attempts >= 10 && pollRef.current) {
        clearInterval(pollRef.current)
      }
    }, 3000)

    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  async function handleUpgrade(planId: string) {
    const tier = planId.toUpperCase()
    setUpgrading(planId)
    try {
      const res = await fetch(`${API_URL}/billing/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ planTier: tier }),
      })
      if (res.ok) {
        const { checkoutUrl } = await res.json()
        window.location.href = checkoutUrl
      } else if (res.status === 503) {
        toast.error(t('notConfigured'))
      } else {
        toast.error(t('checkoutError'))
      }
    } catch {
      toast.error(t('checkoutError'))
    } finally {
      setUpgrading(null)
    }
  }

  async function handleCancel() {
    setCancelling(true)
    try {
      const res = await fetch(`${API_URL}/billing/cancel`, {
        method: 'POST',
        credentials: 'include',
      })
      if (res.ok) {
        toast.success(t('cancelSuccess'))
        setCancelOpen(false)
        fetchBilling()
      }
    } catch {
      toast.error(t('cancelError'))
    } finally {
      setCancelling(false)
    }
  }

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
  const isPaid = currentPlanId !== 'free'
  const isCancelled = !!billing?.cancelledAt

  return (
    <div className="space-y-6">
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
            {isPaid && !isCancelled && (
              <div className="mt-3 pt-3 border-t flex justify-end">
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setCancelOpen(true)}>
                  {t('cancel')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {searchParams.get('checkout') === 'success' && (
        <Card className="border-success">
          <CardContent className="p-4 text-center text-success text-caption">
            {t('checkoutProcessing')}
          </CardContent>
        </Card>
      )}

      <h3 className="text-label">{t('availablePlans')}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId
          const isRecommended = plan.id === 'starter'
          const isAgency = plan.id === 'agency'
          const isFree = plan.id === 'free'
          const isUpgrading = upgrading === plan.id

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
                ) : isFree ? (
                  <Button variant="secondary" className="w-full" disabled>
                    {plan.name}
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => handleUpgrade(plan.id)} disabled={isUpgrading}>
                    {isUpgrading ? t('redirecting') : t('upgrade')}
                    {!isUpgrading && <ArrowRight className="size-4 ml-1" />}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cancel')}</DialogTitle>
            <DialogDescription>{t('cancelConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>
              {t('cancelKeep')}
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
              {t('cancelButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
