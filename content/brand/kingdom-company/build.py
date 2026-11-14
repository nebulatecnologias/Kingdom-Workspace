# Gera templates.html a partir de templates.src.html, com o globo e a estrela vetoriais como <symbol>.
import re, pathlib
here = pathlib.Path(__file__).parent
def simbolo(nome, ficheiro):
    svg = (here / 'assets' / ficheiro).read_text()
    vb = re.search(r'viewBox="([^"]+)"', svg).group(1)
    corpo = re.search(r'<svg[^>]*>(.*)</svg>', svg, re.S).group(1)
    return f'<symbol id="{nome}" viewBox="{vb}">{corpo}</symbol>'
src = (here / 'templates.src.html').read_text()
out = src.replace('{{SIMBOLOS}}', simbolo('globo', 'globo.svg') + simbolo('estrela', 'estrela.svg'))
(here / 'templates.html').write_text(out)
