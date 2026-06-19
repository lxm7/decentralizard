import Image from 'next/image';
import Link from 'next/link';
import {
  Activity,
  BrainCircuit,
  Leaf,
  Microscope,
  Network,
  Satellite,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/utilities/ui';
import { IndexBar, Sparkline, StatusChip, type Tone } from '@/components/nexus';

/** Temporary cover art until per-post media lands. */
const PLACEHOLDER_IMG = '/images/future1.webp';

/** Stretched overlay link so an entire card is clickable without nesting interactive elements. */
function CardLink({ href, label }: { href?: string; label: string }) {
  if (!href) return null;
  return (
    <Link href={href} aria-label={label} className="absolute inset-0 z-20">
      <span className="sr-only">{label}</span>
    </Link>
  );
}

// RSC-safe: trends carry a string key, resolved to a lucide component here.
const trendIcons = {
  fusion: Leaf,
  neural: BrainCircuit,
  orbital: Satellite,
} satisfies Record<string, LucideIcon>;
type TrendIconKey = keyof typeof trendIcons;

const toneRing: Record<Tone, string> = {
  indigo: 'border-accent-indigo/30 bg-accent-indigo/10 text-accent-indigo',
  success: 'border-success/30 bg-success/10 text-success',
  error: 'border-error/30 bg-error/10 text-error',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  teal: 'border-brand-teal/30 bg-brand-teal/10 text-brand-teal',
  magenta: 'border-brand-magenta/30 bg-brand-magenta/10 text-brand-magenta',
  muted: 'border-border bg-muted text-muted-foreground',
};

export interface Trend {
  label: string;
  delta: string;
  tone: Tone;
  icon: TrendIconKey;
  series: number[];
}

export type BentoCell =
  | { kind: 'focus'; tag: string; index: string; title: string; dek: string; href?: string }
  | { kind: 'pulse'; trends: Trend[] }
  | {
      kind: 'research';
      tag: string;
      title: string;
      dek: string;
      verified?: boolean;
      node?: string;
      href?: string;
      index: string;
      indexTone: Tone;
      nodes: string;
    };

export function BentoMatrix({ cells }: { cells: BentoCell[] }) {
  return (
    <section className="grid auto-rows-[220px] grid-cols-1 gap-sm md:grid-cols-3 md:gap-md lg:grid-cols-4">
      {cells.map((cell, i) => {
        if (cell.kind === 'focus') return <FocusCard key={i} {...cell} />;
        if (cell.kind === 'pulse') return <PulseTrendsCard key={i} trends={cell.trends} />;
        return <ResearchCard key={i} {...cell} />;
      })}
    </section>
  );
}

function FocusCard({ tag, index, title, dek, href }: Extract<BentoCell, { kind: 'focus' }>) {
  return (
    <article className="glass group relative flex flex-col justify-between overflow-hidden p-md md:col-span-2 md:row-span-2">
      <CardLink href={href} label={title} />
      <Image
        src={PLACEHOLDER_IMG}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover object-center"
      />
      {/* Scrim keeps overlaid text legible against the cover art. */}
      <div className="via-card/80 to-card/30 absolute inset-0 bg-gradient-to-t from-card" />
      <div className="from-accent-indigo/15 to-brand-magenta/10 absolute inset-0 bg-gradient-to-br via-transparent" />
      <div className="relative flex items-start justify-between">
        <StatusChip tone="indigo">{tag}</StatusChip>
        <span className="bg-background/70 flex h-6 w-6 items-center justify-center rounded-full border border-border">
          <Network className="h-3.5 w-3.5 text-foreground" aria-hidden />
        </span>
      </div>
      <div className="relative">
        <IndexBar label={index} className="mb-xs" />
        <h2 className="mb-xs font-display text-xl font-bold leading-tight text-foreground transition-colors group-hover:text-accent-indigo">
          {title}
        </h2>
        <p className="line-clamp-3 font-body text-[13px] text-muted-foreground">{dek}</p>
      </div>
    </article>
  );
}

function PulseTrendsCard({ trends }: { trends: Trend[] }) {
  return (
    <article className="glass flex flex-col overflow-hidden p-sm md:row-span-2">
      <div className="mb-sm flex items-center justify-between px-xs">
        <span className="font-body text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Pulse Trends
        </span>
        <Activity className="h-4 w-4 text-muted-foreground" aria-hidden />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-sm">
        {trends.map((t) => {
          const Icon = trendIcons[t.icon];
          return (
            <div
              key={t.label}
              className="hover:bg-muted/60 flex items-center gap-sm rounded-lg p-xs transition-colors"
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border',
                  toneRing[t.tone]
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <div className="flex-1">
                <h3 className="font-body text-[13px] font-semibold leading-tight text-foreground">
                  {t.label}
                </h3>
                <div className="font-mono text-[10px] text-muted-foreground">{t.delta}</div>
              </div>
              <Sparkline
                series={t.series}
                tone={t.tone}
                width={48}
                height={24}
                area={false}
                className="h-4 w-12"
              />
            </div>
          );
        })}
      </div>
    </article>
  );
}

function ResearchCard({
  tag,
  title,
  dek,
  verified,
  node,
  href,
  index,
  indexTone,
  nodes,
}: Extract<BentoCell, { kind: 'research' }>) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-[0_4px_20px_oklch(0.3_0.05_270/0.06)]">
      <CardLink href={href} label={title} />
      <div className="relative h-24 w-full shrink-0 overflow-hidden">
        <Image
          src={PLACEHOLDER_IMG}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center"
        />
      </div>
      <div className="flex flex-1 flex-col p-sm">
        <div className="mb-xs flex items-start justify-between">
          <span className="flex items-center gap-xs">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-foreground">
              <Microscope className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">{nodes} nodes</span>
          </span>
          {verified ? (
            <StatusChip tone="success">Verified</StatusChip>
          ) : node ? (
            <span className="font-mono text-[9px] text-muted-foreground">NODE: {node}</span>
          ) : (
            <span className="font-body text-[9px] uppercase tracking-wide text-muted-foreground">
              {tag}
            </span>
          )}
        </div>
        <div className="mt-auto">
          <IndexBar label={index} tone={indexTone} className="mb-xs" />
          <h3 className="mb-1 font-body text-sm font-semibold leading-tight text-foreground">
            {title}
          </h3>
          <p className="line-clamp-2 font-body text-xs text-muted-foreground">{dek}</p>
        </div>
      </div>
    </article>
  );
}
