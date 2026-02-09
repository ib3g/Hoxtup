'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Plus, Home, MapPin, Loader2, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PropertyColorDot } from '@/components/property-color-dot'
import { PropertyFormSheet } from '@/components/property-form-sheet'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface Property {
  id: string
  name: string
  address: string
  type: string
  colorIndex: number
  capacity: number
  archivedAt: string | null
  createdAt: string
}

type Filter = 'active' | 'archived'

export default function PropertiesPage() {
  const { t } = useTranslation('properties')
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('active')
  const [sheetOpen, setSheetOpen] = useState(false)

  const fetchProperties = useCallback(() => {
    setLoading(true)
    fetch(`${API_URL}/properties`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Property[]) => setProperties(data))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const filtered = properties.filter((p) =>
    filter === 'active' ? !p.archivedAt : !!p.archivedAt,
  )

  const activeCount = properties.filter((p) => !p.archivedAt).length
  const archivedCount = properties.filter((p) => !!p.archivedAt).length

  function handleCreated() {
    setSheetOpen(false)
    fetchProperties()
    toast.success(t('form.success.created'))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-heading">{t('title')}</h2>
        <Button onClick={() => setSheetOpen(true)}>
          <Plus className="size-4 mr-2" />
          {t('list.addProperty')}
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === 'active' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('active')}
        >
          {t('list.filterActive')} ({activeCount})
        </Button>
        <Button
          variant={filter === 'archived' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('archived')}
        >
          {t('list.filterArchived')} ({archivedCount})
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            {filter === 'active' ? (
              <Home className="size-6 text-muted-foreground" />
            ) : (
              <Archive className="size-6 text-muted-foreground" />
            )}
          </div>
          <p className="text-body text-muted-foreground">
            {filter === 'active' ? t('empty.description') : t('list.noResults')}
          </p>
          {filter === 'active' && (
            <Button className="mt-4" onClick={() => setSheetOpen(true)}>
              <Plus className="size-4 mr-2" />
              {t('list.addProperty')}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property) => (
            <Link key={property.id} href={`/dashboard/properties/${property.id}`}>
              <Card className="hover:border-brand-primary/30 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <PropertyColorDot colorIndex={property.colorIndex} size="lg" className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-label truncate">{property.name}</h3>
                        {property.archivedAt && (
                          <Badge variant="secondary" className="text-micro shrink-0">
                            {t('status.archived')}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                        <MapPin className="size-3 shrink-0" />
                        <p className="text-caption truncate">{property.address}</p>
                      </div>
                      <p className="text-micro text-muted-foreground mt-1">
                        {t(`type.${property.type.toLowerCase()}`)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <PropertyFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={handleCreated}
      />
    </div>
  )
}
