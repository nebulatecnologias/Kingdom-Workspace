"""Funções partilhadas pelos scripts da skill identidade-visual.

- carregar(cfg): lê o marca.json e resolve caminhos relativos à pasta dele
- Simbolo: lê um SVG de símbolo (um ou vários <path>, fill-rule evenodd) e coloca-o numa caixa
- Letra: converte texto em curvas com uharfbuzz + fontTools (kerning, tracking, sem sobreposições)
- renderizar(...): HTML -> PDF e/ou PNG com o Chromium do Playwright
- svg_para_png(...): exporta SVG para PNG com fundo transparente
"""
import json, os, re, subprocess, tempfile, shutil

# ---------------- configuração ----------------
def carregar(cfg_path):
    cfg = json.load(open(cfg_path))
    cfg['_base'] = os.path.dirname(os.path.abspath(cfg_path))
    return cfg

def caminho(cfg, p):
    if p is None: return None
    return p if os.path.isabs(p) else os.path.normpath(os.path.join(cfg['_base'], p))

def saida(cfg, *partes):
    d = os.path.join(caminho(cfg, cfg.get('saida', 'marca')), *partes)
    os.makedirs(d, exist_ok=True)
    return d

def slug(cfg):
    return cfg.get('slug') or re.sub(r'[^a-z0-9]+', '-', cfg['nome'].lower()).strip('-')

# ---------------- símbolo ----------------
class Simbolo:
    """SVG com viewBox e um ou mais <path d>. Pinta-se numa cor e encaixa-se numa altura."""
    def __init__(self, path):
        s = open(path).read()
        vb = re.search(r'viewBox="([^"]+)"', s)
        if not vb: raise SystemExit(f'{path}: o SVG do símbolo precisa de viewBox')
        self.vx, self.vy, self.vw, self.vh = map(float, vb.group(1).replace(',', ' ').split())
        self.ds = re.findall(r'<path[^>]*?\sd="([^"]+)"', s)
        if not self.ds: raise SystemExit(f'{path}: nenhum <path d="..."> encontrado (converter formas e texto em curvas antes)')
        if 'transform=' in s and '<g' in s:
            print(f'aviso: {path} tem transformações; achatar os caminhos (ex. Inkscape: Caminho > Objeto em caminho) para resultados certos')
    @property
    def proporcao(self): return self.vw / self.vh
    def g(self, x, y, altura, cor=None, op=None):
        """<g> com o símbolo encaixado: canto superior esquerdo em (x, y) e a altura dada"""
        k = altura / self.vh
        fill = f' fill="{cor}"' if cor else ''
        opa = f' fill-opacity="{op}"' if op is not None else ''
        paths = ''.join(f'<path fill-rule="evenodd" d="{d}"/>' for d in self.ds)
        return f'<g{fill}{opa} transform="translate({x:.2f} {y:.2f}) scale({k:.5f}) translate({-self.vx:.2f} {-self.vy:.2f})">{paths}</g>'
    def svg(self, cor, largura=None, altura=None, estilo='', op=None):
        """<svg> autónomo; dar largura OU altura em unidades CSS (ex. '40mm')"""
        if largura and not altura: altura = _escala(largura, 1 / self.proporcao)
        if altura and not largura: largura = _escala(altura, self.proporcao)
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{self.vx} {self.vy} {self.vw} {self.vh}" width="{largura}" height="{altura}" style="{estilo}">'
                f'<g fill="{cor}"{f" fill-opacity={chr(34)}{op}{chr(34)}" if op is not None else ""}>' + ''.join(f'<path fill-rule="evenodd" d="{d}"/>' for d in self.ds) + '</g></svg>')

def _escala(v, f):
    m = re.match(r'([\d.]+)(\D*)', str(v)); return f'{float(m.group(1)) * f:.2f}{m.group(2)}'

# ---------------- texto em curvas ----------------
class Letra:
    def __init__(self, ficheiro):
        import uharfbuzz as hb
        from fontTools.ttLib import TTFont
        try:
            from fontTools.ttLib.removeOverlaps import removeOverlaps
            self.tt = TTFont(ficheiro); removeOverlaps(self.tt)         # contornos sobrepostos dão traços estranhos em curvas
        except Exception:
            self.tt = TTFont(ficheiro)
        self.hb = hb
        self.font = hb.Font(hb.Face(hb.Blob.from_file_path(ficheiro)))
        self.gs = self.tt.getGlyphSet(); self.upem = self.tt['head'].unitsPerEm; self.ordem = self.tt.getGlyphOrder()
        os2 = self.tt['OS/2']
        self.cap = (getattr(os2, 'sCapHeight', 0) or self._altura('H')) / self.upem
        self.xh = (getattr(os2, 'sxHeight', 0) or self._altura('x')) / self.upem
    def _altura(self, ch):
        from fontTools.pens.boundsPen import BoundsPen
        nome = self.tt.getBestCmap().get(ord(ch)); b = BoundsPen(self.gs); self.gs[nome].draw(b); return b.bounds[3]
    def caminho(self, texto, tam, x0, base, tracking=0.0):
        """devolve (d, largura); tracking em em"""
        from fontTools.pens.svgPathPen import SVGPathPen
        from fontTools.pens.transformPen import TransformPen
        hb = self.hb; buf = hb.Buffer(); buf.add_str(texto); buf.guess_segment_properties()
        hb.shape(self.font, buf, {'kern': True, 'liga': False})
        k = tam / self.upem; x = 0; partes = []; n = len(buf.glyph_infos)
        for i, (inf, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
            pen = SVGPathPen(self.gs)
            self.gs[self.ordem[inf.codepoint]].draw(TransformPen(pen, (k, 0, 0, -k, x0 + (x + pos.x_offset) * k, base - pos.y_offset * k)))
            partes.append(pen.getCommands())
            x += pos.x_advance + (tracking * self.upem if i < n - 1 else 0)
        return ' '.join(partes), x * k

# ---------------- cores ----------------
def rgb(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def cmyk(h):
    r, g, b = (v / 255 for v in rgb(h)); k = 1 - max(r, g, b)
    return tuple(round(100 * v) for v in ((1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k), k)) if k < 1 else (0, 0, 0, 100)
def lum(h):
    def c(v):
        v /= 255; return v / 12.92 if v <= .03928 else ((v + .055) / 1.055) ** 2.4
    r, g, b = rgb(h); return .2126 * c(r) + .7152 * c(g) + .0722 * c(b)
def contraste(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True); return (la + .05) / (lb + .05)
def texto_sobre(h):
    """branco ou quase-preto, o que tiver mais contraste com h"""
    return '#FFFFFF' if contraste('#FFFFFF', h) >= contraste('#111111', h) else '#111111'

# ---------------- renderização (Playwright) ----------------
def _require_playwright():
    raiz = os.environ.get('NODE_GLOBAL') or subprocess.run(['npm', 'root', '-g'], capture_output=True, text=True).stdout.strip()
    return f'import {{ createRequire }} from "module"; const require = createRequire("{raiz}/"); const {{ chromium }} = require("playwright");'

def _node(js):
    tmp = tempfile.mkdtemp(); f = os.path.join(tmp, 'r.mjs'); open(f, 'w').write(js)
    try: subprocess.run(['node', f], check=True)
    finally: shutil.rmtree(tmp, ignore_errors=True)

def renderizar(html, pdf=None, largura_mm=297, altura_mm=210, png_seletor=None, png_pasta=None, png_unico=None, escala=1, guardar_html=None):
    """Gera PDF (páginas do tamanho dado) e/ou PNG:
    png_seletor + png_pasta: um PNG por elemento (pagina-01.png...); png_unico: captura de um elemento #folha"""
    tmp = tempfile.mkdtemp(); h = os.path.join(tmp, 'p.html'); open(h, 'w').write(html)
    if guardar_html: shutil.copy(h, guardar_html)
    vw, vh = round(largura_mm / 25.4 * 96), round(altura_mm / 25.4 * 96)
    js = _require_playwright() + f'''
const b = await chromium.launch(); const p = await b.newPage({{ viewport: {{ width: {vw}, height: {vh} }}, deviceScaleFactor: {escala} }});
await p.goto("file://{h}", {{ waitUntil: "networkidle" }}); await p.evaluate(() => document.fonts.ready);'''
    if pdf:
        js += f'\nawait p.pdf({{ path: "{os.path.abspath(pdf)}", width: "{largura_mm}mm", height: "{altura_mm}mm", printBackground: true, preferCSSPageSize: true }});'
    if png_seletor and png_pasta:
        os.makedirs(png_pasta, exist_ok=True)
        js += f'''\nconst n = await p.locator("{png_seletor}").count();
for (let i = 0; i < n; i++) await p.locator("{png_seletor}").nth(i).screenshot({{ path: "{png_pasta}/pagina-" + String(i + 1).padStart(2, "0") + ".png" }});'''
    if png_unico:
        js += f'\nawait p.locator("#folha").screenshot({{ path: "{os.path.abspath(png_unico)}" }});'
    js += '\nawait b.close();'
    try: _node(js)
    finally: shutil.rmtree(tmp, ignore_errors=True)

def svg_para_png(pares):
    """pares = [(caminho_svg, caminho_png, largura_px)]: PNG transparente"""
    itens = json.dumps([[os.path.abspath(a), os.path.abspath(b), int(w)] for a, b, w in pares])
    js = _require_playwright() + f'''
import {{ readFileSync }} from "fs";
const b = await chromium.launch(); const p = await b.newPage();
for (const [s, o, w] of {itens}) {{
  const svg = readFileSync(s, "utf8"); const m = svg.match(/viewBox="[\\d.\\-]+ [\\d.\\-]+ ([\\d.]+) ([\\d.]+)"/); const h = Math.round(w * m[2] / m[1]);
  await p.setViewportSize({{ width: w, height: h }});
  await p.setContent("<style>*{{margin:0}}body{{background:transparent}}</style>" + svg.replace(/width="[^"]*" height="[^"]*"/, `width="${{w}}" height="${{h}}"`));
  await p.screenshot({{ path: o, omitBackground: true, clip: {{ x: 0, y: 0, width: w, height: h }} }});
}}
await b.close();'''
    _node(js)

# ---------------- fontes do Google Fonts ----------------
GOOGLE_FONTS_CSS = 'https://fonts.googleapis.com/css2?family={familia}:wght@{pesos}&display=swap'
def link_fontes(familia, pesos=(400, 500, 700)):
    return GOOGLE_FONTS_CSS.format(familia=familia.replace(' ', '+'), pesos=';'.join(map(str, pesos)))
