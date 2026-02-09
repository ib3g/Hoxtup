'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { authClient } from '@/lib/auth-client'

type RegisterFormData = {
  firstName: string
  lastName: string
  email: string
  password: string
  organizationName: string
}

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useTranslation()

  const registerSchema = z.object({
    firstName: z.string().min(1, t('auth:register.error.firstNameRequired')).max(50),
    lastName: z.string().min(1, t('auth:register.error.lastNameRequired')).max(50),
    email: z.email(t('auth:register.error.emailInvalid')),
    password: z
      .string()
      .min(8, t('auth:register.error.passwordMin'))
      .regex(/[A-Z]/, t('auth:register.error.passwordUppercase'))
      .regex(/[a-z]/, t('auth:register.error.passwordLowercase'))
      .regex(/[0-9]/, t('auth:register.error.passwordDigit')),
    organizationName: z.string().min(2, t('auth:register.error.orgNameRequired')).max(100),
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      organizationName: '',
    },
  })

  useEffect(() => {
    setFocus('firstName')
  }, [setFocus])

  async function onSubmit(data: RegisterFormData) {
    setIsSubmitting(true)
    setServerError(null)

    try {
      const { error } = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
      })

      if (error) {
        setServerError(error.message ?? t('auth:register.error.generic'))
        setIsSubmitting(false)
        return
      }

      // Using Fetch API but with proper environment check and error handling
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (!apiUrl) {
        throw new Error('API URL is not configured')
      }

      const orgRes = await fetch(`${apiUrl}/organizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          organizationName: data.organizationName,
          firstName: data.firstName,
          lastName: data.lastName,
        }),
      })

      if (!orgRes.ok) {
        const err = await orgRes.json().catch(() => null)
        setServerError(err?.detail ?? t('auth:register.error.orgCreation'))
        setIsSubmitting(false)
        return
      }

      const org = await orgRes.json()
      await authClient.organization.setActive({ organizationId: org.id })

      router.push('/dashboard')
    } catch (e) {
      setServerError(e instanceof Error ? e.message : t('auth:register.error.generic'))
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {t('auth:register.title')}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {t('auth:register.subtitle')}
        </p>
      </div>

      <form
        ref={formRef}
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
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            {t('auth:register.firstName')}
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            {...register('firstName')}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            {t('auth:register.lastName')}
          </label>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            {...register('lastName')}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {t('auth:register.email')}
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
            {t('auth:register.password')}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            {...register('password')}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {t('auth:register.passwordHint')}
          </p>
        </div>

        <div>
          <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
            {t('auth:register.organizationName')}
          </label>
          <input
            id="organizationName"
            type="text"
            autoComplete="organization"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            {...register('organizationName')}
          />
          {errors.organizationName && (
            <p className="mt-1 text-sm text-red-600">{errors.organizationName.message}</p>
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
            t('auth:register.submit')
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        {t('auth:register.hasAccount')}{' '}
        <a href="/login" className="font-medium text-teal-700 hover:text-teal-600">
          {t('auth:register.login')}
        </a>
      </p>
    </>
  )
}
