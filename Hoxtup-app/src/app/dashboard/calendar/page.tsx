'use client'

import { useTranslation } from 'react-i18next'

export default function CalendarPage() {
  const { t } = useTranslation('calendar')

  return (
    <div className="space-y-6">
      <h2 className="text-heading">{t('title', 'Calendrier')}</h2>
    </div>
  )
}
