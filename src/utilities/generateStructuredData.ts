import type { Post } from '@/payload-types';
import { getServerSideURL } from './getURL';

// Estimate reading time based on content
const estimateReadingTime = (content: Post['content'] | undefined): number => {
  if (!content?.root?.children) return 5;
  const text = JSON.stringify(content);
  const wordCount = text.split(/\s+/).length;
  const wordsPerMinute = 200;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

// Calculate word count
const calculateWordCount = (content: Post['content'] | undefined): number => {
  if (!content?.root?.children) return 0;
  const text = JSON.stringify(content);
  return text.split(/\s+/).length;
};

export const generateArticleStructuredData = (post: Post) => {
  const serverUrl = getServerSideURL();

  const imageUrl =
    post.heroImage && typeof post.heroImage === 'object' && 'url' in post.heroImage
      ? serverUrl + post.heroImage.url
      : serverUrl + '/images/website-template-OG.webp';

  const authors = post.populatedAuthors
    ? post.populatedAuthors
        .filter((author) => author?.name)
        .map((author) => ({
          '@type': 'Person',
          name: author.name,
          url: serverUrl,
        }))
    : [{ '@type': 'Person', name: 'Decentralizard', url: serverUrl }];

  const categories = post.categories
    ? post.categories
        .filter((cat) => typeof cat === 'object' && cat !== null)
        .map((cat) => (typeof cat === 'object' && 'title' in cat ? cat.title : ''))
        .filter(Boolean)
    : [];

  const wordCount = calculateWordCount(post.content);
  const readingTime = estimateReadingTime(post.content);

  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title || '',
    description: post.shortDescription || post.meta?.description || '',
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1200,
      height: 630,
    },
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: authors.length > 1 ? authors : authors[0],
    publisher: {
      '@type': 'Organization',
      name: 'Decentralizard',
      url: serverUrl,
      logo: {
        '@type': 'ImageObject',
        url: serverUrl + '/images/logo/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': serverUrl + '/posts/' + post.slug,
    },
    keywords: categories.join(', '),
    articleSection: categories[0] || 'General',
    wordCount: wordCount,
    timeRequired: `PT${readingTime}M`,
    inLanguage: 'en-US',
    isFamilyFriendly: true,
    isAccessibleForFree: true,
  };

  return articleData;
};

export const generateBreadcrumbStructuredData = (items: Array<{ name: string; url: string }>) => {
  const serverUrl = getServerSideURL();

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: serverUrl + item.url,
    })),
  };
};
