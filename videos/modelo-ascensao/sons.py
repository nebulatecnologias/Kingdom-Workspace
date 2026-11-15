"""Sintetiza os efeitos sonoros do vídeo a partir das deixas do motor (sem samples, sem internet).

Uso:  python3 sons.py saida/video.mp4            -> saida/video-sfx.wav (só efeitos) e saida/video-mix.wav (efeitos + ambiência)
      python3 sons.py saida/video.mp4 --ambiencia luz     (pad caloroso; padrão: escura; --sem-ambiencia: nenhuma)
Lê <video>.mp4.events.json (eventos type 'sfx', label 'som|ganho|dur|tom').
"""
import json, sys, pathlib, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def t_(d): return np.arange(int(d * SR)) / SR


def exp_dec(n, tau): return np.exp(-np.arange(n) / (tau * SR))


def svf(x, fc, q=0.7, modo='bp'):
    """Filtro de estado variável TPT (Zavalishin): estável em qualquer frequência, corte pode variar por amostra."""
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    g = np.tan(np.pi * np.clip(fc, 20, 0.45 * SR) / SR); k = 1 / q
    a1 = 1 / (1 + g * (g + k)); a2 = g * a1; a3 = g * a2
    ic1 = ic2 = 0.0; out = np.empty_like(x)
    for i in range(len(x)):
        v3 = x[i] - ic2
        v1 = a1[i] * ic1 + a2[i] * v3
        v2 = ic2 + a2[i] * ic1 + a3[i] * v3
        ic1 = 2 * v1 - ic1; ic2 = 2 * v2 - ic2
        out[i] = v1 if modo == 'bp' else v2 if modo == 'lp' else x[i] - k * v1 - v2
    return out


def pan(m, p):  # p -1..1 (constante ou vetor)
    p = np.broadcast_to(np.asarray(p, float), m.shape)
    a = (p + 1) * np.pi / 4
    return np.stack([m * np.cos(a), m * np.sin(a)], 1)


def norm(x, pk=1.0):
    m = np.abs(x).max()
    return x / m * pk if m > 0 else x


# ---------------- sons ----------------
def tique(g, **_):
    n = int(0.014 * SR); e = exp_dec(n, 0.0018)
    f = 2900 * (1 + rng.uniform(-.08, .08))
    m = np.diff(rng.standard_normal(n + 1)) * e * 0.5 + np.sin(2 * np.pi * f * t_(0.014)[:n]) * exp_dec(n, 0.004) * 0.6
    return pan(norm(m) * 0.3 * g, rng.uniform(-.25, .25))


def digitar(g, dur=0.4, **_):
    out = np.zeros((int((dur + 0.05) * SR), 2)); t = 0.0
    while t < dur:
        n = int(0.008 * SR); f = rng.uniform(1700, 2700)
        c = (np.diff(rng.standard_normal(n + 1)) * 0.6 + np.sin(2 * np.pi * f * np.arange(n) / SR)) * exp_dec(n, 0.0016)
        i = int(t * SR); out[i:i + n] += pan(norm(c) * rng.uniform(.5, 1) * 0.22 * g, rng.uniform(-.3, .3))
        t += rng.uniform(0.035, 0.07)
    return out


def ping(g, tom=1318, **_):
    tom = tom or 1318; d = 1.1; tt = t_(d)
    m = (np.sin(2 * np.pi * tom * tt) + .25 * np.sin(2 * np.pi * tom * 2.01 * tt) + .08 * np.sin(2 * np.pi * tom * 3.03 * tt))
    m *= np.exp(-tt / 0.32) * np.minimum(1, tt / 0.003)
    return pan(norm(m) * 0.32 * g, rng.uniform(-.2, .2))


def trava(g, **_):
    out = np.zeros(int(0.25 * SR))
    for k, f in enumerate((1760, 2349)):
        tt = t_(0.06); b = (np.sin(2 * np.pi * f * tt) + .15 * np.sin(2 * np.pi * 3 * f * tt)) * np.exp(-tt / 0.03) * np.minimum(1, tt / 0.002)
        i = int(k * 0.075 * SR); out[i:i + len(b)] += b
    return pan(norm(out) * 0.28 * g, 0)


def pop(g, **_):
    tt = t_(0.12); f = 380 + 360 * np.exp(-tt / 0.025)
    m = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.045) * np.minimum(1, tt / 0.002)
    return pan(norm(m) * 0.5 * g, 0.15)


def graos(dur, envf, dens, faixa=(3000, 9500), amp=0.18):
    """Nuvem de grãos senoidais curtíssimos: o som das partículas."""
    out = np.zeros((int((dur + 0.05) * SR), 2)); n_tot = int(dens * dur)
    ts = []
    while len(ts) < n_tot:
        t = rng.uniform(0, dur)
        if rng.uniform() < envf(t / dur): ts.append(t)
    for t in ts:
        L = rng.uniform(0.004, 0.014); n = int(L * SR); f = rng.uniform(*faixa)
        gr = np.sin(2 * np.pi * f * np.arange(n) / SR) * np.hanning(n) * rng.uniform(.3, 1)
        i = int(t * SR); out[i:i + n] += pan(gr, rng.uniform(-.8, .8))
    return out * amp


def formar(g, dur=1.0, **_):
    dur = dur or 1.0
    env = lambda u: min(1, u / 0.15) * (1 - u) ** 1.3
    gr = graos(dur, env, 260 / max(dur, .4) * min(dur, 1.2))
    n = len(gr); u = np.linspace(0, 1, n)
    hiss = svf(svf(rng.standard_normal(n), 6000, 0.9, 'hp'), 10000, 0.7, 'lp') * np.array([env(x) for x in u[::200]]).repeat(200)[:n] * 0.035
    return (gr + pan(hiss, 0)) * g


def dissolver(g, dur=1.2, **_):
    dur = dur or 1.2
    env = lambda u: min(1, u / 0.05) * (1 - u) ** 2
    gr = graos(dur, env, 300, (2500, 8000))
    n = len(gr); u = np.linspace(0, 1, n)
    w = svf(rng.standard_normal(n), 3500 * (1 - u) + 300, 0.8, 'bp') * np.minimum(1, u / 0.05) * (1 - u) ** 2 * 0.12
    return (gr + pan(w, np.linspace(-.3, .3, n))) * g


def sopro(g, **_):
    d = 0.55; n = int(d * SR); u = np.linspace(0, 1, n)
    env = np.sin(np.pi * u ** 0.7) ** 2
    m = svf(rng.standard_normal(n), 500 + 2600 * np.sin(np.pi * u ** 0.8), 1.1, 'bp') * env
    return pan(norm(m) * 0.22 * g, np.linspace(-.6, .6, n))


def varredura(g, dur=0.8, **_):
    dur = dur or 0.8; n = int(dur * SR); u = np.linspace(0, 1, n)
    env = np.minimum(1, u / 0.1) * np.minimum(1, (1 - u) / 0.15)
    m = svf(rng.standard_normal(n), 400 * (10 ** (u * 1.1)), 4, 'bp') * env
    tone = np.sin(2 * np.pi * np.cumsum(900 + 900 * u) / SR) * env * 0.08
    return pan(norm(m) * 0.14 * g + tone * g, np.linspace(-.4, .4, n))


def subida(g, dur=0.9, **_):
    dur = dur or 0.9; n = int(dur * SR); u = np.linspace(0, 1, n)
    env = (u ** 2.2) * np.minimum(1, (1 - u) / 0.03 + 0.0)
    nz = svf(rng.standard_normal(n), 250 * (24 ** u), 2.5, 'bp')
    f = 110 * (8 ** u)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + .5 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)
    m = norm(nz) * 0.6 + norm(tone) * 0.25
    return pan(m * env * 0.3 * g, 0)


def impacto(g, **_):
    d = 1.8; tt = t_(d); n = len(tt)
    f = 44 + 80 * np.exp(-tt / 0.06)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.55) * np.minimum(1, tt / 0.004)
    hit = svf(rng.standard_normal(n), 1800, 0.7, 'lp') * np.exp(-tt / 0.03)
    m = norm(sub) * 0.85 + norm(hit) * 0.35
    return pan(m * 0.55 * g, 0)


SONS = dict(tique=tique, digitar=digitar, ping=ping, trava=trava, pop=pop, formar=formar,
            dissolver=dissolver, sopro=sopro, varredura=varredura, subida=subida, impacto=impacto)
MOLHADO = dict(ping=.35, trava=.25, pop=.15, impacto=.4, formar=.25, dissolver=.35, sopro=.2, subida=.25, varredura=.2, tique=.08, digitar=.08)


def reverb(x, rt=1.6, tau=0.4):
    n = int(rt * SR); tt = np.arange(n) / SR
    out = np.zeros_like(x)
    for ch in range(2):
        ir = rng.standard_normal(n) * np.exp(-tt / tau); ir[:int(0.012 * SR)] = 0
        ir = svf(ir, 4500, 0.7, 'lp'); ir /= np.sqrt((ir ** 2).sum())
        N = 1 << int(np.ceil(np.log2(len(x) + n)))
        out[:, ch] = np.fft.irfft(np.fft.rfft(x[:, ch], N) * np.fft.rfft(ir, N), N)[:len(x)]
    return out


def ambiencia(n):
    """Tom de sala escuro e quase inaudível: dá corpo ao silêncio entre os sons."""
    tt = np.arange(n) / SR
    br = np.cumsum(rng.standard_normal(n)); br -= np.convolve(br, np.ones(4801) / 4801, 'same')
    br = norm(svf(br, 220, 0.7, 'lp'))
    pad = (np.sin(2 * np.pi * 55 * tt) + .6 * np.sin(2 * np.pi * 82.41 * tt + 1) + .3 * np.sin(2 * np.pi * 110.3 * tt)) * (0.75 + 0.25 * np.sin(2 * np.pi * tt / 9))
    fade = np.minimum(1, tt / 1.5) * np.minimum(1, (tt[-1] - tt) / 1.5)
    m = (br * 0.5 + norm(pad) * 0.5) * fade
    return np.stack([m, np.roll(m, 900)], 1) * 0.035


def ambiencia_luz(n):
    """Pad caloroso e quase subliminar (Ré maior: D–A–Bm–G, 8 s por acorde), para vídeos luminosos."""
    tt = np.arange(n) / SR
    ACORDES = [[146.83, 220.0, 293.66, 369.99, 440.0], [110.0, 164.81, 220.0, 277.18, 329.63],
               [123.47, 185.0, 246.94, 293.66, 369.99], [98.0, 146.83, 196.0, 246.94, 293.66]]
    L = np.zeros(n); Rr = np.zeros(n); dur = 8.0
    for k in range(int(n / SR / dur) + 2):
        t0 = k * dur - 1.5; i0 = max(0, int(t0 * SR)); i1 = min(n, int((t0 + dur + 3) * SR))
        if i1 <= i0: continue
        u = (tt[i0:i1] - t0) / (dur + 3); env = np.sin(np.pi * np.clip(u, 0, 1)) ** 1.5
        for j, f in enumerate(ACORDES[k % 4]):
            for ch, det in ((L, 1 - .0015), (Rr, 1 + .0015)):
                ph = 2 * np.pi * f * det * tt[i0:i1] + j
                ch[i0:i1] += (np.sin(ph) + .25 * np.sin(2 * ph) + .08 * np.sin(3 * ph)) * env * (1 - j * .12)
    br = rng.standard_normal(n) * 0.02
    m = np.stack([L + br, Rr + br], 1)
    fade = (np.minimum(1, tt / 2) * np.minimum(1, (tt[-1] - tt) / 2))[:, None]
    m = m * fade * (0.85 + 0.15 * np.sin(2 * np.pi * tt / 11))[:, None]
    return m / max(1e-9, np.sqrt((m ** 2).mean())) * 0.014


# ---------------- trilha sonora (piano + pad + baixo), a partir das marcas 'musica' do motor ----------------
NOTA = lambda m: 440.0 * 2 ** ((m - 69) / 12)
ACORDES = {  # baixo, voicing (MIDI)
    'D': (38, [57, 62, 66, 69]), 'A': (45, [52, 57, 61, 64]), 'Bm': (47, [54, 59, 62, 66]),
    'G': (43, [50, 55, 59, 62]), 'Em': (40, [52, 55, 59, 64]), 'F#m': (42, [54, 57, 61, 66]),
}


def piano(f, dur, vel):
    d = min(dur + 1.8, 5.0); n = int(d * SR); tt = np.arange(n) / SR; out = np.zeros(n)
    for k in range(1, 9):
        fk = f * k * (1 + 0.00035 * k * k)
        if fk > 8000: break
        out += (vel / k ** 1.5) * np.sin(2 * np.pi * fk * tt + k) * np.exp(-tt / (2.6 / (1 + 0.6 * (k - 1))))
    out *= np.minimum(1, tt / 0.004) * np.where(tt < dur, 1, np.exp(-(tt - dur) / 0.45))
    out[:int(0.02 * SR)] += rng.standard_normal(int(0.02 * SR)) * np.exp(-np.arange(int(0.02 * SR)) / (0.004 * SR)) * 0.015 * vel
    return out


def pad_acorde(freqs, dur, it):
    n = int((dur + 1.6) * SR); tt = np.arange(n) / SR
    env = np.minimum(1, tt / 0.9) * np.where(tt < dur, 1, np.exp(-(tt - dur) / 0.7))
    L = np.zeros(n); R_ = np.zeros(n)
    for f in freqs:
        for k in range(1, 5):
            for ch, det in ((L, 1 - .002), (R_, 1 + .002)):
                ch += np.sin(2 * np.pi * f * k * det * tt + 0.3 * np.sin(2 * np.pi * 0.25 * tt)) / k ** 2.0
    return np.stack([L, R_], 1) * env[:, None] * it


def baixo(f, dur, it):
    n = int((dur + 0.8) * SR); tt = np.arange(n) / SR
    env = np.minimum(1, tt / 0.06) * (0.7 + 0.3 * np.exp(-tt / 0.5)) * np.where(tt < dur, 1, np.exp(-(tt - dur) / 0.4))
    return (np.sin(2 * np.pi * f * tt) + .3 * np.sin(4 * np.pi * f * tt)) * env * it


def trilha(ev, N):
    marcas = sorted([e for e in ev if e['type'] == 'musica'], key=lambda e: e['t'])
    if not marcas: return None
    out = np.zeros((N + SR * 6, 2)); piano_bus = np.zeros(N + SR * 6)
    bpm = float(marcas[0]['label'].split('|')[3]); passo = 60 / bpm / 2  # colcheias
    segs = []
    for m in marcas:
        ac, it, d, _ = m['label'].split('|'); segs.append((m['t'], ac, float(it), float(d)))
    def put(buf, x, t):
        i = int(t * SR); j = min(len(buf), i + len(x));
        if j > i: buf[i:j] += x[:j - i]
    for t0, ac, it, d in segs:
        b, voz = ACORDES.get(ac, ACORDES['D'])
        out[int(t0 * SR):int(t0 * SR) + int((d + 1.6) * SR)] += pad_acorde([NOTA(v) for v in voz], d, 0.05 + 0.10 * it)[:max(0, min(len(out) - int(t0 * SR), int((d + 1.6) * SR)))]
        if it >= 0.4: put(out[:, 0], baixo(NOTA(b), d, 0.18 * it), t0); put(out[:, 1], baixo(NOTA(b), d, 0.18 * it), t0)
        for j, v in enumerate(voz):  # acorde de piano dedilhado
            put(piano_bus, piano(NOTA(v + 12), min(d, 2.5), 0.10 + 0.14 * it), t0 + j * 0.035)
        # arpejo em colcheias na grelha do andamento
        if it >= 0.42:
            padrao = [0, 1, 2, 3, 2, 1]; g0 = np.ceil(t0 / passo) * passo; k = 0; g = g0
            while g < t0 + d - 0.05:
                nota = voz[padrao[k % 6]] + 12; acento = 1.0 if k % 2 == 0 else 0.7
                put(piano_bus, piano(NOTA(nota), passo * 1.6, (0.05 + 0.09 * it) * acento), g); k += 1; g += passo
        if it >= 0.72:  # melodia simples nas notas de cima
            for q, off in enumerate((0, 2 * passo * 2)):
                if off < d - 0.3: put(piano_bus, piano(NOTA(voz[-1 - q] + 24), passo * 4, 0.07 * it), t0 + off + passo)
    out[:, 0] += piano_bus * 0.9; out[:, 1] += np.roll(piano_bus, 240) * 0.9
    out = out[:N]
    wet = reverb(out, rt=3.0, tau=0.9)
    m = out * 0.75 + wet * 0.55
    tt = np.arange(N) / SR; fade = np.minimum(1, (tt[-1] - tt) / 1.5)[:, None]
    return m / max(1e-9, np.abs(m).max()) * fade


def grava(p, x):
    x = np.clip(x, -1, 1); y = (x * 32767).astype('<i2')
    with wave.open(str(p), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())


def loudnorm(arq, alvo=-20.0, tp=-2.0):
    """Mede o volume percebido (EBU R128), aplica o ganho até o alvo e limita os picos. -20 LUFS deixa espaço para a voz."""
    import subprocess, re
    f = f'loudnorm=I={alvo}:TP={tp}:LRA=18'
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', arq, '-af', f + ':print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', r, re.S).group(0))
    ganho = alvo - float(m['input_i'])
    f2 = f'volume={ganho:.2f}dB,alimiter=limit={10 ** (tp / 20):.3f}:attack=3:release=80:level=0'
    tmp = arq + '.tmp.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', arq, '-af', f2, '-ar', str(SR), '-c:a', 'pcm_s16le', tmp], check=True)
    pathlib.Path(tmp).replace(arq)


def main():
    mp4 = pathlib.Path(sys.argv[1])
    amb = 'nenhuma' if '--sem-ambiencia' in sys.argv else (sys.argv[sys.argv.index('--ambiencia') + 1] if '--ambiencia' in sys.argv else 'escura')
    ev = json.loads(pathlib.Path(str(mp4) + '.events.json').read_text())
    ev = ev if isinstance(ev, list) else ev.get('events', [])
    dur = max(e['t'] for e in ev) + 3
    import subprocess
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(mp4)], capture_output=True, text=True)
    if r.stdout.strip(): dur = float(r.stdout)
    N = int(dur * SR); seco = np.zeros((N + SR * 2, 2)); mol = np.zeros_like(seco); usados = {}
    for e in ev:
        if e['type'] != 'sfx': continue
        som, g, d, tom = e['label'].split('|'); g, d, tom = float(g), float(d), float(tom)
        x = SONS[som](g, dur=d, tom=tom); i = int(e['t'] * SR)
        seco[i:i + len(x)] += x[:len(seco) - i]; mol[i:i + len(x)] += x[:len(seco) - i] * MOLHADO.get(som, .2)
        usados[som] = usados.get(som, 0) + 1
    sfx = (seco + reverb(mol))[:N]
    for ch in range(2): sfx[:, ch] = svf(sfx[:, ch], 13000, 0.7, 'lp')   # tira o chiado do topo
    sfx *= 10 ** (-3 / 20) / max(1e-9, np.abs(sfx).max())     # pico em -3 dBFS
    base = mp4.with_suffix('')
    grava(f'{base}-sfx.wav', sfx)
    musica = trilha(ev, N) if '--sem-trilha' not in sys.argv else None
    if musica is not None:
        grava(f'{base}-trilha.wav', musica * 10 ** (-3 / 20))
        nivel = float(sys.argv[sys.argv.index('--nivel-trilha') + 1]) if '--nivel-trilha' in sys.argv else -8.0
        mix = sfx + musica * 10 ** (nivel / 20)   # a trilha substitui a ambiência
    else:
        mix = sfx + ({'escura': ambiencia, 'luz': ambiencia_luz}[amb](N) if amb != 'nenhuma' else 0)
    mix *= 10 ** (-1.5 / 20) / max(1e-9, np.abs(mix).max()) if np.abs(mix).max() > 10 ** (-1.5 / 20) else 1
    grava(f'{base}-mix.wav', mix)
    for f in [f'{base}-sfx.wav', f'{base}-mix.wav'] + ([f'{base}-trilha.wav'] if musica is not None else []): loudnorm(f, -20)
    print('sons:', ', '.join(f'{k}×{v}' for k, v in sorted(usados.items())))
    print(f'{base}-sfx.wav\n{base}-mix.wav')


if __name__ == '__main__':
    main()
