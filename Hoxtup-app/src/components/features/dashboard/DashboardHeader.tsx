'use client'

import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'

export function DashboardHeader() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <header className="border-b border-border bg-card px-4 py-4 md:px-6 md:py-5">
      <h1 className="text-lg font-semibold text-foreground md:text-xl">
        {t('dashboard:greeting', { name: user?.name ?? '' })}
      </h1>
    </header>
  )
}
