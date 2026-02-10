'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import { authClient, useSession } from '@/lib/auth-client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2, AlertCircle } from 'lucide-react'

type PageStatus = 'loading' | 'accepting' | 'success' | 'error' | 'no-id' | 'needs-register' | 'needs-login'

function AcceptInviteContent() {
  const { t } = useTranslation('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const invitationId = searchParams.get('id')
  const invitedEmail = searchParams.get('email') ?? ''
  const session = useSession()

  const [status, setStatus] = useState<PageStatus>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const acceptedRef = useRef(false)

  const pendingRef = useRef(false)

  function doAccept() {
    if (!invitationId || acceptedRef.current || pendingRef.current) return
    pendingRef.current = true
    setStatus('accepting')
    authClient.organization.acceptInvitation({ invitationId })
      .then((res) => {
        pendingRef.current = false
        if (res.error) {
          setStatus('error')
          setErrorMessage(res.error.message ?? t('invite.error'))
        } else {
          acceptedRef.current = true
          setStatus('success')
          setTimeout(() => router.push('/dashboard'), 2000)
        }
      })
      .catch(() => {
        pendingRef.current = false
        setStatus('error')
        setErrorMessage(t('invite.error'))
      })
  }

  useEffect(() => {
    if (!invitationId) { setStatus('no-id'); return }
    if (session.isPending) return
    if (session.data) {
      doAccept()
    } else {
      setStatus('needs-register')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitationId, session.isPending, session.data])

  // --- Register form ---
  const registerSchema = z.object({
    firstName: z.string().min(1, t('register.error.firstNameRequired')),
    lastName: z.string().min(1, t('register.error.lastNameRequired')),
    password: z.string()
      .min(8, t('register.error.passwordMin'))
      .regex(/[A-Z]/, t('register.error.passwordUppercase'))
      .regex(/[a-z]/, t('register.error.passwordLowercase'))
      .regex(/\d/, t('register.error.passwordDigit')),
    confirmPassword: z.string(),
  }).refine((d) => d.password === d.confirmPassword, {
    message: t('register.error.passwordMismatch'),
    path: ['confirmPassword'],
  })
  type RegForm = z.infer<typeof registerSchema>
  const { register: regField, handleSubmit: handleRegSubmit, formState: { errors: regErrors, isSubmitting: regSubmitting } } = useForm<RegForm>({ resolver: zodResolver(registerSchema) })
  const [regError, setRegError] = useState<string | null>(null)

  async function onRegister(data: RegForm) {
    setRegError(null)
    const result = await authClient.signUp.email({
      name: `${data.firstName} ${data.lastName}`,
      email: invitedEmail,
      password: data.password,
    })
    if (result.error) {
      if (result.error.message?.includes('already')) {
        setRegError(t('register.error.emailTaken'))
        setShowLogin(true)
      } else {
        setRegError(t('register.error.generic'))
      }
      return
    }
    doAccept()
  }

  // --- Login form ---
  const loginSchema = z.object({ password: z.string().min(1, t('register.error.passwordMin')) })
  type LogForm = z.infer<typeof loginSchema>
  const { register: loginField, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors, isSubmitting: loginSubmitting } } = useForm<LogForm>({ resolver: zodResolver(loginSchema) })
  const [loginError, setLoginError] = useState<string | null>(null)

  async function onLogin(data: LogForm) {
    setLoginError(null)
    const result = await authClient.signIn.email({ email: invitedEmail, password: data.password })
    if (result.error) {
      setLoginError(t('login.error.invalid'))
      return
    }
    doAccept()
  }

  return (
    <Card>
      <CardHeader className="text-center space-y-1">
        <h1 className="text-heading">{t('invite.title')}</h1>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'loading' && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
        )}

        {status === 'accepting' && (
          <p className="text-caption text-muted-foreground text-center">{t('invite.accepting')}</p>
        )}

        {status === 'success' && (
          <div className="space-y-2 text-center">
            <CheckCircle2 className="size-10 text-green-600 mx-auto" />
            <p className="text-label">{t('invite.success')}</p>
            <p className="text-caption text-muted-foreground">{t('invite.redirecting')}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3 text-center">
            <AlertCircle className="size-10 text-destructive mx-auto" />
            <p className="text-caption text-destructive">{errorMessage || t('invite.error')}</p>
            <Button variant="ghost" onClick={() => router.push('/login')}>{t('login.submit')}</Button>
          </div>
        )}

        {status === 'no-id' && (
          <div className="space-y-3 text-center">
            <AlertCircle className="size-10 text-destructive mx-auto" />
            <p className="text-caption text-destructive">{t('invite.noId')}</p>
          </div>
        )}

        {status === 'needs-register' && !showLogin && (
          <div className="space-y-4">
            <p className="text-caption text-muted-foreground text-center">{t('invite.createAccount')}</p>

            <div className="space-y-1">
              <Label>{t('register.email')}</Label>
              <Input value={invitedEmail} disabled className="bg-muted" />
            </div>

            <form onSubmit={handleRegSubmit(onRegister)} className="space-y-3" noValidate>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="firstName">{t('register.firstName')}</Label>
                  <Input id="firstName" autoComplete="given-name" {...regField('firstName')} aria-invalid={!!regErrors.firstName} />
                  {regErrors.firstName && <p className="text-caption text-danger">{regErrors.firstName.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName">{t('register.lastName')}</Label>
                  <Input id="lastName" autoComplete="family-name" {...regField('lastName')} aria-invalid={!!regErrors.lastName} />
                  {regErrors.lastName && <p className="text-caption text-danger">{regErrors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">{t('register.password')}</Label>
                <Input id="password" type="password" autoComplete="new-password" {...regField('password')} aria-invalid={!!regErrors.password} />
                <p className="text-micro text-muted-foreground">{t('register.passwordHint')}</p>
                {regErrors.password && <p className="text-caption text-danger">{regErrors.password.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword">{t('register.confirmPassword')}</Label>
                <Input id="confirmPassword" type="password" autoComplete="new-password" {...regField('confirmPassword')} aria-invalid={!!regErrors.confirmPassword} />
                {regErrors.confirmPassword && <p className="text-caption text-danger">{regErrors.confirmPassword.message}</p>}
              </div>

              {regError && <p className="text-caption text-danger text-center">{regError}</p>}

              <Button type="submit" className="w-full" disabled={regSubmitting}>
                {regSubmitting ? t('register.submit') + '...' : t('invite.acceptAndCreate')}
              </Button>
            </form>

            <p className="text-caption text-muted-foreground text-center">
              {t('register.hasAccount')}{' '}
              <button type="button" onClick={() => setShowLogin(true)} className="text-primary font-medium hover:underline">{t('register.login')}</button>
            </p>
          </div>
        )}

        {status === 'needs-register' && showLogin && (
          <div className="space-y-4">
            <p className="text-caption text-muted-foreground text-center">{t('invite.loginToAccept')}</p>

            <div className="space-y-1">
              <Label>{t('login.email')}</Label>
              <Input value={invitedEmail} disabled className="bg-muted" />
            </div>

            <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-3" noValidate>
              <div className="space-y-1">
                <Label htmlFor="login-password">{t('login.password')}</Label>
                <Input id="login-password" type="password" autoComplete="current-password" {...loginField('password')} aria-invalid={!!loginErrors.password} />
                {loginErrors.password && <p className="text-caption text-danger">{loginErrors.password.message}</p>}
              </div>

              {loginError && <p className="text-caption text-danger text-center">{loginError}</p>}

              <Button type="submit" className="w-full" disabled={loginSubmitting}>
                {loginSubmitting ? t('login.submit') + '...' : t('invite.loginAndAccept')}
              </Button>
            </form>

            <p className="text-caption text-muted-foreground text-center">
              {t('login.noAccount')}{' '}
              <button type="button" onClick={() => setShowLogin(false)} className="text-primary font-medium hover:underline">{t('login.register')}</button>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" />}>
      <AcceptInviteContent />
    </Suspense>
  )
}
