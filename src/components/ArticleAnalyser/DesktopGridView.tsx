import React, { FC, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/payload-types';
import { cn } from '@/utilities/ui';
import { CategoryPill } from '@/components/CateoryPill';
import { SearchInput } from './SearchInput';
import { useCategories, useArticleFilters, useArticleNavigation } from './hooks';
import { getImageUrl, getMockStats } from './utils';

interface DesktopGridViewProps {
  posts: Post[];
}

export const DesktopGridView: FC<DesktopGridViewProps> = ({ posts }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Feeds');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const mockStats = getMockStats();
  const categories = useCategories(posts);
  const filteredPosts = useArticleFilters(posts, selectedCategory, searchQuery);
  const { loadingSlug, handleArticleClick } = useArticleNavigation();

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Collapsible Sidebar */}
      <div
        className={cn(
          'flex-shrink-0 border-r border-neutral-800 transition-all duration-300 ease-in-out',
          isSidebarOpen ? 'w-64' : 'w-0'
        )}
      >
        {isSidebarOpen && (
          <div className="flex h-full flex-col bg-[#0d1117] p-4">
            {/* Sidebar Header */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-neutral-white">Digital Laboratory Notebook</h2>
              <p className="mt-1 text-xs text-neutral-400">
                The intersection of algorithmic precision and creative intuition
              </p>
            </div>

            {/* Stats Section */}
            <div className="space-y-4">
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    Grid Output
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-400">{mockStats.gridOutput}</div>
              </div>

              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-teal" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    AQI
                  </span>
                </div>
                <div className="text-2xl font-bold text-brand-teal">
                  {mockStats.aqi}
                  <span className="ml-2 text-sm font-normal text-neutral-400">
                    ({mockStats.aqiStatus})
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-500" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    New Nodes
                  </span>
                </div>
                <div className="text-2xl font-bold text-cyan-400">{mockStats.newNodes}</div>
              </div>
            </div>

            {/* Aesthetic Mood Section */}
            <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Aesthetic Mood
              </h3>
              <p className="text-sm text-neutral-300">
                Solarpunk futures meet post-digital aesthetics
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-r-lg border border-l-0 border-neutral-800 bg-neutral-900 p-2 transition-all hover:bg-neutral-800"
        style={{ left: isSidebarOpen ? '256px' : '0' }}
        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <svg
          className={cn(
            'h-4 w-4 text-neutral-400 transition-transform',
            !isSidebarOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header with Search and Filters */}
        <div className="flex-shrink-0 border-b border-neutral-800 p-6 backdrop-blur-sm">
          {/* Search Bar */}
          <div className="mb-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              variant="dark"
              placeholder="Search the Archives..."
            />
          </div>

          {/* Category Filter Pills */}
          <div className="scrollbar-hide flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <CategoryPill
                key={category}
                title={category}
                isSelected={selectedCategory === category}
                onClick={setSelectedCategory}
              />
            ))}
          </div>
        </div>

        {/* Article Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredPosts.map((post) => {
              const imageUrl = getImageUrl(post);
              return (
                <Link
                  key={post.id}
                  href={post.slug ? `/posts/${post.slug}` : '#'}
                  onClick={(e) => handleArticleClick(post, e)}
                  className="group relative flex flex-col overflow-hidden rounded-xl bg-neutral-850 no-underline transition-all hover:bg-neutral-800 hover:shadow-xl"
                >
                  {loadingSlug === post.slug && (
                    <div className="bg-neutral-black/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
                    </div>
                  )}

                  {/* Card Image */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={post.title}
                      fill
                      priority
                      // TODO: refine sizes for different breakpoints
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                  <div className="flex flex-1 flex-col p-4 pt-3">
                    {/* Title */}
                    <h4 className="mb-2 line-clamp-2 text-base font-semibold text-neutral-white">
                      {post.title.replace(/\n\s*/g, ' ')}
                    </h4>

                    {/* Description */}
                    {post.shortDescription && (
                      <p className="line-clamp-3 text-sm text-neutral-400">
                        {post.shortDescription}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
