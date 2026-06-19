import { cn } from '@/utilities/ui';

import type { Tone } from './tone';

const barColor: Record<Tone, string> = {
  indigo: 'bg-accent-indigo',
  success: 'bg-success',
  error: 'bg-error',
  warning: 'bg-warning',
  teal: 'bg-brand-teal',
  magenta: 'bg-brand-magenta',
  muted: 'bg-muted-foreground',
};

export interface IndexBarProps {
  /** Text after "INDEX:" — e.g. "Neutral 0%" or "0.92 Validity". */
  label: string;
  /** Drives the bar colour. Defaults to indigo (the featured-card treatment). */
  tone?: Tone;
  className?: string;
}

/**
 * The "INDEX" marker: a short coloured bar + mono label. Mirrors the featured
 * FocusCard treatment so research cards and the article hero read consistently.
 */
export function IndexBar({ label, tone = 'indigo', className }: IndexBarProps) {
  return (
    <div className={cn('flex items-center gap-xs', className)}>
      <span className={cn('h-1 w-8 rounded-full', barColor[tone])} />
      <span className="font-mono text-[10px] text-muted-foreground">INDEX: {label}</span>
    </div>
  );
}
