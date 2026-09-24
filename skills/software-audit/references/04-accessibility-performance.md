# 4. Accessibility and performance

## Accessibility

Target WCAG 2.2 AA. Automated tools (axe in `crawl_screens.mjs`) catch roughly a third of issues; the manual passes below catch the rest.

### Automated
The crawler reports axe violations per page and viewport, plus images without alt, inputs without labels, buttons/links without a name, and touch targets under 44 px on phone. Group repeated violations by component (one finding "IconButton has no accessible name, 14 pages" beats 14 findings).

### Keyboard pass (every key journey)
- Tab reaches every control in a logical order; nothing traps focus; Shift+Tab goes back.
- Focus is always visible (not removed with `outline: none` without a replacement).
- Enter/Space activate buttons; Enter submits forms with the **main** action; Escape closes dialogs and menus.
- Dialogs move focus in, keep it inside, and return it on close.
- A "skip to content" link on pages with long navigation.

### Screen reader pass (spot check)
With VoiceOver or NVDA, or by reading the accessibility tree in Playwright (`await page.locator("body").ariaSnapshot()`):
- One `h1`, headings in order, landmarks (`header`, `nav`, `main`, `footer`).
- Buttons are buttons, links are links; icon-only controls have a name.
- Form errors announced (`aria-live` or focus moved to them); toasts in a live region.
- Language set on `<html lang>` and changed with the UI language.
- Images: meaningful alt, or `alt=""` when decorative.

### Visual
Contrast (4.5:1 text, 3:1 large text and UI parts), zoom to 200% without loss, text spacing override, no information carried by colour alone, reduced motion respected (`prefers-reduced-motion`), no auto-playing media with sound.

### Media and documents
Audio/video controls usable by keyboard; transcripts or captions where content is spoken. Downloadable PDFs: tagged if possible, at least titled.

## Performance

Measure on a phone profile over a throttled network; users rarely have the developer's laptop.

### Front end
- Core Web Vitals on the key pages: LCP < 2.5 s, INP < 200 ms, CLS < 0.1. Use Lighthouse (`npx lighthouse <url> --preset=perf --form-factor=mobile`) or the browser's performance panel.
- Page weight and JS size: large client bundles, whole libraries imported for one function, client components that could be server-rendered.
- Images: modern formats, sized to their slot, lazy below the fold, explicit width/height (prevents CLS).
- Fonts: few weights, `font-display: swap`, preloaded if above the fold.
- Third-party scripts: each one justified; loaded after the main content.

### Back end and database
- N+1 queries (a query inside a loop over rows), missing indexes on foreign keys and on columns used in `where`/`order by`, unbounded lists without pagination, `select *` of large columns.
- Database advisors if available (Supabase `get_advisors` type `performance`: unindexed foreign keys, RLS policies that re-evaluate `auth.uid()` per row, etc.).
- Slow endpoints: time the key API routes; anything over ~500 ms on a small dataset will get worse.
- Caching: static assets cached long with hashes; personal pages not cached publicly (check `Cache-Control` on authenticated responses).
- Timeouts and retries on calls to third parties; a slow email provider shouldn't hang a page.

Report performance with numbers (before, target, how measured), not adjectives.
