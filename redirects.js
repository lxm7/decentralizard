const redirects = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header',
        key: 'user-agent',
        value: '(.*Trident.*)',
      },
    ],
    permanent: false,
    source:
      '/:path((?!ie-incompatible.html$|images/future1.webp$|images/logo2-white.svg$|images/logo2-white-loader-colour.svg$|images/logo2-black.svg$).*)',
  }

  const maintenance = () => {
    return process.env.NEXT_PUBLIC_SHOW_MAINTENANCE === '1'
      ? [
          {
            source:
              '/((?!maintenance|images/future1.webp|images/logo2-white.svg|images/logo2-white-loader-colour.svg|images/logo2-black.svg).*)',
            destination: '/maintenance',
            permanent: false,
          },
        ]
      : []
  }

  const redirects = [internetExplorerRedirect, ...maintenance()]

  return redirects
}

export default redirects
