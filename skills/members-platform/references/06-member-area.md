# Member area

## Library (`/library`)
- Sections in the admin's order; each product shows as **owned**, **free**, **locked** (desaturated cover, padlock, price pill) or **coming soon**. Hidden products never appear.
- Filters "Everything / My library / Unlock more", search in the top bar, "Continue reading" for the last reading product in progress.
- Data from `library_items(locale)` (one RPC, ownership computed in SQL).

## Product pages (`/products/[slug]`)
| Type | Page |
|---|---|
| Colouring pack | Page grid with previews, colour online (`/colour/[n]`), download each page or the whole pack |
| eBook / guide / workbook | Contents with progress, online reader (`/read/[n]`) with font size, free sample chapters, PDF/EPUB downloads |
| **Kit** | "What's included" list while locked (titles, kinds, sizes, durations — never files); once owned, every material with Download, image View, an in-page audio player, and "Download everything" when a ZIP exists |

Any product can carry extra materials ("More materials"). Locked pages always lead to the padlock checkout, never a dead end.

## Materials (`product_assets`)
- Kinds: pdf, epub, image (png/jpg/webp), audio (mp3/m4a), zip. Up to 50 MB each (Supabase free plan limit per file; 64 kbps mono MP3 fits ~100 minutes of speech).
- Language per material: "all languages" or one; members see all-language materials plus their language's (English when none in theirs).
- Owning the product opens all materials; any refund closes all of them. That is how a kit works: one gateway product id, one entitlement, many files.

## Downloads (`/api/products/[id]/download`)
- `?asset=<id>` (or `?page=<n>`, or legacy `?format=pdf|epub`): check access with the **member's own session** (`has_access`), then redirect to a signed Storage URL. No session → 401, no access → 403, even with the direct URL.
- Signed URL lifetime: 60 s for downloads, 10 min for images viewed inline, **3 h for audio** played in the page (the player keeps range-requesting the same URL while the member seeks). `&view=1` means inline.
- CSP must allow `media-src` from the Supabase origin (and `blob:` for the admin's duration reader).

## Reader and colouring
- Chapters are Markdown in the admin, stored as sanitised HTML (`sanitize-html`), with reading minutes computed. Progress saved per member.
- Colouring studio: built-in SVG art fills region by region; uploaded images use a flood fill that stops at lines; colours saved on the device; download as PNG.

## Profile and privacy
Name, language (also used for emails), password, **download my data** (JSON), **delete my account** (profile, access, progress, invites and email history deleted; orders kept without the link, for tax law). Help page with WhatsApp, email and refund policy link.
