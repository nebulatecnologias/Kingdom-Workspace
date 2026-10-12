---
name: AI Viral Video Masterclass
description: A sales page built as an editing suite; near-black monitor ground, lime playhead for every action.
colors:
  monitor-black: "#0A0B08"
  panel: "#121410"
  panel-2: "#171A13"
  panel-3: "#1F2319"
  ink: "#F1F4EA"
  soft: "#A9AF9D"
  mute: "#8C9283"
  playhead-lime: "#C2F24B"
  playhead-lime-hover: "#CEF865"
  playhead-lime-deep: "#A6D82C"
  lime-wash: "rgba(194,242,75,.09)"
  lime-line: "rgba(194,242,75,.45)"
  rec-red: "#F0414E"
  rec-red-deep: "#7E121B"
  line: "rgba(220,240,180,.09)"
  line-2: "rgba(220,240,180,.16)"
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
    fontFeature: "\"tnum\""
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
    backgroundColor: "{colors.playhead-lime}"
    textColor: "{colors.monitor-black}"
    rounded: "{rounded.button}"
    padding: "15px 26px"
    height: "54px"
  button-primary-hover:
    backgroundColor: "{colors.playhead-lime-hover}"
  button-primary-xl:
    backgroundColor: "{colors.playhead-lime}"
    textColor: "{colors.monitor-black}"
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
    backgroundColor: "{colors.playhead-lime}"
    textColor: "{colors.monitor-black}"
    typography: "{typography.label}"
    rounded: "{rounded.tag}"
    padding: "5px 9px"
  tag-line:
    backgroundColor: "transparent"
    textColor: "{colors.playhead-lime}"
    typography: "{typography.label}"
    rounded: "{rounded.tag}"
    padding: "5px 9px"
  timecode-digits:
    backgroundColor: "{colors.playhead-lime}"
    textColor: "{colors.monitor-black}"
    typography: "{typography.timecode}"
    rounded: "{rounded.chip}"
    padding: "2px 8px"
  segmented-control:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.soft}"
    rounded: "{rounded.inset}"
    padding: "3px"
  segmented-control-active:
    backgroundColor: "{colors.panel-3}"
    textColor: "{colors.ink}"
  preview-monitor:
    backgroundColor: "{colors.panel-3}"
    rounded: "{rounded.r-lg}"
    width: "470px"
  panel-card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r-lg}"
    padding: "{spacing.card-pad}"
  plan-recommended:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r-lg}"
    padding: "30px 26px"
  export-summary:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r-lg}"
    width: "720px"
  modal-sheet:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "34px"
    width: "480px"
---

# Design System: AI Viral Video Masterclass

## Overview

**Creative North Star: "The Editing Suite"**

The page is an editor's workspace seen at night: a near-black monitor ground, a few stepped panel greys for chrome, and one lime signal that behaves like the playhead. Wherever lime appears, something can be acted on or something is "live" (the scrub line, the buy button, the timecode digits, the filled stretch of the module track). Proof is presented as the effect running in an editor frame, not as a picture beside a feature list.

The world borrows real editor chrome and uses it as its component vocabulary: a preview monitor with a REC dot and running timecode, safe-area corner brackets on vertical frames, a draggable playhead with a flag and round knob, track lanes with square clip markers, a clip-metadata strip, an "export summary" for the value stack. Type is heavy, uppercase Poppins shouting the headline the way a thumbnail would, set against calm Manrope body copy in a soft sage grey. Density is generous between sections (80/120px) and tight inside editor chrome.

Flat by default: depth comes from the three stepped panels and hairline sage-tinted borders, with a single deep, downward shadow reserved for the objects you would pick up (monitor, phone, recommended plan, toast).

**Key Characteristics:**
- Near-black ground (#0A0B08) with three stepped panel tones; no light mode.
- Lime is the playhead and the action colour; red is the recording light only.
- Heavy uppercase Poppins display, Manrope body, tabular timecodes.
- Editor chrome as components: monitor, playhead, safe-area brackets, track lanes, timecode, export summary.
- Hairline borders over shadows; one deep shadow for lifted objects.

## Colors

A night-mode editor palette: warm-green-tinted blacks and sage greys carrying a single acid-lime signal and a rare recording red.

### Primary
- **Playhead Lime** (playhead-lime): every primary action, the scrub line and knob, the module-track fill and clip markers, timecode digits in the countdown bar, the second line of the hero headline and `em` accent words in section heads, checkmark icons. Hover lifts to **Lime Hover** (playhead-lime-hover). Text on lime is always Monitor Black.
- **Lime Wash** (lime-wash) and **Lime Line** (lime-line): the tinted fill and border of "with this" states: the recommended plan's top gradient, the "with the masterclass" comparison card, the example callout under each effect, an opened FAQ toggle, the "Free today" outline tag.

### Tertiary
- **REC Red** (rec-red): the blinking recording dot in editor chrome and the pain-point icons. Nothing else. Its deep shade (rec-red-deep) is reserved for dark red fills.

### Neutral
- **Monitor Black** (monitor-black): page ground and the ink on lime surfaces.
- **Panel / Panel 2 / Panel 3** (panel, panel-2, panel-3): stepped chrome. Panel for alternate sections, cards, plans and modals; Panel 2 for nested containers (export summary, segmented control, sticky bar, fit cards); Panel 3 for the topmost chrome (export header, active segment, image placeholder).
- **Ink** (ink): headlines and emphasised body.
- **Soft** (soft): default body and lede text, captions, chrome labels.
- **Mute** (mute): struck-through anchor prices, disabled plan features, metadata `dt` labels, legal fine print.
- **Line / Line 2** (line, line-2): sage-tinted hairlines. Line divides sections and list rows; Line 2 outlines containers, frames and ghost buttons.

### Named Rules
**The Playhead Rule.** Lime means "act here" or "this is live". It is never a decorative fill for a whole section or a paragraph colour.

**The Red Light Rule.** Red appears only as the recording dot and pain markers. It never colours a button, price or urgency banner.

## Typography

**Display Font:** Poppins 600-900 (fallback ui-rounded, system-ui)
**Body Font:** Manrope 400-800 (fallback system-ui, Roboto)

**Character:** A thumbnail-loud display face, uppercase and tightly tracked, paired with a quiet, slightly technical grotesque. Numbers that tick (timecodes, prices, value stack) are always tabular.

### Hierarchy
- **Display** (900, clamp(44px, 7.4vw, 86px), 0.9, -0.04em, uppercase): hero headline and the final call (which scales to 96px). Second line in lime; an ampersand set at half size in Soft.
- **Headline** (900, clamp(30px, 5vw, 56px), 1.05, -0.03em, uppercase): section heads; one or two words picked out in lime.
- **Title** (700-800, 19-28px, uppercase for effect, plan, audience and modal titles; sentence case for module and bonus titles): card and row headings.
- **Price** (900, 56px on plans, 46px in pop-ups, 44px "today" total, -0.04em): the number is the headline of its card.
- **Timecode** (Poppins 700, 13px, 0.06em, tabular): countdown, monitor counter, clip metadata.
- **Body** (Manrope 400, 16px, 1.6): default copy in Soft; ledes at 18-19px, max 46-58ch; FAQ answers max 65ch.
- **Label** (Manrope 800, 11.5-12px, 0.08-0.12em, uppercase): tags, clip markers, frame labels, spec `dt`, export header. Labels annotate an object; they never sit above a headline as an eyebrow.

### Named Rules
**The Tabular Clock Rule.** Anything that counts, ticks or totals uses tabular numerals so the digits do not jitter.

## Layout

A centred 1200px container with 20px gutters (32px from 768px). Sections stack with 80px vertical padding (120px from 900px), separated by a 1px Line border; alternate sections step to Panel. Section heads carry a 48px gap to content, max 820px wide, left-aligned in narrative sections and centred for offer sections.

The hero is a two-area grid: title and body on the left (1.12fr), the preview monitor on the right (0.88fr, max 470px), 64px column gap from 960px. On mobile the order is title, monitor, body so the scrub sits inside the first screen and a half. Content grids collapse to one column below 820-980px; bonuses go 1, 2, then 4 across (640px, 1080px). The proof row becomes a horizontal snap scroller on mobile. A fixed sticky CTA bar appears on mobile only (below 768px); the countdown bar is sticky on top at all widths.

Breakpoints used: 600, 640, 768, 820, 860, 900, 960, 980, 1080px.

## Elevation & Depth

Tonal layering first: Monitor Black, then Panel, Panel 2, Panel 3, each bounded by sage hairlines. Shadows are deep, soft and downward, used only on objects that read as physically lifted.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 18px 40px -18px rgba(0,0,0,.85)`): the preview monitor, phone frames, the recommended plan, the toast.
- **Button press** (`box-shadow: 0 14px 28px -14px rgba(0,0,0,.9), inset 0 -3px 0 rgba(0,0,0,.14)`): lime buttons only; the inset bottom edge gives a pressable key.
- **Knob** (`box-shadow: 0 10px 24px -8px rgba(0,0,0,.8)`): the playhead knob.
- **Sheet** (`box-shadow: 0 -20px 60px -20px rgba(0,0,0,.9)`): pop-up sheets and the sticky mobile bar, casting upward.

### Named Rules
**The Hairline First Rule.** Separate with a 1px Line before reaching for a shadow; a shadow means "you can pick this up".

## Shapes

Soft, rounded rectangles throughout, with radii stepping by object size: 6px for timecode digits and clip markers, 8px for tags and the focus ring, 12px for insets and the segmented control, 14px for buttons (16px for XL), 16px for demo frames, 24px for cards, monitor, plans and export summary, 26px for pop-up sheets (top corners only on mobile), 34px for phone frames. Circles are reserved for the playhead knob, REC dot and pop-up close. Module markers on the track are 14px squares at 4px radius, like clip blocks. The playhead flag is a pentagon pointer. Vertical frames carry four 18px L-shaped safe-area brackets at 14px inset.

## Components

### Buttons
Chunky, pressable keys.
- **Shape:** gently rounded (14px; 16px for XL), min height 54px (62px XL, 44px in the top bar).
- **Primary:** Playhead Lime with Monitor Black Poppins 700 text, 15px 26px padding, optional trailing arrow icon and a small Manrope sub-line.
- **Hover / Focus:** lifts 2px, background to Lime Hover, arrow nudges 4px right; press scales to 0.97. Focus is a 3px lime outline at 3px offset.
- **Ghost:** transparent with 1.5px Line 2 border and Ink text; border turns lime on hover. Used for secondary choices (Basic plan, "no thanks" in pop-ups).

### Tags
- **Style:** 12px uppercase Manrope 800, 0.08em, 8px radius, 5px 9px padding. Solid lime (status: "Best value", "Bonus 1"), lime outline ("Free today", savings), or dim outline in Soft.
- **REC dot:** 8px red circle blinking at 1.2s steps, paired with a chrome label.

### Timecode
Poppins 700 tabular digits in a 6px-radius chip: lime chip in the countdown bar, Panel 3 or Panel 2 chip elsewhere.

### Preview Monitor (signature)
A chrome row (REC dot + "PREVIEW" left, running timecode right) above a 24px-radius vertical frame on Panel 3 with Line 2 border and Lift shadow. Inside: after image under a before image clipped at the playhead position; a 3px lime playhead line with a pentagon flag at top and a 52px lime knob at centre (scales 1.1 while dragging); safe-area brackets; a bottom caption on a dark gradient with the result in lime. A full-frame invisible range input drives it, so it works by keyboard; focus outlines the whole frame. Below: a hint line and a Before / Split / After segmented control (Panel 2 track, Panel 3 active segment).

### Motion Demo Frames
Side-by-side 3:4 frames on near-black, 16px radius, uppercase frame labels top-left, a floor hairline, joined by a lime arrow. Source figure is a pale skeleton with lime joints; target is a solid lime figure. A play/pause button drives the loop. The object-swap loop is a 1:1 frame wiping between states with a lime line on a 5s alternate cycle. All motion respects reduced-motion.

### Module Timeline
A vertical track: 2px Line 2 rail with a lime fill that grows with scroll, square lime-bordered clip markers per module, and a solid lime "clip" chip holding each module number before the title.

### Cards / Containers
- **Corner Style:** 24px.
- **Background:** Panel (Panel 2 for fit cards and the export summary).
- **Shadow Strategy:** none at rest; see Elevation.
- **Border:** 1px Line; Line 2 for frames. Positive "with" cards add a lime-wash top gradient and Lime Line border.
- **Internal Padding:** 26-34px. Bonus cards lift 6px and pick up a Lime Line border on hover.

### Export Summary
The value stack as a render dialog: Panel 3 header with uppercase label text, rows split by dashed Line 2 with tabular amounts right-aligned, struck total in Mute and the "today" total in 44px lime Poppins 900, then a full-width XL lime button.

### Plans
Two cards; the recommended plan has a 2px lime border, lime-wash gradient, Lift shadow, a solid "Best value" tag, and sits first on mobile. Price at 56px with struck anchor in Mute; excluded features in Mute.

### Pop-ups
Bottom sheets on mobile (26px top corners, rising 40px over 0.45s), centred 480px dialogs from 640px. Panel background, Line 2 border, Sheet shadow, 82% black scrim, 44px circular close. Uppercase title with lime keyword, lime 46px price, lime primary button then a Manrope ghost refusal, and a small countdown chip. Work without JS via `:target`.

### Navigation
No menu: a brand lockup (26px lime rounded square with play glyph, wordmark with lime half) and a compact lime button. The sticky countdown bar on Panel sits above it.

## Do's and Don'ts

### Do:
- **Do** keep the ground Monitor Black (#0A0B08) and step depth through Panel, Panel 2, Panel 3.
- **Do** reserve Playhead Lime for actions, live indicators and one accent phrase per headline.
- **Do** present proof as an effect running inside editor chrome (monitor, frames, playhead, safe-area brackets).
- **Do** set every counting number in tabular figures.
- **Do** give every animated demo a reduced-motion fallback and a keyboard path.
- **Do** keep lime buttons at 54px minimum height with Monitor Black text.

### Don't:
- **Don't** use REC Red for buttons, prices or urgency banners; it is the recording light.
- **Don't** add a light theme or white cards; the world is a dark editor.
- **Don't** put uppercase label text above headlines as eyebrows; labels belong to objects (frames, tags, chrome).
- **Don't** reach for shadows to separate sections; use Line hairlines and panel steps.
- **Don't** show a static hero image with feature cards where an interactive effect demo can carry the proof.
