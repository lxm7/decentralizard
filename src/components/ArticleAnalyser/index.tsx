'use client';

import React, { FC } from 'react';
import { Post } from '@/payload-types';
import { DesktopGridView } from './DesktopGridView';
import { CardMobileView } from './CardMobileView';
import { WBAMobileView } from './WBAMobileView';
import { ArticleTreeMap } from './ArticleTreeMap';
import { ViewToggle } from './ViewToggle';
import { Header } from '@/components/Header';
import { useViewStore } from '@/stores/useViewStore';

interface ArticleAnalyserProps {
  posts: Post[];
}

export const ArticleAnalyser: FC<ArticleAnalyserProps> = ({ posts }) => {
  // Use persisted view store
  const { view, setView } = useViewStore();

  // Note: Filtering is now handled by individual view components using useFilterStore
  // This keeps the code DRY and centralized in the Zustand store

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

      <div className="fixed bottom-[10px] right-4 z-20 md:hidden">
        <ViewToggle activeView={view} onViewChange={setView} />
      </div>

      {/* Mobile view with toggle - shown on screens < 768px */}
      <div className="block flex-1 overflow-hidden md:hidden">
        {view === 'default' ? <CardMobileView posts={posts} /> : <WBAMobileView posts={posts} />}
      </div>

      {/* Desktop view with toggle - shown on screens >= 768px */}
      <div className="hidden flex-1 overflow-hidden md:block">
        {view === 'default' ? (
          <DesktopGridView posts={posts} activeView={view} onViewChange={setView} />
        ) : (
          <ArticleTreeMap posts={posts} activeView={view} onViewChange={setView} />
        )}
      </div>
    </div>
  );
};
