import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDevelopment = process.env.NODE_ENV === 'development'
  const productionDomain = 'https://decentralizard.com'

  // require-trusted-types-for 'script';

  // const cspHeader = `
  //   default-src 'self';
  //   style-src 'self' 'unsafe-inline';
  //   connect-src 'self' decentralizard.com *.decentralizard.com ${
  //     isDevelopment ? 'ws://localhost:3000' : ''
  //   };
  //   script-src ${trustedScriptSources.join(' ')};
  //   script-src-elem ${trustedScriptSources.join(' ')};
  //   img-src 'self' blob: data: https: ${isDevelopment ? '' : productionDomain};
  //   font-src 'self' https: ${isDevelopment ? '' : productionDomain};
  //   object-src 'none';
  //   base-uri 'self';
  //   form-action 'self';
  //   frame-ancestors 'none';
  //   upgrade-insecure-requests;
  // `

  const cspDirectives = [
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    // Note the use of https for all external hosts
    "connect-src 'self' https://decentralizard.com https://*.decentralizard.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net/",
    // Using a nonce in script-src; remove 'script-src-elem' if not needed.
    `script-src 'self' 'nonce-${nonce}' 'unsafe-eval' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://securepubads.g.doubleclick.net https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com`,
    // Uncomment the following line only if you explicitly need inline scripts in script elements.
    // "script-src-elem 'unsafe-inline'",
    // The productionDomain should be provided only in production.
    `img-src 'self' blob: data: https: ${isDevelopment ? '' : productionDomain}`,
    `font-src 'self' https: ${isDevelopment ? '' : productionDomain}`,
    "object-src 'none'",
    "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://securepubads.g.doubleclick.net https://ep2.adtrafficquality.google https://www.google.com https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://td.doubleclick.net/",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ]

  // Join directives with "; " and ensure a trailing semicolon.
  const cspHeader = cspDirectives.join('; ') + ';'

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', cspHeader)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set('Content-Security-Policy', cspHeader)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
