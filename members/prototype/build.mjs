// Inlines src/ into one self-contained HTML file.
// index.html = full document for local use; dist/kingdom-members.html = body-only variant for Claude Artifacts.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const src = (f) => readFileSync(new URL('./src/' + f, import.meta.url), 'utf8');
const css = src('styles.css');
const js = ['art.js', 'i18n.js', 'app.js'].map(src).join('\n');
const head = `<title>Kingdom Members</title>
<meta name="description" content="Clickable prototype of the Kingdom Members area (sample data).">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&display=swap">
<style>${css}</style>`;
const body = `<div id="app"></div><div id="overlay"></div><div id="proto"></div><div class="toasts" id="toasts" aria-live="polite"></div>
<script>${js}</script>`;
writeFileSync(new URL('./index.html', import.meta.url), `<!doctype html>\n<html lang="en-ZA">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${head}\n</head>\n<body>\n${body}\n</body>\n</html>\n`);
mkdirSync(new URL('./dist/', import.meta.url), { recursive: true });
writeFileSync(new URL('./dist/kingdom-members.html', import.meta.url), `${head}\n${body}\n`);
console.log('built');
