import Link from 'next/link';
import { ArrowRight, Share2 } from 'lucide-react';

import { Button } from '@/base/button';
import { StatusChip } from '@/components/nexus';
import { TopologyBackdrop } from './TopologyBackdrop';

export interface HeroTopologyCardProps {
  node: string;
  synced?: boolean;
  title: string;
  dek: string;
  nodes: string;
  /** Link target for the featured article (omit in static previews). */
  href?: string;
}

/** Featured glass hero with an animated topology backdrop. */
export function HeroTopologyCard({ node, synced, title, dek, nodes, href }: HeroTopologyCardProps) {
  return (
    <section className="glass relative flex h-[400px] min-h-[300px] flex-col justify-end overflow-hidden p-md">
      <TopologyBackdrop />

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
          {href ? (
            <Button asChild className="rounded-lg">
              <Link href={href}>
                Access Stream <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          ) : (
            <Button className="rounded-lg">
              Access Stream <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
            </Button>
          )}
          <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
            <Share2 className="h-3.5 w-3.5" aria-hidden /> {nodes} nodes
          </span>
        </div>
      </div>
    </section>
  );
}
