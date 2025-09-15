import '@/styles/globals.css'

import { SpeedInsights } from "@vercel/speed-insights/next"

import type { Metadata } from 'next'
import { SWRegister } from '@/components/sw-register'

export const metadata: Metadata = {
  title: 'Peramanathan Sathyamoorthy - Dev Profile',
  description: 'Modern portfolio showcasing software engineering skills and projects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        <SWRegister />
        {children}
      </body>
    </html>
  )
}
