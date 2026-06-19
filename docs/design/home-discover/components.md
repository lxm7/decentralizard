# Home / Discover — components

> Set: [`design.md`](./design.md) · `components.md` (this) · [`states.md`](./states.md)
> Reuse/build legend + token bridge: [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md).

## Component tree
```
<HomePage>                                     app/(frontend)/page.tsx (server)
├─ <TopNav variant="app" onFilter/>            reuse @/components/Header (shared glass nav, P3+P4)
├─ <DiscoverFilterPanel open params>           NEW   @/components/Discover/DiscoverFilterPanel (client, slide-in)
│  ├─ <AiQueryInput/>                          NEW     ── extends ArticleAnalyser/SearchInput (glow + Sparkles)
│  ├─ <DomainPills items value/>               reuse   @/components/CateoryPill (toggle)
│  ├─ <MetricSliders value onChange/>          reuse   @/base/slider ×3 (+ @/components/SliderFilter)
│  └─ <Button>Apply Filters                    reuse   @/base/button
├─ <main kandinsky-bg>
│  ├─ <HeroTopologyCard story/>                NEW   @/components/Discover/HeroTopologyCard (glass + animated-node bg)
│  └─ <BentoMatrix>                            NEW   @/components/Discover/BentoMatrix (extends CollectionArchive)
│     ├─ <FocusCard post/>                     NEW     glass 2×2
│     ├─ <PulseTrendsCard trends/>             NEW     glass 1×2
│     │  └─ <TrendRow/> + <Sparkline/>         reuse   Sparkline from Article Detail (@/components/charts/Sparkline)
│     └─ <ResearchCard post/> ×2               NEW     extends @/components/Card
└─ <MobileBottomNav active="pulse"/>           reuse  @/components/Header/BottomNav (shared P3)
```

## Build / reuse table
| UI element | Source | Action |
|---|---|---|
| Glass app nav + `tune` toggle | `@/components/Header`, `Header/Nav` | **EXTEND** shared app/glass variant (P3+P4); add filter toggle + avatar |
| Slide-in filter panel | `ArticleAnalyser/FilterSidebar` | **EXTEND/REWORK** into off-canvas `DiscoverFilterPanel` |
| AI Query input | `ArticleAnalyser/SearchInput`, `@/base/input` | **EXTEND**: glow halo + `Sparkles` icon |
| Domain pills | `@/components/CateoryPill` | reuse (toggle `aria-pressed`) |
| Metric sliders | `@/base/slider`, `@/components/SliderFilter` | reuse (label + mono value) |
| Hero topology card | `glass-panel` + `animated-node` | **NEW** |
| Bento matrix | `@/components/CollectionArchive` | **EXTEND** to bento spans (`col/row-span`) |
| Focus / research cards | `@/components/Card` | **EXTEND** glass + tag/index variants |
| Pulse trend rows | — | **NEW** + reuse `Sparkline` |
| Sparkline | `@/components/charts/Sparkline` (built in P1) | reuse |
| Mobile bottom nav | `@/components/Header/BottomNav` (built in P3) | reuse |

## Props / interfaces
```ts
// @/components/Discover/HeroTopologyCard.tsx
interface HeroStory {
  node: string; synced: boolean; title: string; dek: string
  href: string; nodes: number              // "42.8k nodes"
}

// @/components/Discover/BentoMatrix.tsx  (variant per cell)
type BentoCell =
  | { kind: 'focus';    post: PostWithMetrics; index: number }       // 2×2 glass
  | { kind: 'pulse';    trends: Trend[] }                            // 1×2 glass
  | { kind: 'research'; post: PostWithMetrics; tag: string; verified?: boolean } // 1×1
interface Trend { label: string; delta: string; tone: 'success'|'secondary'|'error'; icon: LucideIcon; series: number[] }

// @/components/Discover/DiscoverFilterPanel.tsx
interface DiscoverParams {
  query: string
  domains: string[]                         // multi-select (see states)
  sentimentIndex: number                    // 0..100 (0.82)
  validityMin: number                       // 0..100 (94)
  impactScope: 'local'|'regional'|'global'
}
```

## Data sourcing
- Hero = top featured `Post` (by popularity/recency) → `HeroStory`.
- Bento = paginated `Posts` query via existing `CollectionArchive`; cell `kind` decided by
  position/popularity (large = featured, squares = standard).
- Pulse trends = a metrics endpoint (or derived series from `clicks` over time) → `Sparkline`.
- Filters map to the Payload query (category/domain, sentiment/validity new fields).

## New dependencies
None. Sparkline + BottomNav are shared builds from P1/P3. Off-canvas panel = CSS transform
(`-translate-x-full`) like the source; no drawer lib required.
