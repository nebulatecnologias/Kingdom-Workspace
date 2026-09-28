# Screen templates and UX patterns

Every template exists, fully working, in `assets/reference-prototype.html`. Open it and use the "Prototype map" button to see each one. The route names are listed so you can find the code (search the file for the view function).

**Contents:**
1. App shell (member / admin)
2. Overview dashboard
3. List / table page
4. Catalogue / library
5. Detail page
6. Reader
7. Editor with live preview
8. Settings / integrations
9. Auth split
10. Transactional emails
11. Cross-cutting patterns

---

## 1. App shell
- **Desktop (≥ 980px):** a 264px sticky sidebar plus the main column.
  - Sidebar top to bottom: brand; (admin only) split CTA; nav; spacer; secondary links (e.g. "View member area", "Prototype map"); user chip with sign-out.
  - Main column: top bar (search pill, language select, help or notifications), then page head, then content.
- **Mobile:** a sticky blurred top bar (brand, compact controls, avatar or "+" for admin) and a fixed bottom tab bar with 3–5 destinations. Add bottom padding to `main` so nothing hides under the tab bar.
- **Two audiences, one world.** When a product has end users and administrators, they share the same shell, tokens and components. Admin adds the split CTA, denser tables and an "Administrator" subtitle under the brand. There is no separate admin theme.
- Reference: `memberShell()` and `adminShell()`.

## 2. Overview dashboard (`#admin`)
- The page head has a title and a one-line lead, but no action button (the sidebar split CTA is the primary).
- Row 1 (`.kpis`): three KPI cards, plus one countdown card for the most time-critical item.
- Row 2 (`.admin-grid`): a main card on the left (people or items waiting, as person cards in a 2-up grid, with "View all"), and the activity feed on the right (360px).
- Show at most about 6 items per widget, and link "View all" to the full list page.

## 3. List / table page (`#admin-invites`, `#admin-members`)
- Page head (title + lead), then one card containing:
  - a toolbar with status filter chips carrying counts, and a mini search;
  - the table.
- Row actions are 34px icon buttons with `aria-label`s. Destructive actions confirm inline in the row.
- Clicking a row opens a **drawer** with the record: header (avatar, name, email), pills (language, status, date), sections (e.g. access toggles per product), and actions.
- Create actions open a drawer form. On success, close it, show a toast and put the new row at the top.

## 4. Catalogue / library (`#library`)
- Page head: a greeting ("Hello, Thandi") and a one-line lead.
- **Continue card** (only when there is progress): thumbnail, a heading that includes the item name ("Keep reading …"), a progress bar, and a primary action.
- Filter chips on one row: All · Mine · Unlock more, with counts.
- Items grouped in titled sections that the admin orders (`.lib-sec`). Hide empty sections.
- Owned, locked and soon states follow the product-card rules. Search filters in place. The empty result says "Nothing matches “…”."
- Optional closing line: a short verse or brand line, centred and muted, with no label.

## 5. Detail page (`#pack-money`, `#pack-noah`)
- Back link, then a hero (1:1 cover on its pastel field on the left; pills, title, description, facts and actions on the right).
- The actions depend on state:
  - **Owned:** primary "Open / Continue", plus ghost "Download".
  - **Locked:** primary "Unlock · price", plus ghost "Read a free sample" when possible, and a one-line explanation.
- Below the hero, the content listing that fits the type: a numbered table of contents for sequential content, or a grid of A4 sheets (`210/297`, white paper with inset border) for printable pages.

## 6. Reader (reader dialog)
- A wide dialog. The header has the item and chapter as a small muted line, then the chapter title; on the right, A− / A+ and close.
- The article is 64ch max, 17px text at line-height 1.75.
- The footer has Previous, a "4 / 9" counter and a primary "Next chapter".
- Progress is saved on open. For locked content, the sample ends with an info notice and the unlock button.

## 7. Editor with live preview (`#admin-pack-money`)
- Back link to the list, then a page head (title + ID/status line) with the Save primary.
- Two columns:
  - **Left:** a card with tabs (Details / Content / Sales & access). Translatable fields sit behind an EN/PT/ES segmented control with the hint "Editing the English version".
  - **Right:** "Preview" (the real end-user card, with an Owned/Locked toggle), and a key-value summary card.
- Uploads use a dashed dropzone and file rows (icon, name, format · size, replace).

## 8. Settings / integrations (`#admin-integrations`)
- Main column:
  - a connection card (icon tile, name, green "Connected · last event" pill; URL and secret in code fields with Copy / Reveal / Rotate; events as code chips; a "Send test event" primary);
  - a mapping table;
  - a delivery log table with result pills (Processed, Duplicate ignored, Signature rejected, Test OK).
- Side column: a setup checklist (numbered circles that turn into green checks) and a "More integrations" card.

## 9. Auth split (`#invite`, `#login`, `#link-expired`, `#access`)
- **Left:** the brand panel (orange 160deg gradient, 30px radius, 14px margin). It holds the brand, a collage of three tilted white sheets or covers, a headline and a paragraph.
- **Right:** a centred 440px card column. Top row: [prototype or back link] + language select. Then heading + lead, a context row (what they bought), the form, the primary action and a small reassurance line (clock icon + expiry date).
- On mobile the panel stacks on top at a compact height.
- **Sign in:** a segmented control for "Email me a link" / "Use password". The link mode shows a hint; the password mode shows "Forgot password?".
- **Every error state gets its own screen with a recovery form:** link expired, link already used, check your inbox (with a resend countdown), and request a new link. Use neutral wording that does not reveal whether an account exists.

## 10. Transactional emails (`#email-invite`, `#email-link`, `#email-unlocked`)
- Emails are always light and use literal colours, not CSS variables.
- Structure:
  - a 560px white card on `#f3f1ee` with an 18px radius;
  - a gradient band with the logo and 700 wordmark;
  - a 30px padded body: 25px headline, "Hi {name},", 1–2 short paragraphs, visual context (small covers), the CTA pill, a small print line (expiry / safety);
  - a verse or brand line above a hairline, then the sign-off and help line;
  - a `#faf8f5` footer at 12px explaining why they got the email and the privacy line.
- One CTA per email.

## 11. Cross-cutting patterns
- **Locked content → purchase:**
  1. Tapping the padlock opens a summary dialog (cover, "Unlock X", what's inside as check rows, total, primary "Continue to secure checkout", and a shield line saying who processes the payment).
  2. The payment happens on the external gateway.
  3. The user returns to a "confirming…" state, then gets a toast and is taken to the unlocked item.
- **Invite / one-time links:** a link opens a page but is only consumed on the action (because mail scanners pre-open links). Show the expiry date wherever the link appears.
- **Language:** a select in the top bar and on auth screens, plus a segmented control in Profile. The choice persists and drives emails too.
- **Profile:** separate cards for details (email read-only, with an explanation), language, sign-in methods (email link always on; password optional), and privacy (download my data; delete account with inline confirmation).
- **Help:** a Help nav item opens a dialog with WhatsApp and email as selectable text rows.
- **Prototype-only affordance:** a dashed "Prototype map" pill in the sidebar footer (icon-only on mobile) lists every screen by group. Remove it from production builds.
