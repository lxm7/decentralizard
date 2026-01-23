import { create } from 'zustand';

interface ZoomState {
  zoomLevel: number; // 1 to 8 (100% to 800%)
  setZoomLevel: (level: number) => void;
  resetZoom: () => void;
}

export const useZoomStore = create<ZoomState>((set) => ({
  zoomLevel: 1,
  setZoomLevel: (level) => set({ zoomLevel: Math.max(1, Math.min(8, level)) }),
  resetZoom: () => set({ zoomLevel: 1 }),
}));
