# Kingdom Ops — protótipo clicável

Um único ficheiro (`index.html`) com dados de exemplo. É a especificação visual e de dados do app.

- Abrir `index.html` no browser (ou `python3 -m http.server -d ops/prototype`).
- Editar `src/` (`styles.css`, `data.js`, `app.js`) e reconstruir: `node ops/prototype/build.mjs`.
- `build.mjs` escreve `index.html` (documento completo) e `dist/kingdom-ops.html` (só o corpo, para Claude Artifacts).
- Botão **Protótipo** (canto inferior direito): alternar Desktop / Telemóvel e saltar entre ecrãs.

## Como se reaproveita no app (Next.js)

| Protótipo | App |
|---|---|
| `:root` custom properties em `styles.css` | Tokens Tailwind com o mesmo nome (`bg-canvas`, `text-ink`, `border-line`, `rounded-lg`…) |
| Classes de componente (`.btn`, `.pill`, `.card`, `.row`, `.week-strip`, `.day-chip`, `.meeting-card`, `.kanban`, `.stage-col`, `.card-item`, `.sheet`, `.stepper`, `.tabbar`, `.sidebar`, `.bars`, `.minutes-doc`, `.repeat-row`) | Um componente React por classe, com o mesmo nome |
| `@container app (min-width: 1024px)` | Breakpoint `lg` |
| `DB.*` em `data.js` (nomes de colunas SQL) | `supabase/seed.sql` e tipos TypeScript |
| `screen*()` em `app.js` | Um `page.tsx` por função (`/`, `/agenda`, `/cards/[id]`, `/pipelines/[slug]`, `/atas`, …) |
| `T` (textos pt-PT) | `messages/pt.json` |
| Arrastar e largar nativo no Kanban | dnd-kit com o mesmo comportamento; a folha "Mover para" é igual nos dois |

Os dados são fictícios (empresas, pessoas e contactos inventados).
