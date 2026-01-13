import type { Post } from '@/payload-types'
import { getServerSideURL } from './getURL'

export const generateArticleStructuredData = (post: Post) => {
  const serverUrl = getServerSideURL()

  const imageUrl =
    post.heroImage && typeof post.heroImage === 'object' && 'url' in post.heroImage
      ? serverUrl + post.heroImage.url
      : serverUrl + '/images/website-template-OG.webp'

  const authors = post.populatedAuthors
    ? post.populatedAuthors
        .filter((author) => author?.name)
        .map((author) => ({
          '@type': 'Person',
          name: author.name,
        }))
    : [{ '@type': 'Person', name: 'Decentralizard' }]

  const categories = post.categories
    ? post.categories
        .filter((cat) => typeof cat === 'object' && cat !== null)
        .map((cat) => (typeof cat === 'object' && 'title' in cat ? cat.title : ''))
        .filter(Boolean)
    : []

  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title || '',
    description: post.shortDescription || post.meta?.description || '',
    image: imageUrl,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: authors.length > 1 ? authors : authors[0],
    publisher: {
      '@type': 'Organization',
      name: 'Decentralizard',
      logo: {
        '@type': 'ImageObject',
        url: serverUrl + '/images/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': serverUrl + '/posts/' + post.slug,
    },
    keywords: categories.join(', '),
    articleSection: categories[0] || 'General',
    articleBody: post.meta?.description || post.shortDescription || '',
  }

  return articleData
}

export const generateBreadcrumbStructuredData = (items: Array<{ name: string; url: string }>) => {
  const serverUrl = getServerSideURL()

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: serverUrl + item.url,
    })),
  }
}
