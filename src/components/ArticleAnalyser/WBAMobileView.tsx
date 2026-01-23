import React, { FC, useMemo } from 'react';
import Link from 'next/link';
import { Post } from '@/payload-types';
import { PostWithMetrics } from './types';
import { getShade, getCategoryColor as getColor, enrichPostsWithMetrics } from './utils';
import { useArticleNavigation } from './hooks';

interface WBAMobileViewProps {
  posts: Post[];
}

export const WBAMobileView: FC<WBAMobileViewProps> = ({ posts }) => {
  const { loadingSlug, handleArticleClick } = useArticleNavigation();

  const postsWithMetrics = useMemo(() => enrichPostsWithMetrics(posts), [posts]);

  // Group posts by category and sort by clicks
  const categorizedPosts = useMemo(() => {
    const categorized: Record<string, PostWithMetrics[]> = {};
    postsWithMetrics.forEach((post) => {
      const category =
        post.category_titles && post.category_titles.length > 0
          ? post.category_titles[0]
          : 'Uncategorized';
      if (!categorized[category]) categorized[category] = [];
      categorized[category].push(post);
    });
    // Sort articles within each category by clicks (descending)
    Object.keys(categorized).forEach((category) => {
      categorized[category].sort((a, b) => b.clicks - a.clicks);
    });
    return categorized;
  }, [postsWithMetrics]);

  const allCategories = useMemo(() => Object.keys(categorizedPosts), [categorizedPosts]);

  const getCategoryColor = (category: string) => getColor(category, allCategories);

  // Calculate max clicks per category for color gradient
  const categoryMaxClicks = useMemo(() => {
    const maxClicks: Record<string, number> = {};
    Object.entries(categorizedPosts).forEach(([category, posts]) => {
      maxClicks[category] = Math.max(...posts.map((p) => p.clicks));
    });
    return maxClicks;
  }, [categorizedPosts]);

  // Get shade color for article based on clicks
  const getArticleColor = (category: string, clicks: number) => {
    const baseColor = getCategoryColor(category);
    const maxClicks = categoryMaxClicks[category] || 1;
    return getShade(baseColor, clicks, maxClicks);
  };

  return (
    <div className="h-full w-full overflow-y-auto">
      {Object.entries(categorizedPosts).map(([category, categoryPosts]) => (
        <div key={category}>
          {/* Category Header */}
          <div
            className="sticky top-0 z-10 px-4 py-2 text-sm font-bold text-neutral-white"
            style={{ backgroundColor: getCategoryColor(category) }}
          >
            {category} ({categoryPosts.length})
          </div>

          {/* Articles in this category */}
          <div className="flex flex-col">
            {categoryPosts.map((post) => (
              <Link
                key={post.id}
                href={post.slug ? `/posts/${post.slug}` : '#'}
                className="relative flex h-[70px] items-center justify-between border-b border-white px-4 no-underline transition-all hover:brightness-110"
                style={{ backgroundColor: getArticleColor(category, post.clicks) }}
                onClick={(e) => handleArticleClick(post, e)}
              >
                {loadingSlug === post.slug && (
                  <div className="bg-neutral-black/30 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
                  </div>
                )}
                <span className="mr-3 flex-1 truncate text-sm font-medium text-neutral-white">
                  {post.title.replace(/\n\s*/g, ' ')}
                </span>
                <span className="text-neutral-white/80 whitespace-nowrap text-xs">
                  {post.clicks?.toLocaleString()} clicks
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
