import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, TrendingUp } from 'lucide-react';

import { cn } from '@/utilities/ui';
import { StatusChip } from '@/components/nexus';

/** Cover-art fallback, matching the home feed placeholder. */
const PLACEHOLDER_IMG = '/images/future1.webp';

export interface CorrelatedItem {
  title: string;
  category: string;
  dek?: string;
  views: string;
  imageUrl?: string;
  href?: string;
  featured?: boolean;
}

/** Stretched overlay link so the whole card is clickable without nesting anchors. */
function CardLink({ href, label }: { href?: string; label: string }) {
  if (!href) return null;
  return (
    <Link href={href} aria-label={label} className="absolute inset-0 z-20">
      <span className="sr-only">{label}</span>
    </Link>
  );
}

export function CorrelatedGrid({ items }: { items: CorrelatedItem[] }) {
  return (
    <section className="border-border/60 mx-auto max-w-max-width border-t px-margin-mobile py-xxl md:px-margin-desktop">
      <h2 className="mb-lg font-display text-2xl font-semibold text-foreground">
        Similar Articles
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
            <CardLink href={item.href} label={item.title} />
            {item.featured ? (
              <div className="absolute left-sm top-sm z-10">
                <StatusChip tone="indigo" icon={TrendingUp}>
                  {item.views} Views
                </StatusChip>
              </div>
            ) : null}

            <div
              className={cn(
                'relative overflow-hidden',
                item.featured ? 'h-48 md:h-auto md:w-1/2' : 'h-40'
              )}
            >
              <Image
                src={item.imageUrl || PLACEHOLDER_IMG}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center"
              />
              {/* Faint brand wash keeps the cover art on-palette. */}
              <div className="from-accent-indigo/15 to-brand-teal/10 absolute inset-0 bg-gradient-to-br via-transparent" />
            </div>

            <div
              className={cn(
                'flex flex-col',
                item.featured ? 'justify-center p-md md:w-1/2 md:p-lg' : 'p-lg'
              )}
            >
              <span
                className={cn(
                  'font-body text-[11px] font-semibold uppercase tracking-wide text-accent-indigo',
                  item.featured ? 'mb-sm' : 'mb-md'
                )}
              >
                {item.category}
              </span>
              <h3
                className={cn(
                  'font-display font-semibold leading-tight text-foreground transition-colors group-hover:text-accent-indigo',
                  item.featured ? 'mb-sm text-xl' : 'mb-md text-2xl'
                )}
              >
                {item.title}
              </h3>
              {item.dek ? (
                <p
                  className={cn(
                    'line-clamp-3 font-body text-muted-foreground',
                    item.featured ? 'text-sm' : 'text-sm leading-relaxed'
                  )}
                >
                  {item.dek}
                </p>
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
