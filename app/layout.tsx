import type { Metadata, Viewport } from 'next'
import { DM_Sans, DM_Serif_Display, DM_Mono } from 'next/font/google'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Permitimos user-scaling para acessibilidade. O fix anti-zoom nos inputs
  // é feito em CSS (font-size: 16px em mobile) — não restringindo o zoom global.
  maximumScale: 5,
  userScalable: true,
}

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
})

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: '400',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: {
    default: 'Chapateca · Portal Interno',
    template: '%s · Chapateca',
  },
  description: 'Portal administrativo interno da Chapateca — bibliotecas comunitárias em Maputo',
  applicationName: 'Portal Chapateca',
  authors: [{ name: 'LeapFrog — Saltos Tecnológicos' }],
  themeColor: '#461882',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo-chapateca-icone.png',
    apple: '/logo-chapateca-icone.png',
    shortcut: '/logo-chapateca-icone.png',
  },
  openGraph: {
    title: 'Chapateca · Portal Interno',
    description: 'Portal administrativo interno da Chapateca',
    images: ['/logo-chapateca-icone.png'],
    locale: 'pt_MZ',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        {/* Previne flash de tema errado */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('chapateca-theme');
            if (t === 'dark') document.documentElement.classList.add('dark');
          } catch(e) {}
        ` }} />
      </head>
      <body className={`${dmSans.variable} ${dmSerif.variable} ${dmMono.variable}`}>
        {children}
      </body>
    </html>
  )
}
