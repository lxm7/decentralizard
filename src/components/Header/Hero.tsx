'use client';

import React, { FC } from 'react';
import { cn } from '@/utilities/ui';

interface HeroProps {
  className?: string;
  title?: string;
  subtitle?: string;
  systemStatus?: string;
  onNewIdea?: () => void;
}

export const Hero: FC<HeroProps> = ({
  className,
  title = 'Digital Laboratory Notebook',
  subtitle = 'The intersection of algorithmic precision and creative intuition. Documenting the synthesis of worlds.',
  onNewIdea,
}) => {
  return (
    <section
      className={cn(
        'bg-[oklch(var(--bg-primary))]/50 relative overflow-hidden border-b border-neutral-800 px-4 py-12 lg:px-6 lg:py-16',
        className
      )}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />

      <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
        {/* Left: Content */}
        <div className="flex-1">
          <h1 className="mb-4 text-4xl font-bold leading-tight text-neutral-white lg:text-5xl xl:text-6xl">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl text-base leading-relaxed text-neutral-400 lg:text-lg">
            {subtitle}
          </p>
        </div>

        {/* Right: CTA Button */}
        {onNewIdea && (
          <button
            onClick={onNewIdea}
            className="bg-neutral-800/50 group flex items-center gap-2 rounded-lg border border-neutral-700 px-6 py-3 transition-all hover:border-cyan-500 hover:bg-neutral-800 active:scale-95"
          >
            <svg
              className="h-5 w-5 text-cyan-400 transition-transform group-hover:rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span className="font-semibold text-neutral-white">New Idea Essay</span>
          </button>
        )}
      </div>
    </section>
  );
};
