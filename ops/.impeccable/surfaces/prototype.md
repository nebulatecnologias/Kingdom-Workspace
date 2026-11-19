---
version: 1
slug: "prototype"
primary_target: "prototype"
related_targets: []
---

# Surface brief: ops/prototype (Kingdom Ops clickable prototype)

Scope: the whole app prototype (login, Início, Agenda, reunião nova/ficha, pipeline Kanban, atas lista/formulário/leitura, equipa, definições de etapas), one static HTML file built from src/. Visitor mode: Operate. Mobile first (390), desktop shell (1440). Code-led build: no image generation in this harness.

Audience and job: consultants and sales staff of a business-development and technology consultancy in Mozambique, on the phone between client meetings; the owner on a desktop watching the whole operation (meetings, sales, projects, campaigns, tasks). Primary task: see what is next today, book a meeting in under a minute, move a card along its pipeline, write the ata right after the meeting. Proof/content: synthetic but realistic Mozambican companies, people, subjects and minutes, labelled as sample data; field names identical to the production tables.

Constraints: grey/black/white only (Cal.com grey scale), Inter, 8 px status dots as the only colour, 44 px targets, WCAG AA, pt-PT, no custom-field builder; every class name, data field and screen function must map one-to-one to the Next.js app.

Unresolved: product name (Kingdom Ops, working), WhatsApp notice format (designed here as a proposal), production domain.

## Direction contract

THESIS: a pocket operations board, not a calendar. Início opens on what is next (one black "A seguir" card with the next meeting and its two actions), then the rest of today, then the state of the operation as a short list of counts per pipeline. It refuses the category default of a hero greeting over a month calendar, and the dashboard default of a row of same-size metric tiles.

OWN-WORLD (updated 19/11 after the owner pinned the "Good morning" Iconly screen as the main design-system reference): white ground on the phone and inside the desktop panel; soft grey cards (#f4f4f5) with no borders and no shadows, 20–24 px radii; inside a grey card, a white circular tile (44 px) carries the row's icon or avatar; hierarchy by surface tone (white on grey, grey on white), never by lines. Desktop keeps the Cal.com shell: grey canvas (#f3f4f6), flat sidebar with the active item as a white chip, content in a white rounded panel; Kanban columns are grey with white card items. Ink #111827, muted #6b7280, black primary buttons (14 px radius), grey ghost buttons. Circular day chips (selected = black circle, dots under days with meetings). Selected filter chips and radio cards are white with a 1.5 px ink ring, never black. Stage pills: white pill with an 8 px dot (grey / blue / amber / red / green) plus text, the only colour on the page. Inter at 15 px body, 600 titles with -0.02 em tracking. Phone: a floating grey pill tab bar (Início, Agenda, Pipeline, Atas; the active tab is a white chip with icon and label, the others icon only) with a separate black circular "+" button to its right. Icons lucide, 18 px, stroke 1.8. One black card ("A seguir") and one black button per screen at most.

STORY: "I open the app, I know what is next and where, I can send the notice on WhatsApp, and when the meeting ends I move the card and write the ata without looking for anything."

FIRST VIEWPORT (phone, 390, white ground): top row: caption "Quinta-feira, 19 de novembro" + title "Bom dia, Ana" left, 48 px avatar right. Then the black "A seguir" card: time and countdown ("10:30 · em 45 min"), subject, company · person, location line with pin icon, two actions (ghost "WhatsApp", white "Abrir"). Then section "Hoje" with the remaining meetings as grey cards: white circular tile with the owner's initials, title, "14:00–15:00 · company" line, stage pill at the right. Then "Operação" as grey rows (white icon tile, name, count line, chevron). Floating pill tab bar at the bottom with Início active as a white chip, black "+" to its right. Desktop (1440): sidebar (Início, Agenda, Atas, Equipa, Pipelines group, Definições), white panel with a two-column grid: left "A seguir" + "Hoje" + "Operação"; right one grey counts card with four label/value rows, bars by stage and by person (CSS bars), "Atas em falta".

FORM: "Painel de bolso" (pocket ops board), index 3 of my ordered structural list; dealt lead of seed 584f7ad2 (degraded roll: no challengers, no quality-bar boards). Alternates dealt: index 1 "Hoje primeiro" (greeting + week strip + day list as the home) and index 4 "Pipeline-first" (home opens on the stage columns). Signature interaction: the "Mover para" bottom sheet, a vertical stage stepper where choosing Adiada expands an inline new-date field and Cancelada an inline reason field; the stage pill on the card animates to the new state. Desktop drags cards between columns.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
