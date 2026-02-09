'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Settings, User, Building2, Globe, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { SkeletonCard } from '@/components/common/Skeleton'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export default function SettingsPage() {
  const { isAuthenticated, isLoading: authLoading, user, signOut } = useAuth()
  const router = useRouter()
  const { t, i18n } = useTranslation(['settings', 'common'])

  const [orgName, setOrgName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.replace('/login'); return }
  }, [isAuthenticated, authLoading, router])

  const handleSignOut = async () => {
    await signOut()
    router.replace('/login')
  }

  if (authLoading) return <div className="p-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-xl font-semibold text-foreground">{t('settings:title')}</h1>

      {/* Profile */}
      <section className="mb-6 rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <User size={18} className="text-muted-foreground" />
          <h2 className="font-medium text-foreground">{t('settings:profile.title')}</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">{t('settings:profile.email')}</label>
            <p className="text-sm font-medium text-foreground">{user?.email ?? '—'}</p>
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">{t('settings:profile.firstName')}</label>
            <p className="text-sm font-medium text-foreground">{user?.name ?? '—'}</p>
          </div>
        </div>
      </section>

      {/* Language */}
      <section className="mb-6 rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Globe size={18} className="text-muted-foreground" />
          <h2 className="font-medium text-foreground">{t('settings:language.title')}</h2>
        </div>
        <select
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="fr">{t('settings:language.fr')}</option>
          <option value="en">{t('settings:language.en')}</option>
        </select>
      </section>

      {/* Sign out */}
      <section className="rounded-lg border bg-card p-4">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          <LogOut size={16} />
          {t('common:signOut', { defaultValue: 'Se déconnecter' })}
        </button>
      </section>
    </div>
  )
}
