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
        className="pt-16 pb-16 bg-gradient-to-b from-gray-50 to-white"
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
      <div className="flex flex-col items-center gap-4 pt-12 pb-16">
        <div className="container px-4">
          {/* Article summary/excerpt for SEO */}
          {post.shortDescription && (
            <div className="max-w-[48rem] mx-auto mb-8">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                <h2 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-2">
                  Article Summary
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed" itemProp="description">
                  {post.shortDescription}
                </p>
              </div>
            </div>
          )}

          {/* Content container with optimal reading width */}
          <div className="max-w-[48rem] mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
            {/* Article metadata for SEO */}
            <div className="flex flex-wrap gap-4 pb-6 mb-6 border-b border-gray-200 text-sm text-gray-600">
              {post.updatedAt && post.updatedAt !== post.createdAt && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="prose prose-lg md:prose-xl prose-gray max-w-none"
                data={post.content}
                enableGutter={false}
                enableProse={true}
              />
            </div>

            {/* Article tags/keywords */}
            {post.categories && post.categories.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Topics Covered
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.categories.map((category, index) => {
                    if (typeof category === 'object' && category !== null) {
                      return (
                        <a
                          key={index}
                          href={`/posts?category=${category.slug}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
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
            <div className="max-w-[48rem] mx-auto mt-12">
              <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">About the Author</h3>
                {post.populatedAuthors.map((author, index) => {
                  if (author?.name) {
                    return (
                      <div key={index} className="flex items-start gap-4" itemScope itemType="https://schema.org/Person">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                            {author.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-gray-900" itemProp="name">
                            {author.name}
                          </h4>
                          <p className="text-gray-600 mt-1">
                            Contributor at Decentralizard
                          </p>
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
            <div className="mt-16 max-w-[52rem] mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
                Related Articles
              </h2>
              <RelatedPosts
                className="lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
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
