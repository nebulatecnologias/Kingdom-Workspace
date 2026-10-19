"""Troca amarelos/dourados por laranja Kingdom (#FF5E1E, matiz ~17 graus) mantendo o brilho. Le/escreve rawvideo rgb24 por stdin/stdout."""
import sys, numpy as np
W, H = int(sys.argv[1]), int(sys.argv[2])
TARGET = 17 / 360.0
def proc(a):
    f = a.astype(np.float32) / 255.0
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    mx = f.max(-1); mn = f.min(-1); d = mx - mn + 1e-6
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) / 6.0
    s = d / (mx + 1e-6)
    # peso: amarelos/dourados (25-62 graus) com alguma saturação
    hd = h * 360
    w = np.clip((hd - 22) / 8, 0, 1) * np.clip((66 - hd) / 8, 0, 1) * np.clip((s - 0.18) / 0.15, 0, 1)
    nh = TARGET * 6
    ns = np.clip(s * 1.15, 0, 1)
    c = mx * ns; x = c * (1 - np.abs(nh % 2 - 1)); m = mx - c
    # matiz 17 graus está no sector 0 (vermelho->amarelo): (c, x, 0)
    nr, ng, nb = c + m, x + m, m
    out = f.copy()
    out[..., 0] = r * (1 - w) + nr * w; out[..., 1] = g * (1 - w) + ng * w; out[..., 2] = b * (1 - w) + nb * w
    return (np.clip(out, 0, 1) * 255 + .5).astype(np.uint8)
n = W * H * 3
rd, wr = sys.stdin.buffer, sys.stdout.buffer
while True:
    buf = rd.read(n)
    if len(buf) < n: break
    wr.write(proc(np.frombuffer(buf, np.uint8).reshape(H, W, 3)).tobytes())
