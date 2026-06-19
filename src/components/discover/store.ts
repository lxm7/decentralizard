import { create } from 'zustand';

import { INITIAL_FILTERS, type FilterState } from './model';

type DiscoverStore = FilterState & {
  /** Search modal overlay visibility. */
  searchOpen: boolean;
  toggleDomain: (d: string) => void;
  setQuery: (q: string) => void;
  setSentiment: (v: number) => void;
  setValidity: (v: number) => void;
  setImpact: (v: number) => void;
  setSearchOpen: (o: boolean) => void;
  /** Apply a staged filter set in one shot (used by the detailed search modal). */
  applyAll: (f: FilterState) => void;
  reset: () => void;
};

export const useDiscoverStore = create<DiscoverStore>((set) => ({
  ...INITIAL_FILTERS,
  searchOpen: false,
  toggleDomain: (d) =>
    set((s) => ({
      domains: s.domains.includes(d) ? s.domains.filter((x) => x !== d) : [...s.domains, d],
    })),
  setQuery: (query) => set({ query }),
  setSentiment: (sentimentMin) => set({ sentimentMin }),
  setValidity: (validityMin) => set({ validityMin }),
  setImpact: (impact) => set({ impact }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  applyAll: (f) => set({ ...f }),
  reset: () => set({ ...INITIAL_FILTERS }),
}));
