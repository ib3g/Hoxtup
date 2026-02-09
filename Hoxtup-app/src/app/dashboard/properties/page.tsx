'use client'

import { useTranslation } from 'react-i18next'

export default function PropertiesPage() {
  const { t } = useTranslation('properties')

  return (
    <div className="space-y-6">
      <h2 className="text-heading">{t('title', 'Propriétés')}</h2>
    </div>
  )
}
