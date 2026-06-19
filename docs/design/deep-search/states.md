# Deep Search Overlay — states & interactions

> Set: [`design.md`](./design.md) · [`components.md`](./components.md) · `states.md` (this)

## Open / close
- **Triggers:** `⌘K` / `Ctrl+K`, `/` shortcut, or nav search button.
- **Open:** scrim fades, modal `fadeIn` (translateY-10 scale .98 → 0). Body scroll locked
  (`overflow-hidden` already on `<body>`). Autofocus input.
- **Close:** `Esc`, scrim click, or result select. Restore focus to trigger.

## Keyboard model
| Key | Action |
|---|---|
| ↑/↓ | move active result (roving `aria-activedescendant`) |
| Enter | open active result / submit query |
| Tab | move into params rail |
| ⌘K / Esc | toggle / close |
| ⌘↵ | run "Advanced Query Builder" (footer) |

## Interaction states
| Element | Rest | Hover | Focus | Selected |
|---|---|---|---|---|
| Cluster pill | tinted border | border→solid + bg/5 | ring | — |
| Synthesis row | `bg-card/40` transparent border | L indigo bar in, border/30 + shadow | ring / `aria-selected` | active = bar shown |
| Validity knob | indigo, shadow | `scale-110` | ring | `cursor-grabbing` on drag |
| Sentiment radio | border transparent | border/30 + bg | ring | indigo border+bg, filled dot |
| Data Origin switch | off=muted | — | ring-2 secondary/30 | on=secondary, knob right |
| Advanced link | secondary | →secondary-container | ring | — |

## Result/data states
- **Idle (empty query):** show Suggested Clusters + Recent Synthesis (default screenshot state).
- **Typing / loading:** debounce ~200ms; show 3 skeleton rows (shimmer) under "Results"; keep rail.
- **Results:** replace Recent with ranked matches; each row gets validity + sentiment chips.
- **No results:** centered muted "No synthesis matches — adjust validity or sentiment" + reset chip.
- **Error:** inline `error` note, keep last good results.
- **Param change:** re-query live (or stage until "Apply" if added); validity chip value tracks slider.

## Filter semantics
- **Validity Threshold** (default ≥85): filters out results below confidence; chip + track update on drag.
- **Sentiment Vector** (single-select bull/neutral/bear): biases/filters ranking.
- **Institutional Only** (switch): drops "public chatter" sources.
- Params persist per session; reflect in URL when promoted to full `search` page.

## Animations
- `fadeIn` entrance; pill/row hover transitions `transition-all`.
- Knob `transition-transform`; respect `prefers-reduced-motion` (skip scale, keep state colors).

## Accessibility states
- `role="dialog" aria-modal="true"`, labelled by the search input's `aria-label`.
- Results list `role="listbox"`, rows `role="option" aria-selected`.
- Slider `aria-valuemin/max/now` + `aria-valuetext="≥ 85%"`; radio group `role="radiogroup"`.
- Announce result count via `aria-live="polite"` on query change.
