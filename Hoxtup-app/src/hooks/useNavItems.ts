'use client'

import {
  LayoutDashboard,
  Calendar,
  Users,
  Menu,
  CheckSquare,
  AlertTriangle,
  Building2,
  CalendarDays,
  ClipboardList,
  Package,
  CreditCard,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export type UserRole = 'owner' | 'admin' | 'manager' | 'member' | 'staff_autonomous' | 'staff_managed'

export interface NavItem {
  key: string
  labelKey: string
  href: string
  icon: LucideIcon
  badge?: number
  disabled?: boolean
  v1Only?: boolean
}

const OWNER_BOTTOM_NAV: NavItem[] = [
  { key: 'home', labelKey: 'nav.home', href: '/dashboard', icon: LayoutDashboard },
  { key: 'calendar', labelKey: 'nav.calendar', href: '/dashboard/calendar', icon: Calendar },
  { key: 'team', labelKey: 'nav.team', href: '/dashboard/team', icon: Users },
  { key: 'more', labelKey: 'nav.more', href: '/dashboard/more', icon: Menu },
]

const STAFF_BOTTOM_NAV: NavItem[] = [
  { key: 'tasks', labelKey: 'nav.tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { key: 'planning', labelKey: 'nav.planning', href: '/dashboard/calendar', icon: Calendar },
  { key: 'incident', labelKey: 'nav.incident', href: '/dashboard/incidents', icon: AlertTriangle },
]

const STAFF_MANAGED_BOTTOM_NAV: NavItem[] = [
  { key: 'tasks', labelKey: 'nav.tasks', href: '/dashboard/tasks', icon: CheckSquare },
]

const SIDEBAR_ITEMS_FULL: NavItem[] = [
  { key: 'dashboard', labelKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'properties', labelKey: 'nav.properties', href: '/dashboard/properties', icon: Building2 },
  { key: 'reservations', labelKey: 'nav.reservations', href: '/dashboard/reservations', icon: CalendarDays },
  { key: 'tasks', labelKey: 'nav.tasks', href: '/dashboard/tasks', icon: ClipboardList },
  { key: 'calendar', labelKey: 'nav.calendar', href: '/dashboard/calendar', icon: Calendar },
  { key: 'team', labelKey: 'nav.team', href: '/dashboard/team', icon: Users },
  { key: 'incidents', labelKey: 'nav.incidents', href: '/dashboard/incidents', icon: AlertTriangle },
  { key: 'inventory', labelKey: 'nav.inventory', href: '/dashboard/inventory', icon: Package, v1Only: true },
  { key: 'billing', labelKey: 'nav.billing', href: '/dashboard/billing', icon: CreditCard },
  { key: 'settings', labelKey: 'nav.settings', href: '/dashboard/settings', icon: Settings },
]

function filterSidebarByRole(role: UserRole): NavItem[] {
  switch (role) {
    case 'owner':
    case 'admin':
      return SIDEBAR_ITEMS_FULL
    case 'manager':
    case 'member':
      return SIDEBAR_ITEMS_FULL.filter(
        (item) => item.key !== 'billing' && item.key !== 'settings'
      )
    case 'staff_autonomous':
      return SIDEBAR_ITEMS_FULL.filter((item) =>
        ['dashboard', 'tasks', 'calendar', 'incidents'].includes(item.key)
      )
    case 'staff_managed':
      return SIDEBAR_ITEMS_FULL.filter((item) => item.key === 'tasks')
    default:
      return SIDEBAR_ITEMS_FULL.filter((item) => item.key === 'dashboard')
  }
}

export function useNavItems(role: UserRole = 'owner') {
  const bottomNav =
    role === 'staff_managed'
      ? STAFF_MANAGED_BOTTOM_NAV
      : role === 'staff_autonomous'
        ? STAFF_BOTTOM_NAV
        : OWNER_BOTTOM_NAV

  const sidebarNav = filterSidebarByRole(role)

  return { bottomNav, sidebarNav }
}
