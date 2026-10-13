---
name: AI Viral Video Masterclass
description: A sales page built as a bright, trustworthy editing suite; white ground, dark ink, lime only for actions and highlights, dark screens for the demos.
colors:
  white: "#FFFFFF"
  card: "#FFFFFF"
  panel: "#F4F7EF"
  panel-2: "#F8FAF5"
  panel-3: "#EAF0E1"
  ink: "#11160D"
  soft: "#4A5344"
  mute: "#646C5E"
  lime: "#C2F24B"
  lime-hover: "#CEF865"
  lime-ink: "#0E1209"
  lime-wash: "rgba(194,242,75,.22)"
  lime-line: "rgba(58,122,12,.35)"
  trust-green: "#3A7A0C"
  rec-red: "#E0313E"
  screen: "#0B0D09"
  line: "rgba(17,22,13,.09)"
  line-2: "rgba(17,22,13,.16)"
typography:
  display:
    fontFamily: "Poppins, ui-rounded, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(44px, 7.4vw, 86px)"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Poppins, ui-rounded, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(30px, 5vw, 56px)"
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Poppins, ui-rounded, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  price:
    fontFamily: "Poppins, ui-rounded, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "56px"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "-0.04em"
  timecode:
    fontFamily: "Poppins, ui-rounded, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.06em"
    fontFeature: "\"tnum\""
  body:
    fontFamily: "Manrope, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  lede:
    fontFamily: "Manrope, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Manrope, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  chip: "6px"
  tag: "8px"
  inset: "12px"
  button: "14px"
  r: "16px"
  r-lg: "24px"
  sheet: "26px"
  device: "34px"
  full: "9999px"
spacing:
  gutter-mobile: "20px"
  gutter-desktop: "32px"
  container: "1200px"
  section-mobile: "80px"
  section-desktop: "120px"
  section-head-gap: "48px"
  card-pad: "26px"
  card-pad-lg: "34px"
  stack: "18px"
components:
  button-primary:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.lime-ink}"
    rounded: "{rounded.button}"
    padding: "15px 26px"
    height: "54px"
  button-primary-hover:
    backgroundColor: "{colors.lime-hover}"
  button-primary-xl:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.lime-ink}"
    rounded: "{rounded.r}"
    padding: "15px 34px"
    height: "62px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "15px 26px"
    height: "54px"
  tag-lime:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.lime-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.tag}"
    padding: "5px 9px"
  tag-line:
    backgroundColor: "transparent"
    textColor: "{colors.trust-green}"
    typography: "{typography.label}"
    rounded: "{rounded.tag}"
    padding: "5px 9px"
  timecode-digits:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.lime-ink}"
    typography: "{typography.timecode}"
    rounded: "{rounded.chip}"
    padding: "2px 8px"
  countdown-bar:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    padding: "9px 20px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r-lg}"
    padding: "{spacing.card-pad}"
  demo-screen:
    backgroundColor: "{colors.screen}"
    textColor: "{colors.white}"
    rounded: "{rounded.r}"
  plan-recommended:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r-lg}"
    padding: "30px 26px"
  export-summary:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r-lg}"
    width: "720px"
  modal-sheet:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "34px"
    width: "480px"
---

# Design System: AI Viral Video Masterclass

## Overview

**Creative North Star: "The Daylight Editing Suite"**

The page is an editing suite with the lights on. A white ground, soft sage panels and dark green-black ink make it read as calm and safe to buy from; the editor vocabulary survives as structure (a sticky countdown with timecode digits, a clip-metadata strip, a module track with clip markers, an "export summary" for the value stack) rather than as a dark room. Lime stays the action colour, but on white it can no longer carry text, so a deep Trust Green takes over every small accent, icon, link and focus ring, while lime is spent on surfaces: buttons, chips, and a highlighter band laid behind the key words of a headline.

Darkness is kept only where it means "this is a screen": the motion-transfer demo frames and the bonus covers sit on near-black Screen panels, so the effects still look like footage. Proof leads with the user's banner image in the hero and the effect demos below it. Type is heavy uppercase Poppins at thumbnail volume over quiet Manrope body copy in Soft. Sections breathe (80/120px) and alternate white and Panel.

Depth is light and tidy: white cards with a tight two-layer shadow and a hairline border, a deeper soft green-tinted lift reserved for the objects you would pick up.

**Key Characteristics:**
- White ground (#FFFFFF) with Panel sage for alternate sections, bars and strips; white cards on both.
- Lime is a surface colour (buttons, chips, highlighter band); Trust Green is the text-and-icon accent.
- Near-black Screen panels only for demo frames and bonus covers.
- Heavy uppercase Poppins display, Manrope body, tabular timecodes.
- Hairline borders plus a tight card shadow; one soft lift for picked-up objects.

## Colors

A daylight sage palette: white and pale green-grey grounds, green-black ink, one acid-lime surface signal, one deep green for legible accents, and a rare recording red.

### Primary
- **Playhead Lime** (lime): primary buttons, solid tags ("Best value", "Bonus 1"), module clip chips, the countdown timecode digits, the brand mark tile, the swap-loop wipe line, the motion figure, and the highlighter band behind headline accent words. Hover lifts to **Lime Hover** (lime-hover). Text on lime is always **Lime Ink** (lime-ink).
- **Lime Wash** (lime-wash) and **Lime Line** (lime-line): the tinted fill and green-tinted border of "with this" states: the recommended plan and "with the masterclass" card top gradients, the example callout under each effect, an opened FAQ toggle, the outline tags, a hovered bonus card.

### Secondary
- **Trust Green** (trust-green): every lime-family accent that must be read on white: check and feature icons, the accent word in card titles, links, "today" totals and pop-up prices, the module-track fill and marker borders, the guarantee seal, the 2px border of the recommended plan, ghost-button hover border, and the 3px focus ring.

### Tertiary
- **REC Red** (rec-red): the blinking recording dot and the pain-point icons. Nothing else.

### Neutral
- **White** (white) and **Card** (card): page ground and every card, plan, sheet and summary.
- **Panel** (panel): alternate sections, the sticky countdown bar, the spec strip, phone frames.
- **Panel 2** (panel-2): phone screens and the final-section timecode chip.
- **Panel 3** (panel-3): the export summary header, neutral timecode chips, image placeholders, close-button hover, scrollbar thumb.
- **Screen** (screen): demo frames and bonus covers; labels on it are light (#FFFFFF, #C3CAB6, #F1F4EA).
- **Ink** (ink): headlines, emphasised body, and text on highlighter bands.
- **Soft** (soft): default body and lede text, captions.
- **Mute** (mute): struck anchor prices, excluded plan features, spec `dt` labels, fine print.
- **Line / Line 2** (line, line-2): ink-tinted hairlines. Line divides sections and list rows and borders cards; Line 2 outlines frames, the hero image, plans, ghost buttons and the export summary.

### Named Rules
**The Surface-Not-Text Rule.** Lime is never a text or icon colour on white. If a lime-family accent must be read, it is Trust Green; lime appears only as a fill under Ink or Lime Ink.

**The Highlighter Rule.** Headline accent words stay Ink and get a lime band from 58% to 92% of the line height (`linear-gradient(transparent 58%, lime 58%, lime 92%, transparent 92%)`, cloned across line breaks). One accent phrase per headline.

**The Red Light Rule.** Red appears only as the recording dot and pain markers. It never colours a button, price or urgency banner.

**The Screen Rule.** Dark appears only inside things that represent footage (demo frames, bonus covers). Sections, cards, bars and pop-ups are light.

## Typography

**Display Font:** Poppins 600-900 (fallback ui-rounded, system-ui)
**Body Font:** Manrope 400-800 (fallback system-ui, Roboto)

**Character:** A thumbnail-loud display face, uppercase and tightly tracked, paired with a quiet, slightly technical grotesque. Numbers that tick are tabular.

### Hierarchy
- **Display** (900, clamp(44px, 7.4vw, 86px), 0.9, -0.04em, uppercase): hero headline and the final call (scales to 96px). Second line carries the highlighter band; the ampersand is set at half size in Soft.
- **Headline** (900, clamp(30px, 5vw, 56px), 1.05, -0.03em, uppercase): section heads; one phrase highlighted. The guarantee head runs 28-40px.
- **Title** (700-800, 19-28px, uppercase for effect, plan, audience, comparison and pop-up titles; sentence case for module and bonus titles): card and row headings. Accent word in Trust Green.
- **Price** (900, 56px on plans, 46px in pop-ups, 34-44px "today" total, -0.03 to -0.04em): the number is the headline of its card; pop-up and total prices in Trust Green, plan prices in Ink.
- **Timecode** (Poppins 700, 13px, 0.06em, tabular): countdown digits.
- **Body** (Manrope 400, 16px, 1.6): default copy in Soft; ledes at 18-19px, max 46-58ch; FAQ answers max 65ch.
- **Label** (Manrope 800, 11.5-12px, 0.08-0.12em, uppercase): tags, frame labels, spec `dt`, export header, cover file types. Labels annotate an object; they never sit above a headline as an eyebrow.

### Named Rules
**The Tabular Clock Rule.** Anything that counts, ticks or totals uses tabular numerals so the digits do not jitter.

## Layout

A centred 1200px container with 20px gutters (32px from 768px). Sections stack with 80px vertical padding (120px from 900px), separated by a 1px Line border; alternate sections step to Panel. Section heads carry a 48px gap to content, max 820px wide, left-aligned in narrative sections and centred for offer sections.

The hero is a two-area grid from 960px: title and body on the left (0.92fr), the banner image on the right (1.08fr), 56px column gap. On mobile the order is title, image, body, and the buy row and trust line centre with a full-width (max 420px) button. A five-cell spec strip on Panel follows (two columns on mobile, last cell spanning). Content grids collapse to one column below 820-980px; bonuses go 1, 2, then 4 across (640px, 1080px). The proof row is a horizontal snap scroller on mobile. The countdown bar is sticky at the top at all widths; there is no floating mobile buy bar.

Breakpoints used: 520, 600, 640, 768, 820, 860, 900, 960, 980, 1080px.

## Elevation & Depth

A light hybrid: tonal steps (White, Panel, Panel 3) and hairlines carry structure, and every card carries a tight, barely-there two-layer shadow so white cards still separate from white ground. A deeper, soft, green-tinted lift is reserved for objects that read as physically raised.

### Shadow Vocabulary
- **Card** (`box-shadow: 0 1px 2px rgba(17,22,13,.06), 0 4px 10px -4px rgba(17,22,13,.10)`): effect cards, comparison and fit cards, bonus cards, plans, export summary, guarantee panel.
- **Lift** (`box-shadow: 0 22px 46px -26px rgba(25,40,10,.32)`): the hero banner image, phone frames, the recommended plan, the toast.
- **Button press** (`box-shadow: 0 12px 24px -14px rgba(58,122,12,.6), inset 0 -3px 0 rgba(0,0,0,.10)`): lime buttons only; a green glow under a pressable key.

### Named Rules
**The Tight Shadow Rule.** Cards get the Card shadow and a hairline, never a large blur; a long soft shadow means "you can pick this up".

## Shapes

Soft rounded rectangles throughout, radii stepping by object size: 6px for timecode digits and clip chips, 7px for the brand tile and frame labels, 8px for tags and the focus ring, 9px for FAQ toggles, 12px for callouts and the toast, 14px for buttons (16px for XL), 16px for demo frames and the swap loop, 24px for cards, plans, hero image and export summary, 26px for pop-up sheets (top corners only on mobile), 34px for phone frames. Circles are reserved for the REC dot and the pop-up close. Module markers on the track are 14px squares at 4px radius, like clip blocks.

## Components

### Buttons
Chunky, pressable keys.
- **Shape:** gently rounded (14px; 16px for XL), min height 54px (62px XL, 44px in the top row and legal pages).
- **Primary:** Lime with Lime Ink Poppins 700 text, 15px 26px padding, optional trailing arrow and a small Manrope sub-line, Button press shadow.
- **Hover / Focus:** lifts 2px, background to Lime Hover, arrow nudges 4px right; press scales to 0.97. Focus is a 3px Trust Green outline at 3px offset.
- **Ghost:** transparent with a 1.5px Line 2 border and Ink text; border turns Trust Green on hover. Used for the top-row "Get the course", the Basic plan and pop-up refusals (set in Manrope 600 there).

### Tags
- **Style:** 12px uppercase Manrope 800, 0.08em, 8px radius, 5px 9px padding. Solid lime with Lime Ink (status: "Best value", "Bonus 1"), Lime Line outline with Trust Green text ("Free today", savings), or dim Line 2 outline in Soft.
- **REC dot:** 8px red circle blinking at 1.2s steps (static under reduced motion), paired with a timecode or label.

### Countdown Bar
Sticky Panel strip with a Line 2 bottom border: bold uppercase Poppins notice, REC dot plus lime timecode chip, and a Trust Green link. Elsewhere the timecode chip is Panel 3 (pop-ups) or Panel 2 with a Line 2 border (final section).

### Cards / Containers
- **Corner Style:** 24px.
- **Background:** Card white on both White and Panel sections.
- **Shadow Strategy:** Card shadow; see Elevation.
- **Border:** 1px Line (Line 2 for plans, guarantee, export summary). Positive "with" cards add a Lime Wash top gradient and Lime Line border.
- **Internal Padding:** 26-34px (20px in bonus bodies). Bonus cards lift 6px and pick up a Lime Line border on hover.

### Demo Screens (signature)
The effects stay footage. Motion transfer: two 3:4 Screen frames, 16px radius, Line 2 border, light uppercase labels top-left, a faint floor hairline, joined by a Trust Green arrow; the source is a pale skeleton with lime joints, the target a solid lime figure, driven by a play/pause button. Object swap: a 1:1 frame wiping between before and after with a 3px lime line on a 5s alternate cycle and a dark translucent corner label. Bonus covers: Screen panels with masked artwork, a dark bottom gradient, a lime tag and file type in the top row, and an uppercase Poppins 900 title in light text. All motion respects reduced motion.

### Module Timeline
A vertical track: 2px Line 2 rail with a Trust Green fill that grows with scroll, 14px square markers with a 2px Trust Green border on the section ground, and a solid lime clip chip holding each module number before the title.

### Export Summary
The value stack as a render dialog: white card, Line 2 border, Card shadow; Panel 3 header with uppercase label text and a "Ready" REC indicator; rows split by dashed Line 2 with tabular amounts right-aligned; struck total in Mute and the "today" total in Trust Green Poppins 900; then a full-width XL lime button.

### Plans
Two white cards; the recommended plan has a 2px Trust Green border, Lime Wash gradient, Lift shadow, a solid "Best value" tag, and sits first on mobile. Price at 56px Ink with struck anchor in Mute; excluded features in Mute; included-feature checks in Trust Green.

### Pop-ups
Bottom sheets on mobile (26px top corners, rising 40px over 0.45s), centred 480px dialogs from 640px. White card, Line 2 border, ink scrim at 55% (`rgba(17,22,13,.55)`), 44px circular close that fills Panel 3 on hover. Uppercase title with a Trust Green keyword, Trust Green 46px price, lime primary button then a Manrope ghost refusal, and a small countdown chip. They work without JS via `:target`.

### Navigation
No menu: a brand lockup (26px lime rounded tile with play glyph, wordmark with the second half in Trust Green) and a compact ghost button. The sticky countdown bar sits above it.

### Thank-you Page
The post-purchase page reuses the same tokens on a single centred 560px column: a Display headline with a highlighted word, Soft body, numbered steps on Line hairlines with Trust Green numerals, and a ghost-style back link.

## Do's and Don'ts

### Do:
- **Do** keep the ground White (#FFFFFF) and alternate sections on Panel; keep cards white with the Card shadow and a hairline.
- **Do** use Trust Green for any accent that must be read (icons, links, prices, focus) and lime only as a fill under Ink or Lime Ink.
- **Do** mark one headline phrase per heading with the lime highlighter band, text staying Ink.
- **Do** keep demos and bonus covers on Screen so the effects read as footage.
- **Do** set every counting number in tabular figures.
- **Do** give every animated demo a reduced-motion fallback and a keyboard path.
- **Do** keep lime buttons at 54px minimum height with Lime Ink text.

### Don't:
- **Don't** set lime text or lime icons on white; it fails contrast.
- **Don't** use REC Red for buttons, prices or urgency banners; it is the recording light.
- **Don't** put dark backgrounds on sections, cards, bars or pop-ups; dark is for screens only.
- **Don't** put uppercase label text above headlines as eyebrows; labels belong to objects (frames, tags, chrome).
- **Don't** use large, dark or black shadows on cards; use the Card shadow and Line hairlines.
