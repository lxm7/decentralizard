const redirects = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header',
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  const maintenance = () => {
    return process.env.NEXT_PUBLIC_SHOW_MAINTENANCE === '1'
      ? [
          {
            source: '/((?!maintenance).*)',
            destination: '/maintenance',
            permanent: false,
          },
        ]
      : [
          {
            source: '/maintenance',
            destination: '/',
            permanent: false,
          },
        ]
  }

  const redirects = [internetExplorerRedirect, ...maintenance()]

  return redirects
}

export default redirects
