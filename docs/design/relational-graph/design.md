# Relational Graph — design

> Set: `design.md` (this) · [`components.md`](./components.md) · [`states.md`](./states.md)
> Shared tokens/effects/icons: [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md)
> Source: `code.html`, `screen.png` (title: *Nexus Futurism Hub - Relational Graph*).

## Purpose
A full-viewport **knowledge / relational graph** explorer. Center = interactive node canvas
(pan/zoom). Left = a floating neo-glass context+filter panel for the focused node. Right = an
opaque "Node Directory" list grouped by cluster. The visual analogue of the Deep Search overlay:
where search is textual, this is spatial.

## Route / placement
**NEW** full-page route `src/app/(frontend)/graph/page.tsx` (the "Graph" nav item, already present
in Home/Discover nav). `h-screen` app shell, no page scroll — the canvas owns gestures. Reuses
`d3@7` (already used by `ArticleAnalyser/ArticleTreeMap`).

## Layout anatomy
```
┌──────────── TopNav (fixed, glass, h≈72) ──────────────────────────────────────┐
│ Nexus Matrix     Discover | Graph▸ | Market | Pulse        [bell][grid][user]  │
├────────────────────────────────────────────────────────────────────────────────┤
│ main (flex, mt-72, h-screen)                                                    │
│ ┌─ LEFT (w-80, absolute, neo-glass, pointer-events none→panel auto) ─┐         │
│ │ Quantum Substrate                                      [hub]        │         │
│ │ ┌ Core Node  (0xQ…A9B)                                   ┐          │   ┌───────────────┐
│ │ │ memory   Connections 142   Influence 94.2%             │          │   │ Node Directory│
│ │ └────────────────────────────────────────────────────────┘          │   │ [search…]     │
│ │ Topological Filters                                                  │   │ CLUSTER ALPHA │
│ │  Sentiment Bias   0.4–1.0  ▰▰▰▱                                      │   │  0xQ…A9B 94.2%│
│ │  Citation Depth   Lvl 3    ▰▰▱                                       │   │  0x7…E4D 12.4%│
│ │ Node Classification (legend)                                         │   │ CLUSTER BETA  │
│ │  ● Primary  ● Synthesized(cyan)  ● Commercial(magenta)               │   │  0x2…C08 8.9% │
│ └──────────────────────────────────────────────────────────────────────┘   │  ( Generate   │
│             ╲   CANVAS (flex-1, bg image opacity-20)   ╱                     │    Insights ) │
│              core●  ─edges─  orbit○ ◇ ○   scattered ○ ○                      └───────────────┘
│                       [zoom-][100%][zoom+] | [focus]   ← canvas controls (bottom-center, glass)│
├──────────── BottomNav (mobile only, glass) Grid·Graph·Pulse·Profile ───────────┤
```

## Region detail
| Region | Key specs |
|---|---|
| **TopNav** | `fixed top-0 z-50 bg-surface/80 backdrop-blur-xl border-b`. Brand `h2` tight. Active "Graph" = secondary + 2px underline. Right = 3 icon buttons (`bell`/`grid_view`/`person`), `rounded-full` hover bg. |
| **Left panel** | `w-80 absolute left-0`, wrapper `pointer-events-none`, inner `neo-glass rounded-xl pointer-events-auto`, scrollable. Head "Quantum Substrate" + `hub`. **Core Node card** (L1 white): 32px disc (`memory`/Cpu) + label-caps + mono address; 2-col stats (Connections / Influence in secondary). **Filters**: 2 range sliders (`accent-secondary`) with label + mono value. **Legend**: 3 dot rows with `node-glow` color (indigo / cyan→teal / fuchsia→magenta). |
| **Canvas** | `flex-1 relative bg-surface-bright`. Bg image `opacity-20 object-cover pointer-events-none`. `#graph-container` drag-to-pan (mouse handlers). Nodes: **core** 96px (indigo ring + `node-glow`, inner 64px filled w/ `memory`), **orbit** 40–64px (teal/magenta/indigo, glow, `hover:scale-110`), **scattered** 24–40px faint. **Edges** = SVG `<line>` indigo, varying width/opacity, some dashed. |
| **Canvas controls** | bottom-center pill, `bg-card/90 backdrop-blur` border: `zoom_out` · `100%` mono · `zoom_in` · divider · `filter_center_focus` (recenter). |
| **Right panel** | `w-[360px] bg-card border-l` (opaque — it's a directory, not intelligence). Header: `h2` "Node Directory" + search input (`focus:border-secondary ring`). Body: grouped lists ("CLUSTER ALPHA (Primary) — 14 Nodes"), rows = L1 cards (L accent bar on focused), mono address + `body-sm` name + validity % chip. Footer: solid `Generate Insights` secondary button. |
| **BottomNav** | mobile only `lg:hidden fixed bottom-0 glass`: Grid / **Graph**(active, raised secondary pill) / Pulse / Profile. |

## Responsive reflow
- **Desktop ≥lg:** left overlay + canvas + right directory all visible; bottom nav hidden.
- **Tablet md:** right directory may become a toggqulable drawer; left panel narrows; canvas keeps focus.
- **Mobile <lg:** canvas full-bleed; left + right panels become **bottom sheets / drawers** opened
  from BottomNav (Graph active); controls stay bottom-center above the nav. Touch = pan/pinch-zoom.

## Elevation / effects
Left panel = **L3** `neo-glass`. Node glows = `node-glow` / `-cyan` / `-magenta`. Canvas controls
= glass pill. Right directory = **L1 opaque** (intentionally *not* glass — static data). Core node
optional `pulse-node`. Edges = low-opacity indigo strokes.

## Accessibility
- Graph is inherently visual → provide the **Node Directory as the accessible equivalent**
  (keyboard-navigable list mirrors canvas selection).
- Canvas controls = real buttons with `aria-label` (Zoom in/out, Recenter, zoom %).
- Respect `prefers-reduced-motion`: disable `pulse-node`, keep static glows.
- Legend conveys node class by color **and** text label (don't rely on color alone).
- Provide focus ring + `aria-pressed` on selected directory node; sync canvas highlight.
