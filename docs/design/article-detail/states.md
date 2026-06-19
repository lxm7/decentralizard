# Article Detail — states & interactions

> Set: [`design.md`](./design.md) · [`components.md`](./components.md) · `states.md` (this)

## Interaction states
| Element | Rest | Hover | Focus | Active/Selected |
|---|---|---|---|---|
| Nav link | muted | → foreground | ring | active = secondary + 2px indigo underline |
| Connect Wallet | `bg-primary` | `bg-surface-tint` | ring-2 | — |
| Icon buttons (hub/wallet) | foreground | → secondary | ring | — |
| AI Summary button | gradient + glow15 | glow25 | ring | loading (see below) |
| Correlated card | L1 border | L2 shadow + image `scale-105` + title→secondary | ring on `<a>` | — |
| Source row | `bg-surface` border/30 | subtle bg lift | — | — |

## Data states (Data Snapshot panel)
- **Loading:** skeleton rows for sentiment value, sparkline (shimmer bar), source list (2 ghost rows), resonance numbers. Panel frame renders immediately (it's L2 static).
- **Empty / no metrics:** hide sparkline; show "No sentiment data yet" muted; resonance shows `—`.
- **Error (metrics fetch):** inline `error`-tinted note "Metrics unavailable", keep article readable (panel is non-blocking).
- **Sentiment tone → color:** `bull`→success, `bear`→error, `neutral`→warning. Drives sparkline stroke/fill + delta text color + end-dot glow.

## AI Summary flow (`Generate AI Summary`)
1. Rest → click → **loading** (button label "Synthesizing…", spinner, disabled, glow pulse).
2. Success → expand a **L3 glass** summary block above the button (`glass-panel`, `fadeIn`),
   indigo gradient border, `body-md`; button → "Regenerate".
3. Error → button re-enables, `error` toast/inline "Summary failed, retry".
- Uses Claude API server action (model `claude-opus-4-8` for quality, or `claude-haiku-4-5` for
  cheap inline) — see repo Claude API guidance. Stream tokens into the glass block if possible.

## Sticky / scroll behavior
- Aside `sticky top-[100px]`; releases into normal flow at `<lg`.
- TopNav `sticky top-0`; on scroll keep `backdrop-blur` (already glass).
- Code block / wide content: `overflow-x-auto` on mobile (horizontal scroll permitted per system).

## Popularity scaling (DataCard)
Per DESIGN-SYSTEM: padding + headline weight scale +10% per 10k views, cap 130%.
Implement as a clamp in `DataCard`:
```ts
const scale = Math.min(1.3, 1 + Math.floor(views/10_000)*0.1)
// apply to padding (p-md*scale) and title weight/size via class buckets, not inline px, to stay token-safe
```
`featured` cards (≥100k) get the glass "trending_up {views}" L3 badge.

## Animations
- Glass summary + correlated reveal: `fadeIn` keyframe (DESIGN-SYSTEM).
- Card image zoom: `transition-transform duration-500 group-hover:scale-105`.
- Respect `prefers-reduced-motion`: disable scale + pulse, keep opacity fades.

## Accessibility states
- AI button `aria-busy` during loading; summary block `aria-live="polite"` for streamed text.
- Skeletons `aria-hidden`; announce final values once loaded.
- Focus-visible rings on all interactive cards/links (`ring-2 ring-ring`).
