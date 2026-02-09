'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Package, Plus, ArrowUpCircle, ArrowDownCircle, Tag } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { PropertyColorDot } from '@/components/features/properties/PropertyColorDot'
import { EmptyState } from '@/components/common/EmptyState'
import { SkeletonCard } from '@/components/common/Skeleton'

interface Property {
  id: string
  name: string
  colorIndex: number
}

interface ConsumableItem {
  id: string
  name: string
  category: string
  unit: string
  currentQuantity: number
  threshold: number
}

interface Asset {
  id: string
  name: string
  category: string
  costCentimes: number
  purchaseDate: string
  supplier?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

function stockColor(qty: number, threshold: number): string {
  if (qty === 0) return 'text-red-600'
  if (qty <= threshold) return 'text-amber-600'
  return 'text-green-600'
}

function formatCentimes(c: number): string {
  return (c / 100).toFixed(2) + ' €'
}

export default function InventoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { t } = useTranslation(['inventory', 'common'])

  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState('')
  const [items, setItems] = useState<ConsumableItem[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'stock' | 'assets'>('stock')

  const loadProperties = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/properties`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        const props = data.properties ?? []
        setProperties(props)
        if (props.length > 0 && !selectedProperty) setSelectedProperty(props[0].id)
      }
    } catch { /* */ }
  }, [selectedProperty])

  const loadInventory = useCallback(async () => {
    if (!selectedProperty) return
    setLoading(true)
    try {
      const [itemsRes, assetsRes] = await Promise.all([
        fetch(`${API_URL}/properties/${selectedProperty}/inventory`, { credentials: 'include' }),
        fetch(`${API_URL}/properties/${selectedProperty}/assets`, { credentials: 'include' }),
      ])
      if (itemsRes.ok) { const d = await itemsRes.json(); setItems(d.items ?? []) }
      if (assetsRes.ok) { const d = await assetsRes.json(); setAssets(d.assets ?? []) }
    } catch { /* */ } finally { setLoading(false) }
  }, [selectedProperty])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.replace('/login'); return }
    if (isAuthenticated) loadProperties()
  }, [isAuthenticated, authLoading, router, loadProperties])

  useEffect(() => {
    if (selectedProperty) loadInventory()
  }, [selectedProperty, loadInventory])

  if (authLoading) return <div className="p-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{t('inventory:title')}</h1>
      </div>

      {/* Property selector */}
      <div className="mb-4">
        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b">
        <button
          onClick={() => setTab('stock')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === 'stock' ? 'border-accent text-accent-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <Package size={14} className="mr-1 inline" />
          {t('inventory:stock')} ({items.length})
        </button>
        <button
          onClick={() => setTab('assets')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === 'assets' ? 'border-accent text-accent-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <Tag size={14} className="mr-1 inline" />
          {t('inventory:assets')} ({assets.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : tab === 'stock' ? (
        items.length === 0 ? (
          <EmptyState icon={Package} title={t('common:empty', { defaultValue: 'Aucun article' })} description={t('common:emptyDescription', { defaultValue: 'Ajoutez des consommables pour suivre votre stock.' })} />
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.category} · {item.unit}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${stockColor(item.currentQuantity, item.threshold)}`}>
                    {item.currentQuantity} {item.unit}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {t('inventory:fields.threshold')}: {item.threshold}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        assets.length === 0 ? (
          <EmptyState icon={Tag} title={t('common:empty', { defaultValue: 'Aucun équipement' })} description={t('common:emptyDescription', { defaultValue: 'Ajoutez des équipements pour suivre vos investissements.' })} />
        ) : (
          <div className="space-y-2">
            {assets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {asset.category} {asset.supplier ? `· ${asset.supplier}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{formatCentimes(asset.costCentimes)}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(asset.purchaseDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
