# Deep Search Overlay — components

> Set: [`design.md`](./design.md) · `components.md` (this) · [`states.md`](./states.md)
> Reuse/build legend + token bridge: [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md).

## Component tree
```
<DeepSearchOverlay open onOpenChange>          NEW  @/components/DeepSearch/ (client, mounted in layout)
├─ <Dialog>                                    reuse Radix Dialog (add @radix-ui/react-dialog) OR cmdk <Command.Dialog>
│  ├─ <Backdrop blurredHubImage/>              NEW    fixed canvas + scrim
│  └─ <CommandPalette> (glass shell)           NEW
│     ├─ <SearchHeader value onChange kbd>      NEW   ── extends ArticleAnalyser/SearchInput
│     ├─ <main grid[1fr_280]>
│     │  ├─ <ResultsColumn>                     NEW
│     │  │  ├─ <ClusterPills items>            NEW    ── extends CateoryPill (geometric markers)
│     │  │  └─ <SynthesisList rows>            NEW
│     │  │     └─ <SynthesisRow>+<ValidityChip>+<SentimentChip>  NEW
│     │  └─ <DeepSearchParams>                  NEW
│     │     ├─ <ValiditySlider value>          reuse @/base/slider (+ @/components/SliderFilter)
│     │     ├─ <SentimentVector value>         reuse @/base + Radix RadioGroup
│     │     └─ <DataOriginToggle checked>      reuse @/base/switch
│     └─ <FooterBar/>                           NEW
```

## Build / reuse table
| UI element | Source | Action |
|---|---|---|
| Dialog / focus trap | `cmdk` (DECIDED) | **ADD DEP** `cmdk` — `Command.Dialog` = focus trap + built-in ↑/↓/Enter list nav |
| Blurred hub backdrop | — | **NEW** `Backdrop` (bg image + scrim) |
| Glass shell | DESIGN-SYSTEM `.glass-strong` + `glass-border-gradient` (iOS material) | **NEW** wrapper |
| Search input + kbd | `ArticleAnalyser/SearchInput`, `@/base/input` | **EXTEND**: large variant + `⌘K` chips |
| Cluster pills (geometric) | `@/components/CateoryPill` | **EXTEND**: `marker: circle\|diamond\|square\|triangle` + color |
| Synthesis rows | `@/components/Card` | **NEW** `SynthesisRow` presentational |
| Validity / sentiment chips | `@/components/CateoryPill` | **EXTEND**: shared `<StatusChip tone icon>` (also used in Article Detail) |
| Validity slider | `@/base/slider`, `@/components/SliderFilter` | reuse; wrap with value chip + info tooltip |
| Sentiment radio group | Radix RadioGroup | **NEW** (no existing radio in `@/base`) — add `@/base/radio-group` |
| Data Origin switch | `@/base/switch` | reuse |
| Footer bar | — | **NEW** static |

## Props / interfaces
```ts
// @/components/DeepSearch/DeepSearchOverlay.tsx
interface DeepSearchProps {
  open: boolean; onOpenChange(o: boolean): void
  onSubmit(q: string, params: DeepSearchParams): void
}
interface DeepSearchParams {
  validityMin: number               // 0..100, default 85
  sentiment: 'bull'|'neutral'|'bear'
  institutionalOnly: boolean
}
interface ClusterPill { label: string; marker: 'circle'|'diamond'|'square'|'triangle'; tone: 'secondary'|'success'|'tertiary'|'error' }
interface SynthesisResult {
  id: string; title: string; source: string; icon: LucideIcon; ago: string
  validity: number; sentiment: 'bull'|'bear'|'neutral'
}
// shared chip (also Article Detail / Home)
interface StatusChipProps { tone: 'success'|'error'|'warning'|'secondary'|'muted'; icon?: LucideIcon; children: ReactNode }
```

## Data sourcing
- Query + params → hit `src/app/(frontend)/search` API (Payload search) with filters; map results to
  `SynthesisResult`. Validity/sentiment from same new Post fields as Article Detail.
- Clusters = top categories (`@/collections/Categories`) or curated.
- Recent = user history (local/session) or recent posts.

## New dependencies
- **`cmdk`** (DECIDED — `yarn add cmdk`) — `Command.Dialog` palette + keyboard nav, glass-skinned.
- **`@/base/radio-group`** (shadcn add) for Sentiment Vector.
- Tooltip for the validity "info" icon → `@radix-ui/react-tooltip` (add) or simple `title`.
