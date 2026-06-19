import type { Post } from '@/payload-types';
import type { Tone } from '@/components/nexus/tone';

/**
 * Deterministic derivation of presentation-only metrics (traffic resonance,
 * sentiment sparkline) from a post's id. No analytics backend exists yet, so
 * these are seeded — consistent across SSR/client — rather than fabricated by
 * editors. Curated intel (sentiment label/score, validity, sources, domain)
 * lives in Payload; only the "noise" stats are derived here.
 *
 * Mirrors `seededRandom` in ArticleAnalyser/utils but kept dependency-free so
 * it is safe to import on the server (that module pulls in d3).
 */
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const postSeed = (id: Post['id']): number =>
  typeof id === 'number' ? id : parseInt(String(id), 10) || 0;

/** 1234 → "1,234"; 42800 → "42.8k"; 1_200_000 → "1.2M". */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${+(n / 1000).toFixed(1)}k`;
  return n.toLocaleString('en-US');
}

/**
 * Deterministic 0–100 reach percentile from the same seed that drives
 * `deriveResonance` views — lets the Impact Scope filter rank posts by network
 * resonance without a backing editorial field.
 */
export function resonancePercentile(id: Post['id']): number {
  return Math.round(seededRandom(postSeed(id)) * 100);
}

/** Seeded views/shares for the Network Resonance block. */
export function deriveResonance(id: Post['id']): { views: string; shares: string } {
  const seed = postSeed(id);
  const views = Math.floor(seededRandom(seed) * 90_000) + 5_000;
  const shares = Math.floor(views * (0.02 + seededRandom(seed + 1) * 0.03));
  return { views: formatCompact(views), shares: formatCompact(shares) };
}

/**
 * Seeded 8-point sparkline biased by the sentiment score's sign/magnitude so
 * the curve visually agrees with the chip (bullish trends up, bearish down).
 */
export function deriveSentimentSeries(id: Post['id'], score = 0): number[] {
  const seed = postSeed(id);
  const drift = Math.max(-1, Math.min(1, score / 20));
  return Array.from({ length: 8 }, (_, i) => {
    const base = 10 + i * drift * 1.5;
    const jitter = (seededRandom(seed + i) - 0.5) * 6;
    return +Math.max(2, base + jitter).toFixed(1);
  });
}

export type SentimentTone = 'bull' | 'bear' | 'neutral';

/** Map the editorial sentiment label to the DataSnapshotPanel tone literal. */
export function sentimentTone(label?: string | null): SentimentTone {
  if (label === 'bullish') return 'bull';
  if (label === 'bearish') return 'bear';
  return 'neutral';
}

/** Human label for the sentiment chip ("Bullish" / "Bearish" / "Neutral"). */
export function sentimentLabel(label?: string | null): string {
  const v = label ?? 'neutral';
  return v.charAt(0).toUpperCase() + v.slice(1);
}

/** Map sentiment direction to a design tone for the INDEX bar colour. */
const SENTIMENT_BAR_TONE: Record<SentimentTone, Tone> = {
  bull: 'teal',
  bear: 'magenta',
  neutral: 'indigo',
};

/**
 * The "INDEX" marker for a post: a "<Sentiment> <±score>%" label plus the tone
 * that colours its bar. Shared by the featured card, research cards and the
 * article hero so they read consistently.
 */
export function sentimentIndex(post: Post): { label: string; tone: Tone } {
  const score = post.sentiment?.score ?? 0;
  const sign = score > 0 ? '+' : '';
  return {
    label: `${sentimentLabel(post.sentiment?.label)} ${sign}${score}%`,
    tone: SENTIMENT_BAR_TONE[sentimentTone(post.sentiment?.label)],
  };
}

/** Display labels for the `domain` select values. */
export const DOMAIN_LABELS: Record<string, string> = {
  'layer-2': 'Layer 2',
  defi: 'DeFi',
  mev: 'MEV',
  infrastructure: 'Infrastructure',
  governance: 'Governance',
  security: 'Security',
  markets: 'Markets',
};

export const domainLabel = (value?: string | null): string =>
  (value && DOMAIN_LABELS[value]) || 'Intelligence';
