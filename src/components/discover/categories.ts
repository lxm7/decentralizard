import { cache } from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export type FilterCategory = { title: string; slug: string };

/**
 * The real categories posts belong to, for the search filter chips. Cached per
 * request so the global header can call it on every page without refetching.
 */
export const getFilterCategories = cache(async (): Promise<FilterCategory[]> => {
  const payload = await getPayload({ config: configPromise });
  const res = await payload.find({
    collection: 'categories',
    limit: 100,
    depth: 0,
    sort: 'title',
    overrideAccess: false,
    select: { title: true, slug: true },
  });

  // Dedupe by slug (the dataset has a couple of duplicate titles).
  const seen = new Set<string>();
  const out: FilterCategory[] = [];
  for (const c of res.docs) {
    const slug = c.slug ?? '';
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push({ title: c.title, slug });
  }
  return out;
});
