import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDevelopment = process.env.NODE_ENV === 'development'
  const productionDomain = 'https://decentralizard.com'

  // require-trusted-types-for 'script';

  const cspHeader = `
    default-src 'self';
    style-src 'self' 'unsafe-inline';
    connect-src 'self' decentralizard.com *.decentralizard.com ws://localhost:3000 ${isDevelopment ? 'ws://localhost:3000' : ''};
    script-src 'strict-dynamic' 'nonce-${nonce}' ${isDevelopment ? "'unsafe-eval' 'unsafe-inline'" : ''} ${productionDomain};
    img-src 'self' blob: data: ${isDevelopment ? '' : productionDomain};
    font-src 'self' ${isDevelopment ? '' : productionDomain};
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)

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
