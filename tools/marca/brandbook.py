"""Manual de marca da Kingdom Company em PDF (A4 horizontal).
Junta o que está decidido em docs/marca/kingdom-company.md com os ficheiros do logótipo,
do globo e dos padrões. As aplicações entram numa versão seguinte.
Uso: python3 tools/marca/brandbook.py <saida.pdf> [--png <pasta>]   (--png guarda uma imagem por página)"""
import sys, os, re, json, subprocess, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
M = os.path.join(RAIZ, 'docs/marca')
PECAS = json.load(open(os.path.join(M, 'globo/pecas.json')))
saida = os.path.abspath(sys.argv[1])
pasta_png = os.path.abspath(sys.argv[sys.argv.index('--png') + 1]) if '--png' in sys.argv else None
VERSAO = 'Versão 1.0 · Novembro de 2026'

IND, LAR, LARF, MAR, TIN, CIN, LIN = '#2B2850', '#FF521A', '#D63E12', '#FAF9F5', '#1C1A30', '#6A6682', '#E8E4DC'

# ---------- peças gráficas ----------
def logo(nome, cor, w=None, h=None, estilo=''):
    """SVG do logótipo (ficheiro docs/marca/logotipo/<nome>-indigo.svg) na cor pedida"""
    s = open(os.path.join(M, 'logotipo', f'{nome}-indigo.svg')).read().strip()
    vb = re.search(r'viewBox="([^"]+)"', s).group(1); vw, vh = map(float, vb.split()[2:])
    g = s[s.index('<g'):s.rindex('</svg>')].replace(f'fill="{IND}"', f'fill="{cor}"', 1)
    if w and not h: h = f'{float(w[:-2]) * vh / vw:.2f}mm'
    if h and not w: w = f'{float(h[:-2]) * vw / vh:.2f}mm'
    return f'<svg viewBox="{vb}" width="{w}" height="{h}" style="{estilo}">{g}</svg>'

def globo(cor, tam, estilo=''):
    return f'<svg viewBox="0 0 480 480" width="{tam}" height="{tam}" style="{estilo}"><path fill="{cor}" fill-rule="evenodd" d="{PECAS["globo"]}"/></svg>'

def destaque(pecas, tam):
    """globo em tom claro com as peças pedidas por cima, em índigo"""
    d = ''.join(f'<path fill="{IND}" fill-rule="evenodd" d="{PECAS[p]}"/>' for p in pecas)
    return f'<svg viewBox="0 0 480 480" width="{tam}" height="{tam}"><path fill="{LIN}" fill-rule="evenodd" d="{PECAS["globo"]}"/>{d}</svg>'

def icone(cor, tam):
    s = open(os.path.join(M, 'logotipo', f'kingdom-icone-{cor}.svg')).read().strip()
    return re.sub(r'width="\d+" height="\d+"', f'width="{tam}" height="{tam}"', s, count=1)

def favicon(tam):
    s = open(os.path.join(M, 'logotipo', 'favicon.svg')).read().strip()
    return re.sub(r'width="\d+" height="\d+"', f'width="{tam}" height="{tam}"', s, count=1)

# ---------- cores ----------
def rgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
def cmyk(h):
    r, g, b = (v / 255 for v in rgb(h)); k = 1 - max(r, g, b)
    if k >= 1: return (0, 0, 0, 100)
    return tuple(round(100 * v) for v in ((1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k), k))
def lum(h):
    def c(v):
        v /= 255; return v / 12.92 if v <= .03928 else ((v + .055) / 1.055) ** 2.4
    r, g, b = rgb(h); return .2126 * c(r) + .7152 * c(g) + .0722 * c(b)
def contraste(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True); return (la + .05) / (lb + .05)
def num(v): return f'{v:.1f}'.replace('.', ',')

# ---------- páginas ----------
paginas = []
def pagina(corpo, fundo='claro', seccao=''):
    paginas.append((corpo, fundo, seccao))

def cab(eyebrow, titulo, lead=''):
    return f'<div class="eb">{eyebrow}</div><h2>{titulo}</h2>' + (f'<p class="lead">{lead}</p>' if lead else '')

# 1. capa
pagina(f'''<div class="capa">
<div class="capa-globo">{globo('#36325F', '200mm')}</div>
<div class="capa-logo">{logo('kingdom-company-horizontal', '#FFFFFF', w='120mm')}</div>
<div class="capa-tit"><span>Manual de marca</span><small>{VERSAO}</small></div></div>''', 'indigo')

# 2. índice
CAPS = [('A marca', 'Quem somos, o que fazemos e como trabalhamos'), ('O símbolo', 'O globo e o que cada parte significa'),
        ('O logótipo', 'Versões, ícone, área de proteção, tamanhos mínimos, cores e usos incorretos'),
        ('A cor', 'Paleta, proporções e contraste'), ('A tipografia', 'Google Sans e a hierarquia de texto'),
        ('Os padrões', 'Padrões feitos com o globo e a estrela'), ('O tom de voz', 'Como a Kingdom Company escreve'),
        ('Contactos', 'Contactos oficiais e ficheiros da marca')]
idx = ''.join(f'<div class="ix"><b>{i + 1:02d}</b><div><span>{t}</span><small>{d}</small></div></div>' for i, (t, d) in enumerate(CAPS))
pagina(f'''<div class="duas"><div>{cab('Índice', 'O que está neste manual')}
<p class="lead">Este manual reúne as regras da marca Kingdom Company: como usar o logótipo, as cores, a letra e o tom de voz. Serve a equipa, os parceiros e qualquer designer que trabalhe com a marca. As aplicações (papelaria, redes, sinalética) entram numa versão seguinte.</p></div>
<div class="indice">{idx}</div></div>''')

# 3. a marca: quem somos
pagina(f'''<div class="duas"><div>{cab('01 · A marca', 'Um único lugar.', 'Tudo o que precisa para desenvolver o seu negócio.')}
<p class="txt">A Kingdom Company é uma empresa de <b>desenvolvimento empresarial, educação e tecnologia</b>. Trabalhamos com empresas que querem crescer com estratégia, crescimento e gestão: dos documentos que as apresentam à tecnologia que lhes tira trabalho manual, passando pela estratégia, pelo marketing e pelas equipas.</p>
<p class="txt">Temos sede em Maputo, Moçambique.</p></div>
<div class="arq"><div class="eb">Arquitetura da marca</div>
<div class="arq-mae">{globo(IND, '22mm')}<div><b>Kingdom</b><span>Um só símbolo para as três marcas</span></div></div>
<div class="arq-filhos">
<div class="ativo"><b>Kingdom Company</b><span>Desenvolvimento empresarial, educação e tecnologia para empresas</span></div>
<div><b>Kingdom Training</b><span>O braço educacional</span></div>
<div><b>Kingdom Academy</b><span>A plataforma de educação online</span></div></div>
<p class="nota">As três marcas usam o mesmo globo e a mesma letra. O que muda é o nome do braço, numa só linha ao lado do «Kingdom».</p></div></div>''')

# 4. o que fazemos
AREAS = [('Consultoria Estratégica', 'Decisões com base em dados, não em palpites', 'Diagnóstico empresarial, planeamento estratégico, business plans e Business Advising.'),
         ('Desenvolvimento Editorial', 'Documentos que apresentam a sua empresa ao nível do que ela já entrega', 'Perfis corporativos, propostas comerciais e de concursos, identidades visuais e playbooks.'),
         ('Marketing & Vendas', 'Um motor comercial que trabalha todos os meses', 'Posicionamento, canais e processo de vendas: Expert Led Growth, Brand 121 e MediaTrack.'),
         ('Desenvolvimento Tecnológico', 'Tecnologia ao serviço da operação', 'Sites e landing pages, sistemas e automação de processos, inteligência artificial e painéis de gestão.'),
         ('Assessoria Corporativa', 'Equipas preparadas para vender e gerir', 'Treinamento de vendas e atendimento, formação em gestão comercial e marketing.')]
areas = ''.join(f'<div class="area"><small>{n}</small><b>{h}</b><span>{d}</span></div>' for n, h, d in AREAS)
METODO = [('Diagnóstico', 'O que trava o crescimento, dito com clareza e com números.'), ('Estratégia', 'Prioridades, metas, prazos e responsáveis num plano executável.'),
          ('Implementação', 'Fazemos com a equipa, não por ela.'), ('Autonomia', 'O resultado fica na empresa muito depois de entregarmos o trabalho.')]
met = ''.join(f'<div class="passo"><i>{i + 1}</i><b>{n}</b><span>{d}</span></div>' for i, (n, d) in enumerate(METODO))
pagina(f'''{cab('01 · A marca', 'O que fazemos')}
<div class="areas">{areas}</div>
<div class="metodo"><div class="eb">Como trabalhamos: do diagnóstico à autonomia</div><div class="passos">{met}</div></div>''')

# 5. o símbolo: significado
SIG = [(['anel'], 'O círculo', 'Reino', 'A unidade. Tudo o que fazemos começa por juntar as partes do negócio num só lugar.'),
       (['estrela'], 'A estrela', 'Direção', 'O conhecimento. Mostra para onde ir e porquê.'),
       (['eixo', 'equador'], 'Os eixos', 'Estrutura', 'O vertical e o horizontal: a base sólida onde o crescimento assenta.'),
       (['meridianos'], 'Os meridianos', 'Método', 'A metodologia. O caminho feito passo a passo, igual em todas as marcas.')]
sig = ''.join(f'<div class="sig">{destaque(p, "46mm")}<small>{e}</small><b>{n}</b><span>{d}</span></div>' for p, e, n, d in SIG)
pagina(f'''<div class="topo-l">{cab('02 · O símbolo', 'O globo', 'O símbolo é o mesmo nas três marcas Kingdom e tem um só significado, igual para todas. Cada parte do globo diz uma coisa sobre a forma como trabalhamos.')}</div>
<div class="sigs">{sig}</div>''')

# 6. a frase
pagina(f'''<div class="frase"><div class="eb claro">02 · O símbolo</div>
<p>É isto que a Kingdom faz, em todas as suas marcas: dá <em>direção</em>, <em>estrutura</em> e <em>método</em> para crescer com propósito.</p>
<div class="frase-g">{globo('#FFFFFF', '64mm')}</div></div>''', 'indigo')

# 7. logótipo principal e construção
pagina(f'''<div class="topo-l">{cab('03 · O logótipo', 'O logótipo principal', 'O globo à esquerda e o nome completo numa só linha, em Google Sans 500. Por baixo, o descritor com a largura exata do nome. O texto está convertido em curvas: o logótipo fica igual em qualquer computador.')}</div>
<div class="constr"><div class="constr-in">{logo('kingdom-company-horizontal', IND, w='200mm')}
<span class="cota c1"></span><span class="cota c2"></span><span class="cota c3"></span></div>
<div class="legendas"><span><b>Símbolo</b>O globo, com a altura total do logótipo.</span><span><b>Nome</b>«Kingdom Company», Google Sans 500, com o mesmo tamanho e peso nas duas palavras.</span><span><b>Descritor</b>Desenvolvimento Empresarial, Educação e Tecnologia, na largura do nome.</span></div></div>''')

# 8. versões
pagina(f'''{cab('03 · O logótipo', 'Versões')}
<div class="versoes">
<div class="v v-larga">{logo('kingdom-company-horizontal', IND, w='118mm')}<p><b>Horizontal</b>A versão principal. Usar sempre que houver espaço.</p></div>
<div class="v">{logo('kingdom-company-vertical', IND, w='62mm')}<p><b>Vertical</b>Formatos quadrados e altos.</p></div>
<div class="v v-larga">{logo('kingdom-company-horizontal-simples', IND, w='118mm')}<p><b>Horizontal simples</b>Sem descritor: cabeçalhos, rodapés e tamanhos pequenos.</p></div>
<div class="v">{logo('kingdom-company-vertical-simples', IND, w='52mm')}<p><b>Vertical simples</b>Sem descritor.</p></div>
</div>''')

# 9. símbolo, ícone e favicon
pagina(f'''<div class="duas"><div>{cab('03 · O logótipo', 'Símbolo, ícone e favicon', 'Quando a marca já está presente ou o espaço é pequeno, o globo pode aparecer sozinho.')}
<p class="txt"><b>Símbolo:</b> o globo sozinho, em índigo, branco ou preto.<br><b>Ícone:</b> o globo branco num quadrado de cantos arredondados, índigo (principal) ou laranja. Para a app, perfis e redes sociais.<br><b>Favicon:</b> o globo ocupa quase todo o quadrado, para o anel continuar visível a 16 px.</p></div>
<div class="icones"><div class="ic-g">{globo(IND, '52mm')}<small>Símbolo</small></div>
<div class="ic-g">{icone('indigo', '40mm')}<small>Ícone índigo</small></div><div class="ic-g">{icone('laranja', '40mm')}<small>Ícone laranja</small></div>
<div class="ic-g fav"><div>{favicon('48px')}{favicon('32px')}{favicon('16px')}</div><small>Favicon a 48, 32 e 16 px</small></div></div></div>''')

# 10. área de proteção e tamanhos mínimos
x = 43; W, H = 671.44, 120
hz = open(os.path.join(M, 'logotipo/kingdom-company-horizontal-indigo.svg')).read()
hz = hz[hz.index('<g'):hz.rindex('</svg>')]
caixas = ''.join(f'<rect x="{a}" y="{b}" width="{x}" height="{x}" fill="{LAR}" fill-opacity=".14" stroke="{LAR}" stroke-width="1.2"/><text x="{a + x / 2}" y="{b + x / 2 + 7}" text-anchor="middle" font-size="20" font-weight="700" fill="{LARF}" font-family="Google Sans">x</text>'
                 for a, b in ((-x, (H - x) / 2), (W, (H - x) / 2), (150, -x), (150, H)))
prot = (f'<svg viewBox="{-x - 6} {-x - 6} {W + 2 * x + 12} {H + 2 * x + 12}" width="128mm">'
        f'<rect x="{-x}" y="{-x}" width="{W + 2 * x}" height="{H + 2 * x}" fill="none" stroke="{LAR}" stroke-width="1.6" stroke-dasharray="6 5"/>'
        f'<rect x="0" y="0" width="{W}" height="{H}" fill="none" stroke="#C9C3D8" stroke-width="1"/>{caixas}{hz}</svg>')
MIN = [('kingdom-company-horizontal', 'Horizontal', '280 px', '70 mm', '70mm'), ('kingdom-company-horizontal-simples', 'Horizontal simples', '120 px', '30 mm', '30mm'),
       ('kingdom-company-vertical', 'Vertical', '210 px', '55 mm', '55mm'), ('kingdom-company-vertical-simples', 'Vertical simples', '100 px', '25 mm', '25mm')]
mins = ''.join(f'<div class="mn"><div class="mn-a">{logo(f, IND, w=mm)}</div><b>{n}</b><span>{px} · {imp}</span></div>' for f, n, px, imp, mm in MIN)
mins += f'<div class="mn"><div class="mn-a">{globo(IND, "6mm")}</div><b>Símbolo</b><span>16 px · 6 mm</span></div>'
pagina(f'''<div class="duas d-prot"><div>{cab('03 · O logótipo', 'Área de proteção e tamanhos mínimos', 'Nada entra na zona à volta do logótipo. A medida x é a altura do «K» de Kingdom: deixar pelo menos x livre em todos os lados.')}</div>
<div class="prot">{prot}</div></div>
<div class="eb e-min">Tamanhos mínimos (largura no ecrã · largura impressa). Mostrados em tamanho real de impressão.</div><div class="mins">{mins}</div>
<p class="nota n-min">Abaixo do mínimo da versão com descritor, usar a versão simples: o descritor deixa de se ler.</p>''')

# 11. cores do logótipo
FUNDOS = [('fundo-marfim', MAR, IND, 'Índigo sobre marfim', 'Versão principal'), ('fundo-indigo', IND, '#FFFFFF', 'Branco sobre índigo', 'Fundos escuros da marca'),
          ('fundo-laranja', LAR, '#FFFFFF', 'Branco sobre laranja', 'Campanhas e destaques'), ('fundo-branco', '#FFFFFF', '#000000', 'Preto sobre branco', 'Impressão a uma cor'),
          ('fundo-preto', '#000000', '#FFFFFF', 'Branco sobre preto', 'Gravação e vídeo'), ('fundo-foto', None, '#FFFFFF', 'Branco sobre fotografia', 'Só em zonas escuras e calmas')]
fd = ''.join(f'<div class="fd {c}" style="{f"background:{bg}" if bg else ""}">{logo("kingdom-company-horizontal", cor, w="62mm")}<p><b>{n}</b>{d}</p></div>' for c, bg, cor, n, d in FUNDOS)
pagina(f'''{cab('03 · O logótipo', 'Cores do logótipo', 'O logótipo usa sempre uma só cor: índigo, branco ou preto.')}<div class="fundos">{fd}</div>''')

# 12. usos incorretos
ERR = [('transform:scaleX(1.45)', 'Não esticar nem achatar'), ('transform:rotate(-12deg)', 'Não rodar'),
       ('dois', 'Não usar duas cores'), ('laranja', 'Não usar laranja sobre índigo'),
       ('letra', 'Não trocar a letra'), ('filter:drop-shadow(2mm 2mm 1.2mm rgba(0,0,0,.45))', 'Não aplicar sombras ou efeitos'),
       ('contraste', 'Não usar sem contraste'), ('prop', 'Não mudar a proporção entre o globo e o nome')]
def errado(t):
    if t == 'dois':
        return f'<div class="row">{globo(LAR, "11mm")}<span class="wm" style="color:{IND}">Kingdom Company</span></div>'
    if t == 'laranja':
        return logo('kingdom-company-horizontal-simples', LAR, w='50mm')
    if t == 'letra':
        return f'<div class="row">{globo(IND, "11mm")}<span class="wm" style="font-family:Georgia,serif;font-weight:400">Kingdom Company</span></div>'
    if t == 'contraste':
        return logo('kingdom-company-horizontal-simples', '#3A3A46', w='50mm')
    if t == 'prop':
        return f'<div class="row">{globo(IND, "22mm")}<span class="wm" style="font-size:9pt">Kingdom Company</span></div>'
    return logo('kingdom-company-horizontal-simples', IND, w='36mm' if 'scaleX' in t else '48mm', estilo=t)
cls = {'laranja': 'e-ind', 'contraste': 'e-esc'}
er = ''.join(f'<div class="er {cls.get(t, "")}"><div class="er-a">{errado(t)}</div><p><i>×</i>{n}</p></div>' for t, n in ERR)
pagina(f'''{cab('03 · O logótipo', 'Usos incorretos', 'O logótipo usa-se sempre a partir dos ficheiros originais, sem alterações.')}<div class="erros">{er}</div>''')

# 13. paleta
PAL = [('Marfim', MAR, 'Fundo das páginas e documentos', 'tinta'), ('Índigo Kingdom', IND, 'Logótipo, títulos e blocos escuros', 'branco'),
       ('Laranja', LAR, 'Botões, preços e destaques', 'branco')]
APOIO = [('Laranja Fundo', LARF, 'Links e texto laranja pequeno'), ('Tinta', TIN, 'Texto principal'), ('Cinza Índigo', CIN, 'Texto secundário'), ('Linha', LIN, 'Divisórias e contornos'), ('Branco', '#FFFFFF', 'Cartões sobre o marfim')]
def ficha(n, h, uso):
    r, g, b = rgb(h); c, m_, y, k = cmyk(h)
    return f'<b>{n}</b><span>{uso}</span><code>{h}<br>RGB {r} {g} {b}<br>CMYK {c} {m_} {y} {k}</code>'
pal = ''.join(f'<div class="pc" style="background:{h};color:{"#fff" if t == "branco" else TIN}">{ficha(n, h, u)}</div>' for n, h, u, t in PAL)
ap = ''.join(f'<div class="ap"><i style="background:{h}"></i><div>{ficha(n, h, u)}</div></div>' for n, h, u in APOIO)
pagina(f'''<div class="topo-l">{cab('04 · A cor', 'A paleta', 'Três cores principais e quatro de apoio. Os valores CMYK são uma aproximação: confirmar com a gráfica numa prova de cor.')}</div>
<div class="paleta">{pal}</div><div class="apoio">{ap}</div>''')

# 14. proporção e contraste
PARES = [('#FFFFFF', IND, 'Branco sobre índigo'), (TIN, MAR, 'Tinta sobre marfim'), (CIN, MAR, 'Cinza Índigo sobre marfim'),
         (LARF, MAR, 'Laranja Fundo sobre marfim'), ('#FFFFFF', LAR, 'Branco sobre laranja')]
def nivel(c, grande=False):
    return 'Texto de qualquer tamanho' if c >= 4.5 else 'Só texto grande ou a negrito (19 px+)'
par = ''.join(f'<div class="par" style="background:{f};color:{t}"><b>Aa</b><div><span>{n}</span><small>{num(contraste(t, f))}:1 · {nivel(contraste(t, f))}</small></div></div>' for t, f, n in PARES)
pagina(f'''<div class="duas"><div>{cab('04 · A cor', 'Proporção e contraste', 'O marfim domina, o índigo dá peso e o laranja aparece pouco, para chamar a atenção onde importa: botões, preços e destaques.')}
<div class="prop"><div style="flex:60;background:{MAR};color:{TIN}">60%<small>Marfim</small></div><div style="flex:30;background:{IND}">30%<small>Índigo</small></div><div style="flex:10;background:{LAR}">10%<small>Laranja</small></div></div>
<p class="txt">Texto branco sobre laranja só em letra grande ou a negrito, como nos botões. Para links e texto laranja pequeno usa-se o Laranja Fundo. As cinco áreas da empresa não têm cores próprias: distinguem-se por ícones e etiquetas.</p></div>
<div class="pares">{par}</div></div>''')

# 15. tipografia
pesos = ''.join(f'<div class="peso"><b style="font-weight:{w}">Aa</b><span>{n}</span><small>{u}</small></div>' for w, n, u in ((400, 'Regular 400', 'Texto corrido'), (500, 'Medium 500', 'Títulos, nome, números'), (700, 'Bold 700', 'Botões e etiquetas')))
pagina(f'''<div class="duas"><div>{cab('05 · A tipografia', 'Google Sans', 'Uma só família de letra para tudo: logótipo, títulos, texto, botões e documentos. É a mesma em todos os sites do grupo Kingdom.')}
<div class="pesos">{pesos}</div>
<p class="nota">Google Sans é gratuita no Google Fonts. Em documentos do Office, instalar a letra no computador antes de editar.</p></div>
<div class="specimen"><b>Aa</b><p>ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>áàâãçéêíóôõú 0123456789 MT %</p></div></div>''')

# 16. hierarquia
HIER = [('Título principal', '500 · 64–84 px · −4%', '<span style="font-size:40pt;font-weight:500;letter-spacing:-.04em;line-height:1">Um único lugar.</span>'),
        ('Título de secção', '500 · 40–56 px · −3,5%', '<span style="font-size:26pt;font-weight:500;letter-spacing:-.035em">Decisões com base em dados</span>'),
        ('Subtítulo', '500 · 22–28 px · −2%', '<span style="font-size:15pt;font-weight:500;letter-spacing:-.02em">Do diagnóstico à autonomia, com um plano à vista</span>'),
        ('Texto corrido', '400 · 17–19 px · entrelinha 1,6', '<span style="font-size:11pt;line-height:1.6">Analisamos o mercado, o modelo de negócio e os números da sua empresa, e acompanhamos a execução de perto.</span>'),
        ('Números e preços', '500 · 40–64 px · algarismos tabulares', f'<span style="font-size:30pt;font-weight:500;letter-spacing:-.04em;font-variant-numeric:tabular-nums">13 000+ <small style="font-size:11pt;color:{CIN};letter-spacing:0">alunos na Kingdom Academy</small></span>'),
        ('Botões e etiquetas', '700 · 15–19 px', f'<span class="btn">Marcar diagnóstico</span> <span class="etq">Consultoria Estratégica</span>')]
hi = ''.join(f'<div class="hi"><div><b>{n}</b><small>{e}</small></div><div>{x}</div></div>' for n, e, x in HIER)
pagina(f'''{cab('05 · A tipografia', 'Hierarquia')}<div class="hier">{hi}</div>''')

# 17. padrões
PAD = [('grelha', 'branco-sobre-indigo', 'Grelha'), ('alternado', 'indigo-sobre-marfim', 'Alternado'), ('estrela', 'branco-sobre-laranja', 'Estrela'),
       ('mistura', 'branco-sobre-indigo', 'Globo e estrela'), ('grande', 'tom-sobre-indigo', 'Grande, tom sobre tom')]
ESC = {'grelha': 16, 'alternado': 20, 'estrela': 12, 'mistura': 22, 'grande': 46}   # largura do módulo em mm
pd = ''.join(f'<div class="pd" style="background:url(file://{M}/padroes/modulos/kingdom-padrao-{n}-{c}-modulo.svg) 0 0/{ESC[n]}mm auto repeat"><span>{t}</span></div>' for n, c, t in PAD)
pagina(f'''<div class="duas d-pad"><div>{cab('06 · Os padrões', 'Padrões', 'Feitos com o globo e com a estrela (Direção). Servem para fundos, capas, embalagens e redes.')}
<p class="txt">Cores: branco sobre índigo, índigo sobre marfim e branco sobre laranja. O padrão grande também existe em tom sobre tom, para fundos discretos. Nunca laranja sobre índigo.</p>
<p class="nota">Cada padrão tem um módulo que se repete sem emendas, para usar como amostra de padrão no Figma, Canva ou Illustrator.</p></div>
<div class="pads">{pd}</div></div>''')

# 18. tom de voz
TOM = [('Claros', 'Dizemos as coisas pelo nome, em frases curtas. Quem lê percebe à primeira o que fazemos e o que ganha com isso.',
        'Os pedidos, as aprovações e os relatórios a correr sozinhos.', 'Soluções disruptivas de transformação digital 360º.'),
       ('Concretos', 'Falamos de resultados, números, prazos e entregas. Uma promessa vaga não convence um empresário.',
        'Plano de negócios pronto para investidores e bancos.', 'Levamos o seu negócio para o próximo nível.'),
       ('Próximos e respeitosos', 'Escrevemos em português europeu e tratamos o cliente por «a sua empresa». Confiança sem arrogância, sem gíria nem emojis em documentos.',
        'O que trava o crescimento, dito com clareza e com números.', 'Bora escalar o teu negócio!!! 🚀')]
tom = ''.join(f'<div class="tom"><b>{n}</b><p>{d}</p><div class="sim"><small>Dizemos</small>{s}</div><div class="nao"><small>Evitamos</small><s>{e}</s></div></div>' for n, d, s, e in TOM)
pagina(f'''{cab('07 · O tom de voz', 'Como escrevemos', 'A Kingdom Company fala como um consultor experiente fala com um empresário: com clareza, com números e com respeito pelo tempo dele.')}<div class="toms">{tom}</div>''')

# 19. contactos e ficheiros
FICH = [('Logótipo (SVG, PNG)', 'docs/marca/logotipo/'), ('Globo e significado', 'docs/marca/globo/'), ('Padrões', 'docs/marca/padroes/'), ('Decisões de marca', 'docs/marca/kingdom-company.md')]
fi = ''.join(f'<div><b>{n}</b><code>{p}</code></div>' for n, p in FICH)
pagina(f'''<div class="duas"><div>{cab('08 · Contactos', 'Contactos oficiais', 'Usar sempre estes contactos em documentos, assinaturas, cartões e redes.')}
<div class="cts"><div><small>Email</small>contact@kingdomcompany.co.za</div><div><small>Telefones</small>+258 87 664 1836<br>+258 85 1800 920</div>
<div><small>Morada</small>Edifício Millenium Park, Av. Vladimir Lenine, n.º 174<br>Maputo 1106, Moçambique</div><div><small>Site</small>www.kingdomcompany.co.za</div></div>
<p class="nota">A morada da África do Sul (Midrand, Joanesburgo) aparece só no site.</p></div>
<div><div class="eb">Ficheiros da marca</div><div class="fich">{fi}</div>
<p class="nota">Os ficheiros estão no repositório Kingdom-Workspace. Pedir sempre os originais em vez de copiar o logótipo de uma imagem.</p></div></div>''')

# 20. contracapa
pagina(f'''<div class="fim">{logo('kingdom-company-vertical', '#FFFFFF', w='88mm')}
<p>Um único lugar. Tudo o que precisa para desenvolver o seu negócio.</p><small>www.kingdomcompany.co.za · {VERSAO}</small></div>''', 'indigo')

# ---------- HTML ----------
CSS = f'''@page{{size:297mm 210mm;margin:0}} *{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Google Sans',sans-serif;color:{TIN};-webkit-print-color-adjust:exact;print-color-adjust:exact;-webkit-font-smoothing:antialiased}}
.pag{{width:297mm;height:210mm;position:relative;overflow:hidden;page-break-after:always;padding:17mm 20mm 18mm}}
.claro{{background:{MAR}}} .indigo{{background:{IND};color:#fff}}
.rod{{position:absolute;left:20mm;right:20mm;bottom:9mm;display:flex;justify-content:space-between;font-size:7pt;color:{CIN}}} .rod b{{font-weight:500;color:{IND}}}
.eb{{font-size:7.5pt;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:{LARF};margin-bottom:5mm}} .eb.claro{{color:{LAR};background:none}}
h2{{font-size:30pt;font-weight:500;letter-spacing:-.035em;line-height:1.05;color:{IND};text-wrap:balance}}
.lead{{font-size:12.5pt;line-height:1.45;color:{CIN};margin-top:4mm;max-width:150mm}}
.txt{{font-size:10pt;line-height:1.6;margin-top:6mm;max-width:118mm}} .txt b{{font-weight:500;color:{IND}}}
.nota{{font-size:8.5pt;line-height:1.5;color:{CIN};margin-top:6mm;max-width:118mm}}
.duas{{display:grid;grid-template-columns:118mm 1fr;gap:16mm;height:100%}}
/* capa */
.capa{{position:absolute;inset:0}} .capa-globo{{position:absolute;right:-52mm;top:-30mm;line-height:0}} .capa-logo{{position:absolute;left:22mm;top:22mm}}
.capa-tit{{position:absolute;left:22mm;bottom:22mm}} .capa-tit span{{display:block;font-size:44pt;font-weight:500;letter-spacing:-.04em}} .capa-tit small{{display:block;font-size:10pt;color:#B9B6D0;margin-top:3mm}}
/* índice */
.indice{{display:flex;flex-direction:column;justify-content:center;gap:3.2mm}} .ix{{display:flex;gap:6mm;align-items:baseline;padding-bottom:3.2mm;border-bottom:.3mm solid {LIN}}}
.ix b{{font-size:9pt;font-weight:700;color:{LARF};width:8mm;font-variant-numeric:tabular-nums}} .ix span{{display:block;font-size:13pt;font-weight:500;color:{IND}}} .ix small{{font-size:8.5pt;color:{CIN}}}
/* arquitetura */
.arq{{background:#fff;border:.3mm solid {LIN};border-radius:5mm;padding:9mm;align-self:center}}
.arq-mae{{display:flex;gap:5mm;align-items:center;padding-bottom:6mm;border-bottom:.3mm solid {LIN}}} .arq-mae b{{display:block;font-size:20pt;font-weight:500;letter-spacing:-.03em;color:{IND}}} .arq-mae span{{font-size:9pt;color:{CIN}}}
.arq-filhos{{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm;margin-top:6mm}} .arq-filhos div{{padding:4mm;border-radius:3mm;background:{MAR}}} .arq-filhos .ativo{{background:{IND};color:#fff}}
.arq-filhos b{{display:block;font-size:10.5pt;font-weight:500;letter-spacing:-.01em}} .arq-filhos span{{display:block;font-size:8pt;line-height:1.4;margin-top:1.5mm;opacity:.8}}
/* áreas e método */
.areas{{display:grid;grid-template-columns:repeat(5,1fr);gap:4mm;margin-top:9mm}} .area{{background:#fff;border:.3mm solid {LIN};border-radius:4mm;padding:5mm;display:flex;flex-direction:column;gap:2.5mm}}
.area small{{font-size:7pt;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:{LARF}}} .area b{{font-size:11pt;font-weight:500;letter-spacing:-.015em;line-height:1.2;color:{IND}}} .area span{{font-size:8.3pt;line-height:1.45;color:{CIN}}}
.metodo{{margin-top:9mm}} .passos{{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm}} .passo{{display:flex;flex-direction:column;gap:1.5mm;padding-top:4mm;border-top:.6mm solid {IND}}}
.passo i{{font-style:normal;font-size:8pt;font-weight:700;color:{LARF}}} .passo b{{font-size:12pt;font-weight:500;color:{IND}}} .passo span{{font-size:8.5pt;line-height:1.45;color:{CIN}}}
/* significado */
.sigs{{display:grid;grid-template-columns:repeat(4,1fr);gap:6mm;margin-top:10mm}} .sig{{display:flex;flex-direction:column;gap:1.5mm}} .sig svg{{margin-bottom:4mm}}
.sig small{{font-size:7.5pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:{LARF}}} .sig b{{font-size:17pt;font-weight:500;letter-spacing:-.025em;color:{IND}}} .sig span{{font-size:9pt;line-height:1.5;color:{CIN}}}
/* frase */
.frase{{position:absolute;inset:0;padding:24mm 22mm}} .frase p{{font-size:32pt;font-weight:500;letter-spacing:-.035em;line-height:1.15;max-width:175mm;margin-top:10mm}} .frase em{{font-style:normal;color:{LAR}}}
.frase-g{{position:absolute;right:22mm;bottom:22mm;line-height:0}}
/* construção */
.constr{{margin-top:12mm;display:flex;flex-direction:column;align-items:center;gap:10mm}} .constr-in{{position:relative;padding:8mm 10mm;background:#fff;border:.3mm solid {LIN};border-radius:4mm}}
.cota{{position:absolute;border:0 dashed {LAR}}} .c1{{left:10mm;top:4mm;bottom:4mm;width:35.7mm;border-width:0 .3mm}} .c2{{left:54.6mm;right:10mm;top:6.5mm;height:14.5mm;border-width:.3mm 0}} .c3{{left:54.6mm;right:10mm;bottom:6mm;height:7mm;border-width:0 .3mm}}
.legendas{{display:grid;grid-template-columns:repeat(3,1fr);gap:8mm;width:220mm}} .legendas span{{font-size:8.5pt;line-height:1.5;color:{CIN}}} .legendas b{{display:block;font-size:10pt;font-weight:500;color:{IND};margin-bottom:1mm}}
/* versões */
.versoes{{display:grid;grid-template-columns:1.7fr 1fr;gap:4mm;margin-top:8mm}} .v{{background:#fff;border:.3mm solid {LIN};border-radius:4mm;height:58mm;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5mm;position:relative}}
.v p{{position:absolute;left:5mm;bottom:4mm;font-size:8pt;color:{CIN}}} .v p b{{font-weight:500;color:{IND};margin-right:2mm}}
/* ícones */
.icones{{display:grid;grid-template-columns:1fr 1fr;gap:4mm;align-content:center}} .ic-g{{background:#fff;border:.3mm solid {LIN};border-radius:4mm;height:62mm;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4mm}}
.ic-g small{{font-size:8pt;color:{CIN}}} .fav div{{display:flex;gap:6mm;align-items:flex-end}}
/* proteção */
.d-prot{{height:auto;grid-template-columns:100mm 1fr}} .prot{{display:flex;align-items:center;justify-content:center;background:#fff;border:.3mm solid {LIN};border-radius:4mm;padding:6mm}}
.e-min{{margin-top:9mm;margin-bottom:4mm;color:{CIN}}} .mins{{display:grid;grid-template-columns:76mm 38mm 62mm 34mm 1fr;gap:4mm}} .mn{{background:#fff;border:.3mm solid {LIN};border-radius:4mm;padding:5mm;display:flex;flex-direction:column;gap:1mm}}
.mn-a{{height:35mm;display:flex;align-items:center}} .mn b{{font-size:9pt;font-weight:500;color:{IND}}} .mn span{{font-size:8pt;color:{CIN}}} .n-min{{margin-top:4mm}}
/* fundos */
.fundos{{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;margin-top:8mm}} .fd{{height:52mm;border-radius:4mm;display:flex;align-items:center;justify-content:center;position:relative;border:.3mm solid {LIN};overflow:hidden}}
.fd p{{position:absolute;left:4mm;bottom:3mm;font-size:7.5pt;color:{CIN};background:#fff;padding:1.2mm 2.5mm;border-radius:10mm}} .fd p b{{font-weight:500;color:{IND};margin-right:1.5mm}}
.fundo-foto{{background:radial-gradient(120% 90% at 20% 10%,#5b6b7a 0,#2b3440 45%,#151a20 100%)}}
/* erros */
.erros{{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm;margin-top:8mm}} .er{{background:#fff;border:.3mm solid {LIN};border-radius:4mm;overflow:hidden}}
.er-a{{height:40mm;display:flex;align-items:center;justify-content:center;overflow:hidden}} .e-ind .er-a{{background:{IND}}} .e-esc .er-a{{background:#2E2E38}}
.er p{{font-size:8.5pt;padding:3mm 4mm;border-top:.3mm solid {LIN};display:flex;gap:2mm;align-items:center}} .er p i{{font-style:normal;font-weight:700;color:{LARF};font-size:12pt;line-height:1}}
.row{{display:flex;align-items:center;gap:3mm}} .wm{{white-space:nowrap;font-size:13pt;font-weight:500;letter-spacing:-.02em;color:{IND}}}
/* paleta */
.paleta{{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;margin-top:8mm}} .pc{{height:62mm;border-radius:4mm;padding:6mm;display:flex;flex-direction:column;border:.3mm solid {LIN}}}
.pc b,.ap b{{font-size:13pt;font-weight:500;letter-spacing:-.02em}} .pc span,.ap span{{font-size:8.5pt;opacity:.8;margin-top:1mm}} .pc code,.ap code{{font-family:inherit;font-size:8pt;line-height:1.5;margin-top:auto;font-variant-numeric:tabular-nums}}
.apoio{{display:grid;grid-template-columns:repeat(5,1fr);gap:4mm;margin-top:4mm}} .ap{{background:#fff;border:.3mm solid {LIN};border-radius:4mm;padding:4mm;display:flex;flex-direction:column;gap:3mm}}
.ap i{{display:block;height:12mm;border-radius:2.5mm;border:.3mm solid {LIN}}} .ap div{{display:flex;flex-direction:column}} .ap b{{font-size:10pt;color:{IND}}} .ap code{{margin-top:2mm;color:{CIN}}}
/* proporção */
.prop{{display:flex;height:34mm;border-radius:4mm;overflow:hidden;margin-top:8mm;border:.3mm solid {LIN}}} .prop div{{padding:4mm;font-size:14pt;font-weight:500;color:#fff}} .prop small{{display:block;font-size:8pt;font-weight:400;opacity:.85}}
.pares{{display:flex;flex-direction:column;gap:3mm;justify-content:center}} .par{{display:flex;gap:6mm;align-items:center;border-radius:4mm;padding:4.5mm 6mm;border:.3mm solid {LIN}}}
.par b{{font-size:24pt;font-weight:500;width:18mm}} .par span{{display:block;font-size:10.5pt;font-weight:500}} .par small{{font-size:8.5pt;opacity:.85}}
/* tipografia */
.pesos{{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;margin-top:8mm}} .peso{{background:#fff;border:.3mm solid {LIN};border-radius:4mm;padding:5mm;display:flex;flex-direction:column}}
.peso b{{font-size:34pt;color:{IND};line-height:1.1}} .peso span{{font-size:9.5pt;font-weight:500;margin-top:3mm}} .peso small{{font-size:8pt;color:{CIN}}}
.specimen{{background:{IND};color:#fff;border-radius:5mm;padding:12mm;display:flex;flex-direction:column;justify-content:space-between}} .specimen b{{font-size:130pt;font-weight:500;letter-spacing:-.05em;line-height:.9}} .specimen p{{font-size:13pt;line-height:1.6;color:#D8D5E8}}
.hier{{margin-top:7mm;display:flex;flex-direction:column}} .hi{{display:grid;grid-template-columns:62mm 1fr;gap:8mm;align-items:center;padding:3.6mm 0;border-bottom:.3mm solid {LIN};color:{IND}}}
.hi b{{display:block;font-size:9.5pt;font-weight:500}} .hi small{{font-size:8pt;color:{CIN}}}
.btn{{display:inline-block;background:{LAR};color:#fff;font-weight:700;font-size:10.5pt;padding:2.6mm 6mm;border-radius:10mm}} .etq{{display:inline-block;margin-left:3mm;font-size:7.5pt;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:{IND};border:.3mm solid {IND};padding:1.6mm 3mm;border-radius:10mm}}
/* padrões */
.d-pad{{grid-template-columns:96mm 1fr}} .pads{{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:1fr 1fr;gap:4mm;height:150mm}} .pd{{border-radius:4mm;overflow:hidden;position:relative}} .pd:first-child{{grid-row:span 2}}
.pd img{{width:100%;height:100%;object-fit:cover;display:block}} .pd span{{position:absolute;left:3mm;bottom:3mm;font-size:7.5pt;font-weight:500;background:#fff;color:{IND};padding:1.2mm 2.5mm;border-radius:10mm}}
/* tom */
.toms{{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm;margin-top:8mm}} .tom{{background:#fff;border:.3mm solid {LIN};border-radius:4mm;padding:6mm;display:flex;flex-direction:column;gap:3mm}}
.tom b{{font-size:15pt;font-weight:500;letter-spacing:-.02em;color:{IND}}} .tom p{{font-size:9pt;line-height:1.5;color:{CIN};min-height:20mm}}
.sim,.nao{{font-size:9.5pt;line-height:1.4;padding:3.5mm 4mm;border-radius:3mm}} .sim{{background:{IND};color:#fff}} .nao{{background:{MAR};color:{CIN}}} .nao s{{text-decoration-color:{LARF}}}
.sim small,.nao small{{display:block;font-size:7pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:1mm;text-decoration:none}} .sim small{{color:{LAR}}} .nao small{{color:{LARF};display:block}}
/* contactos */
.cts{{display:grid;grid-template-columns:1fr 1fr;gap:6mm;margin-top:8mm;font-size:10.5pt;line-height:1.5;color:{IND}}} .cts small{{display:block;font-size:7.5pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:{LARF};margin-bottom:1mm}}
.fich{{display:flex;flex-direction:column;gap:3mm}} .fich div{{background:#fff;border:.3mm solid {LIN};border-radius:3mm;padding:4mm 5mm;display:flex;justify-content:space-between;align-items:center}}
.fich b{{font-size:10pt;font-weight:500;color:{IND}}} .fich code{{font-size:8.5pt;color:{CIN}}}
.fim{{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10mm;text-align:center}} .fim p{{font-size:15pt;color:#D8D5E8;max-width:150mm}} .fim small{{font-size:8.5pt;color:#9C98B8}}
.topo-l{{max-width:200mm}}'''

def rodape(i, fundo):
    if fundo == 'indigo': return ''
    return f'<div class="rod"><span><b>Kingdom Company</b> · Manual de marca</span><span>{i:02d}</span></div>'
corpo = ''.join(f'<section class="pag {f}">{c}{rodape(i + 1, f)}</section>' for i, (c, f, s) in enumerate(paginas))
html = f'''<!DOCTYPE html><html lang="pt"><head><meta charset="UTF-8"><title>Kingdom Company · Manual de marca</title>
<link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&display=swap" rel="stylesheet"><style>{CSS}</style></head><body>{corpo}</body></html>'''

tmp = tempfile.mkdtemp(); h = os.path.join(tmp, 'brandbook.html'); open(h, 'w').write(html)
png = '' if not pasta_png else f'''
await p.setViewportSize({{ width: 1123, height: 794 }}); const n = await p.locator("section").count();
for (let i = 0; i < n; i++) await p.locator("section").nth(i).screenshot({{ path: "{pasta_png}/pagina-" + String(i + 1).padStart(2, "0") + ".png" }});'''
if pasta_png: os.makedirs(pasta_png, exist_ok=True)
js = f'''import {{ createRequire }} from "module"; const require = createRequire("/opt/node22/lib/node_modules/");
const {{ chromium }} = require("playwright"); const b = await chromium.launch(); const p = await b.newPage();
await p.goto("file://{h}", {{ waitUntil: "networkidle" }}); await p.evaluate(() => document.fonts.ready);
await p.pdf({{ path: "{saida}", width: "297mm", height: "210mm", printBackground: true, preferCSSPageSize: true }});{png}
await b.close();'''
open(os.path.join(tmp, 'r.mjs'), 'w').write(js); subprocess.run(['node', os.path.join(tmp, 'r.mjs')], check=True)
print('ok', saida, len(paginas), 'páginas')
