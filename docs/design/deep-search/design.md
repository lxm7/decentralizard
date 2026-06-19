# Deep Search Overlay — design

> Set: `design.md` (this) · [`components.md`](./components.md) · [`states.md`](./states.md)
> Shared tokens/effects/icons: [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md)
> Source: `code.html`, `screen.png` (title: *NexusGraph - Deep Search Overlay*).

## Purpose
A global **⌘K command palette** for "deep search" across entities, sentiment and metrics. An L3
glassmorphic spotlight floating over a blurred Discovery-Hub canvas. Left column = results
(suggested clusters + recent synthesis); right rail = deep-search parameters (validity / sentiment
/ source). This is the product's primary intelligence entry point.

## Route / placement
Global overlay, not a page — mount once in `src/app/(frontend)/layout.tsx`, open via `⌘K`/`/`
or a nav trigger. Backs onto the existing `src/app/(frontend)/search` route (full-page fallback /
"Advanced Query Builder" target).

## Layout anatomy
```
░░ fixed inset-0 : blurred hub canvas image (scale-105 blur-[2px] opacity-60) ░░
░░ + fixed inset-0 scrim: bg-primary/5 backdrop-blur-[4px] ░░
        ┌──────────────── modal max-w-[840] mt-[81] (L3 glass, rounded, glass-border-gradient) ──┐
        │ [search 32]  «Search entities, sentiment, or deep metrics…»        [⌘][K] │  ← header, border-b
        ├──────────────────────────── grid [1fr | 280] h-[563] ─────────────────────┤
        │  RESULTS COLUMN (scroll)              │  DEEP SEARCH PARAMETERS (rail)     │
        │  ▸ SUGGESTED CLUSTERS                  │  [tune] Deep Search Parameters     │
        │   (• L2 Scaling)(◆ DeFi)(▪ Inst.)(▲Risk)│  Validity Threshold      ≥85%     │
        │  ▸ RECENT SYNTHESIS                    │   ▰▰▰▰▰▰▱▱  (gradient track+knob)   │
        │   ◉ Bitcoin Accumulation   [98.2%][↑] │  Sentiment Vector                  │
        │     Nexus Institutional · 2h          │   (•) Bullish Bias                 │
        │   ◉ Cross-Chain Bridge Scan [74.5%][↓]│   ( ) Neutral / Absolute           │
        │     Audit Node Alpha                  │   ( ) Bearish Bias                 │
        │                                       │  Data Origin                       │
        │                                       │   Institutional Only      [◯⬤]     │
        ├───────────────────────────────────────┴────────────────────────────────────┤
        │ [keyboard] Use arrow keys to navigate            Advanced Query Builder → │  ← footer bar
        └────────────────────────────────────────────────────────────────────────────┘
```

## Region detail
| Region | Key specs |
|---|---|
| **Scrim + canvas** | bg image fixed, `scale-105 blur-[2px] opacity-60`; scrim `bg-primary/5 backdrop-blur-[4px]`, click-out closes. |
| **Modal shell** | `max-w-[840] mt-[81]`, **L3**: `bg-card/85 backdrop-blur-[20px]`, big soft indigo shadow + 1px white ring, `glass-border-gradient` overlay, `fadeIn` on open. |
| **Search header** | 32px `Search` icon (secondary), borderless `h2` input, placeholder muted/40; `⌘`/`K` kbd chips (`bg-muted` `label-caps`, border). `border-b border-border/20`. |
| **Suggested clusters** | section head `label-caps` uppercase tracking-widest + `scatter_plot` icon. Pills = `rounded-full` border, **Kandinsky geometric markers**: ● circle (indigo), ◆ rotated square (teal), ▪ square (green), ▲ triangle (error). Hover = tinted border+bg. |
| **Recent synthesis** | head + `history` icon. Rows: 40px icon disc (filled), title `body-md` semibold, meta line (icon + source · time). Right: **validity chip** (mono, success-tinted, `fact_check` + %) + **sentiment chip** (Bullish=secondary `↑` / Bearish=error `↓`). Hover row: L indigo bar fades in, border/30 + shadow. |
| **Params rail** | `bg-surface-bright/90`, `border-l`. Head = `tune` + "Deep Search Parameters". **Validity slider**: label + info tooltip, value chip `≥85%`, custom track (gradient fill to thumb, indigo knob w/ shadow). **Sentiment Vector**: 3 radio rows (selected = indigo border+bg+filled radio). **Data Origin**: labelled row + switch (on=secondary). |
| **Footer bar** | `bg-surface-container`, `border-t`, `hidden md:flex`: left `keyboard` hint, right "Advanced Query Builder →" (secondary link). |

## Responsive reflow
- **Desktop/tablet ≥md:** two-column `[1fr_280px]`; footer visible.
- **Mobile <md:** rail drops **below** results (`grid-cols-1`), `border-t` instead of `border-l`;
  footer hidden; modal near full-width with `p-margin-mobile`. Pills wrap. Consider full-screen
  sheet on small phones.

## Elevation / effects
Whole modal = **L3** (`glass-panel` semantics + `glass-border-gradient`) — the canonical
"intelligence overlay". `custom-scrollbar` on both scroll areas. `fadeIn` entrance. Knob shadow
`0 2px 8px indigo/.3`. No opaque surfaces — depth is all blur + translucency.

## Accessibility
- This is a **dialog** → focus trap, `role="dialog" aria-modal`, `Esc` closes, restore focus to trigger.
- Input `autofocus`; arrow keys move a roving `aria-activedescendant` through results.
- Validity slider = real `<input type=range>` semantics (value text, `aria-valuetext="≥ 85%"`).
- Sentiment = radio group (`role=radiogroup`); Data Origin = labelled switch (`aria-checked`).
- Ensure chip color is backed by text (% and Bullish/Bearish words present).
