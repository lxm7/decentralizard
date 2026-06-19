import { ArrowUpRight, TrendingUp } from 'lucide-react';

import { cn } from '@/utilities/ui';
import { StatusChip } from '@/components/nexus';

export interface CorrelatedItem {
  title: string;
  category: string;
  dek?: string;
  views: string;
  featured?: boolean;
}

export function CorrelatedGrid({ items }: { items: CorrelatedItem[] }) {
  return (
    <section className="border-border/60 mx-auto max-w-max-width border-t px-margin-mobile py-xxl md:px-margin-desktop">
      <h2 className="mb-lg font-display text-2xl font-semibold text-foreground">
        Correlated Intelligence
      </h2>
      <div className="grid grid-cols-1 gap-md md:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.title}
            className={cn(
              'group relative overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-[0_4px_20px_oklch(0.3_0.05_270/0.08)]',
              item.featured ? 'flex flex-col md:col-span-2 md:flex-row' : 'flex flex-col'
            )}
          >
            {item.featured ? (
              <div className="absolute left-sm top-sm z-10">
                <StatusChip tone="indigo" icon={TrendingUp}>
                  {item.views} Views
                </StatusChip>
              </div>
            ) : null}

            <div
              className={cn(
                'from-accent-indigo/15 to-brand-teal/10 bg-gradient-to-br via-muted',
                item.featured ? 'h-48 md:h-auto md:w-1/2' : 'h-40'
              )}
            />

            <div
              className={cn(
                'flex flex-col p-md',
                item.featured && 'justify-center md:w-1/2 md:p-lg'
              )}
            >
              <span className="mb-sm font-body text-[11px] font-semibold uppercase tracking-wide text-accent-indigo">
                {item.category}
              </span>
              <h3 className="mb-sm font-display text-xl font-semibold leading-tight text-foreground transition-colors group-hover:text-accent-indigo">
                {item.title}
              </h3>
              {item.dek ? (
                <p className="line-clamp-3 font-body text-sm text-muted-foreground">{item.dek}</p>
              ) : null}
              {!item.featured ? (
                <div className="mt-auto flex items-center justify-between pt-md font-mono text-[11px] text-muted-foreground">
                  <span>{item.views} Views</span>
                  <span className="flex items-center gap-1">
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /> Read
                  </span>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
