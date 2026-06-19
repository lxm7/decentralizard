'use client';

import { useState } from 'react';
import { SlidersHorizontal, Sparkles, X } from 'lucide-react';

import { Button } from '@/base/button';
import { Input } from '@/base/input';
import { Slider } from '@/base/slider';
import { cn } from '@/utilities/ui';

const DOMAINS = ['Quantum', 'Neural', 'Bio-Eng', 'Materials', 'Astro'];

/**
 * Off-canvas Discover filter panel + its toggle button (placed in TopNav's `leading` slot).
 * Client component — owns open state and the staged filter values.
 */
export function DiscoverFilters() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(['Quantum']);
  const [sentiment, setSentiment] = useState(82);
  const [validity, setValidity] = useState(94);
  const [impact, setImpact] = useState(100);

  const toggleDomain = (d: string) =>
    setSelected((s) => (s.includes(d) ? s.filter((x) => x !== d) : [...s, d]));

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle filters"
        aria-expanded={open}
        aria-controls="discover-filter-panel"
        onClick={() => setOpen((o) => !o)}
        className="text-accent-indigo"
      >
        <SlidersHorizontal className="h-5 w-5" aria-hidden />
      </Button>

      {open ? (
        <button
          type="button"
          aria-label="Close filters"
          onClick={() => setOpen(false)}
          className="bg-foreground/10 fixed inset-0 z-40 backdrop-blur-[2px] lg:hidden"
        />
      ) : null}

      <aside
        id="discover-filter-panel"
        aria-hidden={!open}
        className={cn(
          'glass glass-strong fixed left-0 top-0 z-50 flex h-full w-[300px] flex-col gap-lg rounded-none border-y-0 border-l-0 p-md transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="border-border/40 flex items-center justify-between border-b pb-sm">
          <span className="flex items-center gap-sm font-display text-lg font-bold text-accent-indigo">
            <SlidersHorizontal className="h-5 w-5" aria-hidden /> Data Filters
          </span>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" aria-hidden />
          </Button>
        </div>

        <div className="relative">
          <Sparkles
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent-indigo"
            aria-hidden
          />
          <Input placeholder="AI Query…" aria-label="AI query" className="pl-9" />
        </div>

        <div className="space-y-sm">
          <span className="font-body text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Domains
          </span>
          <div className="flex flex-wrap gap-xs">
            {DOMAINS.map((d) => {
              const on = selected.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleDomain(d)}
                  className={cn(
                    'rounded-full px-3 py-1 font-body text-xs transition-colors',
                    on
                      ? 'bg-accent-indigo text-white'
                      : 'border border-border bg-muted text-foreground hover:text-accent-indigo'
                  )}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-md">
          <span className="font-body text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Metrics
          </span>
          <MetricSlider
            label="Sentiment Index"
            value={sentiment}
            onChange={setSentiment}
            display={(v) => (v / 100).toFixed(2)}
          />
          <MetricSlider
            label="Validity Threshold"
            value={validity}
            onChange={setValidity}
            display={(v) => `${v}%`}
            tone="teal"
          />
          <MetricSlider
            label="Impact Scope"
            value={impact}
            onChange={setImpact}
            display={(v) => (v >= 100 ? 'Global' : v >= 50 ? 'Regional' : 'Local')}
          />
        </div>

        <Button
          className="mt-auto bg-accent-indigo text-white hover:bg-accent-indigo-strong"
          onClick={() => setOpen(false)}
        >
          Apply Filters
        </Button>
      </aside>
    </>
  );
}

function MetricSlider({
  label,
  value,
  onChange,
  display,
  tone,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  display: (v: number) => string;
  tone?: 'teal';
}) {
  return (
    <div className="space-y-xs">
      <div className="flex items-center justify-between">
        <span className="font-body text-[13px] font-medium text-foreground">{label}</span>
        <span
          className={cn(
            'font-mono text-[11px]',
            tone === 'teal' ? 'text-brand-teal' : 'text-accent-indigo'
          )}
        >
          {display(value)}
        </span>
      </div>
      <Slider value={[value]} max={100} step={1} onValueChange={(v) => onChange(v[0] ?? 0)} />
    </div>
  );
}
