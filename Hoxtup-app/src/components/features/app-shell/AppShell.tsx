'use client'

import { Sidebar } from './Sidebar'
import { BottomNavBar } from './BottomNavBar'

import { useTranslation } from 'react-i18next'

interface AppShellProps {
  children: React.ReactNode
  role?: string
}

export function AppShell({ children, role = 'owner' }: AppShellProps) {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
      >
        {t('common:nav.skipToContent')}
      </a>

      <Sidebar />

      <div className="flex flex-1 flex-col">
        <main id="main-content" className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
      </div>

      <BottomNavBar role={role} />
    </div>
  )
}
