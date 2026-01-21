import { create } from 'zustand';
import { Post } from '@/payload-types';
import React from 'react';

export type TimeFilter = 'all' | 'today' | 'week' | 'month';

interface FilterState {
  // Filter values
  selectedCategories: string[];
  timeFilter: TimeFilter;
  searchQuery: string;

  // Actions
  toggleCategory: (category: string) => void;
  setCategories: (categories: string[]) => void;
  setTimeFilter: (filter: TimeFilter) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  // Initial state
  selectedCategories: [],
  timeFilter: 'all',
  searchQuery: '',

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

  resetFilters: () =>
    set({
      selectedCategories: [],
      timeFilter: 'all',
      searchQuery: '',
    }),
}));

/**
 * Selector hook for filtering posts
 * Centralizes all filtering logic in one place for efficiency
 */
export const useFilteredPosts = (posts: Post[]) => {
  const { selectedCategories, timeFilter, searchQuery } = useFilterStore();

  // Memoize filtered posts based on filter criteria
  return React.useMemo(() => {
    let result = posts;

    // Filter by time period
    if (timeFilter !== 'all') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      result = result.filter((post) => {
        const publishedAt = post.publishedAt ? new Date(post.publishedAt) : null;
        if (!publishedAt) return false;

        switch (timeFilter) {
          case 'today':
            return publishedAt >= startOfToday;
          case 'week':
            return publishedAt >= startOfWeek;
          case 'month':
            return publishedAt >= startOfMonth;
          default:
            return true;
        }
      });
    }

    // Filter by categories (if any selected, show posts that match ANY selected category)
    if (selectedCategories.length > 0) {
      result = result.filter(
        (post) =>
          post.category_titles &&
          post.category_titles.some((cat) => selectedCategories.includes(cat))
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.shortDescription?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [posts, selectedCategories, timeFilter, searchQuery]);
};
