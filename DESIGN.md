# Design system

A portable visual language — not tied to SalesMakrs's screens or stack. Copy
this file into any new project to get the same feel: a warm-neutral ground,
one accent hue, flat structure drawn with rules instead of cards, and a
two-face type system where every number lines up in a column.

It originates from a design handoff for a different product (a stock-market
dashboard called MarktMakrs) and was adapted here for a B2B ordering app.
The tokens and rules below are written generically so the next adaptation is
just as easy — see "Adapting the semantic colors" for how.

## The rules

If a decision isn't covered below, decide by these:

1. **One interface hue.** A single accent color carries every "this is
   interactive / this is active" signal: primary buttons, active nav, focus
   rings, links, the brand monogram. It never appears on a data value.
2. **Semantic colors mean one thing and nothing else.** Pick exactly two
   signal colors — a positive and a negative — and use them only for that
   outcome (e.g. fulfilled/rejected, in stock/out of stock, up/down). Don't
   reuse them for brand, buttons, or selection.
3. **No red**, or more precisely: pick the negative signal color deliberately
   and make it *not* alarm-red. Red reads as an error at a glance and
   competes with real errors; an amber/ochre negative signal stays legible
   without shouting. (If the product domain has no real "outcome" colors at
   all, skip rule 2 and use neutral/muted treatments for state instead.)
4. **Radius is 0 and structure is drawn.** Regions are separated by a rule
   (a top border) plus a flush-left label — not a card with a fill, a
   border-all-around, and a shadow. No shadows anywhere; depth comes from a
   "raised" ground step, not elevation.

## Color tokens

Two grounds ship: dark (default) and light. Both are **warm neutrals** —
deliberately off pure black / pure white.

### Dark

| Token | Value | Role |
| --- | --- | --- |
| `--bg` | `#141312` | App canvas |
| `--surface` | `#1e1c1b` | Table bodies, inputs, panels |
| `--surface-2` | `#2d2b2b` | Row hover, unselected chip fill |
| `--text-primary` | `#f3f2f2` | All primary text |
| `--text-secondary` | `rgba(243,242,242,0.76)` | Body copy |
| `--text-muted` | `rgba(243,242,242,0.62)` | Captions, table headers |
| `--border-strong` | `rgba(243,242,242,0.28)` | 2px section/table-header rules |
| `--border` | `rgba(243,242,242,0.16)` | 1px hairlines between rows |

### Light

| Token | Value |
| --- | --- |
| `--bg` | `#f1f0ee` |
| `--surface` | `#e7e5e2` |
| `--surface-2` | `#dbd8d4` |
| `--text-primary` | `#1c1b19` |
| `--text-secondary` | `rgba(28,27,25,0.76)` |
| `--text-muted` | `rgba(28,27,25,0.62)` |
| `--border-strong` | `rgba(28,27,25,0.28)` |
| `--border` | `rgba(28,27,25,0.16)` |

### Accent + semantic (both modes need their own values, matched for contrast)

| Token | Dark | Light | Role |
| --- | --- | --- | --- |
| `--accent` | `#2fa8a3` | `#0d6e6b` | The one interface hue |
| `--accent-hover` | `#6fd0cb` | `#0a4f4d` | Hover state |
| `--accent-soft` | `rgba(47,168,163,.16)` | equivalent at same alpha | Soft backgrounds only (not on filled elements) |
| `--accent-text` | `var(--bg)` | `var(--bg)` | Text **on** a filled accent surface — opaque, never alpha |
| `--up` (positive) | `#2fbf6e` | `#12793c` | Positive outcome |
| `--down` (negative) | `#e5a23c` | `#96500c` | Negative outcome — amber, not red |

Up/down are matched in perceptual weight in each mode so neither reads
"louder" than the other — a common bug is a brighter green than red/amber
that makes gains look bigger than losses by default. Check this whenever you
pick a palette: screenshot both badges next to each other and squint.

Every pair here meets 4.5:1 against its own ground. **Text on a filled
color must be opaque** (`--accent-text`, not `--text-primary` at alpha) —
alpha over a saturated fill drops below the contrast bar.

## Typography

Two faces, one job each:

- **A geometric grotesk at weight 800 for headings / 400 for body** (this
  system uses **Archivo**). Flush left always. Display-scale lines get
  `margin-left: -0.05em` to compensate for optical whitespace before a
  capital letter.
- **A monospace for every figure** — price, percentage, count, date, ID, any
  data value (this system uses **IBM Plex Mono**). Always
  `font-variant-numeric: tabular-nums` (`font-feature-settings: "tnum" 1` as
  a fallback) so a column of numbers aligns down 100 rows.

| Style | Size / line-height | Weight | Tracking |
| --- | --- | --- | --- |
| Display | `clamp(34px, 4.6vw, 58px)` / 1.05 | 800 | −0.025em |
| H2 (section) | 26 / 34 | 800 | −0.015em |
| H3 | 20 / 26 | 800 | −0.01em |
| Panel title | 17 / 24 | 800 | 0 |
| Body | 15 / 26 | 400 | 0 (max 62ch measure) |
| Small | 14 / 22 | 400 | 0 |
| Caption (uppercase) | 11 / 16 | 400 mono | 0.08em |
| Kicker (uppercase, accent) | 12 / 14 | 400 | 0.1em |
| Figure, large | 40 / 1.1 mono | 500 | −0.02em |
| Figure, inline | inherits | 400–500 | 0 |

Fonts, via Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

Icons: a stroke set (this system uses inline SVGs matching Lucide's style),
colored `--text-primary` or `--text-muted` — a hue only when the icon *is*
the primary action.

## Spacing, radius, structure

- Scale: `4 / 8 / 12 / 16 / 24 / 32` px, plus a `48px` "section" step for
  the vertical padding of a ruled region.
- Page gutter: `clamp(20px, 5vw, 64px)`. Max content width: `1180px`.
- **Radius 0 on every element** — buttons, inputs, chips/badges, cards, the
  brand monogram. Nothing is rounded.
- Rules, not borders-all-around: **2px** for section seams and table
  headers, **1px** hairline between table rows. A region is `border-top:
  2px solid var(--border-strong)` plus padding — never a box with a border
  on all four sides.
- **No shadows anywhere.** Depth comes from the raised (`--surface-2`)
  ground step only.

## Component patterns

### Buttons

```css
.btn {
  display: inline-flex; align-items: center; justify-content: flex-start;
  gap: 8px; min-height: 35px; padding: 8px 14px;
  border-radius: 0; border: 1px solid transparent;
  font-weight: 800; /* the display weight, not a mid-weight */
  transition: background-color 120ms ease, border-color 120ms ease;
}
```

- **Labels are flush left**, not centered — a button wider than its label
  starts the text at the left padding edge (trailing icon included). This
  is a deliberate, slightly unusual choice; apply it consistently rather
  than case-by-case.
- Primary: filled accent, `--accent-text` (opaque, ground-colored) label.
- Secondary: transparent, 1px `--border-strong` border, `--text-primary`
  label.
- Ghost: transparent, no border, `--text-secondary` label, `--surface-2` on
  hover.
- Disabled: `opacity: 0.45`.
- Focus-visible: `2px solid var(--accent)` outline, `2px` offset. Never the
  browser default, never suppressed (this system is keyboard-first).

### Inputs

Background `--surface`, `1px solid var(--border-strong)`, radius 0, caret
`--accent`. Focus: border → `--accent` plus the same 2px outline as buttons
(not a soft box-shadow glow — an outline).

Select elements get a custom chevron (radius-0 native selects still show a
platform arrow otherwise); textarea variants drop the fixed height and add
vertical padding instead.

### Badges / status chips

The same visual language serves both a filter chip and a status badge: it's
a **contrast event**, not a tint.

- Neutral / unselected state: `--surface-2` fill, `--text-primary` (or
  `--text-muted` for an inert/closed state) label.
- A "true" state (selected, approved, positive, negative): **solid** fill in
  the relevant hue (`--accent`, `--up`, or `--down`), with **opaque**
  `--bg`-colored label — never a soft tint background with colored text.
  That soft-tint pattern (which this system explicitly avoids) reads as
  decoration; a solid fill reads as a state change.
- Label: uppercase, mono, small (11–13px), letterspaced ~0.04–0.08em.
- Radius 0 (square), not a pill — unless you deliberately want the softer
  pill read, in which case be consistent about it everywhere.

If you have more than 2–3 states and only 2 semantic hues (accent + up +
down), let the remaining states be neutral/muted rather than inventing more
hues — see "Adapting the semantic colors" below.

### Tables

```css
th {
  text-align: left; font: 400 11px/16px var(--font-mono);
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--text-muted); border-bottom: 2px solid var(--border-strong);
}
td { padding: 8px 16px; border-bottom: 1px solid var(--border); }
.num { font-family: var(--font-mono); font-variant-numeric: tabular-nums; text-align: right; }
tbody tr:hover td { background: var(--surface-2); } /* raise the fill; never tint with a hue */
```

Every numeric column — price, quantity, count, date — gets the `.num`
treatment: mono, tabular, right-aligned. This is the single highest-leverage
detail in the whole system for a data-heavy screen; it's what makes a table
look considered instead of default.

### Cards / panels

There is no "card" component in the traditional sense (fill + border +
shadow + radius). A panel is:

```css
.panel { border-top: 2px solid var(--border-strong); padding-top: 20px; }
```

A table keeps a background fill (`--surface`, the "panel" ground role)
because that's a listed ground step, not an ad hoc card — but still no
border, radius, or shadow, just the top rule.

### Modals

Background `--surface`, no border-radius, a `2px solid var(--accent)`
top rule (the accent, not the neutral rule — a modal is an active,
in-progress interaction) instead of a shadow. Overlay: a plain dark scrim,
no blur required.

### Alerts / inline errors

**No colored banner.** Primary text color, with a `2px solid` left border in
the signal color as the only directional cue:

```css
.alert-danger { color: var(--text-primary); border-left: 2px solid var(--down); padding: 8px 16px; }
```

This is a deliberate austerity choice — a full colored background reads as
alarming and fights with real status colors elsewhere on the page. If a
product genuinely needs error banners to be louder (e.g. a destructive
confirmation), that's a deviation to make consciously, not a default.

### Empty states

Icon (muted, `--text-muted`), one line of copy, optional action. No card
wrapper beyond whatever the empty state sits inside (e.g. a table's panel
background).

## Layout patterns

### Sidebar navigation

- Background `--surface`, `2px solid var(--border-strong)` border on the
  side facing content (not a 1px hairline — a nav/content boundary is a
  section seam).
- Inactive item: `--text-muted`, `--surface-2` on hover.
- **Active item — two options**, pick one and use it everywhere:
  1. A `2px solid var(--accent)` rule on the leading edge (left, in a
     vertical nav) + `--text-primary` + heavier weight. Selection as a
     contrast event, not a color fill.
  2. Full ink-on-paper inversion (`--text-primary` background,
     `--bg` text) if (1) reads too subtle for the layout.
  - In a responsive/horizontal nav (e.g. a mobile top bar), rotate the rule
    to the edge that makes sense for that axis (bottom, not left) — don't
    leave a left-rule floating mid-row where it reads as a stray divider.
- Brand monogram: square (no radius), **ink-filled with ground-colored
  text**, mono font, not a colored tile. It is not part of the interface
  hue — it's a wordmark, not a button.

### Page header

Flush-left title (H2 scale, 800 weight) + optional muted subtitle beneath,
primary action button top-right. No page-level card wrapper.

### Auth / standalone pages

Same austerity as everywhere else: no card fill/border/shadow around the
form — a `2px solid var(--border-strong)` top rule is enough separation
from the page background.

### Content measure

Sidebar width ~240px; content `max-width: 1180px`, horizontal padding =
the gutter token, vertical padding = the 48px section step.

## States & interactions

- **Hover** — raise the fill to `--surface-2`. Never tint with a hue.
- **Selected / active** — a contrast event (solid fill + opaque label, or a
  rule + weight change), not a soft color wash.
- **Focus-visible** — `2px solid var(--accent)` outline, 2px offset, on
  every interactive element without exception.
- **Loading** — muted text or a thin accent progress rule. No spinners in a
  hue.
- **Empty / error** — muted copy on the ground; errors get the left-rule
  treatment above, never a full colored banner.
- **Transitions** — 120ms ease for fill/color changes only. No motion on
  layout (no sliding, no scaling). Honor `prefers-reduced-motion` by
  dropping transitions entirely.

## Adapting the semantic colors

This system only ships two semantic hues (`--up` positive, `--down`
negative) plus the one interface accent. Most apps have more than two
states to represent (e.g. an order lifecycle: pending → approved/rejected →
fulfilled, or cancelled). The pattern used in SalesMakrs, worth reusing:

1. Map the state that means **"this needs attention / is in progress
   because of user action"** → the accent color (a contrast event, same as
   "selected").
2. Map the state that means **"this concluded well"** → `--up`.
3. Map the state that means **"this concluded badly"** → `--down`.
4. Everything else (waiting with no action taken yet, closed without a
   verdict, etc.) → neutral treatments: `--surface-2` fill with
   `--text-primary` (still "live"/waiting) or `--text-muted` (inert/closed)
   label — no hue at all. Don't invent a third or fourth hue to
   disambiguate; use text weight/color contrast instead.

This keeps the "one interface hue + two outcome hues" discipline intact no
matter how many states the actual domain has.

## Accessibility notes

- Every token pair must hit 4.5:1 against its own ground — re-verify after
  any palette change, in both modes.
- Never apply alpha to colored text sitting on a colored fill; only alpha
  over the plain ground.
- If color carries meaning (an up/down indicator, a direction arrow), keep a
  non-color cue alongside it (an icon, a glyph, a label) so the meaning
  survives grayscale and color-blindness.

## Quick start for a new project

1. Paste the token block (dark + light values above) into your global
   stylesheet as `:root` / `[data-theme="light"]` (or swap for a media
   query).
2. Load the two fonts.
3. Build buttons/inputs/badges/tables from the patterns above before
   building anything bespoke — most screens are those five things.
4. Apply the four rules at the top of this doc to every new component as
   you add it; if a component doesn't fit them cleanly, that's a signal to
   simplify the component, not to make an exception.
