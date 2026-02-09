'use client'

import { useTranslation } from 'react-i18next'

export default function SettingsPage() {
  const { t } = useTranslation('settings')

  return (
    <div className="space-y-6">
      <h2 className="text-heading">{t('title', 'Paramètres')}</h2>
    </div>
  )
}
