'use client';

import Link from 'next/link';
import { Bell, Inbox, LayoutGrid, Shield } from 'lucide-react';

import { Button } from '@/base/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/base/popover';
import { cn } from '@/utilities/ui';

/** Shared heading + divider for the header popovers. */
function MenuHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-border/40 mb-xs border-b px-xs pb-xs font-display text-sm font-bold text-foreground">
      {children}
    </p>
  );
}

const menuItem =
  'hover:bg-muted/60 flex items-start gap-sm rounded-lg p-xs font-body text-[13px] transition-colors';

/** Bell popover — notifications. Title + a single item for now. */
export function NotificationsMenu({ className }: { className?: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className={className}>
          <Bell className="h-5 w-5" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Notifications">
        <MenuHeading>Notifications</MenuHeading>
        <Link href="#" className={menuItem} role="menuitem">
          <Inbox className="mt-0.5 h-4 w-4 shrink-0 text-accent-indigo" aria-hidden />
          <span className="text-muted-foreground">You&apos;re all caught up — no new alerts.</span>
        </Link>
      </PopoverContent>
    </Popover>
  );
}

/** Grid popover — quick links. Single item linking to the Payload admin. */
export function AppsMenu({ className }: { className?: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Menu" className={cn(className)}>
          <LayoutGrid className="h-5 w-5" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Quick links">
        <MenuHeading>Quick Links</MenuHeading>
        <Link href="/admin" className={menuItem} role="menuitem">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-accent-indigo" aria-hidden />
          <span className="font-medium text-foreground">Admin Dashboard</span>
        </Link>
      </PopoverContent>
    </Popover>
  );
}
