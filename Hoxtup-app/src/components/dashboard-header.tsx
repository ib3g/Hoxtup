'use client'

import { useTranslation } from 'react-i18next'

interface DashboardHeaderProps {
  userName: string
}

function getGreetingKey(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'greeting'
  if (hour < 18) return 'greetingAfternoon'
  return 'greetingEvening'
}

function formatDate(): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const { t } = useTranslation('dashboard')
  const greetingKey = getGreetingKey()
  const dateStr = formatDate()

  return (
    <header className="space-y-1 px-4 py-4 md:px-6 md:py-6">
      <h1 className="text-display text-foreground">
        {t(greetingKey, { name: userName })}
      </h1>
      <div className="flex items-center gap-2">
        <time className="text-caption text-muted-foreground capitalize" dateTime={new Date().toISOString().slice(0, 10)}>
          {dateStr}
        </time>
        <span className="text-caption text-muted-foreground">·</span>
        <p className="text-caption text-muted-foreground">
          {t('context.welcome')}
        </p>
      </div>
    </header>
  )
}
