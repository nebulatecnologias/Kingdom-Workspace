"""Gera as páginas curtas dos livros O Criativo, O Prisma e O Bloqueio
a partir da estrutura do Escala Previsível (escala/index.html + escala/escala.css).

Cada livro guarda o cabeçalho do seu index.html (meta, fontes), o seu sprite de
ícones e as suas cores; o resto vem do Escala, com as cores trocadas.

Correr na raiz do repositório:  python3 tools/livros-v2/gera.py
"""
import re
from pathlib import Path
from string import Template

from dados import LIVROS

RAIZ = Path(__file__).resolve().parents[2]
ESCALA_CSS = (RAIZ / "escala/escala.css").read_text()
ESCALA_HTML = (RAIZ / "escala/index.html").read_text()

# Cores do Escala que mudam em cada livro (RGB sem parênteses e hex).
CHAVES_RGB = {
    "0,189,54": "vivo", "0,52,26": "tinta_claro", "2,29,16": "preto",
    "0,114,65": "medio", "247,251,248": "texto_escuro", "236,246,239": "tinta_escuro",
    "243,247,242": "branco",
}
CHAVES_HEX = {"#F7FBF8": "texto_escuro_hex", "#C3DCCB": "texto2_escuro_hex", "#0A8A45": "borda_destaque"}

LOGOS = re.search(r'(    <symbol id="i-escudo".*?)\n  </defs>', ESCALA_HTML, re.S).group(1)


def css(livro, d):
    proprio = (RAIZ / d / f"{d}.css").read_text()
    topo = proprio[: proprio.index(":focus-visible")]
    if "Página curta" not in topo:
        topo = topo.replace("   Dois contextos:",
                            "   Página curta, pensada primeiro para o telemóvel (mesma estrutura do Escala Previsível).\n   Dois contextos:")
    corpo = ESCALA_CSS[ESCALA_CSS.index(":focus-visible"):]
    for k, v in CHAVES_RGB.items():
        corpo = corpo.replace(f"rgba({k},", f"rgba({livro['cores'][v]},")
    for k, v in CHAVES_HEX.items():
        corpo = corpo.replace(k, livro["cores"][v])
    extra = """
/* ============ próprio deste livro ============ */
.nome-curto{ display:none; }
@media (max-width:560px){ .barra .nome-longo{ display:none; } .barra .nome-curto{ display:inline; } }
.marca .selo-escala{ box-shadow:inset 0 0 0 1px rgba(%(vivo)s,.4); }
.claro .pilula svg{ color:#fff; }
.tipos.duas{ grid-template-columns:1fr 1fr; }
.mentor-seccao{ padding-bottom:130px; }
@media (max-width:720px){ .mentor-seccao{ padding-bottom:88px; } }
""" % livro["cores"]
    return topo + corpo + extra


def sprite(d, corpo_html):
    html = (RAIZ / d / "index.html").read_text()
    bloco = html[html.index('<svg width="0"'): html.index("</svg>", html.index('<svg width="0"')) + 6]
    simbolos = re.findall(r'(    <symbol id="([^"]+)".*?</symbol>)\n', bloco, re.S)
    usados = set(re.findall(r'href="#([a-z]-[a-z0-9-]+)"', corpo_html))
    manter = [s for s, i in simbolos if i in usados and not i.startswith("l-") and i != "i-escudo"]
    faltam = usados - {i for s, i in simbolos} - {"i-escudo", "l-google", "l-anthropic", "l-semrush", "l-wix"}
    assert not faltam, f"{d}: ícones em falta {faltam}"
    return ('<svg width="0" height="0" style="position:absolute" aria-hidden="true">\n  <defs>\n'
            + "\n".join(manter) + "\n" + LOGOS + "\n  </defs>\n</svg>\n\n")


def lista(itens, tpl):
    return "\n".join(tpl % i for i in itens)


def corpo(livro):
    L = dict(livro)
    L["dores_html"] = lista(livro["dores"], '      <li class="revela"><svg><use href="#%s"/></svg><span>%s</span></li>')
    ganhos = []
    for g in livro["ganhos"]:
        if isinstance(g, tuple):
            ganhos.append(f'        <li class="chave"><svg><use href="#i-check-circle"/></svg><span>{g[0]} <small>{g[1]}</small></span></li>')
        else:
            ganhos.append(f'        <li><svg><use href="#i-check-circle"/></svg><span>{g}</span></li>')
    L["ganhos_html"] = "\n".join(ganhos)
    L["tipos_html"] = lista(livro["extra_itens"], '          <li><svg><use href="#%s"/></svg>%s</li>')
    L["tipos_classe"] = "tipos duas" if len(livro["extra_itens"]) > 5 else "tipos"
    L["provas_html"] = lista(livro["provas"], "      <div><dt>%s</dt><dd>%s</dd></div>")
    L["bio_html"] = lista(livro["bio"], '        <p class="entrada">%s</p>')
    L["pacote_itens_html"] = lista(livro["pacote_itens"], '          <li><svg><use href="#i-check"/></svg>%s</li>')
    L["livro_itens_html"] = lista(livro["livro_itens"], '          <li><svg><use href="#i-check"/></svg>%s</li>')
    L["perguntas_html"] = "\n".join(
        f'      <div class="pergunta-item">\n        <button type="button" aria-expanded="false">{q}<span class="mais" aria-hidden="true"></span></button>\n'
        f'        <div class="resposta"><div><p>{r}</p></div></div>\n      </div>' for q, r in livro["perguntas"])
    return Template((Path(__file__).parent / "molde.html").read_text()).substitute(L)


def cabeca(d):
    html = (RAIZ / d / "index.html").read_text()
    topo = html[: html.index('<svg width="0"')]
    topo = re.sub(r"<!-- (.*?) -->", lambda m: "<!-- " + m.group(1) + "\n     Página curta, pensada primeiro para o telemóvel (gerada por tools/livros-v2/gera.py). -->"
                  if "Página curta" not in m.group(1) else m.group(0), topo, count=1)
    return topo


for d, livro in LIVROS.items():
    c = corpo(livro)
    pagina = cabeca(d) + sprite(d, c) + c
    (RAIZ / d / "index.html").write_text(pagina)
    (RAIZ / d / f"{d}.css").write_text(css(livro, d))
    print(d, "ok", len(pagina), "bytes")
