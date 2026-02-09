'use client'

import { useTranslation } from 'react-i18next'

export default function TasksPage() {
  const { t } = useTranslation('tasks')

  return (
    <div className="space-y-6">
      <h2 className="text-heading">{t('title', 'Tâches')}</h2>
    </div>
  )
}
