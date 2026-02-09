'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import { authClient } from '@/lib/auth-client'
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

export default function OrganizationPage() {
  const { t } = useTranslation('auth')
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const schema = z.object({
    name: z.string().min(1, t('organization.error.nameRequired')),
    currency: z.string(),
  })

  type OrgForm = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrgForm>({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'EUR' },
  })

  async function onSubmit(data: OrgForm) {
    setServerError(null)

    const slug = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const result = await authClient.organization.create({
      name: data.name,
      slug,
      metadata: { currencyCode: data.currency },
    })

    if (result.error) {
      setServerError(t('organization.error.generic'))
      return
    }

    await authClient.organization.setActive({ organizationId: result.data.id })

    router.push('/onboarding/property')
  }

  return (
    <Card>
      <CardHeader className="text-center space-y-1">
        <h1 className="text-heading">{t('organization.title')}</h1>
        <p className="text-caption text-muted-foreground">{t('organization.subtitle')}</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1">
            <Label htmlFor="name">{t('organization.name')}</Label>
            <Input
              id="name"
              placeholder={t('organization.namePlaceholder')}
              autoComplete="organization"
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-caption text-danger">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="currency">{t('organization.currency')}</Label>
            <Select
              defaultValue="EUR"
              onValueChange={(value) => setValue('currency', value)}
            >
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="MAD">MAD (د.م.)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {serverError && (
            <p className="text-caption text-danger text-center" role="alert">
              {serverError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('organization.submit') + '...' : t('organization.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
