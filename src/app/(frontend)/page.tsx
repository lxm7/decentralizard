import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cache } from 'react'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { ArticleAnalyzer } from '@/components/ArticleAnalyzer'
import { RenderBlocks } from '@/blocks/RenderBlocks'
// import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { homeStatic } from '@/endpoints/seed/home-static'
import PageClient from './[slug]/page.client'

import type { Page as PageType } from '@/payload-types'

// This function is similar to the one in [slug]/page.tsx but specifically for the home page
const queryHomePage = cache(async () => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: 'home',
      },
    },
  })

  return result.docs?.[0] || null
})

// Function to fetch recent posts
const fetchRecentPosts = cache(async () => {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    limit: 50,
    sort: '-publishedDate', // Adjust based on your field name
    depth: 0,
  })

  return posts.docs || []
})

export default async function HomePage() {
  const { isEnabled: draft } = await draftMode()
  const url = '/'

  let page: PageType | null

  page = await queryHomePage()
  // Remove this code once your website is seeded
  if (!page) {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  // Fetch recent posts
  const recentPosts = await fetchRecentPosts()
  // console.log({ recentPosts })
  const { hero, layout } = page

  return (
    <article className="home-page">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      {/* <RenderHero {...hero} /> */}
      <RenderBlocks blocks={layout} />

      {/* Recent Posts Section */}
      {recentPosts.length > 0 && (
        <main className="flex-1 overflow-hidden">
          <ArticleAnalyzer posts={recentPosts} />
        </main>
      )}
    </article>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await queryHomePage()
  return generateMeta({ doc: page })
}
