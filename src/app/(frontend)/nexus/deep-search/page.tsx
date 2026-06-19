import type { Metadata } from 'next';

import { DeepSearchOverlay } from '@/components/deep-search/DeepSearchOverlay';

export const metadata: Metadata = { title: 'Deep Search — Nexus preview' };

/** Preview route for the Nexus "Deep Search" ⌘K overlay (opens by default). */
export default function DeepSearchPreview() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="kandinsky-bg absolute inset-0 scale-105 blur-[2px]" aria-hidden />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-sm p-8 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">Discovery Hub</h1>
        <p className="font-body text-sm text-muted-foreground">
          Press{' '}
          <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-xs">
            ⌘K
          </kbd>{' '}
          to toggle Deep Search.
        </p>
      </div>
      <DeepSearchOverlay defaultOpen />
    </div>
  );
}
