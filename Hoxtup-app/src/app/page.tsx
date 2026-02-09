'use client'

import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

export default function HomePage() {
  const { t } = useTranslation('common')

  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-display text-brand-primary">Hoxtup</span>
          <span className="inline-block h-3 w-3 rounded-full bg-brand-accent" />
        </div>
        <p className="text-body text-muted-foreground text-center max-w-md">
          {t('appDescription', 'Gestion locative simplifiée')}
        </p>
      </div>

      <div className="grid gap-4 w-full max-w-sm">
        <section className="rounded-lg border bg-card p-6">
          <h2 className="text-heading text-foreground mb-3">{t('typography', 'Typographie')}</h2>
          <div className="space-y-2">
            <p className="text-display">{t('display', 'Display — Outfit 600')}</p>
            <p className="text-heading">{t('heading', 'Heading — Outfit 600')}</p>
            <p className="text-subheading">{t('subheading', 'Subheading — Outfit 500')}</p>
            <p className="text-body">{t('body', 'Body — Inter 400')}</p>
            <p className="text-label">{t('label', 'Label — Inter 500')}</p>
            <p className="text-caption">{t('caption', 'Caption — Inter 400')}</p>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-6">
          <h2 className="text-heading text-foreground mb-3">{t('buttons', 'Boutons')}</h2>
          <div className="flex flex-col gap-3">
            <Button>{t('validate', 'Valider')}</Button>
            <Button variant="secondary">{t('viewDetails', 'Voir détails')}</Button>
            <Button variant="ghost">{t('cancel', 'Annuler')}</Button>
            <Button variant="destructive">{t('delete', 'Supprimer')}</Button>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-6">
          <h2 className="text-heading text-foreground mb-3">{t('colors', 'Couleurs')}</h2>
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-md bg-brand-primary" />
              <span className="text-caption">primary</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-md bg-brand-accent" />
              <span className="text-caption">accent</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-md bg-cta" />
              <span className="text-caption">cta</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-md bg-immersive" />
              <span className="text-caption">immersive</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-md bg-success" />
              <span className="text-caption">success</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-md bg-warning" />
              <span className="text-caption">warning</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-md bg-danger" />
              <span className="text-caption">danger</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-md bg-info" />
              <span className="text-caption">info</span>
            </div>
          </div>

          <h3 className="text-subheading text-foreground mt-4 mb-2">{t('properties', 'Propriétés')}</h3>
          <div className="flex gap-2">
            <div className="h-6 w-6 rounded-full bg-prop-1" />
            <div className="h-6 w-6 rounded-full bg-prop-2" />
            <div className="h-6 w-6 rounded-full bg-prop-3" />
            <div className="h-6 w-6 rounded-full bg-prop-4" />
            <div className="h-6 w-6 rounded-full bg-prop-5" />
          </div>
        </section>

        <section className="rounded-lg border bg-card p-6">
          <h2 className="text-heading text-foreground mb-3">{t('formElements', 'Formulaire')}</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="demo-input">{t('name', 'Nom')}</Label>
              <Input id="demo-input" placeholder={t('namePlaceholder', 'Entrez votre nom')} />
            </div>
            <div className="flex gap-2">
              <Badge>{t('default', 'Default')}</Badge>
              <Badge variant="secondary">{t('secondary', 'Secondary')}</Badge>
              <Badge variant="destructive">{t('urgent', 'Urgent')}</Badge>
              <Badge variant="outline">{t('outline', 'Outline')}</Badge>
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-6">
          <h2 className="text-heading text-foreground mb-3">{t('loading', 'Chargement')}</h2>
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </section>
      </div>
    </main>
  )
}
