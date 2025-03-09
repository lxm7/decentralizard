import React from 'react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'

import { AdminBar } from '@/components/AdminBar'
// import { Footer } from '@/Footer/Component'
// import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

export const dynamic = 'force-dynamic'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  // const nonce = (await headers()).get('x-nonce') as string

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" sizes="any" type="image/svg+xml" />
        <meta name="google-adsense-account" content="ca-pub-8283897961287774" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8283897961287774"
          crossOrigin="anonymous"
        ></script>
        {/* TEST 1 */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-format="fluid"
          data-ad-layout-key="-hc+4+18-27-l"
          data-ad-client="ca-pub-8283897961287774"
          data-ad-slot="3751333318"
        ></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>

        {/* TEST 2 */}
        <ins
          className="adsbygoogle"
          // style="display:block"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-8283897961287774"
          data-ad-slot="2809818550"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </head>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          {/* <Header /> */}
          {children}
          {/* <Footer /> */}
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    title: 'Decentralizard',
    description: 'Decentralizard Content site where news, culture, crypto and music meet',
    images: ['https://decentralizard.com/images/future1.webp'],
    site: '@Decentralizard1',
  },
}
