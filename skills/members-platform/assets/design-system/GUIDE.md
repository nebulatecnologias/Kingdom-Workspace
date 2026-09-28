---
name: kingdom-design-system
description: The Kingdom UI design system ("Warm Dashboard, Loud Art"), taken from the Kingdom Members app. It covers the warm stone-grey canvas, orange gradient pill buttons, soft 22px cards, the Google Sans type ramp, green/red/violet status pills, the KPI and countdown cards, the activity feed, sidebar + bottom tab bar app shell, locked/owned product cards, a reader, forms, tables, dialogs, drawers, toasts, light/dark themes, thick-line pastel illustrations, and EN/PT/ES copy rules. Use this skill whenever you build or restyle any screen, app, dashboard, admin panel, members area, landing page, email template or prototype for Kingdom or a Kingdom-built product, or when the user says "use our design system", "same look as Kingdom Members", "Kingdom style", "o nosso design system" or attaches this skill. Use it for Next.js/React/Tailwind builds and for single-file HTML prototypes alike, even if the user only names the product and not the design system.
---

# Kingdom UI: design system

Kingdom UI is the visual world of **Kingdom Members**, a members area for Christian digital content. It is built to be reused across other Kingdom products. It is a warm, calm SaaS dashboard: the chrome stays quiet and the content (artwork, covers, numbers that matter) is the only loud thing.

The design is proven: it went through a full clickable prototype, design review and fixes. Your job with this skill is to reproduce the same world faithfully in a new product. Invent structure for the new domain, but do not invent a new look.

## What's in this skill

| File | Use it for |
|---|---|
| `assets/kingdom-ui.css` | **The source of truth.** Complete stylesheet with tokens (light + dark), base styles and every component class. Copy it into single-file prototypes; port its values into Tailwind for production. |
| `assets/design-tokens.json` | Machine-readable tokens: colours with dark values and tonal ramps, shadows, gradients, motion, breakpoints. |
| `assets/reference-prototype.html` | The full working Kingdom Members prototype. Open it or read it when you need to see exactly how a pattern was built (member library, reader, admin overview, tables, editor, integrations, emails, auth). |
| `assets/icons.js` | The icon set (24px, stroke 1.8, round). The shapes match Lucide, so use `lucide-react` in React apps. |
| `assets/line-art.js` | Thick-line pastel illustration helpers and examples (`artSVG(id, 'color' \| 'line')`). |
| `assets/logo.svg`, `assets/logo.png` | Kingdom crown app mark. |
| `references/tokens.md` | Colour, type, spacing, radius, shadow, motion and breakpoint tables, with the rules behind them. **Read first.** |
| `references/components.md` | Every component with its anatomy, states and copy-ready HTML. |
| `references/patterns.md` | Screen templates (app shell, dashboard, list/table, detail, editor, settings/integrations, auth, library/showcase, reader, emails) and cross-cutting UX patterns. |
| `references/voice-and-i18n.md` | Tone, South African English spelling, EN/PT/ES structure, money and date formats, privacy (POPIA) copy. |
| `references/illustration.md` | How to draw new covers and illustrations in the house style. |
| `references/implementation-nextjs.md` | Mapping to Next.js + Tailwind v4 + next/font + shadcn/Radix, with a ready `@theme` block. |

## How to use it

1. **Read `references/tokens.md`, then skim `references/components.md`.** Tokens and components are about 80% of the look.
2. **Pick the screen template** for each screen in `references/patterns.md`. Most business screens fit one: overview dashboard, list/table, detail, editor with side preview, settings, auth split, content library, reader.
3. **Build with the real values.**
   - **Single-file HTML prototype:** paste `assets/kingdom-ui.css` into a `<style>` block, load Google Sans from Google Fonts, and use the class names as documented.
   - **Next.js / React:** follow `references/implementation-nextjs.md`.
   - Do not approximate colours or radii from memory. Copy them.
4. **Write the copy** following `references/voice-and-i18n.md`. Set up EN/PT/ES from the first screen when the product is multilingual. Default to South African English.
5. **Check the result** against the checklist at the end of this file before you hand it over.

## The world in one screen

- **Ground:** warm stone canvas `#f5f3f0`. The sidebar sits one step deeper on `#efece8`. Cards are white with a barely-there vertical gradient (`#ffffff` → `#fbfaf8`), a 1px `#e8e3dd` border, **22px corners** and a soft, warm, diffuse shadow.
- **One voice:** a single orange gradient (`#ff7f37` → `#f2570f`, 180deg) for the one primary action, progress bars, KPI mini-bars and brand panels. Everything else is stone neutrals.
- **Status colour only lives in pills, dots and notices.**
  - Solid green `#15803d`: owned, active, connected.
  - Solid red `#d42a39`: expiring, urgent.
  - Soft/ink pairs (orange, blue, green, grey, red): lifecycle states.
  - Violet `#7b72e8` → `#564cc9`: reserved for time/deadlines (countdown card) and people (`@mention` chips).
- **Type:** Google Sans only. Weight **500** for everything that names something (headings, labels, buttons, numbers); **400** for running text; 700 only for the wordmark. Headings get authority from size and negative tracking (-0.015 to -0.03em), never from bold.
- **Shapes:** every pressable or filterable thing is a **full pill** (buttons, chips, search, segmented controls, toggles, status pills, progress). Containers are 22px, dialogs 26px, and inner shapes step down: 16 → 14 → 12 → 8.
- **Depth:** shadows are warm (`rgba(28,22,16,…)`), large blur, negative spread. Cards lift `translateY(-3px)` on hover. No hard or offset shadows.
- **Content is the colour:** covers, illustrations and artwork sit on pastel fields with thick near-black line art (3.2px stroke). This is the only multi-hue area of any screen.
- **Themes:** full light and dark via the same custom properties (`prefers-color-scheme` plus `data-theme` override). Solid accents keep their values in dark mode.

## Rules that make it look right

These rules came out of the Kingdom Members design review. Each one fixes a failure that was actually seen.

- **One primary per view.** A screen has one gradient button. Secondary actions are ghost (white, hairline border) or quiet (text). In admin shells, the sidebar split pill ("+ New …" with a chevron menu) is the standing primary, so page heads don't add another gradient button.
- **No eyebrows.** Never put a small label above a heading ("Continue colouring" above a title, "Your purchase" above a product). Rewrite it into the heading itself ("Keep reading Money God's Way"). KPI metric labels and sidebar group labels are data or navigation labels, so they stay.
- **Locked means three signals.** A desaturated cover (`saturate(.5)`, line art only), a dark translucent padlock disc top-right, and an orange-soft price pill. Tapping opens the purchase flow, never a dead end. Offer a free sample where the content allows.
- **Truncate the text, never the count.** In compact rows, ellipsise the title and keep "+2" or the number visible.
- **Violet is for time and people only.** Never use it as a generic accent.
- **Contrast.** `faint` (`#7d766e`) is for placeholders and chevrons, not for text people must read. Body and labels use `ink`, `ink-2` or `muted`. White on the orange gradient is below AA at small sizes: keep button labels at 14.5px/500 or larger, and use the AA gradient variant `--cta-aa` (`#d4460b` → `#b83d08`, see tokens) if the product must meet WCAG AA strictly.
- **Mobile is first-class.** Under 980px the sidebar becomes a blurred sticky top bar plus a fixed bottom tab bar (respect `env(safe-area-inset-*)`). Under 640px, grids go two-up, filter chips scroll horizontally on one row, and the most important content must appear in the first phone screen.
- **Every failure has a recovery.** Expired or used links, empty lists, failed payments and missing permissions each get a message that says what happened and a button that fixes it.
- **No emoji as icons, no gradient text, no glassmorphism, no coloured side-borders on cards.** Icons come from the stroke set (Lucide).

## Brand

- Use the **Kingdom crown mark** (`assets/logo.svg`): an orange rounded square (15/64 radius) with a white crown and a soft orange drop shadow. Put it beside the product name in 700 weight, -0.02em tracking (e.g. "Kingdom Members"), with an optional 12px `muted` subtitle ("Administrator").
- A new Kingdom product keeps the crown mark and changes only the product name, unless the user supplies a different logo.
- Brand panels (auth left panel, email header band) use the orange gradient at 160deg (`#ff8a45` → `#f25a12` → `#d9470a`) with white text.

## Hand-off checklist

Before you present a screen, check every point:

- [ ] Canvas, cards, borders, shadows and radii use the token values (not approximations).
- [ ] Google Sans is loaded (Google Fonts in prototypes, `next/font` in Next.js), with the fallback stack.
- [ ] Exactly one gradient primary per view. No eyebrows above headings.
- [ ] Status shown with the right pill and colour. Violet used only for time and people.
- [ ] Hover, focus (orange ring), disabled, loading, empty and error states exist for what you built.
- [ ] Works at 390px: bottom tab bar, two-up grids, no horizontal page scroll, key content in the first screen.
- [ ] Dark theme renders (tokens redefined, body background from a token).
- [ ] Copy follows voice-and-i18n: plain, warm, controls name their action. Money in ZAR via `Intl.NumberFormat`. Strings live in a translation dictionary if the product is multilingual.
- [ ] Numbers in tables, KPIs and prices use `font-variant-numeric: tabular-nums`.
- [ ] `prefers-reduced-motion` respected. One easing `cubic-bezier(.22,1,.36,1)`, 150–300ms.
