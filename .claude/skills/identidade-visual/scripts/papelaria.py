"""Etapa 8 · Papelaria: papel timbrado A4 (PDF) e modelo de carta A4 em PowerPoint.

  python3 papelaria.py marca.json timbrado [--exemplo]   -> <saida>/papelaria/<slug>-papel-timbrado.pdf (+ PNG de pré-visualização)
  python3 papelaria.py marca.json carta                  -> <saida>/papelaria/<slug>-modelo-carta.pptx

O timbrado: página 1 com o logótipo horizontal e um traço curto na cor de acento; página 2
(continuação) só com o símbolo; rodapé com o nome, a morada e os contactos; o símbolo em tom
muito claro no canto inferior direito. A carta em PowerPoint usa os mesmos elementos, com
dois esquemas («Carta» e «Continuacao») e campos editáveis.
A carta precisa de pptxgenjs: `npm install pptxgenjs` numa pasta qualquer e passar NODE_PATH
(ou o script instala-o numa pasta temporária).
"""
import sys, os, re, json, subprocess, tempfile, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comum import carregar, caminho, saida, slug, Simbolo, renderizar, link_fontes, svg_para_png

cfg = carregar(sys.argv[1]); modo = sys.argv[2]; EX = '--exemplo' in sys.argv
S_ = slug(cfg); OUT = saida(cfg, 'papelaria'); LOGO = os.path.join(caminho(cfg, cfg.get('saida', 'marca')), 'logotipo')
SIM = Simbolo(caminho(cfg, cfg['simbolo']))
C = cfg['cores']; PRI = C['principal']['hex']; ACE = C.get('acento', {}).get('hex', PRI)
CIN = C.get('texto_secundario', {}).get('hex', '#6A6682'); LIN = C.get('linha', {}).get('hex', '#E8E4DC'); TIN = C.get('texto', {}).get('hex', '#1C1A30')
TOM = cfg.get('papelaria', {}).get('tom_simbolo', '#F4F2ED')
fam = cfg.get('fontes', {}).get('familia', 'Inter')
ct = cfg.get('contactos', {})
MORADA = ct.get('morada', [])
CONTACTOS = [' · '.join(ct.get('telefones', []))] + [x for x in (ct.get('email'), ct.get('site')) if x]
CONTACTOS = [x for x in CONTACTOS if x]
cor_logo = next((k for k in (cfg.get('cores_logo') or {}) if k not in ('branco', 'preto')), 'principal')
f_logo = next((f for f in (f'{LOGO}/{S_}-horizontal-{cor_logo}.svg', f'{LOGO}/{S_}-horizontal-simples-{cor_logo}.svg') if os.path.exists(f)), None)
if not f_logo: raise SystemExit('correr logotipo.py primeiro')

if modo == 'timbrado':
    logo = re.sub(r'width="\d+" height="\d+"', 'width="74mm"', open(f_logo).read().strip(), count=1)
    cn = cfg.get('papelaria', {}).get('canto', {})   # {tamanho_mm, direita_mm, baixo_mm}: símbolo grande no canto
    canto = SIM.svg(TOM, largura=f"{cn.get('tamanho_mm', 150)}mm", estilo=f"position:absolute;right:{cn.get('direita_mm', -48)}mm;bottom:{cn.get('baixo_mm', -40)}mm")
    sim_peq = SIM.svg(PRI, altura='9mm')
    rod = f'''<div class="rod"><span><b>{cfg["nome"]}</b><br>{"<br>".join(MORADA)}</span><span class="d">{"<br>".join(CONTACTOS)}</span></div>'''
    carta = cfg.get('papelaria', {}).get('exemplo_html') or '''<p class="data">Cidade, dia de mês de ano</p><p class="dest"><b>Nome do destinatário</b><br>Cargo · Empresa<br>Endereço</p>
<p class="ass"><b>Assunto:</b> Assunto da carta</p><p>Exmo. Senhor,</p><p>Texto da carta. Este exemplo mostra a mancha de texto, as margens e a hierarquia: data, destinatário, assunto, corpo e assinatura.</p>
<p>Com os melhores cumprimentos,</p><p class="assin"><b>Nome Apelido</b><br>Cargo</p>'''
    html = f'''<!DOCTYPE html><html><head><meta charset="UTF-8"><link href="{link_fontes(fam)}" rel="stylesheet"><style>
@page{{size:A4;margin:0}} *{{margin:0;padding:0;box-sizing:border-box}} html,body{{width:210mm}}
body{{font-family:'{fam}',sans-serif;color:{TIN};-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.pag{{width:210mm;height:297mm;position:relative;overflow:clip;contain:strict;background:#fff;page-break-after:always}} .pag:last-child{{page-break-after:auto}}
.topo{{position:absolute;left:20mm;top:18mm}} .traco{{position:absolute;left:20mm;top:42mm;width:14mm;height:1.1mm;background:{ACE};border-radius:.6mm}} .topo2{{position:absolute;left:20mm;top:16mm}}
.rod{{position:absolute;left:20mm;right:20mm;bottom:14mm;display:flex;justify-content:space-between;font-size:7.6pt;line-height:1.5;color:{CIN};border-top:.3mm solid {LIN};padding-top:3.4mm;white-space:nowrap}}
.rod b{{color:{PRI};font-weight:500}} .rod .d{{text-align:right}}
.corpo{{position:absolute;left:20mm;right:24mm;top:58mm;font-size:10.5pt;line-height:1.55}} .corpo p{{margin-bottom:4.2mm}} .corpo b{{font-weight:500}}
.data{{text-align:right;color:{CIN}}} .dest{{margin:6mm 0 8mm!important}} .ass{{margin-bottom:7mm!important}} .assin{{margin-top:12mm}}
</style></head><body>
<div class="pag">{canto}<div class="topo">{logo}</div><div class="traco"></div><div class="corpo">{carta if EX else ""}</div>{rod}</div>
<div class="pag">{canto}<div class="topo2">{sim_peq}</div>{rod}</div></body></html>'''
    pdf = os.path.join(OUT, f'{S_}-papel-timbrado{"-exemplo" if EX else ""}.pdf')
    renderizar(html, pdf=pdf, largura_mm=210, altura_mm=297, png_seletor='.pag', png_pasta=os.path.join(OUT, 'previa-timbrado' + ('-exemplo' if EX else '')))
    print('ok', pdf)

elif modo == 'carta':
    rec = saida(cfg, 'papelaria', 'recursos')
    f_canto = os.path.join(rec, 'simbolo-canto.svg')
    # recorte do símbolo visível no canto (102 × 110 mm de um símbolo de 150 mm)
    k = SIM.vh / 150
    open(f_canto, 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{SIM.vx} {SIM.vy} {102 * k:.2f} {110 * k:.2f}" width="1632" height="1760">'
                             + ''.join(f'<path fill="{TOM}" fill-rule="evenodd" d="{d}"/>' for d in SIM.ds) + '</svg>')
    f_sim = os.path.join(rec, 'simbolo.svg'); open(f_sim, 'w').write(SIM.svg(PRI, largura='480', altura=f'{480 / SIM.proporcao:.0f}'))
    svg_para_png([(f_canto, f_canto[:-4] + '.png', 1632), (f_sim, f_sim[:-4] + '.png', 480), (f_logo, os.path.join(rec, 'logo.png'), 2000)])
    from PIL import Image
    lw, lh = Image.open(os.path.join(rec, 'logo.png')).size
    dados = dict(nome=cfg['nome'], fam=fam, PRI=PRI[1:], ACE=ACE[1:], CIN=CIN[1:], LIN=LIN[1:], TIN=TIN[1:], morada=MORADA, contactos=CONTACTOS,
                 logo=os.path.join(rec, 'logo.png'), logo_ratio=lh / lw, simbolo=f_sim[:-4] + '.png', sim_ratio=1 / SIM.proporcao, canto=f_canto[:-4] + '.png',
                 saida=os.path.join(OUT, f'{S_}-modelo-carta.pptx'))
    js = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'carta.js')
    env = dict(os.environ)
    if 'NODE_PATH' not in env:
        tmp = tempfile.mkdtemp(); subprocess.run(['npm', 'install', '--silent', '--prefix', tmp, 'pptxgenjs@3.12.0'], check=True)
        env['NODE_PATH'] = os.path.join(tmp, 'node_modules')
    subprocess.run(['node', js, json.dumps(dados)], check=True, env=env)
    print('ok', dados['saida'])
else:
    raise SystemExit('modo: timbrado | carta')
