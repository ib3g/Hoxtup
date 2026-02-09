'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { authClient } from '@/lib/auth-client'

type LoginFormData = {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const { t } = useTranslation()

  const loginSchema = z.object({
    email: z.email(t('auth:register.error.emailInvalid')),
    password: z.string().min(1, t('auth:login.password')),
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    setFocus('email')
  }, [setFocus])

  async function onSubmit(data: LoginFormData) {
    setIsSubmitting(true)
    setServerError(null)

    try {
      const { error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      })

      if (error) {
        setServerError(t('auth:login.error.invalid'))
        setIsSubmitting(false)
        return
      }

      const orgs = await authClient.organization.list()
      if (orgs.data && orgs.data.length > 0) {
        await authClient.organization.setActive({ organizationId: orgs.data[0].id })
      }

      router.push('/dashboard')
    } catch {
      setServerError(t('auth:login.error.generic'))
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {t('auth:login.title')}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {t('auth:login.subtitle')}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        {serverError && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
            {serverError}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {t('auth:login.email')}
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            {t('auth:login.password')}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            {...register('password')}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="sticky bottom-4 mt-6 w-full rounded-md bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-20 animate-pulse rounded bg-teal-400" />
            </span>
          ) : (
            t('auth:login.submit')
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        {t('auth:login.noAccount')}{' '}
        <a href="/register" className="font-medium text-teal-700 hover:text-teal-600">
          {t('auth:login.register')}
        </a>
      </p>
    </>
  )
}
