'use client'

import { useTranslation } from 'react-i18next'

export default function TeamPage() {
  const { t } = useTranslation('common')

  return (
    <div className="space-y-6">
      <h2 className="text-heading">{t('nav.team')}</h2>
    </div>
  )
}
