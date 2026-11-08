"""Confirma as dependências da skill e diz como instalar o que falta."""
import importlib, shutil, subprocess

falta = []
for mod, pip in (('numpy', 'numpy'), ('scipy', 'scipy'), ('skimage', 'scikit-image'), ('shapely', 'shapely'), ('PIL', 'pillow'),
                 ('fontTools', 'fonttools'), ('uharfbuzz', 'uharfbuzz'), ('pathops', 'skia-pathops')):
    try: importlib.import_module(mod)
    except Exception: falta.append(f'pip install {pip}')
if not shutil.which('node'): falta.append('instalar Node.js 18+')
else:
    raiz = subprocess.run(['npm', 'root', '-g'], capture_output=True, text=True).stdout.strip()
    ok = subprocess.run(['node', '-e', f'require("{raiz}/playwright")'], capture_output=True).returncode == 0
    if not ok: falta.append('npm install -g playwright && npx playwright install chromium')
if not shutil.which('pdftoppm'): print('opcional: poppler-utils (pdftoppm) para verificar o PDF')
print('tudo pronto' if not falta else 'falta:\n  ' + '\n  '.join(falta))
print('nota: a carta em PowerPoint instala pptxgenjs sozinha (ou definir NODE_PATH com pptxgenjs).')
