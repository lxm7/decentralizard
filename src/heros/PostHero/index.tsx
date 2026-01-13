import { formatDateTime } from 'src/utilities/formatDateTime'
import React from 'react'
import Link from 'next/link'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'

// Estimate reading time based on content
const estimateReadingTime = (content: any): number => {
  if (!content?.root?.children) return 5

  const text = JSON.stringify(content)
  const wordCount = text.split(/\s+/).length
  const wordsPerMinute = 200
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title, content } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  const readingTime = estimateReadingTime(content)

  return (
    <div className="relative -mt-[10.4rem] flex items-end">
      <div className="container z-10 relative lg:grid lg:grid-cols-[1fr_48rem_1fr] text-white pb-8">
        <div className="col-start-1 col-span-1 md:col-start-2 md:col-span-2">
          {/* Breadcrumb navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-white/80 hover:text-white transition-colors underline"
                >
                  Home
                </Link>
              </li>
              <li className="text-white/60">/</li>
              <li>
                <Link
                  href="/posts"
                  className="text-white/80 hover:text-white transition-colors underline"
                >
                  Articles
                </Link>
              </li>
              {categories && categories.length > 0 && (
                <>
                  <li className="text-white/60">/</li>
                  <li className="text-white" aria-current="page">
                    {typeof categories[0] === 'object' && categories[0]?.title}
                  </li>
                </>
              )}
            </ol>
          </nav>

          {/* Categories as badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories?.map((category, index) => {
              if (typeof category === 'object' && category !== null) {
                const { title: categoryTitle } = category

                const titleToUse = categoryTitle || 'Untitled category'

                return (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm text-white uppercase tracking-wide"
                  >
                    {titleToUse}
                  </span>
                )
              }
              return null
            })}
          </div>

          {/* Title */}
          <div>
            <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {title}
            </h1>
          </div>

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
            {hasAuthors && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-white/80"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <div className="flex flex-col">
                  <span className="text-white/70 text-xs">Author</span>
                  <span className="font-medium">{formatAuthors(populatedAuthors)}</span>
                </div>
              </div>
            )}
            {publishedAt && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-white/80"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div className="flex flex-col">
                  <span className="text-white/70 text-xs">Published</span>
                  <time dateTime={publishedAt} className="font-medium">
                    {formatDateTime(publishedAt)}
                  </time>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-white/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex flex-col">
                <span className="text-white/70 text-xs">Reading time</span>
                <span className="font-medium">{readingTime} min read</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="min-h-[80vh] select-none">
        {heroImage && typeof heroImage !== 'string' && (
          <Media fill priority imgClassName="-z-10 object-cover" resource={heroImage} />
        )}
        <div className="absolute pointer-events-none left-0 bottom-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent" />
      </div>
    </div>
  )
}
