---
version: 1
slug: "maputo-renova-app-src-app-page-tsx"
primary_target: "maputo-renova/app/src/app/page.tsx"
related_targets: []
---

# Surface: Painel da equipa financeira (Visão geral + Reconciliação, Pagamentos, Inadimplência, Facturação, Condomínios)

Mode: Operate. Audience: equipa financeira da Maputo Renova (gestora de cobranças, contabilista), daily, on laptops; administradores secondarily on phones. Job: see what needs a human today (unreconciled payments, critical debtors, instalments due), then the month's totals, then the live payment flow. Constraints: pinned visual reference (light fintech dashboard, green primary, sidebar, KPI cards with MoM change, bar chart with highlighted month and tooltip, transactions table with status pills, sidebar promo card). All data fictitious and labelled as such.

Direction chosen: "Balcões por canal" (user did not answer the direction question; the assigned direction was taken and stated). The user answered priority: "O que precisa de mim hoje" first.

## Direction contract

THESIS: Each payment rail is a counter (balcão) with its own colour, float and daily close, the way an M-Pesa or e-Mola agent runs a booth; the page refuses the category default of one blended "revenue" number and one green chart, and refuses hiding exceptions under totals.

OWN-WORLD: Pinned light world: near-white cool ground, white cards radius 16, one green (primary actions, reconciled state, selection). Channel identities as squared painted-sign tags (radius 4, bold short caps): M-Pesa red, e-Mola amber, Banco slate-blue, Numerário neutral; used in chips, stacked bars, feed rows, booth tiles. Transaction IDs set in mono as data. Geist with tabular numerals. Lucide 1.5px icons.

STORY: The visitor sees what to resolve today, trusts the month's totals because every amount is traced to a channel and an invoice, and acts: resolve an exception, send reminders, close a channel's day.

FIRST VIEWPORT: Sidebar left (brand, grouped menu with exception/debtor counts, bottom green "Fecho de Outubro" card). Top bar: search for fracção/condómino/referência, condomínio selector, sample-data tag, icons, avatar. Heading "Bom dia, Helena" with cycle date, Exportar (dark) and Emitir facturas (green). Full-width "Precisa de si hoje" strip: three segments in one panel with counts, amounts and inline actions. Below: left "Cobrado em Outubro" panel with green Registar pagamento and the 2x2 Balcões grid (today's float + Aberto/Fechado); right two KPI cards (Facturado, Em atraso) over the stacked "Cobranças por canal" bar chart with highlighted October tooltip.

FORM: Agent booth / channel counters, position 5 of 7 on my grounded list; seed key 13dca31f (degraded roll, no challengers). Signature interaction: live payment arrival — a simulated M-Pesa/e-Mola payment lands at the top of the feed, ticks Recebido → A reconciliar → Reconciliado (or drops to Excepções), and the booth float and today counts update; reduced-motion renders final states. Motion grammar: 180–240ms ease-out state changes only.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- Brand assets (logo, colours) not supplied; wordmark is a placeholder.
- Other rails (banco, numerário) shown as assumptions pending confirmation.
