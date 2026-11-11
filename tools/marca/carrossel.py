"""Carrossel de 10 slides (1080 × 1350) a apresentar a nova marca Kingdom Company:
construção do globo, significado, logótipo, paleta, cores e tipografia.
Reaproveita os desenhos de construção de tools/marca/brandbook.py, com as medidas reais do globo.
Uso: python3 tools/marca/carrossel.py <pasta de saída> --fontes <dir com gs400/500/700.ttf>
Depois: node tools/marca/carrossel.mjs <pasta de saída>   (gera os PNG e o PDF)"""
import sys, os, re
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
saida = os.path.abspath(sys.argv[1])
FONTES = os.path.abspath(sys.argv[sys.argv.index('--fontes') + 1])
os.makedirs(saida, exist_ok=True)

# funções de desenho do manual de marca (peças do globo, construção, nome em curvas)
fonte_bb = open(os.path.join(AQUI, 'brandbook.py'), encoding='utf-8').read()
ini, fim = fonte_bb.index('# ---------------- peças gráficas'), fonte_bb.index('# ---------------- páginas')
ns = {'np': np, 'os': os, 're': re, 'json': __import__('json'), 'math': __import__('math'), 'FONTES': FONTES, 'RAIZ': RAIZ}
exec(fonte_bb[fonte_bb.index('M = os.path.join'):fonte_bb.index('arg = lambda')], ns)
exec(fonte_bb[fonte_bb.index("IND, LAR"):ini], ns)
exec(fonte_bb[ini:fim], ns)
globals().update({k: v for k, v in ns.items() if not k.startswith('__')})

TOTAL = 10
GRAO = 'file://' + os.path.join(RAIZ, 'kingdom-company/assets/grao.png')
PADRAO = 'file://' + os.path.join(RAIZ, 'docs/marca/padroes/png/kingdom-padrao-estrela-ampla-tom-sobre-indigo.png')


def svg_livre(s):
    """tira largura e altura fixas (mm) para o SVG ocupar o contentor"""
    return re.sub(r'<svg([^>]*?) width="[^"]+" height="[^"]+"', r'<svg\1', s, count=1).replace('<svg ', '<svg preserveAspectRatio="xMidYMid meet" ', 1)


def construcao_completa():
    """grelha, anel, elipses, eixos e as curvas da estrela num só desenho, em fundo claro"""
    l = []
    for k in range(0, 481, 30):
        l.append(f'<line x1="{k}" y1="0" x2="{k}" y2="480" stroke="#DCD9F3" stroke-width=".6"/><line x1="0" y1="{k}" x2="480" y2="{k}" stroke="#DCD9F3" stroke-width=".6"/>')
    l.append(f'<line x1="0" y1="0" x2="480" y2="480" stroke="{LUZ}" stroke-width=".8" stroke-dasharray="4 4"/><line x1="480" y1="0" x2="0" y2="480" stroke="{LUZ}" stroke-width=".8" stroke-dasharray="4 4"/>')
    l.append(f'<path fill="{IND}" fill-opacity=".07" fill-rule="evenodd" d="{PECAS["globo"]}"/>')
    l.append(f'<circle cx="240" cy="240" r="{R}" fill="none" stroke="{IND}" stroke-width="1.5"/><circle cx="240" cy="240" r="{r:.2f}" fill="none" stroke="{IND}" stroke-width="1.5"/>')
    l.append(f'<ellipse cx="240" cy="240" rx="{AE:.2f}" ry="{BE:.2f}" fill="none" stroke="{LUZ}" stroke-width="1.2"/><ellipse cx="240" cy="240" rx="{AI:.2f}" ry="{BI:.2f}" fill="none" stroke="{LUZ}" stroke-width="1.2"/>')
    for s in (-1, 1):
        l.append(f'<line x1="{240 + s * E / 2:.2f}" y1="-16" x2="{240 + s * E / 2:.2f}" y2="496" stroke="{IND}" stroke-width=".9"/>')
        l.append(f'<line x1="-16" y1="{240 + s * Q / 2:.2f}" x2="496" y2="{240 + s * Q / 2:.2f}" stroke="{IND}" stroke-width=".9"/>')
    u, v = curva(Uc, Vc, Pc)
    for sx in (-1, 1):
        for sy in (-1, 1):
            cx, cy = sx * E / 2, sy * Q / 2
            ax = np.r_[u, -u[::-1], -u, u[::-1]]; ay = np.r_[v, v[::-1], -v, -v[::-1]]
            l.append(f'<polygon points="{pts(cx + ax, cy + ay)}" fill="none" stroke="{LUZ}" stroke-opacity=".55" stroke-width=".9" stroke-dasharray="3 3"/>')
            l.append(f'<polyline points="{pts(cx + sx * u, cy + sy * v)}" fill="none" stroke="{LAR}" stroke-width="2.6"/>')
            l.append(ponto(cx + sx * Uc, cy, LAR, 3.6) + ponto(cx, cy + sy * Vc, LAR, 3.6))
    for x, y in ((0, -R), (0, R), (-R, 0), (R, 0), (-AE, 0), (AE, 0), (-AI, 0), (AI, 0)):
        l.append(ponto(x, y, LAR, 3.6))
    return f'<svg viewBox="-24 -24 528 528" overflow="visible">{"".join(l)}</svg>'


def topo(n, sec, claro=False):
    return (f'<div class="topo{" claro" if claro else ""}"><span>{sec}</span>'
            f'<span class="np"><b>{n:02d}</b> / {TOTAL:02d}</span></div>')


def base(claro=False):
    return f'<div class="base{" claro" if claro else ""}"><span>Kingdom Company</span><span>www.kingdomcompany.co.za</span></div>'


def luz(feixes=2):
    f = ''.join(f'<i class="feixe f{k + 1}"></i>' for k in range(feixes))
    return f'<div class="luz">{f}</div><div class="grao"></div>'


slides = []
def slide(n, sec, cls, corpo, claro=False):
    slides.append(f'<section class="slide {cls}" id="s{n:02d}">{corpo}{topo(n, sec, claro)}{base(claro)}</section>')


def rotulos(itens):
    """linha de rótulos técnicos: nome pequeno e valor"""
    return '<div class="rotulos">' + ''.join(f'<div><small>{k}</small><b>{v}</b></div>' for k, v in itens) + '</div>'


def nome_sem_legendas():
    s = construcao_nome()
    s = re.sub(r'<text[^>]*>.*?</text>', '', s)
    def alca(m):   # tira as alças que ligam a um ponto errado e saem do desenho
        x = [float(v) for v in re.findall(r'-?\d+\.?\d*', m.group(1))]
        longe = max(((x[0] - x[2]) ** 2 + (x[1] - x[3]) ** 2) ** .5, ((x[2] - x[4]) ** 2 + (x[3] - x[5]) ** 2) ** .5)
        return '' if longe > 260 else m.group(0)
    s = re.sub(r'<path d="(M-?[\d.]+ -?[\d.]+ L-?[\d.]+ -?[\d.]+ L-?[\d.]+ -?[\d.]+)"[^>]*/><rect[^>]*/>', alca, s)
    x, y, w, h = map(float, re.search(r'viewBox="([^"]+)"', s).group(1).split())
    # pontos soltos fora da letra (vêm do mesmo erro das alças)
    s = re.sub(r'<circle cx="(-?[\d.]+)" cy="(-?[\d.]+)" r="13"[^>]*/>', lambda m: '' if float(m.group(1)) < -30 or float(m.group(2)) > 300 else m.group(0), s)
    s = s.replace(re.search(r'viewBox="[^"]+"', s).group(0), f'viewBox="{x} {y} {w - 1080:.0f} {h}"', 1)
    return svg_livre(s)


def construcao_logo(parte):
    """parte 'prop': G, G/4 e larguras iguais do nome e do descritor; parte 'prot': área de proteção x"""
    W, H, x = 671.44, 120, 43
    hz = open(os.path.join(M, 'logotipo/kingdom-company-horizontal-indigo.svg')).read()
    hz = hz[hz.index('<g'):hz.rindex('</svg>')]
    t = lambda X, Y, v, a='middle', fs=15: f'<text x="{X}" y="{Y}" text-anchor="{a}" font-size="{fs}" font-weight="700" fill="{LARF}" font-family="Google Sans">{v}</text>'
    caixas = ''.join(f'<rect x="{a}" y="{b}" width="{x}" height="{x}" fill="{LAR}" fill-opacity=".1" stroke="{LAR}" stroke-width="1.2"/>{t(a + x / 2, b + x / 2 + 6, "x", fs=18)}'
                     for a, b in ((-x, (H - x) / 2), (W, (H - x) / 2), (300, -x), (300, H)))
    g = f'stroke="{LAR}" stroke-width="1.3" fill="none"'
    linhas = (f'<rect x="{-x}" y="{-x}" width="{W + 2 * x}" height="{H + 2 * x}" fill="none" stroke="{LAR}" stroke-width="1.4" stroke-dasharray="6 5"/>'
              f'<rect x="0" y="0" width="{W}" height="{H}" fill="none" stroke="#C9C3D8" stroke-width="1"/>'
              f'<line x1="150" y1="18.6" x2="{W - 4}" y2="18.6" stroke="{LUZ}" stroke-width="1" stroke-dasharray="4 3"/><line x1="150" y1="61.6" x2="{W - 4}" y2="61.6" stroke="{LUZ}" stroke-width="1" stroke-dasharray="4 3"/>'
              f'<line x1="120" y1="-6" x2="120" y2="126" stroke="{LUZ}" stroke-width="1" stroke-dasharray="4 3"/><line x1="150" y1="-6" x2="150" y2="126" stroke="{LUZ}" stroke-width="1" stroke-dasharray="4 3"/>'
              f'<line x1="{W - 4}" y1="-6" x2="{W - 4}" y2="126" stroke="{LUZ}" stroke-width="1" stroke-dasharray="4 3"/>')
    cotas = (f'<g {g}><path d="M0 -70 V-80 M0 -75 H120 M120 -70 V-80"/><path d="M120 -70 V-80 M120 -75 H150 M150 -70 V-80"/>'
             f'<path d="M150 -60 V-50 M150 -55 H{W - 4} M{W - 4} -60 V-50"/><path d="M150 180 V170 M150 175 H{W - 4} M{W - 4} 180 V170"/>'
             f'<path d="M-70 0 H-80 M-75 0 V120 M-70 120 H-80"/></g>'
             + t(60, -86, 'G') + t(135, -86, 'G/4') + t((150 + W) / 2, -64, 'N') + t((150 + W) / 2, 196, 'N') + t(-90, 66, 'G', 'end', 18))
    guias = linhas.split('<rect x="0"')[1]
    guias = '<rect x="0"' + guias
    if parte == 'prop':
        return f'<svg viewBox="-104 -100 {W + 116} {H + 106 + 100}">{guias}{hz}{cotas}</svg>'
    prot = linhas.split('<rect x="0"')[0]
    return f'<svg viewBox="{-x - 4} {-x - 4} {W + 2 * x + 8} {H + 2 * x + 8}">{prot}<rect x="0" y="0" width="{W}" height="{H}" fill="none" stroke="#C9C3D8" stroke-width="1"/>{caixas}{hz}</svg>'


# 01 · capa: só a marca
slide(1, 'Nova marca', 'noite', f'''{luz(3)}<div class="capa-globo">{svg_livre(globo_grad("10mm", id_="g1"))}</div>
<div class="capa-logo">{svg_livre(logo('kingdom-company-vertical', '#FFFFFF', w='10mm'))}</div>''', True)

# 02 · do traço ao símbolo
PASSOS = [(['anel'], 'Círculo', f'R {n2(R, 0)} · r {n2(r)}'), (['anel', 'eixo', 'equador'], 'Eixos', f'{n2(E)} · {n2(Q)}'),
          (['anel', 'eixo', 'equador', 'meridianos'], 'Meridianos', f'{n2(AE)} × {n2(BE)}'), (['globo'], 'Estrela', f'p {n2(Pc, 2)}')]
passos = ''.join(f'<div class="passo"><div class="passo-a">{svg_livre(pecas_svg(p, "10mm", base=(LIN if i else None)))}</div>'
                 f'<small>{i + 1:02d}</small><b>{t}</b><span>{m}</span></div>' for i, (p, t, m) in enumerate(PASSOS))
slide(2, 'O símbolo', 'marfim', f'<div class="passos">{passos}</div>')

# 03 · construção geométrica
slide(3, 'Construção geométrica', 'branco', f'''<div class="cons">{construcao_completa()}</div>
{rotulos([('Grelha', '480 × 480'), ('Anel', f'R {n2(R, 0)} · r {n2(r)}'), ('Meridianos', f'{n2(AE)} × {n2(BE)}'), ('Estrela', f'p {n2(Pc, 2)}')])}''')

# 04 · significado
SIG = [(['anel'], 'O círculo', 'Reino'), (['estrela'], 'A estrela', 'Direção'), (['eixo', 'equador'], 'Os eixos', 'Estrutura'), (['meridianos'], 'Os meridianos', 'Método')]
sig = ''.join(f'<div class="sig"><div class="sig-a">{svg_livre(pecas_svg(p, "10mm"))}</div><small>{e}</small><b>{n}</b></div>' for p, e, n in SIG)
slide(4, 'O significado', 'marfim', f'<div class="sigs">{sig}</div>')

# 05 · construção do logótipo
slide(5, 'O logótipo', 'branco', f'''<div class="logo-c">{construcao_logo('prop')}</div><div class="logo-c prot">{construcao_logo('prot')}</div>
{rotulos([('G', 'Globo'), ('G/4', 'Espaço'), ('N', 'Nome = descritor'), ('x', 'Altura do «K»')])}''')

# 06 · construção do nome
slide(6, 'O nome', 'marfim', f'''<div class="nome">{nome_sem_legendas()}</div>
<div class="alturas"><span><i class="cheia"></i>716</span><span><i></i>510</span><span><i class="cheia"></i>0</span><span><i></i>−232</span></div>
<div class="logo-final">{svg_livre(logo('kingdom-company-horizontal', IND, w='10mm'))}</div>
{rotulos([('Letra', 'Google Sans'), ('Peso', '500'), ('Espaçamento', '−2,5%'), ('Altura-x', '71%')])}''')

# 07 · a paleta
PRINC = [('Índigo Kingdom', '#2B2850', '30%'), ('Marfim', '#FAF9F5', '60%'), ('Laranja', '#FF521A', '10%')]
APOIO = [('Tinta', '#1C1A30'), ('Laranja Fundo', '#D63E12'), ('Cinza Índigo', '#6A6682'), ('Linha', '#E8E4DC')]
def amostra(n, h, p):
    c, m_, y, k_ = cmyk(h)
    return (f'<div class="am{" esc" if lum(h) < .4 else ""}" style="background:{h}"><small>{p}</small><b>{n}</b>'
            f'<code>HEX {h}<br>RGB {" ".join(map(str, rgb(h)))}<br>CMYK {c} {m_} {y} {k_}</code></div>')
slide(7, 'A paleta', 'branco', f'''<div class="paleta">{''.join(amostra(*c) for c in PRINC)}</div>
<div class="apoio">{''.join(f'<div><i style="background:{h}"></i><b>{n}</b><code>{h}</code></div>' for n, h in APOIO)}</div>
<div class="prop"><i style="flex:60;background:#FAF9F5"></i><i style="flex:30;background:#2B2850"></i><i style="flex:10;background:#FF521A"></i></div>
<div class="prop-l"><span style="flex:60">60%</span><span style="flex:30">30%</span><span style="flex:10">10%</span></div>''')

# 08 · cores em uso: contraste e gradientes
PARES = [('#2B2850', '#FFFFFF'), ('#FAF9F5', '#1C1A30'), ('#FAF9F5', '#2B2850'), ('#FF521A', '#FFFFFF')]
GRADS = [('Noite', 'linear-gradient(160deg,#0E0C1F,#1C1A30 50%,#2B2850)', '#0E0C1F · #1C1A30 · #2B2850'),
         ('Aurora', 'linear-gradient(160deg,#2B2850,#6F67D6 60%,#B9B3F2)', '#2B2850 · #6F67D6 · #B9B3F2'),
         ('Brasa', 'linear-gradient(160deg,#0E0C1F,#2B2850 60%,#FF521A)', '#0E0C1F · #2B2850 · #FF521A')]
pares = ''.join(f'<div class="par" style="background:{f};color:{t}"><span>Aa</span><b>{n2(contraste(f, t))}:1</b></div>' for f, t in PARES)
slide(8, 'A cor em uso', 'marfim', f'''<div class="pares">{pares}</div>
<div class="grads">{''.join(f'<div><i style="background:{g}"><em class="grao"></em><span>{n}</span></i><code>{c}</code></div>' for n, g, c in GRADS)}</div>''')

# 09 · a tipografia
slide(9, 'A tipografia', 'branco', f'''<div class="tipo"><div class="aa">Aa</div><div class="pesos"><div><b style="font-weight:400">Regular</b><span>400</span></div><div><b style="font-weight:500">Medium</b><span>500</span></div><div><b style="font-weight:700">Bold</b><span>700</span></div></div></div>
<div class="alfa">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>áàâãçéêíóôõú 0123456789</div>
<div class="escala">{''.join(f'<div><span style="font-size:{px}px;font-weight:{w}">Kingdom</span><small>{w} · {px} px</small></div>' for w, px in ((500, 84), (500, 56), (500, 28), (400, 19)))}</div>''')

# 10 · fecho: só a marca, sobre o padrão
slide(10, 'Kingdom Company', 'noite fecho', f'''<div class="padrao"></div>{luz(2)}
<div class="fim">{svg_livre(logo('kingdom-company-horizontal', '#FFFFFF', w='10mm'))}</div>''', True)

FF = ''.join(f"@font-face{{font-family:'Google Sans';src:url('file://{FONTES}/gs{w}.ttf');font-weight:{w}}}" for w in (400, 500, 700))
CSS = FF + '''
*{margin:0;padding:0;box-sizing:border-box} html,body{background:#555}
:root{--ind:#2B2850;--lar:#FF521A;--larf:#D63E12;--mar:#FAF9F5;--tin:#1C1A30;--cin:#6A6682;--lin:#E8E4DC;--noite:#0E0C1F;--luz:#6F67D6;--lav:#B9B3F2}
body{font-family:'Google Sans',sans-serif;color:var(--tin);-webkit-font-smoothing:antialiased}
.slide{position:relative;width:1080px;height:1350px;overflow:hidden;margin:0 0 40px;padding:170px 88px 150px;display:flex;flex-direction:column;justify-content:center}
.marfim{background:var(--mar)} .branco{background:#fff}
.noite{background:radial-gradient(70% 55% at 88% 6%,rgba(185,179,242,.42) 0,transparent 60%),radial-gradient(60% 45% at 0% 100%,rgba(255,82,26,.22) 0,transparent 65%),linear-gradient(160deg,var(--noite) 0%,var(--tin) 34%,var(--ind) 70%,#3B3478 100%);color:#fff}
.grao{position:absolute;inset:0;background:url(@@GRAO@@) 0 0/220px;opacity:.08;mix-blend-mode:overlay;pointer-events:none}
.luz{position:absolute;inset:0;overflow:hidden} .feixe{position:absolute;width:300px;height:1900px;background:radial-gradient(closest-side,rgba(185,179,242,.30),rgba(185,179,242,.12) 55%,rgba(185,179,242,0));transform:rotate(30deg)}
.f1{left:430px;top:-300px} .f2{left:700px;top:-260px;width:180px;opacity:.8} .f3{left:120px;top:-420px;width:140px;opacity:.5}
.topo,.base{position:absolute;left:88px;right:88px;display:flex;justify-content:space-between;align-items:center;color:var(--cin);z-index:5}
.topo{top:72px;letter-spacing:.14em;text-transform:uppercase;font-size:18px;font-weight:500} .base{bottom:66px;font-size:20px}
.topo span:first-child{color:var(--larf);font-weight:700} .topo.claro span:first-child{color:var(--lav)}
.topo.claro,.base.claro{color:rgba(255,255,255,.7)} .np{letter-spacing:.06em} .np b{font-weight:500;color:var(--ind)} .claro .np b{color:#fff}
.rotulos{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:20px;margin-top:44px;border-top:1.5px solid var(--lin);padding-top:22px}
.rotulos small{display:block;font-size:18px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--larf)} .rotulos b{display:block;font-size:24px;font-weight:500;color:var(--ind);margin-top:6px;line-height:1.25}
.capa-globo{position:absolute;right:-300px;top:-80px;width:1000px;height:1000px;opacity:.55;z-index:1} .capa-globo svg{width:100%;height:100%;transform:rotate(-14deg)}
.capa-logo{position:absolute;left:88px;bottom:190px;width:420px;z-index:3} .capa-logo svg{width:100%;height:auto}
.passos{display:grid;grid-template-columns:repeat(2,330px);justify-content:center;gap:44px 110px}
.passo-a{width:100%;aspect-ratio:1} .passo-a svg{width:100%;height:100%}
.passo small{display:block;font-size:20px;font-weight:700;color:var(--larf);margin-top:22px} .passo b{display:block;font-size:34px;font-weight:500;letter-spacing:-.02em;color:var(--ind);margin-top:4px}
.passo span{display:block;font-size:22px;color:var(--cin);margin-top:4px}
.cons{width:860px;height:860px;margin:0 auto} .cons svg{width:100%;height:100%}
.sigs{display:grid;grid-template-columns:repeat(2,330px);justify-content:center;gap:44px 110px}
.sig-a{width:100%;aspect-ratio:1} .sig-a svg{width:100%;height:100%}
.sig small{display:block;font-size:19px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--larf);margin-top:22px} .sig b{display:block;font-size:44px;font-weight:500;letter-spacing:-.03em;color:var(--ind);margin-top:4px}
.logo-c{width:100%} .logo-c svg{width:100%;height:auto} .logo-c.prot{margin-top:90px}
.nome{width:100%;height:330px} .nome svg{width:100%;height:100%}
.alturas{display:flex;gap:30px;margin-top:16px;font-size:20px;color:var(--cin)} .alturas i{display:inline-block;width:28px;border-top:2px dashed var(--luz);vertical-align:middle;margin-right:8px} .alturas i.cheia{border-top-style:solid}
.logo-final{width:640px;margin:90px auto 30px} .logo-final svg{width:100%;height:auto}
.paleta{display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:16px;height:520px}
.am{border-radius:24px;padding:28px 26px;display:flex;flex-direction:column;color:var(--ind);box-shadow:inset 0 0 0 1.5px rgba(43,40,80,.1)} .am.esc{color:#fff;box-shadow:none}
.am small{font-size:52px;font-weight:500;letter-spacing:-.03em} .am b{font-size:28px;font-weight:500;margin-top:auto} .am code{font-family:inherit;font-size:18px;line-height:1.5;margin-top:12px;opacity:.85}
.apoio{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:22px}
.apoio i{display:block;height:120px;border-radius:18px;box-shadow:inset 0 0 0 1.5px rgba(43,40,80,.1)} .apoio b{display:block;font-size:22px;font-weight:500;color:var(--ind);margin-top:14px} .apoio code{display:block;font-family:inherit;font-size:18px;color:var(--cin)}
.prop{display:flex;height:26px;border-radius:99px;overflow:hidden;margin-top:50px;box-shadow:inset 0 0 0 1.5px rgba(43,40,80,.12)} .prop-l{display:flex;font-size:20px;font-weight:500;color:var(--ind);margin-top:12px}
.pares{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.par{height:250px;border-radius:24px;padding:28px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:inset 0 0 0 1.5px rgba(43,40,80,.1)}
.par span{font-size:110px;font-weight:500;letter-spacing:-.04em;line-height:1} .par b{font-size:24px;font-weight:500}
.grads{display:grid;gap:16px;margin-top:16px}
.grads i{position:relative;display:flex;align-items:flex-end;height:150px;border-radius:24px;overflow:hidden;padding:24px 28px;font-style:normal}
.grads i span{position:relative;font-size:30px;font-weight:500;color:#fff} .grads code{display:block;font-family:inherit;font-size:19px;color:var(--cin);margin-top:8px}
.tipo{display:grid;grid-template-columns:auto 1fr;gap:56px;align-items:center}
.aa{font-size:300px;font-weight:500;letter-spacing:-.05em;line-height:.9;color:var(--ind)}
.pesos{display:grid;gap:16px} .pesos div{display:flex;justify-content:space-between;align-items:baseline;border-top:1.5px solid var(--lin);padding-top:12px} .pesos b{font-size:40px;color:var(--ind)} .pesos span{font-size:22px;color:var(--larf);font-weight:700}
.alfa{font-size:30px;line-height:1.5;letter-spacing:.02em;color:var(--ind);margin-top:44px;padding:26px 30px;background:var(--mar);border-radius:20px}
.escala{margin-top:36px;display:grid;gap:8px} .escala div{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1.5px solid var(--lin);padding-bottom:8px}
.escala span{letter-spacing:-.03em;color:var(--ind);line-height:1.05} .escala small{font-size:19px;color:var(--cin)}
.padrao{position:absolute;inset:0;background:url(@@PADRAO@@) 0 0/420px;opacity:.55} .padrao::after{content:'';position:absolute;inset:0;background:linear-gradient(190deg,transparent 20%,rgba(14,12,31,.8) 90%)}
.fim{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:3} .fim svg{width:620px;height:auto}
'''.replace('@@GRAO@@', GRAO).replace('@@PADRAO@@', PADRAO)

html = f'<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><title>Carrossel · Nova marca Kingdom Company</title><style>{CSS}</style></head><body>{"".join(slides)}</body></html>'
open(os.path.join(saida, 'carrossel.html'), 'w', encoding='utf-8').write(html)
print(f'{len(slides)} slides em {saida}/carrossel.html')
