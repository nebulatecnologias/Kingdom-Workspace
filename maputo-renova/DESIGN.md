---
name: Maputo Renova
description: Billing and collections desk for a condominium portfolio, where every payment rail is its own counter.
colors:
  brand: "#11804a"
  brand-strong: "#0e6b3a"
  brand-deep: "#0b4f2c"
  brand-soft: "#e7f4ec"
  brand-tint: "#c9e7d5"
  ground: "#f4f6f5"
  surface: "#ffffff"
  sunken: "#f6f7f6"
  line: "#e5e9e6"
  line-strong: "#d3d9d5"
  ink: "#111714"
  ink-2: "#4a544f"
  ink-3: "#646e68"
  mpesa: "#c2271f"
  mpesa-bar: "#ef9a93"
  emola: "#f2b705"
  emola-tag-ink: "#2a2000"
  emola-bar: "#f8da7a"
  banco: "#3a5c8f"
  banco-bar: "#a9bddb"
  caixa: "#5b645f"
  caixa-soft: "#eef0ef"
  caixa-bar: "#c6ccc8"
  danger: "#a3185e"
  danger-soft: "#fbeaf2"
  warn: "#b45309"
  warn-soft: "#fff4e5"
  info: "#0f6670"
  info-soft: "#e3f2f3"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "\"tnum\", \"cv11\", \"ss01\""
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.43
    fontFeature: "\"cv11\", \"ss01\""
  body-small:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.33
  channel-tag:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "10.5px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.04em"
  data-id:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  tag: "4px"
  bar: "8px"
  tile: "12px"
  card: "16px"
  canvas: "22px"
  pill: "9999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  card: "20px"
  canvas: "28px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.brand-strong}"
  button-primary-active:
    backgroundColor: "{colors.brand-deep}"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.line}"
  button-ghost:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  button-ghost-hover:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "20px"
  tile:
    backgroundColor: "{colors.sunken}"
    rounded: "{rounded.tile}"
    padding: "14px"
  channel-tag-mpesa:
    backgroundColor: "{colors.mpesa}"
    textColor: "{colors.surface}"
    typography: "{typography.channel-tag}"
    rounded: "{rounded.tag}"
    padding: "0 6px"
    height: "20px"
  channel-tag-emola:
    backgroundColor: "{colors.emola}"
    textColor: "{colors.emola-tag-ink}"
    typography: "{typography.channel-tag}"
    rounded: "{rounded.tag}"
    padding: "0 6px"
    height: "20px"
  channel-tag-banco:
    backgroundColor: "{colors.banco}"
    textColor: "{colors.surface}"
    typography: "{typography.channel-tag}"
    rounded: "{rounded.tag}"
    padding: "0 6px"
    height: "20px"
  channel-tag-numerario:
    backgroundColor: "{colors.caixa}"
    textColor: "{colors.surface}"
    typography: "{typography.channel-tag}"
    rounded: "{rounded.tag}"
    padding: "0 6px"
    height: "20px"
  pill-ok:
    backgroundColor: "{colors.brand-soft}"
    textColor: "{colors.brand-strong}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "24px"
  pill-warn:
    backgroundColor: "{colors.warn-soft}"
    textColor: "{colors.warn}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "24px"
  pill-danger:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "24px"
  pill-info:
    backgroundColor: "{colors.info-soft}"
    textColor: "{colors.info}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "24px"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    padding: "0 12px"
    height: "40px"
  input-search:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 56px 0 40px"
    height: "40px"
  nav-item-active:
    backgroundColor: "{colors.brand-soft}"
    textColor: "{colors.brand-strong}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "40px"
---

# Design System: Maputo Renova

## Overview

**Creative North Star: "The Row of Counters"**

The system is a light, calm fintech desk on a near-white cool ground, with one thing that sets it apart: every payment rail is a counter (balcão) with its own painted sign. M-Pesa, e-Mola, Banco and Numerário each carry a fixed colour, and that colour follows the money everywhere it appears: the sign on a feed row, the segment in a stacked bar, the booth tile with today's float. Totals are never one blended number in one green. They are built from these channel colours, so every amount can be traced back to its rail.

Density is operational, not editorial. White cards (16px radius, a hairline border, a near-invisible shadow) sit on the ground with 10–20px gutters. Numbers are big, semibold and tabular. Copy is plain Portuguese in sentence case. Green does the system's own work: actions, selection, and settled or healthy state. Status gets its own distinct hues (burnt orange, magenta-crimson, teal), so no status colour ever reads as a channel. Motion is reserved for state changes: a payment arriving, a count bumping, a panel entering. Each one lasts about 180–240ms, eases out, and resolves to its final state under reduced motion.

The data is sample data and the interface says so. A dashed "Dados fictícios" tag with an e-Mola-yellow dot sits permanently in the top bar.

**Key Characteristics:**
- One cool-neutral ground (`ground`) under white cards; flat tonal layering with only hairline borders and a whisper shadow.
- Four channel identities as solid, squared painted-sign tags in bold short caps.
- Green means action, selection, or settled state. Red belongs to M-Pesa alone.
- Geist throughout with tabular numerals. Geist Mono only for transaction IDs and payment references.
- Pill-shaped controls (buttons, nav items, search, selects) against squarer containers (tiles 12px, cards 16px, tags 4px).

## Colors

A cool green-grey neutral world with one green for the system's own voice, four channel hues that belong only to their rails, and three status hues chosen so none of them can be mistaken for a channel.

### Primary
- **Counter Green** (`brand`): primary buttons, the active nav item and its left rail marker, focus rings, caret, checkbox accent, the "Reconciliado" pill, "Aberto" booth status, positive deltas, inline action links (in `brand-strong`), healthy collection-rate bars, and the brand mark.
- **Deep Ledger Green** (`brand-strong`, `brand-deep`): hover and active steps of the primary button, green link text, and the solid fill of the sidebar "Fecho" card.
- **Reconciled Wash** (`brand-soft`, `brand-tint`): selected nav background, ok pills, positive-delta chips, the live-arrival row flash, the avatar disc, and text selection.

### Secondary (channel identities)
- **M-Pesa Red** (`mpesa`, chart rest tone `mpesa-bar`): the M-Pesa sign and its chart segment. The only red in the system.
- **e-Mola Gold** (`emola`, tag ink `emola-tag-ink`, chart rest tone `emola-bar`): a golden yellow with near-black ink on the tag. It is deliberately yellow, not orange, so it cannot be read as warning.
- **Banco Slate** (`banco`, `banco-bar`): bank transfers. Slate blue, kept clearly apart from the teal info hue.
- **Numerário Stone** (`caixa`, `caixa-bar`, `caixa-soft`): cash at the office. A neutral grey sign. `caixa-soft` also backs the neutral pill.

On the stacked chart, the highlighted month uses the solid channel colours and every other month uses the `-bar` rest tones.

### Tertiary (status)
- **Burnt Orange Warning** (`warn`, `warn-soft`): payments to reconcile, partial payments, the exceptions count badge, and the 31–60 day ageing bucket.
- **Magenta-Crimson Danger** (`danger`, `danger-soft`): unidentified payers, overdue 90+ days, negative deltas, low collection rates, and the notification dot.
- **Deep Teal Info** (`info`, `info-soft`): neutral-informative items such as agreement instalments due today.
- **Ageing ramp:** debt-age buckets go from `warn` at 50% opacity, to `warn`, to `danger` at 70%, to `danger`. Severity runs orange to crimson and never touches a channel hue.

### Neutral
- **Cool Ground** (`ground`): the rounded main canvas behind all cards.
- **Paper White** (`surface`): cards, the app frame, the sidebar and top bar, and the icon tiles in card headers.
- **Sunken Grey** (`sunken`): open booth tiles, table header bands, the search field at rest, secondary buttons, and the chart summary strip.
- **Hairline** (`line`, `line-strong`): card borders, dividers, dashed chart gridlines, and dashed outlines for closed booths and the sample tag.
- **Ink ramp** (`ink`, `ink-2`, `ink-3`): primary text and the dark button, secondary text, then captions, column headers and axis labels.

### Named Rules
**The One Red Rule.** Red (`mpesa`) means M-Pesa and nothing else. Danger is magenta-crimson (`danger`), never red.

**The Sign Belongs to the Rail Rule.** A channel colour appears only where that channel's money is shown: its tag, its chart segment, its booth. Never use a channel hue for status, decoration or emphasis.

**The Green Is the System Rule.** Green marks what the system or the user does or has settled: primary actions, selection, reconciled or healthy state. It never stands for a channel or a severity.

## Typography

**Display Font:** Geist (with ui-sans-serif, system-ui)
**Body Font:** Geist
**Label/Mono Font:** Geist Mono, used for data identifiers only

**Character:** A single neutral grotesk set tight at large sizes, with tabular figures, `cv11` and `ss01`. The numbers carry the page. Mono shows up only where a string has to be matched character by character.

### Hierarchy
- **Display** (600, 40px, 36px below `sm`, line-height 1, -0.03em): the hero amount ("Cobrado em Outubro"). The currency unit "MT" is set smaller (20px, 500, `ink-3`).
- **Headline** (600, 28px, 26px below `sm`, -0.02em): page titles. The same 28px is used for the counts in the "Precisa de si hoje" strip. Secondary KPI amounts step down to 30, 24, 22 and 20px.
- **Title** (600, 17px, -0.01em): card titles next to their icon tile, and booth amounts. Section heads inside a card use 15px or 14px semibold.
- **Body** (400, 14px): table cells, form text, nav labels (14.5px). Supporting detail is 13px in `ink-3`.
- **Label** (500, 12px, sentence case, `ink-3`): column headers, nav group names, captions, pills.
- **Channel tag** (700, 10.5px, 11.5px at md size, +0.04em, short caps from data): the only uppercase text in the system.
- **Data ID** (Geist Mono, 400, 11.5–13px, `ink-2`): transaction IDs and payment references.

### Named Rules
**The Mono Is Data Rule.** Geist Mono is only for transaction IDs and payment references. Never use it for labels, numbers or decoration.

**The Tabular Rule.** Every amount, count, percentage and axis tick uses tabular numerals. Amounts follow the `12 500,00 MT` format.

**The Only Caps Rule.** Uppercase belongs to the channel signs. Labels, headers and group names stay in sentence case.

## Layout

The app is a fixed frame. On desktop there is a white sidebar 264px wide, sticky at full viewport height, next to a 72px top bar. Main content sits on a `ground` canvas with 22px rounded corners, inset 12px from the right and bottom edges and padded 28px. Below `lg` the sidebar becomes a 284px drawer over a 30% ink scrim, opened from a round menu button. Search collapses to an icon below `sm`, and the condomínio selector hides below `md`.

Content stacks full-width strips, such as the three-segment "Precisa de si hoje" panel with internal dividers, over a 12-column grid of cards with 16–20px gaps. Cards pad 20px. Two-up tile grids inside cards use 10px gaps. Tables run edge to edge inside their card, with a sunken header band, 40px header rows and 56px body rows. On mobile, tables turn into stacked row lists.

## Elevation & Depth

Depth comes from tone, not shadow: white cards on a cool ground, sunken tiles inside white cards, hairline borders everywhere. Cards carry a shadow so faint it reads as a crisp edge. Real lift is reserved for things that float above the page.

### Shadow Vocabulary
- **Card edge** (`box-shadow: 0 1px 2px rgb(17 23 20 / 0.04), 0 1px 1px rgb(17 23 20 / 0.02)`): every card, always paired with a 1px `line` border.
- **Pop** (`box-shadow: 0 12px 32px -8px rgb(17 23 20 / 0.18), 0 2px 6px rgb(17 23 20 / 0.08)`): the mobile navigation drawer and other overlays only.

### Named Rules
**The No Nested Cards Rule.** A card never contains another card. Groupings inside a card are sunken tiles (`sunken`, 12px radius, no border, no shadow), dashed tiles for closed or empty states, or divided rows.

## Shapes

There are two shape families. Interactive controls are fully round pills: buttons, nav items, search, selects, filter chips, status pills, count badges and the avatar. Containers are softly squared, getting rounder as they get bigger: channel tags 4px, chart bar tops 8px, icon tiles and inner tiles 12px, cards 16px, the main canvas 22px. Borders are 1px hairlines. Dashed borders mean a closed booth, gridlines, or sample data.

## Components

### Buttons
Quiet and round. They look like controls, not banners.
- **Shape:** full pill. 40px tall with 16px side padding (md), or 32px with 12px padding and 13px text (sm). 14px medium label with an optional 16px leading Lucide icon.
- **Primary:** `brand` with white text. Hover goes to `brand-strong`, active to `brand-deep`. Use it for the screen's main forward actions (Emitir facturas, Registar pagamento).
- **Dark:** `ink` with white text, for neutral heavy actions (Exportar). Hover is a slightly lifted ink.
- **Secondary:** `sunken` with a `line` border. **Ghost:** `ink-2` text with a `sunken` hover.
- **Hover / Focus:** 150ms colour transitions. Focus is a 2px `brand` outline at 2px offset. Disabled is 50% opacity.
- **Outline chips** (Fecho do dia, Ver todos, Últimos 12 meses): 32px pills with a `line` border, 13px medium `ink-2` text and a `sunken` hover.

### Channel Tags (signature)
A solid painted sign, the way an agent booth is signed. All four tags are one family: a 4px radius, bold short caps (M-PESA, E-MOLA, BANCO, NUMERÁRIO), +0.04em tracking, 20px tall with 6px padding (24px and 8px at md size), and a solid fill in the channel colour. M-Pesa, Banco and Numerário use white ink. e-Mola uses near-black ink on gold. Tags never change shape or style between surfaces.

### Status Pills
24px round pills with a 6px dot and 12px medium text, in ok, warn, danger, info or neutral tones (soft background, strong text). The dot pulses (`ticking`, 0.9s) only while a live payment is still in flight. **Deltas** use the same pill form with a signed tabular percentage and an arrow: green when the change is good, crimson when it is bad, with `goodWhen` choosing the direction.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** `surface` on the `ground` canvas.
- **Shadow Strategy:** card edge (see Elevation & Depth).
- **Border:** 1px `line`.
- **Internal Padding:** 20px. Each card opens with a header row: a 40px icon tile (12px radius, `line` border, 18px Lucide icon at 1.6 stroke), a 17px semibold title, and actions on the right.

### Booth Tiles
Inner tiles for each channel's day. An open booth is a `sunken` 12px tile with 14px padding. It shows the channel tag at top left, today's float in 17px tabular semibold, the count and the last payment in 12px `ink-3`, and "Aberto" in green. A closed booth is a dashed `line-strong` outline on white with a lock icon, its amount muted to `ink-2`. When a live payment lands, the tile replays the arrival flash.

### Inputs / Fields
- **Style:** form fields are 40px tall with a 12px radius, a `line` border and a white fill. The top-bar search and the selects are pills. The search rests on `sunken` and turns white on focus.
- **Focus:** the border shifts to `brand`. The caret is green.
- **Selection:** checkboxes use the `brand` accent.

### Navigation
The sidebar has grouped sections (Principal, Carteira, Geral) with 12px `ink-3` group labels. Items are 40px pills with an 18px Lucide icon and a 14.5px label in `ink-2`, with a `sunken` hover. The active item gets a `brand-soft` fill, `brand-strong` medium text, and a 4px green rail marker at the sidebar's left edge. Count badges are 20px round tabular chips: `warn-soft` for exceptions, `sunken` for debtors. The bottom "Fecho do mês" card is the one solid-green surface. It holds a white progress bar and a white pill link.

### Live Arrival
A new payment enters at the top of the feed with the `arrive` animation (1.6s): a `brand-soft` wash, a 6px drop-in and a fade to transparent. Counts bump 2px in `brand-strong`. Its pill steps through Recebido, then A reconciliar, then Reconciliado (or drops to exceptions). Under reduced motion, every animation is removed and only final states render.

### Sample Data Tag
A 28px dashed-outline pill with a 6px `emola` dot and the text "Dados fictícios" in 12px medium `ink-2`. It is always present in the top bar while the data is fictitious.

## Do's and Don'ts

### Do:
- **Do** show every channel's money with its own sign and colour: the tag in rows, the solid segment in the highlighted chart month, the `-bar` tone at rest.
- **Do** keep all four channel tags identical in form: 4px radius, bold short caps, solid fill.
- **Do** use `danger` (#a3185e) for bad states and `warn` (#b45309) for needs-attention states, and keep e-Mola gold (#f2b705) for e-Mola alone.
- **Do** set every amount in tabular numerals with the `MT` unit, and put transaction IDs and references in Geist Mono.
- **Do** group content inside a card with sunken 12px tiles or divided rows.
- **Do** keep the "Dados fictícios" tag in the top bar while data is sample data.
- **Do** keep motion to 150–240ms ease-out state changes, and render final states under `prefers-reduced-motion`.

### Don't:
- **Don't** use red for anything but M-Pesa. Not for errors, debt, or the notification dot.
- **Don't** use green for a channel, a severity, or decoration. It is for action, selection, and settled state.
- **Don't** put a card inside a card.
- **Don't** use mono for labels, headings, or amounts.
- **Don't** add uppercase labels or eyebrow text above headings. Uppercase belongs only to channel signs.
- **Don't** show one blended revenue total in a single colour where the amount could be split by channel.
- **Don't** use the pop shadow on cards at rest.
