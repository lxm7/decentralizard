import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  title: 'Decentralizard',
  type: 'website',
  description: 'Decentralizard Content site, news, culture, crypto and music zine',
  url: 'https://decentralizard.com',
  images: [
    {
      url: `${getServerSideURL()}/images/future1.webp`,
      alt: 'An image of a future city',
    },
  ],
  siteName: 'Decentralizard',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
