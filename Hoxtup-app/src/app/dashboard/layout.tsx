'use client'

import dynamic from 'next/dynamic'

const DashboardShell = dynamic(
  () => import('@/components/dashboard-shell').then((mod) => mod.DashboardShell),
  { ssr: false },
)

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}
