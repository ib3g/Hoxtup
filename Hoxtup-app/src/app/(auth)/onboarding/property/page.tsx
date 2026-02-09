'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OnboardingStepper } from '@/components/onboarding-stepper'
import { cn } from '@/lib/utils'

const PROPERTY_COLORS = [
  { index: 0, color: 'var(--color-prop-1)' },
  { index: 1, color: 'var(--color-prop-2)' },
  { index: 2, color: 'var(--color-prop-3)' },
  { index: 3, color: 'var(--color-prop-4)' },
  { index: 4, color: 'var(--color-prop-5)' },
]

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export default function OnboardingPropertyPage() {
  const { t } = useTranslation('properties')
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState(0)

  const schema = z.object({
    name: z.string().min(1, t('onboarding.createProperty.error.nameRequired')),
    address: z.string().min(1, t('onboarding.createProperty.error.addressRequired')),
    type: z.string(),
  })

  type PropertyForm = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PropertyForm>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'APARTMENT' },
  })

  async function onSubmit(data: PropertyForm) {
    setServerError(null)

    try {
      const res = await fetch(`${API_URL}/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: data.name,
          address: data.address,
          type: data.type,
          colorIndex: selectedColor,
        }),
      })

      if (!res.ok) {
        setServerError(t('onboarding.createProperty.error.generic'))
        return
      }

      const property = await res.json()
      router.push(`/onboarding/ical?propertyId=${property.id}&propertyName=${encodeURIComponent(property.name)}`)
    } catch {
      setServerError(t('onboarding.createProperty.error.generic'))
    }
  }

  return (
    <>
      <OnboardingStepper currentStep={1} />
      <Card>
        <CardHeader className="text-center space-y-1">
          <h1 className="text-heading">{t('onboarding.createProperty.title')}</h1>
          <p className="text-caption text-muted-foreground">{t('onboarding.createProperty.subtitle')}</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1">
              <Label htmlFor="name">{t('onboarding.createProperty.name')}</Label>
              <Input
                id="name"
                placeholder={t('onboarding.createProperty.namePlaceholder')}
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-caption text-danger">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="address">{t('onboarding.createProperty.address')}</Label>
              <Input
                id="address"
                placeholder={t('onboarding.createProperty.addressPlaceholder')}
                {...register('address')}
                aria-invalid={!!errors.address}
              />
              {errors.address && (
                <p className="text-caption text-danger">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="type">{t('onboarding.createProperty.type')}</Label>
              <Select
                defaultValue="APARTMENT"
                onValueChange={(value) => setValue('type', value)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APARTMENT">{t('type.apartment')}</SelectItem>
                  <SelectItem value="HOUSE">{t('type.house')}</SelectItem>
                  <SelectItem value="VILLA">{t('type.villa')}</SelectItem>
                  <SelectItem value="STUDIO">{t('type.studio')}</SelectItem>
                  <SelectItem value="ROOM">{t('type.room')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>{t('onboarding.createProperty.color')}</Label>
              <div className="flex gap-3">
                {PROPERTY_COLORS.map((c) => (
                  <button
                    key={c.index}
                    type="button"
                    onClick={() => setSelectedColor(c.index)}
                    className={cn(
                      'h-8 w-8 rounded-full transition-all cursor-pointer',
                      selectedColor === c.index
                        ? 'ring-2 ring-ring ring-offset-2 scale-110'
                        : 'opacity-60 hover:opacity-100',
                    )}
                    style={{ backgroundColor: c.color }}
                    aria-label={`Color ${c.index + 1}`}
                  />
                ))}
              </div>
            </div>

            {serverError && (
              <p className="text-caption text-danger text-center" role="alert">
                {serverError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('onboarding.createProperty.submit') + '...' : t('onboarding.createProperty.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
