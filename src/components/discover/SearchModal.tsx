'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, X } from 'lucide-react';

import { Button } from '@/base/button';
import { Input } from '@/base/input';
import { cn } from '@/utilities/ui';

import { INITIAL_FILTERS, type FilterState } from './model';
import type { FilterCategory } from './categories';
import { useDiscoverStore } from './store';
import {
  CategoryChips,
  MetricSlider,
  SENTIMENT_DISPLAY,
  VALIDITY_DISPLAY,
  IMPACT_DISPLAY,
} from './FilterControls';

/** Search button for the TopNav `actions` slot — opens the detailed search overlay. */
export function SearchTrigger() {
  const setSearchOpen = useDiscoverStore((s) => s.setSearchOpen);
  return (
    <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
      <Search className="h-5 w-5" aria-hidden />
    </Button>
  );
}

/** Seed staged filters from the current URL so the overlay reflects active search. */
function filtersFromUrl(): FilterState {
  if (typeof window === 'undefined') return { ...INITIAL_FILTERS };
  const p = new URLSearchParams(window.location.search);
  const num = (k: string) => {
    const n = Number(p.get(k));
    return Number.isFinite(n) ? n : 0;
  };
  return {
    query: p.get('q') ?? '',
    categories: p.getAll('category'),
    sentimentMin: num('sentiment'),
    validityMin: num('validity'),
    impact: num('impact'),
  };
}

/** Serialize staged filters into the archive's searchParams. */
function toQueryString(f: FilterState): string {
  const p = new URLSearchParams();
  const q = f.query.trim();
  if (q) p.set('q', q);
  f.categories.forEach((c) => p.append('category', c));
  if (f.sentimentMin > 0) p.set('sentiment', String(f.sentimentMin));
  if (f.validityMin > 0) p.set('validity', String(f.validityMin));
  if (f.impact > 0) p.set('impact', String(f.impact));
  return p.toString();
}

/**
 * Detailed search overlay. Stages filter values locally; on submit it pushes
 * them to the archive as URL searchParams (`/posts?q=…`), which the archive RSC
 * reads and server-renders. URL-driven so it works from every page and the
 * results are shareable. Visibility is driven by `searchOpen` in the store.
 */
export function SearchModal({ categories }: { categories: FilterCategory[] }) {
  const router = useRouter();
  const open = useDiscoverStore((s) => s.searchOpen);
  const setOpen = useDiscoverStore((s) => s.setSearchOpen);

  const [staged, setStaged] = useState<FilterState>(() => ({ ...INITIAL_FILTERS }));

  // Seed the staged copy from the current URL each time the overlay opens.
  useEffect(() => {
    if (open) setStaged(filtersFromUrl());
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  if (!open) return null;

  const toggleCategory = (slug: string) =>
    setStaged((s) => ({
      ...s,
      categories: s.categories.includes(slug)
        ? s.categories.filter((x) => x !== slug)
        : [...s.categories, slug],
    }));

  const submit = () => {
    const qs = toQueryString(staged);
    router.push(qs ? `/posts?${qs}` : '/posts');
    setOpen(false);
  };

  const clear = () => setStaged({ ...INITIAL_FILTERS });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Detailed search"
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-md pt-[6vh] md:pt-[12vh]"
    >
      <button
        type="button"
        aria-label="Close search"
        onClick={() => setOpen(false)}
        className="bg-foreground/20 absolute inset-0 backdrop-blur-sm"
      />

      <div className="glass glass-strong relative z-10 flex w-full max-w-2xl flex-col gap-lg rounded-2xl p-md shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-sm font-display text-lg font-bold text-accent-indigo">
            <Search className="h-5 w-5" aria-hidden /> Detailed Search
          </span>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" aria-hidden />
          </Button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex flex-col gap-lg"
        >
          <div className="relative">
            <Sparkles
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent-indigo"
              aria-hidden
            />
            <Input
              autoFocus
              placeholder="Search intelligence streams…"
              aria-label="Search query"
              className="pl-9"
              value={staged.query}
              onChange={(e) => setStaged((s) => ({ ...s, query: e.target.value }))}
            />
          </div>

          <div className="space-y-sm">
            <span className="font-body text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Categories
            </span>
            <CategoryChips
              categories={categories}
              selected={staged.categories}
              onToggle={toggleCategory}
            />
          </div>

          <div className="grid gap-md sm:grid-cols-2">
            <MetricSlider
              label="Sentiment Index"
              value={staged.sentimentMin}
              onChange={(v) => setStaged((s) => ({ ...s, sentimentMin: v }))}
              display={SENTIMENT_DISPLAY}
            />
            <MetricSlider
              label="Validity Threshold"
              value={staged.validityMin}
              onChange={(v) => setStaged((s) => ({ ...s, validityMin: v }))}
              display={VALIDITY_DISPLAY}
              tone="teal"
            />
            <MetricSlider
              label="Impact Scope"
              value={staged.impact}
              onChange={(v) => setStaged((s) => ({ ...s, impact: v }))}
              display={IMPACT_DISPLAY}
            />
          </div>

          <div className="flex items-center justify-end gap-sm">
            <Button type="button" variant="ghost" onClick={clear}>
              Clear
            </Button>
            <Button
              type="submit"
              className={cn('bg-accent-indigo text-white hover:bg-accent-indigo-strong')}
            >
              Search
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
