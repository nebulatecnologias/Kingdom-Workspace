"""Manual de marca da Kingdom Company em PDF (A4 horizontal), versão 2.
Capas de secção em gradiente índigo com grão e luz diagonal; páginas de conteúdo em branco.
Mostra a construção do globo (círculos, elipses, eixos e superelipses da estrela) e do nome.
Uso: python3 tools/marca/brandbook.py <saida.pdf> --fontes <dir com gs500.ttf> [--png <pasta>]"""
import sys, os, re, json, math, subprocess, tempfile
import numpy as np

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
M = os.path.join(RAIZ, 'docs/marca')
PECAS = json.load(open(os.path.join(M, 'globo/pecas.json')))
MED = json.load(open(os.path.join(M, 'globo/medidas.json')))
arg = lambda k: os.path.abspath(sys.argv[sys.argv.index(k) + 1]) if k in sys.argv else None
saida, FONTES, pasta_png = os.path.abspath(sys.argv[1]), arg('--fontes'), arg('--png')
VERSAO = 'Versão 2.0 · Novembro de 2026'
SITE = 'www.kingdomcompany.co.za'

IND, LAR, LARF, MAR, TIN, CIN, LIN = '#2B2850', '#FF521A', '#D63E12', '#FAF9F5', '#1C1A30', '#6A6682', '#E8E4DC'
NOITE, LUZ, LAV = '#0E0C1F', '#6F67D6', '#B9B3F2'          # tons derivados do índigo, só para gradientes

def n2(v, c=1): return f'{v:.{c}f}'.replace('.', ',')

# ---------------- peças gráficas ----------------
def logo(nome, cor, w=None, h=None, estilo=''):
    s = open(os.path.join(M, 'logotipo', f'{nome}-indigo.svg')).read().strip()
    vb = re.search(r'viewBox="([^"]+)"', s).group(1); vw, vh = map(float, vb.split()[2:])
    g = s[s.index('<g'):s.rindex('</svg>')].replace(f'fill="{IND}"', f'fill="{cor}"', 1)
    if w and not h: h = f'{float(w[:-2]) * vh / vw:.2f}mm'
    if h and not w: w = f'{float(h[:-2]) * vw / vh:.2f}mm'
    return f'<svg viewBox="{vb}" width="{w}" height="{h}" style="{estilo}">{g}</svg>'

def globo(cor, tam, estilo='', op=1):
    return f'<svg viewBox="0 0 480 480" width="{tam}" height="{tam}" style="{estilo}"><path fill="{cor}" fill-opacity="{op}" fill-rule="evenodd" d="{PECAS["globo"]}"/></svg>'

def globo_grad(tam, estilo='', id_='gg'):
    """globo com gradiente branco → lavanda, para capas"""
    return (f'<svg viewBox="0 0 480 480" width="{tam}" height="{tam}" style="{estilo}"><defs><linearGradient id="{id_}" x1="0" y1="0" x2="1" y2="1">'
            f'<stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".55" stop-color="{LAV}" stop-opacity=".55"/><stop offset="1" stop-color="{LUZ}" stop-opacity=".12"/></linearGradient></defs>'
            f'<path fill="url(#{id_})" fill-rule="evenodd" d="{PECAS["globo"]}"/></svg>')

def pecas_svg(lista, tam, base=LIN, cor=IND):
    d = ''.join(f'<path fill="{cor}" fill-rule="evenodd" d="{PECAS[p]}"/>' for p in lista)
    fundo = f'<path fill="{base}" fill-rule="evenodd" d="{PECAS["globo"]}"/>' if base else ''
    return f'<svg viewBox="0 0 480 480" width="{tam}" height="{tam}">{fundo}{d}</svg>'

def icone(cor, tam):
    s = open(os.path.join(M, 'logotipo', f'kingdom-icone-{cor}.svg')).read().strip()
    return re.sub(r'width="\d+" height="\d+"', f'width="{tam}" height="{tam}"', s, count=1)

def favicon(tam):
    s = open(os.path.join(M, 'logotipo', 'favicon.svg')).read().strip()
    return re.sub(r'width="\d+" height="\d+"', f'width="{tam}" height="{tam}"', s, count=1)

# ---------------- cores ----------------
def rgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
def cmyk(h):
    r, g, b = (v / 255 for v in rgb(h)); k = 1 - max(r, g, b)
    return tuple(round(100 * v) for v in ((1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k), k)) if k < 1 else (0, 0, 0, 100)
def lum(h):
    def c(v):
        v /= 255; return v / 12.92 if v <= .03928 else ((v + .055) / 1.055) ** 2.4
    r, g, b = rgb(h); return .2126 * c(r) + .7152 * c(g) + .0722 * c(b)
def contraste(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True); return (la + .05) / (lb + .05)

# ---------------- construção do globo ----------------
R, r, E, Q = MED['R'], MED['r'], MED['eixo'], MED['equador']
AE, BE, AI, BI = MED['a_ext'], MED['b_ext'], MED['a_int'], MED['b_int']
Uc, Vc, Pc = MED['centro']; Um, Vm, Pm = MED['meridiano']
C0 = 240
def x_ext(y): return -AE * np.sqrt(np.clip(1 - (y / BE) ** 2, 0, 1))
def curva(U, V, p, m=160):
    t = np.linspace(0, np.pi / 2, m); return U * np.cos(t) ** (2 / p), V * np.sin(t) ** (2 / p)
def pts(xs, ys): return ' '.join(f'{x + C0:.2f},{y + C0:.2f}' for x, y in zip(xs, ys))
def ponto(x, y, cor=LAR, r_=3.4, fundo='#fff'):
    return f'<circle cx="{x + C0:.2f}" cy="{y + C0:.2f}" r="{r_}" fill="{fundo}" stroke="{cor}" stroke-width="1.4"/>'
def marca(x, y, n, cor=LAR):
    return f'<g><circle cx="{x + C0:.2f}" cy="{y + C0:.2f}" r="9" fill="{cor}"/><text x="{x + C0:.2f}" y="{y + C0 + 3.6:.2f}" text-anchor="middle" font-size="10" font-weight="700" fill="#fff" font-family="Google Sans">{n}</text></g>'

def construcao_geometria():
    l = []
    for k in range(0, 481, 30):           # grelha
        l.append(f'<line x1="{k}" y1="0" x2="{k}" y2="480" stroke="#CFCBEF" stroke-width=".5"/><line x1="0" y1="{k}" x2="480" y2="{k}" stroke="#CFCBEF" stroke-width=".5"/>')
    l.append(f'<line x1="0" y1="0" x2="480" y2="480" stroke="{LUZ}" stroke-width=".7" stroke-dasharray="4 4"/><line x1="480" y1="0" x2="0" y2="480" stroke="{LUZ}" stroke-width=".7" stroke-dasharray="4 4"/>')
    l.append(f'<path fill="{IND}" fill-opacity=".07" fill-rule="evenodd" d="{PECAS["globo"]}"/>')
    l.append(f'<path fill="{IND}" fill-opacity=".14" stroke="{IND}" stroke-width=".7" fill-rule="evenodd" d="{PECAS["estrela"]}"/>')
    l.append(f'<circle cx="240" cy="240" r="{R}" fill="none" stroke="{IND}" stroke-width="1.3"/><circle cx="240" cy="240" r="{r:.2f}" fill="none" stroke="{IND}" stroke-width="1.3"/>')
    l.append(f'<ellipse cx="240" cy="240" rx="{AE:.2f}" ry="{BE:.2f}" fill="none" stroke="{LUZ}" stroke-width="1.1"/><ellipse cx="240" cy="240" rx="{AI:.2f}" ry="{BI:.2f}" fill="none" stroke="{LUZ}" stroke-width="1.1"/>')
    for s in (-1, 1):
        l.append(f'<line x1="{240 + s * E / 2:.2f}" y1="-20" x2="{240 + s * E / 2:.2f}" y2="500" stroke="{IND}" stroke-width=".8"/>')
        l.append(f'<line x1="-20" y1="{240 + s * Q / 2:.2f}" x2="500" y2="{240 + s * Q / 2:.2f}" stroke="{IND}" stroke-width=".8"/>')
    for x, y in ((0, -R), (0, R), (-R, 0), (R, 0), (-AE, 0), (AE, 0), (-AI, 0), (AI, 0), (0, 0)):
        l.append(ponto(x, y))
    for x, y, n in ((-R * .7071, -R * .7071, 1), (-r * .5, r * .866, 2), (-AE * .62, -BE * .77, 3), (0, -R + 40, 4), (R - 34, 0, 5), (-(E / 2 + Uc * .38), -(Q / 2 + Vc * .38), 6)):
        l.append(marca(x, y, n))
    return f'<svg viewBox="-24 -24 528 528" width="150mm" height="150mm" overflow="visible">{"".join(l)}</svg>'

def construcao_estrela():
    l = [f'<path fill="#fff" fill-opacity=".05" fill-rule="evenodd" d="{PECAS["globo"]}"/>']
    l.append(f'<path fill="#fff" fill-opacity=".16" fill-rule="evenodd" d="{PECAS["estrela"]}"/><path fill="#fff" fill-opacity=".16" fill-rule="evenodd" d="{PECAS["meias"]}"/>')
    l.append(f'<ellipse cx="240" cy="240" rx="{AE:.2f}" ry="{BE:.2f}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".8"/><ellipse cx="240" cy="240" rx="{AI:.2f}" ry="{BI:.2f}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".8"/>')
    for s in (-1, 1):
        l.append(f'<line x1="{240 + s * E / 2:.2f}" y1="40" x2="{240 + s * E / 2:.2f}" y2="440" stroke="#fff" stroke-opacity=".35" stroke-width=".7"/>')
        l.append(f'<line x1="40" y1="{240 + s * Q / 2:.2f}" x2="440" y2="{240 + s * Q / 2:.2f}" stroke="#fff" stroke-opacity=".35" stroke-width=".7"/>')
    u, v = curva(Uc, Vc, Pc)
    for sx in (-1, 1):
        for sy in (-1, 1):
            cx, cy = sx * E / 2, sy * Q / 2
            # superelipse completa (tracejada) com centro no canto entre o eixo e o equador
            ax = np.r_[u, -u[::-1], -u, u[::-1]]; ay = np.r_[v, v[::-1], -v, -v[::-1]]
            l.append(f'<polygon points="{pts(cx + ax, cy + ay)}" fill="none" stroke="{LAV}" stroke-width=".9" stroke-dasharray="3 3"/>')
            l.append(f'<polyline points="{pts(cx + sx * u, cy + sy * v)}" fill="none" stroke="{LAR}" stroke-width="2"/>')
            l.append(ponto(cx + sx * Uc, cy, LAR, 3.2, IND) + ponto(cx, cy + sy * Vc, LAR, 3.2, IND) + f'<circle cx="{cx + C0:.2f}" cy="{cy + C0:.2f}" r="2.2" fill="#fff"/>')
    um, vm = curva(Um, Vm, Pm)
    for sx in (-1, 1):
        for sy in (-1, 1):
            yy = sy * (Q / 2 + vm); xx = sx * (-x_ext(Q / 2 + vm) + um)
            l.append(f'<polyline points="{pts(xx, yy)}" fill="none" stroke="{LAR}" stroke-width="2"/>')
            l.append(ponto(xx[0], yy[0], LAR, 3.2, IND) + ponto(xx[-1], yy[-1], LAR, 3.2, IND))
    return f'<svg viewBox="40 115 400 250" width="186mm" height="116mm">{"".join(l)}</svg>'

# ---------------- construção do nome (curvas da letra) ----------------
def construcao_nome():
    import uharfbuzz as hb
    from fontTools.ttLib import TTFont
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.transformPen import TransformPen
    from fontTools.pens.boundsPen import BoundsPen
    f = os.path.join(FONTES, 'gs500.ttf'); tt = TTFont(f)
    from fontTools.ttLib.removeOverlaps import removeOverlaps
    removeOverlaps(tt)                                       # o K tem contornos sobrepostos na fonte
    gs = tt.getGlyphSet(); ordem = tt.getGlyphOrder()
    font = hb.Font(hb.Face(hb.Blob.from_file_path(f)))
    buf = hb.Buffer(); buf.add_str('Kingdom'); buf.guess_segment_properties(); hb.shape(font, buf, {'kern': True, 'liga': False})
    x = 0; partes = []; pontos = []; alcas = []; inicios = []
    for i, (inf, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
        pen = SVGPathPen(gs); gs[ordem[inf.codepoint]].draw(TransformPen(pen, (1, 0, 0, -1, x + pos.x_offset, 0)))
        d = pen.getCommands(); partes.append(d); inicios.append(x)
        if i in (0, 3, 5):                                     # K, g e o: pontos e alças das curvas
            ant = None
            for seg in re.findall(r'[MLQTCZ][^MLQTCZ]*', d):
                nums = [float(n) for n in re.findall(r'-?\d+\.?\d*', seg[1:])]
                pares = list(zip(nums[0::2], nums[1::2]))
                if not pares: continue
                if seg[0] in 'QC' and ant:
                    for c in pares[:-1]: alcas.append((ant, c, pares[-1]))
                ant = pares[-1]; pontos.append(ant)
        x += pos.x_advance - 25 * (i < len(buf.glyph_infos) - 1)   # tracking −0,025 em
    def topo(ch):
        b = BoundsPen(gs); gs[ch].draw(b); return b.bounds
    asc = topo('d')[3]; desc = topo('g')[1]
    W = x; lin = []
    for y, nome in ((-716, 'Maiúsculas e ascendentes · 716' if round(asc) == 716 else 'Altura das maiúsculas · 716'), (-510, 'Altura-x · 510'), (0, 'Linha de base · 0'), (-desc, f'Descendente · {desc:.0f}')):
        lin.append(f'<line x1="-120" y1="{y}" x2="{W + 100}" y2="{y}" stroke="{LUZ}" stroke-width="5" stroke-dasharray="{"" if y in (0, -716) else "16 12"}"/>'
                   f'<text x="{W + 150}" y="{y + 20}" font-size="58" fill="{CIN}" font-family="Google Sans">{nome}</text>')
    for gx in inicios[1:] + [W]:
        lin.append(f'<line x1="{gx:.0f}" y1="{-asc - 120}" x2="{gx:.0f}" y2="{-desc + 120}" stroke="#D9D6F2" stroke-width="3"/>')
    for (ax, ay), (cx, cy), (bx, by) in alcas:
        lin.append(f'<path d="M{ax:.0f} {ay:.0f} L{cx:.0f} {cy:.0f} L{bx:.0f} {by:.0f}" fill="none" stroke="{LUZ}" stroke-width="3"/><rect x="{cx - 9:.0f}" y="{cy - 9:.0f}" width="18" height="18" fill="{LUZ}"/>')
    dots = ''.join(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="13" fill="#fff" stroke="{LAR}" stroke-width="5"/>' for px, py in pontos)
    corpo = ''.join(f'<path d="{d}" fill="{IND}" fill-opacity=".07" stroke="{IND}" stroke-width="7"/>' for d in partes)
    return f'<svg viewBox="-140 {-asc - 160} {W + 1300} {asc - desc + 320}" width="257mm">{corpo}{"".join(lin)}{dots}</svg>'

# ---------------- páginas ----------------
paginas = []      # (html, classe, secção)
def pag(html, cls='branca', sec=''): paginas.append([html, cls, sec])

def efeitos(grelha=True, feixes=2):
    f = ''.join(f'<i class="feixe f{k}"></i>' for k in range(1, feixes + 1))
    g = '<i class="gl gv1"></i><i class="gl gv2"></i><i class="gl gh1"></i><i class="gl gh2"></i>' if grelha else ''
    return f'<div class="luz">{f}</div>{g}<div class="grao"></div>'

def cab(sec, titulo, lead=''):
    return f'<div class="eb">{sec}</div><h2>{titulo}</h2>' + (f'<p class="lead">{lead}</p>' if lead else '')

def capa_seccao(n, titulo, itens, extra='', cls='grad'):
    li = ''.join(f'<li>{t}</li>' for t in itens)
    pag(f'''{efeitos()}{extra}<div class="cs"><div class="cs-num">{n:02d}</div>
<div class="cs-txt"><small>Capítulo {n:02d}</small><h1>{titulo}</h1><ul>{li}</ul></div></div>
<div class="canto">Kingdom Company · Manual de marca</div><div class="canto d">{SITE}</div>''', cls, titulo)

# 1 · capa
pag(f'''{efeitos(feixes=3)}<div class="capa-g">{globo_grad('225mm', id_='gcapa')}</div>
<div class="capa-logo">{logo('kingdom-company-horizontal', '#FFFFFF', w='112mm')}</div>
<div class="capa-t"><h1>Manual<br>de marca</h1><p>Logótipo e identidade · {VERSAO}</p></div>
<div class="canto d">{SITE}</div>''', 'grad')

# 2 · manifesto
ATR = ['Clareza', 'Estrutura', 'Método', 'Proximidade', 'Ambição']
pag(f'''{efeitos(grelha=False, feixes=1)}<div class="mani"><small>Kingdom Company</small>
<h1>Logótipo e<br>identidade de marca</h1>
<p>A Kingdom Company junta desenvolvimento empresarial, educação e tecnologia num só lugar. A identidade nasce dessa ideia: um globo construído com geometria simples, uma só letra e uma paleta curta. Queremos o rigor de uma empresa de tecnologia, com a proximidade de quem trabalha ao lado do empresário.</p>
<div class="pilulas">{''.join(f'<span>{a}</span>' for a in ATR)}</div></div>
<div class="canto">Maputo, Moçambique</div><div class="canto d">{SITE}</div>''', 'escura')

# 3 · índice (preenchido no fim)
pag('@@INDICE@@', 'branca', 'Índice')

# ---- 01 a marca
capa_seccao(1, 'A marca', ['Quem somos', 'Personalidade', 'O que fazemos'], '<div class="cs-tres">' + globo('#FFFFFF', '34mm', op=.10) * 3 + '</div>')
arq = f'''<svg viewBox="-20 0 440 250" width="132mm">
<path d="M200 70 V118 M55 118 H345 M55 118 V150 M200 118 V150 M345 118 V150" fill="none" stroke="{LIN}" stroke-width="1.4"/>
<g transform="translate(176 10)"><path fill="{IND}" fill-rule="evenodd" transform="scale(.1)" d="{PECAS['globo']}"/></g>
<circle cx="55" cy="150" r="5" fill="{LAR}"/><circle cx="200" cy="150" r="4" fill="{IND}"/><circle cx="345" cy="150" r="4" fill="{IND}"/>
<text font-family="Google Sans" fill="{IND}"><tspan x="55" y="182" text-anchor="middle" font-size="13" font-weight="500">Kingdom Company</tspan><tspan x="200" y="182" text-anchor="middle" font-size="13" font-weight="500">Kingdom Training</tspan><tspan x="345" y="182" text-anchor="middle" font-size="13" font-weight="500">Kingdom Academy</tspan></text>
<text font-family="Google Sans" fill="{CIN}" font-size="9.5"><tspan x="55" y="200" text-anchor="middle">Desenvolvimento empresarial,</tspan><tspan x="55" y="213" text-anchor="middle">educação e tecnologia</tspan><tspan x="200" y="200" text-anchor="middle">O braço educacional</tspan><tspan x="345" y="200" text-anchor="middle">Plataforma de</tspan><tspan x="345" y="213" text-anchor="middle">educação online</tspan></text></svg>'''
pag(f'''<div class="cols"><div>{cab('01 · A marca', 'Um único lugar.', 'Tudo o que precisa para desenvolver o seu negócio.')}
<p class="txt">A Kingdom Company é uma empresa de <b>desenvolvimento empresarial, educação e tecnologia</b>. Trabalhamos com empresas que querem crescer com estratégia, crescimento e gestão: dos documentos que as apresentam à tecnologia que lhes tira trabalho manual, passando pela estratégia, pelo marketing e pelas equipas.</p>
<p class="txt">Temos sede em Maputo, Moçambique.</p></div>
<div class="centro"><div class="eb">Arquitetura da marca</div>{arq}<p class="nota">As três marcas usam o mesmo globo e a mesma letra. O que muda é o nome do braço, numa só linha ao lado do «Kingdom».</p></div></div>''', 'branca', 'A marca')

SOMOS = [('Clareza', 'Dizemos o que fazemos e o que o cliente ganha, sem jargão.'), ('Estrutura', 'Tudo assenta num plano com metas, prazos e responsáveis.'),
         ('Método', 'O mesmo caminho em cada projeto: diagnóstico, estratégia, implementação, autonomia.'), ('Proximidade', 'Trabalhamos ao lado da equipa, não a partir de longe.'),
         ('Ambição', 'Crescer com propósito, em Moçambique e na região.')]
NAO = ['Consultora genérica de banco de imagens: apertos de mão, edifícios espelhados, sorrisos posados.', 'Gráficos dourados, setas a subir e promessas de enriquecimento rápido.',
       'Linguagem de guru, maiúsculas e pontos de exclamação.', 'Cores novas para cada serviço ou campanha.']
pag(f'''{cab('01 · A marca', 'Personalidade', 'Cinco atributos guiam cada decisão de design e de texto. Do outro lado, aquilo que a marca não quer parecer.')}
<div class="atr">{''.join(f'<div><b>{n}</b><span>{d}</span></div>' for n, d in SOMOS)}</div>
<div class="anti"><div class="eb">Anti-referência: o que não queremos parecer</div><ul>{''.join(f'<li>{t}</li>' for t in NAO)}</ul></div>''', 'branca', 'A marca')

AREAS = [('Consultoria Estratégica', 'Decisões com base em dados, não em palpites', 'Diagnóstico empresarial, planeamento estratégico, business plans e Business Advising.'),
         ('Desenvolvimento Editorial', 'Documentos que apresentam a sua empresa ao nível do que ela já entrega', 'Perfis corporativos, propostas comerciais e de concursos, identidades visuais e playbooks.'),
         ('Marketing & Vendas', 'Um motor comercial que trabalha todos os meses', 'Posicionamento, canais e processo de vendas: Expert Led Growth, Brand 121 e MediaTrack.'),
         ('Desenvolvimento Tecnológico', 'Tecnologia ao serviço da operação', 'Sites e landing pages, sistemas e automação de processos, inteligência artificial e painéis de gestão.'),
         ('Assessoria Corporativa', 'Equipas preparadas para vender e gerir', 'Treinamento de vendas e atendimento, formação em gestão comercial e marketing.')]
METODO = [('Diagnóstico', 'O que trava o crescimento, dito com clareza e com números.'), ('Estratégia', 'Prioridades, metas, prazos e responsáveis num plano executável.'),
          ('Implementação', 'Fazemos com a equipa, não por ela.'), ('Autonomia', 'O resultado fica na empresa muito depois de entregarmos o trabalho.')]
pag(f'''{cab('01 · A marca', 'O que fazemos')}
<div class="areas">{''.join(f'<div><small>{n}</small><b>{h}</b><span>{d}</span></div>' for n, h, d in AREAS)}</div>
<div class="eb e-met">Como trabalhamos: do diagnóstico à autonomia</div>
<div class="metodo">{''.join(f'<div><i></i><b>{n}</b><span>{d}</span></div>' for n, d in METODO)}</div>''', 'branca', 'A marca')

# ---- 02 o símbolo
capa_seccao(2, 'O símbolo', ['Significado', 'Do traço ao símbolo', 'Construção geométrica', 'A estrela'],
            f'<div class="cs-arte">{globo_grad("190mm", id_="gc2")}</div>')
SIG = [(['anel'], 'O círculo', 'Reino', 'A unidade. Tudo começa por juntar as partes do negócio num só lugar.'),
       (['estrela'], 'A estrela', 'Direção', 'O conhecimento. Mostra para onde ir e porquê.'),
       (['eixo', 'equador'], 'Os eixos', 'Estrutura', 'O vertical e o horizontal: a base onde o crescimento assenta.'),
       (['meridianos'], 'Os meridianos', 'Método', 'A metodologia, feita passo a passo, igual em todas as marcas.')]
pag(f'''{cab('02 · O símbolo', 'O globo', 'O mesmo símbolo nas três marcas Kingdom, com um só significado. Cada parte diz uma coisa sobre a forma como trabalhamos.')}
<div class="sigs">{''.join(f'<div>{pecas_svg(p, "50mm")}<small>{e}</small><b>{n}</b><span>{d}</span></div>' for p, e, n, d in SIG)}</div>''', 'branca', 'O símbolo')

PASSOS = [(['anel'], 'Círculo', f'R {n2(R, 0)} · r {n2(r)} · traço {n2(R - r)}'), (['anel', 'eixo', 'equador'], 'Eixos', f'Eixo {n2(E)} · equador {n2(Q)}'),
          (['anel', 'eixo', 'equador', 'meridianos'], 'Meridianos', f'Elipses {n2(AE)} × {n2(BE)} e {n2(AI)} × {n2(BI)}'), (['globo'], 'Estrela', f'Superelipses p {n2(Pc, 2)} e {n2(Pm, 2)}')]
pz = ''.join(f'<div><div class="pz-a">{pecas_svg(p, "52mm", base=(LIN if i else None))}</div><small>{i + 1:02d}</small><b>{t}</b><span>{m}</span></div>' + ('<i>+</i>' if i < 3 else '') for i, (p, t, m) in enumerate(PASSOS))
pag(f'''{cab('02 · O símbolo', 'Do traço ao símbolo', 'O globo constrói-se em quatro passos, cada um com a mesma espessura de traço. A estrela nasce no fim, das curvas que unem os eixos.')}
<div class="pz">{pz}</div>''', 'clara', 'O símbolo')

LEG = [('Anel', f'Dois círculos concêntricos: R {n2(R, 0)} e r {n2(r)}. Espessura {n2(R - r)}.'), ('Círculo interior', 'Contém todo o desenho de dentro.'),
       ('Meridianos', f'Duas elipses: exterior {n2(AE)} × {n2(BE)}; interior {n2(AI)} × {n2(BI)}.'), ('Eixo vertical', f'Faixa de {n2(E)} de largura, centrada.'),
       ('Equador', f'Faixa de {n2(Q)} de altura, centrada.'), ('Estrela', 'Quatro curvas superelípticas tangentes aos eixos (página seguinte).')]
pag(f'''<div class="cons"><div>{cab('02 · O símbolo', 'Construção geométrica', 'Medidas numa grelha de 480 × 480 unidades, com o centro em 240, 240. O anel é um círculo perfeito; os meridianos são elipses.')}
<ol class="leg">{''.join(f'<li><i>{i + 1}</i><div><b>{n}</b><span>{d}</span></div></li>' for i, (n, d) in enumerate(LEG))}</ol></div>
<div class="cons-arte">{construcao_geometria()}</div></div>''', 'clara', 'O símbolo')

pag(f'''{efeitos(grelha=False, feixes=1)}<div class="est"><div class="est-t"><div class="eb claro">02 · O símbolo</div><h2 class="branco">A estrela</h2>
<p class="lead claro">Cada canto da estrela é um quarto de uma superelipse com o centro no encontro do eixo com o equador. A curva toca as duas faixas sem quebras.</p>
<div class="formula">|u/U|<sup>p</sup> + |v/V|<sup>p</sup> = 1</div>
<dl><dt>Estrela central</dt><dd>U {n2(Uc)} · V {n2(Vc)} · p {n2(Pc, 2)}</dd><dt>Meias-estrelas</dt><dd>U {n2(Um)} · V {n2(Vm)} · p {n2(Pm, 2)}</dd></dl>
<p class="nota claro">Os pontos laranja marcam onde cada curva toca o eixo, o equador ou o meridiano.</p></div>
<div class="est-a">{construcao_estrela()}</div></div>''', 'escura', 'O símbolo')

pag(f'''{efeitos(feixes=2)}<div class="frase"><div class="eb claro">02 · O símbolo</div>
<p>É isto que a Kingdom faz, em todas as suas marcas: dá <em>direção</em>, <em>estrutura</em> e <em>método</em> para crescer com propósito.</p></div>
<div class="frase-g">{globo('#FFFFFF', '58mm')}</div>''', 'grad aurora', 'O símbolo')

# ---- 03 o logótipo
capa_seccao(3, 'O logótipo', ['Principal', 'Construção do nome', 'Versões', 'Ícone', 'Proteção', 'Cores', 'Usos incorretos'], f'<div class="cs-k">{logo("kingdom-company-horizontal-simples", "#FFFFFF", w="300mm")}</div>')
# relações do logótipo principal (unidades do SVG: 671,44 × 120)
k = 230 / 671.44
rel = f'''<svg viewBox="-20 -40 711.44 210" width="250mm">
<g>{open(os.path.join(M, 'logotipo/kingdom-company-horizontal-indigo.svg')).read().split('<g', 1)[1].rsplit('</svg>', 1)[0].join(['<g', ''])}</g>
<g stroke="{LAR}" stroke-width="1" fill="none"><line x1="0" y1="-14" x2="120" y2="-14"/><line x1="120" y1="-14" x2="150" y2="-14"/><line x1="150" y1="-14" x2="667.4" y2="-14"/>
<line x1="-10" y1="0" x2="-10" y2="120"/><line x1="680" y1="18.6" x2="680" y2="61.6"/>
<line x1="150" y1="61.6" x2="667.4" y2="61.6" stroke-dasharray="4 3"/><line x1="150" y1="18.6" x2="667.4" y2="18.6" stroke-dasharray="4 3"/></g>
<g font-family="Google Sans" font-size="10" fill="{LARF}" font-weight="700"><text x="60" y="-20" text-anchor="middle">G</text><text x="135" y="-20" text-anchor="middle">G/4</text><text x="408" y="-20" text-anchor="middle">largura do nome = largura do descritor</text>
<text x="-15" y="64" text-anchor="end" font-size="13">G</text><text x="686" y="44">x</text></g></svg>'''
pag(f'''{cab('03 · O logótipo', 'O logótipo principal', 'O globo à esquerda e o nome completo numa só linha, em Google Sans 500. Por baixo, o descritor com a largura exata do nome. O texto está em curvas: o logótipo fica igual em qualquer computador.')}
<div class="rel">{rel}</div>
<div class="tres"><div><b>G</b><span>Altura do globo e de todo o logótipo.</span></div><div><b>G/4</b><span>Espaço entre o globo e o nome.</span></div><div><b>x</b><span>Altura do «K». Medida da área de proteção.</span></div></div>''', 'branca', 'O logótipo')

pag(f'''{cab('03 · O logótipo', 'Construção do nome', 'Google Sans 500, com espaçamento −2,5%. Os pontos laranja são os pontos das curvas de cada letra; as linhas marcam as alturas que a letra respeita. «Company» segue as mesmas linhas.')}
<div class="nome-c">{construcao_nome()}</div>
<div class="tres"><div><b>500</b><span>Peso Medium, igual nas duas palavras.</span></div><div><b>−2,5%</b><span>Espaçamento entre letras, ligeiramente apertado.</span></div><div><b>71%</b><span>Altura-x em relação às maiúsculas: letra aberta e legível em tamanhos pequenos.</span></div></div>''', 'clara', 'O logótipo')

pag(f'''{cab('03 · O logótipo', 'Versões')}
<div class="vers"><div>{logo('kingdom-company-horizontal', IND, w='112mm')}<p><b>Horizontal</b>A versão principal. Usar sempre que houver espaço.</p></div>
<div>{logo('kingdom-company-vertical', IND, w='60mm')}<p><b>Vertical</b>Formatos quadrados e altos.</p></div>
<div>{logo('kingdom-company-horizontal-simples', IND, w='112mm')}<p><b>Horizontal simples</b>Sem descritor: cabeçalhos, rodapés, tamanhos pequenos.</p></div>
<div>{logo('kingdom-company-vertical-simples', IND, w='50mm')}<p><b>Vertical simples</b>Sem descritor.</p></div></div>''', 'branca', 'O logótipo')

pag(f'''<div class="ic"><div class="ic-t">{cab('03 · O logótipo', 'Símbolo, ícone e favicon', 'Quando a marca já está presente ou o espaço é pequeno, o globo aparece sozinho.')}
<dl class="dl"><dt>Símbolo</dt><dd>O globo sozinho, em índigo, branco ou preto.</dd><dt>Ícone</dt><dd>Globo branco num quadrado de cantos arredondados, índigo (principal) ou laranja. App, perfis e redes.</dd><dt>Favicon</dt><dd>O globo ocupa quase todo o quadrado, para o anel continuar visível a 16 px.</dd></dl>
<div class="favs">{favicon('48px')}{favicon('32px')}{favicon('16px')}<span>48 · 32 · 16 px</span></div></div>
<div class="ic-a grad">{efeitos(grelha=False, feixes=2)}<div class="vidro">{icone('indigo', '34mm')}<div><b>Kingdom Company</b><span>Um único lugar. Tudo o que precisa para desenvolver o seu negócio.</span></div></div>
<div class="ic-lar">{icone('laranja', '22mm')}</div></div></div>''', 'branca', 'O logótipo')

x = 43; W, H = 671.44, 120
hz = open(os.path.join(M, 'logotipo/kingdom-company-horizontal-indigo.svg')).read(); hz = hz[hz.index('<g'):hz.rindex('</svg>')]
cx_ = ''.join(f'<rect x="{a}" y="{b}" width="{x}" height="{x}" fill="{LAR}" fill-opacity=".12" stroke="{LAR}" stroke-width="1.2"/><text x="{a + x / 2}" y="{b + x / 2 + 7}" text-anchor="middle" font-size="20" font-weight="700" fill="{LARF}" font-family="Google Sans">x</text>'
              for a, b in ((-x, (H - x) / 2), (W, (H - x) / 2), (150, -x), (150, H)))
prot = (f'<svg viewBox="{-x - 6} {-x - 6} {W + 2 * x + 12} {H + 2 * x + 12}" width="150mm"><rect x="{-x}" y="{-x}" width="{W + 2 * x}" height="{H + 2 * x}" fill="none" stroke="{LAR}" stroke-width="1.4" stroke-dasharray="6 5"/>'
        f'<rect x="0" y="0" width="{W}" height="{H}" fill="none" stroke="#C9C3D8" stroke-width="1"/>{cx_}{hz}</svg>')
MIN = [('kingdom-company-horizontal', 'Horizontal', '280 px · 70 mm', '70mm'), ('kingdom-company-horizontal-simples', 'Horizontal simples', '120 px · 30 mm', '30mm'),
       ('kingdom-company-vertical', 'Vertical', '210 px · 55 mm', '55mm'), ('kingdom-company-vertical-simples', 'Vertical simples', '100 px · 25 mm', '25mm')]
mins = ''.join(f'<div><div class="mn-a">{logo(f, IND, w=w)}</div><b>{n}</b><span>{t}</span></div>' for f, n, t, w in MIN) + f'<div><div class="mn-a">{globo(IND, "6mm")}</div><b>Símbolo</b><span>16 px · 6 mm</span></div>'
pag(f'''<div class="pt"><div>{cab('03 · O logótipo', 'Proteção e tamanhos mínimos', 'Nada entra na zona à volta do logótipo: pelo menos x livre em todos os lados, em que x é a altura do «K».')}</div><div class="pt-a">{prot}</div></div>
<div class="eb e-min">Tamanhos mínimos · largura no ecrã e impressa, em tamanho real de impressão</div><div class="mins">{mins}</div>''', 'branca', 'O logótipo')

FUNDOS = [(MAR, IND, 'Índigo sobre marfim', 'Principal'), (IND, '#FFFFFF', 'Branco sobre índigo', 'Fundos escuros'), (LAR, '#FFFFFF', 'Branco sobre laranja', 'Campanhas'),
          ('#FFFFFF', '#000000', 'Preto sobre branco', 'Impressão a uma cor'), ('#000000', '#FFFFFF', 'Branco sobre preto', 'Gravação e vídeo'), ('grad', '#FFFFFF', 'Branco sobre gradiente', 'Capas e digital')]
fd = ''.join(f'<div class="fd{" grad" if bg == "grad" else ""}" style="{"" if bg == "grad" else f"background:{bg}"}">{efeitos(grelha=False, feixes=1) if bg == "grad" else ""}{logo("kingdom-company-horizontal", cor, w="64mm", estilo="position:relative")}<p><b>{n}</b> · {d}</p></div>' for bg, cor, n, d in FUNDOS)
pag(f'''{cab('03 · O logótipo', 'Cores do logótipo', 'Sempre uma só cor: índigo, branco ou preto.')}<div class="fundos">{fd}</div>''', 'branca', 'O logótipo')

ERR = [('transform:scaleX(1.45)', 'Não esticar nem achatar'), ('transform:rotate(-12deg)', 'Não rodar'), ('dois', 'Não usar duas cores'), ('laranja', 'Não usar laranja sobre índigo'),
       ('letra', 'Não trocar a letra'), ('filter:drop-shadow(2mm 2mm 1.2mm rgba(0,0,0,.45))', 'Não aplicar sombras ou efeitos'), ('contraste', 'Não usar sem contraste'), ('prop', 'Não mudar a proporção')]
def errado(t):
    if t == 'dois': return f'<div class="row">{globo(LAR, "11mm")}<span class="wm">Kingdom Company</span></div>'
    if t == 'laranja': return logo('kingdom-company-horizontal-simples', LAR, w='50mm')
    if t == 'letra': return f'<div class="row">{globo(IND, "11mm")}<span class="wm" style="font-family:Georgia,serif;font-weight:400">Kingdom Company</span></div>'
    if t == 'contraste': return logo('kingdom-company-horizontal-simples', IND, w='50mm')
    if t == 'prop': return f'<div class="row">{globo(IND, "20mm")}<span class="wm" style="font-size:9pt">Kingdom Company</span></div>'
    return logo('kingdom-company-horizontal-simples', IND, w='36mm' if 'scaleX' in t else '48mm', estilo=t)
cls = {'laranja': ' e-ind', 'contraste': ' e-esc'}
pag(f'''{cab('03 · O logótipo', 'Usos incorretos', 'O logótipo usa-se sempre a partir dos ficheiros originais, sem alterações.')}
<div class="erros">{''.join(f'<div class="er{cls.get(t, "")}"><div class="er-a">{errado(t)}</div><p><i>×</i>{n}</p></div>' for t, n in ERR)}</div>''', 'branca', 'O logótipo')

# ---- 04 a cor
capa_seccao(4, 'A cor', ['A paleta', 'Gradientes', 'Proporção e contraste'], cls='grad brasa')
def valores(h):
    rr, gg, bb = rgb(h); c, m_, y, k_ = cmyk(h); return f'HEX {h}<br>RGB {rr} {gg} {bb}<br>CMYK {c} {m_} {y} {k_}'
PAL = [('Índigo Kingdom', IND, '#fff', 'Logótipo, títulos e blocos escuros', 'p-big'), ('Marfim', MAR, TIN, 'Fundo de páginas e documentos', ''), ('Laranja', LAR, TIN, 'Botões, preços e destaques', ''),
       ('Tinta', TIN, '#fff', 'Texto principal', ''), ('Laranja Fundo', LARF, '#fff', 'Links e texto laranja pequeno', ''), ('Cinza Índigo', CIN, '#fff', 'Texto secundário', ''), ('Linha', LIN, TIN, 'Divisórias e contornos', '')]
pag(f'''{cab('04 · A cor', 'A paleta', 'Três cores principais e quatro de apoio. CMYK aproximado: confirmar com a gráfica numa prova de cor.')}
<div class="mosaico">{''.join(f'<div class="{c}" style="background:{h};color:{t}"><b>{n}</b><span>{u}</span><code>{valores(h)}</code></div>' for n, h, t, u, c in PAL)}</div>''', 'branca', 'A cor')

GRADS = [('Noite', f'linear-gradient(135deg,{NOITE} 0%,{TIN} 35%,{IND} 70%,#3B3478 100%)', f'{NOITE} → {TIN} → {IND}', 'Capas, apresentações e fundos de vídeo.'),
         ('Aurora', f'radial-gradient(90% 80% at 85% 10%,{LAV} 0,transparent 55%),linear-gradient(160deg,{IND} 0%,#4A43A0 55%,{LUZ} 100%)', f'{IND} → {LUZ} → {LAV}', 'Frases, destaques digitais e redes.'),
         ('Brasa', f'radial-gradient(80% 90% at 100% 100%,{LAR} 0,transparent 60%),linear-gradient(135deg,{NOITE} 0%,{IND} 65%)', f'{NOITE} → {IND} → {LAR}', 'Campanhas e lançamentos, com pouco laranja.')]
pag(f'''{cab('04 · A cor', 'Gradientes', 'Os gradientes nascem do índigo e servem de luz de fundo. Levam sempre grão fino e, quando há texto, este é branco.')}
<div class="grads">{''.join(f'<div><div class="gs" style="background:{g}"><div class="grao"></div><span>{n}</span></div><b>{n}</b><code>{s}</code><p>{u}</p></div>' for n, g, s, u in GRADS)}</div>
<p class="nota">Tons de apoio só para gradientes: Noite {NOITE}, Índigo Luz {LUZ} e Lavanda {LAV}. Não se usam como cores sólidas, nem no logótipo.</p>''', 'branca', 'A cor')

PARES = [('#FFFFFF', IND, 'Branco sobre índigo'), (TIN, MAR, 'Tinta sobre marfim'), (CIN, MAR, 'Cinza Índigo sobre marfim'), (LARF, MAR, 'Laranja Fundo sobre marfim'), ('#FFFFFF', LAR, 'Branco sobre laranja')]
pag(f'''<div class="cols"><div>{cab('04 · A cor', 'Proporção e contraste', 'O marfim domina, o índigo dá peso e o laranja aparece pouco, onde importa: botões, preços e destaques.')}
<div class="prop"><div style="flex:60;background:{MAR};color:{TIN}">60%<small>Marfim e branco</small></div><div style="flex:30;background:{IND}">30%<small>Índigo</small></div><div style="flex:10;background:{LAR}">10%<small>Laranja</small></div></div>
<p class="txt">Texto branco sobre laranja só em letra grande ou a negrito, como nos botões. As cinco áreas não têm cores próprias: distinguem-se por ícones e etiquetas.</p></div>
<div class="pares">{''.join(f'<div style="background:{f};color:{t}"><b>Aa</b><div><span>{n}</span><small>{n2(contraste(t, f))}:1 · {"qualquer tamanho" if contraste(t, f) >= 4.5 else "só texto grande ou a negrito"}</small></div></div>' for t, f, n in PARES)}</div></div>''', 'branca', 'A cor')

# ---- 05 a tipografia
capa_seccao(5, 'A tipografia', ['Google Sans', 'Hierarquia'], '<div class="cs-aa">Aa</div>', cls='grad aurora')
pag(f'''<div class="cols"><div>{cab('05 · A tipografia', 'Google Sans', 'Uma só família para tudo: logótipo, títulos, texto, botões e documentos. É a mesma em todos os sites do grupo Kingdom.')}
<div class="pesos">{''.join(f'<div><b style="font-weight:{w}">Aa</b><span>{n}</span><small>{u}</small></div>' for w, n, u in ((400, 'Regular 400', 'Texto corrido'), (500, 'Medium 500', 'Títulos, nome, números'), (700, 'Bold 700', 'Botões e etiquetas')))}</div>
<p class="nota">Gratuita no Google Fonts. Em documentos do Office, instalar a letra antes de editar.</p></div>
<div class="spec"><b>Aa</b><p>ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>áàâãçéêíóôõú 0123456789 MT %</p></div></div>''', 'branca', 'A tipografia')

HIER = [('Título principal', '500 · 64–84 px · −4%', '<span style="font-size:40pt;font-weight:500;letter-spacing:-.04em;line-height:1">Um único lugar.</span>'),
        ('Título de secção', '500 · 40–56 px · −3,5%', '<span style="font-size:25pt;font-weight:500;letter-spacing:-.035em">Decisões com base em dados</span>'),
        ('Subtítulo', '500 · 22–28 px · −2%', '<span style="font-size:15pt;font-weight:500;letter-spacing:-.02em">Do diagnóstico à autonomia, com um plano à vista</span>'),
        ('Texto corrido', '400 · 17–19 px · entrelinha 1,6', '<span style="font-size:11pt;line-height:1.6">Analisamos o mercado, o modelo de negócio e os números da sua empresa, e acompanhamos a execução de perto.</span>'),
        ('Números e preços', '500 · 40–64 px · algarismos tabulares', f'<span style="font-size:30pt;font-weight:500;letter-spacing:-.04em">13 000+ <small style="font-size:11pt;color:{CIN};letter-spacing:0">alunos na Kingdom Academy</small></span>'),
        ('Botões e etiquetas', '700 · 15–19 px', '<span class="btn">Marcar diagnóstico</span> <span class="etq">Consultoria Estratégica</span>')]
pag(f'''{cab('05 · A tipografia', 'Hierarquia')}<div class="hier">{''.join(f'<div><div><b>{n}</b><small>{e}</small></div><div>{x_}</div></div>' for n, e, x_ in HIER)}</div>''', 'branca', 'A tipografia')

# ---- 06 o padrão
padrao_capa = f'<div class="pad-capa" style="background-image:url(file://{M}/padroes/modulos/kingdom-padrao-estrela-ampla-branco-sobre-indigo-modulo.svg)"></div>'
capa_seccao(6, 'O padrão', ['A estrela central', 'Módulo e escalas', 'Cores'], padrao_capa)
st = PECAS['estrela']
def estrela_em(cx, cy, tam=130, op=1):
    k = tam / 480
    return f'<path transform="translate({cx - tam / 2:.2f} {cy - tam / 2:.2f}) scale({k:.5f})" fill-rule="evenodd" fill-opacity="{op}" d="{st}"/>'
# módulo real do padrão «estrela ampla»: 240 × 208, estrelas em (60, 52) e (180, 156)
modulo = f'''<svg viewBox="-24 -34 288 272" width="98mm">
<rect x="0" y="0" width="240" height="208" fill="none" stroke="{LUZ}" stroke-width="1" stroke-dasharray="5 4"/>
<g stroke="#D9D6F2" stroke-width=".8"><line x1="60" y1="0" x2="60" y2="208"/><line x1="180" y1="0" x2="180" y2="208"/><line x1="0" y1="52" x2="240" y2="52"/><line x1="0" y1="156" x2="240" y2="156"/></g>
<g fill="{IND}">{estrela_em(60, 52)}{estrela_em(180, 156)}</g>
<g stroke="{LAR}" stroke-width="1"><line x1="60" y1="222" x2="180" y2="222"/><line x1="60" y1="217" x2="60" y2="227"/><line x1="180" y1="217" x2="180" y2="227"/></g>
<g font-family="Google Sans" font-size="9.5" fill="{LARF}" font-weight="700"><text x="120" y="-14" text-anchor="middle">Módulo 240 × 208</text><text x="120" y="236" text-anchor="middle">120 · meio módulo de avanço</text></g></svg>'''
VAR = [('estrela', 'branco-sobre-indigo', 'Densa · branco sobre índigo', 14), ('estrela-ampla', 'indigo-sobre-marfim', 'Ampla · índigo sobre marfim', 26),
       ('estrela', 'branco-sobre-laranja', 'Densa · branco sobre laranja', 14), ('estrela-ampla', 'tom-sobre-indigo', 'Ampla · tom sobre tom', 26)]
pag(f'''<div class="pd"><div>{cab('06 · O padrão', 'A estrela central', 'O padrão usa só a estrela do globo, a Direção. As estrelas alinham em fiadas desencontradas, como tijolo: cada fiada avança meio módulo.')}
<div class="pd-m">{modulo}</div><p class="nota">Duas densidades: densa, para superfícies pequenas; ampla, para fundos grandes. O módulo repete sem emendas no Figma, Canva ou Illustrator.</p></div>
<div class="pd-v">{''.join(f'<div style="background:url(file://{M}/padroes/modulos/kingdom-padrao-{n}-{c}-modulo.svg) 0 0/{w}mm auto repeat"><span>{t}</span></div>' for n, c, t, w in VAR)}</div></div>''', 'branca', 'O padrão')

pag(f'''<div class="pd-full" style="background-image:url(file://{M}/padroes/modulos/kingdom-padrao-estrela-ampla-tom-sobre-indigo-modulo.svg)"></div>{efeitos(grelha=False, feixes=2)}
<div class="pd-txt"><div class="eb claro">06 · O padrão</div><h2 class="branco">Tom sobre tom,<br>com luz</h2><p class="lead claro">Sobre o gradiente Noite, a estrela em tom de índigo cria textura sem competir com o texto. É a combinação para capas e fundos de apresentação.</p></div>''', 'grad', 'O padrão')

# ---- 07 tom de voz
TOM = [('Claros', 'Dizemos as coisas pelo nome, em frases curtas.', 'Os pedidos, as aprovações e os relatórios a correr sozinhos.', 'Soluções disruptivas de transformação digital 360º.'),
       ('Concretos', 'Falamos de resultados, números, prazos e entregas.', 'Plano de negócios pronto para investidores e bancos.', 'Levamos o seu negócio para o próximo nível.'),
       ('Próximos e respeitosos', 'Português europeu, «a sua empresa», sem gíria nem emojis em documentos.', 'O que trava o crescimento, dito com clareza e com números.', 'Bora escalar o teu negócio!!!')]
capa_seccao(7, 'O tom de voz', ['Como escrevemos', 'Contactos'], '<div class="cs-asp">«»</div>')
pag(f'''{cab('07 · O tom de voz', 'Como escrevemos', 'Como um consultor experiente fala com um empresário: com clareza, com números e com respeito pelo tempo dele.')}
<div class="tom">{''.join(f'<div><b>{n}</b><p>{d}</p><small>Dizemos</small><q>{s}</q><small class="x">Evitamos</small><s>{e}</s></div>' for n, d, s, e in TOM)}</div>
<div class="frm"><small>Parágrafo-modelo</small>A Kingdom Company [faz o quê] para [que empresas], com [que método], para que [resultado concreto].</div>''', 'branca', 'O tom de voz')

pag(f'''<div class="cols"><div>{cab('07 · Contactos', 'Contactos oficiais', 'Usar sempre estes contactos em documentos, assinaturas, cartões e redes.')}<div class="ct-g">{globo(LIN, '62mm')}</div></div>
<div class="cts"><div><small>Email</small>contact@kingdomcompany.co.za</div><div><small>Telefones</small>+258 87 664 1836<br>+258 85 1800 920</div>
<div><small>Morada</small>Edifício Millenium Park<br>Av. Vladimir Lenine, n.º 174<br>Maputo 1106, Moçambique</div><div><small>Site</small>{SITE}</div>
<p class="nota">A morada da África do Sul aparece só no site. Para receber os ficheiros originais da marca, pedir à equipa Kingdom Company.</p></div></div>''', 'branca', 'Contactos')

# fecho
pag(f'''{efeitos(feixes=3)}<div class="fim">{logo('kingdom-company-vertical', '#FFFFFF', w='92mm')}<p>Um único lugar. Tudo o que precisa para desenvolver o seu negócio.</p></div>
<div class="canto">{VERSAO}</div><div class="canto d">{SITE}</div>''', 'grad')

# índice com números de página reais
caps = [(i + 1, c[0]) for i, c in enumerate(paginas) if 'cs-num' in c[0]]
nomes = [re.search(r'<h1>(.*?)</h1>', h).group(1) for _, h in caps]
paginas[2][0] = (f'<div class="ix"><div>{cab("Índice", "Neste manual")}<p class="lead">As regras da marca Kingdom Company: logótipo, cor, letra, padrão e tom de voz. Serve a equipa, os parceiros e qualquer designer que trabalhe com a marca.</p></div><ol>'
                 + ''.join(f'<li><i>{j + 1:02d}</i><span>{n}</span><b>{p:02d}</b></li>' for j, ((p, _), n) in enumerate(zip(caps, nomes))) + '</ol></div>')

# ---------------- estilo ----------------
GRAO = ("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/>"
        "<feColorMatrix type='saturate' values='0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>")
CSS = '''@page{size:297mm 210mm;margin:0} *{margin:0;padding:0;box-sizing:border-box}
:root{--ind:#2B2850;--lar:#FF521A;--larf:#D63E12;--mar:#FAF9F5;--tin:#1C1A30;--cin:#6A6682;--lin:#E8E4DC;--noite:#0E0C1F;--luz:#6F67D6;--lav:#B9B3F2}
body{font-family:'Google Sans',sans-serif;color:var(--tin);-webkit-print-color-adjust:exact;print-color-adjust:exact;-webkit-font-smoothing:antialiased}
.pag{width:297mm;height:209.9mm;position:relative;overflow:hidden;page-break-after:always;padding:18mm 20mm 20mm}
.branca{background:#fff} .clara{background:linear-gradient(180deg,#ECEAFB 0%,#fff 62%)}
.escura{background:radial-gradient(70% 90% at 90% 20%,rgba(111,103,214,.35) 0,transparent 60%),linear-gradient(160deg,#0B0A16 0%,var(--noite) 50%,#1C1A30 100%);color:#fff}
.grad{background:radial-gradient(70% 80% at 88% 8%,rgba(185,179,242,.42) 0,transparent 55%),radial-gradient(55% 60% at 0% 100%,rgba(255,82,26,.20) 0,transparent 60%),linear-gradient(135deg,var(--noite) 0%,var(--tin) 32%,var(--ind) 68%,#3B3478 100%);color:#fff}
.aurora{background:radial-gradient(80% 80% at 85% 5%,var(--lav) 0,transparent 55%),radial-gradient(60% 60% at 10% 110%,rgba(255,82,26,.28) 0,transparent 60%),linear-gradient(160deg,var(--ind) 0%,#4A43A0 55%,var(--luz) 100%)}
.grao{position:absolute;inset:0;background-image:url("@@GRAO@@");background-size:300px;opacity:.13;mix-blend-mode:overlay;pointer-events:none}
.luz{position:absolute;inset:0;overflow:hidden} .feixe{position:absolute;width:70mm;height:330mm;border-radius:16mm;background:linear-gradient(180deg,rgba(185,179,242,0) 0%,rgba(185,179,242,.30) 50%,rgba(185,179,242,0) 100%);filter:blur(5mm);transform:rotate(32deg)}
.f1{left:150mm;top:-70mm} .f2{left:215mm;top:-40mm;width:40mm;opacity:.7} .f3{left:60mm;top:-110mm;width:30mm;opacity:.5}
.gl{position:absolute;background:rgba(255,255,255,.13)} .gv1,.gv2{top:0;bottom:0;width:.25mm} .gv1{left:12mm} .gv2{right:12mm} .gh1,.gh2{left:0;right:0;height:.25mm} .gh1{top:18mm} .gh2{bottom:20mm}
.canto{position:absolute;left:20mm;bottom:11mm;font-size:7.5pt;color:rgba(255,255,255,.62);z-index:3} .canto.d{left:auto;right:20mm}
.rod{position:absolute;left:20mm;right:20mm;bottom:10mm;display:flex;justify-content:space-between;font-size:7pt;color:var(--cin)} .rod b{font-weight:500;color:var(--ind)}
.eb{font-size:7.5pt;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--larf);margin-bottom:5mm} .eb.claro{color:var(--lar)}
h2{font-size:30pt;font-weight:500;letter-spacing:-.035em;line-height:1.05;color:var(--ind);text-wrap:balance} h2.branco{color:#fff}
.lead{font-size:12.5pt;line-height:1.45;color:var(--cin);margin-top:4mm;max-width:160mm} .lead.claro{color:#C9C6DE}
.txt{font-size:10pt;line-height:1.6;margin-top:6mm;max-width:118mm} .txt b{font-weight:500;color:var(--ind)}
.nota{font-size:8.5pt;line-height:1.5;color:var(--cin);margin-top:6mm;max-width:130mm} .nota.claro{color:#A9A5C0}
.cols{display:grid;grid-template-columns:118mm 1fr;gap:18mm;height:100%} .centro{align-self:center}
.pag:last-child{page-break-after:auto} html,body{margin:0}
/* capa */
.capa-g{position:absolute;right:-70mm;top:-22mm;line-height:0} .capa-logo{position:absolute;left:20mm;top:22mm;z-index:2}
.capa-t{position:absolute;left:20mm;bottom:26mm;z-index:2} .capa-t h1{font-size:60pt;font-weight:500;letter-spacing:-.045em;line-height:.95} .capa-t p{font-size:10pt;color:#C9C6DE;margin-top:6mm}
/* manifesto */
.mani{position:absolute;left:20mm;right:20mm;top:22mm;z-index:2} .mani small{font-size:8pt;color:#A9A5C0;letter-spacing:.04em}
.mani h1{font-size:50pt;font-weight:500;letter-spacing:-.045em;line-height:1;margin-top:12mm} .mani p{font-size:14pt;line-height:1.5;color:#D8D5E8;max-width:180mm;margin-top:12mm}
.pilulas{display:flex;gap:3mm;margin-top:12mm} .pilulas span{font-size:9.5pt;padding:2.2mm 5mm;border:.3mm solid rgba(255,255,255,.55);border-radius:20mm}
/* índice */
.ix{display:grid;grid-template-columns:105mm 1fr;gap:20mm;height:100%} .ix ol{list-style:none;align-self:center} .ix li{display:flex;align-items:baseline;gap:6mm;padding:5mm 0;border-bottom:.25mm solid var(--lin)}
.ix li i{font-style:normal;font-size:9pt;font-weight:700;color:var(--larf);width:8mm} .ix li span{flex:1;font-size:18pt;font-weight:500;letter-spacing:-.02em;color:var(--ind)} .ix li b{font-size:9pt;font-weight:500;color:var(--cin);font-variant-numeric:tabular-nums}
/* capa de secção */
.cs{position:absolute;inset:0;z-index:2} .cs-num{position:absolute;right:8mm;top:-6mm;padding-right:.12em;font-size:300pt;font-weight:400;letter-spacing:-.07em;line-height:1;background:linear-gradient(180deg,rgba(255,255,255,.92) 0%,rgba(185,179,242,.18) 85%);-webkit-background-clip:text;background-clip:text;color:transparent}
.cs-txt{position:absolute;left:20mm;top:118mm} .cs-txt small{font-size:8pt;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--lar)}
.cs-txt h1{font-size:52pt;font-weight:500;letter-spacing:-.045em;line-height:1;margin-top:4mm} .cs-txt ul{list-style:none;margin-top:7mm;display:flex;flex-wrap:wrap;gap:2mm;max-width:240mm}
.cs-txt li{font-size:8.5pt;padding:1.6mm 3.6mm;border:.3mm solid rgba(255,255,255,.4);border-radius:20mm;color:#E2E0F0}
.cs-arte{position:absolute;left:-40mm;top:-30mm;opacity:.22;z-index:1;line-height:0} .cs-aa{position:absolute;left:16mm;top:-14mm;font-size:250pt;font-weight:500;letter-spacing:-.06em;line-height:1;color:rgba(255,255,255,.06);z-index:1}
.pad-capa{position:absolute;inset:0;background-size:52mm auto;opacity:.16;-webkit-mask-image:radial-gradient(90% 90% at 70% 30%,#000 0,transparent 75%);z-index:1}
.brasa{background:radial-gradient(70% 90% at 100% 100%,rgba(255,82,26,.75) 0,transparent 60%),radial-gradient(60% 70% at 85% 5%,rgba(185,179,242,.25) 0,transparent 55%),linear-gradient(135deg,var(--noite) 0%,var(--tin) 40%,var(--ind) 75%)}
.cs-tres{position:absolute;left:20mm;top:22mm;display:flex;gap:6mm;z-index:1} .cs-k{position:absolute;left:-10mm;top:34mm;opacity:.07;z-index:1}
.cs-asp{position:absolute;left:14mm;top:-30mm;font-size:260pt;font-weight:500;line-height:1;color:rgba(255,255,255,.07);z-index:1}
/* a marca */
.atr{display:grid;grid-template-columns:repeat(5,1fr);gap:8mm;margin-top:12mm} .atr div{border-top:.6mm solid var(--ind);padding-top:4mm}
.atr b{display:block;font-size:17pt;font-weight:500;letter-spacing:-.025em;color:var(--ind)} .atr span{display:block;font-size:9pt;line-height:1.5;color:var(--cin);margin-top:2mm}
.anti{margin-top:14mm;background:var(--mar);border-radius:5mm;padding:7mm 8mm} .anti ul{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:3mm 10mm}
.anti li{font-size:9.5pt;line-height:1.45;color:var(--tin);padding-left:6mm;position:relative} .anti li::before{content:"×";position:absolute;left:0;color:var(--larf);font-weight:700}
.areas{display:grid;grid-template-columns:repeat(5,1fr);gap:7mm;margin-top:9mm} .areas div{display:flex;flex-direction:column;gap:2.5mm;border-top:.25mm solid var(--lin);padding-top:4mm}
.areas small{font-size:7pt;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--larf)} .areas b{font-size:11.5pt;font-weight:500;letter-spacing:-.015em;line-height:1.2;color:var(--ind)} .areas span{font-size:8.5pt;line-height:1.5;color:var(--cin)}
.e-met{margin-top:11mm} .metodo{display:grid;grid-template-columns:repeat(4,1fr);position:relative} .metodo::before{content:"";position:absolute;left:0;right:0;top:1.6mm;height:.3mm;background:var(--ind)}
.metodo div{position:relative;padding-right:8mm} .metodo i{display:block;width:3.4mm;height:3.4mm;border-radius:50%;background:var(--lar);margin-bottom:4mm;position:relative}
.metodo b{font-size:13pt;font-weight:500;color:var(--ind);display:block} .metodo span{font-size:8.8pt;line-height:1.5;color:var(--cin);display:block;margin-top:1.5mm}
/* símbolo */
.sigs{display:grid;grid-template-columns:repeat(4,1fr);gap:8mm;margin-top:12mm} .sigs div{display:flex;flex-direction:column;gap:1.5mm} .sigs svg{margin-bottom:5mm}
.sigs small{font-size:7.5pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--larf)} .sigs b{font-size:18pt;font-weight:500;letter-spacing:-.025em;color:var(--ind)} .sigs span{font-size:9pt;line-height:1.5;color:var(--cin)}
.pz{display:flex;align-items:flex-start;justify-content:space-between;margin-top:18mm} .pz>div{display:flex;flex-direction:column;align-items:flex-start;gap:1.5mm}
.pz small{font-size:8pt;font-weight:700;color:var(--larf);margin-top:5mm} .pz b{font-size:14pt;font-weight:500;color:var(--ind)} .pz>i{font-style:normal;font-size:16pt;font-weight:400;color:var(--cin);margin-top:23mm} .pz span{font-size:8.5pt;color:var(--cin);max-width:52mm;line-height:1.45}
.cons{display:grid;grid-template-columns:96mm 1fr;gap:10mm;height:100%} .cons-arte{display:flex;align-items:center;justify-content:center;margin-top:-8mm}
.leg{list-style:none;margin-top:7mm;display:flex;flex-direction:column;gap:3mm} .leg li{display:flex;gap:4mm;align-items:flex-start}
.leg i{font-style:normal;flex:none;width:5.4mm;height:5.4mm;border-radius:50%;background:var(--lar);color:#fff;font-size:7.5pt;font-weight:700;display:grid;place-items:center}
.leg b{display:block;font-size:10pt;font-weight:500;color:var(--ind)} .leg span{font-size:8.5pt;line-height:1.45;color:var(--cin)}
.est{position:absolute;inset:0;display:grid;grid-template-columns:96mm 1fr;gap:4mm;padding:18mm 20mm 20mm;z-index:2} .est-a{display:flex;align-items:center;justify-content:center;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 14%,#000 86%,transparent 100%)}
.formula{font-size:24pt;font-weight:400;letter-spacing:-.02em;margin-top:9mm;color:#fff} .formula sup{font-size:12pt}
.est dl{margin-top:6mm;display:grid;grid-template-columns:auto 1fr;gap:2mm 6mm;font-size:9.5pt} .est dt{color:var(--lav)} .est dd{color:#fff;font-variant-numeric:tabular-nums}
.frase{position:absolute;left:20mm;top:18mm;right:20mm;z-index:2} .frase .eb{color:rgba(255,255,255,.78)} .frase p{font-size:36pt;font-weight:500;letter-spacing:-.04em;line-height:1.1;max-width:205mm;margin-top:14mm;color:#fff}
.frase em{font-style:normal;color:#fff;background:linear-gradient(transparent 62%,rgba(255,82,26,.85) 62%,rgba(255,82,26,.85) 92%,transparent 92%)}
.frase-g{position:absolute;right:20mm;bottom:22mm;z-index:2;line-height:0}
/* logótipo */
.rel{margin-top:10mm;display:flex;justify-content:center} .tres{display:grid;grid-template-columns:repeat(3,1fr);gap:10mm;margin-top:6mm}
.tres b{display:block;font-size:20pt;font-weight:500;color:var(--larf)} .tres span{font-size:9pt;color:var(--cin)}
.nome-c{margin-top:12mm}
.vers{display:grid;grid-template-columns:1.6fr 1fr;grid-template-rows:62mm 62mm;margin-top:8mm;border-top:.25mm solid var(--lin)}
.vers>div{display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;border-bottom:.25mm solid var(--lin)} .vers>div:nth-child(odd){border-right:.25mm solid var(--lin)}
.vers p{position:absolute;left:0;bottom:4mm;font-size:8pt;color:var(--cin);padding-left:2mm} .vers>div:nth-child(even) p{left:6mm} .vers p b{font-weight:500;color:var(--ind);margin-right:2mm}
.ic{display:grid;grid-template-columns:110mm 1fr;gap:12mm;height:100%} .dl{margin-top:8mm;display:grid;grid-template-columns:22mm 1fr;gap:3mm 4mm;font-size:9.5pt;line-height:1.45}
.dl dt{font-weight:500;color:var(--ind)} .dl dd{color:var(--cin)} .favs{display:flex;gap:6mm;align-items:flex-end;margin-top:9mm} .favs span{font-size:8pt;color:var(--cin)}
.ic-a{position:relative;border-radius:7mm;overflow:hidden;display:flex;align-items:center;justify-content:center;margin:-2mm 0 4mm}
.vidro{position:relative;z-index:2;width:110mm;padding:10mm;border-radius:9mm;border:.35mm solid rgba(255,255,255,.7);background:rgba(255,255,255,.05);display:flex;flex-direction:column;gap:7mm}
.vidro svg{border-radius:7mm} .vidro b{display:block;font-size:17pt;font-weight:500;letter-spacing:-.02em;color:#fff} .vidro span{display:block;font-size:9.5pt;line-height:1.45;color:#C9C6DE;margin-top:2mm}
.ic-lar{position:absolute;right:9mm;top:9mm;z-index:2;line-height:0}
.pt{display:grid;grid-template-columns:100mm 1fr;gap:10mm} .pt-a{display:flex;justify-content:flex-end;align-items:center}
.e-min{margin-top:9mm;margin-bottom:3mm;color:var(--cin)} .mins{display:grid;grid-template-columns:76mm 38mm 62mm 34mm 1fr;border-top:.25mm solid var(--lin)}
.mins>div{padding:4mm 4mm 0 0;display:flex;flex-direction:column;gap:1mm} .mn-a{height:34mm;display:flex;align-items:center} .mins b{font-size:9pt;font-weight:500;color:var(--ind)} .mins span{font-size:8pt;color:var(--cin)}
.fundos{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm;margin-top:8mm} .fd{height:55mm;border-radius:5mm;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;border:.25mm solid var(--lin)}
.fd p{position:absolute;left:4mm;bottom:3.5mm;font-size:7.5pt;color:var(--cin);background:#fff;padding:1.2mm 2.8mm;border-radius:10mm;z-index:3} .fd p b{font-weight:500;color:var(--ind)}
.erros{display:grid;grid-template-columns:repeat(4,1fr);margin-top:8mm;border-top:.25mm solid var(--lin);border-left:.25mm solid var(--lin)}
.er{border-right:.25mm solid var(--lin);border-bottom:.25mm solid var(--lin)} .er-a{height:40mm;display:flex;align-items:center;justify-content:center;overflow:hidden}
.e-ind .er-a{background:var(--ind)} .e-esc .er-a{background:var(--tin)} .er p{font-size:8.5pt;padding:3mm 4mm;display:flex;gap:2mm;align-items:center}
.er p i{font-style:normal;font-weight:700;color:var(--larf);font-size:12pt;line-height:1} .row{display:flex;align-items:center;gap:3mm} .wm{white-space:nowrap;font-size:13pt;font-weight:500;letter-spacing:-.02em;color:var(--ind)}
/* cor */
.mosaico{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;grid-template-rows:58mm 58mm;gap:3mm;margin-top:8mm}
.mosaico div{border-radius:5mm;padding:5mm;display:flex;flex-direction:column;border:.25mm solid var(--lin)} .mosaico .p-big{grid-row:span 2}
.mosaico b{font-size:13pt;font-weight:500;letter-spacing:-.02em} .mosaico span{font-size:8pt;opacity:.8;margin-top:1mm} .mosaico code{font-family:inherit;font-size:7.8pt;line-height:1.5;margin-top:auto;font-variant-numeric:tabular-nums;opacity:.9}

.grads{display:grid;grid-template-columns:repeat(3,1fr);gap:6mm;margin-top:9mm} .gs{height:78mm;border-radius:5mm;position:relative;overflow:hidden;display:flex;align-items:flex-end;padding:5mm}
.gs span{position:relative;font-size:22pt;font-weight:500;letter-spacing:-.03em;color:#fff} .grads b{display:block;font-size:11pt;font-weight:500;color:var(--ind);margin-top:4mm}
.grads code{font-family:inherit;font-size:8pt;color:var(--cin)} .grads p{font-size:8.5pt;color:var(--cin);margin-top:1mm}
.prop{display:flex;height:34mm;border-radius:5mm;overflow:hidden;margin-top:9mm;border:.25mm solid var(--lin)} .prop div{padding:4mm;font-size:14pt;font-weight:500;color:#fff} .prop small{display:block;font-size:8pt;font-weight:400;opacity:.85}
.pares{display:flex;flex-direction:column;gap:2.5mm;justify-content:center} .pares>div{display:flex;gap:6mm;align-items:center;border-radius:4mm;padding:4.5mm 6mm;border:.25mm solid var(--lin)}
.pares b{font-size:24pt;font-weight:500;width:18mm} .pares span{display:block;font-size:10.5pt;font-weight:500} .pares small{font-size:9pt;font-weight:500;opacity:.92}
/* tipografia */
.pesos{display:grid;grid-template-columns:repeat(3,1fr);margin-top:10mm;border-top:.25mm solid var(--lin)} .pesos div{padding:4mm 4mm 0 0;display:flex;flex-direction:column}
.pesos b{font-size:38pt;color:var(--ind);line-height:1.1} .pesos span{font-size:9.5pt;font-weight:500;margin-top:3mm} .pesos small{font-size:8pt;color:var(--cin)}
.spec{border-radius:6mm;padding:12mm;display:flex;flex-direction:column;justify-content:space-between;color:#fff;background:radial-gradient(80% 70% at 90% 10%,rgba(185,179,242,.45) 0,transparent 60%),linear-gradient(160deg,var(--ind) 0%,var(--noite) 100%)}
.spec b{font-size:140pt;font-weight:500;letter-spacing:-.05em;line-height:.9} .spec p{font-size:13pt;line-height:1.6;color:#D8D5E8}
.hier{margin-top:7mm} .hier>div{display:grid;grid-template-columns:62mm 1fr;gap:8mm;align-items:center;padding:3.6mm 0;border-bottom:.25mm solid var(--lin);color:var(--ind)}
.hier b{display:block;font-size:9.5pt;font-weight:500} .hier small{font-size:8pt;color:var(--cin)}
.btn{display:inline-block;background:var(--lar);color:#fff;font-weight:700;font-size:10.5pt;padding:2.6mm 6mm;border-radius:10mm} .etq{display:inline-block;margin-left:3mm;font-size:7.5pt;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--ind);border:.3mm solid var(--ind);padding:1.6mm 3mm;border-radius:10mm}
/* padrão */
.pd{display:grid;grid-template-columns:100mm 1fr;gap:12mm;height:100%} .pd-m{margin-top:9mm} .pd-v{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:3mm}
.pd-v>div{border-radius:5mm;position:relative;overflow:hidden;border:.25mm solid var(--lin)} .pd-v span{position:absolute;left:3mm;bottom:3mm;font-size:7.5pt;font-weight:500;background:#fff;color:var(--ind);padding:1.2mm 2.8mm;border-radius:10mm}
.pd-full{position:absolute;inset:0;background-size:64mm auto;opacity:.9;-webkit-mask-image:linear-gradient(100deg,transparent 15%,#000 70%)}
.pd-txt{position:absolute;left:20mm;bottom:30mm;z-index:2;max-width:120mm}
/* tom */
.tom{display:grid;grid-template-columns:repeat(3,1fr);gap:10mm;margin-top:10mm} .tom>div{border-top:.6mm solid var(--ind);padding-top:4mm;display:flex;flex-direction:column}
.tom b{font-size:16pt;font-weight:500;letter-spacing:-.02em;color:var(--ind)} .tom p{font-size:9pt;line-height:1.5;color:var(--cin);margin:2mm 0 5mm;min-height:10mm}
.tom small{font-size:7pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--ind);margin-bottom:1.5mm} .tom small.x{color:var(--larf);margin-top:4mm}
.tom q{font-size:11pt;line-height:1.4;color:var(--ind);quotes:"«" "»"} .tom s{font-size:9.5pt;line-height:1.4;color:var(--cin);text-decoration-color:var(--larf)}
.frm{margin-top:12mm;background:var(--mar);border-radius:5mm;padding:6mm 8mm;font-size:12pt;color:var(--ind)} .frm small{display:block;font-size:7pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--larf);margin-bottom:2mm}
.cts{display:grid;grid-template-columns:1fr 1fr;gap:9mm;align-content:center;font-size:12pt;line-height:1.5;color:var(--ind)} .cts small{display:block;font-size:7.5pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--larf);margin-bottom:1.5mm} .cts .nota{grid-column:span 2}
.ct-g{margin-top:14mm;line-height:0} .fim{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10mm} .fim p{font-size:15pt;color:#D8D5E8}'''.replace('@@GRAO@@', GRAO)

def rodape(i, cls, sec):
    if 'grad' in cls or 'escura' in cls:
        return '' if 'canto d' in paginas[i - 1][0] else f'<div class="canto d">{i:02d}</div>'
    return f'<div class="rod"><span><b>Kingdom Company</b> · Manual de marca{" · " + sec if sec and sec != "Índice" else ""}</span><span>{i:02d}</span></div>'
corpo = ''.join(f'<section class="pag {c}">{h}{rodape(i + 1, c, s)}</section>' for i, (h, c, s) in enumerate(paginas))
html = f'''<!DOCTYPE html><html lang="pt"><head><meta charset="UTF-8"><title>Kingdom Company · Manual de marca</title>
<link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&display=swap" rel="stylesheet"><style>{CSS}</style></head><body>{corpo}</body></html>'''

tmp = tempfile.mkdtemp(); h = os.path.join(tmp, 'brandbook.html'); open(h, 'w').write(html)
png = '' if not pasta_png else f'''
await p.setViewportSize({{ width: 1123, height: 794 }}); const n = await p.locator("section").count();
for (let i = 0; i < n; i++) await p.locator("section").nth(i).screenshot({{ path: "{pasta_png}/pagina-" + String(i + 1).padStart(2, "0") + ".png" }});'''
if pasta_png:
    os.makedirs(pasta_png, exist_ok=True); open(os.path.join(pasta_png, 'brandbook.html'), 'w').write(html)   # cópia para revisão
js = f'''import {{ createRequire }} from "module"; const require = createRequire("/opt/node22/lib/node_modules/");
const {{ chromium }} = require("playwright"); const b = await chromium.launch(); const p = await b.newPage();
await p.goto("file://{h}", {{ waitUntil: "networkidle" }}); await p.evaluate(() => document.fonts.ready);
await p.pdf({{ path: "{saida}", width: "297mm", height: "210mm", printBackground: true, preferCSSPageSize: true }});{png}
await b.close();'''
open(os.path.join(tmp, 'r.mjs'), 'w').write(js); subprocess.run(['node', os.path.join(tmp, 'r.mjs')], check=True)
print('ok', saida, len(paginas), 'páginas')
