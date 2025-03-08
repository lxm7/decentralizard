import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  title:
    'Decentralizard: AI, Art, Culture, Music, Bitcoin, Green Tech and crypto news and discussion',
  type: 'website',
  description:
    'Decentralizard is a content aggregator, newsletter and thought organiser at the intersection of news, science, art and culture of tomorrow.',
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
