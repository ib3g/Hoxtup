'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Users, Settings, Building2, CheckSquare, Package, BarChart3, CreditCard } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface NavItem {
  icon: React.ElementType
  labelKey: string
  path: string
}

const NAV_ITEMS: NavItem[] = [
  { icon: Home, labelKey: 'dashboard:title', path: '/' },
  { icon: Building2, labelKey: 'properties:title', path: '/properties' },
  { icon: Calendar, labelKey: 'calendar:title', path: '/calendar' },
  { icon: CheckSquare, labelKey: 'tasks:title', path: '/tasks' },
  { icon: Users, labelKey: 'settings:team.title', path: '/staff' },
  { icon: Package, labelKey: 'inventory:title', path: '/inventory' },
  { icon: BarChart3, labelKey: 'dashboard:kpi.revenue', path: '/analytics' },
  { icon: CreditCard, labelKey: 'billing:title', path: '/billing' },
  { icon: Settings, labelKey: 'settings:title', path: '/settings' },
]

interface SidebarProps {
  collapsed?: boolean
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const { t } = useTranslation()

  return (
    <aside
      className={`hidden h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex ${collapsed ? 'w-16' : 'w-60'}`}
      role="navigation"
      aria-label={t('common:nav.sidebar')}
    >
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <span className="text-lg font-bold tracking-tight text-sidebar-primary">
          {collapsed ? 'H' : 'Hoxtup'}
        </span>
        {!collapsed && <span className="text-brand-logo-dot">●</span>}
      </div>

      <nav className="flex-1 space-y-1 px-2 py-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path))
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} />
              {!collapsed && <span>{t(item.labelKey)}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
