"""Quadros de aprovação (PNG) para mostrar ao cliente em cada etapa.

  python3 quadros.py marca.json paleta      opções de paleta (marca.json: opcoes_paleta)
  python3 quadros.py marca.json tipografia  opções de letra (marca.json: opcoes_tipografia)
  python3 quadros.py marca.json logotipo    logótipo principal: horizontal em claro, vertical em escuro, ícone
  python3 quadros.py marca.json simbolo     símbolo grande, em claro e escuro, e a 64/32/16 px

Gera <saida>/quadros/<tipo>.png. Mostrar sempre o quadro, nunca só descrever as opções.
"""
import sys, os, re, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comum import carregar, caminho, saida, slug, Simbolo, renderizar, contraste, texto_sobre, link_fontes

cfg = carregar(sys.argv[1]); tipo = sys.argv[2]
OUT = saida(cfg, 'quadros'); S_ = slug(cfg)
fam = cfg.get('fontes', {}).get('familia', 'Inter')
C = cfg.get('cores', {})
ESC = C.get('principal', {}).get('hex', '#1C1C28'); CLARO = C.get('fundo', {}).get('hex', '#FAFAF7')

def folha(titulo, sub, corpo, extra_css='', fontes=None):
    links = ''.join(f'<link href="{link_fontes(f)}" rel="stylesheet">' for f in (fontes or [fam]))
    return f'''<!DOCTYPE html><html lang="pt"><head><meta charset="UTF-8">{links}<style>
*{{margin:0;padding:0;box-sizing:border-box}} body{{font-family:'{fam}',sans-serif;background:#FAFAF7;color:#1B1B22;-webkit-font-smoothing:antialiased}}
#folha{{width:1500px;padding:60px 64px 64px}} h1{{font-size:44px;font-weight:500;letter-spacing:-.035em}} .sub{{color:#666;font-size:18px;margin-top:8px;max-width:1100px;line-height:1.5}}
{extra_css}</style></head><body><div id="folha"><h1>{titulo}</h1><p class="sub">{sub}</p>{corpo}</div></body></html>'''

def ler(rel):
    s = open(rel).read().strip(); return re.sub(r'width="\d+" height="\d+"', '', s, count=1)

if tipo == 'paleta':
    opc = cfg['opcoes_paleta']; cols = ''
    for i, o in enumerate(opc):
        sw = ''.join(f'<div class="sw" style="background:{c["hex"]};color:{texto_sobre(c["hex"])};flex:{c.get("peso", 1)}"><b>{c["nome"]}</b><span>{c["hex"]}</span><small>{c.get("papel", "")}</small></div>' for c in o['cores'])
        fundo = o['cores'][0]['hex']; marca = o['cores'][1]['hex']; acento = o['cores'][2]['hex'] if len(o['cores']) > 2 else marca
        amostra = (f'<div class="am" style="background:{fundo}"><small style="color:{acento}">{cfg["nome"]}</small><h3 style="color:{marca}">{o.get("frase", cfg.get("slogan", ["Título de exemplo"])[0])}</h3>'
                   f'<p style="color:{marca};opacity:.75">Texto corrido de exemplo com a cor da marca sobre o fundo.</p><a style="background:{acento};color:{texto_sobre(acento)}">Botão principal</a></div>')
        ct = ''.join(f'<li>{a["nome"]} sobre {b["nome"]}: <b>{int(contraste(a["hex"], b["hex"]) * 100) / 100:.2f}:1</b> {"✓" if contraste(a["hex"], b["hex"]) >= 4.5 else ("só texto grande" if contraste(a["hex"], b["hex"]) >= 3 else "✗")}</li>' for a, b in [(o['cores'][1], o['cores'][0]), (o['cores'][-1], o['cores'][0])] if a is not b)
        cols += f'<div class="op"><div class="cab"><span>{chr(65 + i)}</span><b>{o["nome"]}</b></div><p class="nota">{o.get("nota", "")}</p><div class="sws">{sw}</div>{amostra}<ul>{ct}</ul></div>'
    css = '''.ops{display:grid;grid-template-columns:repeat(%d,1fr);gap:18px;margin-top:36px} .op{background:#fff;border:1px solid #E6E3DC;border-radius:24px;padding:24px}
.cab{display:flex;gap:12px;align-items:baseline} .cab span{font-weight:700;color:#999} .cab b{font-size:22px;font-weight:500} .nota{font-size:14px;color:#666;margin:6px 0 16px;line-height:1.45;min-height:40px}
.sws{display:flex;height:150px;border-radius:16px;overflow:hidden} .sw{padding:12px;display:flex;flex-direction:column;font-size:12px} .sw b{font-weight:500;font-size:13px} .sw small{margin-top:auto;opacity:.8}
.am{margin-top:14px;border-radius:16px;padding:22px;border:1px solid #eee} .am small{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase} .am h3{font-size:26px;font-weight:500;letter-spacing:-.03em;margin-top:6px} .am p{font-size:14px;margin-top:6px}
.am a{display:inline-block;margin-top:14px;padding:10px 20px;border-radius:99px;font-weight:700;font-size:14px} ul{list-style:none;margin-top:12px;font-size:13px;color:#555;line-height:1.7}''' % len(opc)
    html = folha(f'{cfg["nome"]} · opções de paleta', 'Cada opção com as cores, uma amostra de uso e o contraste dos pares principais (4,5:1 ou mais para texto corrido).', f'<div class="ops">{cols}</div>', css)

elif tipo == 'tipografia':
    opc = cfg['opcoes_tipografia']; fams = sorted({f for o in opc for f in (o['titulos'], o['texto'])})
    cols = ''.join(f'''<div class="op"><div class="cab"><span>{chr(65 + i)}</span><b>{o["titulos"]}{" + " + o["texto"] if o["texto"] != o["titulos"] else ""}</b></div>
<p class="nota">{o.get("nota", "")}</p><div class="am" style="background:{ESC};color:#fff"><h3 style="font-family:'{o["titulos"]}'">{cfg["nome"]}</h3>
<h4 style="font-family:'{o["titulos"]}'">{(cfg.get("slogan") or ["Um título de secção"])[0]}</h4><p style="font-family:'{o["texto"]}'">Texto corrido de exemplo, para ver a leitura em parágrafos: a marca fala com clareza e com números.</p>
<p class="dig" style="font-family:'{o["titulos"]}'">0123456789 · {cfg.get("exemplo_preco", "1 250,00")}</p></div></div>''' for i, o in enumerate(opc))
    css = '''.ops{display:grid;grid-template-columns:repeat(%d,1fr);gap:18px;margin-top:36px} .op{background:#fff;border:1px solid #E6E3DC;border-radius:24px;padding:24px}
.cab{display:flex;gap:12px;align-items:baseline} .cab span{font-weight:700;color:#999} .cab b{font-size:20px;font-weight:500} .nota{font-size:14px;color:#666;margin:6px 0 16px;line-height:1.45;min-height:40px}
.am{border-radius:16px;padding:26px} .am h3{font-size:%dpx;font-weight:500;letter-spacing:-.035em;white-space:nowrap} .am h4{font-size:24px;font-weight:500;margin-top:14px;letter-spacing:-.02em} .am p{font-size:16px;line-height:1.55;margin-top:12px;opacity:.85} .dig{font-size:28px!important;opacity:1!important}''' % (len(opc), 46 if len(opc) <= 3 else 34)
    html = folha(f'{cfg["nome"]} · opções de letra', 'A mesma amostra em cada opção: nome, título, texto corrido e algarismos.', f'<div class="ops">{cols}</div>', css, fams)

elif tipo == 'logotipo':
    L = os.path.join(caminho(cfg, cfg.get('saida', 'marca')), 'logotipo')
    cores = list((cfg.get('cores_logo') or {'principal': ''}).keys())
    escuro = next((c for c in cores if c not in ('branco', 'preto')), cores[0])
    h = glob.glob(f'{L}/{S_}-horizontal-{escuro}.svg') or glob.glob(f'{L}/{S_}-horizontal-simples-{escuro}.svg')
    v = glob.glob(f'{L}/{S_}-vertical-branco.svg') or glob.glob(f'{L}/{S_}-vertical-simples-branco.svg')
    ic = sorted(glob.glob(f'{L}/{S_}-icone-*.svg'))
    if not h: raise SystemExit('correr logotipo.py primeiro')
    corpo = (f'<div class="g"><div class="cel" style="background:{CLARO}">{ler(h[0]).replace("<svg ", "<svg width=\"760\" ")}</div>'
             f'<div class="cel" style="background:{ESC}">{ler(v[0]).replace("<svg ", "<svg width=\"420\" ")}</div>'
             f'<div class="cel ic" style="background:#fff">' + ''.join(ler(i).replace('<svg ', '<svg width="150" ') for i in ic) + '</div></div>')
    css = '.g{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:36px} .cel{border-radius:26px;height:420px;display:grid;place-items:center;border:1px solid #E6E3DC} .cel:first-child{grid-column:1/-1} .ic{display:flex;gap:30px;justify-content:center;align-items:center}'
    html = folha(f'{cfg["nome"]} · logótipo', 'Versão horizontal sobre fundo claro, vertical sobre a cor principal e ícone.', corpo, css)

elif tipo == 'simbolo':
    SIM = Simbolo(caminho(cfg, cfg['simbolo']))
    corpo = (f'<div class="g"><div class="cel" style="background:{CLARO}">{SIM.svg(ESC, altura="300px")}</div><div class="cel" style="background:{ESC}">{SIM.svg("#fff", altura="300px")}</div>'
             f'<div class="cel pq">' + ''.join(SIM.svg(ESC, altura=f'{t}px') + f'<small>{t} px</small>' for t in (64, 32, 16)) + '</div></div>')
    css = '.g{display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;margin-top:36px} .cel{border-radius:26px;height:420px;display:grid;place-items:center;border:1px solid #E6E3DC} .pq{display:flex;gap:18px;justify-content:center;align-items:center;background:#fff} .pq small{font-size:13px;color:#777}'
    html = folha(f'{cfg["nome"]} · símbolo', 'O símbolo em grande, sobre claro e escuro, e em tamanho de ícone para confirmar a leitura.', corpo, css)
else:
    raise SystemExit('tipo: paleta | tipografia | logotipo | simbolo')

png = os.path.join(OUT, f'{tipo}.png')
renderizar(html, png_unico=png, largura_mm=397, altura_mm=300)
print('ok', png)
