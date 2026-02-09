'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { EmptyState } from '@/components/common/EmptyState'
import { SkeletonCard } from '@/components/common/Skeleton'

interface Incident {
  id: string
  type: string
  status: string
  description?: string
  createdAt: string
  task?: { id: string; title: string; property: { name: string } }
  reporter?: { name: string }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    EQUIPMENT: 'Équipement',
    CLEANLINESS: 'Propreté',
    SAFETY: 'Sécurité',
    GUEST: 'Client',
    OTHER: 'Autre',
  }
  return map[type] ?? type
}

function statusBadge(status: string): { text: string; color: string } {
  if (status === 'open') return { text: 'Ouvert', color: 'bg-red-50 text-red-700' }
  return { text: 'Résolu', color: 'bg-green-50 text-green-700' }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}j`
}

export default function IncidentsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { t } = useTranslation(['tasks', 'common'])

  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/incidents`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setIncidents(data.incidents ?? [])
      }
    } catch { /* */ } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.replace('/login'); return }
    if (isAuthenticated) loadData()
  }, [isAuthenticated, authLoading, router, loadData])

  if (authLoading || loading) return <div className="p-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-xl font-semibold text-foreground">{t('tasks:type.incident')}</h1>

      {incidents.length === 0 ? (
        <EmptyState icon={AlertTriangle} title={t('common:noIncidents', { defaultValue: 'Aucun incident signalé' })} />
      ) : (
        <div className="space-y-2">
          {incidents.map((inc) => {
            const badge = statusBadge(inc.status)
            return (
              <div key={inc.id} className="rounded-lg border bg-card p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-[#C45B4A]" />
                    <span className="text-sm font-medium text-foreground">{typeLabel(inc.type)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.color}`}>{badge.text}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{timeAgo(inc.createdAt)}</span>
                </div>
                {inc.description && <p className="mt-1 text-sm text-muted-foreground">{inc.description}</p>}
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  {inc.task && <span>{inc.task.property.name} · {inc.task.title}</span>}
                  {inc.reporter && <span>· {inc.reporter.name}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
