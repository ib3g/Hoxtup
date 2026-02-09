'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { authClient } from '@/lib/auth-client'

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" /></div>}>
      <InviteContent />
    </Suspense>
  )
}

function InviteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const invitationId = searchParams.get('id')

  const { t } = useTranslation()
  const hasId = !!invitationId
  const [status, setStatus] = useState<'loading' | 'accepting' | 'success' | 'expired' | 'error'>(
    hasId ? 'loading' : 'error',
  )
  const [error, setError] = useState(hasId ? '' : t('auth:invite.noId'))

  useEffect(() => {
    if (!invitationId) return

    const acceptInvitation = async () => {
      try {
        setStatus('accepting')
        await authClient.organization.acceptInvitation({
          invitationId,
        })
        setStatus('success')
        setTimeout(() => router.push('/'), 2000)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to accept invitation'
        if (message.toLowerCase().includes('expired')) {
          setStatus('expired')
        } else {
          setStatus('error')
          setError(message)
        }
      }
    }

    acceptInvitation()
  }, [invitationId, router])

  return (
    <div className="text-center">
      <h1 className="mb-4 text-2xl font-bold text-foreground">{t('auth:invite.title')}</h1>

      {status === 'loading' && (
        <p className="text-muted-foreground">{t('auth:invite.loading')}</p>
      )}

      {status === 'accepting' && (
        <div className="space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-muted-foreground">{t('auth:invite.accepting')}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="rounded-lg bg-green-50 p-6">
          <p className="text-lg font-semibold text-green-800">{t('auth:invite.success')}</p>
          <p className="mt-2 text-sm text-green-600">{t('auth:invite.redirecting')}</p>
        </div>
      )}

      {status === 'expired' && (
        <div className="rounded-lg bg-yellow-50 p-6">
          <p className="text-lg font-semibold text-yellow-800">{t('auth:invite.expired')}</p>
          <p className="mt-2 text-sm text-yellow-600">
            {t('auth:invite.expiredMessage')}
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-lg bg-red-50 p-6">
          <p className="text-lg font-semibold text-red-800">{t('auth:invite.error')}</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}
