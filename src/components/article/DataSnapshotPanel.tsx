'use client';

import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  FileCheck2,
  Gavel,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import { Button } from '@/base/button';
import { Sparkline, StatusChip, type Tone } from '@/components/nexus';

/**
 * Icon registry — sources pass a serializable string key (RSC-safe), resolved here.
 * Lucide components cannot cross the server→client boundary as props.
 */
const sourceIcons = {
  analytics: ShieldCheck,
  audit: FileCheck2,
  gavel: Gavel,
  verified: BadgeCheck,
} satisfies Record<string, LucideIcon>;

export type SourceIconKey = keyof typeof sourceIcons;

export interface SnapshotSource {
  label: string;
  confidence: number;
  icon: SourceIconKey;
}

export interface DataSnapshotPanelProps {
  sentiment: {
    label: string;
    deltaPct: number;
    tone: 'bull' | 'bear' | 'neutral';
    series: number[];
  };
  sources: SnapshotSource[];
  resonance: { views: string; shares: string };
  /** Optional async summariser (e.g. a Claude server action). Falls back to a canned demo string. */
  onGenerateSummary?: () => Promise<string>;
}

const sentimentMap: Record<'bull' | 'bear' | 'neutral', { tone: Tone; icon: LucideIcon }> = {
  bull: { tone: 'success', icon: TrendingUp },
  bear: { tone: 'error', icon: TrendingDown },
  neutral: { tone: 'warning', icon: TrendingUp },
};

export function DataSnapshotPanel({
  sentiment,
  sources,
  resonance,
  onGenerateSummary,
}: DataSnapshotPanelProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const s = sentimentMap[sentiment.tone];

  async function handleGenerate() {
    setLoading(true);
    try {
      const text = onGenerateSummary
        ? await onGenerateSummary()
        : await new Promise<string>((resolve) =>
            setTimeout(
              () =>
                resolve(
                  'Validator concentration across the top three L2s is the dominant risk vector; sentiment is bearish on sequencer centralisation despite high on-chain validity.'
                ),
              1200
            )
          );
      setSummary(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sticky top-[100px] rounded-2xl border border-border bg-card p-md shadow-[0_4px_20px_oklch(0.3_0.05_270/0.06)]">
      <h2 className="mb-md border-b border-border pb-sm font-display text-xl font-semibold text-foreground">
        Data Snapshot
      </h2>

      <section className="mb-lg">
        <div className="mb-sm flex items-baseline justify-between">
          <SectionLabel>Market Sentiment</SectionLabel>
          <StatusChip tone={s.tone} icon={s.icon}>
            {sentiment.label} {sentiment.deltaPct > 0 ? '+' : ''}
            {sentiment.deltaPct}%
          </StatusChip>
        </div>
        <Sparkline
          series={sentiment.series}
          tone={s.tone}
          width={260}
          height={60}
          className="border-border/60 h-[60px] w-full rounded-lg border bg-muted"
          aria-label={`${sentiment.label} ${sentiment.deltaPct}%`}
        />
      </section>

      <section className="mb-lg">
        <SectionLabel className="mb-sm block">Source Verification</SectionLabel>
        <ul className="space-y-sm">
          {sources.map(({ label, confidence, icon }) => {
            const Icon = sourceIcons[icon];
            return (
              <li
                key={label}
                className="border-border/60 flex items-center gap-sm rounded-lg border bg-background p-sm"
              >
                <span className="border-success/40 bg-success/10 flex h-8 w-8 items-center justify-center rounded-full border text-success">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="block font-body text-sm font-semibold text-foreground">
                    {label}
                  </span>
                  <span className="block font-mono text-[10px] text-muted-foreground">
                    Confidence: {confidence}%
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <SectionLabel className="mb-sm block">Network Resonance</SectionLabel>
        <div className="grid grid-cols-2 gap-sm">
          <Stat value={resonance.views} label="Views" />
          <Stat value={resonance.shares} label="Shares" />
        </div>
      </section>

      <Button
        variant="ai"
        className="mt-lg w-full"
        onClick={handleGenerate}
        disabled={loading}
        aria-busy={loading}
      >
        <Sparkles className="mr-2 h-4 w-4" aria-hidden />
        {loading ? 'Synthesising…' : summary ? 'Regenerate AI Summary' : 'Generate AI Summary'}
      </Button>

      {summary ? (
        <div
          className="glass neo-glass glass-border-gradient animate-nexus-in mt-md p-md"
          aria-live="polite"
        >
          <p className="font-body text-sm leading-relaxed text-foreground">{summary}</p>
        </div>
      ) : null}
    </div>
  );
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`font-body text-[11px] font-semibold uppercase tracking-wide text-muted-foreground ${className ?? ''}`}
    >
      {children}
    </span>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-border/50 flex flex-col items-center justify-center rounded-lg border bg-muted p-sm">
      <span className="font-display text-xl font-bold text-foreground">{value}</span>
      <span className="font-body text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
