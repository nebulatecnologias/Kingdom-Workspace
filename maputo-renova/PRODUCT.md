# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Prototype: Next.js (App Router) + TypeScript + Tailwind CSS v4, with fictitious sample data in MZN (no backend yet). Chosen by the user ("Next.js já no protótipo"). The production stack (database, auth, payment integrations, hosting) is decided in the development plan that follows the prototype; open decision.

## Users

- **Equipa financeira da Maputo Renova (primary, daily):** gestor/a de cobranças e contabilista. Emit the monthly condominium-fee invoices across the whole portfolio, watch M-Pesa and e-Mola payments arrive, resolve the payments that did not reconcile on their own, and chase overdue units.
- **Administradores de condomínio:** each condominium's manager; sees only their own condominium (blocks, fracções, residents), follows who has paid and who is in arrears, and requests reminders.
- **Condóminos (moradores/proprietários):** receive their invoice, pay by M-Pesa or e-Mola with a reference, and check their statement and receipts. (Portal for residents is a separate surface from the finance dashboard.)

## Product Purpose

A platform that centralises billing and collection for Maputo Renova, Lda., a company that manages a portfolio of several condominiums in Maputo. It issues the condominium fees (quotas mensais and extra charges) per fracção, collects them through M-Pesa (Vodacom) and e-Mola (Movitel), reconciles each incoming payment against the right invoice automatically, and controls arrears (inadimplência) with ageing, reminders and payment agreements. Success = month-end close without spreadsheets: every payment matched to an invoice, the unmatched ones visible and resolved in minutes, and the arrears rate falling month over month.

## Positioning

Built around Mozambican mobile money as the primary payment rail, not card or bank-first: every invoice carries a payment reference that M-Pesa and e-Mola payments match against, so reconciliation is the core mechanism rather than an afterthought, and arrears control is per fracção across a multi-condominium portfolio.

## Operating Context

- Monthly cycle: generate invoices for every fracção of every condominium → send to residents (SMS/WhatsApp/email; channels to confirm) → payments arrive by M-Pesa / e-Mola → automatic reconciliation by reference, phone number and amount → exceptions queue (partial, overpaid, wrong reference, unknown payer) → arrears follow-up.
- Currency MZN (Metical), amounts formatted like `12 500,00 MT`. Language Portuguese (Mozambique). Dates dd/mm/aaaa. Location Maputo (and possibly Matola; unconfirmed).
- Multi-tenant by condominium: the finance team sees the portfolio; each administrator sees one condominium.

## Capabilities and Constraints

- Prototype scope: the finance team's dashboard (overview of billing, collections by channel, reconciliation status, arrears) with clickable navigation; data is fictitious.
- Terminology: condomínio, bloco, fracção, condómino, quota, factura, recibo, referência de pagamento, reconciliação, inadimplência, acordo de pagamento.
- Open decisions: other payment rails (bank transfer, cash at office, POS); legal/fiscal invoice requirements (AT Moçambique, NUIT, IVA on fees); late-payment penalties/interest rules; message channels; exact M-Pesa / e-Mola integration APIs available to the company.

## Brand Commitments

- Name: Maputo Renova, Lda. No logo or brand colors supplied yet.
- Visual reference pinned by the user: a light fintech dashboard (left sidebar with grouped menu, search and top-bar icons, welcome heading with date and Export button, KPI cards with month-over-month change, green primary buttons, green bar chart with highlighted month and tooltip, recent transactions table with status pills, upgrade card in the sidebar). Prototype must be "com base na referência".

## Evidence on Hand

- No real data, customers, condominium names, volumes or rates. All figures in the prototype are fictitious and must be labelled as sample data; no claims about clients, integrations already live, or performance.

## Product Principles

- Reconciliation first: every screen answers "what has been paid, what has not been matched, who owes".
- Mobile money is native: M-Pesa and e-Mola are first-class, each visible on its own.
- Per-fracção truth: totals always drill down to the unit and resident.
- Exceptions over averages: what needs a human today is surfaced before vanity totals.

## Accessibility & Inclusion

- WCAG 2.1 AA contrast and keyboard access; Portuguese copy in plain language; works on modest laptops and on phones for administrators.
