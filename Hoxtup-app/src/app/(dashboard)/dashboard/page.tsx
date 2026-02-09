'use client'

import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Building2, CheckSquare, Users, Calendar } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    )
  }

  return (
    <div>
      <DashboardHeader />

      <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          icon={Building2}
          title={t('properties:title')}
          value="0"
          href="/properties"
        />
        <DashboardCard
          icon={CheckSquare}
          title={t('tasks:title')}
          value="0"
          href="/tasks"
        />
        <DashboardCard
          icon={Users}
          title={t('settings:team.title')}
          value="1"
          href="/staff"
        />
        <DashboardCard
          icon={Calendar}
          title={t('calendar:title')}
          value="—"
          href="/calendar"
        />
      </div>

      <div className="px-4">
        <EmptyState
          icon={Building2}
          title={t('dashboard:empty.title')}
          description={t('dashboard:empty.description')}
        />
      </div>
    </div>
  )
}

function DashboardCard({
  icon: Icon,
  title,
  value,
  href,
}: {
  icon: React.ElementType
  title: string
  value: string
  href: string
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon size={20} className="text-primary" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </a>
  )
}
