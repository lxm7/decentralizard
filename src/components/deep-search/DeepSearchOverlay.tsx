'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import {
  ArrowRight,
  BadgeCheck,
  Bitcoin,
  Info,
  Keyboard,
  type LucideIcon,
  Minus,
  Network,
  ScatterChart,
  Search,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import { Slider } from '@/base/slider';
import { Switch } from '@/base/switch';
import { StatusChip, toneColor } from '@/components/nexus';
import { cn } from '@/utilities/ui';

type MarkerTone = 'indigo' | 'teal' | 'success' | 'error';
type Marker = 'circle' | 'diamond' | 'square' | 'triangle';

const CLUSTERS: { label: string; marker: Marker; tone: MarkerTone }[] = [
  { label: 'L2 Scaling Solutions', marker: 'circle', tone: 'indigo' },
  { label: 'DeFi Sentiment', marker: 'diamond', tone: 'teal' },
  { label: 'Institutional Flows', marker: 'square', tone: 'success' },
  { label: 'Risk Anomalies', marker: 'triangle', tone: 'error' },
];

const synthIcons = { bitcoin: Bitcoin, hub: Network } satisfies Record<string, LucideIcon>;

interface SynthResult {
  id: string;
  title: string;
  source: string;
  icon: keyof typeof synthIcons;
  ago?: string;
  validity: number;
  sentiment: 'bull' | 'bear';
}

const RESULTS: SynthResult[] = [
  {
    id: '1',
    title: 'Bitcoin Accumulation Trend',
    source: 'Nexus Institutional',
    icon: 'bitcoin',
    ago: '2h ago',
    validity: 98.2,
    sentiment: 'bull',
  },
  {
    id: '2',
    title: 'Cross-Chain Bridge Vulnerability Scan',
    source: 'Audit Node Alpha',
    icon: 'hub',
    validity: 74.5,
    sentiment: 'bear',
  },
];

const SENTIMENTS = {
  bull: { label: 'Bullish Bias', icon: TrendingUp, tone: 'text-accent-indigo' },
  neutral: { label: 'Neutral / Absolute', icon: Minus, tone: 'text-muted-foreground' },
  bear: { label: 'Bearish Bias', icon: TrendingDown, tone: 'text-error' },
} as const;

export function DeepSearchOverlay({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [validity, setValidity] = useState(85);
  const [sentiment, setSentiment] = useState<keyof typeof SENTIMENTS>('bull');
  const [institutional, setInstitutional] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Deep Search"
      shouldFilter
      loop
      overlayClassName="fixed inset-0 z-50 bg-foreground/5 backdrop-blur-[4px] animate-in fade-in-0"
      contentClassName="glass glass-strong glass-border-gradient fixed left-1/2 top-[81px] z-50 flex w-[calc(100%-2rem)] max-w-[840px] -translate-x-1/2 flex-col overflow-hidden p-0 animate-in fade-in-0 zoom-in-95"
    >
      <div className="border-border/20 flex items-center gap-md border-b px-lg py-md">
        <Search className="h-6 w-6 shrink-0 text-accent-indigo" aria-hidden />
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="Search entities, sentiment, or deep metrics…"
          className="placeholder:text-muted-foreground/50 flex-1 border-0 bg-transparent font-display text-xl text-foreground outline-none"
        />
        <span className="hidden items-center gap-xs sm:flex">
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
            ⌘
          </kbd>
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
            K
          </kbd>
        </span>
      </div>

      <div className="grid h-[480px] grid-cols-1 md:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-lg overflow-y-auto p-lg">
          <section>
            <h3 className="mb-md flex items-center gap-sm font-body text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              <ScatterChart className="h-4 w-4" aria-hidden /> Suggested Clusters
            </h3>
            <div className="flex flex-wrap gap-md">
              {CLUSTERS.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  className="flex items-center gap-sm rounded-full border border-border bg-card px-md py-sm shadow-sm transition-colors hover:border-accent-indigo"
                >
                  <MarkerDot marker={c.marker} tone={c.tone} />
                  <span className="font-body text-sm font-medium text-foreground">{c.label}</span>
                </button>
              ))}
            </div>
          </section>

          <Command.List>
            <Command.Empty className="py-md font-body text-sm text-muted-foreground">
              No synthesis matches — adjust validity or sentiment.
            </Command.Empty>
            <Command.Group
              heading="Recent Synthesis"
              className="[&_[cmdk-group-heading]]:mb-md [&_[cmdk-group-heading]]:flex [&_[cmdk-group-heading]]:items-center [&_[cmdk-group-heading]]:gap-sm [&_[cmdk-group-heading]]:font-body [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-muted-foreground"
            >
              <div className="flex flex-col gap-xs">
                {RESULTS.map((r) => (
                  <SynthRow key={r.id} result={r} onSelect={() => setOpen(false)} />
                ))}
              </div>
            </Command.Group>
          </Command.List>
        </div>

        <aside className="border-border/20 bg-background/60 flex flex-col gap-xl border-t p-lg md:border-l md:border-t-0">
          <div className="border-border/20 flex items-center gap-sm border-b pb-md">
            <SlidersHorizontal className="h-5 w-5 text-accent-indigo" aria-hidden />
            <h2 className="font-body text-base font-semibold text-foreground">
              Deep Search Parameters
            </h2>
          </div>

          <div>
            <div className="mb-md flex items-center justify-between">
              <span className="flex items-center gap-xs font-body text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Validity Threshold
                <Info className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="bg-accent-indigo/10 rounded px-1.5 py-0.5 font-mono text-[11px] text-accent-indigo">
                ≥ {validity}%
              </span>
            </div>
            <Slider
              value={[validity]}
              max={100}
              step={1}
              onValueChange={(v) => setValidity(v[0] ?? 0)}
            />
          </div>

          <div>
            <span className="mb-md block font-body text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Sentiment Vector
            </span>
            <div role="radiogroup" aria-label="Sentiment Vector" className="flex flex-col gap-xs">
              {(Object.keys(SENTIMENTS) as (keyof typeof SENTIMENTS)[]).map((opt) => {
                const meta = SENTIMENTS[opt];
                const Icon = meta.icon;
                const active = sentiment === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSentiment(opt)}
                    className={cn(
                      'flex items-center justify-between rounded border p-sm transition-colors',
                      active
                        ? 'bg-accent-indigo/5 border-accent-indigo'
                        : 'border-transparent hover:border-border hover:bg-muted'
                    )}
                  >
                    <span className="flex items-center gap-sm">
                      <Icon className={cn('h-4 w-4', meta.tone)} aria-hidden />
                      <span className="font-body text-sm text-foreground">{meta.label}</span>
                    </span>
                    <span
                      className={cn(
                        'h-4 w-4 rounded-full border',
                        active ? 'border-[5px] border-accent-indigo' : 'border-border'
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="mb-md block font-body text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Data Origin
            </span>
            <div className="flex items-center justify-between rounded border border-border p-sm">
              <span className="flex flex-col">
                <span className="font-body text-sm font-medium text-foreground">
                  Institutional Only
                </span>
                <span className="font-body text-xs text-muted-foreground">
                  Filter out public chatter
                </span>
              </span>
              <Switch
                checked={institutional}
                onCheckedChange={setInstitutional}
                aria-label="Institutional only"
                className="data-[state=checked]:bg-accent-indigo"
              />
            </div>
          </div>
        </aside>
      </div>

      <div className="border-border/20 bg-muted/50 hidden items-center justify-between border-t px-lg py-sm md:flex">
        <span className="flex items-center gap-xs font-body text-sm text-muted-foreground">
          <Keyboard className="h-4 w-4" aria-hidden /> Use arrow keys to navigate
        </span>
        <button
          type="button"
          className="flex items-center gap-xs font-body text-[11px] font-semibold uppercase tracking-wide text-accent-indigo hover:text-accent-indigo-strong"
        >
          Advanced Query Builder <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </Command.Dialog>
  );
}

function SynthRow({ result, onSelect }: { result: SynthResult; onSelect: () => void }) {
  const Icon = synthIcons[result.icon];
  return (
    <Command.Item
      value={result.title}
      onSelect={onSelect}
      className="bg-card/40 group relative flex cursor-pointer flex-col gap-sm rounded-lg border border-transparent p-md transition-all data-[selected=true]:border-border data-[selected=true]:bg-card data-[selected=true]:shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <span className="absolute left-0 top-0 h-full w-1 rounded-l-lg bg-accent-indigo opacity-0 transition-opacity group-data-[selected=true]:opacity-100" />
      <span className="flex items-start gap-md sm:items-center">
        <span className="bg-accent-indigo/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-accent-indigo">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <span className="flex flex-col">
          <span className="font-body text-base font-semibold text-foreground">{result.title}</span>
          <span className="font-body text-sm text-muted-foreground">
            {result.source}
            {result.ago ? ` · ${result.ago}` : ''}
          </span>
        </span>
      </span>
      <span className="flex items-center gap-sm">
        <StatusChip tone={result.validity >= 85 ? 'success' : 'muted'} icon={BadgeCheck}>
          {result.validity}%
        </StatusChip>
        <StatusChip
          tone={result.sentiment === 'bull' ? 'indigo' : 'error'}
          icon={result.sentiment === 'bull' ? TrendingUp : TrendingDown}
        >
          {result.sentiment === 'bull' ? 'Bullish' : 'Bearish'}
        </StatusChip>
      </span>
    </Command.Item>
  );
}

const markerBg: Record<MarkerTone, string> = {
  indigo: 'bg-accent-indigo',
  teal: 'bg-brand-teal',
  success: 'bg-success',
  error: 'bg-error',
};

function MarkerDot({ marker, tone }: { marker: Marker; tone: MarkerTone }) {
  if (marker === 'triangle') {
    return (
      <span
        aria-hidden
        className="h-0 w-0 border-b-[10px] border-l-[6px] border-r-[6px] border-l-transparent border-r-transparent"
        style={{ borderBottomColor: toneColor(tone) }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        'h-3 w-3',
        markerBg[tone],
        marker === 'circle' && 'rounded-full',
        marker === 'diamond' && 'rotate-45',
        marker === 'square' && 'rounded-sm'
      )}
    />
  );
}
