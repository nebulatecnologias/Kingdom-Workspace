"""Legendas pt-PT no estilo do vídeo original: palavras ditas em branco rosado, por dizer em cinzento rosado,
palavras-chave a negrito com brilho. Gera legendas.ass (1080x1920) a partir de audio/vo.words.json."""
import json, re
W = json.load(open('audio/vo.words.json')); P = json.load(open('plan.json')); LEAD = P['lead']
KEY = {'oito','frequência','um','trinta','vago','segurança','dois','noite','direção','três','coração','vinte','coerência','quatro',
       'futuro','ela','identidade','cinco','sol','intenção','luz','seis','noventa','história','sete','metade','devagar','mudas',
       'último','cérebro','guarda','ninguém','mudou','disciplina','tornar','tornar,','mostro-te'}
def clean(w): return re.sub(r'[^\wçãõáéíóúêâôà-]', '', w.lower())
chunks, cur = [], []
def resto_frase(i):
    n = 0
    for x in W[i + 1:]:
        n += 1
        if re.search(r'[.?!:]["”»]?$', x['word']): break
    return n
for i, w in enumerate(W):
    cur.append(w)
    t = w['word']
    fim = re.search(r'[.?!]["”»]?$', t)
    numero = t.endswith(':') and len(cur) == 1
    if numero: continue
    if fim or t.endswith(':') or (t.endswith(',') and len(cur) >= 3 and resto_frase(i) > 2) or (len(cur) >= 7 and resto_frase(i) > 2):
        chunks.append(cur); cur = []
if cur: chunks.append(cur)
merged = chunks
def ts(t):
    t = max(0, t); h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return '%d:%02d:%05.2f' % (h, m, s)
WHITE, MUTED = '&HFCF6FF&', '&H928A96&'
head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Poppins,46,&H00FCF6FF,&H00FCF6FF,&H00FFFFFF,&H00000000,0,0,0,0,100,100,-0.5,0,1,0,0,8,140,140,0,1
Style: Glow,Poppins,46,&H00FCF6FF,&H00FCF6FF,&H00FFFFFF,&H00000000,0,0,0,0,100,100,-0.5,0,1,0,0,8,140,140,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
ev = []
for ci, c in enumerate(merged):
    nxt = merged[ci + 1][0]['start'] + LEAD - .05 if ci + 1 < len(merged) else P['dur']
    end_chunk = min(nxt, c[-1]['end'] + LEAD + .7)
    for wi, w in enumerate(c):
        s = w['start'] + LEAD - .04
        e = c[wi + 1]['start'] + LEAD - .04 if wi + 1 < len(c) else end_chunk
        parts, glow = [], []
        for wj, x in enumerate(c):
            said = wj <= wi; k = clean(x['word']) in KEY
            col = WHITE if said else MUTED
            b = '\\b1' if k else '\\b0'
            parts.append('{%s\\fnPoppins\\1c%s}%s' % (b, col, x['word']))
            if k and said: glow.append('{%s\\1a&H00&\\3a&H90&\\bord5\\blur9\\3c&HFFFFFF&}%s' % (b, x['word']))
            else: glow.append('{%s\\1a&HFF&\\3a&HFF&\\bord0}%s' % (b, x['word']))
        pos = '{\\pos(540,1372)}'
        ev.append('Dialogue: 0,%s,%s,Glow,,0,0,0,,%s%s' % (ts(s), ts(e), pos, ' '.join(glow)))
        ev.append('Dialogue: 1,%s,%s,Cap,,0,0,0,,%s%s' % (ts(s), ts(e), pos, ' '.join(parts)))
open('legendas.ass', 'w').write(head + '\n'.join(ev) + '\n')
print(len(merged), 'blocos;', len(ev), 'eventos')
for c in merged[:6] + merged[-4:]: print(' ', ' '.join(w['word'] for w in c))
