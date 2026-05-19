import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display, DM_Mono } from 'next/font/google'
import './globals.css'

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
  title: 'Chapateca · Portal Interno',
  description: 'Portal administrativo interno da Chapateca',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className={`${dmSans.variable} ${dmSerif.variable} ${dmMono.variable}`}>
        {children}
      </body>
    </html>
  )
}
