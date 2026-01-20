'use client';

import React, { FC, useState, useEffect } from 'react';
import Image from 'next/image';
import { Post } from '@/payload-types';
import { TimeFilter, ViewType } from './types';
import { DesktopGridView } from './DesktopGridView';
import { CardMobileView } from './CardMobileView';
import { WBAMobileView } from './WBAMobileView';
import { ArticleTreeMap } from './ArticleTreeMap';
import { ViewToggle } from './ViewToggle';
import { Header, Hero } from '@/components/Header';

interface ArticleAnalyserProps {
  posts: Post[];
}

export const ArticleAnalyser: FC<ArticleAnalyserProps> = ({ posts }) => {
  const [searchString, _setSearchString] = useState<string>('');
  const [timeFilter, _setTimeFilter] = useState<TimeFilter>('all');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [noResults, setNoResults] = useState<boolean>(false);
  const [view, setView] = useState<ViewType>('default');

  // Apply time filtering
  const timeFilteredPosts = React.useMemo(() => {
    if (timeFilter === 'all') return posts;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return posts.filter((post) => {
      if (!post.publishedAt) return false;
      const publishedDate = new Date(post.publishedAt);

      switch (timeFilter) {
        case 'today':
          return publishedDate >= today;
        case 'week': {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return publishedDate >= weekAgo;
        }
        case 'month': {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return publishedDate >= monthAgo;
        }
        case 'year': {
          const yearAgo = new Date(today);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          return publishedDate >= yearAgo;
        }
        default:
          return true;
      }
    });
  }, [posts, timeFilter]);

  useEffect(() => {
    if (!searchString) {
      setFilteredPosts(timeFilteredPosts);
      setNoResults(false);
      return;
    }
    const lowerQuery = searchString.toLowerCase();
    const filtered = timeFilteredPosts.filter((post) =>
      post.title.toLowerCase().includes(lowerQuery)
    );
    // If the search term is a complete word and there are no matches
    if (filtered.length === 0 && searchString.trim().includes(' ') === false) {
      setNoResults(true);
      setIsLoading(true);

      // Mock API call delay
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000); // 3 seconds loading time

      return () => clearTimeout(timer);
    } else {
      setNoResults(false);
      setIsLoading(false);
      setFilteredPosts(filtered);
    }
  }, [searchString, timeFilteredPosts]);

  return (
    <div
      className="flex h-screen flex-col"
      style={{
        backgroundImage: `
          linear-gradient(oklch(var(--neutral-800)) 1px, transparent 1px),
          linear-gradient(90deg, oklch(var(--neutral-800)) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}
    >
      {/* Header - Always visible */}
      <Header />

      {/* Hero - Always visible */}
      <Hero onNewIdea={() => console.log('New idea essay clicked')} />

      {isLoading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-[#0d1117]/95">
          <div className="flex flex-col items-center gap-4">
            <div className="text-base text-neutral-500">Searching with AI...</div>
            <div className="relative h-8 w-32">
              <Image
                src="/images/logo/logo2-white-loader-colour.svg"
                alt="Loading"
                fill
                className="ml-[-10px]"
              />
            </div>
          </div>
        </div>
      ) : noResults ? (
        <div className="fixed inset-0 flex items-center justify-center bg-[#0d1117]/95">
          <div className="flex flex-col items-center gap-4">
            <div className="flex w-full items-center justify-center text-base text-neutral-500">
              No articles found for &quot;{searchString}&quot;
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="fixed bottom-[10px] right-4 z-20">
            <ViewToggle activeView={view} onViewChange={setView} />
          </div>
          {/* Mobile view with toggle - shown on screens < 768px */}
          <div className="block flex-1 overflow-hidden md:hidden">
            {/* Render mobile view based on selection */}
            {view === 'default' ? (
              <CardMobileView posts={filteredPosts} />
            ) : (
              <WBAMobileView posts={filteredPosts} />
            )}
          </div>

          {/* Desktop view with toggle - shown on screens >= 768px */}
          <div className="hidden flex-1 overflow-hidden md:block">
            {view === 'default' ? (
              <DesktopGridView posts={filteredPosts} />
            ) : (
              <ArticleTreeMap posts={filteredPosts} />
            )}
          </div>
        </>
      )}
    </div>
  );
};
