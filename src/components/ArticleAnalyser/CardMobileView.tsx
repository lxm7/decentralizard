import React, { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/payload-types';
import { CategoryPill } from '@/components/CateoryPill';
import { SearchInput } from './SearchInput';
import { useCategories, useArticleNavigation } from './hooks';
import { getImageUrl, getMockStats } from './utils';
import { useFilterStore, useFilteredPosts } from '@/stores/useFilterStore';

interface CardMobileViewProps {
  posts: Post[];
}

export const CardMobileView: FC<CardMobileViewProps> = ({ posts }) => {
  // Use Zustand store for filter state and filtered posts
  const { selectedCategories, searchQuery, toggleCategory, setSearchQuery } = useFilterStore();

  const mockStats = getMockStats();
  const categories = useCategories(posts);
  const filteredPosts = useFilteredPosts(posts);
  const { loadingSlug, handleArticleClick } = useArticleNavigation();

  return (
    <div className="flex w-full flex-col bg-[#0d1117]">
      {/* Stats Ticker */}
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs text-neutral-400">GRID OUTPUT:</span>
          <span className="text-xs font-medium text-green-400">{mockStats.gridOutput}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-brand-teal" />
          <span className="text-xs text-neutral-400">AQI:</span>
          <span className="text-xs font-medium text-brand-teal">
            {mockStats.aqi} ({mockStats.aqiStatus})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-cyan-500" />
          <span className="text-xs text-neutral-400">NEW NODES:</span>
          <span className="text-xs font-medium text-cyan-400">{mockStats.newNodes}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          variant="dark"
          placeholder="Search the Archives..."
        />
      </div>

      {/* Category Filter Tags */}
      <div className="shrink-0 px-4 py-3">
        <div
          className="scrollbar-hide flex gap-2 overflow-x-auto pb-2"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {categories.map((category) => (
            <CategoryPill
              key={category}
              title={category}
              isSelected={selectedCategories.includes(category)}
              onClick={toggleCategory}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-24">
        {filteredPosts.map((post) => {
          const imageUrl = getImageUrl(post);
          return (
            <Link
              key={post.id}
              href={post.slug ? `/posts/${post.slug}` : '#'}
              onClick={(e) => handleArticleClick(post, e)}
              className="group relative overflow-hidden rounded-xl bg-neutral-850 no-underline transition-all hover:bg-neutral-800"
            >
              {loadingSlug === post.slug && (
                <div className="bg-neutral-black/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
                </div>
              )}

              {/* Card Image */}
              <div className="relative h-40 w-full overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-850 via-transparent to-transparent" />

                {/* Category Badges */}
                {post.category_titles && post.category_titles.length > 0 && (
                  <div className="scrollbar-hide absolute bottom-2.5 left-4 right-4 flex gap-1.5 overflow-x-auto">
                    {post.category_titles.map((category) => (
                      <CategoryPill key={category} title={category} variant="cyan" />
                    ))}
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="relative p-4 pt-3">
                {/* Title */}
                <h4 className="mb-2 line-clamp-2 text-base font-semibold text-neutral-white">
                  {post.title.replace(/\n\s*/g, ' ')}
                </h4>

                {/* Description */}
                {post.shortDescription && (
                  <p className="line-clamp-2 text-sm text-neutral-400">{post.shortDescription}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
