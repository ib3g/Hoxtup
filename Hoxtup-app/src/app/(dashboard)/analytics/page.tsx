'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { EmptyState } from '@/components/common/EmptyState'
import { SkeletonCard } from '@/components/common/Skeleton'

interface Property {
  id: string
  name: string
  colorIndex: number
}

interface PropertyFinancial {
  propertyId: string
  propertyName: string
  isArchived: boolean
  revenue: number
  consumableCosts: number
  assetCosts: number
  profitLoss: number
}

interface OrgSummary {
  properties: PropertyFinancial[]
  totals: { revenue: number; consumableCosts: number; assetCosts: number; profitLoss: number }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

function formatCentimes(c: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(c / 100)
}

function plColor(val: number): string {
  if (val > 0) return 'text-[#2D8A6E]'
  if (val < 0) return 'text-[#C45B4A]'
  return 'text-foreground'
}

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { t } = useTranslation(['dashboard', 'common'])

  const [summary, setSummary] = useState<OrgSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const now = new Date()
      let start: string
      let end: string = now.toISOString().split('T')[0]

      if (period === 'month') {
        const s = new Date(now.getFullYear(), now.getMonth(), 1)
        start = s.toISOString().split('T')[0]
      } else {
        const s = new Date(now)
        s.setMonth(s.getMonth() - 1, 1)
        start = s.toISOString().split('T')[0]
        const e = new Date(s.getFullYear(), s.getMonth() + 1, 0)
        end = e.toISOString().split('T')[0]
      }

      const res = await fetch(`${API_URL}/financials/summary?start=${start}&end=${end}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setSummary(data)
      }
    } catch { /* */ } finally { setLoading(false) }
  }, [period])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.replace('/login'); return }
    if (isAuthenticated) loadData()
  }, [isAuthenticated, authLoading, router, loadData])

  if (authLoading) return <div className="p-4 space-y-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{t('dashboard:kpi.revenue')}</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPeriod('month')}
            className={`rounded-md px-3 py-1 text-sm ${period === 'month' ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-muted'}`}
          >
            {t('common:thisMonth', { defaultValue: 'Ce mois' })}
          </button>
          <button
            onClick={() => setPeriod('lastMonth')}
            className={`rounded-md px-3 py-1 text-sm ${period === 'lastMonth' ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-muted'}`}
          >
            {t('common:lastMonth', { defaultValue: 'Mois précédent' })}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : !summary || summary.properties.length === 0 ? (
        <EmptyState icon={BarChart3} title={t('common:noData', { defaultValue: 'Aucune donnée financière' })} description={t('common:noDataDescription', { defaultValue: 'Ajoutez des revenus et des dépenses pour voir vos rapports.' })} />
      ) : (
        <>
          {/* Totals */}
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">{t('common:revenue', { defaultValue: 'Revenus' })}</p>
              <p className="text-lg font-semibold text-[#2D8A6E]">{formatCentimes(summary.totals.revenue)}</p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">{t('common:consumables', { defaultValue: 'Consommables' })}</p>
              <p className="text-lg font-semibold text-foreground">{formatCentimes(summary.totals.consumableCosts)}</p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">{t('common:assets', { defaultValue: 'Équipements' })}</p>
              <p className="text-lg font-semibold text-foreground">{formatCentimes(summary.totals.assetCosts)}</p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">{t('common:profitLoss', { defaultValue: 'Résultat net' })}</p>
              <p className={`text-lg font-semibold ${plColor(summary.totals.profitLoss)}`}>
                {summary.totals.profitLoss > 0 && '+'}{formatCentimes(summary.totals.profitLoss)}
              </p>
            </div>
          </div>

          {/* Per-property */}
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">{t('common:perProperty', { defaultValue: 'Par propriété' })}</h2>
          <div className="space-y-2">
            {summary.properties.map((p) => (
              <div key={p.propertyId} className={`flex items-center justify-between rounded-lg border bg-card p-3 ${p.isArchived ? 'opacity-60' : ''}`}>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {p.propertyName}
                    {p.isArchived && <span className="ml-1 text-[10px] text-muted-foreground">(archivé)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('common:revenue', { defaultValue: 'Rev.' })} {formatCentimes(p.revenue)} · {t('common:expenses', { defaultValue: 'Dép.' })} {formatCentimes(p.consumableCosts + p.assetCosts)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {p.profitLoss >= 0 ? <TrendingUp size={14} className="text-[#2D8A6E]" /> : <TrendingDown size={14} className="text-[#C45B4A]" />}
                  <span className={`text-sm font-semibold ${plColor(p.profitLoss)}`}>
                    {p.profitLoss > 0 && '+'}{formatCentimes(p.profitLoss)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
