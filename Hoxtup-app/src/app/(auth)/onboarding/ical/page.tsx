'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { OnboardingStepper } from '@/components/onboarding-stepper'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export default function OnboardingIcalPage() {
  return (
    <Suspense>
      <OnboardingIcalContent />
    </Suspense>
  )
}

function OnboardingIcalContent() {
  const { t } = useTranslation('properties')
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyId = searchParams.get('propertyId') ?? ''
  const propertyName = searchParams.get('propertyName') ?? ''
  const [serverError, setServerError] = useState<string | null>(null)

  const schema = z.object({
    name: z.string().min(1, t('onboarding.connectIcal.error.nameRequired')),
    url: z.url(t('onboarding.connectIcal.error.urlInvalid')),
  })

  type IcalForm = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IcalForm>({
    resolver: zodResolver(schema),
  })

  function handleSkip() {
    router.push(
      `/onboarding/done?propertyId=${propertyId}&propertyName=${encodeURIComponent(propertyName)}&ical=false`,
    )
  }

  async function onSubmit(data: IcalForm) {
    setServerError(null)

    try {
      const res = await fetch(
        `${API_URL}/properties/${propertyId}/ical-sources`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: data.name,
            url: data.url,
          }),
        },
      )

      if (!res.ok) {
        setServerError(t('onboarding.connectIcal.error.generic'))
        return
      }

      router.push(
        `/onboarding/done?propertyId=${propertyId}&propertyName=${encodeURIComponent(propertyName)}&ical=true`,
      )
    } catch {
      setServerError(t('onboarding.connectIcal.error.generic'))
    }
  }

  return (
    <>
      <OnboardingStepper currentStep={2} />
      <Card>
        <CardHeader className="text-center space-y-1">
          <h1 className="text-heading">{t('onboarding.connectIcal.title')}</h1>
          <p className="text-caption text-muted-foreground">
            {t('onboarding.connectIcal.subtitle')}
          </p>
        </CardHeader>

        <CardContent>
          <p className="text-body text-muted-foreground mb-4">
            {t('onboarding.connectIcal.explanation')}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1">
              <Label htmlFor="ical-name">{t('onboarding.connectIcal.name')}</Label>
              <Input
                id="ical-name"
                placeholder={t('onboarding.connectIcal.namePlaceholder')}
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-caption text-danger">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="ical-url">{t('onboarding.connectIcal.url')}</Label>
              <Input
                id="ical-url"
                type="url"
                placeholder={t('onboarding.connectIcal.urlPlaceholder')}
                {...register('url')}
                aria-invalid={!!errors.url}
              />
              {errors.url && (
                <p className="text-caption text-danger">{errors.url.message}</p>
              )}
            </div>

            {serverError && (
              <p className="text-caption text-danger text-center" role="alert">
                {serverError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? t('onboarding.connectIcal.syncing')
                : t('onboarding.connectIcal.submit')}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleSkip}
            >
              {t('onboarding.connectIcal.skip')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
