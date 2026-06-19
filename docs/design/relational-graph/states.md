# Relational Graph — states & interactions

> Set: [`design.md`](./design.md) · [`components.md`](./components.md) · `states.md` (this)

## Canvas gestures
| Gesture | Action |
|---|---|
| Drag empty space | pan (d3-zoom translate) |
| Scroll / pinch | zoom (clamp 25–400%, sync `100%` readout) |
| Click node | select → highlight + populate `NodeContextPanel` + scroll `NodeDirectory` to it |
| Click empty | deselect (core becomes context) |
| Hover node | `scale-110` + tooltip (address/label/influence) |
| `filter_center_focus` | animate recenter + reset zoom to 100% |
| zoom ± buttons | step zoom ±25% |

## Node visual states
| State | Treatment |
|---|---|
| Core / focused | largest, indigo ring + `node-glow`, optional `pulse-node` |
| Selected (non-core) | ring + glow in its class color, raised z |
| Hover | `scale-110 transition-transform` |
| Dimmed | when a node is selected, unrelated nodes → opacity-40 (focus mode) |
| Edge active | edges touching selection → full opacity/width; others fade |

## Directory states
| Element | Rest | Hover | Selected |
|---|---|---|---|
| Node row | L1 card border/30 | border→class/50 | L accent bar + tinted |
| Search | border/50 | — | `focus:border-secondary ring-2 secondary/10` |
| Group header | label-caps + mono count | — | — |
| Generate Insights | solid secondary | `bg-secondary/90` | loading (spinner, "Synthesizing…") |

## Data states
- **Loading:** canvas shows centered spinner over blurred bg; directory = skeleton groups; panel = ghost stats.
- **Empty:** "No relations for current filters" in canvas center + reset filters chip.
- **Error:** toast + keep last graph; directory shows inline error.
- **Filter change** (Sentiment Bias range / Citation Depth level): re-run query → re-simulate layout
  (animate node transitions, don't hard-cut). Debounce slider drags.

## Generate Insights flow
Mirrors Article Detail AI flow: button → loading → result surfaces as an **L3 glass** insight card
(over canvas, `fadeIn`) summarizing the selected cluster (Claude API server action). Error re-enables.

## Performance
- Cap live-simulated nodes; for large graphs freeze sim after `alpha` settles, switch to static render.
- Prefer `<canvas>` renderer beyond ~500 nodes; keep SVG for smaller for a11y/hit-testing.
- `requestAnimationFrame` for sim ticks; stop on tab blur.

## Accessibility / reduced-motion
- Directory is the keyboard path: arrow keys move selection, Enter focuses node, mirrors canvas.
- `prefers-reduced-motion`: disable `pulse-node`, recenter snaps instead of animating, layout
  transitions instant.
- All controls `aria-label`led; zoom readout announced via `aria-live` on change.
- Selected node announced ("Node 0xQ…A9B, Primary, influence 94.2%").
