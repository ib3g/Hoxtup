'use client'

import { useTranslation } from 'react-i18next'

export default function ReservationsPage() {
  const { t } = useTranslation('reservations')

  return (
    <div className="space-y-6">
      <h2 className="text-heading">{t('title', 'Réservations')}</h2>
    </div>
  )
}
