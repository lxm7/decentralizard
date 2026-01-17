import type { Metadata } from 'next';

import type { Media, Page, Post, Config } from '../payload-types';

import { mergeOpenGraph } from './mergeOpenGraph';

type PopulatedAuthor = { id?: string | null; name?: string | null };
import { getServerSideURL } from './getURL';

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL();

  let url = serverUrl + '/images/website-template-OG.webp';

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url;

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url;
  }

  return url;
};

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post>;
}): Promise<Metadata> => {
  const { doc } = args || {};

  const ogImage = getImageURL(doc?.meta?.image);

  const title = doc?.meta?.title
    ? doc?.meta?.title + ' | Decentralizard'
    : 'Decentralizard: AI, Art, Culture, Music, Bitcoin, Green Tech and crypto news and discussion';

  const description =
    doc?.meta?.description ||
    'Decentralizard is a content aggregator, newsletter and thought organiser at the intersection of news, science, art and culture of tomorrow.';

  // Build a canonical URL from the server URL and the document slug
  const canonical =
    getServerSideURL() +
    (doc?.slug ? (Array.isArray(doc.slug) ? '/' + doc.slug.join('/') : `/${doc.slug}`) : '');

  // Extract author information for posts
  const isPost = doc && typeof doc === 'object' && 'publishedAt' in doc;
  const authors =
    isPost && 'populatedAuthors' in doc && doc.populatedAuthors
      ? doc.populatedAuthors
          .filter(
            (author: PopulatedAuthor): author is PopulatedAuthor & { name: string } =>
              !!author?.name
          )
          .map((author) => ({ name: author.name }))
      : undefined;

  return {
    title,
    alternates: { canonical },
    description: doc?.meta?.description || description,
    authors,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: doc?.meta?.title || title,
            },
          ]
        : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
      type: isPost ? 'article' : 'website',
      ...(isPost &&
        doc &&
        'publishedAt' in doc &&
        doc.publishedAt && {
          article: {
            publishedTime: doc.publishedAt,
            modifiedTime: 'updatedAt' in doc ? doc.updatedAt : undefined,
            authors:
              authors && authors.length > 0 ? authors.map((a) => a.name) : ['Decentralizard'],
            section:
              'categories' in doc &&
              doc.categories &&
              Array.isArray(doc.categories) &&
              doc.categories.length > 0 &&
              typeof doc.categories[0] === 'object' &&
              doc.categories[0] !== null &&
              'title' in doc.categories[0]
                ? doc.categories[0].title
                : undefined,
          },
        }),
    }),
    twitter: {
      card: 'summary_large_image',
      title,
      description: doc?.meta?.description || description,
      images: ogImage
        ? [
            {
              url: ogImage,
              alt: doc?.meta?.title || title,
            },
          ]
        : undefined,
      creator: '@decentralizard',
      site: '@decentralizard',
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
  };
};
