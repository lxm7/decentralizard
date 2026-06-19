# Article Detail — design

> Set: `design.md` (this) · [`components.md`](./components.md) · [`states.md`](./states.md)
> Shared tokens/effects/icons: [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md)
> Source: `code.html`, `screen.png` (title: *NexusGraph - Article Detail View*).

## Purpose
Long-form article reading view with a persistent **Data Snapshot** intelligence panel. The
editorial canvas (raw content) sits left; synthesized "intelligence" (sentiment, source validity,
resonance, AI summary) sits in an L2 sticky card right. Bottom = correlated articles bento.

## Route / placement
Enhances the existing post detail page → `src/app/(frontend)/posts/[slug]/page.tsx`.
The right panel binds to `PostWithMetrics` (`clicks`, `uniqueClicks`, `clickRate` from
`ArticleAnalyser/types.ts`) + new sentiment/validity fields. Editorial = Payload `richText`.

## Layout anatomy (desktop ≥ lg)
```
┌──────────────────────────────────────────────── TopNav (sticky, glass, h≈64) ──┐
│ NexusGraph   Market | Tech▸ | Validity        [hub][wallet]  ( Connect Wallet ) │
├─────────────────────────────────────────────────────────────────────────────────┤
│  max-w-1440, grid-cols-12, gap-xl, py-xl                                         │
│  ┌── <article> col-span-8 ─────────────┐  ┌── <aside> col-span-4 ────────────┐  │
│  │ Hero header:                        │  │  Data Snapshot (sticky top-100,  │  │
│  │  [Verified Oracle][Published 2h]    │  │   L2 card, border, rounded-xl)   │  │
│  │  H1 title (leading-tight)           │  │  ── Market Sentiment  -12% (err) │  │
│  │  body-lg dek                        │  │     [sparkline 60h, error/30]    │  │
│  │  (avatar) Dr. Elias Vance · role    │  │  ── Source Verification          │  │
│  │ Hero image 400h rounded-xl          │  │     • On-Chain Analytics 99.2%   │  │
│  │   └ caption chip (glass, mono)      │  │     • Smart Contract Audit 96.5% │  │
│  │ Body: p / H2 / pullquote / code /p  │  │  ── Network Resonance (2-col)    │  │
│  │  - pullquote: L indigo bar + quote  │  │     [Views 42.8k][Shares 1,204]  │  │
│  │  - code: dark primary-container mono│  │  ( Generate AI Summary ) gradient│  │
│  └─────────────────────────────────────┘  └──────────────────────────────────┘  │
├──────── Correlated Intelligence (border-t, py-xxl) ─────────────────────────────┤
│  grid md:3 → [ large 2-col card • glass "120k Views" badge ][ standard card ]    │
├──────────────────────────── Footer (surface, border-t) ─────────────────────────┤
```

## Region detail
| Region | Key specs |
|---|---|
| **TopNav** | `sticky top-0 z-50`, `bg-card/80 backdrop-blur-xl`, `border-b border-border/30`, shadow-sm. Brand = `h2` bold. Active link = secondary text + 2px indigo underline. CTA = solid `bg-primary` pill `rounded-full`. |
| **Hero header** | chips: "Verified Oracle" = success-tinted (`bg-success/20`, success-container text, success border); date = muted. Title = `h1-mobile md:h1`. Dek = `body-lg muted`. Author = 32px avatar (border) + name(semibold)·role(muted). |
| **Hero image** | `h-[400px] rounded-xl` + 1px border/30; bottom-right caption chip = glass + `data-mono`. |
| **Body** | prose: `body-md` on-surface, `space-y-md`, leading-relaxed. H2 = `h2` with `pt-lg pb-sm`. **Pullquote**: `bg-muted` `rounded-lg p-lg`, 1px L indigo bar (`w-1 h-full bg-secondary`), faint `Quote` icon top-right, italic `body-lg`. **Code block**: `bg-neutral-900 text-on-primary-container p-md rounded-lg`, `data-mono`, `overflow-x-auto`. |
| **Data Snapshot** (aside) | L1/L2 card `sticky top-[100px]`. Section heads = `h2` w/ bottom border. Sentiment row: `label-caps` + mono value (error). Sparkline = 60px area+line in semantic color (here error) + glowing end dot. Source nodes = list rows (icon disc + name + mono confidence). Resonance = 2-col mini-stat cards (icon, `h2` value, `label-caps`). CTA = **AI gradient** button (indigo→purple, glow). |
| **Correlated** | bento `grid md:grid-cols-3 gap-md`. Large card `md:col-span-2`, horizontal split, glass "trending_up 120k Views" badge (L3). Standard card vertical, footer "45k Views / Read". Cards: hover shadow L2, image `group-hover:scale-105`. |
| **Footer** | `bg-surface border-t`, brand + copy + 3 links. |

## Responsive reflow
- **Desktop ≥lg:** 8/4 split; aside sticky. Nav links inline.
- **Tablet md:** grid collapses to 1 col → article then Data Snapshot (no longer sticky, full width); Correlated stays 3-col→ large card stacks vertical. Nav links still inline (`hidden md:flex`).
- **Mobile <md:** single column; `h1-mobile`; nav links hidden (needs menu — see components.md NEW); hero 400→auto; code/tables horizontal scroll; Correlated → 1 col.

## Elevation / effects used (see DESIGN-SYSTEM § Effects)
glass top nav · caption + "120k" badge = **L3** `glass-panel`/backdrop-blur · Data Snapshot = **L2** soft shadow · AI Summary button = indigo→purple gradient + glow · code block = `bg-neutral-900`.

## Accessibility
- Icon-only nav buttons (`hub`, `wallet`) need `aria-label` (present in HTML).
- Sparkline is decorative → expose the numeric value (`Bearish -12%`) as the accessible label.
- Confidence %s are real data → render as text, not color alone.
- Maintain heading order: one `h1`, section `h2`s; aside heads should be `h2`/`h3` not skipped.
- AI gradient button: ensure `on-primary` text ≥ 4.5:1 over the mid-gradient stop.
