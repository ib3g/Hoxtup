'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

export default function RegisterPage() {
  const { t } = useTranslation('auth')
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const schema = z
    .object({
      firstName: z.string().min(1, t('register.error.firstNameRequired')),
      lastName: z.string().min(1, t('register.error.lastNameRequired')),
      email: z.email(t('register.error.emailInvalid')),
      password: z
        .string()
        .min(8, t('register.error.passwordMin'))
        .regex(/[A-Z]/, t('register.error.passwordUppercase'))
        .regex(/[a-z]/, t('register.error.passwordLowercase'))
        .regex(/\d/, t('register.error.passwordDigit')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('register.error.passwordMismatch'),
      path: ['confirmPassword'],
    })

  type RegisterForm = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: RegisterForm) {
    setServerError(null)
    const result = await authClient.signUp.email({
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      password: data.password,
    })

    if (result.error) {
      if (result.error.message?.includes('already')) {
        setServerError(t('register.error.emailTaken'))
      } else {
        setServerError(t('register.error.generic'))
      }
      return
    }

    const orgResult = await authClient.organization.create({
      name: 'default',
      slug: `org-${crypto.randomUUID().slice(0, 8)}`,
      metadata: { currencyCode: 'MAD' },
    })

    if (orgResult.data) {
      await authClient.organization.setActive({ organizationId: orgResult.data.id })
    }

    router.push('/dashboard')
  }

  return (
    <Card>
      <CardHeader className="text-center space-y-1">
        <h1 className="text-heading">{t('register.title')}</h1>
        <p className="text-caption text-muted-foreground">{t('register.subtitle')}</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="firstName">{t('register.firstName')}</Label>
              <Input
                id="firstName"
                autoComplete="given-name"
                {...register('firstName')}
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && (
                <p className="text-caption text-danger">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="lastName">{t('register.lastName')}</Label>
              <Input
                id="lastName"
                autoComplete="family-name"
                {...register('lastName')}
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && (
                <p className="text-caption text-danger">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">{t('register.email')}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-caption text-danger">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">{t('register.password')}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              aria-invalid={!!errors.password}
            />
            <p className="text-micro text-muted-foreground">{t('register.passwordHint')}</p>
            {errors.password && (
              <p className="text-caption text-danger">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirmPassword">{t('register.confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="text-caption text-danger">{errors.confirmPassword.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-caption text-danger text-center" role="alert">
              {serverError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('register.submit') + '...' : t('register.submit')}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-caption text-muted-foreground">
          {t('register.hasAccount')}{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            {t('register.login')}
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
