'use client';

import React, { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/utilities/ui';
import { SliderFilter } from '@/components/SliderFilter';

interface HeaderProps {
  className?: string;
}

export const Header: FC<HeaderProps> = ({ className }) => {
  return (
    <header
      className={cn(
        'flex items-center justify-between border-b border-neutral-800 bg-[oklch(var(--bg-primary))] px-4 py-3 lg:px-6',
        className
      )}
    >
      <Link href="/" className="flex items-center gap-3 no-underline">
        <div className="relative h-[30px] w-[130px] flex-shrink-0">
          <Image
            src="/images/logo/logo2-white-loader-colour.svg"
            alt="Decentralizard with logo"
            fill
            className="object-contain"
          />
        </div>
        <span className="sr:only">Decentralizard</span>
      </Link>

      {/* Center: Analytical-Expressive Slider (desktop only) */}
      <SliderFilter />

      {/* Right: Navigation + Actions */}
      <div className="flex items-center gap-3 lg:gap-6">
        {/* Navigation Links (hidden on mobile) */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-neutral-300 transition-colors hover:text-neutral-white"
          >
            Laboratory
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-neutral-300 transition-colors hover:text-neutral-white"
          >
            Archive
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-neutral-300 transition-colors hover:text-neutral-white"
          >
            Network
          </Link>
        </nav>

        {/* Open for Collab Status (desktop only) */}
        <div className="hidden items-center gap-2 lg:flex">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs font-medium uppercase tracking-wide text-green-400">
            Open for Collab
          </span>
        </div>

        {/* Connect Wallet Button */}
        <button className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-neutral-900 transition-all hover:bg-cyan-400 active:scale-95">
          Connect Wallet
        </button>

        {/* User Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
          <span className="text-sm font-bold text-white">A</span>
        </div>
      </div>
    </header>
  );
};
