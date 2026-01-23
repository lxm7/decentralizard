import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ViewType } from '@/components/ArticleAnalyser/types';

interface ViewState {
  view: ViewType;
  setView: (view: ViewType) => void;
}

export const useViewStore = create<ViewState>()(
  persist(
    (set) => ({
      view: 'default',
      setView: (view) => set({ view }),
    }),
    {
      name: 'decentralizard-view-storage', // localStorage key
    }
  )
);
