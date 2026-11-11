#!/usr/bin/env python3
"""Versão para telemóvel do playbook: corre build.py e adapta o HTML (páginas ao alto, sem efeitos pesados)."""
import html, re, runpy
from pathlib import Path
AQUI = Path(__file__).resolve().parent
runpy.run_path(str(AQUI / 'build.py'), run_name='__main__')
s = (AQUI / 'playbook.html').read_text(encoding='utf-8')
REPO = Path('/home/user/Kingdom-Workspace')
img = lambda n: (AQUI / 'img' / n).as_uri()
# efeitos e elementos que pesam ou não fazem sentido no telemóvel
s = re.sub(r'<div class="luz">.*?</div>', '', s)
s = re.sub(r'<img class="globo[^"]*"[^>]*>', '', s)
s = s.replace('<div class="guias"></div>', '')
s = re.sub(r'<header class="topo">.*?</header>', '', s)
s = re.sub(r'<footer class="rodape[^"]*">.*?</footer>', '', s, flags=re.S)
# logótipos em PNG leve
s = re.sub(r'src="file://[^"]*kingdom-company-horizontal-branco\.svg"', f'src="{img("logo-h.png")}"', s)
s = re.sub(r'src="file://[^"]*kingdom-company-vertical-branco\.svg"', f'src="{img("logo-v.png")}"', s)
# capas de secção com âncora; índice com ligações em vez de números de página
s = re.sub(r'<section class="pagina escura capa-sec">(\s*)<div class="capa-sec-in">(.*?)<div class="num">(\d+)</div>',
           lambda m: f'<section class="pagina escura capa-sec" id="s{m.group(3)}">{m.group(1)}<div class="capa-sec-in">{m.group(2)}<div class="num">{m.group(3)}</div>', s, flags=re.S)
s = re.sub(r'<li><span class="in">(\d+)</span><span class="it">(.*?)</span><span class="ip">\d+</span></li>',
           r'<li><a href="#s\1"><span class="in">\1</span><span class="it">\2</span><span class="ir">→</span></a></li>', s)
# tabelas: cada célula leva o título da coluna
def tab(m):
    t = m.group(0)
    heads = [html.unescape(re.sub(r'<[^>]+>', '', h)).strip() for h in re.findall(r'<th>(.*?)</th>', t, re.S)]
    def linha(r):
        k = iter(range(100))
        return re.sub(r'<td>', lambda _: f'<td data-label="{html.escape(heads[next(k)] if heads else "")}">', r.group(0))
    return re.sub(r'<tr>(?:(?!</tr>).)*<td>.*?</tr>', linha, t, flags=re.S)
s = re.sub(r'<table class="tab.*?</table>', tab, s, flags=re.S)
css = (AQUI / 'movel.css').read_text(encoding='utf-8').replace('__FUNDO__', img('capa-fundo.jpg'))
s = re.sub(r'<style>.*?</style>', lambda _: f'<style>{css}</style>', s, flags=re.S)
s = s.replace('<title>Playbook de vendas · Kingdom Company</title>', '<title>Playbook de vendas · Kingdom Company</title><meta name="author" content="Kingdom Company">')
(AQUI / 'movel.html').write_text(s, encoding='utf-8')
print('movel.html', len(s))
