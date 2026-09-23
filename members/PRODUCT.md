# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Prototype: static HTML/CSS/JS (single clickable file, sample data). Production: Next.js (App Router) + Supabase (Postgres, Auth, private Storage) + Resend (transactional email) on Vercel, reusing the prototype's design tokens. Chosen by the user on the recommended option.

## Users

- **Members (buyers):** the general public in South Africa who buy Kingdom's Christian digital content — parents buying colouring packs for children, lay preachers and teachers buying sermon guides and workbooks, and adults buying books on Christian living (e.g. biblical finances). They mostly arrive on a phone from a purchase email and want to open, read, download or print straight away.
- **Administrator:** the owner (Portuguese speaker) who issues invites, controls which products appear in the showcase and in which section, grants/revokes access and watches the gateway integration.

## Product Purpose

Kingdom Members is the private library where buyers of Kingdom's Christian digital products get what they bought. Product types today: colouring packs (printable A4 pages + on-screen colouring), eBooks (read online + PDF/EPUB), guides (step-by-step, with templates) and workbooks (printable A4 worksheets); new types can be added later. A purchase in the owner's own payment gateway (Paystack underneath) fires a signed webhook; the member receives a welcome email with a single-use, time-limited link that goes straight to account creation and into the library. Inside, owned products are open; other products show a padlock and lead to the gateway checkout, and are unlocked automatically after payment. Success = a buyer goes from email to opening what they bought in under two minutes without contacting support.

## Positioning

A members area built around one family's product line and one gateway, not a generic LMS: every step (invite, unlock, refund) is driven by the owner's own gateway events, and the content is books, guides, workbooks and printable art rather than video courses.

## Operating Context

- Purchase → gateway `order.paid` webhook → invite email (buyer's checkout language) → create account (email locked) → library.
- Sign-in by email link or by password; "request a new link" self-service for expired or lost invites.
- Invite links: single use (consumed on account creation, not on click, because mail scanners pre-open links), expire after a set number of days, revocable.
- Locked product → gateway checkout pre-filled with email + member id → webhook unlocks it on the existing account.
- Refund / chargeback events revoke access.
- Currency ZAR; paper size A4; mobile-first; data-light.

## Capabilities and Constraints

- Languages: English (South African spelling, default), Portuguese, Spanish — interface and emails.
- Showcase organised in sections (e.g. For children, For preachers and teachers, Christian living), ordered by the admin.
- Reading products: table of contents, online reader with progress, free sample (chapter 1) for locked products, PDF/EPUB download.
- Admin: invites (create, resend, revoke, copy), members (grant/revoke products, deactivate), showcase (sections, order, visibility: visible / coming soon / hidden; access: paid / free), product editor (type, section, translations, pages or files and chapters), integrations (webhook endpoint, signing secret, product mapping, delivery log).
- POPIA: the account belongs to the adult; no data is collected from children; members can export or delete their data.
- Undecided: production domain, final product names/prices, real artwork and manuscripts, WhatsApp support number.

## Brand Commitments

- Name: **Kingdom Members**.
- Logo: orange rounded-square app mark with a white crown (`members/prototype/assets/logo-source.png`).
- Typeface: **Google Sans**.
- Visual reference pinned by the user: the "Ware Sync" warehouse SaaS dashboard (warm off-white canvas, orange gradient pill CTAs, soft rounded cards, green status pills, violet countdown card, activity feed with mention chips).
- Voice: warm, simple, faith-grounded without preaching; South African English in emails.

## Evidence on Hand

- No real product names, covers, artwork, manuscripts, prices, testimonials or customer numbers yet. All products, pages, chapters, members, orders and figures in the prototype are synthetic sample data and must be replaced.

## Product Principles

1. Email to first opened product in under two minutes; no dead ends.
2. The gateway is the source of truth for access; the admin can always override by hand.
3. Locked content sells by showing, not nagging: a padlock, a price, one tap to checkout.
4. Every link failure has a self-service recovery.
5. Same language end to end: checkout → email → interface.

## Accessibility & Inclusion

Mobile-first for low-data, small-screen use; WCAG AA contrast; large tap targets for parents handing the phone to a child.
