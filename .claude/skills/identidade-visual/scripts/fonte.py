"""Descarrega uma família do Google Fonts em TTF (necessário para pôr o texto em curvas).

Uso: python3 fonte.py "Google Sans" 400 500 700 --pasta fontes
Grava fontes/<familia>-<peso>.ttf. Para letras pagas ou próprias, copiar o .ttf/.otf para a pasta
e apontar marca.json -> fontes.logotipo para ele.
"""
import sys, os, re, urllib.request

args = [a for a in sys.argv[1:] if not a.startswith('--')]
pasta = sys.argv[sys.argv.index('--pasta') + 1] if '--pasta' in sys.argv else 'fontes'
if '--pasta' in sys.argv: args.remove(pasta)
familia, pesos = args[0], args[1:] or ['400', '500', '700']
os.makedirs(pasta, exist_ok=True)
for p in pesos:
    url = f'https://fonts.googleapis.com/css2?family={familia.replace(" ", "+")}:wght@{p}'
    css = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/4.0'})).read().decode()   # UA antigo -> devolve TTF
    m = re.findall(r'url\((https://[^)]+)\)', css)
    if not m: raise SystemExit(f'{familia} {p}: não encontrado no Google Fonts')
    destino = os.path.join(pasta, f'{familia.lower().replace(" ", "-")}-{p}.ttf')
    urllib.request.urlretrieve(m[0], destino); print('ok', destino)
