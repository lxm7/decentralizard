import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import React, { cache } from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { PayloadRedirects } from '@/components/PayloadRedirects';
import { LivePreviewListener } from '@/components/LivePreviewListener';
import NewsletterManager from '@/components/NewsletterModal/manager';
import { generateMeta } from '@/utilities/generateMeta';

import { AppsMenu, NotificationsMenu, TopNav } from '@/components/nexus';
import { DiscoverFeed } from '@/components/discover/DiscoverFeed';
import { SearchModal, SearchTrigger } from '@/components/discover/SearchModal';

// Enable ISR - revalidate every 30 seconds in production
export const revalidate = 30;

const fetchRecentPosts = cache(async () => {
  const { isEnabled: draft } = await draftMode();
  const payload = await getPayload({ config: configPromise });

  const posts = await payload.find({
    collection: 'posts',
    limit: 60, // curated front feed; full archive lives at /posts
    sort: '-publishedAt',
    depth: 1, // populate categories for tag fallback
    draft,
    overrideAccess: draft,
    where: draft ? {} : { _status: { equals: 'published' } },
  });

  return posts.docs || [];
});

const queryHomePage = cache(async () => {
  const { isEnabled: draft } = await draftMode();
  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: { slug: { equals: 'home' } },
  });

  return result.docs?.[0] || null;
});

export default async function HomePage() {
  const { isEnabled: draft } = await draftMode();
  const posts = await fetchRecentPosts();

  return (
    <div className="kandinsky-bg font-body text-foreground">
      <PayloadRedirects disableNotFound url="/" />
      {draft && <LivePreviewListener />}

      <TopNav
        brand="Decentralizard"
        brandHref="/"
        links={[
          { label: 'Search', href: '/search' },
          { label: 'Graph', href: '/graph' },
        ]}
        actions={
          <>
            <SearchTrigger />
            <NotificationsMenu />
            <AppsMenu className="hidden md:inline-flex" />
          </>
        }
      />

      <main className="mx-auto flex max-w-max-width flex-col gap-md px-margin-mobile py-md md:px-margin-desktop">
        <DiscoverFeed posts={posts} />
      </main>

      <SearchModal />
      <NewsletterManager />
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await queryHomePage();
  return generateMeta({ doc: page });
}
