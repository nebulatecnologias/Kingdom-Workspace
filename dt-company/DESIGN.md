---
name: DT Company — Business Advisory & Development
description: Big Four consulting structure with Stripe/Vercel/Linear finish — navy-to-vivid-blue brand field on white grounds, bilingual PT/EN.
colors:
  brand-navy-deepest: "#030c2a"
  brand-navy: "#04123f"
  brand-navy-raised: "#0a1f5c"
  vivid-blue: "#0a57e7"
  vivid-blue-hover: "#2d6ff0"
  vivid-blue-soft: "#5b8df5"
  sky-accent: "#9dc0ff"
  tint-whisper: "#f4f8ff"
  tint-panel: "#eef4ff"
  tint-strong: "#d7e3f8"
  hairline: "#dce6f7"
  ink: "#17254e"
  ink-soft: "#46568b"
  ink-on-navy: "#d4e0f9"
  ink-on-navy-soft: "#9db4e4"
  confirm-green: "#0c7a43"
  confirm-green-tint: "#e3f4ea"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Google Sans, Product Sans, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(2.45rem, 4.6vw, 3.9rem)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.022em"
  headline:
    fontFamily: "Google Sans, Product Sans, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(1.9rem, 3.4vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Google Sans, Product Sans, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.55rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Google Sans, Product Sans, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Google Sans, Product Sans, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.08em"
rounded:
  md: "14px"
  lg: "20px"
  pill: "999px"
components:
  button-primary:
    backgroundColor: "{colors.vivid-blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "0.85rem 1.6rem"
  button-primary-hover:
    backgroundColor: "{colors.vivid-blue-hover}"
    textColor: "{colors.white}"
  button-light:
    backgroundColor: "{colors.white}"
    textColor: "{colors.brand-navy}"
    rounded: "{rounded.pill}"
    padding: "0.85rem 1.6rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "0.85rem 1.6rem"
  chip-number:
    backgroundColor: "{colors.tint-panel}"
    textColor: "{colors.vivid-blue}"
    rounded: "{rounded.pill}"
    padding: "0.18rem 0.6rem"
  card-dossier:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "1.6rem 1.6rem 1.1rem"
---

# Design System: DT Company — Business Advisory & Development

## Overview

**Creative North Star: "The Category Canon, Executed Impeccably"**

This is the consulting category's own visual canon — the Big Four structural language of pillars, numbered services, and sober authority — finished to Stripe/Vercel/Linear standard. The whole palette is the logo's blue field: deep navy (#04123F) flowing into vivid blue (#0A57E7) as gradient "brand fields" with radial blooms, set against clean white grounds with the faintest blue-tinted panels and hairlines. Nothing outside this field exists except a single confirmation green for "done" states. The system persuades through concrete structure (numbers, checklists, deliverable rows), never through decoration.

Density is generous and editorial: wide sections, hairline-ruled lists instead of card grids, large negative-tracked headings, one authored motion moment (hero rise stagger, scroll reveals) and nothing else moving. Bilingual PT/EN carries identical dignity in both languages.

**Key Characteristics:**
- One hue family: navy → vivid blue, white, and blue-cast tints; green appears only as a status confirmation.
- Gradient brand fields with radial blue blooms for hero and CTA moments; flat white/tint grounds for content.
- Google Sans at three weights (400/500/700) doing all hierarchy work; negative tracking on everything above body size.
- Pill-shaped buttons and chips; soft 14–20px radii on cards and panels.
- Authored 1.75-stroke round-capped SVG icons, always `currentColor`.
- Hairline rules (#dce6f7 on white, white-alpha on navy) structure lists; shadows are reserved and navy-tinted.

## Colors

A single blue field from near-black navy to airy sky, grounded on white, with one green reserved for confirmation.

### Primary
- **Vivid Blue** (#0a57e7): the brand accent — primary buttons, links, hover color on titles, active icon tints, the step-number discs, the gradient blooms. Lightens to **Vivid Blue Hover** (#2d6ff0) on interaction. **Sky Accent** (#9dc0ff) carries small text and icons sitting on navy (nav subtitle, notice labels).
- **Brand Navy** (#04123f): the anchor of every gradient field and the dark surface color (pillar-boundary panels, scrolled nav at 90% alpha with blur). **Brand Navy Raised** (#0a1f5c) is its gradient midpoint; **Brand Navy Deepest** (#030c2a) exists only inside shadow tints.

### Neutral
- **White** (#ffffff): the page ground and the card surface; also the light button and all text on brand fields.
- **Ink** (#17254e): body text on light grounds — a navy-cast near-black, never pure black.
- **Ink Soft** (#46568b): secondary text, labels, metadata on light grounds.
- **Ink On Navy** (#d4e0f9) / **Ink On Navy Soft** (#9db4e4): the equivalent two-step text ramp on dark brand fields.
- **Tint Whisper** (#f4f8ff) and **Tint Panel** (#eef4ff): alternating section backgrounds, hover washes, icon-chip fills. **Tint Strong** (#d7e3f8) colors the oversized ghost numerals and scrollbars.
- **Hairline** (#dce6f7): every rule and divider on white. On navy fields, hairlines are white at 14–18% alpha instead.

### Tertiary
- **Confirm Green** (#0c7a43) on **Confirm Green Tint** (#e3f4ea): exclusively the "done" state in dossier checklists and status pills.

### Named Rules
**The One Field Rule.** Every color on the site is drawn from the logo's navy→blue axis (plus white and the single confirmation green). No warm hues, no grays — "gray" text and lines are always blue-cast (#46568b, #dce6f7).
**The Brand Field Rule.** The navy→blue gradient with radial blooms (`radial-gradient(... rgba(10,87,231,…))` over `linear-gradient(140–155deg, #04123f → #0a57e7)`) appears only on full-bleed brand moments: hero, final CTA, pillar-page hero, boundaries band. Content sections sit flat on white or #f4f8ff.

## Typography

**Display Font:** Google Sans (with Product Sans, system-ui fallbacks) — served from fonts.googleapis.com at weights 400/500/700
**Body Font:** Google Sans (same family throughout)

**Character:** One geometric humanist face carries the whole site. Authority comes from weight contrast (700 headings vs 400 body) and tight negative tracking at scale, not from a second family. All numerals in data contexts use `font-variant-numeric: tabular-nums`.

### Hierarchy
- **Display** (700, clamp(2.45rem, 4.6vw, 3.9rem), lh 1.06, ls -0.022em): hero headline only; `text-wrap: balance`, max-width ~15ch.
- **Headline** (700, clamp(1.9rem, 3.4vw, 2.75rem), lh 1.12, ls -0.02em): section titles and the CTA heading; balanced, max ~24ch.
- **Title** (700, 1.55rem, lh 1.2, ls -0.015em): pillar names; service titles step down via clamp(1.45rem, 2.4vw, 1.9rem).
- **Body** (400, 1.0625rem, lh 1.6): default copy; intros step up to 1.125rem in #46568b; long-form text capped at 50–75ch.
- **Label** (700, 0.8125rem, ls 0.08em, UPPERCASE): structural column/panel labels — footer column heads, "pain"/"deliverables" headers, provisional-notice headers. On navy panels the label takes Sky Accent (#9dc0ff); on white it takes Ink Soft.

### Named Rules
**The Tight-at-Scale Rule.** Tracking tightens as size grows: body is normal, titles -0.015em, headlines -0.02em, display -0.022em, the giant ghost numeral -0.04em. Never positive tracking except the uppercase 0.8125rem label (0.08em).
**The Tabular Figures Rule.** Any number doing work — pillar numerals, service numbers, stats, statuses — sets `tabular-nums`.

## Layout

A single centered container: `min(1180px, 100% - 3rem)`, used identically by nav, sections, and footer. One breakpoint at 920px collapses every multi-column grid to a single column and swaps nav links for a burger + full-width sheet.

Spatial grammar is editorial, not card-grid: pillars and boundaries render as hairline-ruled rows in asymmetric two-column grids (roughly 0.9fr / 1.35fr, head left, detail right). Section vertical rhythm is generous — 6.5–7rem padding on desktop, 4.5rem under 920px. The hero is a 1.08fr/0.92fr grid (copy left, dossier card right) topped by a fixed 76px nav (`--nav-h`), with a 3-stat fact band under a white-alpha hairline. Pillar pages repeat the pattern: gradient hero with a giant ghost numeral (clamp(16rem, 30vw, 26rem) at 10% sky-blue) parked off the right edge, then ruled service blocks, then a prev/next band on #f4f8ff.

Motion is one authored moment: hero children rise 22px with a 0.9–1s stagger (0 / 0.12s / 0.22s / 0.3s delays), and scroll sections reveal via IntersectionObserver (`.reveal`: 18px rise, 0.7s, per-element `--reveal-delay`). Everything eases with `cubic-bezier(0.16, 1, 0.3, 1)`; hovers run 0.2–0.35s. `prefers-reduced-motion` collapses all animation and smooth scroll.

## Elevation & Depth

A hybrid, used sparingly. Content sections are flat, separated by hairlines and tint changes (white ↔ #f4f8ff ↔ navy field). Shadows exist only to float a surface off a brand field or to give buttons physical presence — and every shadow is tinted with brand navy or vivid blue, never neutral black.

### Shadow Vocabulary
- **Card** (`box-shadow: 0 1px 2px rgba(4,18,63,0.06), 0 12px 32px -12px rgba(4,18,63,0.18)`): the default resting card shadow (`--shadow-card`).
- **Float** (`box-shadow: 0 2px 6px rgba(3,12,42,0.25), 0 32px 72px -28px rgba(3,12,42,0.55)`): the hero dossier card lifting off the gradient (`--shadow-float`), backed by a translucent offset "sheet" (white 12%, 1px white-18% border, translated 16px/14px).
- **Button-blue** (`0 1px 2px rgba(10,87,231,0.35), 0 10px 24px -10px rgba(10,87,231,0.55)`): primary button and the numbered step discs — the shadow glows in the button's own blue.
- **Button-light** (`0 1px 2px rgba(3,12,42,0.3), 0 10px 28px -12px rgba(3,12,42,0.55)`): white button on navy; deepens slightly on hover.

Depth also comes from material: the scrolled/open nav is `rgba(4,18,63,0.9)` with 14px backdrop blur.

### Named Rules
**The Tinted Shadow Rule.** No shadow uses neutral black. Shadows on white are navy-tinted (rgba(4,18,63,…) / rgba(3,12,42,…)); shadows under blue elements are blue-tinted (rgba(10,87,231,…)).

## Shapes

Soft, confident geometry. Interactive capsules are full pills (999px): all buttons, status pills, numbered service chips. Panels and cards use generous radii — 20px (`--radius-lg`) for hero-grade cards, 14px (`--radius-md`) for inline panels, notices, hover washes, and the pillar-boundary block. Small squares (icon chips, logo mark) take 12px; circular elements (step numbers, check discs, status icons) are true circles. Borders are 1px hairlines everywhere; on navy fields they become white at 8–38% alpha. Icons are authored 24px-grid SVGs at stroke-width 1.75, round caps and joins, `stroke: currentColor`, typically 16–22px rendered.

## Components

### Buttons
- **Shape:** full pill (999px radius), inline-flex with 0.55rem icon gap; weight 500, 1rem.
- **Primary:** Vivid Blue (#0a57e7) on white text, blue-glow shadow, padding 0.85rem 1.6rem; hover lightens to #2d6ff0.
- **Light (on brand fields):** white background, Brand Navy text, navy-tinted shadow that deepens on hover.
- **Ghost (on brand fields):** transparent, white text, 1px white-38% border; hover brightens border to 75% and adds white-8% wash; trailing arrow icon slides 3px right.
- **Hover / Focus:** all buttons lift -1px (`translateY`), settle on :active; transitions 0.25s on `cubic-bezier(0.16,1,0.3,1)`. Focus everywhere is a 2px #2d6ff0 outline, 3px offset.
- **Sizes:** sm (0.6rem 1.15rem / 0.9375rem), lg (1rem 2rem / 1.0625rem).

### Chips
- **Number chip:** service numerals ("1.1") — tabular 700 figures in Vivid Blue on Tint Panel (#eef4ff), pill radius, 0.18rem 0.6rem.
- **Status pill:** 0.7813rem, 500, pill radius; done = green on green tint, active = blue on #eef4ff, scheduled = Ink Soft on #f4f8ff. Status icon discs (26px circles) mirror the same three fills.

### Cards / Containers
- **Corner Style:** 20px for the hero dossier card; 14px for pain panels, notices, boundary blocks.
- **Background:** white cards; #f4f8ff panels with 1px #eef4ff border; navy (#04123f) for the pillar-boundary block; white-8% with white-18% border for notices on navy.
- **Shadow Strategy:** Card at rest, Float only for the hero dossier (see Elevation); tinted panels carry no shadow.
- **Internal Padding:** ~1.5–2rem.

### Navigation
- Fixed, transparent over the hero; gains `rgba(4,18,63,0.9)` + 14px blur + top hairline once scrolled or open. 76px tall, brand logo (white, 58px) + two-line wordmark (700 white / 0.72rem Sky Accent). Links: Ink On Navy, 500, 0.9688rem, hover to white. PT/EN toggle always visible; current language white, other muted. Under 920px: 44px two-bar burger (bars rotate to an X), full-width navy-96% sheet with hairline-separated 1.15rem links and a light-button CTA.

### Inputs / Fields
- None shipped; the site's only conversion surface is the contact CTA. Follow focus-ring and hairline conventions when inputs are added.

### Dossier Card (signature)
The hero's proof object: a white 20px-radius card under Float shadow, backed by a translucent offset sheet (16px/14px offset, white-12%). Header row: 52px #eef4ff rounded-square logo chip + 700 title + soft note, under a hairline. Body: checklist rows (0.78rem vertical padding, #eef4ff row hairlines) of real deliverables, each with a 26px circular state icon and a right-aligned status pill in the three-state color grammar.

### Service Row (signature)
Home-page service listing: number chip + title (500) + pain line (Ink Soft, 0.9063rem), padded 1.05rem with -1rem negative inline margin so the 14px-radius hover wash (#f4f8ff) bleeds past the text column; a Vivid Blue arrow fades/slides in on hover.

## Do's and Don'ts

### Do:
- **Do** keep every surface inside the blue field: navy #04123f, vivid blue #0a57e7, white, and the #f4f8ff/#eef4ff/#dce6f7 tint ramp; confirmation green only for completed states.
- **Do** build gradient brand fields from the house recipe — 140–155° navy→blue linear base plus 1–2 vivid-blue radial blooms at the corners — and reserve them for hero/CTA-grade moments.
- **Do** use pills for every interactive capsule, 20px/14px radii for cards/panels, and 1px hairlines (never heavier) for structure.
- **Do** author icons on the 24px grid at 1.75 stroke, round caps, `currentColor`.
- **Do** keep motion to the established grammar: rise-and-fade (18–22px), `cubic-bezier(0.16,1,0.3,1)`, staggered delays, fully disabled under `prefers-reduced-motion`.
- **Do** tint every shadow with navy or the element's own blue, and set `tabular-nums` on working numerals.

### Don't:
- **Don't** introduce neutral grays, warm hues, or a second accent; secondary text and lines are blue-cast ink, not gray.
- **Don't** put gradient fields behind ordinary content sections — content sits flat on white or #f4f8ff.
- **Don't** use a second typeface, positive tracking at display sizes, or weights outside 400/500/700.
- **Don't** replace the ruled-row editorial layout with uniform card grids; pillars, boundaries, and services are hairline-separated rows.
- **Don't** add hard black shadows, borders heavier than 1px, or sharp corners on interactive elements.
- **Don't** fabricate clients, stats, or contacts — placeholder facts stay visibly marked, in both languages equally.
