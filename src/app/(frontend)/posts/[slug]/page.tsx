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

      <article className="pt-16 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <PageClient />

        {/* Allows redirects for valid pages too */}
        <PayloadRedirects disableNotFound url={url} />

        {draft && <LivePreviewListener />}

        <PostHero post={post} />

      {/* Main content area with improved readability */}
      <div className="flex flex-col items-center gap-4 pt-12 pb-16">
        <div className="container px-4">
          {/* Content container with optimal reading width */}
          <div className="max-w-[48rem] mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
            <RichText
              className="prose prose-lg md:prose-xl prose-gray max-w-none"
              data={post.content}
              enableGutter={false}
              enableProse={true}
            />
          </div>

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
