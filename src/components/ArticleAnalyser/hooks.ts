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
    return ['All Feeds', ...Array.from(cats)];
  }, [posts]);
};

/**
 * Hook for filtering posts by category and search query
 */
export const useArticleFilters = (posts: Post[], selectedCategory: string, searchQuery: string) => {
  return useMemo(() => {
    let result = posts;

    // Filter by category
    if (selectedCategory !== 'All Feeds') {
      result = result.filter(
        (post) => post.category_titles && post.category_titles.includes(selectedCategory)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.shortDescription?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [posts, selectedCategory, searchQuery]);
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
