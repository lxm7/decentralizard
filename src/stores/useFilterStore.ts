import { create } from 'zustand';
import { Post } from '@/payload-types';
import React from 'react';

export type TimeFilter = 'all' | 'today' | 'week' | 'month';

/**
 * Sanitize search query to prevent XSS and injection attacks
 * Removes potentially dangerous characters and trims whitespace
 */
const sanitizeSearchQuery = (query: string): string => {
  return query.replace(/[<>"']/g, '').trim();
};

interface FilterState {
  // Filter values
  selectedCategories: string[];
  timeFilter: TimeFilter;
  searchQuery: string;
  contentBalance: number; // 0-100: 0=analytical, 50=balanced, 100=expressive

  // Actions
  toggleCategory: (category: string) => void;
  setCategories: (categories: string[]) => void;
  setTimeFilter: (filter: TimeFilter) => void;
  setSearchQuery: (query: string) => void;
  setContentBalance: (balance: number) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  // Initial state
  selectedCategories: [],
  timeFilter: 'all',
  searchQuery: '',
  contentBalance: 50, // Default to middle (show all)

  // Actions
  toggleCategory: (category) =>
    set((state) => ({
      selectedCategories: state.selectedCategories.includes(category)
        ? state.selectedCategories.filter((c) => c !== category)
        : [...state.selectedCategories, category],
    })),

  setCategories: (categories) => set({ selectedCategories: categories }),

  setTimeFilter: (filter) => set({ timeFilter: filter }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setContentBalance: (balance) => set({ contentBalance: balance }),

  resetFilters: () =>
    set({
      selectedCategories: [],
      timeFilter: 'all',
      searchQuery: '',
      contentBalance: 50,
    }),
}));

/**
 * Maps categories to content balance scores (0-100)
 * 0 = Pure Analytical/Science, 50 = Balanced, 100 = Pure Expressive/Arts
 */
const CATEGORY_SCORES: Record<string, number> = {
  // Analytical (0-30) - Tech, Science, Data
  AI: 15,
  'Machine Learning': 10,
  'Data Science': 5,
  Science: 10,
  Technology: 20,
  Engineering: 10,
  Research: 5,
  Mathematics: 0,
  Physics: 5,
  'Computer Science': 15,
  Blockchain: 20,
  Web3: 25,
  Crypto: 20,

  // Balanced (30-70) - Interdisciplinary
  Earth: 40,
  Environment: 45,
  Philosophy: 50,
  Psychology: 45,
  Education: 50,
  Business: 40,
  Economics: 35,
  'Social Science': 50,
  Politics: 45,
  History: 50,
  Ethics: 55,
  Society: 50,

  // Expressive (70-100) - Arts, Creativity, Design
  Art: 90,
  Design: 80,
  Music: 95,
  Literature: 85,
  'Creative Writing': 90,
  Film: 85,
  Photography: 75,
  Fashion: 85,
  Culture: 70,
};

/**
 * Calculate content balance score for a post (0-100)
 * Returns 50 (balanced) if no recognizable categories
 */
const getPostContentScore = (post: Post): number => {
  if (!post.category_titles || post.category_titles.length === 0) {
    return 50; // Default to balanced if no categories
  }

  // Calculate average score from all categories
  const scores = post.category_titles
    .map((cat) => CATEGORY_SCORES[cat] ?? 50)
    .filter((score) => score !== undefined);

  if (scores.length === 0) return 50;

  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
};

/**
 * Calculate relevance weight based on distance from target
 * Uses a Gaussian-like curve for smooth falloff
 */
const getContentBalanceWeight = (
  postScore: number,
  targetScore: number,
  tolerance: number = 30
): number => {
  const distance = Math.abs(postScore - targetScore);

  // Gaussian falloff: weight = e^(-(distance^2) / (2 * tolerance^2))
  const weight = Math.exp(-(distance * distance) / (2 * tolerance * tolerance));

  return weight;
};

/**
 * Calculate time filter dates once (not on every render)
 */
const getTimeFilterDates = (timeFilter: TimeFilter) => {
  if (timeFilter === 'all') return null;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (timeFilter) {
    case 'today':
      return startOfToday;
    case 'week': {
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
      return startOfWeek;
    }
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    default:
      return null;
  }
};

/**
 * Selector hook for filtering posts
 * Centralizes all filtering logic in one place for efficiency
 */
export const useFilteredPosts = (posts: Post[]) => {
  const { selectedCategories, timeFilter, searchQuery, contentBalance } = useFilterStore();

  // Memoize filtered posts based on filter criteria
  return React.useMemo(() => {
    let result = posts;

    // Filter by time period (optimized with pre-calculated dates)
    if (timeFilter !== 'all') {
      const startDate = getTimeFilterDates(timeFilter);
      if (startDate) {
        result = result.filter((post) => {
          const publishedAt = post.publishedAt ? new Date(post.publishedAt) : null;
          return publishedAt && publishedAt >= startDate;
        });
      }
    }

    // Filter by categories (if any selected, show posts that match ANY selected category)
    if (selectedCategories.length > 0) {
      result = result.filter(
        (post) =>
          post.category_titles &&
          post.category_titles.some((cat) => selectedCategories.includes(cat))
      );
    }

    // Filter by search query (with sanitization for security)
    const sanitizedQuery = sanitizeSearchQuery(searchQuery);
    if (sanitizedQuery) {
      const query = sanitizedQuery.toLowerCase();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.shortDescription?.toLowerCase().includes(query)
      );
    }

    // Apply content balance filtering with weighted scoring
    // Early return: Skip expensive calculations when at default position
    if (contentBalance !== 50) {
      // Calculate score once per post (optimization)
      const postsWithWeights = result.map((post) => {
        const score = getPostContentScore(post);
        return {
          post,
          score,
          weight: getContentBalanceWeight(score, contentBalance),
        };
      });

      // Sort by weight (highest relevance first)
      postsWithWeights.sort((a, b) => b.weight - a.weight);

      // Filter out posts with very low weights (< 0.1 means very far from target)
      const threshold = 0.1;
      result = postsWithWeights.filter((item) => item.weight >= threshold).map((item) => item.post);
    }

    return result;
  }, [posts, selectedCategories, timeFilter, searchQuery, contentBalance]);
};
