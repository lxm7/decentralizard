import type { Metadata } from 'next';

import Image from 'next/image';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { draftMode } from 'next/headers';
import React, { cache } from 'react';

import RichText from '@/components/RichText';
import { PayloadRedirects } from '@/components/PayloadRedirects';
import { LivePreviewListener } from '@/components/LivePreviewListener';
import { SiteHeader } from '@/components/discover/SiteHeader';
import { ArticleHero } from '@/components/article/ArticleHero';
import { CorrelatedGrid, type CorrelatedItem } from '@/components/article/CorrelatedGrid';
import { DataSnapshotPanel, type SnapshotSource } from '@/components/article/DataSnapshotPanel';

import type { Post } from '@/payload-types';

import { generateMeta } from '@/utilities/generateMeta';
import {
  generateArticleStructuredData,
  generateBreadcrumbStructuredData,
} from '@/utilities/generateStructuredData';
import {
  deriveResonance,
  deriveSentimentSeries,
  domainLabel,
  sentimentIndex,
  sentimentLabel,
  sentimentTone,
} from '@/utilities/postMetrics';

// Enable ISR - revalidate every 60 seconds in production
export const revalidate = 60;

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

type Args = {
  params: Promise<{
    slug?: string;
  }>;
};

function publishedLabel(post: Post): string | undefined {
  const ts = post.publishedAt ?? post.createdAt;
  if (!ts) return undefined;
  return `Published ${new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })}`;
}

function categoryLabel(post: Post): string {
  if (post.domain) return domainLabel(post.domain);
  const first = post.categories?.[0];
  return typeof first === 'object' && first?.title ? first.title : 'Article';
}

/** Build snapshot sources from editorial data, falling back to a validity-derived signal. */
function snapshotSources(post: Post): SnapshotSource[] {
  if (post.sources && post.sources.length > 0) {
    return post.sources.map((s) => ({
      label: s.label,
      confidence: s.confidence ?? 0,
      icon: s.type ?? 'analytics',
    }));
  }
  return [{ label: 'Aggregate Validity', confidence: post.validity ?? 85, icon: 'verified' }];
}

/** heroImage url when populated, else the shared home-feed placeholder. */
function relatedImage(p: Post): string {
  if (p.heroImage && typeof p.heroImage === 'object' && p.heroImage.url) {
    return p.heroImage.url;
  }
  return '/images/future1.webp';
}

function correlatedItems(post: Post, categoryFallback: Post[]): CorrelatedItem[] {
  const related = (post.relatedPosts ?? []).filter(
    (p): p is Post => typeof p === 'object' && p !== null
  );
  const source = related.length > 0 ? related : categoryFallback;
  return source.slice(0, 4).map((p, i) => ({
    title: p.title,
    category: categoryLabel(p),
    dek: p.shortDescription ?? undefined,
    views: `${deriveResonance(p.id).views} `,
    imageUrl: relatedImage(p),
    href: p.slug ? `/posts/${p.slug}` : undefined,
    featured: i === 0,
  }));
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode();
  const { slug = '' } = await paramsPromise;
  const url = '/posts/' + slug;
  const post = await queryPostBySlug({ slug });

  if (!post) return <PayloadRedirects url={url} />;

  // Related content for the Similar Articles grid
  const firstCategory = post.categories?.[0];
  const categoryId = typeof firstCategory === 'object' ? firstCategory?.id : null;
  const categoryBasedPosts = categoryId
    ? await queryPostsByCategory({ categoryId, excludeSlug: slug })
    : [];

  // Structured data for SEO
  const articleStructuredData = generateArticleStructuredData(post);
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Articles', url: '/posts' },
  ];
  if (typeof firstCategory === 'object' && firstCategory?.title) {
    breadcrumbItems.push({
      name: firstCategory.title,
      url: `/posts?category=${firstCategory.slug}`,
    });
  }
  breadcrumbItems.push({ name: post.title, url: `/posts/${post.slug}` });
  const breadcrumbStructuredData = generateBreadcrumbStructuredData(breadcrumbItems);

  // Derived presentation metrics (no analytics backend — seeded from id)
  const score = post.sentiment?.score ?? 0;
  const index = sentimentIndex(post);
  const resonance = deriveResonance(post.id);
  const author = post.populatedAuthors?.[0];
  const heroImage = post.heroImage && typeof post.heroImage === 'object' ? post.heroImage : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />

      <div
        className="bg-background font-body text-foreground"
        itemScope
        itemType="https://schema.org/Article"
      >
        {/* Hidden metadata for Schema.org */}
        <meta itemProp="headline" content={post.title} />
        {post.shortDescription && <meta itemProp="description" content={post.shortDescription} />}
        {post.publishedAt && <meta itemProp="datePublished" content={post.publishedAt} />}
        {post.updatedAt && <meta itemProp="dateModified" content={post.updatedAt} />}
        {heroImage?.url && <meta itemProp="image" content={heroImage.url} />}
        {post.populatedAuthors?.map((a, i) => (
          <meta key={i} itemProp="author" content={a?.name || ''} />
        ))}

        <SiteHeader />

        {/* Allows redirects for valid pages too */}
        <PayloadRedirects disableNotFound url={url} />
        {draft && <LivePreviewListener />}

        <main className="mx-auto grid max-w-max-width grid-cols-1 gap-xl px-margin-mobile py-xl md:px-margin-desktop lg:grid-cols-12">
          <article className="space-y-xl lg:col-span-8" itemProp="articleBody">
            <ArticleHero
              category={categoryLabel(post)}
              verified={(post.validity ?? 0) >= 90}
              publishedLabel={publishedLabel(post)}
              title={post.title}
              dek={post.shortDescription ?? undefined}
              author={author?.name ? { name: author.name, role: 'Contributor' } : undefined}
              index={index.label}
              indexTone={index.tone}
            />

            <figure className="relative h-[360px] overflow-hidden rounded-2xl border border-border">
              {heroImage?.url ? (
                <Image
                  src={heroImage.url}
                  alt={heroImage.alt || post.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              ) : (
                <div className="from-accent-indigo/20 to-brand-teal/15 h-full w-full bg-gradient-to-br via-background" />
              )}
            </figure>

            {/* Original source link */}
            {post.url && (
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass group flex items-center justify-between gap-md rounded-xl px-md py-sm transition-shadow hover:shadow-[0_4px_20px_oklch(0.3_0.05_270/0.08)]"
              >
                <span className="flex items-center gap-sm">
                  <ExternalLink className="h-4 w-4 text-accent-indigo" aria-hidden />
                  <span className="font-body text-sm font-semibold text-foreground">
                    Read the full article at source
                  </span>
                </span>
                <ArrowUpRight
                  className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </a>
            )}

            <RichText
              className="prose prose-lg max-w-none font-body leading-relaxed text-foreground"
              data={post.content}
              enableGutter={false}
              enableProse={true}
            />

            {/* Topics */}
            {post.categories && post.categories.length > 0 && (
              <div className="border-border/60 border-t pt-lg">
                <h3 className="mb-sm font-body text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Topics Covered
                </h3>
                <div className="flex flex-wrap gap-sm">
                  {post.categories.map((category, i) =>
                    typeof category === 'object' && category !== null ? (
                      <span
                        key={i}
                        className="border-border/60 rounded-full border bg-muted px-sm py-1 font-body text-sm text-muted-foreground"
                        itemProp="keywords"
                      >
                        {category.title}
                      </span>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </article>

          <aside className="lg:col-span-4">
            <DataSnapshotPanel
              sentiment={{
                label: sentimentLabel(post.sentiment?.label),
                deltaPct: score,
                tone: sentimentTone(post.sentiment?.label),
                series: deriveSentimentSeries(post.id, score),
              }}
              sources={snapshotSources(post)}
              resonance={resonance}
            />
          </aside>
        </main>

        {(post.relatedPosts?.length || categoryBasedPosts.length) > 0 && (
          <CorrelatedGrid items={correlatedItems(post, categoryBasedPosts)} />
        )}
      </div>
    </>
  );
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise;
  const post = await queryPostBySlug({ slug });

  return generateMeta({ doc: post });
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode();

  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    depth: 2, // Populate relationships like heroImage, categories, authors
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  });

  return result.docs?.[0] || null;
});

const queryPostsByCategory = cache(
  async ({ categoryId, excludeSlug }: { categoryId: number; excludeSlug: string }) => {
    const { isEnabled: draft } = await draftMode();

    const payload = await getPayload({ config: configPromise });

    const result = await payload.find({
      collection: 'posts',
      draft,
      limit: 4,
      depth: 1,
      overrideAccess: draft,
      sort: '-publishedAt',
      where: {
        and: [
          {
            categories: {
              contains: categoryId,
            },
          },
          {
            slug: {
              not_equals: excludeSlug,
            },
          },
        ],
      },
    });

    return result.docs || [];
  }
);
