import { create } from 'zustand'

interface CanvasState {
  dimensions: { width: number; height: number }
  setDimensions: (dims: { width: number; height: number }) => void
  isHydrated: boolean
  markHydrated: () => void
}

export const useCanvasStore = create<CanvasState>((set) => ({
  dimensions: { width: 1440, height: 694 },
  setDimensions: (dims) => set({ dimensions: dims }),
  isHydrated: false,
  markHydrated: () => set({ isHydrated: true }),
}))
