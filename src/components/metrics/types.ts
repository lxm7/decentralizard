/**
 * Neutral re-export of post-metric types so non-ArticleAnalyser features
 * (Data Snapshot panel, graph nodes, bento cards) can import without reaching
 * into the ArticleAnalyser feature folder.
 */
export type { PostWithMetrics, HierarchyNode, SizeMetric } from '../ArticleAnalyser/types';
