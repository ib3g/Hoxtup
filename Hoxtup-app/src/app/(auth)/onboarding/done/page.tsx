'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Calendar, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { OnboardingStepper } from '@/components/onboarding-stepper'

export default function OnboardingDonePage() {
  return (
    <Suspense>
      <OnboardingDoneContent />
    </Suspense>
  )
}

function OnboardingDoneContent() {
  const { t } = useTranslation('properties')
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyName = searchParams.get('propertyName') ?? ''
  const icalConnected = searchParams.get('ical') === 'true'

  return (
    <>
      <OnboardingStepper currentStep={3} />
      <Card>
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="size-8 text-success" />
            </div>
          </div>
          <h1 className="text-heading">{t('onboarding.confirmation.title')}</h1>
          <p className="text-caption text-muted-foreground">
            {t('onboarding.confirmation.subtitle')}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Home className="size-5 text-brand-primary" />
              <div>
                <p className="text-micro text-muted-foreground">
                  {t('onboarding.confirmation.propertyName')}
                </p>
                <p className="text-label">{propertyName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="size-5 text-brand-primary" />
              <p className="text-label">
                {icalConnected
                  ? t('onboarding.confirmation.icalConnected')
                  : t('onboarding.confirmation.icalSkipped')}
              </p>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => router.push('/dashboard')}
          >
            {t('onboarding.confirmation.goToDashboard')}
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
