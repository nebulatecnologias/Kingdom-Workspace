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


def topo(n, claro=False):
    return (f'<div class="topo{" claro" if claro else ""}"><span>Kingdom Company · Nova marca</span>'
            f'<span class="np"><b>{n:02d}</b> / {TOTAL:02d}</span></div>')


def base(n, claro=False):
    seta = '' if n == TOTAL else '<span class="seta">Deslize <i>→</i></span>'
    return f'<div class="base{" claro" if claro else ""}"><span>www.kingdomcompany.co.za</span>{seta}</div>'


def luz(feixes=2):
    f = ''.join(f'<i class="feixe f{k + 1}"></i>' for k in range(feixes))
    return f'<div class="luz">{f}</div><div class="grao"></div>'


slides = []
def slide(n, cls, corpo, claro=False):
    slides.append(f'<section class="slide {cls}" id="s{n:02d}">{corpo}{topo(n, claro)}{base(n, claro)}</section>')


# 01 · capa
slide(1, 'noite', f'''{luz(3)}<div class="capa-globo">{svg_livre(globo_grad("10mm", id_="g1"))}</div>
<div class="capa-logo">{svg_livre(logo('kingdom-company-horizontal', '#FFFFFF', w='10mm'))}</div>
<div class="capa-txt"><span class="selo">Nova identidade</span>
<h1>Nova marca.<br>O mesmo propósito.</h1>
<p>A Kingdom InCompany passa a chamar-se <b>Kingdom Company</b>. Conheça o símbolo, as cores e a letra da nova identidade.</p></div>''', True)

# 02 · do traço ao símbolo
PASSOS = [(['anel'], 'Círculo', f'R {n2(R, 0)} · r {n2(r)}'), (['anel', 'eixo', 'equador'], 'Eixos', f'Eixo {n2(E)} · equador {n2(Q)}'),
          (['anel', 'eixo', 'equador', 'meridianos'], 'Meridianos', 'Duas elipses'), (['globo'], 'Estrela', 'Quatro superelipses')]
passos = ''.join(f'<div class="passo"><div class="passo-a">{svg_livre(pecas_svg(p, "10mm", base=(LIN if i else None)))}</div>'
                 f'<small>{i + 1:02d}</small><b>{t}</b><span>{m}</span></div>' for i, (p, t, m) in enumerate(PASSOS))
slide(2, 'marfim', f'''<div class="cab"><span class="eb">O símbolo</span><h2>Do traço ao símbolo</h2>
<p class="lead">O globo constrói-se em quatro passos, sempre com a mesma espessura de traço. A estrela nasce no fim, das curvas que unem os eixos.</p></div>
<div class="passos">{passos}</div>''')

# 03 · construção geométrica e estrela
slide(3, 'branco', f'''<div class="cab"><span class="eb">Construção geométrica</span><h2>Geometria, não acaso</h2>
<p class="lead">Numa grelha de 480 × 480: o anel é um círculo perfeito, os meridianos são elipses e cada canto da estrela é uma superelipse que toca os eixos sem quebras.</p></div>
<div class="cons">{construcao_completa()}</div>
<div class="medidas"><div><small>Anel</small><b>R {n2(R, 0)} · r {n2(r)}</b></div><div><small>Meridianos</small><b>{n2(AE)} × {n2(BE)}</b></div><div><small>Estrela</small><b>|u/U|<sup>p</sup> + |v/V|<sup>p</sup> = 1 · p {n2(Pc, 2)}</b></div></div>''')

# 04 · significado
SIG = [(['anel'], 'O círculo', 'Reino', 'A unidade. Tudo começa por juntar as partes do negócio num só lugar.'),
       (['estrela'], 'A estrela', 'Direção', 'O conhecimento. Mostra para onde ir e porquê.'),
       (['eixo', 'equador'], 'Os eixos', 'Estrutura', 'O vertical e o horizontal: a base onde o crescimento assenta.'),
       (['meridianos'], 'Os meridianos', 'Método', 'A metodologia, passo a passo, igual em todas as marcas.')]
sig = ''.join(f'<div class="sig"><div class="sig-a">{svg_livre(pecas_svg(p, "10mm"))}</div><div><small>{e}</small><b>{n}</b><span>{d}</span></div></div>' for p, e, n, d in SIG)
slide(4, 'marfim', f'''<div class="cab"><span class="eb">O significado</span><h2>Cada parte diz o que fazemos</h2></div>
<div class="sigs">{sig}</div>''')

# 05 · a frase
slide(5, 'aurora', f'''{luz(2)}<div class="frase-globo">{svg_livre(globo("#FFFFFF", "10mm"))}</div>
<div class="frase"><span class="eb claro">Reino · Direção · Estrutura · Método</span>
<p>É isto que a Kingdom faz, em todas as suas marcas: dá <b>direção</b>, <b>estrutura</b> e <b>método</b> para crescer com propósito.</p>
<small>O mesmo globo na Kingdom Company, no Kingdom Training e na Kingdom Academy.</small></div>''', True)

# 06 · construção do logótipo
def nome_sem_legendas():
    s = construcao_nome()
    s = re.sub(r'<text[^>]*>.*?</text>', '', s)
    def alca(m):   # tira as alças que ligam a um ponto errado e saem do desenho
        x = [float(v) for v in re.findall(r'-?\d+\.?\d*', m.group(1))]
        longe = max(((x[0] - x[2]) ** 2 + (x[1] - x[3]) ** 2) ** .5, ((x[2] - x[4]) ** 2 + (x[3] - x[5]) ** 2) ** .5)
        return '' if longe > 260 else m.group(0)
    s = re.sub(r'<path d="(M-?[\d.]+ -?[\d.]+ L-?[\d.]+ -?[\d.]+ L-?[\d.]+ -?[\d.]+)"[^>]*/><rect[^>]*/>', alca, s)
    vb = re.search(r'viewBox="([^"]+)"', s).group(1).split()
    x, y, w, h = map(float, vb)
    s = s.replace(re.search(r'viewBox="[^"]+"', s).group(0), f'viewBox="{x} {y} {w - 1080:.0f} {h}"', 1)
    return svg_livre(s)

slide(6, 'branco', f'''<div class="cab"><span class="eb">O logótipo</span><h2>Um nome, uma linha</h2>
<p class="lead">Google Sans Medium, espaçamento de −2,5% e o descritor com a largura exata do nome. O texto está em curvas: o logótipo fica igual em qualquer ecrã.</p></div>
<div class="nome">{nome_sem_legendas()}</div>
<div class="alturas"><span><i class="cheia"></i>Maiúsculas · 716</span><span><i></i>Altura-x · 510</span><span><i class="cheia"></i>Linha de base · 0</span><span><i></i>Descendente · −232</span></div>
<div class="logo-final">{svg_livre(logo('kingdom-company-horizontal', IND, w='10mm'))}</div>
<div class="regras-logo"><div><small>Peso</small><b>500</b></div><div><small>Espaçamento</small><b>−2,5%</b></div><div><small>Altura-x</small><b>71%</b></div><div><small>Cor</small><b>Uma só</b></div></div>''')

# 07 · a paleta
PRINC = [('Índigo Kingdom', '#2B2850', 'Logótipo, títulos e blocos escuros', '30%'), ('Marfim', '#FAF9F5', 'Fundo de páginas e documentos', '60%'), ('Laranja', '#FF521A', 'Botões, preços e destaques', '10%')]
APOIO = [('Tinta', '#1C1A30', 'Texto'), ('Laranja Fundo', '#D63E12', 'Texto laranja pequeno'), ('Cinza Índigo', '#6A6682', 'Texto secundário'), ('Linha', '#E8E4DC', 'Divisórias')]
def amostra(n, h, u, p):
    claro = lum(h) < .4
    rgb_ = ' '.join(map(str, rgb(h)))
    return f'<div class="am{" esc" if claro else ""}" style="background:{h}"><small>{p}</small><b>{n}</b><span>{u}</span><code>{h} · RGB {rgb_}</code></div>'
slide(7, 'branco', f'''<div class="cab"><span class="eb">A cor</span><h2>Uma paleta curta</h2>
<p class="lead">Três cores principais e quatro de apoio. O marfim domina, o índigo dá peso e o laranja aparece pouco, onde importa.</p></div>
<div class="paleta">{''.join(amostra(*c) for c in PRINC)}</div>
<div class="apoio">{''.join(f'<div><i style="background:{h}"></i><b>{n}</b><code>{h}</code><span>{u}</span></div>' for n, h, u in APOIO)}</div>
<div class="prop"><i style="flex:60;background:#FAF9F5"></i><i style="flex:30;background:#2B2850"></i><i style="flex:10;background:#FF521A"></i></div>
<div class="prop-l"><span style="flex:60">60% Marfim e branco</span><span style="flex:30">30% Índigo</span><span style="flex:10">10%</span></div>''')

# 08 · porque estas cores
PORQUE = [('#2B2850', 'Índigo', 'Confiança e profundidade.', 'É a cor de quem estrutura e dá peso às decisões. Sóbria, sem ser fria.'),
          ('#FAF9F5', 'Marfim', 'Proximidade.', 'Mais quente do que o branco, como papel de trabalho em cima da mesa do empresário.'),
          ('#FF521A', 'Laranja', 'Ação.', 'Aparece pouco e só onde importa: o próximo passo, o botão, o número que decide.')]
GRADS = [('Noite', 'linear-gradient(135deg,#0E0C1F,#1C1A30 45%,#2B2850)', 'Capas e vídeo'),
         ('Aurora', 'linear-gradient(135deg,#2B2850,#6F67D6 60%,#B9B3F2)', 'Frases e redes'),
         ('Brasa', 'linear-gradient(135deg,#0E0C1F,#2B2850 60%,#FF521A)', 'Campanhas')]
slide(8, 'marfim', f'''<div class="cab"><span class="eb">A cor</span><h2>Porque estas cores</h2></div>
<div class="porque">{''.join(f'<div><i style="background:{h}"></i><div><small>{n}</small><b>{t}</b><span>{d}</span></div></div>' for h, n, t, d in PORQUE)}</div>
<div class="grads-t">Gradientes: luz de fundo, sempre com grão fino</div>
<div class="grads">{''.join(f'<div><i style="background:{g}"><em class="grao"></em></i><b>{n}</b><span>{u}</span></div>' for n, g, u in GRADS)}</div>''')

# 09 · a tipografia
slide(9, 'branco', f'''<div class="cab"><span class="eb">A tipografia</span><h2>Uma só letra: Google Sans</h2></div>
<div class="tipo"><div class="aa">Aa</div><div class="pesos"><div><b style="font-weight:400">Regular 400</b><span>Texto corrido</span></div><div><b style="font-weight:500">Medium 500</b><span>Títulos, nome e números</span></div><div><b style="font-weight:700">Bold 700</b><span>Botões e etiquetas</span></div></div></div>
<div class="alfa">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>áàâãçéêíóôõú 0123456789</div>
<div class="razoes"><div><small>01</small><b>Aberta e legível</b><span>Altura-x de 71% das maiúsculas: lê-se bem mesmo em tamanhos pequenos.</span></div>
<div><small>02</small><b>Uma família para tudo</b><span>Logótipo, títulos, texto, botões e documentos.</span></div>
<div><small>03</small><b>A mesma em todo o grupo</b><span>Igual em todos os sites e materiais Kingdom.</span></div></div>''')

# 10 · fecho
slide(10, 'noite fecho', f'''<div class="padrao"></div>{luz(2)}
<div class="fim">{svg_livre(logo('kingdom-company-vertical', '#FFFFFF', w='10mm'))}
<p>Um único lugar. Tudo o que precisa para desenvolver o seu negócio.</p>
<span class="guarde">Guarde este post e partilhe com quem trabalha connosco.</span></div>''', True)

FF = ''.join(f"@font-face{{font-family:'Google Sans';src:url('file://{FONTES}/gs{w}.ttf');font-weight:{w}}}" for w in (400, 500, 700))
CSS = FF + '''
*{margin:0;padding:0;box-sizing:border-box} html,body{background:#555}
:root{--ind:#2B2850;--lar:#FF521A;--larf:#D63E12;--mar:#FAF9F5;--tin:#1C1A30;--cin:#6A6682;--lin:#E8E4DC;--noite:#0E0C1F;--luz:#6F67D6;--lav:#B9B3F2}
body{font-family:'Google Sans',sans-serif;color:var(--tin);-webkit-font-smoothing:antialiased}
.slide{position:relative;width:1080px;height:1350px;overflow:hidden;margin:0 0 40px;padding:190px 88px 150px}
.marfim{background:var(--mar)} .branco{background:#fff}
.noite{background:radial-gradient(70% 55% at 88% 6%,rgba(185,179,242,.42) 0,transparent 60%),radial-gradient(60% 45% at 0% 100%,rgba(255,82,26,.22) 0,transparent 65%),linear-gradient(160deg,var(--noite) 0%,var(--tin) 34%,var(--ind) 70%,#3B3478 100%);color:#fff}
.aurora{background:radial-gradient(80% 60% at 90% 0%,var(--lav) 0,transparent 60%),radial-gradient(70% 50% at 0% 105%,rgba(255,82,26,.30) 0,transparent 62%),linear-gradient(165deg,var(--ind) 0%,#4A43A0 58%,var(--luz) 100%);color:#fff}
.grao{position:absolute;inset:0;background:url(@@GRAO@@) 0 0/220px;opacity:.08;mix-blend-mode:overlay;pointer-events:none}
.luz{position:absolute;inset:0;overflow:hidden} .feixe{position:absolute;width:300px;height:1900px;background:radial-gradient(closest-side,rgba(185,179,242,.30),rgba(185,179,242,.12) 55%,rgba(185,179,242,0));transform:rotate(30deg)}
.f1{left:430px;top:-300px} .f2{left:700px;top:-260px;width:180px;opacity:.8} .f3{left:120px;top:-420px;width:140px;opacity:.5}
.topo,.base{position:absolute;left:88px;right:88px;display:flex;justify-content:space-between;align-items:center;font-size:22px;color:var(--cin);z-index:5}
.topo{top:72px;letter-spacing:.14em;text-transform:uppercase;font-size:18px;font-weight:500} .base{bottom:66px}
.topo.claro,.base.claro{color:rgba(255,255,255,.7)} .np{letter-spacing:.06em} .np b{font-weight:500;color:var(--ind)} .claro .np b{color:#fff}
.seta{font-weight:500;color:var(--ind)} .claro .seta{color:#fff} .seta i{font-style:normal;display:inline-block;margin-left:10px;color:var(--lar)}
.eb{display:block;font-size:20px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--larf);margin-bottom:22px} .eb.claro{color:var(--lav)}
h2{font-size:72px;font-weight:500;letter-spacing:-.04em;line-height:1.02;color:var(--ind);text-wrap:balance}
.lead{font-size:29px;line-height:1.45;color:var(--cin);margin-top:26px;text-wrap:pretty}
sup{font-size:.6em}
/* 01 */
.capa-globo{position:absolute;right:-380px;top:-60px;width:960px;height:960px;opacity:.5;z-index:1} .capa-globo svg{width:100%;height:100%;transform:rotate(-14deg)}
.capa-logo{position:absolute;left:88px;top:150px;width:420px;z-index:3} .capa-logo svg{width:100%;height:auto}
.capa-txt{position:absolute;left:88px;right:88px;bottom:190px;z-index:3}
.selo{display:inline-block;font-size:19px;letter-spacing:.14em;text-transform:uppercase;padding:12px 26px;border:1.5px solid rgba(255,255,255,.4);border-radius:99px;color:#E2E0F0}
.capa-txt h1{font-size:118px;font-weight:500;letter-spacing:-.05em;line-height:.96;margin:36px 0 34px}
.capa-txt p{font-size:31px;line-height:1.45;color:#D8D5E8;max-width:800px} .capa-txt b{font-weight:500;color:#fff}
/* 02 */
.passos{display:grid;grid-template-columns:1fr 1fr;gap:34px 64px;margin-top:46px}
.passo-a{width:206px;height:206px} .passo-a svg{width:100%;height:100%}
.passo small{display:block;font-size:20px;font-weight:700;color:var(--larf);margin-top:16px} .passo b{display:block;font-size:36px;font-weight:500;letter-spacing:-.02em;color:var(--ind);margin-top:4px}
.passo span{display:block;font-size:23px;color:var(--cin);margin-top:4px}
/* 03 */
.cons{width:600px;height:600px;margin:30px auto 0} .cons svg{width:100%;height:100%}
.medidas{display:grid;grid-template-columns:1fr 1fr 1.5fr;gap:24px;margin-top:26px;border-top:1.5px solid var(--lin);padding-top:22px}
.medidas small{display:block;font-size:18px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--larf)} .medidas b{display:block;font-size:23px;font-weight:500;color:var(--ind);margin-top:6px}
/* 04 */
.sigs{display:grid;gap:22px;margin-top:40px}
.sig{display:grid;grid-template-columns:150px 1fr;gap:36px;align-items:center;padding-bottom:22px;border-bottom:1.5px solid var(--lin)} .sig:last-child{border:0}
.sig-a{width:150px;height:150px} .sig-a svg{width:100%;height:100%}
.sig small{font-size:19px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--larf)} .sig b{display:block;font-size:42px;font-weight:500;letter-spacing:-.03em;color:var(--ind);margin:4px 0 8px}
.sig span{display:block;font-size:23px;line-height:1.45;color:var(--cin)}
/* 05 */
.frase-globo{position:absolute;left:88px;top:190px;width:150px;height:150px;opacity:.95;z-index:2} .frase-globo svg{width:100%;height:100%}
.frase{position:absolute;left:88px;right:88px;bottom:200px;z-index:3}
.frase p{font-size:70px;font-weight:500;letter-spacing:-.035em;line-height:1.1;text-wrap:balance} .frase p b{font-weight:500;color:#FFD9CB}
.frase small{display:block;font-size:26px;line-height:1.45;color:#E5E3F5;margin-top:38px;max-width:760px}
/* 06 */
.nome{width:100%;height:330px;margin-top:40px} .nome svg{width:100%;height:100%}
.alturas{display:flex;flex-wrap:wrap;gap:8px 26px;margin-top:18px;font-size:19px;color:var(--cin)} .alturas i{display:inline-block;width:26px;border-top:2px dashed var(--luz);vertical-align:middle;margin-right:8px} .alturas i.cheia{border-top-style:solid}
.logo-final{width:600px;margin:40px auto 0} .logo-final svg{width:100%;height:auto}
.regras-logo{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:44px;border-top:1.5px solid var(--lin);padding-top:22px}
.regras-logo small{display:block;font-size:18px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--larf)} .regras-logo b{display:block;font-size:30px;font-weight:500;color:var(--ind);margin-top:6px}
/* 07 */
.paleta{display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:16px;margin-top:50px;height:380px}
.am{position:relative;border-radius:24px;padding:26px 24px;display:flex;flex-direction:column;color:var(--ind);box-shadow:inset 0 0 0 1.5px rgba(43,40,80,.1)} .am.esc{color:#fff;box-shadow:none}
.am small{font-size:44px;font-weight:500;letter-spacing:-.03em} .am b{font-size:27px;font-weight:500;margin-top:auto} .am span{font-size:19px;line-height:1.35;opacity:.8;margin-top:6px} .am code{font-family:inherit;font-size:17px;margin-top:12px;opacity:.85}
.apoio{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:28px}
.apoio i{display:block;height:84px;border-radius:16px;box-shadow:inset 0 0 0 1.5px rgba(43,40,80,.1)} .apoio b{display:block;font-size:21px;font-weight:500;color:var(--ind);margin-top:12px} .apoio code{display:block;font-family:inherit;font-size:17px;color:var(--cin)} .apoio span{display:block;font-size:17px;color:var(--cin);margin-top:2px}
.prop{display:flex;height:22px;border-radius:99px;overflow:hidden;margin-top:40px;box-shadow:inset 0 0 0 1.5px rgba(43,40,80,.12)} .prop-l{display:flex;font-size:18px;color:var(--cin);margin-top:10px}
/* 08 */
.porque{display:grid;gap:26px;margin-top:50px}
.porque>div{display:grid;grid-template-columns:150px 1fr;gap:34px;align-items:center}
.porque i{width:150px;height:150px;border-radius:30px;box-shadow:inset 0 0 0 1.5px rgba(43,40,80,.12)}
.porque small{font-size:19px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--larf)} .porque b{display:block;font-size:40px;font-weight:500;letter-spacing:-.025em;color:var(--ind);margin:2px 0 6px} .porque span{display:block;font-size:24px;line-height:1.45;color:var(--cin)}
.grads-t{font-size:20px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--cin);margin-top:56px}
.grads{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:20px}
.grads i{position:relative;display:block;height:130px;border-radius:20px;overflow:hidden} .grads b{display:block;font-size:24px;font-weight:500;color:var(--ind);margin-top:12px} .grads span{display:block;font-size:19px;color:var(--cin)}
/* 09 */
.tipo{display:grid;grid-template-columns:auto 1fr;gap:50px;align-items:center;margin-top:40px}
.aa{font-size:300px;font-weight:500;letter-spacing:-.05em;line-height:.9;color:var(--ind)}
.pesos{display:grid;gap:16px} .pesos div{border-top:1.5px solid var(--lin);padding-top:12px} .pesos b{display:block;font-size:34px;color:var(--ind);letter-spacing:-.01em} .pesos span{font-size:20px;color:var(--cin)}
.alfa{font-size:30px;line-height:1.5;letter-spacing:.02em;color:var(--ind);margin-top:40px;padding:26px 30px;background:var(--mar);border-radius:20px}
.razoes{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;margin-top:40px}
.razoes small{font-size:19px;font-weight:700;color:var(--larf)} .razoes b{display:block;font-size:26px;font-weight:500;line-height:1.2;color:var(--ind);margin:6px 0 8px} .razoes span{display:block;font-size:20px;line-height:1.45;color:var(--cin)}
/* 10 */
.padrao{position:absolute;inset:0;background:url(@@PADRAO@@) 0 0/420px;opacity:.5} .padrao::after{content:'';position:absolute;inset:0;background:linear-gradient(190deg,transparent 20%,rgba(14,12,31,.85) 90%)}
.fim{position:absolute;left:88px;right:88px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;z-index:3}
.fim svg{width:330px;height:auto} .fim p{font-size:64px;font-weight:500;letter-spacing:-.035em;line-height:1.1;margin-top:70px;text-wrap:balance}
.guarde{display:block;font-size:27px;color:#D8D5E8;margin-top:44px;padding-top:28px;border-top:1.5px solid rgba(255,255,255,.2)}
'''.replace('@@GRAO@@', GRAO).replace('@@PADRAO@@', PADRAO)

html = f'<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><title>Carrossel · Nova marca Kingdom Company</title><style>{CSS}</style></head><body>{"".join(slides)}</body></html>'
open(os.path.join(saida, 'carrossel.html'), 'w', encoding='utf-8').write(html)
print(f'{len(slides)} slides em {saida}/carrossel.html')
