import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/images/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post>
}): Promise<Metadata> => {
  const { doc } = args || {}

  const ogImage = getImageURL(doc?.meta?.image)

  const title = doc?.meta?.title
    ? doc?.meta?.title + ' | Decentralizard'
    : 'Decentralizard: AI, Art, Culture, Music, Bitcoin, Green Tech and crypto news and discussion'

  const description =
    doc?.meta?.description ||
    'Decentralizard is a content aggregator, newsletter and thought organiser at the intersection of news, science, art and culture of tomorrow.'

  // Build a canonical URL from the server URL and the document slug
  const canonical =
    getServerSideURL() +
    (doc?.slug ? (Array.isArray(doc.slug) ? '/' + doc.slug.join('/') : `/${doc.slug}`) : '')

  return {
    title,
    alternates: { canonical },
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    keywords: doc?.meta?.keywords
      ? Array.isArray(doc.meta.keywords)
        ? doc.meta.keywords.map((k) => k.keyword).join(', ')
        : doc.meta.keywords
      : 'decentralizard, crypto, art, tech, science, counterculture, news, cultural disruption, tomorrow, world, cyborg',
  }
}
