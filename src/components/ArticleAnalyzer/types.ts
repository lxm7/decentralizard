import { Post } from '@/payload-types'

/**
 * Represents a post enriched with additional metrics.
 * The base `Post` type is assumed to exist elsewhere.
 */
export interface PostWithMetrics extends Post {
  clicks: number
  uniqueClicks: number
  clickRate: number
}

/**
 * Represents a node in the hierarchical treemap.
 * This type is used for both intermediate (category) nodes and leaves.
 */
export interface HierarchyNode {
  name: string
  children?: HierarchyNode[]
  clicks?: number
  uniqueClicks?: number
  clickRate?: number
  url?: string
  slug?: string | null
  id?: string | number
}

/**
 * The metric used to size a treemap node.
 */
export type SizeMetric = 'clicks' | 'clickRate' | 'uniqueClicks'
