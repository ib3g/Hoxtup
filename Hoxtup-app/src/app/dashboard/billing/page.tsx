'use client'

import { useTranslation } from 'react-i18next'

export default function BillingPage() {
  const { t } = useTranslation('billing')

  return (
    <div className="space-y-6">
      <h2 className="text-heading">{t('title', 'Facturation')}</h2>
    </div>
  )
}
