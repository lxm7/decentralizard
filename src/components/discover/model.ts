import type { Post } from '@/payload-types';
import type { Tone } from '@/components/nexus';
import type { BentoCell, Trend } from './BentoMatrix';
import {
  deriveResonance,
  deriveSentimentSeries,
  domainLabel,
  sentimentLabel,
} from '@/utilities/postMetrics';

// --- Post → discover-cell mapping ----------------------------------------

export function postHref(post: Post): string | undefined {
  return post.slug ? `/posts/${post.slug}` : undefined;
}

function categoryLabel(post: Post): string {
  if (post.domain) return domainLabel(post.domain);
  const first = post.categories?.[0];
  return typeof first === 'object' && first?.title ? first.title : 'Intelligence';
}

function nodeCode(post: Post): string {
  if (post.domain)
    return post.domain
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 4)
      .toUpperCase();
  return `N-${post.id}`;
}

function focusIndex(post: Post): string {
  if (typeof post.validity === 'number') return `${(post.validity / 100).toFixed(2)} Validity`;
  const score = post.sentiment?.score ?? 0;
  return `${sentimentLabel(post.sentiment?.label)} ${score > 0 ? '+' : ''}${score}%`;
}

const PULSE_ICONS = ['fusion', 'neural', 'orbital'] as const;
const PULSE_TONES: Tone[] = ['success', 'indigo', 'error'];

/** Derive the "Pulse Trends" widget from the most active domains across posts. */
function buildPulse(posts: Post[]): Trend[] {
  const counts = new Map<string, number>();
  for (const p of posts) {
    if (p.domain) counts.set(p.domain, (counts.get(p.domain) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  return top.map(([domain, count], i) => ({
    label: domainLabel(domain),
    delta: `${count} active ${count === 1 ? 'signal' : 'signals'}`,
    tone: PULSE_TONES[i % PULSE_TONES.length],
    icon: PULSE_ICONS[i % PULSE_ICONS.length],
    series: deriveSentimentSeries(domain.length * 7 + count, count),
  }));
}

/** Research cards shown on the curated front (excludes hero + focus + pulse). */
const FRONT_RESEARCH_LIMIT = 9;

export function buildCells(rest: Post[], all: Post[]): BentoCell[] {
  const cells: BentoCell[] = [];
  const [focus, ...researchAll] = rest;
  const research = researchAll.slice(0, FRONT_RESEARCH_LIMIT);

  if (focus) {
    cells.push({
      kind: 'focus',
      tag: categoryLabel(focus),
      index: focusIndex(focus),
      title: focus.title,
      dek: focus.shortDescription ?? '',
      href: postHref(focus),
    });
  }

  const pulse = buildPulse(all);
  if (pulse.length > 0) cells.push({ kind: 'pulse', trends: pulse });

  for (const p of research) {
    const verified = (p.validity ?? 0) >= 90;
    cells.push({
      kind: 'research',
      tag: categoryLabel(p),
      title: p.title,
      dek: p.shortDescription ?? '',
      verified,
      node: verified ? undefined : nodeCode(p),
      href: postHref(p),
    });
  }

  return cells;
}

/** Every post mapped to a uniform research card — used for the full /posts archive grid. */
export function buildArchiveCells(posts: Post[]): BentoCell[] {
  return posts.map((p) => {
    const verified = (p.validity ?? 0) >= 90;
    return {
      kind: 'research' as const,
      tag: categoryLabel(p),
      title: p.title,
      dek: p.shortDescription ?? '',
      verified,
      node: verified ? undefined : nodeCode(p),
      href: postHref(p),
    };
  });
}

/** Props for the featured HeroTopologyCard, derived from a single post. */
export function buildHero(post: Post) {
  return {
    node: nodeCode(post),
    synced: (post.validity ?? 0) >= 90,
    title: post.title,
    dek: post.shortDescription ?? '',
    nodes: deriveResonance(post.id).views,
    href: postHref(post),
  };
}

// --- Filtering -----------------------------------------------------------

export type FilterState = {
  /** Selected domain enum values; empty = all domains. */
  domains: string[];
  /** Free-text query matched against title + short description. */
  query: string;
  /** Minimum normalized sentiment (0 = off → keep all). */
  sentimentMin: number;
  /** Minimum validity 0–100 (0 = off → keep all). */
  validityMin: number;
  /** Impact scope 0–100. Presentation-only for now (no backing field). */
  impact: number;
};

export const INITIAL_FILTERS: FilterState = {
  domains: [],
  query: '',
  sentimentMin: 0,
  validityMin: 0,
  impact: 100,
};

/** In-memory filter over the loaded curated feed. Pure — safe on both sides. */
export function filterPosts(posts: Post[], f: FilterState): Post[] {
  const q = f.query.trim().toLowerCase();
  // Map the 0–100 slider onto the signed sentiment score range (-100..100).
  const minScore = f.sentimentMin <= 0 ? -Infinity : (f.sentimentMin / 100) * 200 - 100;

  return posts.filter((p) => {
    if (f.domains.length && !(p.domain && f.domains.includes(p.domain))) return false;
    if ((p.validity ?? 0) < f.validityMin) return false;
    if ((p.sentiment?.score ?? 0) < minScore) return false;
    if (q && !`${p.title ?? ''} ${p.shortDescription ?? ''}`.toLowerCase().includes(q))
      return false;
    return true;
  });
}
