# Article Detail — components

> Set: [`design.md`](./design.md) · `components.md` (this) · [`states.md`](./states.md)
> Reuse/build legend + token bridge: [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md).

## Component tree
```
<ArticlePage>                                    posts/[slug]/page.tsx (server)
├─ <TopNav variant="article"/>            NEW    (glass)               ── reuse Header shell
├─ <main grid-12>
│  ├─ <ArticleCanvas post>                NEW    @/components/Article/ArticleCanvas
│  │  ├─ <ArticleHero post>               NEW      ├ StatusChip ×n, Avatar, RichText dek
│  │  ├─ <MediaFigure caption>            reuse     @/components/Media + caption chip
│  │  └─ <RichText content>               reuse     @/components/RichText
│  │     └─ pullquote + Code block        reuse     @/blocks/Code (dark mono)
│  └─ <DataSnapshotPanel metrics>         NEW    @/components/Article/DataSnapshotPanel (client, sticky)
│     ├─ <SentimentSparkline value tone>  NEW      d3-shaped mini SVG
│     ├─ <SourceVerificationList nodes>   NEW
│     ├─ <ResonanceStats views shares>    NEW
│     └─ <Button variant="ai">Generate…   NEW      AI gradient variant of @/base/button
├─ <CorrelatedGrid posts>                 NEW    @/components/Article/CorrelatedGrid
│  └─ <DataCard scale popularity>         NEW    (extends @/components/Card)
└─ <Footer/>                              reuse  src/Footer/Component
```

## Build / reuse table
| UI element | Source | Action |
|---|---|---|
| Glass top nav | `@/components/Header` + `Header/Nav` | **EXTEND**: add `variant="article"` glass style, `hub`/`wallet`/Connect Wallet actions |
| Status chips ("Verified Oracle", category) | `@/components/CateoryPill` | **EXTEND**: add `tone` (success/neutral/error) for validity chips |
| Author avatar | `@/components/Media` | reuse |
| Article body | `@/components/RichText` (Lexical) | reuse; ensure prose maps `h2`, pullquote, code |
| Code block | `@/blocks/Code/Component` | reuse (already dark + copy button) |
| **DataSnapshotPanel** | — | **NEW** `@/components/Article/DataSnapshotPanel.tsx` (client; sticky; subscribes metrics) |
| **SentimentSparkline** | `d3@7` | **NEW** `@/components/charts/Sparkline.tsx` |
| Source rows / resonance stats | `@/base/card` | **NEW** small presentational subcomponents |
| AI Summary button | `@/base/button` | **NEW** `variant: 'ai'` (indigo→purple gradient, glow) in `buttonVariants` |
| Correlated bento + scaling card | `@/components/Card` | **NEW** `DataCard` with popularity scaling |
| Footer | `src/Footer/Component` | reuse |

## Props / interfaces
```ts
// @/components/Article/DataSnapshotPanel.tsx
interface DataSnapshotProps {
  sentiment: { label: string; deltaPct: number; tone: 'bull'|'bear'|'neutral'; series: number[] }
  sources: { label: string; confidence: number; icon: LucideIcon; verified: boolean }[]
  resonance: { views: number; shares: number }
  onGenerateSummary: () => void   // → states.md (AI summary flow)
}

// @/components/charts/Sparkline.tsx  (reused on Home/Pulse too)
interface SparklineProps { series: number[]; tone: 'success'|'error'|'warning'|'secondary'; height?: number; area?: boolean }

// @/components/Article/CorrelatedGrid.tsx
interface CorrelatedCard { post: PostWithMetrics; featured?: boolean }  // featured ⇒ col-span-2 + glass views badge

// @/base/button buttonVariants — add:
//   ai: 'bg-gradient-to-r from-[--accent-indigo] to-[#8b5cf6] text-primary-foreground shadow-[0_0_15px_…] hover:shadow-[0_0_25px_…]'
```

## Data sourcing
- `post` + `clicks/uniqueClicks/clickRate` → `PostWithMetrics` (`ArticleAnalyser/types.ts`).
- `views/shares` → resonance (map `clicks`→views or add Payload fields).
- `sentiment`, `sources[].confidence` → **new Payload fields** on `Posts` collection (or derived
  by an analyser endpoint). Flag to add: `sentimentScore:number`, `sources: array{label,confidence}`.
- `Correlated` → existing `@/blocks/RelatedPosts` query, sorted by popularity.

## New dependencies
None required (`d3@7`, `lucide-react` present). Sparkline can be hand-rolled SVG or `d3-shape`.
