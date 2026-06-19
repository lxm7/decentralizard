import type { Where } from 'payload';

import type { Post } from '@/payload-types';
import type { Tone } from '@/components/nexus';
import type { BentoCell, Trend } from './BentoMatrix';
import {
  deriveResonance,
  deriveSentimentSeries,
  domainLabel,
  resonancePercentile,
  sentimentIndex,
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
    const idx = sentimentIndex(p);
    cells.push({
      kind: 'research',
      tag: categoryLabel(p),
      title: p.title,
      dek: p.shortDescription ?? '',
      verified,
      node: verified ? undefined : nodeCode(p),
      href: postHref(p),
      index: idx.label,
      indexTone: idx.tone,
      nodes: deriveResonance(p.id).views,
    });
  }

  return cells;
}

/** Every post mapped to a uniform research card — used for the full /posts archive grid. */
export function buildArchiveCells(posts: Post[]): BentoCell[] {
  return posts.map((p) => {
    const verified = (p.validity ?? 0) >= 90;
    const idx = sentimentIndex(p);
    return {
      kind: 'research' as const,
      tag: categoryLabel(p),
      title: p.title,
      dek: p.shortDescription ?? '',
      verified,
      node: verified ? undefined : nodeCode(p),
      href: postHref(p),
      index: idx.label,
      indexTone: idx.tone,
      nodes: deriveResonance(p.id).views,
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
  /** Selected category slugs; empty = all categories. */
  categories: string[];
  /** Free-text query matched against title + short description. */
  query: string;
  /** Minimum normalized sentiment (0 = off → keep all). */
  sentimentMin: number;
  /** Minimum validity 0–100 (0 = off → keep all). */
  validityMin: number;
  /** Minimum network-resonance reach 0–100 (0 = off → keep all). */
  impact: number;
};

export const INITIAL_FILTERS: FilterState = {
  categories: [],
  query: '',
  sentimentMin: 0,
  validityMin: 0,
  impact: 0,
};

/** In-memory filter over the loaded curated feed. Pure — safe on both sides. */
export function filterPosts(posts: Post[], f: FilterState): Post[] {
  const q = f.query.trim().toLowerCase();
  // Map the 0–100 slider onto the signed sentiment score range (-100..100).
  const minScore = f.sentimentMin <= 0 ? -Infinity : (f.sentimentMin / 100) * 200 - 100;

  return posts.filter((p) => {
    if (f.categories.length) {
      const match = (p.categories ?? []).some(
        (c) => typeof c === 'object' && c !== null && !!c.slug && f.categories.includes(c.slug)
      );
      if (!match) return false;
    }
    if ((p.validity ?? 0) < f.validityMin) return false;
    if ((p.sentiment?.score ?? 0) < minScore) return false;
    if (f.impact > 0 && resonancePercentile(p.id) < f.impact) return false;
    if (q && !`${p.title ?? ''} ${p.shortDescription ?? ''}`.toLowerCase().includes(q))
      return false;
    return true;
  });
}

/**
 * Filter, but never strand the feed empty. The numeric sliders (sentiment,
 * validity, impact) gate on fields editors often leave unset, so a strict pass
 * can match nothing. Falls back in steps — drop numeric thresholds, then domain,
 * then everything — keeping the user's text query longest. `relaxed` is true
 * whenever the strict pass came up empty so the UI can flag "closest results".
 */
export function filterPostsWithFallback(
  posts: Post[],
  f: FilterState
): { posts: Post[]; relaxed: boolean } {
  const strict = filterPosts(posts, f);
  if (strict.length) return { posts: strict, relaxed: false };

  const numericOff = filterPosts(posts, { ...f, sentimentMin: 0, validityMin: 0, impact: 0 });
  if (numericOff.length) return { posts: numericOff, relaxed: true };

  const queryOnly = filterPosts(posts, { ...INITIAL_FILTERS, query: f.query });
  if (queryOnly.length) return { posts: queryOnly, relaxed: true };

  return { posts, relaxed: true };
}

// --- Server-side search (RSC) --------------------------------------------
// The DB-backed filters map onto a Payload `Where`; impact is seeded from the
// post id (not a column) so it can't be queried — it's applied post-fetch.

/** Build a Payload `Where` for the filters that map onto real Post columns. */
export function buildPostsWhere(f: FilterState, includeDrafts = false): Where {
  const and: Where[] = includeDrafts ? [] : [{ _status: { equals: 'published' } }];

  const q = f.query.trim();
  if (q) {
    and.push({ or: [{ title: { like: q } }, { shortDescription: { like: q } }] });
  }
  if (f.categories.length) {
    and.push({ 'categories.slug': { in: f.categories } });
  }
  if (f.sentimentMin > 0) {
    // Same 0–100 → signed score mapping the client filter uses.
    and.push({ 'sentiment.score': { greater_than_equal: (f.sentimentMin / 100) * 200 - 100 } });
  }
  if (f.validityMin > 0) {
    and.push({ validity: { greater_than_equal: f.validityMin } });
  }

  return { and };
}

/** Apply the impact gate (resonance percentile from id) to already-fetched docs. */
export function applyImpact(posts: Post[], impact: number): Post[] {
  if (impact <= 0) return posts;
  return posts.filter((p) => resonancePercentile(p.id) >= impact);
}

/** Parse raw URL searchParams into a FilterState. */
export function parseFilters(sp: Record<string, string | string[] | undefined>): FilterState {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const num = (v: string | string[] | undefined) => {
    const n = Number(first(v));
    return Number.isFinite(n) ? n : 0;
  };
  return {
    query: first(sp.q) ?? '',
    categories: sp.category ? (Array.isArray(sp.category) ? sp.category : [sp.category]) : [],
    sentimentMin: num(sp.sentiment),
    validityMin: num(sp.validity),
    impact: num(sp.impact),
  };
}

/** True when any filter is active — drives the results header / dynamic render. */
export function hasActiveFilters(f: FilterState): boolean {
  return Boolean(
    f.query.trim() || f.categories.length || f.sentimentMin || f.validityMin || f.impact
  );
}
