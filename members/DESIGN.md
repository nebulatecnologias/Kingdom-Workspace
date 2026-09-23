---
name: Kingdom Members
description: A warm dashboard members area where the colouring-pack artwork is the only loud thing.
colors:
  canvas: "#f5f3f0"
  canvas-2: "#efece8"
  surface: "#ffffff"
  surface-2: "#fbfaf8"
  sunken: "#f1eeea"
  line: "#e8e3dd"
  line-strong: "#d9d3cb"
  ink: "#1c1a17"
  ink-2: "#3b3732"
  muted: "#6f6962"
  faint: "#7d766e"
  orange-300: "#ffb38a"
  orange-400: "#ff8a4c"
  orange-500: "#f4621d"
  orange-600: "#e14e0c"
  orange-soft: "#fff0e7"
  orange-ink: "#b8400a"
  cta-glow: "#ff7f37"
  cta-deep: "#f2570f"
  green: "#15803d"
  green-soft: "#e3f6ea"
  green-ink: "#0f7a37"
  red: "#d42a39"
  red-soft: "#fde8ea"
  red-ink: "#b4202d"
  amber-soft: "#fff4d9"
  amber-ink: "#8a5b00"
  blue-soft: "#e6f1fb"
  blue-ink: "#1f5f9a"
  violet-1: "#7b72e8"
  violet-2: "#564cc9"
  violet-soft: "#ecebfc"
  violet-ink: "#4a42b8"
  art-ink: "#1d1b18"
  field-sky: "#d6ebf8"
  field-sand: "#ffe6b3"
  field-meadow: "#d9eed0"
  field-blush: "#f8d5cf"
  field-lagoon: "#cbedee"
  field-lavender: "#e8e2fb"
  field-wheat: "#f3e0c3"
  field-apricot: "#fde0c6"
typography:
  display:
    fontFamily: "Google Sans, Product Sans, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "clamp(26px, 3.2vw, 34px)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  display-hero:
    fontFamily: "Google Sans, Product Sans, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "clamp(28px, 3.6vw, 40px)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  numeral:
    fontFamily: "Google Sans, Product Sans, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "38px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Google Sans, Product Sans, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Google Sans, Product Sans, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Google Sans, Product Sans, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Google Sans, Product Sans, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 500
    lineHeight: 1.4
  caption:
    fontFamily: "Google Sans, Product Sans, Segoe UI, Roboto, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  pill: "999px"
  xl: "26px"
  lg: "22px"
  md: "16px"
  field: "14px"
  sm: "12px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "18px"
  xl: "22px"
  xxl: "26px"
components:
  button-primary:
    backgroundColor: "{colors.cta-deep}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "42px"
  button-primary-lg:
    backgroundColor: "{colors.cta-deep}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "52px"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "42px"
  button-ghost-hover:
    backgroundColor: "{colors.surface-2}"
  button-quiet:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "42px"
  button-quiet-hover:
    backgroundColor: "{colors.sunken}"
  button-danger:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.red-ink}"
    rounded: "{rounded.pill}"
    height: "42px"
  button-danger-hover:
    backgroundColor: "{colors.red-soft}"
  split-cta:
    backgroundColor: "{colors.cta-deep}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    height: "50px"
  icon-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    size: "40px"
  filter-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "38px"
  filter-chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
  pill-owned:
    backgroundColor: "{colors.green}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "28px"
  pill-price:
    backgroundColor: "{colors.orange-soft}"
    textColor: "{colors.orange-ink}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "28px"
  pill-neutral:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "28px"
  chip-mention:
    backgroundColor: "{colors.violet-soft}"
    textColor: "{colors.violet-ink}"
    rounded: "8px"
    padding: "1px 8px"
  chip-code:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink}"
    rounded: "8px"
    padding: "1px 8px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "22px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0 16px"
    height: "48px"
  nav-item:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.field}"
    padding: "10px 12px"
  nav-item-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
  countdown-clock:
    backgroundColor: "{colors.violet-2}"
    textColor: "{colors.surface}"
    rounded: "18px"
    padding: "12px 16px"
  pack-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
  pack-cover:
    rounded: "{rounded.md}"
---

# Design System: Kingdom Members

## Overview

**Creative North Star: "The Warm Dashboard, Loud Art"**

Kingdom Members wears a pinned SaaS dashboard world (the user's "Ware Sync" reference) and lets one thing shout: the colouring-pack artwork. Everything around it is a quiet, warm grey-white canvas, soft white cards with generous 22px corners, and one orange gradient that marks the way forward. The chrome is calm on purpose, so pastel pack fields with thick-line art carry the colour.

Density is moderate and dashboard-like: a 264px sidebar, a greeting headline, filter chips, then a grid of cards. Every interactive shape is a full pill, and every container is a large rounded card lifted by warm, diffuse shadows. Type is Google Sans only, set at weight 500 for everything that names something and 400 for running text. Owned and locked are shown by colour. Owned covers are fully coloured. Locked covers show desaturated line art with a dark padlock disc and an orange price pill.

The world rejects the generic LMS course grid and the cream-and-serif "kids' faith" look. It is warm without being cream and friendly without a display serif.

**Key Characteristics:**
- Warm grey-white canvas (`canvas`) with white, barely graded cards (`surface` to `surface-2`).
- One orange gradient (`cta-glow` to `cta-deep`) for primary action, progress, KPI mini-bars and brand panels.
- Full-pill buttons, chips, pills, search and filters. Containers use 22px corners.
- Soft, negative-spread, warm-tinted shadows. There are no hard edges or offset blocks.
- Pastel pack fields under 3.2px near-black line art. This is the only multi-hue area of any screen.
- Google Sans at weights 400/500. Weight 700 is reserved for the wordmark.
- Full light and dark themes via the same custom properties (`prefers-color-scheme` plus a `data-theme` override).

## Colors

The palette is a warm stone neutral ramp with one orange voice, plus semantic soft/ink pairs for status and a single violet reserved for time and people.

### Primary
- **Ember Orange** (`orange-500`): the brand accent for solid use: focus-ring tint, active nav icon, active tab underline, dropzone hover border, selected-row insert line, checkbox accent.
- **Sunrise CTA Gradient** (`cta-glow` to `cta-deep`, 180deg): the primary button, the admin split pill, progress fills and the email CTA. Its hover lifts to `#ff8b47` → `orange-500`. `orange-400` → `orange-500` fills the five-bar KPI mini charts.
- **Apricot Wash / Burnt Ink** (`orange-soft` / `orange-ink`): the price pill on locked packs, nav count badges, selected mail and prototype-map rows, and link colour.

### Secondary
- **Countdown Violet** (`violet-1` to `violet-2`, 160deg): only the invite-expiry clock card. `violet-soft` / `violet-ink` style `@mention` chips in the activity feed. Violet means "a person or a deadline", never decoration.

### Tertiary (status)
- **Owned Green** (`green`): the solid "Unlocked"/"Free" pill, toggles in the on state, the strength meter and live status dots. `green-soft` / `green-ink` are for accepted, delivered and positive-delta states.
- **Alert Red** (`red`): the solid "Expiring" pill and field error borders. `red-soft` / `red-ink` are for revoked, failed and danger-button text.
- **Amber and Blue soft/ink pairs**: warning notices (amber), info notices and the "opened" invite state (blue).

### Neutral
- **Stone Canvas** (`canvas`): the page ground. The sidebar sits one step deeper on `canvas-2`.
- **Paper White** (`surface`, `surface-2`): cards, inputs, ghost buttons and the selected nav item. Cards use a 180deg gradient between the two.
- **Sunken Stone** (`sunken`): quiet fills for hover, segmented-control track, neutral pills, code chips, progress track and read-only inputs.
- **Hairlines** (`line`, `line-strong`): 1px card and chip borders (`line`). Input strokes and dashed placeholders use `line-strong`.
- **Ink ramp** (`ink`, `ink-2`, `muted`): headings and values (`ink`), labels and nav text (`ink-2`), leads and metadata (`muted`).
- **Faint** (`faint`): placeholders and the select chevron. It measures 2.7:1 on canvas, below the AA level PRODUCT.md requires, so it is not a text colour. The prototype also uses it for sidebar group labels, feed timestamps and the "or" divider, which is a defect, not precedent.

### Pack Fields (art only)
Eight pastel grounds sit behind cover art: `field-sky`, `field-sand`, `field-meadow`, `field-blush`, `field-lagoon`, `field-lavender`, `field-wheat`, `field-apricot`. Line art strokes in `art-ink`. The colouring crayon set (in the sidecar) belongs to the art, not the UI.

### Dark theme
Every neutral and every soft/ink pair has a dark counterpart (canvas `#141311`, surface `#1e1c19`, ink `#f4f0ea`; soft fills darken and ink tones lighten). The solid accents (orange gradient, green, red, violet) keep their values. The full mapping is in the sidecar.

### Named Rules
**The Loud Artwork Rule.** Pack art on its pastel field is the only multi-hue area on a screen. UI chrome stays in stone neutrals plus orange, and status colour appears only inside pills, dots and notices.

**The Violet Means Time Rule.** Violet is spent only on the expiry countdown and on people mentions. It never appears as a generic accent.

## Typography

**Display Font:** Google Sans (with Product Sans, Segoe UI, Roboto, system-ui)
**Body Font:** Google Sans (same stack)
**Label/Mono Font:** Google Sans for all labels. A system monospace (`ui-monospace`, SF Mono, Menlo) is used only inside code fields for webhook URLs, secrets and product IDs.

**Character:** One geometric-humanist sans at two weights. Headings get their authority from size and tight negative tracking, never from bold.

The prototype loads Google Sans from Google Fonts (400/500/700, `display=swap`). The Next.js build must self-host it via `next/font` so no third-party font request is made.

### Hierarchy
- **Display** (500, `clamp(26px, 3.2vw, 34px)`, -0.025em): the page greeting and page titles.
- **Display Hero** (500, `clamp(28px, 3.6vw, 40px)`, -0.03em): pack page title and auth-panel headline.
- **Numeral** (500, 38px, line-height 1, tabular): KPI values. Drops to 30px under 640px. The countdown clock uses the same weight at `clamp(24px, 2.3vw, 32px)`.
- **Headline** (500, 21-22px): dialog titles and the "continue" card heading.
- **Title** (500, 16.5-17px, 1.3): card titles and pack names.
- **Body** (400, 15px, 1.5; 14.5px under 640px): running text. Leads are capped at 56-60ch in `muted`.
- **Label** (500, 13.5px): field labels, segmented controls and small buttons. Buttons and pills run 13-14.5px at 500.
- **Caption** (400, 12.5px): hints, errors, deltas and timestamps.

### Named Rules
**The Medium Weight Rule.** Headings, labels, buttons and numerals are 500. Weight 700 appears only in the Kingdom Members wordmark and the email band title.

**The No Eyebrow Rule.** Page and card headings stand alone, with no small label line above them (removed in review). Sidebar group labels and KPI metric labels are navigation and data labels, not kickers, and stay.

## Layout

Two-column app shell: a sticky 264px sidebar on `canvas-2` with a right hairline, and a main column with padding `22px clamp(16px, 3vw, 40px) 64px`. A top bar (pill search up to 420px, language select, help icon button) sits 26px above the page head. The page head aligns title and lead left and any action right, with 24px below.

- **Library:** auto-fill grid `minmax(236px, 1fr)` with 18px gaps. It becomes two columns with 12px gaps under 640px.
- **Admin overview:** KPI row of three cards plus a wider countdown card (`1.15fr`) with 16px gaps. Below it, a two-column grid of main content and a 360px activity feed.
- **Side panels:** showcase, editor and pack-studio use `1fr` plus a fixed 260-340px side column.
- **Rhythm:** 4/8/12/16/18/22/26px. 18px is the standard grid gap, 22px the card padding and 26px the section gap.

Breakpoints:
- 1180px: KPI countdown wraps to a full row and side columns stack.
- 980px: the sidebar is replaced by a blurred sticky mobile bar and a fixed bottom tab bar with safe-area insets. The top bar hides and the auth split stacks.
- 640px: tighter cards, two-up pack grid and horizontally scrolling filter chips.

## Elevation & Depth

Depth is lifted, not flat. Cards rest on a soft, warm-tinted shadow and rise on hover. Every shadow uses a warm near-black (`rgba(28,22,16,…)`), a large blur and negative spread, so it reads as ambient glow rather than a drawn edge. The dark theme swaps to pure black at higher opacity.

### Shadow Vocabulary
- **Rest** (`--shadow-1`: `0 1px 2px rgba(28,22,16,.05), 0 6px 18px -8px rgba(28,22,16,.10)`): cards, pack cards and the active nav item.
- **Lift** (`--shadow-2`: `0 2px 6px rgba(28,22,16,.06), 0 18px 40px -16px rgba(28,22,16,.22)`): pack hover and the large pack cover.
- **Pop** (`--shadow-pop`: `0 12px 32px -8px rgba(28,22,16,.28), 0 2px 8px rgba(28,22,16,.08)`): dialogs, drawers, toasts, menus and the prototype panel.
- **CTA glow** (`--cta-shadow`: inset 1px white highlight plus `0 6px 16px -4px rgba(226,78,12,.55)`): primary buttons and the split pill only.
- **Violet glow** (`0 16px 30px -14px rgba(86,76,201,.8)` plus inset highlight): the countdown clock only.
- **Focus ring** (`--ring`: `0 0 0 3px rgba(244,98,29,.28)`): every `:focus-visible` and focused input.

### Named Rules
**The Soft Lift Rule.** Shadows are diffuse and warm with negative spread. A hover lift is `translateY(-3px)` plus Rest → Lift. There are no zero-blur offset shadows.

## Shapes

- **Pills:** every control that can be pressed or filtered is a full pill (999px): buttons, split CTA, icon buttons, filter chips, status pills, search, segmented controls, toggles and progress bars.
- **Cards:** containers use 22px (`lg`). Dialogs and the large pack cover step up to 26px (`xl`). The auth art panel and phone preview use 30px.
- **Nested shapes:** inner shapes step down. A pack cover (16px, `md`) is inset 10px inside its 22px card, fields and nav items are 14px, thumbnails are 12-14px, and inline chips are 8px.
- **Printable sheets:** pages keep the A4 ratio (210/297), a 12px corner and a double inset white-then-hairline border, so they read as paper rather than cards.
- **Dashed borders:** a 1.5px dashed `line-strong` border marks only empty or drop targets (dropzone, "more pages", eraser crayon) and the prototype-map button.

## Components

### Buttons
Buttons are tactile, rounded and confident. There is one hot button, and the rest stay quiet.
- **Shape:** full pill (999px). Heights are 42px (default), 52px (`lg`, used for auth, checkout and pack actions) and 34px (`sm`).
- **Primary:** the Sunrise gradient with white 500-weight label, CTA glow shadow and 0 18px padding. Hover brightens the gradient and `:active` nudges down 1px. Loading shows a white spinner at 60% opacity.
- **Ghost:** Paper White with a `line` border and a hairline shadow. Hover moves to `surface-2` and `line-strong`.
- **Quiet:** transparent `ink-2`, with a Sunken fill on hover. Used in menus and dismiss actions.
- **Danger:** white with `red-ink` text. Hover fills `red-soft`.
- **One primary per view:** library and pack views each carry a single gradient CTA. In admin, the sidebar split pill is the standing primary. The showcase, pack-editor and integrations page heads currently add a second gradient button. That is divergence from this rule, not a pattern to copy.
- **Split CTA (admin):** a 50px gradient pill in the sidebar. The main segment is "New invite" and a 46px chevron segment behind a white 28% divider opens a pop-shadow menu card.
- **Icon button:** a 40px white circle with a `line` border. In table rows it is 34px, transparent and borderless.

### Chips
- **Filter chips:** 38px white pills with a count bubble. Selected inverts to `ink` fill with `canvas` text.
- **Status pills:** 28px with a 7px dot. Solid green means owned or unlocked, and solid red means expiring. Soft pairs are used for lifecycle states: sent (orange), opened (blue), accepted (green), expired (grey), revoked (red). The price pill is orange-soft with a padlock icon.
- **Feed chips:** `@mention` in violet-soft with a small green presence ring, and order or pack references as `chip-code` on Sunken with tabular numerals.
- **Segmented control:** a Sunken pill track with 4px padding. The pressed option becomes a white pill with a small shadow.

### Cards / Containers
- **Corner Style:** 22px.
- **Background:** a 180deg gradient from `surface` to `surface-2` (dark: `#211f1c` to `#1c1a17`).
- **Shadow Strategy:** Rest, and Lift on hover for interactive cards (see Elevation).
- **Border:** 1px `line`.
- **Internal Padding:** 22px. Card heads use `18px 22px 0` with a 17px title and an optional icon or status dot.

### Inputs / Fields
- **Style:** 48px tall, 14px radius, 1px `line-strong` stroke, white fill and 16px side padding. Labels are 13.5px/500 `ink-2` with a 7px gap, and hints are 12.5px `muted`.
- **Focus:** the border turns `orange-500` and the orange focus ring appears.
- **Error / Disabled:** errors get a `red` border and a 12.5px `red-ink` message with an icon. Read-only fields sit on Sunken with `ink-2` text.
- **Selects** use the same shape with a custom chevron. The language select is a 40px pill.

### Navigation
- **Sidebar:** 15px/500 `ink-2` items with 18px stroke icons, 10px 12px padding and a 14px radius. Hover fills Sunken. The active item is a white raised tile (Rest shadow) with an orange icon. Count badges are orange-soft pills. Group labels are 12px `faint`.
- **Mobile (below 980px):** a sticky blurred top bar (canvas at 88%, 12px blur) with the brand, and a fixed white bottom tab bar with 11.5px labels. The active tab uses `orange-ink` text and an orange icon.
- **Tabs (admin editors):** 500-weight `muted` labels with a 2px `orange-500` underline when selected.

### Pack Card (signature)
A card with a 16px-radius cover inset 10px, filled with the pack's pastel field and 78%-wide line art. Below are a 16.5px title and a foot row with page count and status pill.
- **Owned:** the art is fully coloured and the foot shows a solid green pill.
- **Locked:** the cover is at 50% saturation with line art only and a 38px dark translucent padlock disc top-right. The foot shows the orange price pill, and tapping opens checkout.
- **Coming soon:** the cover is grayscale at 60% opacity with a grey pill and no hover lift.

### Colouring Studio (signature interaction)
Tap-to-colour: a square white "paper" (18px radius, inset double border) holds the line art. Each region fills with the selected crayon over a 0.25s ease, and the cursor is a crosshair. The crayon palette is a grid of 16px-radius swatches (4 columns; 8 on mobile). The selected swatch gets a double ring (surface gap, then 2px `ink`). The eraser is a dashed white tile.

### Countdown Card
A KPI-row card holding the next expiring invite: name, email and a solid red "Expiring" pill. Below that is a violet-gradient clock tile (18px radius, tabular 500-weight digits, dimmed separators, violet glow) and a ghost "Resend" action.

### KPI Card and Mini Chart
The card has a 14px icon label, a 38px tabular value and a five-bar orange-gradient mini chart (7px bars, 4px radius, 4px gaps, 38px tall) aligned bottom-right. A 12.5px green-ink delta sits below.

### Activity Feed
Rows separated by 1px `line`, 14px text at line-height 1.7 (so inline chips breathe) and right-aligned 12.5px timestamps.

### Email Templates (fixed light world)
Emails ignore the app theme and always render light, with literal values rather than custom properties. The layout is a 560px white card (18px radius, `#ebe6e0` border) on `#f3f1ee`. It opens with an orange gradient band (`#ff8a45` → `#ee5410`, 160deg) holding the logo and a 700 wordmark. The 30px body uses 15.5px/1.6 text in `#3b3732` with a 25px headline, and the CTA is the same gradient pill. A verse block sits above a thin rule, and the footer is `#faf8f5` at 12px.

### Motion
One easing, `cubic-bezier(.22,1,.36,1)`, is used everywhere. Controls transition in 0.15-0.2s, card lifts and colour fills in 0.25s, and dialogs rise (14px, scale .98) in 0.28s. Drawers slide 40px in 0.3s. `prefers-reduced-motion` collapses all of these to near zero.

## Do's and Don'ts

### Do:
- **Do** keep one primary gradient CTA per view. In admin, the sidebar split pill ("New invite") is that primary.
- **Do** give pack covers their pastel field and let coloured art be the loudest element on the screen.
- **Do** show locked content by desaturating it and adding the padlock disc plus orange price pill, never by hiding it.
- **Do** make every pressable control a full pill and every container a 22px card with the Rest shadow.
- **Do** set headings at 500 with negative tracking (-0.015em to -0.03em) and use tabular numerals for money, counts, clocks and IDs.
- **Do** define colours through the root custom properties so the dark theme follows automatically. Emails are the one exception and stay fixed light.
- **Do** self-host Google Sans through `next/font` in the Next.js build.

### Don't:
- **Don't** put an eyebrow or kicker line above page or card headings.
- **Don't** use violet for anything but the countdown and people mentions.
- **Don't** use weight 700 outside the wordmark and email band, and don't introduce a second typeface. System monospace is only for code fields.
- **Don't** use zero-blur offset shadows or cool grey shadows. Shadows stay warm, diffuse and negatively spread.
- **Don't** use `faint` for any readable text (labels, timestamps, captions). It is below AA contrast and is for placeholders and chevrons only. Use `muted` instead.
- **Don't** drift toward the cream-and-serif "kids' faith" look or a generic LMS course grid.
