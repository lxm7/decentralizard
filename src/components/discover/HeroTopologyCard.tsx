import { ArrowRight, Share2 } from 'lucide-react';

import { Button } from '@/base/button';
import { StatusChip } from '@/components/nexus';

export interface HeroTopologyCardProps {
  node: string;
  synced?: boolean;
  title: string;
  dek: string;
  nodes: string;
}

/** Featured glass hero with an animated topology backdrop. */
export function HeroTopologyCard({ node, synced, title, dek, nodes }: HeroTopologyCardProps) {
  return (
    <section className="glass relative flex h-[400px] min-h-[300px] flex-col justify-end overflow-hidden p-md">
      <div className="bg-muted/30 absolute inset-0">
        <div className="animated-node border-accent-indigo/20 absolute left-1/4 top-1/4 flex h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border">
          <span className="h-3 w-3 rounded-full bg-accent-indigo shadow-[0_0_15px_oklch(var(--accent-indigo)/0.8)]" />
        </div>
        <div
          className="animated-node border-brand-teal/20 absolute left-2/3 top-1/2 h-[100px] w-[100px] -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{ animationDelay: '1s' }}
        >
          <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-teal shadow-[0_0_15px_oklch(var(--brand-teal)/0.8)]" />
        </div>
        <svg className="absolute inset-0 h-full w-full" aria-hidden>
          <line
            x1="25%"
            y1="25%"
            x2="66%"
            y2="50%"
            stroke="oklch(var(--accent-indigo) / 0.2)"
            strokeWidth={1}
          />
        </svg>
      </div>

      <div className="border-border/40 bg-background/80 relative z-10 max-w-2xl rounded-xl border p-md backdrop-blur-md">
        <div className="mb-xs flex items-center gap-sm">
          <StatusChip tone="indigo">NODE: {node}</StatusChip>
          {synced ? (
            <span className="flex items-center gap-xs font-body text-[10px] uppercase tracking-wide text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-brand-teal" /> Synced
            </span>
          ) : null}
        </div>
        <h1 className="mb-sm font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        <p className="mb-md line-clamp-2 font-body text-sm text-muted-foreground">{dek}</p>
        <div className="flex items-center gap-md">
          <Button className="rounded-lg">
            Access Stream <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </Button>
          <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
            <Share2 className="h-3.5 w-3.5" aria-hidden /> {nodes} nodes
          </span>
        </div>
      </div>
    </section>
  );
}
