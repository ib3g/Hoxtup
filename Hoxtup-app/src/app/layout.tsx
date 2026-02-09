import type { Metadata, Viewport } from 'next'
import { Inter, Outfit } from 'next/font/google'
import { I18nProvider } from '@/i18n/I18nProvider'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Hoxtup',
  description: 'Gestion locative simplifiée',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2c4f5c',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body>
        <a href="#main-content" className="skip-to-content">
          Aller au contenu principal
        </a>
        <I18nProvider>
          <Providers>
            {children}
          </Providers>
        </I18nProvider>
      </body>
    </html>
  )
}
