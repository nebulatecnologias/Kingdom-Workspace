/* =====================================================================
   MOTOR — modelo de vídeo "partículas" (vertical 9:16)
   Fundo escuro, objetos em pontilhado/partículas, etiquetas mono,
   legenda palavra-a-palavra (atual em negrito branco, anteriores cinza).
   Cada quadro é função pura do tempo: window.__seek(t) desenha o quadro t.
   O roteiro (roteiro.js) define window.ROTEIRO = [ {tipo, frases, ...}, ... ]
   ===================================================================== */
(function () {
  const W = 720, H = 1280;            // coordenadas de desenho (sempre 720x1280)
  const K = 1.5;                      // saída 1080x1920
  const CX = 360, CY = 540;           // centro visual (acima da legenda)
  const LEG_Y = 1000;                 // linha de base da legenda

  const cv = document.createElement('canvas');
  cv.width = W * K; cv.height = H * K;
  cv.style.width = (W * K) + 'px'; cv.style.height = (H * K) + 'px';
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');

  /* ---------- utilitários ---------- */
  const R = s => { let a = s >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const cl = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const pr = (t, a, d) => cl((t - a) / d);
  const eo = p => 1 - Math.pow(1 - p, 3);
  const eo5 = p => 1 - Math.pow(1 - p, 5);
  const eio = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  const lerp = (a, b, p) => a + (b - a) * p;
  // Todos os textos em Google Sans (fontes/google-sans.css, variável 400–700, normal e itálico)
  const FONTE = '"Google Sans", sans-serif';
  const MONO = FONTE, SANS = FONTE, SERIF = FONTE;
  const BRANCO = '#f2f2f2', CINZA = '#8c8c8c';

  /* ---------- camada de partículas ---------- */
  class Camada {
    constructor(seed) { this.r = R(seed); this.p = []; this.g = 0; }
    grupo(g) { this.g = g; return this; }
    ponto(x, y, o = {}) {
      const r = this.r, amin = o.amin ?? 0.45;
      this.p.push({ x, y, s: o.s ?? (r() < .18 ? 2 : 1.35), a: (o.a ?? 1) * (amin + (1 - amin) * r()),
        ph: r() * 6.283, f: 1.5 + r() * 6, an: r() * 6.283, di: (o.di ?? 1) * (40 + r() * 220), d: r(), g: this.g, q: o.q || 0 });
    }
    traco(pts, o = {}) {
      const r = this.r, den = o.den ?? 1.25, jit = o.jit ?? 0.75, hal = o.hal ?? 0.12;
      const gs = () => (r() + r() + r() - 1.5) * jit;
      for (let i = 0; i < pts.length - 1; i++) {
        const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
        const n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) * den));
        for (let k = 0; k < n; k++) {
          const u = (k + r()) / n, x = x1 + (x2 - x1) * u, y = y1 + (y2 - y1) * u;
          this.ponto(x + gs(), y + gs(), o);
          if (r() < hal) { const an = r() * 6.283, dd = 2 + r() * r() * 9; this.ponto(x + Math.cos(an) * dd, y + Math.sin(an) * dd, { a: (o.a ?? 1) * 0.4, amin: .2, s: 1.2, di: o.di }); }
        }
      }
      return this;
    }
    linha(x1, y1, x2, y2, o) { return this.traco([[x1, y1], [x2, y2]], o); }
    rret(x, y, w, h, r, o) {
      const pts = [], seg = (cx, cy, a0) => { for (let k = 0; k <= 8; k++) { const a = a0 + k / 8 * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
      seg(x + w - r, y + r, -Math.PI / 2); seg(x + w - r, y + h - r, 0); seg(x + r, y + h - r, Math.PI / 2); seg(x + r, y + r, Math.PI); pts.push(pts[0]);
      return this.traco(pts, o);
    }
    elipse(cx, cy, rx, ry, o, a0 = 0, a1 = 6.2832) {
      const n = Math.max(14, Math.round((rx + ry) * 0.6)), pts = [];
      for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * k / n; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
      return this.traco(pts, o);
    }
    circ(cx, cy, r, o) { return this.elipse(cx, cy, r, r, o); }
    pontilhado(pts, esp = 6, o = {}) {
      let resto = 0;
      for (let i = 0; i < pts.length - 1; i++) {
        const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], L = Math.hypot(x2 - x1, y2 - y1);
        let s = resto; while (s < L) { const u = s / L; this.ponto(x1 + (x2 - x1) * u, y1 + (y2 - y1) * u, { s: o.s ?? 1.8, a: o.a ?? .9, amin: .7, di: o.di }); s += esp; }
        resto = s - L;
      }
      return this;
    }
    bloco(x, y, w, h, dens = 0.5, o = {}) {
      const r = this.r, n = Math.round(w * h * dens / 2);
      for (let k = 0; k < n; k++) this.ponto(x + r() * w, y + r() * h, { s: r() < .3 ? 2 : 1.3, a: o.a ?? .8, amin: .3, di: o.di });
      return this;
    }
    linhasTexto(x, y, w, n, esp = 11, o = {}) {
      for (let i = 0; i < n; i++) { const lw = w * (i === n - 1 ? 0.45 + 0.3 * this.r() : 0.8 + 0.2 * this.r()); this.bloco(x, y + i * esp, lw, o.alt ?? 3.4, o.dens ?? 0.6, o); }
      return this;
    }
    texto(str, x, y, fonte, o = {}) {
      const c = document.createElement('canvas'), q = c.getContext('2d');
      q.font = fonte; if (o.ls) q.letterSpacing = o.ls;
      const m = q.measureText(str), size = parseFloat(fonte.match(/(\d+(\.\d+)?)px/)[1]);
      const w = Math.ceil(m.width) + 40, h = Math.ceil(size * 1.6);
      c.width = w; c.height = h; q.font = fonte; if (o.ls) q.letterSpacing = o.ls;
      q.fillStyle = '#fff'; q.textBaseline = 'middle'; q.fillText(str, 20, h / 2);
      const d = q.getImageData(0, 0, w, h).data, st = o.passo ?? 2, pb = o.prob ?? 0.85;
      const ox = (o.alinha === 'esq' ? x : x - (w - 40) / 2) - 20, oy = y - h / 2;
      for (let yy = 0; yy < h; yy += st) for (let xx = 0; xx < w; xx += st) {
        const a = d[(Math.floor(yy) * w + Math.floor(xx)) * 4 + 3];
        if (a > 90 && this.r() < pb * a / 255) {
          const j = () => (this.r() - .5) * st * 0.7;
          this.ponto(ox + xx + j(), oy + yy + j(), o);
          if (this.r() < (o.hal ?? 0.05)) { const an = this.r() * 6.283, dd = 3 + this.r() * 12; this.ponto(ox + xx + Math.cos(an) * dd, oy + yy + Math.sin(an) * dd, { a: .35, amin: .1, s: 1.2, di: o.di }); }
        }
      }
      return this;
    }
    /* meio-tom: pinta uma imagem (função pintor ou <img>) e converte em grelha de quadrados */
    meiotom(fonte, x, y, w, h, cel = 7, o = {}) {
      const big = document.createElement('canvas'); big.width = w; big.height = h; const b = big.getContext('2d');
      if (typeof fonte === 'function') fonte(b, w, h);
      else { b.fillStyle = '#000'; b.fillRect(0, 0, w, h); const s = Math.max(w / fonte.width, h / fonte.height); b.filter = 'grayscale(1) contrast(1.15)'; b.drawImage(fonte, (w - fonte.width * s) / 2, (h - fonte.height * s) / 2, fonte.width * s, fonte.height * s); }
      const c = document.createElement('canvas'); c.width = Math.ceil(w / cel); c.height = Math.ceil(h / cel);
      const q = c.getContext('2d'); q.imageSmoothingQuality = 'high'; q.drawImage(big, 0, 0, c.width, c.height);
      const d = q.getImageData(0, 0, c.width, c.height).data, r = this.r;
      for (let j = 0; j < c.height; j++) for (let i = 0; i < c.width; i++) {
        const k = (j * c.width + i) * 4, l = (0.3 * d[k] + 0.59 * d[k + 1] + 0.11 * d[k + 2]) / 255;
        if (l < 0.06) continue;
        this.p.push({ x: x + i * cel, y: y + j * cel, s: cel - 1.7, a: Math.pow(l, 1.15) * (o.a ?? 1), ph: r() * 6.283, f: 1 + r() * 3,
          an: r() * 6.283, di: 30 + r() * 260, d: r() * 0.6 + (j / c.height) * 0.4, g: this.g, q: 1 });
      }
      return this;
    }
  }

  /* desenha uma camada. o: {t0, dur, esp, gt(g)->tempo|null, nuvem, t1, sai, alfa} */
  function desenha(cam, t, o = {}) {
    ctx.fillStyle = o.cor || BRANCO;
    const dur = o.dur ?? 0.75, esp = o.esp ?? 0.45, alfa = o.alfa ?? 1;
    for (const p of cam.p) {
      let ta = o.t0 ?? 0;
      if (o.gt) { const g = o.gt(p.g); if (g == null) continue; ta = g; }
      ta += p.d * esp;
      let k = (t - ta) / dur; if (k <= 0) continue; k = k > 1 ? 1 : eo(k);
      let sc = 1 - k, a = p.a * Math.min(1, k * 2.5) * alfa, x = p.x, y = p.y, an = p.an;
      if (o.nuvem) { sc = Math.max(sc, o.nuvem); an += t * 0.35 * o.nuvem; }
      x += Math.cos(an) * p.di * sc; y += Math.sin(an) * p.di * sc * 0.8;
      a *= p.q ? 0.86 + 0.14 * Math.sin(t * p.f + p.ph) : 0.62 + 0.38 * Math.sin(t * p.f + p.ph);
      if (!p.q) { x += Math.sin(t * 0.9 + p.ph) * 0.7; y += Math.cos(t * 0.7 + p.ph * 1.3) * 0.7; }
      if (o.t1 != null && t > o.t1) { const e = cl((t - o.t1) / (o.sai ?? 0.4)), ee = e * e; x += Math.cos(p.an) * p.di * ee; y += Math.sin(p.an) * p.di * ee; a *= 1 - e; }
      if (a < 0.012) continue;
      ctx.globalAlpha = a > 1 ? 1 : a; ctx.fillRect(x, y, p.s, p.s);
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- elementos nítidos (etiquetas, rótulos, réguas) ---------- */
  function etiqueta(x, y, txt, p = 1, o = {}) {
    const n = Math.round(txt.length * cl(p)); if (n <= 0) return 0;
    const s = txt.slice(0, n), tam = o.tam || 10;
    ctx.save(); ctx.globalAlpha *= (o.alfa ?? 1);
    ctx.font = `700 ${tam}px ${MONO}`; ctx.letterSpacing = '1px';
    const w = ctx.measureText(s).width + 10, h = tam + 7;
    let xx = x; if (o.alinha === 'centro') xx = x - w / 2; else if (o.alinha === 'dir') xx = x - w;
    ctx.fillStyle = '#ececec'; ctx.fillRect(xx, y, w, h);
    ctx.fillStyle = '#0b0b0b'; ctx.textBaseline = 'middle'; ctx.fillText(s, xx + 5, y + h / 2 + 0.5);
    ctx.restore(); return w;
  }
  function rotulo(x, y, txt, p = 1, o = {}) {
    const n = Math.round(txt.length * cl(p)); if (n <= 0) return;
    ctx.save(); ctx.globalAlpha *= (o.alfa ?? 1);
    ctx.font = `${o.peso || 500} ${o.tam || 9}px ${MONO}`; ctx.letterSpacing = o.ls || '1.6px';
    ctx.fillStyle = o.cor || '#7d7d7d'; ctx.textBaseline = 'middle';
    ctx.textAlign = o.alinha === 'centro' ? 'center' : o.alinha === 'dir' ? 'right' : 'left';
    ctx.fillText(txt.slice(0, n), x, y); ctx.restore();
  }
  function cantos(x, y, w, h, L = 14, a = 0.75) {
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = BRANCO; ctx.lineWidth = 1; ctx.beginPath();
    [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].forEach(([px, py, sx, sy]) => { ctx.moveTo(px + .5, py + sy * L); ctx.lineTo(px + .5, py + .5); ctx.lineTo(px + sx * L, py + .5); });
    ctx.stroke(); ctx.restore();
  }
  function regua(x0, x1, y, pos, esq, dir, a = 1) {
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = '#6a6a6a'; ctx.lineWidth = 1; ctx.beginPath();
    ctx.moveTo(x0, y + .5); ctx.lineTo(x1, y + .5);
    let i = 0; for (let x = x0; x <= x1 + .1; x += 8, i++) { const h = i % 5 === 0 ? 5 : 3; ctx.moveTo(Math.round(x) + .5, y); ctx.lineTo(Math.round(x) + .5, y - h); }
    ctx.stroke(); ctx.restore();
    rotulo(x0, y + 9, esq, 1, { tam: 7.5, alfa: a }); rotulo(x1, y + 9, dir, 1, { tam: 7.5, alinha: 'dir', alfa: a });
    const mx = lerp(x0, x1, pos);
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = BRANCO; ctx.fillRect(Math.round(mx), y - 12, 1.2, 20); ctx.restore();
    return mx;
  }
  function serif(txt, x, y, tam, a = 1, o = {}) {
    ctx.save(); ctx.globalAlpha *= a; ctx.font = `${o.italico ? 'italic ' : ''}${tam}px ${SERIF}`; ctx.fillStyle = o.cor || '#e8e8e8';
    ctx.textAlign = o.alinha || 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = o.ls || '0px'; ctx.fillText(txt, x, y); ctx.restore();
  }
  function mono(txt, x, y, tam, a = 1, o = {}) { // algarismos em células de largura fixa: o número não "treme" ao contar
    ctx.save(); ctx.globalAlpha *= a; ctx.font = `${o.peso || 600} ${tam}px ${MONO}`; ctx.fillStyle = o.cor || BRANCO;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.letterSpacing = '0px';
    const ls = parseFloat(o.ls || '0'), cel = Math.max(...'0123456789'.split('').map(d => ctx.measureText(d).width));
    const larg = [...txt].map(ch => (/\d/.test(ch) ? cel : ctx.measureText(ch).width) + ls), tot = larg.reduce((p, q) => p + q, 0) - ls;
    let xx = o.alinha === 'left' ? x : o.alinha === 'right' ? x - tot : x - tot / 2;
    [...txt].forEach((ch, i) => { ctx.fillText(ch, xx + (larg[i] - ls) / 2, y); xx += larg[i]; });
    ctx.restore();
  }
  function brilho(x, y, r, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  function pontoVivo(x, y, t, a = 1) { // o "pontinho" do modelo
    ctx.save(); ctx.globalAlpha *= a; brilho(x, y, 16, 0.35 + 0.1 * Math.sin(t * 3)); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 6.283); ctx.fill(); ctx.restore();
  }

  /* ---------- pintores para meio-tom (imagens geradas por código) ---------- */
  function rr(b, x, y, w, h, r) { b.beginPath(); b.roundRect(x, y, w, h, r); }
  const PINTORES = {
    maquina(b, w, h) {
      b.fillStyle = '#000'; b.fillRect(0, 0, w, h);
      let g = b.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#9a9a9a'); g.addColorStop(1, '#262626');
      b.fillStyle = g; rr(b, 16, 24, w - 32, h - 48, 16); b.fill();
      b.fillStyle = '#141414'; rr(b, 34, 40, w - 68, 26, 6); b.fill();
      for (let i = 0; i < 6; i++) { b.fillStyle = i % 2 ? '#e0e0e0' : '#7a7a7a'; b.beginPath(); b.arc(56 + i * 22, 53, 5, 0, 6.283); b.fill(); }
      const cols = 4, rows = 3, R0 = Math.min((w - 68) / cols, (h - 150) / rows) * 0.42;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const cx = 34 + (w - 68) * (c + .5) / cols, cy = 92 + (h - 160) * (r + .5) / rows;
        const gr = b.createRadialGradient(cx - R0 * .35, cy - R0 * .35, 2, cx, cy, R0); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.55, '#b9b9b9'); gr.addColorStop(1, '#2c2c2c');
        b.fillStyle = gr; b.beginPath(); b.arc(cx, cy, R0, 0, 6.283); b.fill();
        b.strokeStyle = '#111'; b.lineWidth = 3; for (let k = 0; k < 26; k++) { const a = k / 26 * 6.283 + r + c; b.beginPath(); b.moveTo(cx + Math.cos(a) * R0 * .72, cy + Math.sin(a) * R0 * .72); b.lineTo(cx + Math.cos(a) * R0 * .9, cy + Math.sin(a) * R0 * .9); b.stroke(); }
        b.fillStyle = '#0c0c0c'; b.beginPath(); b.arc(cx, cy, R0 * .32, 0, 6.283); b.fill();
        b.fillStyle = '#d8d8d8'; b.beginPath(); b.arc(cx, cy, R0 * .1, 0, 6.283); b.fill();
      }
      b.fillStyle = '#121212'; rr(b, 34, h - 60, w - 68, 22, 5); b.fill();
      for (let i = 0; i < 18; i++) { b.fillStyle = '#5c5c5c'; b.fillRect(44 + i * ((w - 88) / 18), h - 54, 6, 10); }
    },
    rei(b, w, h) {
      b.fillStyle = '#000'; b.fillRect(0, 0, w, h);
      const cx = w / 2, g = b.createLinearGradient(cx - 120, 0, cx + 120, 0);
      g.addColorStop(0, '#5a5a5a'); g.addColorStop(.28, '#f4f4f4'); g.addColorStop(.6, '#8c8c8c'); g.addColorStop(1, '#1e1e1e');
      b.fillStyle = g; b.beginPath();
      b.ellipse(cx, h - 34, 125, 22, 0, 0, 6.283); b.fill();
      b.beginPath(); b.moveTo(cx - 118, h - 36); b.lineTo(cx - 108, h - 82); b.lineTo(cx + 108, h - 82); b.lineTo(cx + 118, h - 36); b.fill();
      b.beginPath(); b.ellipse(cx, h - 86, 100, 14, 0, 0, 6.283); b.fill();
      b.beginPath(); b.moveTo(cx - 78, h - 90); b.quadraticCurveTo(cx - 34, h - 200, cx - 40, 190); b.lineTo(cx + 40, 190); b.quadraticCurveTo(cx + 34, h - 200, cx + 78, h - 90); b.fill();
      b.beginPath(); b.ellipse(cx, 186, 74, 15, 0, 0, 6.283); b.fill();
      b.beginPath(); b.moveTo(cx - 52, 178); b.lineTo(cx - 70, 108); b.quadraticCurveTo(cx, 92, cx + 70, 108); b.lineTo(cx + 52, 178); b.fill();
      b.beginPath(); b.ellipse(cx, 106, 70, 13, 0, 0, 6.283); b.fill();
      b.fillRect(cx - 10, 22, 20, 80); b.fillRect(cx - 32, 44, 64, 18);
      const hl = b.createRadialGradient(cx - 30, 150, 4, cx - 30, 150, 140); hl.addColorStop(0, 'rgba(255,255,255,.35)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
      b.globalCompositeOperation = 'source-atop'; b.fillStyle = hl; b.fillRect(0, 0, w, h); b.globalCompositeOperation = 'source-over';
    },
  };

  /* ---------- TIPOS DE CENA ---------- */
  // Cada tipo recebe os parâmetros do roteiro (c) e devolve { prep(), draw(S) }.
  // S = { t: tempo local, dur, w: [tempo local de cada palavra], sai: fator de saída 1→0 }
  const TIPOS = {};

  TIPOS.retrato = c => {
    let cam; const [bx, by, bw, bh] = c.caixa || [150, 250, 420, 450];
    return {
      prep(seed) { cam = new Camada(seed); cam.meiotom(c.imagem ? IMAGENS[c.imagem] : PINTORES[c.pintor], bx, by, bw, bh, c.celula || 7); },
      draw(S) {
        desenha(cam, S.t, { t0: 0.02, dur: 0.85, esp: 0.55, t1: S.dur - 0.38, sai: 0.38 });
        const a = S.sai * eo(pr(S.t, 0.15, 0.4));
        cantos(bx - 12, by - 12, bw + 24, bh + 24, 14, 0.7 * a);
        const iE = c.iEtiqueta ?? 0;
        const tw = etiqueta(bx - 12, by - 34, c.etiqueta, pr(S.t, S.w[iE] - 0.25, 0.35), { alfa: S.sai });
        rotulo(bx - 12 + tw + 22, by - 25, c.rotulo || '', pr(S.t, S.w[iE] - 0.05, 0.5), { alfa: S.sai });
        if (c.regua) {
          const g = c.regua, p = eio(pr(S.t, S.w[g.de ?? 0] - 0.3, Math.max(0.3, S.w[g.ate ?? 1] - S.w[g.de ?? 0] + 0.3)));
          const mx = regua(bx - 12, bx + bw + 12, by + bh + 40, p, g.esq, g.dir, a);
          const txt = g.texto ? g.texto(p, S) : '';
          if (txt) serif(txt, mx, by + bh + 76, 27, a, { ls: '1px' });
        }
      },
    };
  };

  TIPOS.citacao = c => { let cam; return {
    semLegenda: true,
    prep(seed) {
      if (!c.dissolver) return;
      cam = new Camada(seed); const linhas = c.linhas.map(l => l.split(' ')), tam = c.tamanho || 50, alt = tam * 1.18, y0 = CY + 20 - (linhas.length - 1) * alt / 2;
      ctx.save(); ctx.font = `italic ${tam}px ${SERIF}`;
      linhas.forEach((ws, li) => { const t = ws.join(' '), w = ctx.measureText(t).width; cam.texto(t, CX - w / 2, y0 + li * alt, `italic ${tam}px ${SERIF}`, { alinha: 'esq', passo: 1.4, prob: .8, s: 1.3, di: 1.4, hal: .05 }); });
      ctx.restore();
    },
    draw(S) {
      const td = S.dur - (c.dissolver || 0);
      if (cam && S.t > td - 0.05) desenha(cam, S.t, { t0: -10, t1: td, sai: Math.min(1.1, c.dissolver - 0.35) });
      const dz = cam ? 1 - pr(S.t, td - 0.05, 0.15) : 1;
      const linhas = c.linhas.map(l => l.split(' ')); let i = 0;
      const n = linhas.length, tam = c.tamanho || 50, alt = tam * 1.18, y0 = CY + 20 - (n - 1) * alt / 2;
      const aPonto = c.ponto ? (1 - pr(S.t, S.w[0] - 0.1, 0.25)) : 0;
      if (aPonto > 0) pontoVivo(CX, CY + 20, S.t, aPonto);
      ctx.save(); ctx.font = `italic ${tam}px ${SERIF}`;
      linhas.forEach((ws, li) => {
        const esp = ctx.measureText(' ').width, larg = ws.map(w => ctx.measureText(w).width), tot = larg.reduce((a, b) => a + b, 0) + esp * (ws.length - 1);
        let x = CX - tot / 2;
        ws.forEach((w, k) => {
          const tw = S.w[i++], p = pr(S.t, tw - 0.04, 0.32);
          if (p > 0) serif(w, x + larg[k] / 2, y0 + li * alt + 10 * (1 - eo(p)), tam, eo(p) * S.sai * dz, { italico: true });
          x += larg[k] + esp;
        });
      });
      ctx.restore();
      if (cam) { const pp = pr(S.t, td + 0.5, 0.5); if (pp > 0) pontoVivo(CX, CY + 20, S.t, eo(pp)); }
    },
  }; };

  TIPOS.linhaTempo = c => {
    let cam; const x0 = 90, x1 = 630, y = 640;
    const X = ano => lerp(x0 + 20, x1 - 20, (ano - c.de) / (c.ate - c.de));
    return {
      prep(seed) { cam = new Camada(seed); cam.pontilhado([[x0, y], [x1, y]], 5, { s: 1.6, a: .55 }); },
      draw(S) {
        const sai = S.sai, a = eo(pr(S.t, 0.05, 0.35)) * sai;
        desenha(cam, S.t, { t0: 0, dur: 0.6, esp: 0.3, t1: S.dur - 0.35, sai: 0.35 });
        const p = eio(pr(S.t, S.w[0] - 0.1, (S.w[S.w.length - 1] + 0.25) - S.w[0]));
        const ano = Math.round(lerp(c.de, c.ate, p));
        rotulo(CX, 420, c.rotulo || 'ANO', 1, { alinha: 'centro', alfa: a });
        mono(String(ano), CX, 488, 78, a, { peso: 500, ls: '2px' });
        const hx = X(ano);
        ctx.save(); ctx.globalAlpha = a; brilho(hx, y, 26, .35); ctx.restore();
        let ultimo = -1; c.marcos.forEach((m, k) => { if (ano >= m[0]) ultimo = k; });
        c.marcos.forEach((m, k) => {
          const mx = X(m[0]), on = ano >= m[0];
          ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = on ? '#fff' : '#555'; ctx.fillStyle = '#fff'; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(mx, y, on ? 4.5 : 3.5, 0, 6.283); on ? ctx.fill() : ctx.stroke(); ctx.restore();
          mono(String(m[0]), mx, y - 22, 10, a * (on ? 1 : .45), { peso: 500 });
          if (k === ultimo) etiqueta(mx, y + 16, m[1], pr(S.t, S.t - 1, 1), { alinha: 'centro', tam: 8.5, alfa: a });
          else rotulo(mx, y + 25, m[1], 1, { alinha: 'centro', tam: 7.5, alfa: a * (on ? .9 : .4) });
        });
      },
    };
  };

  TIPOS.visao = c => {
    let cam, grade; const fx = 165, fy = 290, fw = 390, fh = 410;
    return {
      prep(seed) {
        grade = new Camada(seed + 1);
        for (let yy = fy + 14; yy < fy + fh - 8; yy += 13) for (let xx = fx + 14; xx < fx + fw - 8; xx += 13) grade.ponto(xx, yy, { s: 1.2, a: .16, amin: .5 });
        cam = new Camada(seed); const o = { den: 1.5 };
        cam.rret(fx, fy, fw, fh, 18, { den: 1.1, a: .8 });
        const hx = 360, hy = 512;
        cam.elipse(hx, hy, 100, 88, o);
        cam.traco([[282, 462], [270, 362], [334, 428]], o); cam.traco([[438, 462], [450, 362], [386, 428]], o);
        cam.traco([[286, 446], [280, 392], [314, 430]], { den: .8, a: .6 }); cam.traco([[434, 446], [440, 392], [406, 430]], { den: .8, a: .6 });
        cam.elipse(322, 498, 20, 13, o); cam.elipse(398, 498, 20, 13, o);
        cam.linha(322, 489, 322, 507, o); cam.linha(398, 489, 398, 507, o);
        cam.traco([[350, 536], [370, 536], [360, 548], [350, 536]], o);
        cam.traco([[360, 548], [354, 562], [340, 566]], o); cam.traco([[360, 548], [366, 562], [380, 566]], o);
        [[530, -14], [546, 0], [562, 14]].forEach(([yy, d]) => { cam.linha(325, yy + 8, 228, yy + d * 1.6, { den: .9, a: .7 }); cam.linha(395, yy + 8, 492, yy + d * 1.6, { den: .9, a: .7 }); });
        cam.p.forEach(p => { p.g = Math.floor((p.y - fy) / 20); });
      },
      draw(S) {
        const sai = S.sai, a = eo(pr(S.t, 0.05, 0.35)) * sai;
        const s0 = 0.15, s1 = Math.max(s0 + 0.6, S.w[c.iDetecta] - 0.25), N = fh / 20;
        desenha(grade, S.t, { t0: 0, dur: .5, esp: .3, t1: S.dur - .35, sai: .35 });
        desenha(cam, S.t, { gt: g => s0 + (g / N) * (s1 - s0), dur: 0.35, esp: 0.15, t1: S.dur - .38, sai: .38 });
        const ps = pr(S.t, s0, s1 - s0);
        if (ps > 0 && ps < 1) { const ly = fy + ps * fh; ctx.save(); ctx.globalAlpha = .55 * sai; ctx.fillStyle = '#fff'; ctx.fillRect(fx + 6, ly, fw - 12, 1.2); ctx.globalAlpha = .12 * sai; ctx.fillRect(fx + 6, ly - 10, fw - 12, 10); ctx.restore(); }
        const tw = etiqueta(fx, fy - 28, c.etiqueta, pr(S.t, 0.1, 0.35), { alfa: sai });
        rotulo(fx + tw + 18, fy - 19, c.rotulo, pr(S.t, 0.3, 0.5), { alfa: sai });
        const pd = pr(S.t, S.w[c.iDetecta] - 0.08, 0.4);
        if (pd > 0) {
          const k = 1 + 0.35 * (1 - eo5(pd)), bw = 240 * k, bh = 250 * k, bx = 360 - bw / 2, by = 470 - bh / 2;
          cantos(bx, by, bw, bh, 18, eo(pd) * sai);
          const pct = Math.round(lerp(0, c.confianca || 98, eo(pr(S.t, S.w[c.iDetecta], 0.5))));
          etiqueta(bx, by - 22, `${c.deteccao} · ${pct}%`, 1, { alfa: eo(pd) * sai });
        }
      },
    };
  };

  TIPOS.documento = c => {
    let cam; const dx = 205, dy = 265, dw = 310, dh = 430;
    return {
      prep(seed) {
        cam = new Camada(seed);
        cam.grupo(0).traco([[dx, dy], [dx + dw - 40, dy], [dx + dw, dy + 40], [dx + dw, dy + dh], [dx, dy + dh], [dx, dy]], { den: 1.2 });
        cam.traco([[dx + dw - 40, dy], [dx + dw - 40, dy + 40], [dx + dw, dy + 40]], { den: 1, a: .7 });
        (c.titulo || []).forEach((l, i) => cam.texto(l, dx + 26, dy + 48 + i * 26, `700 21px ${SANS}`, { alinha: 'esq', passo: 1, prob: .75, hal: .02, s: 1.1, a: 1, amin: .6 }));
        cam.grupo(1).linhasTexto(dx + 26, dy + 112, 170, 1, 10, { dens: .45, a: .6 });
        cam.linhasTexto(dx + 26, dy + 140, dw - 52, 5, 11);
        cam.grupo(2).rret(CX - 70, dy + 222, 140, 40, 8, { den: 1.1 }).rret(CX - 70, dy + 282, 140, 40, 8, { den: 1.1 });
        cam.bloco(CX - 40, dy + 240, 80, 4, .7).bloco(CX - 40, dy + 300, 80, 4, .7);
        cam.linha(CX, dy + 262, CX, dy + 282, { den: 1.2 }).linha(CX, dy + 322, CX, dy + 340, { den: 1.2 });
        cam.grupo(3).linhasTexto(dx + 26, dy + 360, dw - 52, 5, 11);
      },
      draw(S) {
        const sai = S.sai, gt = [0.02, S.w[1] - 0.2, S.w[3] - 0.2, S.w[4] - 0.2];
        desenha(cam, S.t, { gt: g => gt[g], dur: 0.7, esp: 0.4, t1: S.dur - .38, sai: .38 });
        etiqueta(dx, dy - 26, c.arquivo, pr(S.t, 0.15, 0.6), { alfa: sai });
        rotulo(CX, dy + dh + 30, c.rodape, pr(S.t, S.w[3], 0.6), { alinha: 'centro', alfa: sai });
        const pc = pr(S.t, S.w[c.iDestaque] - 0.1, 0.45);
        if (pc > 0) {
          const r = 96 + 30 * (1 - eo5(pc));
          ctx.save(); ctx.globalAlpha = eo(pc) * sai; ctx.strokeStyle = '#d9d9d9'; ctx.lineWidth = 1.1; ctx.setLineDash([3, 4]); ctx.lineDashOffset = -S.t * 8;
          ctx.beginPath(); ctx.arc(CX, dy + 272, r, 0, 6.283); ctx.stroke(); ctx.restore();
          etiqueta(CX, dy + 272 + r - 8, c.destaque, pr(S.t, S.w[c.iDestaque], 0.4), { alinha: 'centro', alfa: sai });
        }
      },
    };
  };

  TIPOS.chat = c => {
    let cam, resp; const px = 215, py = 190, pw = 290, ph = 600;
    return {
      prep(seed) {
        cam = new Camada(seed); cam.rret(px, py, pw, ph, 42, { den: 1.6, hal: .2 }); cam.rret(CX - 36, py + 14, 72, 20, 10, { den: 1.2, a: .7 });
        resp = new Camada(seed + 7); for (let i = 0; i < 6; i++) resp.grupo(i).bloco(px + 26, py + 236 + i * 15, (i === 5 ? 120 : 200 + 30 * Math.sin(i * 2.3)), 4.2, .75);
      },
      draw(S) {
        const sai = S.sai, iC = c.contador.iInicio, dim = 1 - 0.75 * eo(pr(S.t, S.w[iC] - 0.3, 0.4));
        desenha(cam, S.t, { t0: 0, dur: .8, esp: .5, t1: S.dur - .38, sai: .38, alfa: dim });
        // bolha do usuário
        const pb = pr(S.t, S.w[c.iPergunta] - 0.1, 0.3);
        if (pb > 0) {
          ctx.save(); ctx.globalAlpha = eo(pb) * sai * dim; const bw = 200, bx = px + pw - 22 - bw, by = py + 110 + 10 * (1 - eo(pb));
          ctx.fillStyle = '#e8e8e8'; rr(ctx, bx, by, bw, 54, 16); ctx.fill();
          ctx.fillStyle = '#121212'; ctx.font = `500 14px ${SANS}`; ctx.textBaseline = 'middle';
          c.pergunta.forEach((l, i) => ctx.fillText(l, bx + 14, by + 18 + i * 18)); ctx.restore();
        }
        // digitando… e resposta
        const tr = S.w[c.iResposta];
        if (S.t > S.w[c.iPergunta] + 0.25 && S.t < tr) {
          for (let k = 0; k < 3; k++) { ctx.save(); ctx.globalAlpha = (0.35 + 0.65 * Math.max(0, Math.sin(S.t * 7 - k * .8))) * sai * dim; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px + 34 + k * 12, py + 210, 3, 0, 6.283); ctx.fill(); ctx.restore(); }
        }
        desenha(resp, S.t, { gt: g => tr - 0.1 + g * 0.12, dur: .35, esp: .2, t1: S.dur - .38, sai: .38, alfa: dim });
        // contador
        const k = c.contador, pc = pr(S.t, S.w[iC] - 0.15, 0.3);
        if (pc > 0) {
          const v = Math.round(lerp(k.de, k.ate, eo(pr(S.t, S.w[iC] - 0.1, (S.w[k.iFim] ?? S.w[iC] + 1) - S.w[iC] + 0.2))));
          const a2 = eo(pc) * sai;
          etiqueta(CX, 430, k.etiqueta, pr(S.t, S.w[iC] - 0.15, 0.35), { alinha: 'centro', alfa: a2 });
          mono(`${v}${k.sufixo || ''}`, CX, 510 + 14 * (1 - eo(pc)), 88, a2, { peso: 500, ls: '2px' });
          rotulo(CX, 582, k.rotulo, pr(S.t, S.w[k.iRotulo ?? iC + 4] - 0.1, 0.5), { alinha: 'centro', alfa: a2, tam: 10 });
        }
      },
    };
  };

  TIPOS.palavra = c => {
    let cam;
    return {
      prep(seed) {
        cam = new Camada(seed); const tmp = document.createElement('canvas').getContext('2d');
        let tam = 140; tmp.font = `700 ${tam}px ${SANS}`; const w = tmp.measureText(c.texto).width; tam = Math.min(tam, tam * 600 / w);
        cam.texto(c.texto, CX, CY - 10, `700 ${tam}px ${SANS}`, { passo: 2.1, prob: .8, di: 1.1, s: 1.6, hal: .07, ls: '-3px' });
      },
      draw(S) {
        const tf = S.w[c.iForma] - 0.55, nuvem = 0.42 * (1 - eio(pr(S.t, tf, 0.9)));
        desenha(cam, S.t, { t0: 0, dur: 0.9, esp: 0.5, nuvem, t1: S.dur - 0.45, sai: 0.45, alfa: lerp(1, 0.55, nuvem) });
        if (c.rotulo) rotulo(CX, CY + 70, c.rotulo, pr(S.t, S.w[c.iForma] + 0.25, 0.6), { alinha: 'centro', alfa: S.sai });
      },
    };
  };

  TIPOS.rota = c => {
    const n = c.etapas.length, y0 = 320, dy = 450 / (n - 1);
    const P = u => [CX + 85 * Math.sin(u * 1.25), y0 + u * dy];
    return {
      prep() {},
      draw(S) {
        const sai = S.sai, a = eo(pr(S.t, 0.05, 0.35)) * sai;
        let atual = -1; c.etapas.forEach((e, k) => { if (S.t >= S.w[e[1]] - 0.03) atual = k; });
        const alvo = Math.max(0, atual), u0 = atual < 0 ? 0 : atual - 1, ta = atual < 0 ? 0 : S.w[c.etapas[atual][1]] - 0.03;
        const prog = atual <= 0 ? 0 : lerp(u0, alvo, eo(pr(S.t, ta, 0.3)));
        rotulo(CX, 214, c.rotulo || 'ETAPAS', 1, { alinha: 'centro', alfa: a });
        mono(`${String(Math.max(0, atual + 1)).padStart(2, '0')} / ${String(n).padStart(2, '0')}`, CX, 250, 28, a, { peso: 600, ls: '1px' });
        ctx.save(); ctx.fillStyle = '#fff';
        for (let u = 0; u <= n - 1; u += 0.045) { const [x, y] = P(u), on = u <= prog; ctx.globalAlpha = a * (on ? .85 : .18); ctx.fillRect(x - .8, y - .8, 1.7, 1.7); }
        ctx.restore();
        c.etapas.forEach((e, k) => {
          const [x, y] = P(k), on = k <= atual, esq = x < CX - 5;
          ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#666';
          ctx.beginPath(); ctx.arc(x, y, on ? 4.5 : 3.5, 0, 6.283); on ? ctx.fill() : ctx.stroke();
          if (k === atual) { brilho(x, y, 22, .3); } ctx.restore();
          const txt = `${String(k + 1).padStart(2, '0')} ${e[0]}`;
          if (k === atual) etiqueta(esq ? x + 14 : x - 14, y - 8.5, txt, 1, { alinha: esq ? 'esq' : 'dir', tam: 9.5, alfa: a });
          else rotulo(esq ? x + 14 : x - 14, y, txt, 1, { alinha: esq ? 'esq' : 'dir', tam: 9.5, cor: on ? '#bdbdbd' : '#666', alfa: a });
        });
      },
    };
  };

  TIPOS.grafico = c => {
    let eixos, curva; const ox = 120, oy = 760, gw = 480, gh = 430, D = c.dobras || 10;
    const F = u => (Math.pow(2, u * D) - 1) / (Math.pow(2, D) - 1);
    const P = u => [ox + u * gw, oy - F(u) * gh];
    return {
      prep(seed) {
        eixos = new Camada(seed); eixos.pontilhado([[ox, oy], [ox + gw + 20, oy]], 5, { s: 1.5, a: .5 }); eixos.pontilhado([[ox, oy], [ox, oy - gh - 20]], 5, { s: 1.5, a: .5 });
        curva = new Camada(seed + 3); const pts = []; for (let u = 0; u <= 1.0001; u += 0.005) pts.push(P(u));
        curva.traco(pts, { den: 1.6, hal: .15 }); curva.p.forEach(p => { p.g = Math.round(cl((p.x - ox) / gw) * 60); });
      },
      draw(S) {
        const sai = S.sai, a = eo(pr(S.t, 0.05, 0.35)) * sai, t0 = S.w[0], t1 = S.w[S.w.length - 1] + 0.2;
        desenha(eixos, S.t, { t0: 0, dur: .6, esp: .3, t1: S.dur - .38, sai: .38 });
        desenha(curva, S.t, { gt: g => t0 + eio(g / 60) * 0 + (g / 60) * (t1 - t0), dur: .25, esp: .1, t1: S.dur - .38, sai: .38 });
        const tw = etiqueta(ox - 10, 215, c.etiqueta, pr(S.t, 0.1, 0.3), { alfa: sai });
        rotulo(ox - 10 + tw + 16, 224, c.rotulo, pr(S.t, 0.25, 0.6), { alfa: sai });
        rotulo(ox, oy + 18, c.anos[0], 1, { alfa: a }); rotulo(ox + gw, oy + 18, c.anos[1], 1, { alinha: 'dir', alfa: a });
        rotulo(ox + 8, oy - 14, c.inicio, pr(S.t, t0, .5), { alfa: a, cor: '#9a9a9a' });
        const uNow = pr(S.t, t0, t1 - t0);
        for (let k = 1; k <= D; k++) {
          const u = k / D; if (uNow < u) break; const [x, y] = P(u);
          ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 6.283); ctx.fill(); ctx.restore();
          const tx = S.w[c.iDobra] + (k - D + 3) * 0.14;
          if (k > D - 3) etiqueta(x - 12, y + 6, '×2', pr(S.t, tx, 0.15), { alinha: 'dir', tam: 8.5, alfa: a });
        }
        const [ex, ey] = P(uNow);
        if (uNow > 0 && uNow < 1) { ctx.save(); ctx.globalAlpha = a; brilho(ex, ey, 22, .45); ctx.restore(); }
        if (uNow >= 1) etiqueta(ox + gw + 6, oy - gh - 26, c.fim, pr(S.t, t1 - 0.05, 0.3), { alinha: 'dir', alfa: a });
      },
    };
  };

  TIPOS.simbolo = c => {
    let cam;
    return {
      prep(seed) { cam = new Camada(seed); cam.texto(c.texto, CX + (c.dx || 0), CY + 10, `italic ${c.tamanho || 500}px ${SERIF}`, { passo: 2.4, prob: .85, s: 1.6, di: 1.6, hal: .06 }); },
      draw(S) {
        const td = S.w[c.iDispersa] - 0.1;
        desenha(cam, S.t, { t0: 0, dur: 1.0, esp: 0.6, t1: td, sai: Math.max(0.6, S.dur - td) });
        const pp = pr(S.t, td + 0.2, 0.5); if (pp > 0) pontoVivo(CX, CY + 20, S.t, eo(pp));
      },
    };
  };

  /* ---------- EFEITOS SONOROS ----------
     Cada tipo devolve deixas [tempoLocal, som, ganho, duração?]. Os tempos seguem as mesmas
     fórmulas do desenho, então cada som cai no quadro exato. sons.py sintetiza e mistura. */
  function tiques(S, valor, ganho = 0.3, de = 0, ate = S.dur) { // um tique sempre que o valor mostrado muda
    const out = []; let ant = valor(de);
    for (let t = de; t < ate; t += 1 / 30) { const v = valor(t); if (v !== ant) { out.push([t, 'tique', ganho]); ant = v; } }
    return out;
  }
  const sopro = (S, g = 0.7, antes = 0.34) => [[S.dur - antes, 'sopro', g]];
  const SONS = {
    retrato(c, S) {
      const iE = c.iEtiqueta ?? 0, out = [[0.02, 'formar', 0.9, 1.1], [S.w[iE] - 0.25, 'digitar', 0.45, 0.35]];
      if (c.regua) {
        const g = c.regua, a0 = S.w[g.de ?? 0] - 0.3, d = Math.max(0.3, S.w[g.ate ?? 1] - S.w[g.de ?? 0] + 0.3);
        out.push(...tiques(S, t => g.texto ? g.texto(eio(pr(t, a0, d)), S) : '', 0.32));
      }
      return out.concat(sopro(S, 0.75, 0.38));
    },
    citacao(c, S) {
      const out = c.ponto ? [[0.05, 'ping', 0.28, 0, 1318]] : [];
      if (c.dissolver) { const td = S.dur - c.dissolver; out.push([td - 0.05, 'dissolver', 0.9, 1.2], [td + 0.5, 'ping', 0.3, 0, 880]); }
      else out.push(...sopro(S, 0.55, 0.32));
      return out;
    },
    linhaTempo(c, S) {
      const p = t => eio(pr(t, S.w[0] - 0.1, (S.w[S.w.length - 1] + 0.25) - S.w[0])), ano = t => Math.round(lerp(c.de, c.ate, p(t)));
      const out = [[0, 'formar', 0.45, 0.7], ...tiques(S, ano, 0.26)];
      c.marcos.forEach((m, k) => { for (let t = 0; t < S.dur; t += 1 / 30) if (ano(t) >= m[0]) { out.push([t, 'ping', 0.32, 0, 1046 * Math.pow(1.122, k)]); break; } });
      return out.concat(sopro(S));
    },
    visao(c, S) {
      const s0 = 0.15, s1 = Math.max(s0 + 0.6, S.w[c.iDetecta] - 0.25);
      return [[0, 'formar', 0.35, 0.6], [0.1, 'digitar', 0.35, 0.3], [s0, 'varredura', 0.5, s1 - s0], [S.w[c.iDetecta] - 0.08, 'trava', 0.6], ...sopro(S)];
    },
    documento(c, S) {
      return [[0.02, 'formar', 0.7, 0.9], [0.15, 'digitar', 0.45, 0.6], [S.w[1] - 0.2, 'formar', 0.35, 0.6], [S.w[3] - 0.2, 'formar', 0.35, 0.6],
        [S.w[c.iDestaque] - 0.1, 'ping', 0.38, 0, 1568], ...sopro(S, 0.75, 0.38)];
    },
    chat(c, S) {
      const k = c.contador, iC = k.iInicio, a0 = S.w[iC] - 0.1, d = (S.w[k.iFim] ?? S.w[iC] + 1) - S.w[iC] + 0.2;
      const v = t => Math.round(lerp(k.de, k.ate, eo(pr(t, a0, d))));
      return [[0, 'formar', 0.7, 1.0], [S.w[c.iPergunta] - 0.1, 'pop', 0.55], [S.w[c.iPergunta] + 0.3, 'digitar', 0.22, S.w[c.iResposta] - S.w[c.iPergunta] - 0.3],
        [S.w[c.iResposta] - 0.1, 'formar', 0.3, 0.8], ...tiques(S, v, 0.2), [a0 + d, 'ping', 0.4, 0, 1318], ...sopro(S, 0.75, 0.38)];
    },
    palavra(c, S) {
      const tf = S.w[c.iForma] - 0.55;
      return [[0, 'formar', 0.5, 2.0], [tf - 0.5, 'subida', 0.55, 0.85], [tf + 0.4, 'impacto', 0.9], [tf + 0.4, 'formar', 0.6, 0.9], ...sopro(S, 0.85, 0.45)];
    },
    rota(c, S) {
      const out = [];
      c.etapas.forEach((e, k) => out.push([S.w[e[1]] - 0.03, 'ping', 0.3, 0, 784 * Math.pow(1.122, k)], [S.w[e[1]] - 0.03, 'tique', 0.3]));
      return out.concat(sopro(S));
    },
    grafico(c, S) {
      const t0 = S.w[0], t1 = S.w[S.w.length - 1] + 0.2, D = c.dobras || 10, out = [[0, 'formar', 0.45, 0.7], [0.1, 'digitar', 0.35, 0.35], [t0, 'subida', 0.3, t1 - t0]];
      for (let k = D - 2; k <= D; k++) out.push([S.w[c.iDobra] + (k - D + 3) * 0.14, 'ping', 0.3, 0, 1046 * Math.pow(1.26, k - D + 2)]);
      return out.concat([[t1 - 0.05, 'trava', 0.45]], sopro(S, 0.75, 0.38));
    },
    simbolo(c, S) { const td = S.w[c.iDispersa] - 0.1; return [[0, 'formar', 0.9, 1.4], [td, 'dissolver', 0.75, Math.max(0.6, S.dur - td)], [td + 0.2, 'ping', 0.25, 0, 880]]; },
  };

  /* ---------- montagem do roteiro (tempos de cada palavra) ---------- */
  const CENAS = [], PALAVRAS = [], FRASES = [], IMAGENS = {};
  const ritmo = Object.assign({ base: 0.14, porLetra: 0.048, virgula: 0.16, ponto: 0.4, frase: 0.06, entrada: 0.45, saida: 0.35 }, window.RITMO || {});
  function montar() {
    let t = 0, seed = 11;
    window.ROTEIRO.forEach((c, ci) => {
      const tipo = TIPOS[c.tipo](c), cena = { c, tipo, t0: t, w: [], ci };
      t += c.entrada ?? ritmo.entrada;
      c.frases.forEach(fr => {
        const [txt, pausa] = Array.isArray(fr) ? fr : [fr, 0];
        const f = { i0: PALAVRAS.length, cena: ci, leg: !tipo.semLegenda };
        txt.split(' ').forEach(p => {
          const letras = p.replace(/[^\p{L}\p{N}]/gu, '').length;
          const d = ritmo.base + ritmo.porLetra * Math.max(2, letras);
          PALAVRAS.push({ txt: p, t, d, frase: FRASES.length }); cena.w.push(t);
          t += d; if (/[,;]$/.test(p)) t += ritmo.virgula; if (/[.:?!…]$/.test(p)) t += ritmo.ponto;
        });
        t += ritmo.frase + pausa; f.i1 = PALAVRAS.length - 1; f.t0 = PALAVRAS[f.i0].t; FRASES.push(f);
      });
      t += c.saidaExtra ?? 0; cena.t1 = t + (c.saida ?? ritmo.saida);
      t = cena.t1; cena.seed = seed += 101; CENAS.push(cena);
    });
    FRASES.forEach((f, i) => {
      const ult = PALAVRAS[f.i1], prox = FRASES[i + 1];
      f.t1 = Math.min(prox ? prox.t0 - 0.03 : 1e9, ult.t + ult.d + 0.55, CENAS[f.cena].t1 - 0.12);
    });
    window.__duration = t;
    window.__events = [];
    CENAS.forEach(c => window.__events.push({ t: c.t0, frame: Math.round(c.t0 * 30), type: 'cut', label: c.c.tipo }));
    PALAVRAS.forEach(p => window.__events.push({ t: +p.t.toFixed(3), frame: Math.round(p.t * 30), type: 'word', label: p.txt }));
    window.__roteiro = { palavras: PALAVRAS.map(p => ({ txt: p.txt, t: +p.t.toFixed(3), fim: +(p.t + p.d).toFixed(3), frase: p.frase })), frases: FRASES.map(f => ({ t0: +f.t0.toFixed(3), t1: +f.t1.toFixed(3), texto: PALAVRAS.slice(f.i0, f.i1 + 1).map(p => p.txt).join(' ') })), duracao: t };
  }

  /* ---------- legenda palavra-a-palavra ---------- */
  function legenda(t) {
    const f = FRASES.find(f => t >= f.t0 && t < f.t1); if (!f || !f.leg) return;
    const vis = []; for (let i = f.i0; i <= f.i1; i++) if (PALAVRAS[i].t <= t) vis.push(PALAVRAS[i]);
    if (!vis.length) return;
    const tam = 31, fBold = `700 ${tam}px ${SANS}`, fReg = `400 ${tam}px ${SANS}`;
    ctx.save(); ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '-0.3px';
    ctx.font = fReg; const esp = ctx.measureText(' ').width;
    const larg = vis.map((p, i) => { ctx.font = i === vis.length - 1 ? fBold : fReg; return ctx.measureText(p.txt).width; });
    const tot = larg.reduce((a, b) => a + b, 0) + esp * (vis.length - 1);
    const fade = 1 - pr(t, f.t1 - 0.09, 0.09);
    let x = CX - tot / 2;
    vis.forEach((p, i) => {
      const atual = i === vis.length - 1, pe = pr(t, p.t, 0.12);
      ctx.font = atual ? fBold : fReg;
      ctx.fillStyle = atual ? (pe < 1 ? `rgb(${Math.round(lerp(150, 245, pe))},${Math.round(lerp(150, 245, pe))},${Math.round(lerp(150, 245, pe))})` : '#f5f5f5') : '#a3a3a3';
      ctx.globalAlpha = fade * (atual ? lerp(0.25, 1, eo(pe)) : 1);
      ctx.fillText(p.txt, x, LEG_Y + (atual ? 7 * (1 - eo(pe)) : 0));
      x += larg[i] + esp;
    });
    ctx.restore();
  }

  /* ---------- quadro ---------- */
  function fundo() {
    ctx.fillStyle = '#0b0b0b'; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(CX, CY + 40, 30, CX, CY + 60, 780); g.addColorStop(0, '#1c1c1c'); g.addColorStop(0.55, '#121212'); g.addColorStop(1, '#090909');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function quadro(t) {
    ctx.setTransform(K, 0, 0, K, 0, 0); fundo();
    let cena = CENAS.find(c => t >= c.t0 && t < c.t1) || CENAS[CENAS.length - 1];
    const lt = t - cena.t0, dur = cena.t1 - cena.t0;
    const S = { t: lt, dur, w: cena.w.map(x => x - cena.t0), sai: 1 - eo(pr(lt, dur - 0.32, 0.28)) };
    if (cena === CENAS[CENAS.length - 1]) S.sai = 1;
    const z = 1 + 0.06 * eio(cl(lt / dur));
    ctx.save(); ctx.translate(CX, CY); ctx.scale(z, z); ctx.translate(-CX, -CY);
    cena.tipo.draw(S); ctx.restore();
    legenda(t);
  }

  async function iniciar() {
    await Promise.all([`400 31px ${FONTE}`, `500 31px ${FONTE}`, `700 31px ${FONTE}`, `italic 400 40px ${FONTE}`, `italic 700 40px ${FONTE}`].map(f => document.fonts.load(f).catch(() => {})));
    await Promise.all(Object.entries(window.IMAGENS_ROTEIRO || {}).map(([k, src]) => new Promise(ok => { const im = new Image(); im.onload = () => { IMAGENS[k] = im; ok(); }; im.onerror = ok; im.src = src; })));
    montar();
    CENAS.forEach(c => c.tipo.prep(c.seed));
    window.__sons = [];
    CENAS.forEach(c => {
      const S = { dur: c.t1 - c.t0, w: c.w.map(x => x - c.t0) }, fn = c.c.sons !== false && SONS[c.c.tipo];
      let deixas = fn ? fn(c.c, S) : [];
      if (c === CENAS[CENAS.length - 1]) deixas = deixas.filter(d => d[1] !== 'sopro');
      deixas.concat(c.c.sonsExtra || []).forEach(([t, som, ganho, dur, tom]) => {
        const tg = +(c.t0 + t).toFixed(3); if (tg < 0) return;
        window.__sons.push({ t: tg, som, ganho, dur: dur || 0, tom: tom || 0 });
        window.__events.push({ t: tg, frame: Math.round(tg * 30), type: 'sfx', label: [som, ganho, dur || 0, tom || 0].join('|') });
      });
    });
    quadro(0);
  }
  window.__ready = iniciar();
  window.__seek = async t => { await window.__ready; quadro(t); };
  window.MOTOR = { TIPOS, PINTORES, Camada };
})();
