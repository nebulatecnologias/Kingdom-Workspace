"""Papel timbrado Kingdom Company em A4 (PDF): página 1 com o logótipo completo,
página 2 (continuação) só com o símbolo. Os dois com rodapé de contactos.
Uso: python3 tools/marca/timbrado.py <saida.pdf> [--exemplo]   (--exemplo preenche uma carta de amostra)"""
import sys, os, re, json, subprocess, tempfile
RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
L = os.path.join(RAIZ, 'docs/marca/logotipo/')
GLOBO = json.load(open(os.path.join(RAIZ, 'docs/marca/globo/pecas.json')))['globo']
saida = sys.argv[1]; exemplo = '--exemplo' in sys.argv
def svg(nome, largura_mm):
    s = open(L + nome).read().strip()
    return re.sub(r'width="\d+" height="\d+"', f'width="{largura_mm}mm"', s, count=1)
# contactos oficiais (R35); a morada da África do Sul só aparece no site
MORADA = 'Edifício Millenium Park, Av. Vladimir Lenine, n.º 174<br>Maputo 1106, Moçambique'
CONTACTOS = '+258 87 664 1836 &nbsp;·&nbsp; +258 85 1800 920<br>contact@kingdomcompany.co.za<br>www.kingdomcompany.co.za'
RODAPE = f'<div class="rodape"><span><b>Kingdom Company</b><br>{MORADA}</span><span class="dir">{CONTACTOS}</span></div>'
carta = '''<p class="data">Maputo, 9 de novembro de 2026</p>
<p class="dest"><b>Nome do destinatário</b><br>Cargo · Empresa<br>Endereço</p>
<p class="ass"><b>Assunto:</b> Proposta de acompanhamento estratégico</p>
<p>Exmo. Senhor,</p>
<p>Na sequência da nossa conversa, enviamos a proposta de acompanhamento para os próximos seis meses. O objetivo é dar à vossa equipa comercial uma estrutura clara de vendas, com metas, rotinas e indicadores que a direção consiga acompanhar todas as semanas.</p>
<p>A proposta inclui o diagnóstico inicial, o plano de ação e as sessões de acompanhamento. Os valores e o calendário seguem em anexo.</p>
<p>Ficamos à disposição para qualquer esclarecimento através do email contact@kingdomcompany.co.za ou do telefone +258 87 664 1836.</p>
<p>Com os melhores cumprimentos,</p>
<p class="assin"><b>Nome Apelido</b><br>Cargo · Kingdom Company</p>''' if exemplo else ''
html = f'''<!DOCTYPE html><html lang="pt"><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<style>@page{{size:A4;margin:0}} *{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Google Sans',sans-serif;color:#1C1A30;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.pag{{width:210mm;height:297mm;position:relative;overflow:hidden;background:#fff;page-break-after:always}}
.globo{{position:absolute;right:-48mm;bottom:-40mm;width:150mm;height:150mm}} .globo path{{fill:#F4F2ED}}
.topo{{position:absolute;left:20mm;top:18mm}} .linha{{position:absolute;left:20mm;top:42mm;width:14mm;height:1.1mm;background:#FF521A;border-radius:.6mm}}
.topo2{{position:absolute;left:20mm;top:16mm}}
.rodape{{position:absolute;left:20mm;right:20mm;bottom:14mm;display:flex;justify-content:space-between;align-items:flex-start;font-size:7.6pt;line-height:1.5;color:#6A6682;border-top:.3mm solid #E8E4DC;padding-top:3.4mm;white-space:nowrap}} .rodape .dir{{text-align:right}}
.rodape b{{color:#2B2850;font-weight:500}}
.corpo{{position:absolute;left:20mm;right:24mm;top:58mm;font-size:10.5pt;line-height:1.55}} .corpo p{{margin-bottom:4.2mm}}
.data{{text-align:right;color:#6A6682}} .dest{{margin:6mm 0 8mm!important}} .ass{{margin-bottom:7mm!important}} .assin{{margin-top:12mm}} .corpo b{{font-weight:500}}
</style></head><body>
<div class="pag"><svg class="globo" viewBox="0 0 480 480"><path fill-rule="evenodd" d="{GLOBO}"/></svg>
<div class="topo">{svg('kingdom-company-horizontal-indigo.svg', 74)}</div><div class="linha"></div>
<div class="corpo">{carta}</div>
{RODAPE}</div>
<div class="pag"><svg class="globo" viewBox="0 0 480 480"><path fill-rule="evenodd" d="{GLOBO}"/></svg>
<div class="topo2">{svg('kingdom-simbolo-indigo.svg', 9)}</div>
{RODAPE}</div>
</body></html>'''
tmp = tempfile.mkdtemp(); h = os.path.join(tmp, 'timbrado.html'); open(h, 'w').write(html)
js = f'''import {{ createRequire }} from "module"; const require = createRequire("/opt/node22/lib/node_modules/");
const {{ chromium }} = require("playwright"); const b = await chromium.launch(); const p = await b.newPage();
await p.goto("file://{h}", {{ waitUntil: "networkidle" }}); await p.evaluate(() => document.fonts.ready);
await p.pdf({{ path: "{os.path.abspath(saida)}", format: "A4", printBackground: true, preferCSSPageSize: true }});
await p.setViewportSize({{ width: 794, height: 1123 }}); await p.screenshot({{ path: "{os.path.abspath(saida)[:-4]}.png", clip: {{x:0,y:0,width:794,height:1123}} }}); await b.close();'''
open(os.path.join(tmp, 'r.mjs'), 'w').write(js); subprocess.run(['node', os.path.join(tmp, 'r.mjs')], check=True)
print('ok', saida)
