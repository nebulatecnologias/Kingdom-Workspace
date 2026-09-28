# Tokens

All values live as CSS custom properties in `assets/kingdom-ui.css` (`:root`, with dark overrides). `assets/design-tokens.json` has the same values in machine-readable form, with tonal ramps.

**Contents:**
1. Colour
2. Typography
3. Spacing & layout
4. Radius
5. Elevation
6. Motion
7. Breakpoints

---

## 1. Colour

### Neutrals: warm stone
| Token | Light | Dark | Use |
|---|---|---|---|
| `--canvas` | `#f5f3f0` | `#141311` | Page ground |
| `--canvas-2` | `#efece8` | `#1a1816` | Sidebar, second ground |
| `--surface` | `#ffffff` | `#1e1c19` | Cards, inputs, ghost buttons, active nav tile |
| `--surface-2` | `#fbfaf8` | `#1b1917` | Card gradient bottom, row hover |
| `--sunken` | `#f1eeea` | `#26231f` | Quiet fills: hover, segmented track, neutral pills, code chips, progress track, read-only inputs |
| `--line` | `#e8e3dd` | `#2f2b27` | 1px borders of cards, chips, tables |
| `--line-strong` | `#d9d3cb` | `#3d3833` | Input strokes, dashed drop targets |
| `--ink` | `#1c1a17` | `#f4f0ea` | Headings, values |
| `--ink-2` | `#3b3732` | `#ddd6cd` | Labels, nav text, body in dense UI |
| `--muted` | `#6f6962` | `#aaa298` | Leads, metadata, hints |
| `--faint` | `#7d766e` | `#7f786f` | Placeholders and chevrons only (not for text people must read) |

### The one voice: orange
| Token | Value | Use |
|---|---|---|
| `--cta` | `linear-gradient(180deg, #ff7f37 0%, #f2570f 100%)` | The primary button, split CTA, progress fill |
| `--cta-hover` | `linear-gradient(180deg, #ff8b47 0%, #f4621d 100%)` | Primary hover |
| `--cta-aa` | `linear-gradient(180deg, #d4460b 0%, #b83d08 100%)` | Optional: strict WCAG AA contrast for white labels |
| `--cta-shadow` | `0 1px 0 rgba(255,255,255,.35) inset, 0 6px 16px -4px rgba(226,78,12,.55)` | Glow under primary buttons only |
| `--orange-300` / `400` / `500` / `600` | `#ffb38a` / `#ff8a4c` / `#f4621d` / `#e14e0c` | Solid accent (500): active nav icon, tab underline, focus border, checkbox accent. 400→500: KPI mini-bars |
| `--orange-soft` / `--orange-ink` | `#fff0e7` / `#b8400a` (dark `#3a2216` / `#ffab7c`) | Price pill, count badges, selected list row, links |
| Brand panel gradient | `linear-gradient(160deg, #ff8a45 0%, #f25a12 55%, #d9470a 100%)` | Auth left panel, email header band |

### Status (only inside pills, dots, notices)
| Meaning | Solid | Soft / Ink (light) | Soft / Ink (dark) |
|---|---|---|---|
| Owned, active, connected, success | `--green #15803d` | `#e3f6ea` / `#0f7a37` | `#15301f` / `#6fdc98` |
| Expiring, urgent, error | `--red #d42a39` | `#fde8ea` / `#b4202d` | `#3a1a1d` / `#ff8f98` |
| Warning | — | `#fff4d9` / `#8a5b00` | `#352a12` / `#f5c865` |
| Info, "opened" | — | `#e6f1fb` / `#1f5f9a` | `#16283a` / `#8cc4f5` |
| Time and people | `--violet-1 #7b72e8` → `--violet-2 #564cc9` | `#ecebfc` / `#4a42b8` | `#25234a` / `#b3adff` |

Lifecycle pill mapping, for any "sent → opened → accepted" style flow:
- sent: orange soft
- opened: blue soft
- accepted/done: green soft
- expired: grey (sunken/muted)
- revoked/failed: red soft

### Content fields (art only)
Pastel grounds for covers and illustrations. Line art strokes in `--art-ink #1d1b18`.

| sky | sand | meadow | blush | lagoon | lavender | wheat | apricot | mint | periwinkle | ice |
|---|---|---|---|---|---|---|---|---|---|---|
| `#d6ebf8` | `#ffe6b3` | `#d9eed0` | `#f8d5cf` | `#cbedee` | `#e8e2fb` | `#f3e0c3` | `#fde0c6` | `#dff0d6` | `#e6e0f8` | `#d6e7f6` |

**Rule:** content on its pastel field is the only multi-hue area of a screen. The UI stays in neutrals plus orange.

---

## 2. Typography

Font: **Google Sans**. Fallback stack: `"Google Sans", "Product Sans", "Segoe UI", Roboto, system-ui, -apple-system, sans-serif`. Weights 400/500/700. Monospace (`ui-monospace, "SF Mono", Menlo, Consolas, monospace`) is used **only** for code-like values: webhook URLs, secrets, IDs.

| Role | Size | Weight | Line height | Tracking | Use |
|---|---|---|---|---|---|
| Display | `clamp(26px, 3.2vw, 34px)` | 500 | 1.2 | -0.025em | Page titles, greeting |
| Display hero | `clamp(28px, 3.6vw, 40px)` | 500 | 1.1 | -0.03em | Detail page title, auth panel headline |
| Numeral | 38px (30px < 640px) | 500 | 1 | -0.03em, tabular | KPI values |
| Headline | 21–22px | 500 | 1.25 | -0.015em | Dialog titles, section headings, "continue" card |
| Title | 16.5–17px | 500 | 1.3 | -0.015em | Card titles, item names |
| Body | 15px (14.5px < 640px) | 400 | 1.5 | 0 | Running text; leads max 56–60ch in `--muted` |
| Reader body | 17px (15–22 adjustable) | 400 | 1.75 | 0 | Long-form reading, max 64ch |
| Label | 13.5px | 500 | 1.4 | 0 | Field labels, segmented controls, small buttons |
| Button | 14.5px (16px large, 13.5px small) | 500 | 1 | 0 | Buttons |
| Pill | 13px | 500 | 1 | 0 | Status pills, chips |
| Caption | 12.5px | 400 | 1.4 | 0 | Hints, errors, timestamps, deltas |

Rules:
- Weight **500** names things; **400** is for reading; **700** only for the wordmark.
- Headings use `text-wrap: balance`.
- Numbers in tables, KPIs and prices use `font-variant-numeric: tabular-nums`.
- Uppercase is not used, except short code/ID values.

---

## 3. Spacing & layout

Rhythm: **4 · 8 · 12 · 16 · 18 · 22 · 26 · 34** px.
- 18px: standard grid gap.
- 22px: card padding.
- 26px: gap between page sections.
- 34px: between titled content sections.
- More space above a heading than below it.

App shell:
- **Sidebar:** 264px, sticky, `--canvas-2`, 1px right hairline, padding `24px 18px 18px`.
- **Main column:** padding `22px clamp(16px, 3vw, 40px) 64px`.
- **Top bar:** pill search (max 420px), then spacer, language select and icon buttons. 26px below it.
- **Page head:** title + lead on the left, optional action on the right, 24px below.
- **Grids:**
  - Card grid: `repeat(auto-fill, minmax(236px, 1fr))`, gap 18px.
  - Dashboard: 3 KPI cards + 1 wider card (`1.15fr`), gap 16px.
  - Main + side panel: `minmax(0,1fr) 320–360px`.

---

## 4. Radius

| Token | Value | Use |
|---|---|---|
| pill | 999px | Every button, chip, pill, search, segmented control, toggle, progress bar |
| xl | 26px | Dialogs, hero covers |
| lg | 22px | Cards, tables' container, product cards |
| md | 16px | Inner covers (inset 10px inside a 22px card), crayon swatches, list rows |
| field | 14px | Inputs, selects, nav items |
| sm | 12px | Thumbnails, printable sheets |
| xs | 8px | Inline chips (`@mention`, `#code`) |
| panel | 30px | Auth brand panel, phone preview frame |

**Nesting rule:** an inner shape is always smaller than its container (22 → 16 → 12 → 8).

---

## 5. Elevation

All shadows are warm (`rgba(28,22,16,…)`), diffuse, with negative spread. Dark theme uses black at higher opacity.

| Token | Value | Use |
|---|---|---|
| `--shadow-1` rest | `0 1px 2px rgba(28,22,16,.05), 0 6px 18px -8px rgba(28,22,16,.10)` | Cards, active nav tile |
| `--shadow-2` lift | `0 2px 6px rgba(28,22,16,.06), 0 18px 40px -16px rgba(28,22,16,.22)` | Card hover, hero covers |
| `--shadow-pop` | `0 12px 32px -8px rgba(28,22,16,.28), 0 2px 8px rgba(28,22,16,.08)` | Dialogs, drawers, menus, toasts |
| `--cta-shadow` | see Colour | Primary buttons only |
| violet glow | `0 16px 30px -14px rgba(86,76,201,.8), inset 0 1px 0 rgba(255,255,255,.25)` | Countdown clock only |
| `--ring` | `0 0 0 3px rgba(244,98,29,.28)` | Every `:focus-visible` |

- Hover lift on interactive cards: `translateY(-3px)` plus rest → lift.
- Scrim behind dialogs: `rgba(20,16,12,.42)` with 3px backdrop blur.

---

## 6. Motion

- One easing everywhere: `--ease: cubic-bezier(.22, 1, .36, 1)`.
- Durations:
  - Controls: 150–200ms.
  - Card lift and fills: 250ms.
  - Dialog rise (14px, scale .98): 280ms.
  - Drawer slide (40px): 300ms.
  - Toast rise: 300ms.
- Motion shows a change of state; it is never decoration. No page-load choreography.
- `prefers-reduced-motion: reduce` collapses all durations to about 0.

---

## 7. Breakpoints

| Width | Change |
|---|---|
| ≤ 1180px | Dashboard's wide card wraps to its own row; side panels stack under main content |
| ≤ 980px | Sidebar hidden. Sticky blurred mobile top bar (canvas at 88%, 12px blur) and fixed bottom tab bar (safe-area padding). Desktop top bar hidden. Auth split stacks |
| ≤ 640px | Body 14.5px. Card grids two-up with 12px gap. Filter chips on one horizontally scrolling row. Tighter card padding. Card footers stack (meta, then pill) |
