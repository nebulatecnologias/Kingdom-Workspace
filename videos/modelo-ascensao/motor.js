/* =====================================================================
   MOTOR — modelo "ascensão" (vertical 9:16)
   Cúpula colorida que muda de cor a cada item, figura humana com luz de
   contorno, número 3D, objeto simbólico por princípio, legenda karaokê em
   duas linhas e selo com a referência bíblica.
   Paleta restrita à marca: LARANJA, GRAFITE e BRANCO (e seus tons).
   Cada quadro é função pura do tempo: window.__seek(t).
   ===================================================================== */
(function () {
  const W = 720, H = 1280, K = 1.5, CX = 360;
  const F = '"Google Sans", sans-serif';
  const BG = '#1a1917';
  const LEG_Y = 958, PILL_Y = 1110;

  const cv = document.createElement('canvas'); cv.width = W * K; cv.height = H * K;
  cv.style.width = W * K + 'px'; cv.style.height = H * K + 'px'; document.body.appendChild(cv);
  const ctx = cv.getContext('2d');

  /* ---------- utilitários ---------- */
  const R = s => { let a = s >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const cl = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const pr = (t, a, d) => cl((t - a) / d);
  const eo = p => 1 - Math.pow(1 - p, 3);
  const eio = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  const eob = p => { const c = 1.4; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  const lerp = (a, b, p) => a + (b - a) * p;
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mixC = (a, b, p) => { const A = Array.isArray(a) ? a : hex(a), B = Array.isArray(b) ? b : hex(b); return A.map((v, i) => Math.round(lerp(v, B[i], p))); };
  const rgba = (c, a = 1) => { const C = Array.isArray(c) ? c : hex(c); return `rgba(${C[0]},${C[1]},${C[2]},${a})`; };
  const env = (t, a, b, ent = 0.45, sai = 0.35) => eo(pr(t, a, ent)) * (1 - eio(pr(t, b - sai, sai)));

  /* ---------- fundo, holofote, estrelas ---------- */
  const rs = R(5);
  const ESTRELAS = Array.from({ length: 170 }, () => ({ x: rs() * W, y: rs() * 900, s: rs() < .12 ? 1.8 : 1, a: .15 + rs() * .55, ph: rs() * 6.28, f: .4 + rs() * 2 }));
  function fundo(t) {
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(CX, 520, 40, CX, 600, 900); g.addColorStop(0, '#2e2d2a'); g.addColorStop(.6, '#1c1b19'); g.addColorStop(1, '#0f0e0d');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    for (const s of ESTRELAS) { ctx.globalAlpha = s.a * (0.6 + 0.4 * Math.sin(t * s.f + s.ph)); ctx.fillRect(s.x, s.y, s.s, s.s); }
    ctx.globalAlpha = 1;
  }
  function holofote(t, a = 1, alvoY = 860) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
    [[-150, .05], [0, .11], [150, .05]].forEach(([dx, al]) => {
      const g = ctx.createLinearGradient(0, 0, 0, alvoY); g.addColorStop(0, `rgba(255,240,230,${al})`); g.addColorStop(1, 'rgba(255,240,230,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(CX + dx * .35 - 34, -10); ctx.lineTo(CX + dx * .35 + 34, -10); ctx.lineTo(CX + dx + 150, alvoY); ctx.lineTo(CX + dx - 150, alvoY); ctx.closePath(); ctx.fill();
    });
    ctx.restore();
  }
  function fios(a, ate = 462) { // linhas verticais finas que descem do alto
    ctx.save(); ctx.globalAlpha = a; ctx.lineWidth = 0.8;
    [[349, '#ff6301'], [360, '#ffe6d5'], [371, '#ffffff']].forEach(([x, c]) => { const g = ctx.createLinearGradient(0, 0, 0, ate); g.addColorStop(0, rgba(c, .05)); g.addColorStop(1, rgba(c, .55)); ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ate); ctx.stroke(); });
    ctx.restore();
  }

  /* ---------- cúpula ---------- */
  const DOMO = { r: 780, cy: 1232 };
  const horizonte = (x, dy = 0) => DOMO.cy + dy - Math.sqrt(Math.max(0, DOMO.r * DOMO.r - (x - CX) * (x - CX)));
  function domo(t, cor, dy = 0, a = 1) {
    if (a <= 0) return;
    const cy = DOMO.cy + dy, r = DOMO.r, claro = mixC(cor, '#ffffff', .35), escuro = mixC(cor, '#191817', .7);
    ctx.save(); ctx.globalAlpha = a;
    ctx.beginPath(); ctx.arc(CX, cy, r, 0, Math.PI * 2); ctx.save(); ctx.clip();
    let g = ctx.createRadialGradient(CX, 830 + dy, 10, CX, 800 + dy, 560);
    g.addColorStop(0, rgba(mixC(cor, '#ffffff', .22), .95)); g.addColorStop(.3, rgba(mixC(cor, '#2b2a28', .12), .9)); g.addColorStop(.7, rgba(mixC(cor, '#191817', .55), .95)); g.addColorStop(1, rgba(mixC(cor, '#121110', .8), 1));
    ctx.fillStyle = g; ctx.fillRect(0, cy - r, W, 2 * r);
    // névoa clara junto ao horizonte (dá volume de esfera)
    const nv = ctx.createRadialGradient(CX, cy, r * .82, CX, cy, r); nv.addColorStop(0, rgba(cor, 0)); nv.addColorStop(1, rgba(mixC(cor, '#ffffff', .3), .22));
    ctx.fillStyle = nv; ctx.fillRect(0, cy - r, W, 2 * r);
    // anéis no chão em volta da figura
    ctx.lineWidth = 1; ctx.strokeStyle = rgba(claro, .28);
    for (let i = 1; i <= 7; i++) { ctx.beginPath(); ctx.ellipse(CX, 800 + dy, 62 * i, 17 * i, 0, 0, Math.PI * 2); ctx.stroke(); }
    // meridianos a partir do horizonte
    ctx.strokeStyle = rgba(claro, .16);
    for (let k = -7; k <= 7; k++) { const x0 = CX + k * 62; ctx.beginPath(); ctx.moveTo(x0, horizonte(x0, dy)); ctx.quadraticCurveTo(CX + k * 120, 760 + dy, CX + k * 210, 1100 + dy); ctx.stroke(); }
    // órbitas inclinadas com pontos que andam
    for (let k = 0; k < 3; k++) {
      const rx = 230 + k * 90, ry = 70 + k * 22, rot = -0.12 + k * 0.1;
      ctx.strokeStyle = rgba(claro, .32); ctx.beginPath(); ctx.ellipse(CX, 700 + dy, rx, ry, rot, 0, Math.PI * 2); ctx.stroke();
      const an = t * (0.35 + k * 0.12) + k * 2;
      const px = CX + Math.cos(an) * rx * Math.cos(rot) - Math.sin(an) * ry * Math.sin(rot), py = 700 + dy + Math.cos(an) * rx * Math.sin(rot) + Math.sin(an) * ry * Math.cos(rot);
      ctx.fillStyle = rgba(claro, .9); ctx.beginPath(); ctx.arc(px, py, 2.4, 0, 6.283); ctx.fill();
    }
    // luz no chão debaixo da figura
    g = ctx.createRadialGradient(CX, 820 + dy, 5, CX, 820 + dy, 220); g.addColorStop(0, rgba(mixC(cor, '#ffffff', .5), .5)); g.addColorStop(1, rgba(cor, 0));
    ctx.fillStyle = g; ctx.fillRect(0, 560 + dy, W, 520);
    ctx.restore();
    // borda do horizonte
    ctx.lineWidth = 1.6; ctx.strokeStyle = rgba(claro, .55); ctx.shadowColor = rgba(claro, .8); ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(CX, cy, r, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    ctx.restore();
    // órbita longa fora da cúpula
    ctx.save(); ctx.globalAlpha = a * .5; ctx.strokeStyle = rgba(claro, .5); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(CX + 40, 420 + dy, 520, 120, -0.08, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); ctx.restore();
  }
  function esmaecerBase() { // a cúpula some no escuro antes da legenda
    const g = ctx.createLinearGradient(0, 850, 0, 935); g.addColorStop(0, 'rgba(26,25,23,0)'); g.addColorStop(1, 'rgba(26,25,23,1)');
    ctx.fillStyle = g; ctx.fillRect(0, 850, W, 90); ctx.fillStyle = BG; ctx.fillRect(0, 934, W, H - 934);
    const g2 = ctx.createRadialGradient(CX, 1000, 20, CX, 1000, 700); g2.addColorStop(0, 'rgba(40,39,36,.55)'); g2.addColorStop(1, 'rgba(15,14,13,0)');
    ctx.fillStyle = g2; ctx.fillRect(0, 934, W, H - 934);
  }

  /* ---------- figura humana ---------- */
  function catmull(P, fechado = true) {
    const p = new Path2D(), n = P.length, at = i => fechado ? P[(i + n) % n] : P[Math.max(0, Math.min(n - 1, i))];
    p.moveTo(P[0][0], P[0][1]);
    for (let i = 0; i < (fechado ? n : n - 1); i++) {
      const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
      p.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
    }
    if (fechado) p.closePath(); return p;
  }
  const CORPO_D = [[.024, .118], [.027, .148], [.075, .168], [.108, .186], [.118, .215], [.098, .27], [.08, .34], [.074, .42], [.088, .5], [.09, .56], [.082, .66], [.07, .75], [.072, .83], [.046, .95], [.058, .992], [.014, .995], [.016, .95], [.022, .83], [.02, .75], [.014, .64]];
  const CORPO = catmull([...CORPO_D, [0, .575], ...CORPO_D.slice().reverse().map(([x, y]) => [-x, y])]);
  const BRACO_D = [[.108, .19], [.13, .235], [.138, .32], [.14, .40], [.136, .48], [.132, .54], [.124, .585], [.112, .582], [.108, .54], [.107, .48], [.105, .40], [.1, .32], [.094, .26]];
  const BRACOS = new Path2D(); BRACOS.addPath(catmull(BRACO_D)); BRACOS.addPath(catmull(BRACO_D.map(([x, y]) => [-x, y])));
  const CABECA = new Path2D(); CABECA.ellipse(0, .064, .041, .06, 0, 0, Math.PI * 2);
  const SILHUETA = new Path2D(); SILHUETA.addPath(CORPO); SILHUETA.addPath(BRACOS); SILHUETA.addPath(CABECA);

  function figura(x, pes, h, o = {}) {
    const a = o.a ?? 1; if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a;
    // sombra no chão
    ctx.fillStyle = 'rgba(10,9,8,.35)'; ctx.beginPath(); ctx.ellipse(x, pes, h * .13, h * .025, 0, 0, 6.283); ctx.fill();
    ctx.translate(x, pes - h); ctx.scale(h, h);
    const base = o.cor || '#3a3936';
    const g = ctx.createLinearGradient(0, 0, 0, 1); g.addColorStop(0, rgba(mixC(base, '#8a8783', .35))); g.addColorStop(.45, rgba(base)); g.addColorStop(1, rgba(mixC(base, '#0e0d0c', .5)));
    ctx.shadowColor = rgba(o.brilhoCor || '#ff7a27', .55 * (o.brilho ?? 1)); ctx.shadowBlur = 14 * (o.brilho ?? 1) * K;
    ctx.fillStyle = g; ctx.fill(SILHUETA); ctx.shadowBlur = 0;
    // luz do holofote na cabeça e ombros
    ctx.save(); ctx.clip(SILHUETA);
    const hl = ctx.createRadialGradient(0, .05, .01, 0, .12, .4); hl.addColorStop(0, 'rgba(255,236,224,.45)'); hl.addColorStop(1, 'rgba(255,236,224,0)');
    ctx.fillStyle = hl; ctx.fillRect(-.3, 0, .6, 1);
    const sd = ctx.createLinearGradient(-.15, 0, .15, 0); sd.addColorStop(0, 'rgba(14,13,12,.35)'); sd.addColorStop(.5, 'rgba(14,13,12,0)'); sd.addColorStop(1, 'rgba(14,13,12,.25)');
    ctx.fillStyle = sd; ctx.fillRect(-.3, 0, .6, 1);
    ctx.restore();
    // contorno luminoso rosa / ciano (como no modelo)
    const rim = ctx.createLinearGradient(-.15, 0, .15, 0);
    rim.addColorStop(0, 'rgba(255,110,30,.95)'); rim.addColorStop(.42, 'rgba(255,110,30,0)'); rim.addColorStop(.58, 'rgba(255,236,220,0)'); rim.addColorStop(1, 'rgba(255,236,220,.95)');
    ctx.strokeStyle = rim; ctx.lineWidth = 1.7 / h; ctx.stroke(SILHUETA);
    ctx.restore();
    if (o.peito) brilhoPeito(x, pes - h * .7, h, o.peito);
  }
  function brilhoPeito(x, y, h, a) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, h * .22); g.addColorStop(0, `rgba(255,240,220,${.85 * a})`); g.addColorStop(.3, `rgba(255,200,160,${.35 * a})`); g.addColorStop(1, 'rgba(255,200,160,0)');
    ctx.fillStyle = g; ctx.fillRect(x - h * .25, y - h * .25, h * .5, h * .5); ctx.restore();
    estrela(x, y, h * .09 * (0.8 + 0.2 * a), a);
  }
  function estrela(x, y, r, a = 1) {
    if (a <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 1.2); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(x - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4);
    ctx.fillStyle = '#fff';
    [[0, 1], [1, 0]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.moveTo(x - dx * r * 2, y - dy * r * 2); ctx.lineTo(x + dy * r * .12, y + dx * r * .12); ctx.lineTo(x + dx * r * 2, y + dy * r * 2); ctx.lineTo(x - dy * r * .12, y - dx * r * .12); ctx.closePath(); ctx.fill(); });
    ctx.restore();
  }

  /* ---------- número 3D ---------- */
  function numero(txt, x, y, cor, p, q) {
    if (p <= 0 || q >= 1) return;
    const s = (0.55 + 0.45 * eob(p)) * (1 + 0.12 * eio(q)), a = cl(p * 3) * (1 - q);
    const tam = txt.length > 1 ? 150 : 175;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y - 24 * eio(q)); ctx.scale(s, s);
    ctx.font = `700 ${tam}px ${F}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '-4px';
    for (let i = 16; i >= 1; i--) { ctx.fillStyle = rgba(mixC(cor, '#121110', 0.35 + i / 16 * 0.45)); ctx.fillText(txt, i * 0.7, i * 0.95); }
    const g = ctx.createLinearGradient(0, -tam * .45, 0, tam * .45);
    g.addColorStop(0, '#ffffff'); g.addColorStop(.38, rgba(mixC(cor, '#ffffff', .55))); g.addColorStop(.55, rgba(mixC(cor, '#2b2a28', .15))); g.addColorStop(1, rgba(mixC(cor, '#ffffff', .25)));
    ctx.fillStyle = g; ctx.fillText(txt, 0, 0);
    ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.strokeText(txt, 0, 0);
    ctx.restore();
    estrela(x + (txt.length > 1 ? 70 : 42), y - 70, 9, a * (0.7 + 0.3 * Math.sin(p * 9)));
  }

  /* ---------- torre de discos (a lista) ---------- */
  const ARCO = ['#b83600', '#cc3d00', '#e04400', '#f04a00', '#ff5200', '#ff6301', '#ff7a27', '#ff8f47', '#ffa468', '#ffbb8c']; // tons de laranja, do queimado ao pêssego
  function torre(cx, base, esc, t, o = {}) {
    const a = o.a ?? 1; if (a <= 0) return;
    const passo = 40 * esc, rx = 108 * esc, ry = 20 * esc;
    ctx.save(); ctx.globalAlpha = a;
    // espiral
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.beginPath();
    for (let s = 0; s <= 1.0001; s += 0.004) { const an = s * 6.283 * 9 + t * 0.8, x = cx + Math.cos(an) * rx * 1.05, y = base - s * passo * 9.6 + Math.sin(an) * ry * .9; s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke();
    for (let i = 0; i < 10; i++) {
      const pi = o.discos ? o.discos(i) : 1; if (pi <= 0) continue;
      const y = base - i * passo + 18 * (1 - eo(pi)), c = ARCO[i], k = 0.6 + 0.4 * eo(pi);
      ctx.save(); ctx.globalAlpha = a * eo(pi);
      ctx.shadowColor = rgba(c, .9); ctx.shadowBlur = 16 * K;
      const g = ctx.createRadialGradient(cx, y, 2, cx, y, rx * k); g.addColorStop(0, rgba(mixC(c, '#ffffff', .4), .75)); g.addColorStop(.7, rgba(c, .5)); g.addColorStop(1, rgba(c, .25));
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, y, rx * k, ry * k, 0, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
      ctx.lineWidth = 1.6; ctx.strokeStyle = rgba(mixC(c, '#ffffff', .5), .95); ctx.stroke();
      ctx.lineWidth = 1; ctx.strokeStyle = rgba(mixC(c, '#ffffff', .6), .5); ctx.beginPath(); ctx.ellipse(cx, y, rx * k * .62, ry * k * .62, 0, 0, 6.283); ctx.stroke();
      ctx.restore();
      const pc = o.checks ? o.checks(i) : 0;
      if (pc > 0) { // ✓
        const x0 = cx + rx + 18 * esc, s = 7 * esc * (0.6 + 0.4 * eob(pc));
        ctx.save(); ctx.globalAlpha = a * cl(pc * 2); ctx.strokeStyle = rgba(mixC(c, '#ffffff', .4)); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(x0 - s, y); ctx.lineTo(x0 - s * .25, y + s * .7); ctx.lineTo(x0 + s, y - s * .9); ctx.stroke(); ctx.restore();
        if (pc < 1) estrela(x0, y, 5 * (1 - pc), 1 - pc);
      }
    }
    ctx.restore();
  }
  // perfil de cabeça (contorno)
  const PERFIL = catmull([[-.27, 1.0], [-.25, .82], [-.33, .66], [-.37, .46], [-.3, .2], [-.12, .05], [.08, .02], [.24, .12], [.31, .3], [.315, .38], [.36, .46], [.41, .53], [.355, .565], [.37, .62], [.345, .655], [.36, .69], [.335, .72], [.32, .79], [.23, .84], [.13, .86], [.11, 1.0]], false);
  function perfil(cx, topo, h, p, a = 1) {
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(cx, topo); ctx.scale(h, h);
    ctx.lineWidth = 1.7 / h; ctx.setLineDash([3.2 * p, 3.2]); ctx.lineDashOffset = 0;
    const g = ctx.createLinearGradient(-.4, 0, .4, 0); g.addColorStop(0, 'rgba(255,110,30,.9)'); g.addColorStop(.5, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,236,220,.9)');
    ctx.strokeStyle = g; ctx.shadowColor = 'rgba(255,255,255,.6)'; ctx.shadowBlur = 8 * K; ctx.stroke(PERFIL);
    ctx.restore();
  }

  /* ---------- selos (referência bíblica / chamada) ---------- */
  function selo(partes, y, a) { // partes: [['1 TESSALONICENSES ', false], ['5:11', true]]
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a; ctx.textBaseline = 'middle'; ctx.letterSpacing = '2.4px';
    const fs = 11.5; let w = 0;
    partes.forEach(([txt, b]) => { ctx.font = `${b ? 700 : 400} ${fs}px ${F}`; w += ctx.measureText(txt).width; });
    const pw = w + 58, ph = 30, x0 = CX - pw / 2, yy = y + 6 * (1 - a);
    ctx.fillStyle = 'rgba(15,14,13,.6)'; ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(x0, yy - ph / 2, pw, ph, ph / 2); ctx.fill(); ctx.stroke();
    // pequena cruz
    ctx.fillStyle = '#fff'; ctx.fillRect(x0 + 19, yy - 6, 1.6, 12); ctx.fillRect(x0 + 15.3, yy - 2.8, 9, 1.6);
    let x = x0 + 36;
    partes.forEach(([txt, b]) => { ctx.font = `${b ? 700 : 400} ${fs}px ${F}`; ctx.fillStyle = b ? '#ffffff' : 'rgba(255,255,255,.82)'; ctx.fillText(txt, x, yy + .5); x += ctx.measureText(txt).width; });
    ctx.restore();
  }
  const partesRef = ref => { const m = ref.match(/^(.*?)(\d+:\d+(?:-\d+)?)$/); return m ? [[m[1], false], [m[2], true]] : [[ref, true]]; };

  /* ---------- OBJETOS SIMBÓLICOS (um por princípio) ---------- */
  // cada um: (S, a, cor) — S.t tempo local, S.dur, S.w tempos das palavras, a = envelope 0..1
  const PRINCIPAL = { x: CX, pes: 840, h: 372 };
  const OBJ = {};
  OBJ.edificar = (S, a, cor) => {
    const sobe = eo(pr(S.t, 0.6, 1.4)), x = 505, pes = 800 - 26 * sobe;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * .7;
    ctx.translate(x, pes - 120); ctx.scale(1, 4);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 48); g.addColorStop(0, rgba(mixC(cor, '#ffffff', .6), .5)); g.addColorStop(1, rgba(cor, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 48, 0, 6.283); ctx.fill(); ctx.restore();
    for (let i = 0; i < 14; i++) { const ph = (S.t * 0.6 + i / 14) % 1; estrela(x - 35 + (i * 37 % 70), pes - ph * 300, 1.6, a * (1 - ph) * .9); }
    figura(x, pes, 300, { a: a * .95, brilho: .6 + .6 * sobe });
  };
  OBJ.incluir = (S, a) => {
    const jun = eio(pr(S.t, 0.5, 1.8));
    [-250, -170, -95, 95, 170, 250].forEach((dx, i) => {
      const xx = CX + dx * lerp(1, 0.78, jun), pes = horizonte(CX + dx) + 150 - Math.abs(dx) * .05;
      figura(xx, pes, 160, { a: a * .8, brilho: .4 });
    });
  };
  OBJ.comunicar = (S, a) => {
    figura(190, 720, 240, { a: a * .9, brilho: .5 }); figura(530, 720, 240, { a: a * .9, brilho: .5 });
    ctx.save(); ctx.lineWidth = 1.5;
    for (let k = 0; k < 4; k++) {
      const ph = (S.t * 0.7 + k / 4) % 1, r = 30 + ph * 140;
      ctx.strokeStyle = `rgba(255,220,195,${a * (1 - ph) * .8})`;
      ctx.beginPath(); ctx.arc(CX, 500, r, Math.PI * .82, Math.PI * 1.18); ctx.stroke();
      ctx.beginPath(); ctx.arc(CX, 500, r, -Math.PI * .18, Math.PI * .18); ctx.stroke();
    }
    ctx.restore();
  };
  OBJ.limites = (S, a, cor) => {
    const c = mixC(cor, '#ffffff', .45), sobe = eo(pr(S.t, 0.4, 0.9));
    ctx.save(); ctx.globalAlpha = a;
    const topo = 840 - 330 * sobe;
    const g = ctx.createLinearGradient(0, topo, 0, 845); g.addColorStop(0, rgba(c, 0)); g.addColorStop(1, rgba(c, .22));
    ctx.fillStyle = g; ctx.fillRect(225, topo, 270, 845 - topo);
    ctx.strokeStyle = rgba(c, .9); ctx.lineWidth = 2; ctx.shadowColor = rgba(c, 1); ctx.shadowBlur = 12 * K;
    ctx.beginPath(); ctx.ellipse(CX, 845, 135, 30, 0, 0, 6.283); ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = rgba(c, .5); ctx.beginPath(); ctx.ellipse(CX, topo, 135, 30, 0, 0, 6.283); ctx.stroke();
    ctx.shadowBlur = 0;
    // raios em zigue-zague que batem no limite e voltam
    ctx.strokeStyle = rgba(c, .9); ctx.lineWidth = 1.5; ctx.lineJoin = 'round';
    [[1, 640, 0.3], [-1, 700, 0.9]].forEach(([lado, y0, d]) => {
      const p = pr(S.t, d, 1.0); if (p <= 0) return; const xb = CX + lado * 135;
      const pts = [[CX + lado * 360, y0], [CX + lado * 300, y0 + 40], [CX + lado * 240, y0 - 10], [xb, y0 + 30], [CX + lado * 200, y0 + 80], [CX + lado * 260, y0 + 60]];
      const n = Math.min(pts.length, 1 + Math.floor(p * (pts.length - 1) + 0.999));
      ctx.beginPath(); pts.slice(0, n).forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
      if (p > 0.55 && p < 0.8) estrela(xb, y0 + 30, 7, 1 - Math.abs(p - .67) * 8);
    });
    ctx.restore();
  };
  OBJ.focar = (S, a) => {
    ctx.save(); ctx.filter = `blur(${2.5 * K}px)`;
    [[150, 690, 200], [580, 700, 210], [250, 640, 150], [480, 645, 150]].forEach(([x, p, h]) => figura(x, p, h, { a: a * .45, brilho: .2 }));
    ctx.restore();
    const k = 1 + 0.25 * (1 - eo(pr(S.t, 0.4, 0.6))), x0 = CX - 115 * k, x1 = CX + 115 * k, y0 = 640 - 210 * k, y1 = 640 + 215 * k, L = 22;
    ctx.save(); ctx.globalAlpha = a * eo(pr(S.t, 0.4, 0.5)); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6;
    [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]].forEach(([x, y, sx, sy]) => { ctx.beginPath(); ctx.moveTo(x, y + sy * L); ctx.lineTo(x, y); ctx.lineTo(x + sx * L, y); ctx.stroke(); });
    ctx.restore();
  };
  OBJ.paz = (S, a, cor) => {
    const c = mixC(cor, '#ffffff', .5);
    // escudo
    ctx.save(); ctx.globalAlpha = a * eo(pr(S.t, 0.6, 0.6));
    ctx.beginPath(); ctx.ellipse(CX, 845, 165, 400, 0, Math.PI, 0); ctx.closePath();
    const g = ctx.createRadialGradient(CX, 700, 20, CX, 700, 380); g.addColorStop(0, rgba(c, .03)); g.addColorStop(1, rgba(c, .16));
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = rgba(c, .8); ctx.lineWidth = 1.4; ctx.shadowColor = rgba(c, 1); ctx.shadowBlur = 10 * K; ctx.stroke(); ctx.restore();
    // nuvem e chuva
    ctx.save(); ctx.globalAlpha = a;
    const cyN = 330 + 6 * Math.sin(S.t * 1.3);
    ctx.strokeStyle = 'rgba(220,215,210,.55)'; ctx.lineWidth = 1.2;
    for (let i = 0; i < 70; i++) {
      const x = 215 + (i * 41.3 % 290), y = cyN + 20 + ((S.t * 520 + i * 61) % 520);
      const dx = (x - CX) / 165, yEsc = 845 - 400 * Math.sqrt(Math.max(0, 1 - dx * dx));
      if (Math.abs(dx) < 1 && y > yEsc - 4) { if (y < yEsc + 10) estrela(x, yEsc, 2, .6); continue; }
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2, y + 11); ctx.stroke();
    }
    [[-70, 8, 38], [-30, -18, 50], [22, -12, 46], [66, 6, 36], [0, 14, 44], [-50, 22, 30], [45, 24, 32]].forEach(([dx, dy, r]) => {
      const g2 = ctx.createRadialGradient(CX + dx - r * .3, cyN + dy - r * .4, 2, CX + dx, cyN + dy, r);
      g2.addColorStop(0, '#6b6965'); g2.addColorStop(1, '#2b2a28'); ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(CX + dx, cyN + dy, r, 0, 6.283); ctx.fill();
    });
    ctx.restore();
  };
  OBJ.deixar = (S, a, cor) => {
    const c = mixC(cor, '#ffffff', .55);
    ctx.save(); ctx.strokeStyle = rgba(c, .45 * a); ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.ellipse(CX, 610, 250, 70, -0.2, Math.PI * .1, Math.PI * 1.7); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(CX + 40, 520, 300, 90, 0.25, Math.PI * 1.2, Math.PI * 2.3); ctx.stroke(); ctx.restore();
    [[235, 700, 0.6, '#ff7a27'], [480, 620, 1.1, '#ffe6d5'], [300, 560, 1.7, '#ff9f63']].forEach(([x, y, d, col]) => {
      const p = pr(S.t, d, 3.5), yy = y - 260 * eio(p), al = a * (1 - eio(pr(p, 0.5, 0.5)));
      if (al <= 0) return;
      ctx.save(); ctx.globalAlpha = al; ctx.shadowColor = col; ctx.shadowBlur = 22 * K;
      const g = ctx.createRadialGradient(x, yy, 4, x, yy, 34); g.addColorStop(0, rgba(mixC(col, '#ffffff', .6), .95)); g.addColorStop(1, rgba(col, .25));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, yy, 30, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(43,42,40,.55)'; ctx.beginPath(); ctx.roundRect(x - 8, yy - 11, 16, 22, 4); ctx.fill();
      ctx.restore();
    });
  };
  OBJ.encorajar = (S, a) => {
    const r = 140 * (0.85 + 0.15 * eo(pr(S.t, 0.2, 0.8))), cy = 590;
    ctx.save(); ctx.globalAlpha = a;
    const glow = ctx.createRadialGradient(CX, cy, r * .8, CX, cy, r * 1.8); glow.addColorStop(0, 'rgba(255,190,140,.35)'); glow.addColorStop(1, 'rgba(255,190,140,0)');
    ctx.fillStyle = glow; ctx.fillRect(CX - r * 2, cy - r * 2, r * 4, r * 4);
    ctx.save(); ctx.beginPath(); ctx.arc(CX, cy, r, 0, 6.283); ctx.clip();
    const g = ctx.createLinearGradient(0, cy - r, 0, cy + r); g.addColorStop(0, '#ffe6d5'); g.addColorStop(.45, '#ff9f63'); g.addColorStop(.75, '#ff6301'); g.addColorStop(1, '#b83600');
    ctx.fillStyle = g; ctx.fillRect(CX - r, cy - r, 2 * r, 2 * r);
    for (let k = 0; k < 9; k++) { const y = cy + 8 + k * 15 - (S.t * 8 % 15), hh = 1.5 + k * 1.3; ctx.fillStyle = 'rgba(31,30,28,.9)'; ctx.fillRect(CX - r, y, 2 * r, hh); }
    ctx.restore(); ctx.restore();
    figura(205, 730, 210, { a: a * .9, brilho: 1, brilhoCor: '#ffb482' }); figura(515, 730, 210, { a: a * .9, brilho: 1, brilhoCor: '#ffb482' });
  };
  OBJ.apoiar = (S, a) => {
    const y = 395 + 5 * Math.sin(S.t * 2), p = eob(pr(S.t, 0.3, 0.5));
    ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
    const b = ctx.createLinearGradient(0, y, 0, 840); b.addColorStop(0, 'rgba(255,150,80,.3)'); b.addColorStop(1, 'rgba(255,150,80,0)');
    ctx.fillStyle = b; ctx.beginPath(); ctx.moveTo(CX - 20, y); ctx.lineTo(CX + 20, y); ctx.lineTo(CX + 110, 840); ctx.lineTo(CX - 110, 840); ctx.fill(); ctx.restore();
    ctx.save(); ctx.globalAlpha = a; ctx.translate(CX, y); ctx.scale(p, p);
    ctx.shadowColor = 'rgba(255,120,40,.9)'; ctx.shadowBlur = 20 * K;
    const g = ctx.createLinearGradient(-34, -34, 34, 34); g.addColorStop(0, '#ffe6d5'); g.addColorStop(.5, '#ff7a27'); g.addColorStop(1, '#b83600');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 36, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,240,230,.9)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 31, 0, 6.283); ctx.stroke();
    ctx.fillStyle = '#2b2a28'; ctx.beginPath(); ctx.moveTo(-13, -14); ctx.lineTo(13, -14); ctx.lineTo(9, 2); ctx.quadraticCurveTo(0, 8, -9, 2); ctx.closePath(); ctx.fill();
    ctx.fillRect(-2.5, 4, 5, 8); ctx.fillRect(-9, 12, 18, 4);
    ctx.restore();
    // pessoas apoiadas: arcos de luz ligando
    [[200, 760, 230], [520, 760, 230]].forEach(([x, pes, h], i) => {
      figura(x, pes, h, { a: a * .9, brilho: .5 });
      const pa = eo(pr(S.t, 0.8 + i * .3, 0.7));
      ctx.save(); ctx.globalAlpha = a * pa * .8; ctx.strokeStyle = 'rgba(255,160,100,.9)'; ctx.lineWidth = 1.4; ctx.setLineDash([4, 5]); ctx.lineDashOffset = -S.t * 20;
      ctx.beginPath(); ctx.moveTo(CX + (x < CX ? -40 : 40), 620); ctx.quadraticCurveTo((CX + x) / 2, 540, x, pes - h * .72); ctx.stroke(); ctx.restore();
    });
  };
  OBJ.celebrar = (S, a) => {
    const xs = [110, 175, 240, 305, 415, 480, 545, 610];
    xs.forEach((x, i) => {
      const pes = horizonte(x) + 175 + (i % 2) * 14, h = 170 - (i % 2) * 8;
      const pk = pr(S.t, 0.5 + i * 0.12, 0.35);
      figura(x, pes, h, { a: a * .85, brilho: .4, peito: pk > 0 ? Math.min(1, pk * 2) * (0.75 + 0.25 * Math.sin(S.t * 5 + i)) : 0 });
    });
    const rc = R(77);
    for (let i = 0; i < 70; i++) {
      const x0 = rc() * W, sp = 80 + rc() * 90, d = rc() * 2, rot = rc() * 6, c = ARCO[i % 10];
      const tt = S.t - 0.9 - d; if (tt < 0) continue; const y = 250 + tt * sp; if (y > 860) continue;
      ctx.save(); ctx.globalAlpha = a * .9; ctx.translate(x0 + Math.sin(tt * 2 + i) * 12, y); ctx.rotate(rot + tt * 3); ctx.fillStyle = c; ctx.fillRect(-3, -1.5, 6, 3); ctx.restore();
    }
  };
  OBJ.reflexo = (S, a) => {
    const mx = 535, my = 600, rx = 92, ry = 145, p = eo(pr(S.t, 0.2, 0.8));
    ctx.save(); ctx.globalAlpha = a * p;
    ctx.save(); ctx.beginPath(); ctx.ellipse(mx, my, rx, ry, 0, 0, 6.283); ctx.clip();
    const g = ctx.createLinearGradient(mx - rx, my - ry, mx + rx, my + ry); g.addColorStop(0, '#4a4845'); g.addColorStop(.5, '#2b2a28'); g.addColorStop(1, '#1f1e1c');
    ctx.fillStyle = g; ctx.fillRect(mx - rx, my - ry, 2 * rx, 2 * ry);
    figura(mx + 5, my + 105, 200, { a: .65, cor: '#5a5855', brilho: .3 });
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.moveTo(mx - rx, my - 40); ctx.lineTo(mx - 10, my - ry); ctx.lineTo(mx + 30, my - ry); ctx.lineTo(mx - rx, my + 30); ctx.fill();
    ctx.restore();
    ctx.lineWidth = 7; const og = ctx.createLinearGradient(mx - rx, my - ry, mx + rx, my + ry); og.addColorStop(0, '#ffe6d5'); og.addColorStop(.5, '#ff6301'); og.addColorStop(1, '#7a2600');
    ctx.strokeStyle = og; ctx.shadowColor = 'rgba(255,130,50,.6)'; ctx.shadowBlur = 12 * K; ctx.beginPath(); ctx.ellipse(mx, my, rx, ry, 0, 0, 6.283); ctx.stroke();
    ctx.restore();
    estrela(mx - 35, my - 80, 8, a * p * (0.7 + 0.3 * Math.sin(S.t * 3)));
    // coração no peito quando se fala do coração
    const ic = S.w.findIndex((_, i) => /cora/.test(S.palavras[i] || ''));
    if (ic >= 0) {
      const ph = pr(S.t, S.w[ic] - 0.15, 0.4); if (ph > 0) coracao(CX, 840 - 372 * .69, 16 * (0.7 + 0.3 * eob(ph)), a * Math.min(1, ph * 2));
    }
  };
  function coracao(x, y, s, a) {
    ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, s * 4); g.addColorStop(0, 'rgba(255,99,1,.6)'); g.addColorStop(1, 'rgba(255,99,1,0)'); ctx.fillStyle = g; ctx.fillRect(x - s * 4, y - s * 4, s * 8, s * 8);
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#ff8a3d'; ctx.shadowColor = '#ff6301'; ctx.shadowBlur = 14 * K;
    ctx.beginPath(); ctx.moveTo(x, y + s * .9); ctx.bezierCurveTo(x - s * 1.6, y - s * .1, x - s * .8, y - s * 1.2, x, y - s * .45); ctx.bezierCurveTo(x + s * .8, y - s * 1.2, x + s * 1.6, y - s * .1, x, y + s * .9); ctx.fill();
    ctx.restore();
  }
  OBJ.valor = (S, a) => {
    const p = eo(pr(S.t, 0.1, 0.7)), x = 185, y0 = 470, y1 = 840;
    // régua (a "medida") que perde força
    const iv = S.palavras.findIndex(w => /valor/.test(w)), apaga = iv >= 0 ? pr(S.t, S.w[iv] + 0.2, 0.8) : 0;
    ctx.save(); ctx.globalAlpha = a * p * (1 - 0.75 * apaga);
    const g = ctx.createLinearGradient(x - 9, 0, x + 9, 0); g.addColorStop(0, '#ff9f63'); g.addColorStop(1, '#d84400');
    ctx.fillStyle = g; ctx.fillRect(x - 9, y0 + (y1 - y0) * (1 - p), 18, (y1 - y0) * p);
    ctx.fillStyle = 'rgba(60,25,5,.8)'; for (let y = y1 - 6; y > y0 + (y1 - y0) * (1 - p); y -= 9) ctx.fillRect(x - 9, y, (Math.round((y1 - y) / 9) % 5 === 0) ? 10 : 5, 1.2);
    ctx.restore();
    // aura dourada: "de modo especial e admirável"
    const ia = S.palavras.findIndex(w => /especial/.test(w)), pa = ia >= 0 ? eo(pr(S.t, S.w[ia] - 0.3, 0.9)) : 0;
    if (pa > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * pa;
      const au = ctx.createRadialGradient(CX, 650, 20, CX, 650, 260); au.addColorStop(0, 'rgba(255,190,140,.35)'); au.addColorStop(1, 'rgba(255,190,140,0)'); ctx.fillStyle = au; ctx.fillRect(CX - 260, 390, 520, 520);
      ctx.strokeStyle = 'rgba(255,200,160,.35)'; ctx.lineWidth = 1;
      for (let k = 0; k < 18; k++) { const an = k / 18 * 6.283 + S.t * .15; ctx.beginPath(); ctx.moveTo(CX + Math.cos(an) * 150, 640 + Math.sin(an) * 210); ctx.lineTo(CX + Math.cos(an) * 230, 640 + Math.sin(an) * 300); ctx.stroke(); }
      ctx.restore();
      estrela(CX, 840 - 372 * .69, 10, a * pa);
    }
  };

  /* ---------- montagem do roteiro ---------- */
  const CENAS = [], PALAVRAS = [], FRASES = [];
  const ritmo = Object.assign({ base: 0.105, porLetra: 0.042, virgula: 0.12, ponto: 0.3, frase: 0.05, verso: 0.02, entrada: 0.3, saida: 0.25 }, window.RITMO || {});
  function tokens(txt) { // '*palavra*' = negrito; aceita '*duas palavras*'
    const out = []; let neg = false;
    txt.split(' ').forEach(w => { let b = neg; if (w.startsWith('*')) { b = true; neg = true; w = w.slice(1); } let fim = false; if (/\*[.,:;!?”"…]*$/.test(w)) { fim = true; w = w.replace(/\*([.,:;!?”"…]*)$/, '$1'); } out.push({ txt: w, neg: b || neg }); if (fim) neg = false; });
    return out;
  }
  function montar() {
    let t = 0;
    window.ROTEIRO.forEach((c, ci) => {
      const cena = { c, t0: t, w: [], palavras: [], ci, verso0: null };
      t += c.entrada ?? ritmo.entrada;
      const blocos = (c.frases || []).map(f => ({ f, verso: false }));
      if (c.verso) c.verso.blocos.forEach(f => blocos.push({ f, verso: true }));
      blocos.forEach(({ f, verso }) => {
        const [txt, pausa] = Array.isArray(f) ? f : [f, 0];
        const fr = { i0: PALAVRAS.length, cena: ci, verso };
        if (verso && cena.verso0 == null) { cena.verso0 = t - cena.t0; t += 0.15; fr.i0 = PALAVRAS.length; }
        tokens(txt).forEach(tk => {
          const letras = tk.txt.replace(/[^\p{L}\p{N}]/gu, '').length, d = ritmo.base + ritmo.porLetra * Math.max(2, letras) + (verso ? ritmo.verso : 0);
          PALAVRAS.push({ ...tk, t, d, frase: FRASES.length, verso }); cena.w.push(t - 0); cena.palavras.push(tk.txt);
          t += d; if (/[,;]["”]?$/.test(tk.txt)) t += ritmo.virgula; if (/[.:?!…]["”]?$/.test(tk.txt)) t += ritmo.ponto;
        });
        t += ritmo.frase + pausa; fr.i1 = PALAVRAS.length - 1; fr.t0 = PALAVRAS[fr.i0].t - 0.12; FRASES.push(fr);
      });
      t += c.saidaExtra ?? 0; cena.t1 = t + (c.saida ?? ritmo.saida); t = cena.t1; CENAS.push(cena);
    });
    FRASES.forEach((f, i) => { const u = PALAVRAS[f.i1], prox = FRASES[i + 1]; f.t1 = Math.min(prox ? prox.t0 - 0.02 : 1e9, u.t + u.d + 0.9, CENAS[f.cena].t1 - 0.05); });
    window.__duration = t;
    window.__events = [];
    CENAS.forEach(c => window.__events.push({ t: c.t0, frame: Math.round(c.t0 * 30), type: 'cut', label: c.c.tipo }));
    PALAVRAS.forEach(p => window.__events.push({ t: +p.t.toFixed(3), frame: Math.round(p.t * 30), type: 'word', label: p.txt }));
    sons();
  }

  /* ---------- sons (deixas para sons.py) ---------- */
  const ESCALA = [523, 587, 659, 698, 784, 880, 988, 1046, 1175, 1318];
  function sons() {
    const S = [];
    CENAS.forEach((cena, i) => {
      const c = cena.c, t0 = cena.t0, w = cena.w;
      if (i > 0) S.push([t0 - 0.1, 'sopro', 0.55]);
      if (c.tipo === 'abertura') { S.push([t0 + 0.05, 'formar', 0.7, 1.4]); for (let k = 0; k < 10; k++) S.push([t0 + 0.15 + k * 0.09, 'tique', 0.18]); }
      if (c.tipo === 'item') { S.push([t0 + 0.18, 'ping', 0.42, 0, ESCALA[(c.n - 1) % 10]], [t0 + 0.35, 'formar', 0.35, 0.8]); }
      if (c.tipo === 'item' || c.tipo === 'reflexo' || c.tipo === 'valor') {
        if (c.objeto === 'paz') S.push([t0 + 0.4, 'varredura', 0.25, cena.t1 - t0 - 0.8]);
        if (c.objeto === 'celebrar') for (let k = 0; k < 8; k++) S.push([t0 + 0.5 + k * 0.12, 'ping', 0.16, 0, 1568 + k * 90]);
        if (c.objeto === 'limites') S.push([t0 + 0.85, 'trava', 0.35]);
        if (c.objeto === 'apoiar') S.push([t0 + 0.3, 'pop', 0.4]);
      }
      if (cena.verso0 != null) S.push([t0 + cena.verso0 - 0.05, 'ping', 0.22, 0, 1760]);
      if (c.tipo === 'final') {
        for (let k = 0; k < 10; k++) S.push([t0 + 0.3 + k * 0.1, 'tique', 0.2]);
        const tc = finalChecks(cena); tc.forEach((tt, k) => S.push([t0 + tt, 'ping', 0.3, 0, ESCALA[k]]));
      }
      if (c.tipo === 'cta') { S.push([t0 + 0.1, 'subida', 0.35, 1.0], [t0 + 1.1, 'impacto', 0.45], [t0 + (w[0] - t0) + 0.05, 'pop', 0.45]); }
    });
    window.__sons = S;
    S.forEach(([t, som, g, d, tom]) => window.__events.push({ t: +t.toFixed(3), frame: Math.round(t * 30), type: 'sfx', label: [som, g, d || 0, tom || 0].join('|') }));
  }
  function finalChecks(cena) { const d = (cena.t1 - cena.t0); const a = 0.9, b = Math.max(a + 1.5, d - 1.2); return Array.from({ length: 10 }, (_, k) => a + (b - a) * k / 9); }

  /* ---------- legenda karaokê (2 linhas, palavra dita acende) ---------- */
  function legenda(t) {
    const f = FRASES.find(f => t >= f.t0 && t < f.t1); if (!f) return;
    const ws = PALAVRAS.slice(f.i0, f.i1 + 1), tam = 26, maxW = 430;
    const fonte = w => `${w.verso ? 'italic ' : ''}${w.neg ? 600 : 400} ${tam}px ${F}`;
    ctx.save(); ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '-0.2px';
    ctx.font = `400 ${tam}px ${F}`; const esp = ctx.measureText(' ').width;
    const larg = ws.map(w => { ctx.font = fonte(w); return ctx.measureText(w.txt).width; });
    const linhas = [[]]; let lw = 0;
    ws.forEach((w, i) => { const add = (linhas[linhas.length - 1].length ? esp : 0) + larg[i]; if (lw + add > maxW && linhas[linhas.length - 1].length) { linhas.push([]); lw = 0; } linhas[linhas.length - 1].push(i); lw += (linhas[linhas.length - 1].length > 1 ? esp : 0) + larg[i]; });
    const ent = eo(pr(t, f.t0, 0.15)), sai = 1 - pr(t, f.t1 - 0.12, 0.12), alt = 33;
    const y0 = LEG_Y - (linhas.length - 1) * alt / 2 + 6 * (1 - ent) + 8;
    linhas.forEach((li, k) => {
      const tot = li.reduce((s, i, j) => s + larg[i] + (j ? esp : 0), 0); let x = CX - tot / 2;
      li.forEach(i => {
        const w = ws[i], aceso = eo(pr(t, w.t - 0.02, 0.14));
        ctx.font = fonte(w);
        ctx.globalAlpha = ent * sai * lerp(0.3, 1, aceso);
        ctx.shadowColor = `rgba(255,255,255,${0.55 * aceso})`; ctx.shadowBlur = (w.neg ? 12 : 7) * K * aceso;
        ctx.fillStyle = w.neg ? '#ffffff' : '#f2f0ee'; ctx.fillText(w.txt, x, y0 + k * alt);
        x += larg[i] + esp;
      });
    });
    ctx.restore();
  }

  /* ---------- quadro ---------- */
  function quadro(t) {
    ctx.setTransform(K, 0, 0, K, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    fundo(t);
    let ci = CENAS.findIndex(c => t >= c.t0 && t < c.t1); if (ci < 0) ci = CENAS.length - 1;
    const cena = CENAS[ci], c = cena.c, lt = t - cena.t0, dur = cena.t1 - cena.t0;
    const S = { t: lt, dur, w: cena.w.map(x => x - cena.t0), palavras: cena.palavras };
    const ant = CENAS[ci - 1];
    // cor da cúpula: transição suave a partir da cor anterior
    const corAnt = ant && ant.c.cor ? ant.c.cor : (c.cor || ARCO[0]), corAt = c.cor || corAnt;
    const cor = mixC(corAnt, corAt, eio(pr(lt, 0, 0.7)));
    // posição da cúpula: sobe depois da abertura, desce no final
    let dy = 0;
    if (c.tipo === 'abertura') dy = 700;
    else if (ant && ant.c.tipo === 'abertura') dy = 700 * (1 - eio(pr(lt, 0, 1.0)));
    if (c.tipo === 'final' || c.tipo === 'cta') dy = c.tipo === 'cta' ? 700 : 700 * eio(pr(lt, 0, 1.0));
    const z = 1 + 0.025 * Math.sin(t * 0.25);
    ctx.save(); ctx.translate(CX, 640); ctx.scale(z, z); ctx.translate(-CX, -640);
    holofote(t, 1); fios(c.tipo === 'abertura' || c.tipo === 'final' || c.tipo === 'cta' ? .5 : 1);
    domo(t, cor, dy, 1);
    const temFigura = !['abertura', 'final', 'cta'].includes(c.tipo);
    const aObj = env(lt, 0.15, dur + 0.05, 0.5, 0.4);
    if (temFigura) {
      // objetos que ficam ATRÁS da figura principal; os outros são desenhados à frente
      const ATRAS = ['incluir', 'comunicar', 'celebrar', 'encorajar', 'paz', 'limites', 'focar'];
      const obj = c.objeto && OBJ[c.objeto];
      if (obj && ATRAS.includes(c.objeto)) obj(S, aObj, cor);
      const entra = ant && ant.c.tipo === 'abertura' ? eo(pr(lt, 0.3, 0.8)) : 1;
      const peito = c.objeto === 'incluir' ? eo(pr(lt, 0.4, 0.6)) * (0.8 + 0.2 * Math.sin(lt * 4)) : 0;
      figura(PRINCIPAL.x, PRINCIPAL.pes + dy, PRINCIPAL.h, { a: entra, peito });
      if (obj && !ATRAS.includes(c.objeto)) obj(S, aObj, cor);
    }
    // abertura e final: a torre da lista
    if (c.tipo === 'abertura') {
      const a = 1 - eio(pr(lt, dur - 0.5, 0.5));
      torre(CX, 790, 1.0, t, { a, discos: i => eo(pr(lt, 0.05 + i * 0.09, 0.5)) });
    }
    if (c.tipo === 'final') {
      const tc = finalChecks(cena);
      torre(CX, 800, 0.92, t, { a: eo(pr(lt, 0.2, 0.6)), discos: i => eo(pr(lt, 0.3 + i * 0.1, 0.5)), checks: i => pr(lt, tc[i], 0.3) });
    }
    if (c.tipo === 'cta') {
      torre(CX + 30, 760, 0.62, t, { a: 1, checks: () => 1 });
      perfil(CX - 10, 270, 600, eio(pr(lt, 0.05, 1.2)), 1);
    }
    // número do item (e saída do anterior)
    if (ant && ant.c.tipo === 'item' && lt < 0.4) numero(String(ant.c.n), 540, 300, ant.c.cor, 1, pr(lt, 0, 0.35));
    if (c.tipo === 'item') numero(String(c.n), 540, 300, c.cor, pr(lt, 0.12, 0.55), pr(lt, dur + 1, 1));
    ctx.restore();
    esmaecerBase();
    legenda(t);
    // selo da referência bíblica
    if (c.verso && cena.verso0 != null) selo(partesRef(c.verso.ref), PILL_Y, eo(pr(lt, cena.verso0 - 0.05, 0.35)) * (1 - pr(lt, dur - 0.25, 0.22)));
    if (c.tipo === 'cta') {
      const p1 = eo(pr(lt, S.w[0] - 0.1, 0.35)), troca = pr(lt, S.w[Math.min(3, S.w.length - 1)], 0.3);
      selo(c.selo1 || [['COMENTE ', false], ['ASCENDER', true]], PILL_Y, p1 * (1 - troca));
      selo(c.selo2 || [['SUBA PARA ', false], ['A LISTA', true]], PILL_Y, troca);
    }
  }

  async function iniciar() {
    await Promise.all([`400 26px ${F}`, `600 26px ${F}`, `700 26px ${F}`, `italic 400 26px ${F}`, `italic 600 26px ${F}`].map(f => document.fonts.load(f).catch(() => {})));
    montar(); quadro(0);
  }
  window.__ready = iniciar();
  window.__seek = async t => { await window.__ready; quadro(t); };
})();
