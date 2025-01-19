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
    if (process.env.NODE_ENV === 'development') {
      return {
        destination: '/maintenance.html',
        has: [
          {
            type: 'header',
            key: 'user-agent',
            // value: '(.*Trident.*)', // all ie browsers
          },
        ],
        permanent: false,
        source: '/:path((?!maintenance.html$).*)', // all pages except the incompatibility page
      }
    }
    return []
  }

  const redirects = [internetExplorerRedirect] //, maintenance()

  return redirects
}

export default redirects
