import '@/styles/globals.css'

import { SpeedInsights } from "@vercel/speed-insights/next"
import { VercelToolbar } from '@vercel/toolbar/next';

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
  const shouldInjectToolbar = process.env.NODE_ENV === 'development';
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        <SpeedInsights />
        <SWRegister />
        {shouldInjectToolbar && <VercelToolbar />}
        {children}
      </body>
    </html>
  )
}
