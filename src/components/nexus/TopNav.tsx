import type { ReactNode } from 'react';
import Link from 'next/link';

import { cn } from '@/utilities/ui';

export interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

export interface TopNavProps {
  /** Brand label or node (rendered as a link to `brandHref`). */
  brand?: ReactNode;
  brandHref?: string;
  links?: NavLink[];
  /** Slot left of the brand (e.g. a filter toggle on Home). */
  leading?: ReactNode;
  /** Right-hand slot (icon buttons, Connect Wallet, avatar…). */
  actions?: ReactNode;
  /** `sticky` (default) for scrolling pages; `fixed` for full-height app shells. */
  position?: 'sticky' | 'fixed';
  className?: string;
}

/**
 * Shared glass top navigation for all Nexus pages. Server component; callers pass
 * `links` with `active` and compose interactive bits via `leading` / `actions`.
 */
export function TopNav({
  brand = 'Nexus',
  brandHref = '/',
  links = [],
  leading,
  actions,
  position = 'sticky',
  className,
}: TopNavProps) {
  return (
    <header
      className={cn(
        'glass glass-strong z-50 rounded-none border-x-0 border-t-0',
        position === 'sticky' ? 'sticky top-0' : 'fixed inset-x-0 top-0',
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-max-width items-center justify-between gap-lg px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-lg">
          {leading}
          <Link
            href={brandHref}
            className="font-display text-xl font-bold tracking-tight text-foreground"
          >
            {brand}
          </Link>
          {links.length > 0 ? (
            <nav className="hidden items-center gap-md md:flex" aria-label="Primary">
              {links.map((l) => (
                <Link
                  key={`${l.href}-${l.label}`}
                  href={l.href}
                  aria-current={l.active ? 'page' : undefined}
                  className={cn(
                    'font-body text-sm transition-colors',
                    l.active
                      ? 'border-b-2 border-accent-indigo pb-0.5 font-semibold text-accent-indigo'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-sm">{actions}</div> : null}
      </div>
    </header>
  );
}
