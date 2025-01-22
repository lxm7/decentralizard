import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
    ],
  },
  reactStrictMode: true,
  swcMinify: true,
  redirects,
  async headers() {
    return [
      {
        // Sets security headers for all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self' https://decentralizard.com'; style-src 'self' ; image-src 'https://decentralizard.com';  script-src 'self' https://decentralizard.com; font-src 'self' 'https://decentralizard.com'",
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
            //You can use SAMEORIGIN as a value also.
          },
          {
            key: 'Permissions-Policy',
            value:
              "camera=(); battery=(self);  browsing-topics=(); geolocation=(); microphone=('https://abc_domain.com')",
            //Empty brackets are used to define that we are denying them..
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default withPayload(nextConfig)
