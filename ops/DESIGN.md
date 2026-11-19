---
name: Kingdom Ops
description: A pocket operations board in grey, black and white, where an 8 px dot is the only colour.
colors:
  ground: "#ffffff"
  canvas: "#f3f4f6"
  card: "#f4f4f5"
  card-2: "#ebebed"
  surface: "#ffffff"
  sunken: "#f9fafb"
  line: "#e5e7eb"
  line-strong: "#d1d5db"
  ink: "#111827"
  ink-2: "#374151"
  muted: "#5b6370"
  faint: "#8b919c"
  inverted: "#111827"
  inverted-hover: "#1f2937"
  on-inverted: "#ffffff"
  inverted-muted: "#a1a7b3"
  inverted-line: "#374151"
  tone-neutral: "#9ca3af"
  tone-info: "#2f6fcf"
  tone-warning: "#b7791f"
  tone-danger: "#c0392b"
  tone-success: "#2f855a"
  selection: "#d1d5db"
typography:
  display:
    fontFamily: "Inter, Segoe UI, Roboto, system-ui, -apple-system, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, Segoe UI, Roboto, system-ui, -apple-system, sans-serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Inter, Segoe UI, Roboto, system-ui, -apple-system, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.012em"
  row-title:
    fontFamily: "Inter, Segoe UI, Roboto, system-ui, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.35
  numeral:
    fontFamily: "Inter, Segoe UI, Roboto, system-ui, -apple-system, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  body:
    fontFamily: "Inter, Segoe UI, Roboto, system-ui, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "cv11, ss01"
  body-sm:
    fontFamily: "Inter, Segoe UI, Roboto, system-ui, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, Segoe UI, Roboto, system-ui, -apple-system, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  section:
    fontFamily: "Inter, Segoe UI, Roboto, system-ui, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.4
  caption:
    fontFamily: "Inter, Segoe UI, Roboto, system-ui, -apple-system, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.4
  overline:
    fontFamily: "Inter, Segoe UI, Roboto, system-ui, -apple-system, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.05em"
rounded:
  pill: "999px"
  sheet: "28px"
  xl: "24px"
  lg: "20px"
  md: "16px"
  btn: "14px"
  sm: "12px"
  inner: "11px"
  check: "7px"
spacing:
  xxs: "2px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "18px"
  xxl: "22px"
  xxxl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.inverted}"
    textColor: "{colors.on-inverted}"
    rounded: "{rounded.btn}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.inverted-hover}"
  button-primary-lg:
    backgroundColor: "{colors.inverted}"
    textColor: "{colors.on-inverted}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "50px"
  button-ghost:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.btn}"
    padding: "0 16px"
    height: "44px"
  button-ghost-hover:
    backgroundColor: "{colors.card-2}"
  button-quiet:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.btn}"
    padding: "0 16px"
    height: "44px"
  button-quiet-hover:
    backgroundColor: "{colors.card}"
  button-on-dark:
    backgroundColor: "{colors.on-inverted}"
    textColor: "{colors.inverted}"
    rounded: "{rounded.btn}"
    padding: "0 16px"
    height: "44px"
  button-on-dark-ghost:
    textColor: "{colors.on-inverted}"
    rounded: "{rounded.btn}"
    padding: "0 16px"
    height: "44px"
  button-sm:
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "44px"
  button-icon:
    rounded: "{rounded.btn}"
    size: "44px"
  fab:
    backgroundColor: "{colors.inverted}"
    textColor: "{colors.on-inverted}"
    rounded: "{rounded.pill}"
    size: "64px"
  pill-stage:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "0 10px 0 9px"
    height: "26px"
  chip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "0 14px 0 8px"
    height: "44px"
  chip-hover:
    backgroundColor: "{colors.card-2}"
  chip-selected:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
  tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "44px"
  avatar:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "32px"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.lg}"
    padding: "16px"
  card-hover:
    backgroundColor: "{colors.card-2}"
  row:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.lg}"
    padding: "12px 14px 12px 12px"
    height: "68px"
  next-card:
    backgroundColor: "{colors.inverted}"
    textColor: "{colors.on-inverted}"
    rounded: "{rounded.xl}"
    padding: "18px 18px 16px"
  card-item:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.md}"
    padding: "14px 14px 12px"
  card-item-desktop:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "14px 14px 12px"
  stage-col:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.lg}"
    padding: "8px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "44px"
  input-on-ground:
    backgroundColor: "{colors.card}"
  radio-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.sm}"
    height: "58px"
  radio-card-selected:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
  segmented:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.btn}"
    padding: "2px"
  segmented-item-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.inner}"
    height: "44px"
  day-chip:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.btn}"
    height: "44px"
  day-chip-selected:
    backgroundColor: "{colors.inverted}"
    textColor: "{colors.on-inverted}"
    rounded: "{rounded.pill}"
    size: "36px"
  tabbar:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.xl}"
    padding: "6px"
    height: "64px"
  tab-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "18px"
    padding: "0 14px"
  nav-item:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "40px"
  nav-item-hover:
    backgroundColor: "{colors.card-2}"
    textColor: "{colors.ink}"
  nav-item-active:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
  panel:
    backgroundColor: "{colors.ground}"
    rounded: "{rounded.xl}"
  sheet:
    backgroundColor: "{colors.ground}"
    rounded: "{rounded.sheet}"
    padding: "8px 16px 16px"
  toast:
    backgroundColor: "{colors.inverted}"
    textColor: "{colors.on-inverted}"
    rounded: "{rounded.btn}"
    padding: "10px 14px"
  alert:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
---

# Design System: Kingdom Ops

## Overview

**Creative North Star: "The Pocket Ops Board"**

Kingdom Ops is an operations board that fits in a pocket. It opens on what is next, not on a calendar, and it says everything in grey, black and white. The ground is white on the phone and inside the desktop panel; content sits in soft grey cards (`card`) with no borders and no shadows, and inside a grey card the row's icon or initials sit in a white circle. Hierarchy is made by surface tone (white on grey, grey on white), by weight (600 for anything that names something, 400 for the rest) and by space, never by lines or colour. The pinned "Good morning" reference supplies the phone language: greeting with a 48 px avatar, circular day chips, a floating grey pill tab bar with one white active chip, a separate black "+" button. The desktop keeps the Cal.com shell: a grey frame, a flat sidebar whose active item is a white chip, and the content in a white 24 px rounded panel.

Black is spent carefully. Per screen, there is at most one black card (the "A seguir" card on Início) and one black button (the page's primary action on desktop, the "+" FAB on the phone). Everything else is white or grey. Colour exists only as an 8 px dot beside a word: five desaturated tones (neutral, info, warning, danger, success) inside white stage pills, kanban column heads, chart labels and sidebar pipeline items. The dot never carries meaning alone; the text next to it does.

The world refuses the category defaults it was built against: no hero greeting above a month calendar, no row of same-size metric tiles, no bordered white cards on a grey page, no coloured pills or badges. UI copy is pt-PT throughout (the `T` object in `app.js`); this document is in English.

**Key Characteristics:**
- Grey, black and white only: `ground` white, `card` grey, `inverted` black. Colour is confined to 8 px status dots.
- Soft grey cards with no border and no shadow, 20 px radius; white 44 px circular tiles inside them.
- One black "A seguir" card and one black primary button per screen at most; the phone adds one black circular "+" FAB.
- Inter at 15 px body, 600-weight titles with -0.02 em tracking, tabular numerals for every time, count and amount.
- Floating grey pill tab bar on the phone (active tab is a white chip with icon and label); flat sidebar with a white active chip on desktop.
- Selection is always white with a 1.5 px ink inset ring (chips, radio cards), except the selected day in the week strip, which is a black circle.
- Lucide icons, 18 px, stroke 1.8 (2.1 when active).
- Light theme only in the published artifact. A dark token set exists in `styles.css` but is disabled by `data-theme="light"` and unreviewed.

## Colors

A single cool-grey ramp from white to near-black, with five desaturated tones that appear only as dots.

### Primary
- **Ink Black** (`inverted`, also `ink`): the one primary button per screen, the "A seguir" card, the "+" FAB, the selected day circle, toasts, the checked toggle and checkbox, the logo mark and the primary heading colour. Hover on the primary button lightens one step to `inverted-hover`.
- **On Black** (`on-inverted`, `inverted-muted`, `inverted-line`): white text, muted grey-blue metadata and the hairline ghost-button border inside black surfaces only.

### Tertiary (status dots)
- **Neutral** (`tone-neutral`): Agendado, planned, draft. The default dot.
- **Info** (`tone-info`): Em curso, meetings pipeline, online.
- **Warning** (`tone-warning`): Adiada, needs a date, alert icon.
- **Danger** (`tone-danger`): Cancelada, overdue, field error dot and error border.
- **Success** (`tone-success`): Concluída, done.
These five colours are painted only on `.dot` (8 px circle), on alert icons and on the error border of an invalid field. They never fill a pill, a button, a bar or a background.

### Neutral
- **Ground White** (`ground`): the phone page, the desktop content panel, the active sidebar chip, the bottom sheet and the tab bar's active chip.
- **Desktop Frame** (`canvas`): the grey behind the white panel on desktop only (and the phone-preview backdrop in the prototype).
- **Soft Grey Card** (`card`): every card, row, grey ghost button, chip, kanban column, segmented track and the phone tab bar. **Pressed Card** (`card-2`) is its hover and pressed state and the drop-target fill.
- **White Surface** (`surface`): what sits on grey: circular tiles, stage pills, inputs, radio cards, the active segment, kanban card items on desktop, the avatar inside a chip.
- **Sunken** (`sunken`): declared, lightly used; keep for a recessed well when needed.
- **Rules** (`line`, `line-strong`): the only lines in the system: row separators in the counts card, table rules, repeat-row separators inside a grey card, the sheet handle, the toggle track, the unchecked checkbox border, the "today" ring in the week strip and the dashed drop outline.
- **Ink ramp** (`ink`, `ink-2`, `muted`, `faint`): headings and values (`ink`), labels, chip text and bar fills (`ink-2`), secondary text and section labels (`muted`, at least 5.5:1 on `card`), icon-only and separator uses (`faint`, chevrons, grips and the "·" between counts; never readable text).
- **Selection** (`selection`): text selection highlight.

### Named Rules
**The Dot Is The Only Colour Rule.** Status colour lives in an 8 px dot next to a word, in a white pill or label. No coloured fills, no coloured text, no coloured bars. If a tone needs to be shown, add a dot; if the dot is not enough, change the words.

**The One Black Rule.** A screen carries at most one black card (the "A seguir" card) and one black button (desktop primary or the phone "+"). A second call to action is a grey ghost button.

**The Tone, Not Line Rule.** Containers separate by surface tone: grey on white, white on grey. Lines appear only inside a grey card to separate repeated rows, never as a card border.

## Typography

**Display Font:** Inter (with Segoe UI, Roboto, system-ui)
**Body Font:** Inter (same stack)
**Label/Mono Font:** none; numbers use Inter with `tabular-nums`.

**Character:** One neutral grotesque at three weights (400, 500, 600) with `cv11` and `ss01` on. Authority comes from 600 weight and tight tracking on titles, never from size jumps; the whole ramp sits between 11 px and 26 px.

The prototype loads Inter 400/500/600 from Google Fonts with `display=swap`; the Next.js build should self-host it via `next/font` with the same three weights.

### Hierarchy
- **Display** (600, 26 px, 1.15, -0.02 em): the page greeting and page titles on desktop; 24 px in the phone page head. Balanced wrapping. The minutes document title uses 22 px with the same tracking.
- **Headline** (600, 19 px, -0.015 em): the subject inside the "A seguir" card.
- **Title** (600, 17 px, 1.3, -0.012 em): card and sheet titles; 16 px centred in the phone top bar.
- **Row title** (600, 15 px, 1.35): the first line of every row, meeting card and kanban card item, clamped to two lines.
- **Numeral** (600, 20 px, -0.02 em, tabular): the four counts on the desktop Início card. Bar values and inline counts are 13-14 px at 600, still tabular.
- **Body** (400, 15 px, 1.5): running text. Secondary lines are 13-14 px in `muted`.
- **Section** (600, 15 px): section heads such as "Hoje" and "Operação"; 14 px inside a card head. The muted 13 px variant is the fieldset label.
- **Label** (500, 13 px): field labels (`ink-2`), chips (13.5 px), tabs and segmented options, button text (14 px, 500).
- **Caption** (400, 12.5 px, `muted`): hints, dates, deltas, the date line above the greeting, the `who` line on cards.
- **Overline** (600, 12 px, +0.05 em, uppercase, `muted`): the period labels in the day timeline ("Manhã", "Tarde"), table headers, sidebar group labels (11.5 px) and the day-of-week letters in the week strip (11 px, 500). These are data and navigation labels, not kickers.

### Named Rules
**The Six Hundred Rule.** Anything that names something (a title, a number, a selected option, an active tab) is weight 600. Weight 700 does not exist in this system. Labels and buttons are 500; everything else is 400.

**The Tabular Time Rule.** Every time, date, count, amount and duration is set with `tabular-nums` so columns of values line up ("10:30 · em 45 min", "5 100 000 MZN").

## Layout

The app is a container (`container-name: app`) with one breakpoint: a container query at 1024 px that mirrors Tailwind `lg`. Below it the layout is a phone; at and above it the layout is the desktop shell.

**Phone (390 reference):** white ground. A 56 px sticky top bar (back, centred 16 px title, action) on inner screens; Início has no top bar, only the date caption, greeting and a 48 px avatar. Page padding is 16 px on the sides (safe-area aware) and 24 px at the bottom, content max-width 1120 px. Sections are 22 px apart with a 10 px gap under their heading. Cards and rows stack with 8 px gaps; form fieldsets stack with 12 px. Chip rows bleed to the edges and scroll horizontally. At the bottom, a sticky wrapper with a white-to-transparent gradient holds the 64 px floating pill tab bar and the 64 px black "+" FAB, 10 px apart, with 18 px above and 12 px plus the safe-area inset below.

**Desktop (1024 px and up, 1440 reference):** the scroll area turns grey (`canvas`). A 232 px sticky sidebar (18 px 12 px 16 px padding; logo, nav, pipelines group, Definições and the user at the foot) sits left; the main column has 10 px of frame around a white panel with 24 px corners filling the viewport height minus 20 px. Inside the panel, pages pad 32 px on the sides and 40 px at the bottom; the page head pads 26 px top, 18 px bottom, with the title left and actions right. The top bar and tab bar are hidden. Início becomes a 7/5 two-column grid with a 24 px gap; `grid-2` becomes two columns with 16 px; the kanban becomes columns of `minmax(250px, 1fr)` with 12 px gaps scrolling horizontally; the team grid becomes two columns; three-field rows become real three-column rows; the week strip caps at 520 px.

**Density:** touch targets are 44 px (`--tap`) on the phone and 40 px on desktop; small buttons drop to 36 px on desktop only. Rows are at least 68 px tall. The rhythm is 2 / 4 / 8 / 12 / 16 / 18 / 22 / 24 px: 8 px between stacked cards, 12 px between fields and inside rows, 16 px card padding, 18 px inside the black card, 22 px between sections, 24 px grid gap on desktop.

## Elevation & Depth

The system is flat. Grey cards have no border and no shadow; depth is tonal (white on grey, grey on white). Shadows exist for exactly four things that float above the page, and for the desktop kanban card on hover.

### Shadow Vocabulary
- **Lift** (`--shadow-lift`: `0 10px 24px -10px rgba(17,24,39,.25)`): the black "A seguir" card and the black "+" FAB.
- **Bar** (`--shadow-bar`: `0 6px 20px -8px rgba(17,24,39,.18)`): the floating pill tab bar.
- **Sheet** (`--shadow-sheet`: `0 -8px 32px -8px rgba(17,24,39,.22)`): the bottom sheet, cast upward.
- **Pop** (`--shadow-pop`: `0 10px 28px -8px rgba(17,24,39,.24), 0 2px 6px rgba(17,24,39,.08)`): toasts and the desktop dialog. (Also the prototype tools, which never ship.)
- **Drag hover** (`0 2px 8px -2px rgba(17,24,39,.12)`): a white kanban card item on desktop when hovered, as the only lift on a static surface.
- **Focus ring** (`--ring`: `0 0 0 2px ground, 0 0 0 4px ink`): every `:focus-visible`, with a 12 px radius. Inputs instead darken their border to `ink` and add `0 0 0 3px rgba(17,24,39,.10)`.
- **Overlay**: `rgba(17,24,39,.42)` behind sheets and dialogs.

### Named Rules
**The Floating Only Rule.** A shadow means the element floats over the page (black card, FAB, tab bar, sheet, toast). A card that sits in the flow is grey and shadowless; a white item on a grey column gets a shadow only while hovered on desktop.

## Shapes

- **Containers:** grey cards and rows are 20 px (`lg`); the black "A seguir" card, the desktop panel and the phone tab bar are 24 px (`xl`); kanban card items and alerts are 16 px (`md`); the bottom sheet is 28 px on its top corners (24 px all round as a desktop dialog).
- **Controls:** buttons are 14 px (`btn`); large buttons 16 px; small buttons, inputs, radio cards, nav items and the focus ring are 12 px (`sm`); segmented tracks, tabs and day chips are 14 px with 11 px inner items; the logo mark is 10 px; the checkbox is 7 px.
- **Circles:** stage pills, chips, avatars, tiles, dots, the FAB, the selected day and the stepper marks are full circles or pills (999px / 50%). The white 44 px circular tile inside a grey card is the signature shape.
- **Borders:** none on containers. Inputs carry a transparent 1 px border that becomes `line-strong` on hover and `ink` on focus. Selection is a 1.5 px inset ring in `ink` (chips, radio cards) or `line-strong` (today in the week strip). The only dashed line is the 2 px drop-target outline during a drag.

## Components

### Buttons
Buttons are quiet rectangles with 14 px corners, 14 px 500-weight text and 8 px icon gap. There is one black button per screen; the rest are grey.
- **Shape:** 14 px radius, 44 px tall on the phone, 40 px on desktop, 16 px side padding. Large is 50 px / 16 px radius / 20 px padding (login). Small is 12 px radius with 12 px padding and 13 px text (36 px tall on desktop). Icon buttons are square at the tap size. Pressed scales to .985; disabled is 50 % opacity.
- **Primary:** `inverted` with white text; hover `inverted-hover`. Used for "Nova reunião", "Criar", "Guardar", "Mover para", "Confirmar" and the login submit. Loading replaces the label with a 16 px white spinner.
- **Ghost:** `card` grey with `ink` text; hover `card-2`. The standard secondary ("Cancelar", "Agenda", "Guardar rascunho"). On a grey card it may switch to `surface` (week nav, "+ Adicionar").
- **Quiet:** transparent `ink-2`, hover `card`. Top-bar back and edit, inline links.
- **Danger:** currently identical to ghost (grey with ink text); the word carries the danger.
- **On dark:** inside the black card, "Abrir" is a white button with black text (hover `#e5e7eb`) and "WhatsApp" is transparent with a 1 px `inverted-line` border and white text (hover white at 8 %).
- **FAB:** a 64 px black circle with a 26 px "+" at stroke 2.2, Lift shadow, pressed scale .94. Phone only, to the right of the tab bar.

### Chips
- **Filter chips** (person filter on Agenda, pipeline switch): 44 px (38 px desktop) grey pills, 13.5 px 500 `ink-2`, with an optional 28 px white avatar at the left (8 px left padding, 14 px right; 16 px both when text only). Hover `card-2`.
- **Selected:** white with a 1.5 px inset `ink` ring and 600 weight; the avatar inverts to grey. Never black.
- **Stage pill:** 26 px white pill, 12 px 500 `ink-2`, an 8 px dot in the stage's tone then the stage name. The only place colour appears. When the stage changes, the pill pulses (scale .9 to 1.06 to 1 over .5 s).
- **Count badge** (inside tabs): an 11.5 px 600 grey pill.

### Cards / Containers
- **Corner Style:** 20 px.
- **Background:** `card` grey on the white ground; hover/pressed `card-2` for tappable rows and meeting cards.
- **Shadow Strategy:** none (see Elevation).
- **Border:** none.
- **Internal Padding:** 16 px (`card-pad`); card heads 14 px 16 px 10 px with a 14 px 600 title; rows 12 px 14 px 12 px 12 px.
- **Row:** a 68 px-minimum flex row: 44 px white circular tile (icon or initials, 14 px 600) at the left, title + 13 px muted sub-line, and a `faint` chevron or a stage pill at the right. Rows stack with 8 px gaps and each row is its own grey card.
- **Meeting card:** a 44 px / 1fr grid: white tile with the owner's initials, 600 title, "14:00–15:00 · company" sub-line, then a foot with place (icon + 12.5 px muted) left and the stage pill right. Past meetings sit at 72 % opacity.
- **Counts card** (desktop Início): one grey card, four label/value lines separated by 1 px `line`, label 14 px with a muted suffix, value 20 px 600 tabular at the right.
- **Bars:** 10 px white track with a 6 px radius on a grey card, `ink-2` fill, 112 px label column (dot + text) and a 28 px 600 value column. The tone lives in the dot, never in the fill.
- **Kanban column (desktop):** a grey 20 px column with 8 px padding, a 13 px 600 head (dot, name, muted count), and white 16 px card items (grip, 600 title, muted sub, foot with clock + date and a grey avatar). On the phone the columns collapse into one list behind a segmented stage switch and the items are grey on white.

### Inputs / Fields
- **Style:** 44 px minimum, 12 px radius, white fill (grey when placed directly on the white ground), 14 px side padding, transparent 1 px border. Labels are 13 px 500 `ink-2` with a 6 px gap; hints 12.5 px `muted`; placeholders `muted`. Textareas are 88 px minimum and resizable. Selects use a custom 16 px chevron.
- **Hover / Focus:** hover shows a `line-strong` border; focus turns it `ink` with a 3 px 10 % ink halo.
- **Error:** border in `tone-danger`; the message is 12.5 px 500 `ink` preceded by an 8 px danger dot. The dot carries the colour, the text stays ink.
- **Radio cards:** 58 px white cards (12 px radius) with an icon over a 12.5 px label in `ink-2`; selected is white with the 1.5 px `ink` ring and 600 weight ("Presencial / Online / Chamada").
- **Toggle:** a 40 × 24 px `line-strong` track with a white 20 px knob; checked turns the track black. **Checkbox:** a 22 px white box, 1.5 px `line-strong` border, 7 px radius; checked is black with a white tick.
- **Repeat rows** (minutes: participants, topics, actions): flat groups separated by a 1 px `line-strong` rule inside the grey fieldset, never nested cards.

### Navigation
- **Phone tab bar:** a sticky 64 px grey pill (24 px radius, 6 px padding, Bar shadow) over a white fade. Four tabs (Início, Agenda, Pipeline, Atas) with 18 px lucide icons; the active tab grows (flex 2.1) into a white 18 px-radius chip showing icon and 13.5 px 600 label; inactive tabs are muted icons only. A separate 64 px black "+" FAB sits to the right. Transition .18 s on the project ease.
- **Phone top bar:** 56 px, white, 44 px quiet icon buttons at both ends and a centred 16 px title.
- **Desktop sidebar:** flat on the grey frame, 232 px, with 40 px items (12 px radius, 14 px 500 `ink-2`, 18 px icon, muted tabular count at the right). Hover `card-2`; active is a white chip with `ink` text and 2.1 stroke icons. The "Pipelines" group is an 11.5 px uppercase muted label followed by 34 px sub-items whose icon is a stage dot. The foot holds Definições and the user row (avatar, 13.5 px name, 12 px muted role).
- **Tabs and segmented switches:** a 2 px-padded grey track (14 px radius) with 44 px options (11 px radius, 13-14 px 500 `muted`); the active option is a white chip with `ink` text. Used for the card page tabs (Detalhes · Ata · Histórico) and the phone's stage switch.
- **Week strip:** seven columns of day chips (14 px radius, hover `card-2`), each with an 11 px uppercase day letter, a 36 px circle with the 15 px number and a 5 px mark under days with meetings. Today has a 1.5 px `line-strong` inset ring; the selected day is a black circle with white 600 text and a black mark. It sits inside a grey card with a month label, "Hoje" and two 36 px white arrow buttons.

### "A seguir" Card (signature)
The one black card in the app, on Início. 24 px corners, 18 px padding, Lift shadow. A 13 px meta row ("A seguir · owner" left, "10:30 · em 45 min" right, time in white 600 tabular, the rest `inverted-muted`), the subject at 19 px 600, the "company · person, role" line at 14 px `inverted-muted`, a 13.5 px location line with a 16 px pin icon, and two full-width 44 px actions 8 px apart: ghost "WhatsApp" (white text, hairline border) and white "Abrir" with an arrow.

### "Mover para" Sheet (signature interaction)
A bottom sheet (white, 28 px top corners, 36 × 4 px `line-strong` handle, Sheet shadow, rises 24 px in .24 s) over a 42 % ink overlay; on desktop it is a 440 px centred dialog with 24 px corners that pops in. It holds the vertical stage stepper: one 50 px row per stage (14 px radius, hover `card`) with a 22 px circular mark (1.5 px `line-strong` border), an 8 px tone dot, the 15 px stage name and a 12 px muted rule hint at the right ("atual", "pede nova data", "pede motivo"). The current stage is muted with a grey-filled mark; the chosen stage gets a black mark with a white tick. Choosing "Adiada" expands inline "Nova data" and "Hora" fields under the row (indented 42 px, grey inputs, fade in); "Cancelada" expands a reason field. The foot is ghost "Cancelar" and black "Confirmar"; on confirm the card's stage pill pulses to its new tone. Desktop also drags card items between columns, with the target column turning `card-2` behind a 2 px dashed outline.

### Activity (card history)
28 px white circular icons joined by a 1 px `line-strong` vertical rule, 13.5 px "what" text, 12 px muted time, and an optional note in a 10 px-radius white box.

### Toast, Alert, Empty
- **Toast:** black 14 px-radius pill with 13.5 px white text and an optional 30 px inline button, Pop shadow, centred above the tab bar (24 px from the bottom on desktop).
- **Alert:** a 16 px-radius grey box with 13.5 px `ink-2` text and a warning or danger icon in its tone (the icon is the dot's equivalent). The info variant is white with an ink icon.
- **Empty state:** centred, 36 px 20 px padding, a 48 px white circle with the icon, a 15 px 600 title, a muted 13.5 px line capped at 36 ch and usually a small primary button.

### Minutes Document (print)
A grey 20 px card (24 px 20 px; 36 px 40 px on desktop) that reads as a document: header with a 22 px title above a `line-strong` rule, 13 px uppercase muted section headings, 14 px tables with `line` rules, a two-column signature block with ink rules, and a 12 px muted sample-data watermark. In print the card background and padding drop away.

### Motion
One easing, `cubic-bezier(.22, 1, .36, 1)`. Background and colour changes take .12-.18 s; the tab chip grows in .18 s; sheets rise in .24 s; toasts rise in .24 s; the dialog pops in .2 s; the stage pill pulses in .5 s; the skeleton shimmers over 1.4 s. `prefers-reduced-motion` collapses all of it to .01 ms.

## Do's and Don'ts

### Do:
- **Do** keep every surface grey, white or black: `ground` white, `card` grey, `inverted` black. Show status with an 8 px dot in one of the five tones next to a word.
- **Do** put at most one black card ("A seguir") and one black button on a screen; on the phone the black "+" FAB is that button.
- **Do** build cards as borderless, shadowless grey 20 px blocks with a 44 px white circular tile for the row's icon or initials, and separate containers by tone, not by lines.
- **Do** mark selection as white with a 1.5 px inset ink ring (chips, radio cards) and the selected day as a black circle; make the active tab or nav item a white chip.
- **Do** set titles at 600 with negative tracking and all times, dates, counts and amounts in tabular numerals; keep Inter at 400/500/600 and self-host it in Next.js.
- **Do** keep 44 px targets on the phone and 40 px on desktop, 16 px card padding, 8 px between cards and 22 px between sections.
- **Do** use the "Mover para" stepper as the stage-change pattern on every pipeline, with the inline date or reason field under the stage that requires it.

### Don't:
- **Don't** fill a pill, badge, button, bar or background with a status colour, and don't colour text. The dot is the only colour.
- **Don't** draw borders or shadows on cards in the flow. Shadows belong only to the black card, the FAB, the tab bar, the sheet and toasts.
- **Don't** select a chip or radio card by turning it black; black means primary action, not selection.
- **Don't** use weight 700, a second typeface, a monospace or sizes above 26 px.
- **Don't** use `faint` for readable text; it is for chevrons, grips and separators only. Use `muted` for secondary text.
- **Don't** open Início on a calendar, a hero greeting or a row of metric tiles; it opens on "A seguir", then "Hoje", then "Operação".
- **Don't** ship the dark token set as-is; it exists in `styles.css` but is disabled by `data-theme="light"` and has not been reviewed.
