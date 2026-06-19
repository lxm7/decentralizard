import { create } from 'zustand';

import { INITIAL_FILTERS, type FilterState } from './model';

type DiscoverStore = FilterState & {
  /** Search modal overlay visibility. */
  searchOpen: boolean;
  toggleCategory: (slug: string) => void;
  setQuery: (q: string) => void;
  setSentiment: (v: number) => void;
  setValidity: (v: number) => void;
  setImpact: (v: number) => void;
  setSearchOpen: (o: boolean) => void;
  reset: () => void;
};

export const useDiscoverStore = create<DiscoverStore>((set) => ({
  ...INITIAL_FILTERS,
  searchOpen: false,
  toggleCategory: (slug) =>
    set((s) => ({
      categories: s.categories.includes(slug)
        ? s.categories.filter((x) => x !== slug)
        : [...s.categories, slug],
    })),
  setQuery: (query) => set({ query }),
  setSentiment: (sentimentMin) => set({ sentimentMin }),
  setValidity: (validityMin) => set({ validityMin }),
  setImpact: (impact) => set({ impact }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  reset: () => set({ ...INITIAL_FILTERS }),
}));
