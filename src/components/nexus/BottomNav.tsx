import Link from 'next/link';
import { LayoutGrid, Grip, Activity, User, type LucideIcon } from 'lucide-react';

import { cn } from '@/utilities/ui';

export interface BottomNavItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Default mobile destinations (Home/Discover + Relational Graph share this nav). */
export const defaultBottomNavItems: BottomNavItem[] = [
  { key: 'grid', label: 'Grid', href: '/', icon: LayoutGrid },
  { key: 'graph', label: 'Graph', href: '/graph', icon: Grip },
  { key: 'pulse', label: 'Pulse', href: '/pulse', icon: Activity },
  { key: 'profile', label: 'Profile', href: '/profile', icon: User },
];

export interface BottomNavProps {
  active?: string;
  items?: BottomNavItem[];
  className?: string;
}

/** Glass mobile bottom nav (hidden ≥ lg). Server component — pass `active` from the page. */
export function BottomNav({ active, items = defaultBottomNavItems, className }: BottomNavProps) {
  return (
    <nav
      aria-label="Primary"
      className={cn(
        'glass glass-strong fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around rounded-none border-x-0 border-b-0 px-md lg:hidden',
        className
      )}
    >
      {items.map(({ key, label, href, icon: Icon }) => {
        const isActive = key === active;
        return (
          <Link
            key={key}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-lg p-1 text-[10px] font-semibold uppercase tracking-wide transition-transform active:scale-90',
              isActive ? 'text-accent-indigo' : 'text-muted-foreground'
            )}
          >
            <Icon
              aria-hidden
              className={cn(
                'h-5 w-5',
                isActive && 'drop-shadow-[0_0_8px_oklch(var(--accent-indigo)/0.5)]'
              )}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
