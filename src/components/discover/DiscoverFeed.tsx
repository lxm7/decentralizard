'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import type { Post } from '@/payload-types';

import { BentoMatrix } from './BentoMatrix';
import { HeroTopologyCard } from './HeroTopologyCard';
import { buildCells, buildHero, filterPostsWithFallback } from './model';
import { useDiscoverStore } from './store';

/**
 * Client feed: filters the curated post set in-memory off the shared store and
 * re-derives the hero + bento matrix on every change. Instant, no network.
 */
export function DiscoverFeed({ posts }: { posts: Post[] }) {
  const categories = useDiscoverStore((s) => s.categories);
  const query = useDiscoverStore((s) => s.query);
  const sentimentMin = useDiscoverStore((s) => s.sentimentMin);
  const validityMin = useDiscoverStore((s) => s.validityMin);
  const impact = useDiscoverStore((s) => s.impact);

  const { posts: filtered, relaxed } = useMemo(
    () => filterPostsWithFallback(posts, { categories, query, sentimentMin, validityMin, impact }),
    [posts, categories, query, sentimentMin, validityMin, impact]
  );

  const hero = filtered[0];
  const cells = useMemo(
    () => (filtered.length ? buildCells(filtered.slice(1), filtered) : []),
    [filtered]
  );

  if (posts.length === 0) {
    return (
      <p className="py-xxl text-center font-body text-muted-foreground">
        No intelligence streams published yet.
      </p>
    );
  }

  if (!hero) {
    return (
      <p className="py-xxl text-center font-body text-muted-foreground">
        No intelligence streams match these filters.
      </p>
    );
  }

  return (
    <>
      {relaxed && (
        <p className="text-center font-body text-xs text-muted-foreground">
          No exact matches — showing closest results.
        </p>
      )}
      <HeroTopologyCard {...buildHero(hero)} />
      {cells.length > 0 ? <BentoMatrix cells={cells} /> : null}
      <Link
        href="/posts"
        className="mt-sm self-center font-body text-sm text-muted-foreground transition-colors hover:text-accent-indigo"
      >
        Browse the full archive →
      </Link>
    </>
  );
}
