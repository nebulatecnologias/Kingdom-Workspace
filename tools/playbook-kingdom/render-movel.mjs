import { createRequire } from 'module';
const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');
const dir = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('file://' + dir + '/movel.html', { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.pdf({ path: dir + '/kingdom-company-playbook-de-vendas-telemovel.pdf', preferCSSPageSize: true, printBackground: true, outline: true, tagged: true });
await b.close();
