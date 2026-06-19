import { BadgeCheck } from 'lucide-react';

import { StatusChip } from '@/components/nexus';

export interface ArticleHeroProps {
  category?: string;
  verified?: boolean;
  publishedLabel?: string;
  title: string;
  dek?: string;
  author?: { name: string; role?: string; initials?: string };
}

export function ArticleHero({
  category = 'Article',
  verified,
  publishedLabel,
  title,
  dek,
  author,
}: ArticleHeroProps) {
  return (
    <header className="space-y-md">
      <div className="flex flex-wrap items-center gap-sm">
        {verified ? (
          <StatusChip tone="success" icon={BadgeCheck}>
            Verified Oracle
          </StatusChip>
        ) : (
          <StatusChip tone="indigo">{category}</StatusChip>
        )}
        {publishedLabel ? (
          <span className="font-body text-sm text-muted-foreground">{publishedLabel}</span>
        ) : null}
      </div>

      <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
        {title}
      </h1>

      {dek ? (
        <p className="font-body text-lg leading-relaxed text-muted-foreground">{dek}</p>
      ) : null}

      {author ? (
        <div className="flex items-center gap-sm pt-sm">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-indigo to-brand-violet font-mono text-xs font-semibold text-white">
            {author.initials ?? author.name.slice(0, 2).toUpperCase()}
          </span>
          <span className="font-body text-sm">
            <span className="font-semibold text-foreground">{author.name}</span>
            {author.role ? <span className="text-muted-foreground"> • {author.role}</span> : null}
          </span>
        </div>
      ) : null}
    </header>
  );
}
