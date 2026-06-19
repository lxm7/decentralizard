# Relational Graph — components

> Set: [`design.md`](./design.md) · `components.md` (this) · [`states.md`](./states.md)
> Reuse/build legend + token bridge: [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md).

## Component tree
```
<GraphPage>                                    NEW  app/(frontend)/graph/page.tsx (server shell)
├─ <TopNav variant="app"/>                     reuse @/components/Header (glass app variant)
├─ <GraphWorkspace>                            NEW  (client, h-screen flex)
│  ├─ <NodeContextPanel node filters>          NEW    @/components/Graph/NodeContextPanel (neo-glass, absolute)
│  │  ├─ <CoreNodeCard node/>                  NEW
│  │  ├─ <TopologicalFilters value onChange>   reuse  @/base/slider ×2 (Sentiment Bias, Citation Depth)
│  │  └─ <NodeLegend classes/>                 NEW
│  ├─ <RelationalGraphCanvas data on…>         NEW    @/components/Graph/RelationalGraphCanvas (d3-force/SVG)
│  │  └─ <CanvasControls zoom onZoom onRecenter> NEW
│  └─ <NodeDirectory groups query>             NEW    @/components/Graph/NodeDirectory (opaque rail)
│     ├─ <SearchInput/>                         reuse  ArticleAnalyser/SearchInput
│     ├─ <NodeGroup label count nodes>          NEW
│     │  └─ <NodeRow address name validity>     NEW
│     └─ <Button>Generate Insights             reuse  @/base/button
└─ <MobileBottomNav active="graph"/>           NEW    @/components/Header/BottomNav (shared w/ Home)
```

## Build / reuse table
| UI element | Source | Action |
|---|---|---|
| Glass top nav | `@/components/Header` + `Header/Nav` | **EXTEND** app/glass variant (shared P3+P4) |
| Neo-glass context panel | DESIGN-SYSTEM `neo-glass` | **NEW** `NodeContextPanel` |
| Core node card / stats | `@/base/card` | **NEW** presentational |
| Topological sliders | `@/base/slider`, `@/components/SliderFilter` | reuse (label + mono value wrapper) |
| Legend | — | **NEW** static (dot + `node-glow*` + label) |
| **Graph canvas** | `d3@7` (force) | **NEW** `RelationalGraphCanvas` — biggest build item |
| Canvas controls | `@/base/button` | **NEW** zoom/recenter pill |
| Node directory + groups/rows | `@/components/Card`, `SearchInput` | **NEW** list + reuse search |
| Validity % chip | shared `<StatusChip>` (from P1/P2) | reuse |
| Generate Insights | `@/base/button` | reuse (solid secondary) |
| Mobile bottom nav | — | **NEW** shared `BottomNav` (also P4) |

## Props / interfaces
```ts
// @/components/Graph/RelationalGraphCanvas.tsx
interface GraphNode {
  id: string; address: string; label: string
  cls: 'primary'|'synthesized'|'commercial'   // indigo | teal | magenta
  influence: number; r?: number               // radius from influence
  x?: number; y?: number                       // d3-force sim positions
}
interface GraphEdge { source: string; target: string; weight: number; dashed?: boolean }
interface GraphData { nodes: GraphNode[]; edges: GraphEdge[]; coreId: string }

interface CanvasProps {
  data: GraphData
  selectedId?: string
  onSelect(id: string): void
  zoom: number; onZoom(z: number): void; onRecenter(): void
  filters: { sentimentBias: [number, number]; citationDepth: number }
}

// @/components/Graph/NodeContextPanel.tsx
interface ContextPanelProps {
  core: GraphNode & { connections: number }
  filters; onFilterChange
  legend: { cls: GraphNode['cls']; label: string }[]
}
// NodeDirectory
interface NodeGroup { label: string; nodes: (GraphNode & { validity: number })[] }
```

## Graph implementation notes
- Use **`d3-force`** (`forceSimulation` + `forceLink`/`forceManyBody`/`forceCenter`) for layout;
  render to **SVG** (simpler a11y/hit-testing) or `<canvas>` (perf at >500 nodes).
- Zoom/pan via `d3-zoom` (replaces the demo's manual `mousedown` scroll handler).
- Node radius ∝ `influence`; color by `cls` → `node-glow*` utilities.
- Selection syncs both ways with `NodeDirectory` (`selectedId`).
- SSR: render directory + panel server-side; canvas is client-only (`'use client'`, dynamic import,
  `ssr:false`) to avoid hydration of d3.

## Data sourcing
- Nodes/edges from a new analyser endpoint (post-to-post relations, citations, sentiment). Could
  derive from Payload `Posts` + `Categories` relationships; `address` is the web3 framing of a post id.
- `validity`/`influence` reuse the same metric fields as Article Detail.

## New dependencies
- `d3-force`, `d3-zoom`, `d3-selection` (all part of installed `d3@7` umbrella — no new install).
- No graph framework needed; avoid heavy `cytoscape`/`react-force-graph` unless node counts grow.
