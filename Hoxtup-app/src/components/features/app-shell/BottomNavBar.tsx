'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Users, MoreHorizontal, CheckSquare, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface NavTab {
  icon: React.ElementType
  labelKey: string
  path: string
}

const MANAGER_TABS: NavTab[] = [
  { icon: Home, labelKey: 'dashboard.title', path: '/' },
  { icon: Calendar, labelKey: 'calendar.title', path: '/calendar' },
  { icon: Users, labelKey: 'settings.team.title', path: '/staff' },
  { icon: MoreHorizontal, labelKey: 'settings.title', path: '/settings' },
]

const STAFF_TABS: NavTab[] = [
  { icon: CheckSquare, labelKey: 'tasks.title', path: '/tasks' },
  { icon: Calendar, labelKey: 'calendar.title', path: '/calendar' },
  { icon: AlertTriangle, labelKey: 'tasks.type.incident', path: '/incidents' },
]

interface BottomNavBarProps {
  role?: string
}

export function BottomNavBar({ role = 'owner' }: BottomNavBarProps) {
  const pathname = usePathname()
  const { t } = useTranslation()

  const isStaff = role === 'staff_autonomous' || role === 'staff_managed'
  const tabs = isStaff ? STAFF_TABS : MANAGER_TABS

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card md:hidden"
      style={{ height: 56 }}
      role="navigation"
      aria-label={t('common:nav.main')}
    >
      <div className="mx-auto flex h-full max-w-lg items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path || (tab.path !== '/' && pathname.startsWith(tab.path))
          const Icon = tab.icon
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className="flex min-w-[48px] flex-col items-center justify-center gap-0.5 px-2 py-1"
              style={{ minHeight: 48 }}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={22}
                className={isActive ? 'text-brand-cta' : 'text-muted-foreground'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-medium ${isActive ? 'text-brand-cta' : 'text-muted-foreground'}`}
              >
                {t(tab.labelKey)}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
