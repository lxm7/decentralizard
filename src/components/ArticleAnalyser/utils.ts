import * as d3 from 'd3';
import { Post, Media as MediaType } from '@/payload-types';
import { getClientSideURL } from '@/utilities/getURL';

/**
 * Simple seeded random number generator for consistent SSR/client results
 */
export const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

/**
 * Returns a shade of the base color based on value and max
 * The variation controls how much we brighten/darken
 */
export function getShade(
  baseColor: string,
  value: number,
  max: number,
  variation: number = 2
): string {
  const t = max > 0 ? value / max : 0;
  const brighter = d3.color(baseColor)?.brighter(variation).formatHex() || baseColor;
  const darker = d3.color(baseColor)?.darker(variation).formatHex() || baseColor;
  return d3.interpolateLab(brighter, darker)(t);
}

/**
 * Get the image URL for a post, with fallback to future1.webp
 */
export const getImageUrl = (post: Post): string => {
  if (post.heroImage && typeof post.heroImage === 'object') {
    const media = post.heroImage as MediaType;
    if (media.url) {
      return `${getClientSideURL()}${media.url}`;
    }
  }
  return '/images/future1.webp';
};

/**
 * Mock statistics data
 */
export const getMockStats = () => ({
  gridOutput: '+12%',
  aqi: 42,
  aqiStatus: 'GOOD',
  newNodes: 8,
});

/**
 * Category color palette - consistent across all visualizations
 */
export const CATEGORY_PALETTE = ['#6A0DAD', '#228B22', '#FF5733', '#3498DB', '#F1C40F', '#9B59B6'];

/**
 * Predefined colors for specific categories
 */
export const PREDEFINED_CATEGORY_COLORS: Record<string, string> = {
  AI: CATEGORY_PALETTE[0],
  Earth: CATEGORY_PALETTE[1],
};

/**
 * Get color for a category - uses predefined colors or palette rotation
 */
export const getCategoryColor = (category: string, allCategories: string[]): string => {
  if (PREDEFINED_CATEGORY_COLORS[category]) {
    return PREDEFINED_CATEGORY_COLORS[category];
  }
  const index = allCategories.indexOf(category) % CATEGORY_PALETTE.length;
  return CATEGORY_PALETTE[index];
};

/**
 * Enrich posts with deterministic metrics (consistent across SSR and client)
 */
export const enrichPostsWithMetrics = (
  posts: Post[]
): Array<Post & { clicks: number; uniqueClicks: number; clickRate: number }> => {
  return posts.map((post) => {
    const seed = typeof post.id === 'number' ? post.id : parseInt(String(post.id), 10) || 0;
    const clicks = Math.floor(seededRandom(seed) * 2000) + 100;
    const uniqueClicks = Math.floor(clicks * (0.7 + seededRandom(seed + 1) * 0.2));
    const clickRate = +((uniqueClicks / clicks) * 10 + seededRandom(seed + 2) * 2).toFixed(1);
    return { ...post, clicks, uniqueClicks, clickRate };
  });
};
