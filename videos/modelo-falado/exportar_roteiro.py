"""Gera roteiro-locucao.txt e legenda.srt a partir de <video>.mp4.events.json
Uso: python3 exportar_roteiro.py saida/video-ia.mp4
"""
import json, sys, pathlib
mp4 = pathlib.Path(sys.argv[1]); ev = json.loads(pathlib.Path(str(mp4) + '.events.json').read_text())
ev = ev if isinstance(ev, list) else ev.get('events', [])
words = [e for e in ev if e['type'] == 'word']
fmt = lambda t: f"{int(t//3600):02}:{int(t%3600//60):02}:{int(t%60):02},{int(round((t%1)*1000)):03}"
# blocos de legenda: quebra em pontuação final ou a cada ~6 palavras
blocos, cur = [], []
for w in words:
    cur.append(w)
    lab = w['label'].rstrip('”"’»')
    fim_frase = lab[-1:] in ('.', '?', '!', ':')
    if fim_frase or (lab[-1:] == ',' and len(cur) >= 2) or len(cur) >= 7: blocos.append(cur); cur = []
if cur: blocos.append(cur)
srt = []
for i, b in enumerate(blocos):
    fim = blocos[i + 1][0]['t'] - 0.02 if i + 1 < len(blocos) else b[-1]['t'] + 1.2
    srt.append(f"{i+1}\n{fmt(b[0]['t'])} --> {fmt(fim)}\n{' '.join(w['label'] for w in b)}\n")
out = mp4.with_suffix('')
pathlib.Path(f"{out}-legenda.srt").write_text('\n'.join(srt), encoding='utf-8')
linhas = [f"[{int(b[0]['t']//60)}:{b[0]['t']%60:05.2f}]  {' '.join(w['label'] for w in b)}" for b in blocos]
pathlib.Path(f"{out}-roteiro-locucao.txt").write_text(
    "ROTEIRO PARA LOCUÇÃO — cada linha começa no tempo indicado (min:seg)\n"
    "Ritmo do vídeo: ~2,8 palavras por segundo.\n\n" + '\n'.join(linhas) + '\n', encoding='utf-8')
print(f"{out}-legenda.srt\n{out}-roteiro-locucao.txt")
