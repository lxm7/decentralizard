import type { Metadata } from 'next/types';
import Link from 'next/link';

import { Pagination } from '@/components/Pagination';
import { BentoMatrix } from '@/components/discover/BentoMatrix';
import {
  applyImpact,
  buildArchiveCells,
  buildPostsWhere,
  hasActiveFilters,
  parseFilters,
} from '@/components/discover/model';
import { SiteHeader } from '@/components/discover/SiteHeader';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import React from 'react';
import PageClient from './page.client';

// ISR for the bare archive; reading searchParams opts request-time renders into
// dynamic SSR automatically, so no `force-static` (that would null searchParams).
export const revalidate = 600;

const POSTS_PER_PAGE = 12;

type Args = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const filters = parseFilters(await searchParamsPromise);
  const filtering = hasActiveFilters(filters);

  const payload = await getPayload({ config: configPromise });

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: POSTS_PER_PAGE,
    overrideAccess: false,
    sort: '-publishedAt',
    where: buildPostsWhere(filters),
  });

  // Impact is seeded from the post id, not a DB column — gate post-fetch.
  const docs = applyImpact(posts.docs, filters.impact);
  const cells = buildArchiveCells(docs);
  const count = filtering ? docs.length : posts.totalDocs;

  return (
    <div className="kandinsky-bg font-body text-foreground">
      <PageClient />

      <SiteHeader active="/posts" />

      <main className="mx-auto flex max-w-max-width flex-col gap-md px-margin-mobile py-md md:px-margin-desktop">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-xs text-muted-foreground">
            {filtering && filters.query ? (
              <>
                {count} {count === 1 ? 'result' : 'results'} for &ldquo;{filters.query}&rdquo;
              </>
            ) : (
              <>
                {count} {count === 1 ? 'stream' : 'streams'}
                {filtering ? ' matched' : ''}
              </>
            )}
          </span>
          {filtering && (
            <Link
              href="/posts"
              className="font-mono text-xs text-accent-indigo transition-colors hover:text-accent-indigo-strong"
            >
              Clear filters ✕
            </Link>
          )}
        </div>

        {cells.length > 0 ? (
          <BentoMatrix cells={cells} />
        ) : (
          <p className="py-xxl text-center font-body text-muted-foreground">
            {filtering
              ? 'No intelligence streams match these filters.'
              : 'No intelligence streams published yet.'}
          </p>
        )}

        {/* Paginated search is a follow-up; only page the unfiltered archive. */}
        {!filtering && posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </main>
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: `Archive · Decentralizard`,
  };
}
