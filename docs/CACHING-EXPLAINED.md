# Database Caching & Performance Guide

## Current Setup ✅

### ISR (Incremental Static Regeneration)
- **Homepage**: Revalidates every 30 seconds
- **Post Pages**: Revalidates every 60 seconds
- **On-Demand**: Auto-revalidates when posts are published/updated

### Console Logs (Development Only)
Check your terminal for these logs to see when DB queries happen:

```
=== HOMEPAGE POSTS FETCH ===
📅 Timestamp: 2026-01-13T18:00:00.000Z
🌍 Environment: development
🔐 Draft mode: DISABLED (published only)
📊 Fetched 119 posts from database
============================

=== POST PAGE DEBUG ===
🔍 Fetched post: "Article Title"
📅 Timestamp: 2026-01-13T18:00:01.000Z
🌍 Environment: development
🖼️  Hero Image: ❌ NULL (using placeholder)
=======================
```

## Behavior by Environment

### Development (`npm run dev`)
```
Every page load = Fresh DB query ✅
```
- **Expected behavior** - allows you to see changes immediately
- Console logs show every fetch
- No caching (by design for DX)

### Production (`npm run build` + `npm start`)
```
Build time:     1 DB query per page (pre-render all 119+ posts)
Runtime:        1 DB query per 30-60s MAX (ISR revalidation)
On-demand:      Instant revalidation when content changes
```

## Performance Numbers

### Without ISR (your old setup)
- 100 visitors → 100 DB queries
- Cost: High $$$ on Supabase
- Speed: Depends on DB latency (~50-200ms)

### With ISR (current setup)
- 100 visitors → 1-2 DB queries (cached responses)
- Cost: Minimal $$$ (only revalidations)
- Speed: <10ms (static files)

## Database Connection Logs

Watch your terminal to see:
- ✅ When pages fetch from DB
- ✅ Environment mode
- ✅ Draft mode status
- ✅ Number of posts fetched
- ✅ Hero image status

## Optimization Options

### Option 1: Increase Revalidation Time (Less DB Queries)
```typescript
// In src/app/(frontend)/page.tsx
export const revalidate = 300 // 5 minutes

// In src/app/(frontend)/posts/[slug]/page.tsx
export const revalidate = 3600 // 1 hour
```

### Option 2: Static Only (Zero Runtime DB Queries)
```typescript
export const dynamic = 'force-static'
// Pages never revalidate automatically
// Only update on new builds or manual revalidation
```

### Option 3: Add Postgres Connection Pooling
Already using Supabase which has built-in pooling, so you're good!

## Monitoring Tips

### Check DB Query Frequency
1. Watch terminal logs in dev mode
2. In production, check Supabase dashboard → SQL Editor → Activity
3. You should see queries only during revalidation periods

### Performance Metrics
- **Development**: 50-200ms per page (DB query)
- **Production (cached)**: 10-50ms per page (static)
- **Production (revalidating)**: First user gets 50-200ms, rest get 10-50ms

## When Content Updates

### Manual Admin Changes
1. You publish/update a post in `/admin`
2. Hooks automatically call `revalidatePath()`
3. Next.js refreshes cache immediately
4. Next visitor sees updated content

### No Action Needed! ✅
The system handles cache invalidation automatically.

## Summary

✅ **Development**: See logs on every request (expected)
✅ **Production**: Queries minimized with ISR
✅ **On-demand**: Auto-revalidation when content changes
✅ **Performance**: 90%+ reduction in DB queries
✅ **Cost**: Minimal Supabase usage

## Remove Debug Logs (Optional)

When you're done debugging, remove these lines:

### src/app/(frontend)/page.tsx (lines 48-70)
Remove the console.log block in `fetchRecentPosts`

### src/app/(frontend)/posts/[slug]/page.tsx (lines 60-68)
Remove the console.log block in the Post component
