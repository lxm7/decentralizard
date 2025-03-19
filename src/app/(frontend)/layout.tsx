import React from 'react'
import type { Metadata } from 'next'
import { draftMode, headers } from 'next/headers'
import Script from 'next/script'
import { Rubik } from 'next/font/google'
// import { GoogleAnalytics } from '@next/third-parties/google'

import { AdminBar } from '@/components/AdminBar'
// import { Footer } from '@/Footer/Component'
// import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

export const dynamic = 'force-dynamic'

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['400', '700'],
  // display: 'swap',
  variable: '--font-rubik',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  const nonce = (await headers()).get('x-nonce') as string

  return (
    <html
      className={`${rubik.className}`}
      // className={cn(GeistSans.variable, GeistMono.variable, inter.className)}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <InitTheme nonce={nonce} />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" sizes="any" type="image/svg+xml" />
        <meta name="google-adsense-account" content="ca-pub-8283897961287774" />
        {/* Google Analytics external script */}
        <Script
          nonce={nonce}
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-J228LCHT7Y"
        />
        {/* Google Analytics configuration (non-rendered inline code) */}
        <Script nonce={nonce} id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){ dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', 'G-J228LCHT7Y');
          `}
        </Script>

        {/* Google AdSense external script */}
        <Script
          nonce={nonce}
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8283897961287774"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          {/* TEST 1 */}
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-format="fluid"
            data-ad-layout-key="-hc+4+18-27-l"
            data-ad-client="ca-pub-8283897961287774"
            data-ad-slot="3751333318"
          ></ins>
          <Script id="google-adsense-1" nonce={nonce}>
            (adsbygoogle = window.adsbygoogle || []).push({});
          </Script>

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
          <Script id="google-adsense-2" nonce={nonce}>
            (adsbygoogle = window.adsbygoogle || []).push({});
          </Script>
          {/* <Header /> */}
          {children}
          {/* <Footer /> */}
        </Providers>
      </body>
      {/* <GoogleAnalytics gaId="G-J228LCHT7Y" /> */}
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
