# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Prototype: static HTML/CSS/JS (single clickable file built from `ops/prototype/src/`, sample data shaped exactly like the production tables). Production: Next.js 16 (App Router) + Supabase (Postgres, Auth) + Tailwind v4 on Vercel, reusing the prototype's design tokens, class names and screen functions one-to-one. Plan: `docs/kingdom-ops/plano-desenvolvimento.md`.

## Users

- **Team members (consultants / sales / marketing):** staff of Kingdom, a business-development and technology consultancy in Mozambique (Portuguese speakers). They book client meetings, today by sending a WhatsApp message with date, time, place, the person, the company and the subject. They mostly use the phone between meetings: they need to see today's agenda in one glance, move a meeting along its pipeline, and write the minutes right after a meeting.
- **Administrator (the owner):** sets up the team and the pipelines, and watches the whole operation of the office on one dashboard. The operation is project tracking, the sales process, marketing campaigns, task tracking and the agendas.

## Product Purpose

Kingdom Ops is the office's single operational tool: a meeting scheduler where every meeting is a card on a Kanban pipeline (Agendado → Em curso → Adiada → Cancelada → Concluída), every meeting can carry one structured ata (minutes) created from a form, and the same pipeline engine runs sales, project, marketing-campaign and task boards from templates (like Pipefy). Success = a team member books a meeting from the phone in under a minute, the whole team sees it per person on the agenda, and a concluded meeting has its minutes written and shared the same day.

## Positioning

Not a generic CRM and not a calendar: a lightweight operations board built around how this office already works (WhatsApp-style meeting notices, a short Kanban, formal minutes), with the restraint of Cal.com's grey/black/white interface so the content is the only thing that stands out.

## Operating Context

- One office, one database; everyone sees every meeting and pipeline, the agenda filters by person (avatar chips).
- Phone first: bottom tab bar (Início · Agenda · Pipeline · Atas · Equipa), a black "+" button to book a meeting, a swipeable week strip with dots on days that have meetings, cards listed by period of the day.
- Desktop: Cal.com-style left sidebar with the content in a white rounded panel over a grey canvas; Kanban with drag and drop.
- Pipelines have ordered stages with simple rules (done, lost, requires a note, requires a new date). "Adiada" asks for a new date; "Cancelada" asks for a reason. Every stage change is logged and shown on the card.
- Minutes are always attached to exactly one meeting, pre-filled from it, with sections: participants, agenda topics with discussion, decisions, actions (what, who, due, status), next steps, next meeting, written by, approved by, draft/final.
- Sharing stays on WhatsApp: a button composes the meeting notice or the minutes summary as text.
- Time zone Africa/Maputo; language pt-PT only.

## Capabilities and Constraints

- Screens: login; Início (next meeting, today, operation counts per pipeline; on desktop also KPIs, bars by stage and by person, missing minutes); Agenda (week strip, day list, person filter); new/edit card per pipeline kind; card page (details, stage, history, Ata tab); pipeline Kanban (same component for Reuniões, Vendas, Projetos, Campanhas, Tarefas; stage picker sheet on the phone); Atas list, form and reading/print view; Equipa; pipeline stage settings and templates.
- Empty, loading and error states for Agenda, Pipeline and Atas.
- Build budget: 5 hours of development after the prototype, so no custom field builder, invites, notifications, attachments or calendar sync in v1.
- Decided on 19 Nov 2026: name Kingdom Ops, Google Sans, grey scale with status dots, pt-PT only, Vercel + Supabase. Undecided: production domain. The WhatsApp notice format is the one the prototype proposes (no existing format).

## Brand Commitments

- Name: **Kingdom Ops** (working name).
- Palette (owner's decision, 19 Nov 2026, "spotbank" reference): pale grey-green ground, white cards with a soft shadow, dark ink, and a single lime accent (#c9f243 with dark text) for the primary action, the "+" button, selection and the "A seguir" hero card. Status is shown by an 8 px dot (green / amber / red / blue) plus a label.
- Typeface: **Google Sans** across the whole app (the owner's decision, 19 Nov 2026; the same face as the other Kingdom products), tight tracking on titles.
- References pinned by the owner: Cal.com app shell; "Good morning" week-strip home; "Journey" day timeline; team app with avatar row and greeting; the Spotbank dashboard for card structure only (not its green).
- Voice: direct, warm, short labels in pt-PT ("Bom dia, Ana", "Nenhuma ata ainda").

## Evidence on Hand

- No real meetings, companies, people or minutes yet; all prototype data is synthetic and mirrors the production field names. The team has no written WhatsApp notice format; the prototype proposes one.

## Product Principles

1. Today's agenda in one glance, on the phone, in under two seconds.
2. A meeting moves with one gesture; the pipeline never asks for more than the stage rule needs.
3. Minutes are born from a meeting, never orphaned, and are shareable the moment they are final.
4. One pipeline engine for everything; templates, not new code, add a board.
5. One accent: lime marks the action and the selection; everything else is white, pale grey-green and dark ink, with status in dots.

## Accessibility & Inclusion

WCAG AA contrast on the grey scale; 44 px touch targets; the Kanban is fully usable without drag and drop (stage picker); status never relies on colour alone; works on slow mobile data.
