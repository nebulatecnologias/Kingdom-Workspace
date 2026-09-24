# Implementing Kingdom UI in Next.js + Tailwind v4

The recommended production stack is Next.js (App Router, TypeScript), Tailwind CSS v4, `next/font`, `lucide-react`, Radix primitives (via shadcn/ui if you like) and next-intl. The goal is **the same pixels as `assets/kingdom-ui.css`**. The framework is only the delivery mechanism.

## 1. Font
Self-host Google Sans through `next/font/google` so no third-party request happens at runtime.

```ts
// app/fonts.ts
import { Google_Sans } from 'next/font/google'; // if the export name differs in your Next version, use next/font/local with the woff2 files
export const googleSans = Google_Sans({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-google-sans', display: 'swap' });
```
Apply `className={googleSans.variable}` on `<html>`, and keep the fallback stack: `var(--font-google-sans), "Product Sans", "Segoe UI", Roboto, system-ui, sans-serif`.

## 2. Tokens → Tailwind v4
Copy `assets/tailwind-theme.css` into `app/globals.css` after `@import "tailwindcss";`. It:
- declares all colour, radius and shadow tokens as CSS variables with dark overrides, keeping the same names as `kingdom-ui.css`;
- exposes them to Tailwind through `@theme inline`, so you can write `bg-canvas`, `bg-surface`, `text-ink`, `text-muted`, `border-line`, `rounded-card`, `rounded-field`, `shadow-rest`, `shadow-lift`, `shadow-popover`, `shadow-cta`, `shadow-focus`, `ease-kingdom`, and the gradient utilities `bg-cta`, `bg-cta-hover`, `bg-card`, `bg-brand`.

Light/dark behaviour: follow `prefers-color-scheme` by default, and let `data-theme="light|dark"` on `<html>` override it.

## 3. Component mapping
| Kingdom UI | Build with |
|---|---|
| `.btn` variants | A `<Button variant="primary\|ghost\|quiet\|danger" size="sm\|md\|lg">` (cva). Primary = `bg-cta shadow-cta text-white rounded-full h-[42px] px-[18px] font-medium` |
| Split CTA | Button + Radix `DropdownMenu` |
| Pills | `<Pill tone="green\|red\|orange\|blue\|grey\|violet\|soft-green\|soft-red" dot>` |
| Card | `<Card>` = `rounded-card border border-line bg-card shadow-rest` |
| Dialog / drawer | Radix `Dialog` (drawer = Dialog styled as right sheet) with the `rise` / `slide` keyframes |
| Toast | Sonner or Radix Toast, styled dark (`bg-ink text-canvas`), bottom-centre |
| Segmented control | Radix `ToggleGroup` type="single" |
| Toggle | Radix `Switch` (green when on) |
| Select | Native `<select>` styled like `.select` for simple cases, Radix `Select` when you need rich items |
| Tabs | Radix `Tabs` with an orange 2px underline |
| Table | Plain `<table>` inside a card; TanStack Table only if sorting/paging is needed |
| Icons | `lucide-react`, `size={18}` `strokeWidth={1.8}` |
| Line art | Port `line-art.js` drawings to React components returning `<svg>`; keep `mode: 'color' \| 'line'` |

If you use shadcn/ui, **restyle its variables to Kingdom tokens.** Do not ship its default zinc look. For example: `--primary` → orange 500, `--radius` → 22px for cards, and buttons forced to `rounded-full`.

## 4. Layout
- `app/(member)/layout.tsx` and `app/(admin)/layout.tsx` render the same `<AppShell>` with different nav config.
- `<AppShell>` = sidebar (`hidden lg:flex w-[264px] sticky top-0 h-dvh bg-canvas-2 border-r border-line`), main, mobile bar and tab bar (`lg:hidden`).
- Use `min-h-dvh`, and `env(safe-area-inset-bottom)` on the tab bar.
- Breakpoints: Tailwind `lg` (1024) is close enough to 980. For exact parity, add custom screens `--breakpoint-shell: 980px` and `--breakpoint-wide: 1180px`.

## 5. i18n
- next-intl with `messages/{en,pt,es}.json` and flat keys (the same keys as the reference prototype's `I18N` object make migration trivial).
- No locale prefix in URLs for logged-in areas; the locale comes from the user profile or a cookie.
- `formatNumber(value, { style: 'currency', currency: 'ZAR' })` and `formatDateTime` from next-intl.

## 6. Quality gates
- A test that fails on missing translation keys.
- Playwright screenshots at 1440 and 390 of the main screens.
- Lighthouse mobile ≥ 90 for accessibility and performance.
