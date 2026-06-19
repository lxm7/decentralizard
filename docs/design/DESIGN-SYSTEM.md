---
name: Nexus Intelligence
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002113'
  on-tertiary-container: '#009668'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  h1: { fontFamily: Sora, fontSize: 40px, fontWeight: '700', lineHeight: '1.2', letterSpacing: -0.02em }
  h1-mobile: { fontFamily: Sora, fontSize: 32px, fontWeight: '700', lineHeight: '1.2' }
  h2: { fontFamily: Sora, fontSize: 24px, fontWeight: '600', lineHeight: '1.3' }
  body-lg: { fontFamily: Inter, fontSize: 18px, fontWeight: '400', lineHeight: '1.6' }
  body-md: { fontFamily: Inter, fontSize: 16px, fontWeight: '400', lineHeight: '1.5' }
  body-sm: { fontFamily: Inter, fontSize: 14px, fontWeight: '400', lineHeight: '1.5' }
  data-mono: { fontFamily: JetBrains Mono, fontSize: 13px, fontWeight: '500', lineHeight: '1.4', letterSpacing: -0.01em }
  label-caps: { fontFamily: Inter, fontSize: 12px, fontWeight: '600', lineHeight: '1', letterSpacing: 0.05em }
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 32px
  max-width: 1440px
rounded: { sm: 0.125rem, DEFAULT: 0.25rem, md: 0.375rem, lg: 0.5rem, xl: 0.75rem, full: 9999px }
---

# Nexus Intelligence — Design System (shared)

> Source: Google Stitch export. This is the **global** token + style reference shared by all
> four page sets in this folder. Per-page specs (`design.md`, `components.md`, `states.md`)
> reference this file instead of repeating tokens.
>
> Pages: `article-detail/` · `deep-search/` (Deep Search Overlay) ·
> `relational-graph/` · `home-discover/` (Home / Discover).
>
> **Decisions locked** (see App Integration Bridge): real **light theme** w/ **iOS-glass** ·
> fonts **Sora + Inter + JetBrains Mono** (all free in `next/font/google`) · `cmdk` palette ·
> **EXTEND** existing `ArticleAnalyser` components · new Payload metric fields.

## Brand & Style
The brand personality is authoritative, analytical, and forward-looking. It balances the institutional reliability of high-finance with the innovative transparency of Web3. The UI must feel like a high-performance instrument—precise and dense, yet never cluttered.

The design style is **Corporate Modern with Glassmorphic Accents**. It uses an "Information First" hierarchy, where data density is managed through crisp geometry and subtle depth. Traditional fintech layouts are elevated with translucent overlays for AI-driven insights and "Graph Search" components, creating a distinction between raw data and synthesized intelligence.

## Colors
Anchored by **Deep Navy (#0F172A)** for institutional trust. **Electric Indigo (#6366F1 / #4648d4)** is the primary action color and signature hue for AI interactions, often with a soft outer glow.

Validity is color-coded:
- **Emerald (#10B981 / #4edea3)** — high validity / positive sentiment.
- **Amber (#F59E0B)** — neutral / cautionary.
- **Rose (#F43F5E / #ba1a1a)** — low validity / negative sentiment.

Backgrounds use **Cool Gray (#F8FAFC)** — a paper-like canvas for dense tables and graphs.

## Typography
**Sora** for headlines (geometric tech edge). **Inter** for body and navigation (legibility in dense layouts). **JetBrains Mono** for all metadata, blockchain addresses, and numerical data (column alignment for vertical scanning). `label-caps` for section/table headers (structural skeleton).

## Layout & Spacing
**12-column fluid grid**, max width **1440px**. Strict 4px baseline grid. Dense views use `sm` (8px) / `md` (16px); editorial views use `lg` (24px).

**Reflow:** Desktop = persistent left sidebars (280px). Tablet = sidebars collapse to drawer, cards → 2-col. Mobile = single column, `h1-mobile`, horizontal scroll permitted for wide tables.

## Elevation & Depth
Tonal layering + backdrop blur.
- **L0 Base:** `#F8FAFC`.
- **L1 Cards:** `#FFFFFF`, 1px `#E2E8F0` border, no shadow.
- **L2 Active:** white + soft diffused shadow `0 4px 20px rgba(15,23,42,0.05)`.
- **L3 AI/Search overlays:** semi-transparent white (80%) + 20px backdrop-blur + 1px indigo gradient border. **Reserved for intelligence features** (Graph Search, AI summaries) to distinguish from static blockchain data.

## Shapes
"Soft Professional." 4px base radius on inputs/tags; 8px on cards/panels; AI buttons may use 12px (rounded-xl).

## Components (canonical)
- **Buttons:** Primary = solid Deep Navy. AI actions = indigo→purple gradient + outer glow on hover.
- **Data Cards:** "Popularity Scaling" — padding + headline weight +10% per 10k views, capped 130%.
- **Graph Search Nodes:** pill/circular, icon centers; connections = 1px navy lines @ 0.2 opacity.
- **Status Chips:** small semi-transparent bg, high-contrast text in validity colors.
- **Input Fields:** flat white, 1px `#E2E8F0`; focus → indigo border + 2px ring @ 10%.
- **Trend Indicators:** inline sparklines (mini area charts) in the trend's semantic color.

---

# App Integration Bridge (NEW — decentralizard / Next.js + Payload)

This section maps the Stitch design language onto **this repository's** real stack so the page
specs are buildable. Stack facts:

- **Framework:** Next.js App Router, frontend under `src/app/(frontend)`; CMS = Payload.
- **UI primitives:** shadcn/ui in `src/base/*` (alias `@/base`) — `accordion, button, card, checkbox, input, label, pagination, select, slider, switch, textarea`.
- **Feature components:** `src/components/*` (alias `@/components`). Note the existing **`ArticleAnalyser/`** feature (`FilterSidebar, SearchInput, ViewToggle, ArticleTreeMap, DesktopGridView, CardMobileView, WBAMobileView, hooks.ts, types.ts, utils.ts`) — these pages extend it.
- **Utils:** `cn()` from `@/utilities/ui`.
- **Tokens:** OKLCH CSS variables in `src/app/(frontend)/globals.css`, surfaced in `tailwind.config.mjs`.
- **Font:** **Rubik only** (`--font-rubik`, `next/font/google`).
- **Icons:** **`lucide-react`** (Stitch uses `material-symbols-outlined`).
- **Already installed:** `d3@7`, `@radix-ui/*` (slider/switch/select/checkbox/accordion/label/slot), `tailwindcss-animate`, `@tailwindcss/typography`.
- **To add:** `cmdk` (decided), `geist` mono optional. No graph lib needed (`d3@7` covers it).

### Light theme + iOS glass (DECIDED, applies to all 4 pages)
The app currently defaults **dark** (`globals.css :root --background: 0.15 0 0`; `[data-theme="dark"] → 0 0 0`).
**Decision:** introduce a real **light theme as `:root`** (the paper canvas the Stitch designs assume)
and keep the existing dark values under `[data-theme="dark"]`. Light is default; dark is opt-in.
All token mappings below target this light `:root`.

Drop-in `:root` (OKLCH `L C H`, matches `tailwind.config.mjs` `oklch(var(--x))` usage). Values are
tuned approximations of the Stitch palette — verify on-screen and nudge C/H to taste:

```css
:root {
  /* base canvas / text */
  --background: 0.985 0.004 240;     /* #f7f9fb paper */
  --foreground: 0.22 0.006 230;      /* #191c1e */
  --card: 1 0 0;                     --card-foreground: 0.22 0.006 230;
  --popover: 1 0 0;                  --popover-foreground: 0.22 0.006 230;
  --muted: 0.965 0.004 240;          --muted-foreground: 0.45 0.012 245;  /* #45464d */
  --accent: 0.965 0.004 240;         --accent-foreground: 0.25 0.03 265;
  --secondary: 0.965 0.004 240;      --secondary-foreground: 0.25 0.03 265; /* shadcn subtle */
  --border: 0.92 0.004 250;          /* #c6c6cd hairline */  --input: 0.92 0.004 250;
  --ring: 0.55 0.20 277;             /* indigo focus ring */
  --primary: 0.21 0.03 265;          --primary-foreground: 0.99 0 0;        /* Deep Navy solid btns */
  --radius: 0.9rem;                  /* iOS-continuous; cards ~16px, inputs step down */

  /* brand accent = electric indigo (Stitch "secondary" / AI) — NEW, not shadcn-secondary */
  --accent-indigo: 0.55 0.20 277;        /* #6366F1 */
  --accent-indigo-strong: 0.48 0.21 274; /* #4648d4 */
  /* validity / sentiment semantics */
  --success: 0.80 0.12 165;   /* emerald #4edea3 */
  --warning: 0.85 0.10 85;    /* amber  #F59E0B */
  --error:   0.62 0.20 22;    /* rose   #ba1a1a */
  --brand-teal: 0.78 0.12 195; --brand-magenta: 0.64 0.26 350; /* graph node classes */

  /* iOS "Liquid Glass" material tokens */
  --glass-bg: 1 0 0 / 0.62;          /* translucent white fill */
  --glass-bg-strong: 1 0 0 / 0.78;
  --glass-stroke: 1 0 0 / 0.55;      /* bright hairline (top highlight) */
  --glass-blur: 22px;
  --glass-saturate: 180%;            /* the Apple "pop" — saturate behind blur */
  --glass-shadow: 0.30 0.05 270 / 0.12;
}
```
Keep `[data-theme="dark"]` as-is (existing dark block) so the toggle still works; add the
`--accent-indigo*` / `--glass-*` vars there too (glass on dark = `0 0 0 / .4` fills, stroke `1 0 0 / .12`).

### Token bridge (Stitch → app)
| Stitch token | Hex | App token / class | Note |
|---|---|---|---|
| `primary`, `on-background`, `on-surface` | `#000`/`#191c1e` | `text-foreground`, `bg-primary` | near-black text & solid buttons |
| `on-primary` | `#fff` | `text-primary-foreground` | |
| `secondary`, `secondary-container` | `#4648d4`/`#6063ee` | **NEW** `--accent-indigo` ≈ `brand.violet` | electric indigo = action + AI; `brand.violet` (0.44 0.31 303) is close, add exact indigo if needed |
| `tertiary-fixed-dim`, `on-tertiary-container` | `#4edea3`/`#009668` | `success` / `brand.teal` | validity / positive |
| `error`, `error-container` | `#ba1a1a` | `error` / `destructive` | low validity / bearish |
| Amber (neutral) | `#F59E0B` | `warning` | cautionary |
| graph cyan-500 | `#06b6d4` | `brand.teal` | node class (Synthesized) |
| graph fuchsia-500 | `#d946ef` | `brand.magenta` | node class (Commercial) |
| `surface`/`background`/`surface-bright` | `#f7f9fb` | `bg-background` (light) | base canvas |
| `surface-container-lowest` | `#fff` | `bg-card` / `bg-popover` | L1 cards |
| `surface-container-low/…/highest` | greys | `bg-muted` / `bg-neutral-100..300` | tonal elevation |
| `outline-variant` | `#c6c6cd` | `border-border` | hairlines (usually `/30`–`/50`) |
| `on-surface-variant` | `#45464d` | `text-muted-foreground` | secondary text |
| `primary-container` | `#131b2e` | `bg-neutral-900` | dark code blocks |

### Typography bridge (DECIDED)
App ships **Rubik** only; designs need 3 families. **All three — Sora, Inter, JetBrains Mono — are
free and shipped in `next/font/google`** (self-hosted at build, no network/CLS, no licensing). No
substitution needed. Add via `next/font/google` in `src/app/(frontend)/layout.tsx`, expose CSS
vars, register in `tailwind.config.mjs`. (Optional fresher alt for body+mono: Vercel **Geist /
Geist Mono** via the `geist` package — also free — but Sora/Inter/JetBrains is the lower-friction,
google-native pick and matches the mockups exactly.)

```ts
// layout.tsx
import { Sora, Inter, JetBrains_Mono } from 'next/font/google'
const sora = Sora({ subsets:['latin'], weight:['600','700'], variable:'--font-display' })
const inter = Inter({ subsets:['latin'], weight:['400','500','600','700'], variable:'--font-body' })
const mono = JetBrains_Mono({ subsets:['latin'], weight:['500'], variable:'--font-mono' })
// add sora.variable inter.variable mono.variable to <html className>
```
```js
// tailwind.config.mjs → theme.extend.fontFamily
display: ['var(--font-display)'],          // Sora  → h1/h2
body:    ['var(--font-body)'],             // Inter → body
mono:    ['var(--font-mono)'],             // JetBrains Mono → data
```
Type scale → utilities: `h1` 40/700/-.02em · `h1-mobile` 32/700 · `h2` 24/600 · `body-lg` 18 ·
`body-md` 16 · `body-sm` 14 · `data-mono` 13/500/-.01em · `label-caps` 12/600/.05em/uppercase.
Define as `fontSize` tokens or component-level `text-[..]` (pages quote exact px).

### Spacing / radius bridge
Add named spacing to `tailwind.config.mjs` (`theme.extend.spacing`) so design tokens map 1:1:
`xs/base 4 · sm 8 · md 16 · lg 24 · xl 40 · xxl 64 · gutter 20 · margin-mobile 16 · margin-desktop 32 · max-width 1440px`.
Container max is `2xl: 86rem` (~1376px) — close enough, or add `max-w-[1440px]`.
Radius: Stitch `DEFAULT .125 / lg .25 / xl .5 / full .75rem`. App `--radius .2rem`. Map design
`rounded-xl` (cards) → `rounded-lg` (app var) or explicit `rounded-[0.75rem]`.

### Effects / utilities to add (shared, used across pages)
Add to `globals.css` (or a `@layer utilities`). These are referenced by every page spec:

**Shipped in `globals.css`** (this is the real implementation — `.glass` uses an inset shadow for
the iOS top highlight so `::before` stays free for `.glass-border-gradient`):
```css
.glass {            /* base material — blur + saturate(180%) = Apple pop */
  position: relative;
  background: oklch(var(--glass-bg));
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border: 1px solid oklch(var(--glass-stroke));
  border-radius: var(--glass-radius);                    /* 1.25rem, independent of --radius */
  box-shadow: 0 8px 32px oklch(var(--glass-shadow)),
              inset 0 1px 0 0 oklch(1 0 0 / .5);          /* iOS lensed top edge */
}
.glass-strong { background: oklch(var(--glass-bg-strong)); }  /* class="glass glass-strong" */
.neo-glass    { border-color: oklch(var(--accent-indigo) / .2); } /* intelligence overlays */
/* legacy aliases glass-panel/neo-glass in page specs → compose .glass[/.glass-strong][/.neo-glass] */
.node-glow         { box-shadow: 0 0 15px oklch(var(--accent-indigo) / .5); }
.node-glow-cyan    { box-shadow: 0 0 15px oklch(var(--brand-teal) / .5); }
.node-glow-magenta { box-shadow: 0 0 15px oklch(var(--brand-magenta) / .5); }
.kandinsky-bg { background-color: oklch(var(--background));
  background-image:
    radial-gradient(circle at 10% 20%, oklch(var(--accent-indigo)/.05) 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, oklch(var(--brand-teal)/.05) 0%, transparent 20%),
    radial-gradient(circle at 50% 50%, oklch(var(--accent-indigo)/.06) 0%, transparent 50%); }
.glass-border-gradient::before { content:''; position:absolute; inset:0; border-radius:inherit;
  padding:1px; background:linear-gradient(135deg, oklch(var(--accent-indigo)/.4), oklch(var(--accent-indigo)/.1), transparent);
  -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none; }
@keyframes pulse-node { 0%{transform:scale(1);opacity:.8} 100%{transform:scale(1.05);opacity:1;box-shadow:0 0 20px oklch(var(--accent-indigo)/.4)} }
.animated-node { animation: pulse-node 3s infinite alternate; }
@keyframes fadeIn { from{opacity:0;transform:translateY(-10px) scale(.98)} to{opacity:1;transform:none} }
```
`tailwindcss-animate` (installed) covers accordion + can drive simple fades; the custom keyframes
above are still needed for `pulse-node`/`fadeIn`.

### Icon map (material-symbols → lucide-react)
| material-symbols | lucide | | material-symbols | lucide |
|---|---|---|---|---|
| hub | `Network` | | tune / filter_list | `SlidersHorizontal` / `ListFilter` |
| account_balance_wallet | `Wallet` | | scatter_plot | `ScatterChart` |
| search | `Search` | | history | `History` |
| verified_user / security | `ShieldCheck` | | info | `Info` |
| gavel | `Gavel` | | keyboard | `Keyboard` |
| visibility | `Eye` | | arrow_forward / arrow_outward | `ArrowRight` / `ArrowUpRight` |
| share | `Share2` | | memory | `Cpu` |
| trending_up / trending_down | `TrendingUp` / `TrendingDown` | | science | `FlaskConical` |
| format_quote | `Quote` | | article | `FileText` |
| fact_check | `BadgeCheck` | | zoom_in / zoom_out | `ZoomIn` / `ZoomOut` |
| currency_bitcoin | `Bitcoin` | | filter_center_focus | `Focus` |
| account_balance | `Landmark` | | notifications | `Bell` |
| schedule | `Clock` | | grid_view | `LayoutGrid` |
| magic_button | `Sparkles` | | person | `User` |
| eco | `Leaf` | | grain | `Grip` |
| psychology | `BrainCircuit` | | timeline | `Activity` |
| satellite_alt | `Satellite` | | biotech | `Microscope` |
| close | `X` | | drag_handle | `Equal` |

### Shared component inventory (reuse vs build)
| Need | Reuse (`@/base`, `@/components`) | Build NEW |
|---|---|---|
| Buttons | `@/base/button` | AI-gradient variant |
| Inputs / search | `@/base/input`, `ArticleAnalyser/SearchInput` | ⌘K command palette (P2) |
| Sliders | `@/base/slider`, `@/components/SliderFilter` | labelled "validity threshold" wrapper |
| Switch / toggle | `@/base/switch` | — |
| Cards | `@/base/card`, `@/components/Card` | glass bento card, scaling data card |
| Filters | `ArticleAnalyser/FilterSidebar` | sentiment radio group, glass overlay variant |
| Nav | `@/components/Header`, `Header/Nav` | glass top bar, mobile bottom nav |
| Chips / pills | `@/components/CateoryPill` | validity / sentiment status chips |
| Sparklines | — (`d3@7` available) | `<Sparkline/>` mini SVG |
| Graph canvas | — (`d3@7` available) | `<RelationalGraph/>` (P3) |
| Footer | `@/components/Footer`?/`src/Footer` | brand footer row |

> When a page spec says "reuse X" it means the component above; "NEW" items are listed with a
> proposed path + props in that page's `components.md`.

### Reuse strategy (DECIDED — resolves the "extend vs build" call)
The earlier open question was: for filter/search UI, **extend the existing `ArticleAnalyser/*`
components** or **build fresh parallel ones?** Decision: **extend**. The `ArticleAnalyser` feature
(`FilterSidebar`, `SearchInput`, `ViewToggle`, `ArticleTreeMap`, grid/mobile views, `hooks.ts`,
`types.ts`, `utils.ts`) already models posts-with-metrics, filtering, and a d3 view — exactly this
product. So:
- **Promote** shared atoms out of `ArticleAnalyser/` into neutral homes:
  `SearchInput → @/components/SearchInput`, filter primitives → `@/components/filters/*`,
  `types.ts` metric types → `@/components/metrics/types.ts` (re-export from ArticleAnalyser to avoid churn).
- **Wrap, don't fork:** `DeepSearchOverlay`, `DiscoverFilterPanel`, `NodeDirectory` compose those
  atoms; they don't duplicate input/slider/chip logic.
- Net: one `SearchInput`, one slider wrapper, one `StatusChip`, one `Sparkline`, one `BottomNav`
  shared across all 4 pages. Build-new is reserved for genuinely new surfaces (palette, graph canvas,
  glass bento, scaling data card).

### Payload schema additions (DECIDED)
These pages surface metrics/intelligence not on the base `Post`. Add to `src/collections/Posts`:
| Field | Type | Used by |
|---|---|---|
| `sentimentScore` | number (-1..1) | Article sentiment, Deep Search sentiment chip, Discover index |
| `validity` / `confidence` | number (0..100) | validity chips, slider filters, directory % |
| `sources` | array `{ label, confidence, kind }` | Article "Source Verification" |
| `views`, `shares` | number | Resonance stats, popularity scaling, "42.8k nodes" |
| `relations` | relationship→Posts `{ target, weight }` | Relational Graph edges |
| `domain` / `cluster` | select / relationship→Categories | Discover domains, graph clustering |

`clicks/uniqueClicks/clickRate` already exist via `ArticleAnalyser/types.ts` (`PostWithMetrics`) —
reuse those for views where possible rather than adding duplicates.
