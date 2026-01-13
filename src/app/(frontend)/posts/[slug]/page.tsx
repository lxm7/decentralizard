import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import {
  generateArticleStructuredData,
  generateBreadcrumbStructuredData,
} from '@/utilities/generateStructuredData'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

// Enable ISR - revalidate every 60 seconds in production
export const revalidate = 60

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = posts.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = '/posts/' + slug
  const post = await queryPostBySlug({ slug })

  if (!post) return <PayloadRedirects url={url} />

  // Generate structured data for SEO
  const articleStructuredData = generateArticleStructuredData(post)

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Articles', url: '/posts' },
  ]

  if (post.categories && post.categories.length > 0) {
    const firstCategory = post.categories[0]
    if (typeof firstCategory === 'object' && firstCategory?.title) {
      breadcrumbItems.push({
        name: firstCategory.title,
        url: `/posts?category=${firstCategory.slug}`,
      })
    }
  }

  breadcrumbItems.push({ name: post.title, url: `/posts/${post.slug}` })

  const breadcrumbStructuredData = generateBreadcrumbStructuredData(breadcrumbItems)

  return (
    <>
      {/* Add JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />

      <article
        className="bg-gradient-to-b from-gray-50 to-white pb-16 pt-16"
        itemScope
        itemType="https://schema.org/Article"
      >
        {/* Hidden metadata for Schema.org */}
        <meta itemProp="headline" content={post.title} />
        {post.shortDescription && <meta itemProp="description" content={post.shortDescription} />}
        {post.publishedAt && <meta itemProp="datePublished" content={post.publishedAt} />}
        {post.updatedAt && <meta itemProp="dateModified" content={post.updatedAt} />}
        {post.heroImage && typeof post.heroImage === 'object' && 'url' in post.heroImage && (
          <meta itemProp="image" content={post.heroImage.url || ''} />
        )}
        {post.populatedAuthors?.map((author, index) => (
          <meta key={index} itemProp="author" content={author?.name || ''} />
        ))}

        <PageClient />

        {/* Allows redirects for valid pages too */}
        <PayloadRedirects disableNotFound url={url} />

        {draft && <LivePreviewListener />}

        <PostHero post={post} />

        {/* Main content area with improved readability */}
        <div className="flex flex-col items-center gap-4 pb-16 pt-12">
          <div className="container px-4">
            {/* Original article link */}
            {post.url && (
              <div className="mx-auto mb-8 max-w-[48rem]">
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-6 w-6 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    <div>
                      <div className="text-sm font-semibold uppercase tracking-wide opacity-90">
                        Original Source
                      </div>
                      <div className="font-medium">Read the full article at source</div>
                    </div>
                  </div>
                  <svg
                    className="h-6 w-6 flex-shrink-0 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            )}

            {/* Article summary/excerpt for SEO */}
            {post.shortDescription && (
              <div className="mx-auto mb-8 max-w-[48rem]">
                <div className="rounded-r-lg border-l-4 border-blue-500 bg-blue-50 p-6">
                  <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-900">
                    Article Summary
                  </h2>
                  <p className="text-lg leading-relaxed text-gray-700" itemProp="description">
                    {post.shortDescription}
                  </p>
                </div>
              </div>
            )}

            {/* Content container with optimal reading width */}
            <div className="mx-auto max-w-[48rem] rounded-lg bg-white p-8 shadow-lg md:p-12">
              {/* Article metadata for SEO */}
              <div className="mb-6 flex flex-wrap gap-4 border-b border-gray-200 pb-6 text-sm text-gray-600">
                {post.updatedAt && post.updatedAt !== post.createdAt && (
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>
                      Last updated:{' '}
                      <time dateTime={post.updatedAt} itemProp="dateModified">
                        {new Date(post.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                    </span>
                  </div>
                )}
              </div>

              {/* Main article content */}
              <div itemProp="articleBody">
                <RichText
                  className="prose prose-lg prose-gray max-w-none md:prose-xl"
                  data={post.content}
                  enableGutter={false}
                  enableProse={true}
                />
              </div>

              {/* Article tags/keywords */}
              {post.categories && post.categories.length > 0 && (
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
                    Topics Covered
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.categories.map((category, index) => {
                      if (typeof category === 'object' && category !== null) {
                        return (
                          <a
                            key={index}
                            href={`/posts?category=${category.slug}`}
                            className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200"
                            itemProp="keywords"
                          >
                            {category.title}
                          </a>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Author bio section */}
            {post.populatedAuthors && post.populatedAuthors.length > 0 && (
              <div className="mx-auto mt-12 max-w-[48rem]">
                <div className="rounded-lg bg-white p-6 shadow-lg md:p-8">
                  <h3 className="mb-4 text-xl font-bold text-gray-900">About the Author</h3>
                  {post.populatedAuthors.map((author, index) => {
                    if (author?.name) {
                      return (
                        <div
                          key={index}
                          className="flex items-start gap-4"
                          itemScope
                          itemType="https://schema.org/Person"
                        >
                          <div className="flex-shrink-0">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white">
                              {author.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900" itemProp="name">
                              {author.name}
                            </h4>
                            <p className="mt-1 text-gray-600">Contributor at Decentralizard</p>
                          </div>
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              </div>
            )}

            {/* Related posts section */}
            {post.relatedPosts && post.relatedPosts.length > 0 && (
              <div className="mx-auto mt-16 max-w-[52rem]">
                <h2 className="mb-8 text-2xl font-bold text-gray-900 md:text-3xl">
                  Related Articles
                </h2>
                <RelatedPosts
                  className="col-span-3 col-start-1 grid-rows-[2fr] lg:grid lg:grid-cols-subgrid"
                  docs={post.relatedPosts.filter((post) => typeof post === 'object')}
                />
              </div>
            )}
          </div>
        </div>
      </article>
    </>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const post = await queryPostBySlug({ slug })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

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
  })

  return result.docs?.[0] || null
})
