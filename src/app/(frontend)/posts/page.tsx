import type { Metadata } from 'next/types';

import { Pagination } from '@/components/Pagination';
import { BentoMatrix } from '@/components/discover/BentoMatrix';
import { buildArchiveCells } from '@/components/discover/model';
import { SiteHeader } from '@/components/discover/SiteHeader';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import React from 'react';
import PageClient from './page.client';

export const dynamic = 'force-static';
export const revalidate = 600;

const POSTS_PER_PAGE = 12;

export default async function Page() {
  const payload = await getPayload({ config: configPromise });

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: POSTS_PER_PAGE,
    overrideAccess: false,
    sort: '-publishedAt',
    where: { _status: { equals: 'published' } },
  });

  const cells = buildArchiveCells(posts.docs);

  return (
    <div className="kandinsky-bg font-body text-foreground">
      <PageClient />

      <SiteHeader active="/posts" />

      <main className="mx-auto flex max-w-max-width flex-col gap-md px-margin-mobile py-md md:px-margin-desktop">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-xs text-muted-foreground">
            {posts.totalDocs} {posts.totalDocs === 1 ? 'stream' : 'streams'}
          </span>
        </div>

        {cells.length > 0 ? (
          <BentoMatrix cells={cells} />
        ) : (
          <p className="py-xxl text-center font-body text-muted-foreground">
            No intelligence streams published yet.
          </p>
        )}

        {posts.totalPages > 1 && posts.page && (
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
