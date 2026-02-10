'use client'

import { usePathname } from 'next/navigation'
import { AuthGuard } from '@/components/auth-guard'
import { Sidebar } from '@/components/sidebar'
import { BottomNavBar } from '@/components/bottom-nav-bar'
import { DashboardHeader } from '@/components/dashboard-header'
import { PageHeader } from '@/components/page-header'
import { useNavItems } from '@/hooks/useNavItems'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/hooks/useNavItems'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShellInner>{children}</DashboardShellInner>
    </AuthGuard>
  )
}

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const { user, activeOrg } = useAuth()

  const memberRole = (activeOrg?.members?.[0]?.role ?? 'owner') as UserRole
  const { bottomNav, sidebarNav } = useNavItems(memberRole)

  const userName = user?.name?.split(' ')[0] ?? ''
  const pathname = usePathname()
  const isDashboardHome = pathname === '/dashboard'

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar items={sidebarNav} />

      <div className="flex flex-1 flex-col min-w-0 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white mb-4">
          {isDashboardHome ? <DashboardHeader userName={userName} /> : <PageHeader />}
        </div>

        <main id="main-content" className="flex-1 px-4 pb-20 md:px-6 lg:pb-6">
          {children}
        </main>

        <BottomNavBar items={bottomNav} />
      </div>
    </div>
  )
}
