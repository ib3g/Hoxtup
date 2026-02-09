'use client'

import { AppShell } from '@/components/features/app-shell/AppShell'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ErrorBoundary>
      <AppShell>
        {children}
      </AppShell>
    </ErrorBoundary>
  )
}
