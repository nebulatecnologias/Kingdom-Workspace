"""Etapa 9 · Brandbook em PDF, A4 horizontal: capas de secção em gradiente (grão, luz diagonal,
número grande), conteúdo em fundo branco, construção do símbolo e do nome.

Monta só as secções que têm dados em marca.json (ver references/marca-json.md):
  capa, manifesto, índice
  A marca ........ sobre, arquitetura, personalidade, areas + metodo
  O símbolo ...... simbolo_significado, simbolo_passos, construção (automática ou simbolo_construcao), simbolo_detalhe, frase
  O logótipo ..... principal (cotas), construção do nome, versões, ícone e favicon, proteção e mínimos, cores, usos incorretos
  A cor .......... paleta, gradientes, proporção e contraste
  A tipografia ... família, pesos, hierarquia
  O padrão ....... módulo, variações, página inteira (se padroes.py já correu)
  O tom de voz ... tom, modelo
  Aplicações ..... aplicacoes (imagens que o cliente envia)
  Contactos, fecho
Uso: python3 brandbook.py marca.json [--png] [--html]
  --png  guarda uma imagem por página em <saida>/brandbook/paginas/ (para rever)
  --html guarda o HTML ao lado (para o detector do impeccable)
Antes: logotipo.py (e padroes.py, se houver padrão).
"""
import sys, os, re, json, colorsys, base64, io
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comum import carregar, caminho, saida, slug, Simbolo, Letra, renderizar, rgb, cmyk, contraste, texto_sobre, link_fontes

cfg = carregar(sys.argv[1]); S_ = slug(cfg); RAIZ_SAIDA = caminho(cfg, cfg.get('saida', 'marca'))
LOGO = os.path.join(RAIZ_SAIDA, 'logotipo'); PAD = os.path.join(RAIZ_SAIDA, 'padroes')
SIM = Simbolo(caminho(cfg, cfg['simbolo']))
FAM = cfg.get('fontes', {}).get('familia', 'Inter')
NOME = cfg['nome']; SITE = cfg.get('contactos', {}).get('site', ''); VERSAO = cfg.get('versao', 'Versão 1.0')
LG = cfg.get('logotipo', {})

# ---------------- cores ----------------
C = cfg['cores']
IND = C['principal']['hex']; MAR = C.get('fundo', {}).get('hex', '#FAFAF7'); LAR = C.get('acento', {}).get('hex', IND)
TIN = C.get('texto', {}).get('hex', '#1C1A30'); CIN = C.get('texto_secundario', {}).get('hex', '#6A6682'); LIN = C.get('linha', {}).get('hex', '#E8E4DC')
def hls(h): r, g, b = (v / 255 for v in rgb(h)); return colorsys.rgb_to_hls(r, g, b)
def de_hls(h_, l, s): r, g, b = colorsys.hls_to_rgb(h_, max(0, min(1, l)), max(0, min(1, s))); return '#%02X%02X%02X' % tuple(round(v * 255) for v in (r, g, b))
def escurecer(h, f): r, g, b = rgb(h); return '#%02X%02X%02X' % tuple(round(v * (1 - f)) for v in (r, g, b))
hh, ll, ss = hls(IND)
T = cfg.get('gradiente_tons', {})
NOITE = T.get('noite') or de_hls(hh, ll * .38, ss)
LUZ = T.get('luz') or de_hls(hh, .62, min(1, max(ss, .25) * 1.7))
LAV = T.get('lavanda') or de_hls(hh, .83, min(1, max(ss, .25) * 1.5))
MEIO = de_hls(hh, ll * 1.35, min(1, ss * 1.2))
LARF = C.get('acento_texto', {}).get('hex') or (LAR if contraste(LAR, '#FFFFFF') >= 4.5 else escurecer(LAR, .16))
EB_ESCURO = LAR if min(contraste(LAR, NOITE), contraste(LAR, IND)) >= 4.5 else LAV   # etiquetas sobre gradientes
def rgbs(h): return ','.join(map(str, rgb(h)))
def n2(v, c=1): return f'{v:.{c}f}'.replace('.', ',')

# ---------------- peças ----------------
def ficheiro_logo(forma, cor):
    for f in (f'{LOGO}/{S_}-{forma}-{cor}.svg',):
        if os.path.exists(f): return f
    return None
COR_LOGO = next((k for k in (cfg.get('cores_logo') or {'principal': 0}) if k not in ('branco', 'preto')), 'principal')
def logo(forma, cor_hex, w=None, h=None, estilo=''):
    f = ficheiro_logo(forma, COR_LOGO) or ficheiro_logo(forma.replace('-simples', '') if '-simples' in forma else forma + '-simples', COR_LOGO)
    if not f: return ''
    s = open(f).read().strip(); vb = re.search(r'viewBox="([^"]+)"', s).group(1); vw, vh = map(float, vb.split()[2:])
    g = re.sub(r'<g fill="[^"]+"', f'<g fill="{cor_hex}"', s[s.index('<g'):s.rindex('</svg>')], count=1)
    if w and not h: h = f'{float(w[:-2]) * vh / vw:.2f}mm'
    if h and not w: w = f'{float(h[:-2]) * vw / vh:.2f}mm'
    return f'<svg viewBox="{vb}" width="{w}" height="{h}" style="{estilo}">{g}</svg>'
TEM_DESC = bool(cfg.get('descritor'))
def simbolo(cor, tam, estilo='', op=None): return SIM.svg(cor, altura=tam, estilo=estilo, op=op)
def simbolo_grad(tam, id_):
    paths = ''.join(f'<path fill="url(#{id_})" fill-rule="evenodd" d="{d}"/>' for d in SIM.ds)
    lado = float(tam[:-2]); w, h = (lado, lado / SIM.proporcao) if SIM.proporcao > 1 else (lado * SIM.proporcao, lado)   # tam = lado maior
    return (f'<svg viewBox="{SIM.vx} {SIM.vy} {SIM.vw} {SIM.vh}" height="{h:.1f}mm" width="{w:.1f}mm"><defs><linearGradient id="{id_}" x1="0" y1="0" x2="1" y2="1">'
            f'<stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".55" stop-color="{LAV}" stop-opacity=".55"/><stop offset="1" stop-color="{LUZ}" stop-opacity=".12"/></linearGradient></defs>{paths}</svg>')
def peca_svg(f): return Simbolo(caminho(cfg, f))
def destaque(pecas, tam):
    """símbolo em tom claro com as peças pedidas por cima, na cor principal (mesmas coordenadas do símbolo)"""
    d = ''.join(f'<path fill="{IND}" fill-rule="evenodd" d="{x}"/>' for p in pecas for x in peca_svg(p).ds)
    return f'<svg viewBox="{SIM.vx} {SIM.vy} {SIM.vw} {SIM.vh}" height="{tam}" width="{float(tam[:-2]) * SIM.proporcao:.1f}mm">' + ''.join(f'<path fill="{LIN}" fill-rule="evenodd" d="{x}"/>' for x in SIM.ds) + d + '</svg>'
def icone(nome, tam):
    f = f'{LOGO}/{S_}-icone-{nome}.svg'
    return re.sub(r'width="\d+" height="\d+"', f'width="{tam}" height="{tam}"', open(f).read().strip(), count=1) if os.path.exists(f) else ''
ICONES = sorted(re.match(rf'{S_}-icone-(.+)\.svg', os.path.basename(f)).group(1) for f in os.listdir(LOGO) if f.startswith(f'{S_}-icone-')) if os.path.isdir(LOGO) else []

# ---------------- construção automática do símbolo ----------------
def construcao_auto():
    vx, vy, vw, vh = SIM.vx, SIM.vy, SIM.vw, SIM.vh; cx, cy = vx + vw / 2, vy + vh / 2; m = max(vw, vh) * .06
    passo = max(vw, vh) / 16; l = []
    for k in np.arange(vx, vx + vw + 1e-6, passo): l.append(f'<line x1="{k:.1f}" y1="{vy}" x2="{k:.1f}" y2="{vy + vh}" stroke="var(--clara2)" stroke-width="{vw / 900:.2f}"/>')
    for k in np.arange(vy, vy + vh + 1e-6, passo): l.append(f'<line x1="{vx}" y1="{k:.1f}" x2="{vx + vw}" y2="{k:.1f}" stroke="var(--clara2)" stroke-width="{vw / 900:.2f}"/>')
    sw = max(vw, vh) / 380
    l.append(f'<line x1="{vx}" y1="{vy}" x2="{vx + vw}" y2="{vy + vh}" stroke="{LUZ}" stroke-width="{sw}" stroke-dasharray="{sw * 4} {sw * 4}"/><line x1="{vx + vw}" y1="{vy}" x2="{vx}" y2="{vy + vh}" stroke="{LUZ}" stroke-width="{sw}" stroke-dasharray="{sw * 4} {sw * 4}"/>')
    l.append(f'<line x1="{cx}" y1="{vy - m}" x2="{cx}" y2="{vy + vh + m}" stroke="{LUZ}" stroke-width="{sw}"/><line x1="{vx - m}" y1="{cy}" x2="{vx + vw + m}" y2="{cy}" stroke="{LUZ}" stroke-width="{sw}"/>')
    l.append(f'<circle cx="{cx}" cy="{cy}" r="{min(vw, vh) / 2}" fill="none" stroke="{LUZ}" stroke-width="{sw}" stroke-dasharray="{sw * 2} {sw * 3}"/>')
    l.append(f'<rect x="{vx}" y="{vy}" width="{vw}" height="{vh}" fill="none" stroke="{IND}" stroke-width="{sw * 1.2}"/>')
    l.append(''.join(f'<path fill="{IND}" fill-opacity=".1" stroke="{IND}" stroke-width="{sw * 1.3}" fill-rule="evenodd" d="{d}"/>' for d in SIM.ds))
    for x, y in ((vx, vy), (vx + vw, vy), (vx, vy + vh), (vx + vw, vy + vh), (cx, cy), (cx, vy), (cx, vy + vh), (vx, cy), (vx + vw, cy)):
        l.append(f'<circle cx="{x}" cy="{y}" r="{sw * 3.2}" fill="#fff" stroke="{LAR}" stroke-width="{sw * 1.4}"/>')
    return f'<svg viewBox="{vx - m} {vy - m} {vw + 2 * m} {vh + 2 * m}" width="150mm" height="{150 / SIM.proporcao:.1f}mm" style="max-height:150mm">{"".join(l)}</svg>'

def construcao_overlay(f, com_simbolo=True, claro=False):
    """overlay nas mesmas coordenadas do símbolo; o símbolo é desenhado por baixo, em tom suave.
    O overlay pode usar var(--ind), var(--lar), var(--luz), var(--clara2)."""
    s = open(caminho(cfg, f)).read(); corpo = s[s.index('>', s.index('<svg')) + 1:s.rindex('</svg>')]
    vb = re.search(r'viewBox="([^"]+)"', s).group(1)
    base = ''.join(f'<path fill="{"#fff" if claro else IND}" fill-opacity="{".16" if claro else ".08"}" fill-rule="evenodd" d="{d}"/>' for d in SIM.ds) if com_simbolo else ''
    return f'<svg viewBox="{vb}" width="150mm" height="150mm" overflow="visible">{base}{corpo}</svg>'

# ---------------- construção do nome ----------------
def construcao_nome():
    f = caminho(cfg, cfg['fontes']['logotipo']); L = Letra(f)
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.transformPen import TransformPen
    from fontTools.pens.boundsPen import BoundsPen
    palavra = NOME.split()[0] if len(NOME.split()[0]) >= 4 else NOME
    hb = L.hb; buf = hb.Buffer(); buf.add_str(palavra); buf.guess_segment_properties(); hb.shape(L.font, buf, {'kern': True, 'liga': False})
    x = 0; partes = []; pontos = []; alcas = []; inicios = []; tr = LG.get('tracking', -0.02) * L.upem
    escolhidas = {0, len(palavra) // 2, len(palavra) - 1}
    for i, (inf, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
        pen = SVGPathPen(L.gs); L.gs[L.ordem[inf.codepoint]].draw(TransformPen(pen, (1, 0, 0, -1, x + pos.x_offset, 0)))
        d = pen.getCommands(); partes.append(d); inicios.append(x)
        if i in escolhidas:
            ant = None
            for seg in re.findall(r'[MLQTCZ][^MLQTCZ]*', d):
                nums = [float(n) for n in re.findall(r'-?\d+\.?\d*', seg[1:])]; pares = list(zip(nums[0::2], nums[1::2]))
                if not pares: continue
                if seg[0] in 'QC' and ant:
                    for c in pares[:-1]: alcas.append((ant, c, pares[-1]))
                ant = pares[-1]; pontos.append(ant)
        x += pos.x_advance + (tr if i < len(buf.glyph_infos) - 1 else 0)
    def bb(ch):
        nome = L.tt.getBestCmap().get(ord(ch))
        if not nome: return None
        b = BoundsPen(L.gs); L.gs[nome].draw(b); return b.bounds
    cap = round(L.cap * L.upem); xh = round(L.xh * L.upem); asc = round((bb('d') or (0, 0, 0, cap))[3]); desc = round((bb('g') or bb('p') or (0, -L.upem * .2, 0, 0))[1])
    W = x; u = L.upem / 1000; lin = []
    perto = abs(asc - cap) <= 70 * u                      # etiquetas com 58 de corpo: abaixo de ~70 sobrepõem-se
    alturas = [(-cap, f'Maiúsculas · {cap}' + (f' · ascendentes {asc}' if perto and asc != cap else '') if perto else f'Maiúsculas · {cap}')] + ([] if perto else [(-asc, f'Ascendentes · {asc}')]) + [(-xh, f'Altura-x · {xh}'), (0, 'Linha de base · 0'), (-desc, f'Descendentes · {desc}')]
    if perto and asc != cap: lin.append(f'<line x1="{-120 * u}" y1="{-asc}" x2="{W + 100 * u}" y2="{-asc}" stroke="{LUZ}" stroke-width="{3 * u}" stroke-dasharray="{6 * u} {10 * u}"/>')
    for y, nome in alturas:
        lin.append(f'<line x1="{-120 * u}" y1="{y}" x2="{W + 100 * u}" y2="{y}" stroke="{LUZ}" stroke-width="{5 * u}" stroke-dasharray="{"" if y in (0, -cap) else f"{16 * u} {12 * u}"}"/>'
                   f'<text x="{W + 150 * u}" y="{y + 20 * u}" font-size="{58 * u}" fill="{CIN}" font-family="{FAM}">{nome}</text>')
    for gx in inicios[1:] + [W]:
        lin.append(f'<line x1="{gx:.0f}" y1="{-asc - 120 * u}" x2="{gx:.0f}" y2="{-desc + 120 * u}" stroke="var(--clara2)" stroke-width="{3 * u}"/>')
    for (ax, ay), (cx, cy), (bx, by) in alcas:
        lin.append(f'<path d="M{ax:.0f} {ay:.0f} L{cx:.0f} {cy:.0f} L{bx:.0f} {by:.0f}" fill="none" stroke="{LUZ}" stroke-width="{3 * u}"/><rect x="{cx - 9 * u:.0f}" y="{cy - 9 * u:.0f}" width="{18 * u}" height="{18 * u}" fill="{LUZ}"/>')
    dots = ''.join(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="{13 * u}" fill="#fff" stroke="{LAR}" stroke-width="{5 * u}"/>' for px, py in pontos)
    corpo = ''.join(f'<path d="{d}" fill="{IND}" fill-opacity=".07" stroke="{IND}" stroke-width="{7 * u}"/>' for d in partes)
    peso = cfg.get('fontes', {}).get('peso_logotipo', 500)
    svg = f'<svg viewBox="{-140 * u} {-asc - 160 * u} {W + 1300 * u} {asc - desc + 320 * u}" width="257mm">{corpo}{"".join(lin)}{dots}</svg>'
    return svg, palavra, round(100 * xh / cap), peso

# ---------------- geometria do lockup (igual a logotipo.py) ----------------
def cotas():
    L = Letra(caminho(cfg, cfg['fontes']['logotipo'])); G = 120; Gw = G * SIM.proporcao; S = LG.get('tamanho_horizontal', 60); gap = G / 4
    cap = L.cap * S; _, w = L.caminho(NOME, S, 0, 0, tracking=LG.get('tracking', -0.02))
    if TEM_DESC:
        _, w1 = L.caminho(cfg['descritor'], 10, 0, 0, tracking=0.01); t = 10 * (w - 2) / w1; entre = .42 * S
        base = (G - (cap + entre + L.cap * t)) / 2 + cap
    else:
        t = None; base = (G + cap) / 2
    return dict(G=G, Gw=Gw, gap=gap, x0=Gw + gap, w=w, W=Gw + gap + w + 4, topo=base - cap, base=base, cap=cap, t=t)

# ---------------- páginas ----------------
paginas = []
def pag(html, cls='branca', sec=''): paginas.append([html, cls, sec])
def efeitos(grelha=True, feixes=2):
    f = ''.join(f'<i class="feixe f{k}"></i>' for k in range(1, feixes + 1))
    g = '<i class="gl gv1"></i><i class="gl gv2"></i><i class="gl gh1"></i><i class="gl gh2"></i>' if grelha else ''
    return f'<div class="luz">{f}</div>{g}<div class="grao"></div>'
def cab(sec, titulo, lead=''): return f'<div class="eb">{sec}</div><h2>{titulo}</h2>' + (f'<p class="lead">{lead}</p>' if lead else '')
capitulo = [0]
def capa_seccao(titulo, itens, extra='', cls='grad'):
    capitulo[0] += 1; n = capitulo[0]
    li = ''.join(f'<li>{t}</li>' for t in itens)
    pag(f'''{efeitos()}{extra}<div class="cs"><div class="cs-num">{n:02d}</div>
<div class="cs-txt"><small>Capítulo {n:02d}</small><h1>{titulo}</h1><ul>{li}</ul></div></div>
<div class="canto">{NOME} · Manual de marca</div><div class="canto d">{SITE}</div>''', cls, titulo)
    return f'{n:02d} · {titulo}'

slogan = cfg.get('slogan') or []
# capa
pag(f'''{efeitos(feixes=3)}<div class="capa-g">{simbolo_grad('225mm', 'gcapa')}</div>
<div class="capa-logo">{logo('horizontal', '#FFFFFF', w='112mm')}</div>
<div class="capa-t"><h1>Manual<br>de marca</h1><p>Logótipo e identidade · {VERSAO}</p></div><div class="canto d">{SITE}</div>''', 'grad')
# manifesto
man = cfg.get('manifesto')
if man:
    atr = [a[0] if isinstance(a, list) else a for a in cfg.get('personalidade', {}).get('atributos', [])]
    pag(f'''{efeitos(grelha=False, feixes=1)}<div class="mani"><small>{NOME}</small><h1>{man.get("titulo", "Logótipo e<br>identidade de marca")}</h1><p>{man["texto"]}</p>
<div class="pilulas">{''.join(f'<span>{a}</span>' for a in atr)}</div></div><div class="canto">{cfg.get("contactos", {}).get("cidade", "")}</div><div class="canto d">{SITE}</div>''', 'escura')
pag('@@INDICE@@', 'branca', 'Índice')

# ---- A marca
sobre = cfg.get('sobre'); pers = cfg.get('personalidade'); areas = cfg.get('areas'); metodo = cfg.get('metodo')
if sobre or pers or areas:
    itens = [x for x, ok in (('Quem somos', sobre), ('Personalidade', pers), ('O que fazemos', areas)) if ok]
    sec = capa_seccao('A marca', itens, '<div class="cs-tres">' + simbolo('#FFFFFF', '34mm', op=.1) * 3 + '</div>')
    if sobre:
        arq = cfg.get('arquitetura')
        arq_html = ''
        if arq:
            n = len(arq['marcas']); xs = [55 + i * (290 / max(1, n - 1)) for i in range(n)] if n > 1 else [200]
            ramos = f'M200 70 V118 M{xs[0]} 118 H{xs[-1]} ' + ' '.join(f'M{x} 118 V150' for x in xs)
            txt = ''.join(f'<circle cx="{x}" cy="150" r="{5 if m.get("ativo") else 4}" fill="{LAR if m.get("ativo") else IND}"/><text x="{x}" y="182" text-anchor="middle" font-size="13" font-weight="500" fill="{IND}" font-family="{FAM}">{m["nome"]}</text>'
                          + ''.join(f'<text x="{x}" y="{200 + 13 * j}" text-anchor="middle" font-size="9.5" fill="{CIN}" font-family="{FAM}">{l}</text>' for j, l in enumerate(m.get('linhas', [])))
                          for x, m in zip(xs, arq['marcas']))
            arq_html = (f'<div class="centro"><div class="eb">Arquitetura da marca</div><svg viewBox="-20 0 440 250" width="132mm"><path d="{ramos}" fill="none" stroke="{LIN}" stroke-width="1.4"/>'
                        f'<g transform="translate({200 - 24 * SIM.proporcao} 10)">{SIM.g(0, 0, 48, IND)}</g>{txt}</svg><p class="nota">{arq.get("nota", "")}</p></div>')
        txt = ''.join(f'<p class="txt">{p}</p>' for p in sobre.get('texto', []))
        pag(f'''<div class="cols"><div>{cab(sec, sobre.get("titulo", slogan[0] if slogan else NOME), sobre.get("subtitulo", slogan[1] if len(slogan) > 1 else ""))}{txt}</div>{arq_html}</div>''', 'branca', 'A marca')
    if pers:
        atr = ''.join(f'<div><b>{a[0]}</b><span>{a[1]}</span></div>' for a in pers['atributos'])
        anti = pers.get('anti', [])
        pag(f'''{cab(sec, 'Personalidade', pers.get('lead', 'Os atributos que guiam cada decisão de design e de texto, e aquilo que a marca não quer parecer.'))}
<div class="atr" style="grid-template-columns:repeat({len(pers['atributos'])},1fr)">{atr}</div>''' + (f'<div class="anti"><div class="eb">Anti-referência: o que não queremos parecer</div><ul>{"".join(f"<li>{t}</li>" for t in anti)}</ul></div>' if anti else ''), 'branca', 'A marca')
    if areas:
        ar = ''.join(f'<div><small>{a["nome"]}</small><b>{a.get("titulo", "")}</b><span>{a.get("texto", "")}</span></div>' for a in areas)
        met = ''
        if metodo:
            met = f'<div class="eb e-met">{metodo.get("titulo", "Como trabalhamos")}</div><div class="metodo" style="grid-template-columns:repeat({len(metodo["passos"])},1fr)">' + ''.join(f'<div><i></i><b>{p[0]}</b><span>{p[1]}</span></div>' for p in metodo['passos']) + '</div>'
        pag(f'''{cab(sec, 'O que fazemos')}<div class="areas" style="grid-template-columns:repeat({min(5, len(areas))},1fr)">{ar}</div>{met}''', 'branca', 'A marca')

# ---- O símbolo
sig = cfg.get('simbolo_significado'); passos = cfg.get('simbolo_passos'); cons = cfg.get('simbolo_construcao', {}); det = cfg.get('simbolo_detalhe'); frase = cfg.get('frase')
itens = [x for x, ok in (('Significado', sig), ('Do traço ao símbolo', passos), ('Construção geométrica', True), (det['titulo'] if det else '', det)) if ok]
sec = capa_seccao('O símbolo', itens, f'<div class="cs-arte">{simbolo_grad("190mm", "gc2")}</div>')
if sig:
    tam = '50mm' if len(sig) <= 4 else '40mm'
    pag(f'''{cab(sec, cfg.get("simbolo_titulo", "O símbolo"), cfg.get("simbolo_lead", ""))}
<div class="sigs" style="grid-template-columns:repeat({len(sig)},1fr)">{''.join(f'<div>{destaque(s["pecas"], tam)}<small>{s["elemento"]}</small><b>{s["nome"]}</b><span>{s["texto"]}</span></div>' for s in sig)}</div>''', 'branca', 'O símbolo')
if passos:
    pz = ''.join(f'<div><div class="pz-a">{destaque(p["pecas"], "52mm")}</div><small>{i + 1:02d}</small><b>{p["nome"]}</b><span>{p.get("nota", "")}</span></div>' + ('<i>+</i>' if i < len(passos) - 1 else '') for i, p in enumerate(passos))
    pag(f'''{cab(sec, 'Do traço ao símbolo', cfg.get('simbolo_passos_lead', 'O símbolo constrói-se por passos, sempre com a mesma lógica de traço.'))}<div class="pz">{pz}</div>''', 'clara', 'O símbolo')
arte = construcao_overlay(cons['svg'], cons.get('incluir_simbolo', True)) if cons.get('svg') else construcao_auto()
leg = cons.get('legenda') or [['Caixa', f'{n2(SIM.vw, 0)} × {n2(SIM.vh, 0)} unidades; proporção {n2(SIM.proporcao, 2)}:1.'], ['Eixos', 'Centro, eixos e diagonais a 45° orientam o equilíbrio do desenho.'], ['Círculo', 'Círculo inscrito: referência para a ótica do símbolo em tamanhos pequenos.']]
pag(f'''<div class="cons"><div>{cab(sec, 'Construção geométrica', cons.get('lead', 'O símbolo assente na sua grelha, com os eixos e os pontos de ancoragem.'))}
<ol class="leg">{''.join(f'<li><i>{i + 1}</i><div><b>{n}</b><span>{d}</span></div></li>' for i, (n, d) in enumerate(leg))}</ol></div><div class="cons-arte">{arte}</div></div>''', 'clara', 'O símbolo')
if det:
    dados = ''.join(f'<dt>{k}</dt><dd>{v}</dd>' for k, v in det.get('dados', []))
    pag(f'''{efeitos(grelha=False, feixes=1)}<div class="est"><div class="est-t"><div class="eb claro">{sec}</div><h2 class="branco">{det["titulo"]}</h2><p class="lead claro">{det.get("texto", "")}</p>
{f'<div class="formula">{det["formula"]}</div>' if det.get("formula") else ''}<dl>{dados}</dl></div><div class="est-a">{construcao_overlay(det["svg"], det.get("incluir_simbolo", True), claro=True)}</div></div>''', 'escura', 'O símbolo')
if frase:
    pag(f'''{efeitos(feixes=2)}<div class="frase"><div class="eb claro">{sec}</div><p>{frase}</p></div><div class="frase-g">{simbolo('#FFFFFF', '58mm')}</div>''', 'grad aurora', 'O símbolo')

# ---- O logótipo
sec = capa_seccao('O logótipo', ['Principal', 'Construção do nome', 'Versões', 'Ícone', 'Proteção', 'Cores', 'Usos incorretos'],
                  f'<div class="cs-k">{logo("horizontal-simples", "#FFFFFF", w="300mm")}</div>')
k = cotas(); hz = open(ficheiro_logo('horizontal', COR_LOGO) or ficheiro_logo('horizontal-simples', COR_LOGO)).read(); hz = hz[hz.index('<g'):hz.rindex('</svg>')]
x1 = k['x0'] + k['w']
rel = f'''<svg viewBox="-24 -40 {k['W'] + 48} 210" width="250mm"><g>{hz}</g>
<g stroke="{LAR}" stroke-width="1" fill="none"><line x1="0" y1="-14" x2="{k['Gw']}" y2="-14"/><line x1="{k['Gw']}" y1="-14" x2="{k['x0']}" y2="-14"/><line x1="{k['x0']}" y1="-14" x2="{x1}" y2="-14"/>
<line x1="-10" y1="0" x2="-10" y2="{k['G']}"/><line x1="{x1 + 12}" y1="{k['topo']:.1f}" x2="{x1 + 12}" y2="{k['base']:.1f}"/>
<line x1="{k['x0']}" y1="{k['base']:.1f}" x2="{x1}" y2="{k['base']:.1f}" stroke-dasharray="4 3"/><line x1="{k['x0']}" y1="{k['topo']:.1f}" x2="{x1}" y2="{k['topo']:.1f}" stroke-dasharray="4 3"/></g>
<g font-family="{FAM}" font-size="10" fill="{LARF}" font-weight="700"><text x="{k['Gw'] / 2}" y="-20" text-anchor="middle">G</text><text x="{(k['Gw'] + k['x0']) / 2}" y="-20" text-anchor="middle">G/4</text>
<text x="{(k['x0'] + x1) / 2}" y="-20" text-anchor="middle">{'largura do nome = largura do descritor' if TEM_DESC else 'nome numa só linha'}</text><text x="-15" y="{k['G'] / 2 + 4}" text-anchor="end" font-size="13">G</text><text x="{x1 + 18}" y="{(k['topo'] + k['base']) / 2 + 4}">x</text></g></svg>'''
pag(f'''{cab(sec, 'O logótipo principal', f'O símbolo à esquerda e o nome completo numa só linha, em {FAM}. ' + ('Por baixo, o descritor com a largura exata do nome. ' if TEM_DESC else '') + 'O texto está em curvas: o logótipo fica igual em qualquer computador.')}
<div class="rel">{rel}</div><div class="tres"><div><b>G</b><span>Altura do símbolo e de todo o logótipo.</span></div><div><b>G/4</b><span>Espaço entre o símbolo e o nome.</span></div><div><b>x</b><span>Altura das maiúsculas do nome. Medida da área de proteção.</span></div></div>''', 'branca', 'O logótipo')
svg_nome, palavra, xh_pct, peso = construcao_nome()
pag(f'''{cab(sec, 'Construção do nome', f'{FAM} {peso}, com espaçamento {n2(LG.get("tracking", -0.02) * 100)}%. Os pontos são os pontos das curvas; os quadrados, as alças. As linhas marcam as alturas que a letra respeita.')}
<div class="nome-c">{svg_nome}</div><div class="tres"><div><b>{peso}</b><span>Peso da letra, igual em todo o nome.</span></div><div><b>{n2(LG.get("tracking", -0.02) * 100)}%</b><span>Espaçamento entre letras.</span></div><div><b>{xh_pct}%</b><span>Altura-x em relação às maiúsculas.</span></div></div>''', 'clara', 'O logótipo')
VS = [('horizontal', 'Horizontal', 'A versão principal. Usar sempre que houver espaço.', dict(w='112mm')), ('vertical', 'Vertical', 'Formatos quadrados e altos.', dict(h='38mm'))]
if TEM_DESC: VS += [('horizontal-simples', 'Horizontal simples', 'Sem descritor: cabeçalhos, rodapés, tamanhos pequenos.', dict(w='112mm')), ('vertical-simples', 'Vertical simples', 'Sem descritor.', dict(h='34mm'))]
pag(f'''{cab(sec, 'Versões')}<div class="vers" style="grid-template-rows:repeat({len(VS) // 2},62mm)">{''.join(f'<div>{logo(f, IND, **t)}<p><b>{n}</b>{d}</p></div>' for f, n, d, t in VS)}</div>''', 'branca', 'O logótipo')
ic_html = ''.join(f'<div class="ic-lar">{icone(n, "22mm")}</div>' for n in ICONES[1:2])
fav = os.path.join(LOGO, 'favicon.svg'); favs = ''.join(re.sub(r'width="\d+" height="\d+"', f'width="{t}px" height="{t}px"', open(fav).read().strip(), count=1) for t in (48, 32, 16)) if os.path.exists(fav) else ''
pag(f'''<div class="ic"><div class="ic-t">{cab(sec, 'Símbolo, ícone e favicon', 'Quando a marca já está presente ou o espaço é pequeno, o símbolo aparece sozinho.')}
<dl class="dl"><dt>Símbolo</dt><dd>O símbolo sozinho, numa só cor.</dd><dt>Ícone</dt><dd>Símbolo branco num quadrado de cantos arredondados. App, perfis e redes.</dd><dt>Favicon</dt><dd>O símbolo ocupa quase todo o quadrado, para se ler a 16 px.</dd></dl>
<div class="favs">{favs}<span>48 · 32 · 16 px</span></div></div><div class="ic-a grad">{efeitos(grelha=False, feixes=2)}<div class="vidro">{icone(ICONES[0], "34mm") if ICONES else ""}<div><b>{NOME}</b><span>{" ".join(slogan)}</span></div></div>{ic_html}</div></div>''', 'branca', 'O logótipo')
# proteção e mínimos
xm = k['cap']; W_, H_ = k['W'], k['G']
cx_ = ''.join(f'<rect x="{a:.1f}" y="{b:.1f}" width="{xm:.1f}" height="{xm:.1f}" fill="{LAR}" fill-opacity=".12" stroke="{LAR}" stroke-width="1.2"/><text x="{a + xm / 2:.1f}" y="{b + xm / 2 + 7:.1f}" text-anchor="middle" font-size="20" font-weight="700" fill="{LARF}" font-family="{FAM}">x</text>'
              for a, b in ((-xm, (H_ - xm) / 2), (W_, (H_ - xm) / 2), (k['x0'], -xm), (k['x0'], H_)))
prot = (f'<svg viewBox="{-xm - 6:.1f} {-xm - 6:.1f} {W_ + 2 * xm + 12:.1f} {H_ + 2 * xm + 12:.1f}" width="150mm"><rect x="{-xm:.1f}" y="{-xm:.1f}" width="{W_ + 2 * xm:.1f}" height="{H_ + 2 * xm:.1f}" fill="none" stroke="{LAR}" stroke-width="1.4" stroke-dasharray="6 5"/>'
        f'<rect x="0" y="0" width="{W_:.1f}" height="{H_}" fill="none" stroke="var(--clara2)" stroke-width="1"/>{cx_}{hz}</svg>')
def minimo(com_desc, vertical=False):
    if com_desc and k['t']: f = W_ / k['t']; return round(8 * f / 10) * 10, round(2.12 * f / 5) * 5   # descritor >= 8 px / 6 pt
    S = LG.get('tamanho_horizontal', 60); f = W_ / S; return round(10 * f / 10) * 10, round(2.6 * f / 5) * 5   # nome >= 10 px
MIN = []
for forma, n in (('horizontal', 'Horizontal'), ('horizontal-simples', 'Horizontal simples')):
    if forma == 'horizontal' and not TEM_DESC: continue
    px, mm = minimo('simples' not in forma); MIN.append((forma, n, f'{px} px · {mm} mm', f'{mm}mm'))
mins = ''.join(f'<div><div class="mn-a">{logo(f, IND, w=w)}</div><b>{n}</b><span>{t}</span></div>' for f, n, t, w in MIN) + f'<div><div class="mn-a">{simbolo(IND, "6mm")}</div><b>Símbolo</b><span>16 px · 6 mm</span></div>'
pag(f'''<div class="pt"><div>{cab(sec, 'Proteção e tamanhos mínimos', 'Nada entra na zona à volta do logótipo: pelo menos x livre em todos os lados, em que x é a altura das maiúsculas do nome.')}</div><div class="pt-a">{prot}</div></div>
<div class="eb e-min">Tamanhos mínimos · largura no ecrã e impressa, em tamanho real de impressão</div><div class="mins" style="grid-template-columns:repeat({len(MIN) + 1},auto);justify-content:start;gap:12mm">{mins}</div>''', 'branca', 'O logótipo')
FUNDOS = [(MAR, IND, f'{C["principal"]["nome"]} sobre {C.get("fundo", {}).get("nome", "fundo")}', 'Principal'), (IND, '#FFFFFF', f'Branco sobre {C["principal"]["nome"]}', 'Fundos escuros')]
if LAR != IND and contraste('#FFFFFF', LAR) >= 3: FUNDOS.append((LAR, '#FFFFFF', f'Branco sobre {C["acento"]["nome"]}', 'Destaques'))
FUNDOS += [('#FFFFFF', '#000000', 'Preto sobre branco', 'Impressão a uma cor'), ('#000000', '#FFFFFF', 'Branco sobre preto', 'Gravação e vídeo'), ('grad', '#FFFFFF', 'Branco sobre gradiente', 'Capas e digital')]
fd = ''.join(f'<div class="fd{" grad" if bg == "grad" else ""}" style="{"" if bg == "grad" else f"background:{bg}"}">{efeitos(grelha=False, feixes=1) if bg == "grad" else ""}{logo("horizontal", cor, w="64mm", estilo="position:relative")}<p><b>{n}</b> · {d}</p></div>' for bg, cor, n, d in FUNDOS[:6])
pag(f'''{cab(sec, 'Cores do logótipo', 'Sempre uma só cor.')}<div class="fundos">{fd}</div>''', 'branca', 'O logótipo')
def errado(t):
    sw = simbolo
    if t == 'dois': return f'<div class="row">{sw(LAR if LAR != IND else "#C9C3D8", "11mm")}<span class="wm">{NOME}</span></div>'
    if t == 'acento': return logo('horizontal-simples', LAR, w='50mm')
    if t == 'letra': return f'<div class="row">{sw(IND, "11mm")}<span class="wm" style="font-family:Georgia,serif;font-weight:400">{NOME}</span></div>'
    if t == 'contraste': return logo('horizontal-simples', IND, w='50mm')
    if t == 'prop': return f'<div class="row">{sw(IND, "20mm")}<span class="wm" style="font-size:9pt">{NOME}</span></div>'
    return logo('horizontal-simples', IND, w='36mm' if 'scaleX' in t else '48mm', estilo=t)
ERR = [('transform:scaleX(1.45)', 'Não esticar nem achatar'), ('transform:rotate(-12deg)', 'Não rodar'), ('dois', 'Não usar duas cores')]
ERR += [('acento', f'Não usar {C["acento"]["nome"].lower()} sobre {C["principal"]["nome"]}')] if LAR != IND else [('filter:blur(.4mm)', 'Não desfocar')]
ERR += [('letra', 'Não trocar a letra'), ('filter:drop-shadow(2mm 2mm 1.2mm rgba(0,0,0,.45))', 'Não aplicar sombras ou efeitos'), ('contraste', 'Não usar sem contraste'), ('prop', 'Não mudar a proporção')]
cls = {'acento': ' e-ind', 'contraste': ' e-esc'}
pag(f'''{cab(sec, 'Usos incorretos', 'O logótipo usa-se sempre a partir dos ficheiros originais, sem alterações.')}
<div class="erros">{''.join(f'<div class="er{cls.get(t, "")}"><div class="er-a">{errado(t)}</div><p><i>×</i>{n}</p></div>' for t, n in ERR)}</div>''', 'branca', 'O logótipo')

# ---- A cor
grads = cfg.get('gradientes')
sec = capa_seccao('A cor', ['A paleta'] + (['Gradientes'] if grads else []) + ['Proporção e contraste'], cls='grad brasa' if LAR != IND else 'grad')
def valores(h): r, g, b = rgb(h); c, m_, y, k_ = cmyk(h); return f'HEX {h.upper()}<br>RGB {r} {g} {b}<br>CMYK {c} {m_} {y} {k_}'
PAL = [(C['principal'], 'p-big')] + [(C[x], '') for x in ('fundo', 'acento') if x in C] + [(c, '') for c in C.get('apoio', [])]
for x in ('texto', 'texto_secundario', 'linha'):
    if x in C and C[x] not in [p for p, _ in PAL]: PAL.append((C[x], ''))
PAL = PAL[:7]
pag(f'''{cab(sec, 'A paleta', 'Cores principais e de apoio. CMYK aproximado: confirmar com a gráfica numa prova de cor.')}
<div class="mosaico">{''.join(f'<div class="{c}" style="background:{p["hex"]};color:{texto_sobre(p["hex"])}"><b>{p["nome"]}</b><span>{p.get("uso", "")}</span><code>{valores(p["hex"])}</code></div>' for p, c in PAL)}</div>''', 'branca', 'A cor')
if grads:
    gs = ''.join(f'<div><div class="gs" style="background:{g["css"]}"><div class="grao"></div><span>{g["nome"]}</span></div><b>{g["nome"]}</b><code>{g.get("paragens", "")}</code><p>{g.get("uso", "")}</p></div>' for g in grads)
    pag(f'''{cab(sec, 'Gradientes', 'Os gradientes nascem da cor principal e servem de luz de fundo. Levam grão fino; o texto por cima é branco.')}<div class="grads" style="grid-template-columns:repeat({len(grads)},1fr)">{gs}</div>
<p class="nota">Tons só para gradientes: {NOITE}, {LUZ} e {LAV}. Não se usam como cores sólidas nem no logótipo.</p>''', 'branca', 'A cor')
prop = cfg.get('proporcao', [60, 30, 10])
PARES = [('#FFFFFF', IND, f'Branco sobre {C["principal"]["nome"]}'), (TIN, MAR, f'Texto sobre {C.get("fundo", {}).get("nome", "fundo")}'), (CIN, MAR, 'Texto secundário sobre o fundo')]
if LAR != IND: PARES += [(LARF, MAR, f'{C["acento"]["nome"]} (texto) sobre o fundo'), ('#FFFFFF', LAR, f'Branco sobre {C["acento"]["nome"]}')]
par = ''.join(f'<div style="background:{f};color:{t}"><b>Aa</b><div><span>{n}</span><small>{n2(contraste(t, f))}:1 · {"qualquer tamanho" if contraste(t, f) >= 4.5 else ("só texto grande ou a negrito" if contraste(t, f) >= 3 else "não usar para texto")}</small></div></div>' for t, f, n in PARES)
pag(f'''<div class="cols"><div>{cab(sec, 'Proporção e contraste', cfg.get('proporcao_texto', 'O fundo domina, a cor principal dá peso e o acento aparece pouco, onde importa.'))}
<div class="prop"><div style="flex:{prop[0]};background:{MAR};color:{TIN}">{prop[0]}%<small>{C.get("fundo", {}).get("nome", "Fundo")}</small></div><div style="flex:{prop[1]};background:{IND}">{prop[1]}%<small>{C["principal"]["nome"]}</small></div>{f'<div style="flex:{prop[2]};background:{LAR}">{prop[2]}%<small>{C["acento"]["nome"]}</small></div>' if LAR != IND and len(prop) > 2 else ""}</div></div>
<div class="pares">{par}</div></div>''', 'branca', 'A cor')

# ---- A tipografia
sec = capa_seccao('A tipografia', [FAM, 'Hierarquia'], '<div class="cs-aa">Aa</div>', cls='grad aurora')
pesos = cfg.get('fontes', {}).get('pesos', [[400, 'Regular', 'Texto corrido'], [500, 'Medium', 'Títulos, nome, números'], [700, 'Bold', 'Botões e etiquetas']])
pag(f'''<div class="cols"><div>{cab(sec, FAM, cfg.get('fontes', {}).get('nota', 'Uma só família para tudo: logótipo, títulos, texto, botões e documentos.'))}
<div class="pesos" style="grid-template-columns:repeat({len(pesos)},1fr)">{''.join(f'<div><b style="font-weight:{w}">Aa</b><span>{n} {w}</span><small>{u}</small></div>' for w, n, u in pesos)}</div>
<p class="nota">Em documentos do Office, instalar a letra antes de editar.</p></div>
<div class="spec"><b>Aa</b><p>ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>áàâãçéêíóôõú 0123456789 %</p></div></div>''', 'branca', 'A tipografia')
HIER = cfg.get('hierarquia') or [['Título principal', '500 · 64–84 px · −4%', 40, 500, slogan[0] if slogan else NOME], ['Título de secção', '500 · 40–56 px · −3,5%', 25, 500, 'Um título de secção'],
                                 ['Subtítulo', '500 · 22–28 px · −2%', 15, 500, 'Um subtítulo que explica a secção'], ['Texto corrido', '400 · 17–19 px · entrelinha 1,6', 11, 400, 'Texto corrido de exemplo, para mostrar a leitura em parágrafos com a entrelinha certa.'],
                                 ['Botões e etiquetas', '700 · 15–19 px', 10.5, 700, '@botao']]
def amostra(tam, peso, txt):
    if txt == '@botao': return f'<span class="btn">{cfg.get("botao", "Fale connosco")}</span> <span class="etq">Etiqueta</span>'
    ls = '-.04em' if tam >= 30 else ('-.02em' if tam >= 14 else '0')
    return f'<span style="font-size:{tam}pt;font-weight:{peso};letter-spacing:{ls};line-height:{1 if tam >= 30 else 1.6}">{txt}</span>'
pag(f'''{cab(sec, 'Hierarquia')}<div class="hier">{''.join(f'<div><div><b>{n}</b><small>{e}</small></div><div>{amostra(t, p, x)}</div></div>' for n, e, t, p, x in HIER)}</div>''', 'branca', 'A tipografia')

# ---- O padrão
mods = sorted(os.listdir(os.path.join(PAD, 'modulos'))) if os.path.isdir(os.path.join(PAD, 'modulos')) else []
if mods:
    def mod(nome): return f'file://{PAD}/modulos/{nome}'
    escuro = next((m for m in mods if 'ampla' in m and 'branco-sobre-principal' in m), mods[0]); tom = next((m for m in mods if 'tom' in m and 'ampla' in m), escuro)
    sec = capa_seccao('O padrão', ['Módulo', 'Densidades', 'Cores'], f'<div class="pad-capa" style="background-image:url({mod(escuro)})"></div>')
    dens = cfg.get('padrao', {}).get('densidades') or {'densa': [120, .375], 'ampla': [240, .2]}
    Wm, fr = dens.get('ampla', list(dens.values())[-1]); Hm = round(Wm * .8667); peca = Simbolo(caminho(cfg, cfg.get('padrao', {}).get('peca') or cfg['simbolo']))
    alt = Wm * fr; larg = alt * peca.proporcao
    modulo = (f'<svg viewBox="{-Wm * .1} {-Hm * .16} {Wm * 1.2} {Hm * 1.32}" width="98mm"><rect width="{Wm}" height="{Hm}" fill="none" stroke="{LUZ}" stroke-dasharray="5 4"/>'
              f'<g stroke="var(--clara2)" stroke-width=".8"><line x1="{Wm / 4}" y1="0" x2="{Wm / 4}" y2="{Hm}"/><line x1="{3 * Wm / 4}" y1="0" x2="{3 * Wm / 4}" y2="{Hm}"/><line x1="0" y1="{Hm / 4}" x2="{Wm}" y2="{Hm / 4}"/><line x1="0" y1="{3 * Hm / 4}" x2="{Wm}" y2="{3 * Hm / 4}"/></g>'
              f'{peca.g(Wm / 4 - larg / 2, Hm / 4 - alt / 2, alt, IND)}{peca.g(3 * Wm / 4 - larg / 2, 3 * Hm / 4 - alt / 2, alt, IND)}'
              f'<g stroke="{LAR}"><line x1="{Wm / 4}" y1="{Hm * 1.07}" x2="{3 * Wm / 4}" y2="{Hm * 1.07}"/></g><g font-family="{FAM}" font-size="{Wm / 25}" fill="{LARF}" font-weight="700">'
              f'<text x="{Wm / 2}" y="{-Hm * .06}" text-anchor="middle">Módulo {Wm} × {Hm}</text><text x="{Wm / 2}" y="{Hm * 1.15}" text-anchor="middle">{Wm // 2} · meio módulo de avanço</text></g></svg>')
    var = [m for m in mods if 'tom' not in m][:3] + [tom]
    vh = ''.join(f'<div style="background:url({mod(m)}) 0 0/{26 if "ampla" in m else 14}mm auto repeat"><span>{m.split("padrao-")[1].replace("-modulo.svg", "").replace("-", " ")}</span></div>' for m in var)
    pag(f'''<div class="pd"><div>{cab(sec, cfg.get('padrao', {}).get('titulo', 'O padrão'), cfg.get('padrao', {}).get('texto', 'Uma peça do símbolo em fiadas desencontradas, como tijolo: cada fiada avança meio módulo.'))}
<div class="pd-m">{modulo}</div><p class="nota">O módulo repete sem emendas no Figma, Canva ou Illustrator.</p></div><div class="pd-v">{vh}</div></div>''', 'branca', 'O padrão')
    pag(f'''<div class="pd-full" style="background-image:url({mod(tom)})"></div>{efeitos(grelha=False, feixes=2)}
<div class="pd-txt"><div class="eb claro">{sec}</div><h2 class="branco">Tom sobre tom,<br>com luz</h2><p class="lead claro">Sobre o gradiente, o padrão em tom da cor principal cria textura sem competir com o texto.</p></div>''', 'grad', 'O padrão')

# ---- Tom de voz
tom_ = cfg.get('tom')
if tom_:
    sec = capa_seccao('O tom de voz', ['Como escrevemos', 'Contactos'], '<div class="cs-asp">«»</div>')
    pag(f'''{cab(sec, 'Como escrevemos', cfg.get('tom_lead', ''))}
<div class="tom" style="grid-template-columns:repeat({len(tom_)},1fr)">{''.join(f'<div><b>{t["nome"]}</b><p>{t["texto"]}</p><small>Dizemos</small><q>{t["dizemos"]}</q><small class="x">Evitamos</small><s>{t["evitamos"]}</s></div>' for t in tom_)}</div>'''
        + (f'<div class="frm"><small>Parágrafo-modelo</small>{cfg["tom_modelo"]}</div>' if cfg.get('tom_modelo') else ''), 'branca', 'O tom de voz')

# ---- Aplicações (imagens enviadas pelo cliente)
apl = cfg.get('aplicacoes')
if apl:
    sec = capa_seccao('Aplicações', [a.get('legenda', '') for a in apl][:6])
    for a in apl:
        pag(f'''<div class="apl" style="background-image:url(file://{caminho(cfg, a["imagem"])})"></div><div class="apl-leg">{a.get("legenda", "")}</div>''', 'grad', 'Aplicações')

# ---- Contactos e fecho
ct = cfg.get('contactos')
if ct:
    blocos = [('Email', ct.get('email')), ('Telefones', '<br>'.join(ct.get('telefones', []))), ('Morada', '<br>'.join(ct.get('morada', []))), ('Site', ct.get('site'))]
    pag(f'''<div class="cols"><div>{cab(f'{capitulo[0]:02d} · Contactos', 'Contactos oficiais', 'Usar sempre estes contactos em documentos, assinaturas, cartões e redes.')}<div class="ct-g">{simbolo(LIN, "62mm")}</div></div>
<div class="cts">{''.join(f'<div><small>{n}</small>{v}</div>' for n, v in blocos if v)}{f'<p class="nota">{ct["nota"]}</p>' if ct.get('nota') else ''}</div></div>''', 'branca', 'Contactos')
pag(f'''{efeitos(feixes=3)}<div class="fim">{logo('vertical', '#FFFFFF', w='92mm')}<p>{" ".join(slogan)}</p></div><div class="canto">{VERSAO}</div><div class="canto d">{SITE}</div>''', 'grad')

caps = [(i + 1, c[0]) for i, c in enumerate(paginas) if 'cs-num' in c[0]]
nomes = [re.search(r'<h1>(.*?)</h1>', h).group(1) for _, h in caps]
paginas[[i for i, p in enumerate(paginas) if p[0] == '@@INDICE@@'][0]][0] = (
    f'<div class="ix"><div>{cab("Índice", "Neste manual")}<p class="lead">As regras da marca {NOME}: logótipo, cor, letra, padrão e tom de voz. Serve a equipa, os parceiros e qualquer designer que trabalhe com a marca.</p></div><ol>'
    + ''.join(f'<li><i>{j + 1:02d}</i><span>{n}</span><b>{p:02d}</b></li>' for j, ((p, _), n) in enumerate(zip(caps, nomes))) + '</ol></div>')

# ---------------- montagem ----------------
from PIL import Image
rng = np.random.default_rng(7); buf = io.BytesIO(); Image.fromarray((rng.random((240, 240)) * 255).astype('uint8'), 'L').save(buf, 'PNG', optimize=True)
GRAO = 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()
css_base = open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'brandbook.css')).read().replace('@@GRAO@@', GRAO)
ROOT = (f":root{{--fam:'{FAM}';--ind:{IND};--lar:{LAR};--larf:{LARF};--mar:{MAR};--tin:{TIN};--cin:{CIN};--lin:{LIN};--noite:{NOITE};--luz:{LUZ};--lav:{LAV};--meio:{MEIO};"
        f"--clara:{de_hls(hh, .95, min(1, ss * 1.2 + .1))};--clara2:{de_hls(hh, .88, min(1, ss + .1))};--claro-txt:{de_hls(hh, .85, .25)};--claro-txt2:{de_hls(hh, .72, .2)};"
        f"--eb-escuro:{EB_ESCURO};--lav-rgb:{rgbs(LAV)};--lar-rgb:{rgbs(LAR)};--noite-rgb:{rgbs(NOITE)};--luz-rgb:{rgbs(LUZ)}}}\n")
EXTRA = '.apl{position:absolute;inset:0;background:center/cover no-repeat} .apl-leg{position:absolute;left:20mm;bottom:11mm;z-index:2;font-size:9pt;color:#fff;background:rgba(0,0,0,.35);padding:1.6mm 4mm;border-radius:10mm}'
def rodape(i, cls, sec):
    if 'grad' in cls or 'escura' in cls:
        return '' if 'canto d' in paginas[i - 1][0] or 'apl' in paginas[i - 1][0] else f'<div class="canto d">{i:02d}</div>'
    return f'<div class="rod"><span><b>{NOME}</b> · Manual de marca{" · " + sec if sec and sec != "Índice" else ""}</span><span>{i:02d}</span></div>'
corpo = ''.join(f'<section class="pag {c}">{h}{rodape(i + 1, c, s)}</section>' for i, (h, c, s) in enumerate(paginas))
html = f'''<!DOCTYPE html><html lang="pt"><head><meta charset="UTF-8"><title>{NOME} · Manual de marca</title><link href="{link_fontes(FAM)}" rel="stylesheet">
<style>{ROOT}{css_base}{EXTRA}</style></head><body>{corpo}</body></html>'''
OUT = saida(cfg, 'brandbook'); pdf = os.path.join(OUT, f'{S_}-manual-de-marca.pdf')
renderizar(html, pdf=pdf, png_seletor='.pag' if '--png' in sys.argv else None, png_pasta=os.path.join(OUT, 'paginas'),
           guardar_html=os.path.join(OUT, 'brandbook.html') if '--html' in sys.argv else None)
print('ok', pdf, len(paginas), 'páginas')
