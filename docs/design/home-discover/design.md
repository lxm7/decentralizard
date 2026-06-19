# Home / Discover — design

> Set: `design.md` (this) · [`components.md`](./components.md) · [`states.md`](./states.md)
> Shared tokens/effects/icons: [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md)
> Source: `code.html`, `screen.png` (title: *Nexus Matrix - Home*).

## Purpose
The landing / discovery feed. A glass **hero topology card** (featured node/story) over a Kandinsky
gradient canvas, followed by a **bento content matrix** mixing a large focus story, a live "Pulse
Trends" sparkline stack, and standard verified-research cards. A slide-in left **filter panel**
(AI query + domains + metric sliders) refines the feed.

## Route / placement
The frontend home → `src/app/(frontend)/page.tsx` (or a `discover` route; nav "Discover" active).
Bento extends `@/components/CollectionArchive` + `@/components/Card`; feed = Payload `Posts`.

## Layout anatomy
```
≈ kandinsky-bg (radial indigo/teal gradients) ≈
┌──────────── TopNav (fixed, glass) ─────────────────────────────────────────────┐
│ [tune] Nexus Matrix   Matrix|Discover▸|Graph|Market|Pulse   [bell][grid](SA)    │
├────────────────────────────────────────────────────────────────────────────────┤
│ main (pt-64, pb-80 mobile, max-w-1440)                                           │
│ ┌──────────── HERO topology card (h-400, glass-panel) ───────────────────────┐ │
│ │  ◌ animated nodes + edge (bg)                                               │ │
│ │  ┌ glass inset ┐  [NODE: KAPPA-9] ● SYNCED                                  │ │
│ │  │ H1 "Quantum Entanglement Achieved at Macroscopic Scale"                  │ │
│ │  │ dek (line-clamp-2)                                                       │ │
│ │  │ ( Access Stream → )    share 42.8k nodes                                 │ │
│ │  └───────────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│ ┌── BENTO grid (md:3 / lg:4, auto-rows-220) ─────────────────────────────────┐ │
│ │ [ FOCUS 2×2  (A.I. SENTIENCE, image, idx 0.94) ][ PULSE TRENDS 1×2 ]        │ │
│ │                                                  │  ▸ Fusion Yields +14.2% ⌇ │ │
│ │                                                  │  ▸ Neural Mesh  Stable  ⌇ │ │
│ │                                                  │  ▸ Orbital Debris Crit  ⌇ │ │
│ │ [ Square: CRISPR  (VERIFIED) ][ Square: Graphene (NODE ZETA) ]              │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├────── BottomNav (mobile) Grid·Graph·Pulse·Profile ─────────────────────────────┤
│ ◀ FilterPanel (fixed left, -translate-x-full → slide in via [tune])             │
│   [magic] AI Query… | DOMAINS pills | METRICS sliders | ( Apply Filters )        │
```

## Region detail
| Region | Key specs |
|---|---|
| **Body bg** | `kandinsky-bg` (radial indigo + teal + lilac gradients on `#f7f9fb`). |
| **TopNav** | `fixed top-0 glass`. Left: `tune` filter toggle (secondary tinted) + brand. Center nav (`hidden md:flex`), Discover active. Right: `bell`, `grid_view`, avatar disc "SA". |
| **FilterPanel** | `fixed left-0 h-full w-[300px]`, `bg-surface/95 backdrop-blur-2xl border-r`, `-translate-x-full` default, slides via toggle (`transition-transform duration-400`). Head "Data Filters" + close. **AI Query** input w/ glow halo + `magic_button` (Sparkles). **DOMAINS** pills (Quantum active = secondary; others outline). **METRICS** 3 sliders (Sentiment Index 0.82 / Validity Threshold 94% teal / Impact Scope Global) styled indigo thumb + glow. **Apply Filters** = secondary-container button. |
| **Hero card** | `h-[400px] glass-panel rounded-xl`, bg layer = `animated-node` pulsing dots + faint SVG edge. Inset = `bg-surface/80 backdrop-blur` card: NODE chip (mono, secondary border) + SYNCED dot (teal), `h1` 28→36, dek `line-clamp-2`, **Access Stream** solid `bg-primary` button + `share` 42.8k mono. |
| **Bento — Focus 2×2** | `glass-panel md:col-span-2 md:row-span-2`, bg image `opacity-30→40`, gradient-to-t veil, chip "A.I. SENTIENCE", `hub` connectivity icon, index bar + `INDEX 0.94 Alpha`, `h2` headline, dek `line-clamp-3`. Hover border→secondary/40. |
| **Bento — Pulse Trends 1×2** | `glass-panel`, head "PULSE TRENDS" + `timeline`. 3 trend rows: icon disc (teal `eco` / indigo `psychology` / error `satellite_alt`), title + mono delta (`+14.2% Net` / `Stable Synapse` / `Critical Density`), mini **sparkline** in semantic color. |
| **Bento — Squares ×2** | `bg-surface` cards, icon chip + tag (`VERIFIED` teal / `NODE: ZETA` mono), `body-sm` title + 2-line dek. Hover L2 shadow. |
| **BottomNav** | mobile `md:hidden fixed bottom-0 glass`: Grid / Graph / Pulse / Profile. |

## Responsive reflow
- **Desktop lg:** bento `grid-cols-4`; Focus 2×2, Pulse 1×2, two squares fill row.
- **Tablet md:** `grid-cols-3`; Focus 2×2, Pulse 1×2, squares wrap below.
- **Mobile <md:** `grid-cols-1` (auto-rows relax); hero `h1` 28px; nav center hidden; BottomNav
  shown; FilterPanel = full-height sheet from left, closes on outside click; `pb-80` clears nav.

## Elevation / effects
Hero + Focus + Pulse = **L3** `glass-panel`. Squares = **L1** opaque `bg-surface`. `kandinsky-bg`
page canvas. `animated-node` pulse in hero bg. FilterPanel `backdrop-blur-2xl`. AI Query glow halo.
Sparklines inline. Respect reduced-motion (freeze `animated-node`).

## Accessibility
- `tune` toggle needs `aria-expanded`/`aria-controls` for the panel; panel `role="dialog"` when modal on mobile, focus-trap + `Esc`.
- Domain pills = toggle buttons (`aria-pressed`); single-active or multi (decide — see states).
- Sliders real `<input range>` with value text; Apply commits.
- Bento cards: each a single focusable `<a>`/`<article>` link; tags backed by text not color.
- Maintain one `h1` (hero); bento headings `h2`/`h3`.
