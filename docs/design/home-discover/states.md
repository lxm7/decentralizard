# Home / Discover — states & interactions

> Set: [`design.md`](./design.md) · [`components.md`](./components.md) · `states.md` (this)

## Filter panel (off-canvas)
- **Closed (default):** `-translate-x-full`. **Open:** `tune` toggle → `translate-x-0`
  (`transition-transform duration-400 ease-in-out`). Close via `X`, outside click, or `Esc`.
  Source already wires `filter-toggle`/`filter-close` + outside-click — port to React state.
- **Desktop:** overlays content (doesn't push); **Mobile:** full-height sheet, focus-trapped, body scroll lock.
- `aria-expanded` on toggle, `aria-controls` → panel id.

## Interaction states
| Element | Rest | Hover | Focus | Active/Selected |
|---|---|---|---|---|
| Nav link | muted | →foreground | ring | Discover = secondary + underline |
| `tune` toggle | secondary tint | bg/20 | ring | `aria-expanded` when open |
| Domain pill | outline `bg-surface-container-high` | `bg-secondary/10 text-secondary` | ring | active = solid `bg-secondary` |
| Slider thumb | indigo + glow | — | outline-none (custom ring) | drag updates mono value live |
| Apply Filters | `bg-secondary-container` | `bg-secondary text-on-secondary` | ring | loading on submit |
| AI Query input | border-secondary/30 + halo | halo `bg-secondary/20` | `focus:ring-0` (custom) | — |
| Hero Access Stream | `bg-primary` | `bg-inverse-surface` | ring | — |
| Focus card | glass border/20 | border-secondary/40 + image opacity 30→40 | ring on link | — |
| Research card | L1 | L2 shadow | ring on link | — |
| Trend row | — | `bg-surface-container/50` | — | — |

## Domain selection
Decide multi vs single: source shows **one** active (Quantum). Recommend **multi-select** toggles
(`aria-pressed`), with "Apply Filters" committing the set to the query. Empty set = all domains.

## Metric semantics
- **Sentiment Index** (0–1 shown 0.82): bias ranking toward positive.
- **Validity Threshold** (94%, teal): hide posts below confidence.
- **Impact Scope** (Local/Regional/Global): geographic/severity breadth.
- Live mono value updates on drag; committed on **Apply** (stage, don't auto-refetch on every tick).

## Data states (feed)
- **Loading:** hero skeleton (glass frame + shimmer text); bento = ghost cells preserving spans;
  pulse rows = shimmer + flat sparkline.
- **Empty (filtered out):** bento shows "No matches for current filters" + reset chip.
- **Error:** inline `error` note; keep last feed.
- **Pagination / infinite:** extend `CollectionArchive` paging below bento.

## Animations
- `animated-node` pulse in hero bg (3s alternate); **freeze on `prefers-reduced-motion`**.
- Card image opacity/scale transitions; panel slide `duration-400`.
- Sparklines static (no draw-on animation needed); optional `fadeIn` on first paint.

## Accessibility states
- Panel = `role="dialog"` on mobile (focus trap); plain region on desktop.
- Pills = toggle buttons with `aria-pressed`; sliders `aria-valuetext`.
- Each bento cell is one link/article; tags (VERIFIED / NODE) are text, not color-only.
- Hero `h1` is the single page h1; announce SYNCED status as text.
