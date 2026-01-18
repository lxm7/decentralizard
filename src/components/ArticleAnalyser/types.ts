import { Post } from '@/payload-types';

/**
 * Represents a post enriched with additional metrics.
 * The base `Post` type is assumed to exist elsewhere.
 */
export interface PostWithMetrics extends Post {
  clicks: number;
  uniqueClicks: number;
  clickRate: number;
}

/**
 * Represents a node in the hierarchical treemap.
 * This type is used for both intermediate (category) nodes and leaves.
 */
export interface HierarchyNode {
  name: string;
  children?: HierarchyNode[];
  clicks?: number;
  uniqueClicks?: number;
  clickRate?: number;
  url?: string;
  slug?: string | null;
  id?: string | number;
}

/**
 * The metric used to size a treemap node.
 */
export type SizeMetric = 'clicks' | 'clickRate' | 'uniqueClicks';

/**
 * View types for article display
 * - 'default': Card/Grid view (CardMobileView on mobile, DesktopGridView on desktop)
 * - 'wba': Alternative view (WBAMobileView on mobile, ArticleTreeMap on desktop)
 */
export type ViewType = 'default' | 'wba';

/**
 * @deprecated Use ViewType instead
 */
export type MobileViewType = ViewType;

/**
 * Time filter options for filtering posts by date
 */
export type TimeFilter = 'all' | 'today' | 'week' | 'month' | 'year';

/**
 * Search input variant styles
 */
export type SearchVariant = 'light' | 'dark';

/**
 * Mock statistics data structure
 */
export interface MockStats {
  gridOutput: string;
  aqi: number;
  aqiStatus: string;
  newNodes: number;
}
