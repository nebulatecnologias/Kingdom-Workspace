// Inlines src/ into one self-contained HTML file.
// index.html = full document for local use; dist/kingdom-ops.html = body-only variant for Claude Artifacts
// (light theme only, in-memory routing, no print button: the artifact viewer blocks hash routes and window.print).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const src = (f) => readFileSync(new URL('./src/' + f, import.meta.url), 'utf8');
const css = src('styles.css');
const js = ['data.js', 'app.js'].map(src).join('\n');
const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&display=swap">`;
const description = 'Protótipo clicável do Kingdom Ops: agenda de reuniões, pipelines Kanban, atas e dashboard da operação (dados de exemplo).';
const body = `<div id="root"></div><div id="proto"></div>`;

writeFileSync(new URL('./index.html', import.meta.url), `<!doctype html>
<html lang="pt-PT" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Kingdom Ops</title>
<meta name="description" content="${description}">
${fonts}
<style>${css}</style>
</head>
<body>
${body}
<script>${js}</script>
</body>
</html>
`);

// Artifact variant: strip the dark token blocks so the page keeps the reviewed light look in any viewer theme.
const lightCss = css
  .replace(/@media \(prefers-color-scheme: dark\) \{[\s\S]*?\n\}\n/, '')
  .replace(/:root\[data-theme="dark"\] \{[\s\S]*?\n\}\n/, '')
  .replace(/:root\[data-theme="dark"\] \.btn-primary:hover \{[^}]*\}\n/, '');
mkdirSync(new URL('./dist/', import.meta.url), { recursive: true });
writeFileSync(new URL('./dist/kingdom-ops.html', import.meta.url), `<title>Kingdom Ops</title>
<meta name="claude:viewport-fit-sides" content="cover">
${fonts}
<style>${lightCss}</style>
${body}
<script>window.KOPS_EMBED = true;</script>
<script>${js}</script>
`);
console.log('built');
