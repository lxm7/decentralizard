import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/utilities/ui';
import type { Tone } from './tone';

/**
 * Small status pill for validity %, sentiment, source, or category.
 * Shared across Article Detail, Deep Search, Relational Graph, Home.
 */
const chip = cva(
  'inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[11px] font-medium leading-none',
  {
    variants: {
      tone: {
        indigo: 'bg-accent-indigo/10 text-accent-indigo border-accent-indigo/30',
        success: 'bg-success/10 text-success border-success/30',
        error: 'bg-error/10 text-error border-error/30',
        warning: 'bg-warning/10 text-warning border-warning/30',
        teal: 'bg-brand-teal/10 text-brand-teal border-brand-teal/30',
        magenta: 'bg-brand-magenta/10 text-brand-magenta border-brand-magenta/30',
        muted: 'bg-muted text-muted-foreground border-border',
      } satisfies Record<Tone, string>,
    },
    defaultVariants: { tone: 'muted' },
  }
);

export interface StatusChipProps extends VariantProps<typeof chip> {
  icon?: LucideIcon;
  className?: string;
  children: ReactNode;
}

export function StatusChip({ tone, icon: Icon, className, children }: StatusChipProps) {
  return (
    <span className={cn(chip({ tone }), className)}>
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden /> : null}
      {children}
    </span>
  );
}
