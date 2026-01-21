import React, { FC, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/payload-types';
import { CategoryPill } from '@/components/CateoryPill';
import { useArticleNavigation } from './hooks';
import { getImageUrl } from './utils';
import { ViewType } from './types';
import { useFilterStore, useFilteredPosts } from '@/stores/useFilterStore';
import { FilterSidebar } from './FilterSidebar';
import { Hero } from '@/components/Header';
import { cn } from '@/utilities/ui';

interface DesktopGridViewProps {
  posts: Post[];
  activeView?: ViewType;
  onViewChange?: (view: ViewType) => void;
}

export const DesktopGridView: FC<DesktopGridViewProps> = ({ posts, activeView, onViewChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Use Zustand store for all filter state and filtered posts
  const { selectedCategories, toggleCategory } = useFilterStore();
  const filteredPosts = useFilteredPosts(posts);
  const { loadingSlug, handleArticleClick } = useArticleNavigation();

  return (
    <div className="flex w-full">
      <FilterSidebar
        posts={posts}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        activeView={activeView}
        onViewChange={onViewChange}
      />

      {/* Main Content Area - Add left margin when sidebar is open */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          isSidebarOpen ? 'ml-64' : 'ml-0'
        )}
      >
        {/* Hero Section */}
        <Hero onNewIdea={() => console.log('New idea essay clicked')} />

        {/* Category Filter Pills - show selected categories */}
        {selectedCategories.length > 0 && (
          <div className="border-b border-neutral-800 p-4">
            <div className="scrollbar-hide flex gap-2 overflow-x-auto">
              {selectedCategories.map((category) => (
                <CategoryPill
                  key={category}
                  title={category}
                  isSelected={true}
                  onClick={toggleCategory}
                />
              ))}
            </div>
          </div>
        )}

        {/* Article Grid */}
        <div className="p-6">
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
