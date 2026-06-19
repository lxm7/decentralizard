import type { Metadata } from 'next/types';

import { Pagination } from '@/components/Pagination';
import { BentoMatrix } from '@/components/discover/BentoMatrix';
import { buildArchiveCells } from '@/components/discover/model';
import { SiteHeader } from '@/components/discover/SiteHeader';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import React from 'react';
import PageClient from './page.client';
import { notFound } from 'next/navigation';

export const revalidate = 600;

const POSTS_PER_PAGE = 12;

type Args = {
  params: Promise<{
    pageNumber: string;
  }>;
};

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise;
  const payload = await getPayload({ config: configPromise });

  const sanitizedPageNumber = Number(pageNumber);

  if (!Number.isInteger(sanitizedPageNumber)) notFound();

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: POSTS_PER_PAGE,
    page: sanitizedPageNumber,
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
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Archive
          </h1>
          <span className="font-mono text-xs text-muted-foreground">
            Page {posts.page} of {posts.totalPages}
          </span>
        </div>

        {cells.length > 0 ? (
          <BentoMatrix cells={cells} />
        ) : (
          <p className="py-xxl text-center font-body text-muted-foreground">
            No intelligence streams on this page.
          </p>
        )}

        {posts.page && posts.totalPages > 1 && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </main>
    </div>
  );
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise;
  return {
    title: `Archive · Page ${pageNumber || ''} · Decentralizard`,
  };
}

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}
