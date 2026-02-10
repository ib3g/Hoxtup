'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import DevQuickLogin from './DevQuickLogin'

function LoginContent() {
  const { t } = useTranslation('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')
  const [serverError, setServerError] = useState<string | null>(null)

  const schema = z.object({
    email: z.email(t('register.error.emailInvalid')),
    password: z.string().min(1, t('register.error.passwordMin')),
  })

  type LoginForm = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: LoginForm) {
    setServerError(null)
    const result = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    })

    if (result.error) {
      if (result.error.status === 429) {
        setServerError(t('login.error.rateLimited'))
      } else {
        setServerError(t('login.error.invalid'))
      }
      return
    }

    router.push(redirectTo || '/dashboard')
  }

  return (
    <>
    <Card>
      <CardHeader className="text-center space-y-1">
        <h1 className="text-heading">{t('login.title')}</h1>
        <p className="text-caption text-muted-foreground">{t('login.subtitle')}</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1">
            <Label htmlFor="email">{t('login.email')}</Label>
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
            <Label htmlFor="password">{t('login.password')}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-caption text-danger">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-caption text-danger text-center" role="alert">
              {serverError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('login.submit') + '...' : t('login.submit')}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-caption text-muted-foreground">
          {t('login.noAccount')}{' '}
          <Link href="/register" className="text-primary font-medium hover:underline">
            {t('login.register')}
          </Link>
        </p>
      </CardFooter>
    </Card>

    <DevQuickLogin />
  </>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
