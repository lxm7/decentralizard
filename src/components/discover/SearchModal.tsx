'use client';

import { useEffect, useState } from 'react';
import { Search, Sparkles, X } from 'lucide-react';

import { Button } from '@/base/button';
import { Input } from '@/base/input';
import { cn } from '@/utilities/ui';

import { INITIAL_FILTERS, type FilterState } from './model';
import { useDiscoverStore } from './store';
import {
  DomainChips,
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

function snapshot(): FilterState {
  const s = useDiscoverStore.getState();
  return {
    domains: s.domains,
    query: s.query,
    sentimentMin: s.sentimentMin,
    validityMin: s.validityMin,
    impact: s.impact,
  };
}

/**
 * Detailed search overlay. Stages filter values locally and applies them to the
 * home feed in place on submit (the feed reads the same store). Mounted once on
 * the home page; visibility is driven by `searchOpen` in the store.
 */
export function SearchModal() {
  const open = useDiscoverStore((s) => s.searchOpen);
  const setOpen = useDiscoverStore((s) => s.setSearchOpen);
  const applyAll = useDiscoverStore((s) => s.applyAll);

  const [staged, setStaged] = useState<FilterState>(snapshot);

  // Seed the staged copy from the live store each time the overlay opens.
  useEffect(() => {
    if (open) setStaged(snapshot());
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

  const toggleDomain = (d: string) =>
    setStaged((s) => ({
      ...s,
      domains: s.domains.includes(d) ? s.domains.filter((x) => x !== d) : [...s.domains, d],
    }));

  const submit = () => {
    applyAll(staged);
    setOpen(false);
  };

  const clear = () => setStaged({ ...INITIAL_FILTERS });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Detailed search"
      className="fixed inset-0 z-[60] flex items-start justify-center p-md pt-[12vh]"
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
              Domains
            </span>
            <DomainChips selected={staged.domains} onToggle={toggleDomain} />
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
