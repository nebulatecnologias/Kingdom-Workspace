---
name: Home Center — Gestão de lojas
description: A Material 3 light console seeded from a lighter Home Center red, where every figure names its source and target.
colors:
  hc-red: "#EB4950"
  primary: "#D7383E"
  primary-hover: "#C42F35"
  on-primary: "#FFFFFF"
  sel: "#FFDAD6"
  on-sel: "#73171C"
  primary-soft: "#FFF0EE"
  bg: "#F6F2F1"
  surface: "#FFFFFF"
  surface-low: "#FBF8F7"
  surface-high: "#F1ECEB"
  surface-highest: "#E8E1E0"
  on-surface: "#1F1A1A"
  on-surface-variant: "#5C4F4F"
  outline: "#857371"
  outline-variant: "#DCCFCD"
  inverse: "#352F2F"
  on-inverse: "#F8EEED"
  inverse-primary: "#FFB3AE"
  ok: "#1B6A3B"
  ok-c: "#D6EEDC"
  ok-bar: "#3D9A62"
  warn: "#835000"
  warn-c: "#FFE2BA"
  bad: "#B3261E"
  bad-c: "#FADCD9"
  bad-bar: "#E0575C"
  info: "#0B57D0"
  info-c: "#DCE6FA"
  neu: "#4D4545"
  neu-c: "#EDE7E6"
  neu-bar: "#CBBFBD"
typography:
  display:
    fontFamily: "'Google Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 400
    lineHeight: "42px"
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  headline:
    fontFamily: "'Google Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: "36px"
    letterSpacing: "0"
  title-lg:
    fontFamily: "'Google Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 500
    lineHeight: "28px"
  title:
    fontFamily: "'Google Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "24px"
  body-lg:
    fontFamily: "'Google Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "22px"
  body:
    fontFamily: "'Google Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  body-sm:
    fontFamily: "'Google Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
  label:
    fontFamily: "'Google Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
  label-sm:
    fontFamily: "'Google Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
rounded:
  s: "8px"
  m: "12px"
  l: "16px"
  xl: "28px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-filled:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "20px"
    padding: "0 24px"
    height: "40px"
  button-filled-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  button-tonal:
    backgroundColor: "{colors.sel}"
    textColor: "{colors.on-sel}"
    rounded: "20px"
    padding: "0 24px"
    height: "40px"
  button-outlined:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "20px"
    padding: "0 24px"
    height: "40px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "20px"
    padding: "0 12px"
    height: "40px"
  button-small:
    rounded: "18px"
    padding: "0 16px"
    height: "36px"
  filter-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label}"
    rounded: "{rounded.s}"
    padding: "0 12px"
    height: "32px"
  filter-chip-selected:
    backgroundColor: "{colors.sel}"
    textColor: "{colors.on-sel}"
  segmented-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "20px"
    padding: "0 14px"
    height: "40px"
  segmented-button-selected:
    backgroundColor: "{colors.sel}"
    textColor: "{colors.on-sel}"
  text-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.s}"
    padding: "14px 16px 12px"
    height: "52px"
  pill-option:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "20px"
    padding: "0 14px"
    height: "40px"
  pill-option-checked:
    backgroundColor: "{colors.sel}"
    textColor: "{colors.on-sel}"
  status-chip:
    backgroundColor: "{colors.neu-c}"
    textColor: "{colors.neu}"
    typography: "{typography.label-sm}"
    rounded: "6px"
    padding: "0 8px"
    height: "24px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.l}"
    padding: "20px 24px"
  card-mobile:
    rounded: "{rounded.m}"
    padding: "16px"
  hero-band:
    backgroundColor: "{colors.primary-soft}"
    rounded: "{rounded.l}"
    padding: "18px 24px 20px"
  nav-item:
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label}"
    rounded: "24px"
    padding: "0 16px"
    height: "48px"
  nav-item-active:
    backgroundColor: "{colors.sel}"
    textColor: "{colors.on-sel}"
  primary-tab-active:
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    height: "48px"
    padding: "0 16px"
  search-field:
    backgroundColor: "{colors.surface-high}"
    textColor: "{colors.on-surface}"
    rounded: "24px"
    height: "48px"
  snackbar:
    backgroundColor: "{colors.inverse}"
    textColor: "{colors.on-inverse}"
    rounded: "{rounded.s}"
    padding: "6px 8px 6px 16px"
    height: "48px"
  bottom-sheet:
    backgroundColor: "{colors.surface-low}"
    rounded: "{rounded.xl}"
---

# Design System: Home Center — Gestão de lojas

## Overview

**Creative North Star: "The Store's Day on One Console"**

A Google-Workspace-grade Material 3 light scheme, seeded from a lighter Home Center red and laid on warm, faintly rose neutral surfaces. Depth is tonal: the page sits on a warm grey (`bg`), content lives on white cards, and selection is a rose container. Nothing floats at rest. The interface is dense in the way an operating console is dense: every figure carries its source, its target and a progress bar with a pace marker, and every alert carries the button that resolves it.

The system separates two reds on purpose. The deeper action red (`primary`) is for things you press and read as links, because it holds 4.6:1 against white. The brighter brand red (`hc-red`) is for things you look at: progress bars, the current month's column, completed stepper nodes, the funnel's last stage. Semantic state uses its own tonal pairs (ok, warn, bad, info, neutral), never the brand reds.

Motion is reserved for one moment: after the day's data is committed, the changed figures count up to their new values and the bars rescale, and an inverse snackbar offers undo. Everything else is a 150 ms state-layer change.

**Key Characteristics:**
- Google Sans in every role, tabular numerals on every figure.
- Material Symbols Rounded (outlined, filled when active) for UI icons; Simple Icons brand marks, in brand colour, for channels.
- Tonal layering over shadow; shadows only on transient, floating surfaces.
- Pill controls (buttons, options, segmented selector, nav indicator) against 8/12/16/28 container corners.
- Adaptive navigation: drawer, rail, bottom bar; container queries drive the grids.

## Colors

A warm Material 3 light scheme: two reds with split duties, a rose selection container, warm neutrals stepped by tone, and five semantic pairs.

### Primary
- **Action Red** (`primary`): filled buttons, outlined and text button labels, links, the active tab label and its 3px indicator, the focus ring, form focus borders, navigation badges, the alert counts. Hover deepens to **Pressed Red** (`primary-hover`) on links.
- **Home Center Red** (`hc-red`): data ink only: progress bar fills, the current-month column, completed and current stepper nodes, the final funnel stage, highlighted card-row borders in mobile tables.
- **Rose Container** (`sel`) with **Deep Wine** (`on-sel`): every selected state: active nav pill, selected filter chip, segmented selection, checked pill option, tonal buttons, outgoing team messages, team badges, text selection. Deep Wine also fills the account avatar.
- **Blush Tint** (`primary-soft`): the overview hero band, the active pipeline stage, the selected inbox item, highlighted table rows.

### Neutral
- **Warm Page** (`bg`): the app background behind the drawer, top bar and content; also the theme colour.
- **Paper** (`surface`): cards, fields, chips, menus.
- **Surface Low / High / Highest** (`surface-low`, `surface-high`, `surface-highest`): inset panels (pace box, info box, inline forms, delivery rows), hover state layers and in-card dividers, and empty bar tracks respectively.
- **Ink** (`on-surface`) and **Muted Ink** (`on-surface-variant`): primary text; secondary text, labels, inactive icons.
- **Outline** (`outline`) and **Hairline** (`outline-variant`): field strokes, segmented and outlined-button strokes; tab rule, table header rule, chip borders, strip-band rules.
- **Inverse** (`inverse`, `on-inverse`, `inverse-primary`): the snackbar and its action label.

### Semantic
- **Ok / Warn / Bad / Info / Neutral** pairs (`ok`+`ok-c`, `warn`+`warn-c`, `bad`+`bad-c`, `info`+`info-c`, `neu`+`neu-c`): status chips, banners, error summaries, NPS answer selection. `ok-bar`, `bad-bar`, `neu-bar` are the chart fills for promoters, detractors and neutrals.

### Named Rules
**The Two Reds Rule.** `primary` is for what you press; `hc-red` is for what you read in a chart. A button in `hc-red` or a bar in `primary` is a mistake.

**The Rose Means Selected Rule.** The `sel` / `on-sel` container is the single selection language across nav, chips, segments, options and tonal buttons. Do not invent another selected style.

**The State Is Not Brand Rule.** Late, overdue, at-risk and done use the semantic pairs, never the brand reds.

## Typography

**Display Font:** Google Sans (with Segoe UI, system-ui)
**Body Font:** Google Sans
**Label Font:** Google Sans

**Character:** One family carrying everything, Workspace-style: regular weight for large figures and page titles, medium (500) for titles, labels and controls, 600 reserved for small counters and badges.

### Hierarchy
- **Display** (400, 34px/42px, -0.01em, tabular): headline-band figures. Drops to 28px in narrow containers and 26px in the compact strip.
- **Headline** (400, 28px/36px): section titles; 24px/32px on phones. Alert counts and pipeline counts use the same 28px regular in tabular figures.
- **Title Large** (500, 20px/28px): detail-panel headings (order detail).
- **Title** (500, 16px/24px): card titles, client card heading; conversation heading at 18px.
- **Body Large** (400, 15px/22px): field values, message bubbles, search input.
- **Body** (400, 14px/20px): default text and table cells.
- **Body Small** (400, 13px/18px): card notes, row sub-lines, alert descriptions.
- **Label** (500, 14px/20px): buttons, tabs, chips, nav items. **Label Small** (500, 12px/16px): table headers, floated field labels, status chips.

### Named Rules
**The Tabular Figures Rule.** Every number that can change or be compared (figures, table cells, counts, bar labels, preview values) sets `font-variant-numeric: tabular-nums`, so counting up and comparing stores never jitters.

**The Sentence Case Rule.** No uppercase, no tracked-out labels. Hierarchy comes from size and the 400/500 weight step.

## Layout

Adaptive Material navigation keyed to the viewport: a 264px **navigation drawer** at 1200px and up; an 88px **navigation rail** from 840 to 1199px (56x32 pill indicator behind the icon, short labels, the segmented store selector collapses to a 200px select field); below 840px a five-slot **bottom navigation** bar, a compact top bar with logo, search icon (expanding to a full search field), notifications and avatar, and a sticky row of store filter chips under the top bar.

Content sits in a `main` container (max 1440px, 24px side padding, 16px on phones) and every grid responds to that container, not the viewport. Two-column splits (7:5, 8:4, 1:1, form 7:4 with a 300px minimum) open at 960px container width; the headline band goes four-up, two-up at 760px, tighter at 420px; forms run 2 to 4 columns and collapse to one at 600px; the inbox becomes list + conversation at 720px and adds a 256px client card at 1080px; orders add a 360px sticky detail column at 1100px; the seven-stage pipeline wraps to 4 + 3 at 600px. At 700px and below, data tables become stacked cards: each row a 12px-radius outlined card with label-left, value-right lines.

Rhythm is a 4px grid: 16px between cards, 20-24px card padding, 12px list-row padding with in-card dividers, 22px vertical gap between form fields.

### Named Rules
**The Container Decides Rule.** Grid changes are `@container main` queries; only navigation chrome uses media queries.

**The No Clipped Columns Rule.** Below 700px a table becomes cards; it never side-scrolls its key columns away.

## Elevation & Depth

Flat and tonal. Resting surfaces never carry shadow: hierarchy is page (`bg`) to card (`surface`) to inset panel (`surface-low`), with hairline dividers inside cards. Shadow appears only on surfaces that float above the page or as a hover response.

### Shadow Vocabulary
- **Hover lift** (`box-shadow: 0 1px 2px rgba(31,26,26,.2), 0 2px 6px rgba(31,26,26,.12)`): filled button hover only.
- **Search focus** (`box-shadow: 0 1px 3px rgba(31,26,26,.16), 0 4px 12px rgba(31,26,26,.08)`): the pill search field when focused, as it turns white.
- **Menu** (`box-shadow: 0 2px 6px rgba(31,26,26,.14), 0 10px 28px rgba(31,26,26,.14)`): menus, notification popover, search results.
- **Snackbar** (`box-shadow: 0 4px 10px rgba(0,0,0,.18), 0 10px 28px rgba(0,0,0,.14)`).
- **Bottom sheet** (`box-shadow: 0 -4px 24px rgba(31,26,26,.16)`), over a 32% Ink scrim.

### Named Rules
**The Flat-At-Rest Rule.** Cards, bands, tables and the pipeline have no shadow. If it does not float or respond to hover, it does not cast.

## Shapes

Two shape families. Controls are full pills (height / 2): 40px buttons at 20px radius, 36px small buttons at 18px, 48px nav items and search at 24px, segmented selector, pill radio options, switch track. Containers use the scale: 8px (`s`) for fields, filter chips, snackbar and tab tops; 12px (`m`) for inset panels, banners, inbox items, mobile cards and menus; 16px (`l`) for cards, the headline band and the pipeline; 28px (`xl`) for the top of the bottom sheet. Status chips are a tighter 6px. Progress bars are fully rounded (8px tall, 6px thin, 12px thick) with a 2px Ink pace marker; columns round 8px on top and 4px at the base. Message bubbles are 18px with one 4px corner pointing at the sender. Avatars and stepper nodes are circles.

## Components

### Buttons
Pill, confident, Material state layers.
- **Shape:** full pill (20px radius, 40px tall; 36px small).
- **Filled:** Action Red with white label, the one primary action per section header (for example "Fechar o dia").
- **Tonal:** Rose Container with Deep Wine, for in-place secondary actions (for example "Responder" inside the band).
- **Outlined:** 1px Outline stroke (inset), Action Red label, for alert actions.
- **Text:** Action Red label, 12px side padding, for tertiary actions and snackbar actions (Inverse Primary there).
- **Hover / Active:** a currentColor state layer at 8% / 12%; filled buttons also gain the hover lift. Leading icon 18px. Disabled at 45% opacity. A confirmed action can switch to the Ok pair ("done").

### Chips
- **Filter chip:** 32px (36px on phones), 8px radius, Hairline border on Paper, Muted Ink label; selected turns Rose Container with a leading check icon. May carry a channel brand mark and a tabular count.
- **Status chip:** 24px, 6px radius, semantic pair fill, 12px medium label, optional 16px icon. Neutral pair by default.
- **Tag:** 28px outlined, 8px radius, for read-only attributes.

### Segmented store selector
40px outlined pill group with 1px Outline dividers; selected segment fills Rose Container and shows a check icon. Applies to every section. Collapses to a select field on the rail and to filter chips on phones.

### Cards / Containers
- **Corner Style:** 16px (12px on phones).
- **Background:** Paper on Warm Page; insets in Surface Low.
- **Shadow Strategy:** none (see Elevation).
- **Border:** none; inner rows divided by 1px Surface High.
- **Internal Padding:** 20px 24px (16px on phones). Header row: 16px medium title with a 13px muted aside or text link, baseline-aligned.

### Headline band and compact strip
The **hero band** (overview only) is a Blush Tint, 16px-radius band of four figures split by tinted 1px rules: muted label, 34px figure, trend, source line, a progress bar with pace marker, and a target line. Other sections use the **compact strip**: the same four-figure grid with no fill, hairline rules above and below, 26px figures. Only the overview gets the tonal band.

### Section header and primary tabs
Section title (28px regular) with a muted source line, actions right-aligned. Below it a primary tab row on a hairline rule: 48px tabs, active tab in Action Red with a 3px rounded indicator inset 12px. Tabs where data is entered ("Fechar o dia", "Registar ...") lead with the `edit_note` icon; tabs may carry a pill count.

### Inputs / Fields
- **Style:** outlined, 52px tall, 1px Outline stroke, 8px radius, Paper fill, 15px value. The label is permanently floated on the top edge (12px medium, cut out of the stroke with the field's background) so placeholders are never the label.
- **Hover:** stroke goes to Ink. **Focus:** stroke and a 1px inset ring in Action Red; label turns Action Red.
- **Error:** Bad stroke, ring and label; a 12px hint below in Bad; a Bad-container error summary with links to each field.
- **Select** carries an `expand_more` icon; **suffix** units (MT, %) sit inside on the right.
- **Pill options** (radio): 40px outlined pills, checked in Rose Container with a check. The NPS 0-10 scale uses 40px circles that check into the Bad, Neutral or Ok pair by score band.
- **Switch:** 52x32 track, Surface Highest with a 2px Outline inset; on, it fills Action Red and the thumb grows white and slides.
- **Search:** 48px pill in Surface High that turns Paper with the search-focus shadow.

### Navigation
- **Drawer:** 48px items, full pill, Muted Ink medium labels; hover Surface High; active Rose Container with filled icon; badge counts in Action Red pills. Footer carries the Mídia Pro credit and the reset action.
- **Rail:** icon in a 56x32 pill indicator, 12px label below, badge offset on the icon.
- **Bottom navigation:** Surface Low bar with a hairline top edge, same 56x32 indicator and filled active icon.

### Tables
12px cell padding, 12px medium Muted Ink headers over a Hairline rule, rows divided by Surface High, numeric columns right-aligned and tabular, flush first and last columns, an emphasised footer total. Clickable rows hover Surface Low; selected or highlighted rows take Blush Tint. Record IDs are Action Red text buttons with an underline on hover. At 700px and below they become stacked cards (see Layout).

### Inbox
Three panes: list, conversation, client card. List items are 12px-radius rows with a 40px tinted-initial avatar carrying a channel brand badge, bold name when unread, channel line, one-line preview, status chip; the current item is Blush Tint. Conversation bubbles: incoming Surface High, team replies Rose Container, auto-replies outlined Paper, system lines centred and small. Out-of-hours notices are Warn banners. Composer is an outlined textarea with quick-reply chips.

### Order pipeline and stepper
The pipeline is a seven-stage Paper strip (16px radius) of 28px tabular counts; the pressed stage takes Blush Tint and a 3px Action Red indicator at its top; late counts turn Bad. The order stepper is a vertical list of 24px circle nodes joined by 2px lines: done nodes and lines fill Home Center Red with a check, the current node is a red ring with a dot, late is a Bad ring.

### Snackbar and the commit moment
Inverse, 8px radius, 48px min height, bottom-left (above the bottom bar on phones), sliding up 24px and fading in over 250 ms on the emphasized easing. After a data commit it reads what changed and offers "Anular" (undo); it stays 8 s with an action, 4 s without. On the same commit, changed figures count from old to new over 900 ms (quartic ease-out) and bars rescale over 700 ms. Reduced motion removes both.

### Named Rules
**The One Moment Rule.** The commit (count-up, bar rescale, undo snackbar) is the only authored motion. Everything else is a 150 ms colour change on `cubic-bezier(.2,0,0,1)`.

**The Every Alert Acts Rule.** An alert row is count, description, and an outlined action button that resolves it on the spot.

**The Mark The Entry Rule.** Any tab or button that writes data carries the `edit_note` icon.

## Do's and Don'ts

### Do:
- **Do** set every figure in Google Sans with tabular numerals, and pair it with its source and its target.
- **Do** use `primary` (#D7383E) for actions and links and `hc-red` (#EB4950) for bars and indicators.
- **Do** express every selected state with the `sel` / `on-sel` container.
- **Do** separate surfaces by tone (`bg`, `surface`, `surface-low`) and keep cards flat at rest.
- **Do** use Material Symbols Rounded for UI icons (filled when active) and Simple Icons marks in brand colour for channels.
- **Do** let `@container main` decide grid columns, and turn tables into cards at 700px.
- **Do** keep controls as full pills and containers on the 8/12/16/28 scale.

### Don't:
- **Don't** put a dark sidebar over a row of identical white KPI tiles; the drawer sits on the warm page and the overview leads with one tonal band.
- **Don't** use the brand reds for status; late, overdue and at-risk use the Bad, Warn and Ok pairs.
- **Don't** add shadows to cards, bands, tables or the pipeline.
- **Don't** add motion beyond the commit moment and 150 ms state changes.
- **Don't** use uppercase or letter-spaced labels; hierarchy is size and the 400/500 step.
- **Don't** use placeholder text as a field label; labels stay floated on the stroke.
