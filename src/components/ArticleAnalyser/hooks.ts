import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Post } from '@/payload-types';

/**
 * Hook for getting unique categories from posts
 */
export const useCategories = (posts: Post[]) => {
  return useMemo(() => {
    const cats = new Set<string>();
    posts.forEach((post) => {
      if (post.category_titles && post.category_titles.length > 0) {
        post.category_titles.forEach((cat) => cats.add(cat));
      }
    });
    return Array.from(cats).sort();
  }, [posts]);
};

/**
 * Hook for handling article navigation with loading state
 */
export const useArticleNavigation = () => {
  const router = useRouter();
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  const handleArticleClick = (post: Post, e: React.MouseEvent) => {
    if (post.slug) {
      e.preventDefault();
      setLoadingSlug(post.slug);
      window.gtag?.('event', 'article_click', {
        event_category: post.category_titles?.[0] || 'Uncategorized',
        event_label: post.title,
        event_link: `/posts/${post.slug}`,
        transport_type: 'beacon',
      });
      router.push(`/posts/${post.slug}`);
    }
  };

  return { loadingSlug, handleArticleClick };
};
