'use client'

import { useTranslation } from 'react-i18next'

export default function IncidentsPage() {
  const { t } = useTranslation('common')

  return (
    <div className="space-y-6">
      <h2 className="text-heading">{t('nav.incident')}</h2>
    </div>
  )
}
