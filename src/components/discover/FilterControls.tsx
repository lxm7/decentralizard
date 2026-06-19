'use client';

import { Slider } from '@/base/slider';
import { cn } from '@/utilities/ui';
import type { FilterCategory } from './categories';

/** Toggleable category chips, sourced from the live categories collection.
 *  Controlled — parent owns the selected set (category slugs). */
export function CategoryChips({
  categories,
  selected,
  onToggle,
}: {
  categories: FilterCategory[];
  selected: string[];
  onToggle: (slug: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-xs">
      {categories.map((c) => {
        const on = selected.includes(c.slug);
        return (
          <button
            key={c.slug}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(c.slug)}
            className={cn(
              'rounded-full px-3 py-1 font-body text-xs transition-colors',
              on
                ? 'bg-accent-indigo text-white'
                : 'border border-border bg-muted text-foreground hover:text-accent-indigo'
            )}
          >
            {c.title}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Labelled metric slider. `onChange` fires continuously during drag (for the
 * thumb + readout); `onCommit` fires on release ("on blur") so consumers can
 * defer expensive work until the value settles.
 */
export function MetricSlider({
  label,
  value,
  onChange,
  onCommit,
  display,
  tone,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  onCommit?: (v: number) => void;
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
      <Slider
        value={[value]}
        max={100}
        step={1}
        onValueChange={(v) => onChange(v[0] ?? 0)}
        onValueCommit={onCommit ? (v) => onCommit(v[0] ?? 0) : undefined}
      />
    </div>
  );
}

const SENTIMENT_DISPLAY = (v: number) => (v / 100).toFixed(2);
const VALIDITY_DISPLAY = (v: number) => `${v}%`;
const IMPACT_DISPLAY = (v: number) =>
  v <= 0 ? 'Any' : v >= 100 ? 'Global' : v >= 50 ? 'Regional' : 'Local';

export { SENTIMENT_DISPLAY, VALIDITY_DISPLAY, IMPACT_DISPLAY };
