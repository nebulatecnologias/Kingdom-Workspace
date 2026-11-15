/* =====================================================================
   MOTOR — modelo "falado" (pessoa a falar + grafismos), identidade Kingdom
   Ecrã dividido: grafismos em cima, apresentador num cartão em baixo, legenda curta no meio.
   Ecrã inteiro: apresentador a toda a tela, com zoom; transição animada entre os dois.
   Entrada: window.FALAS (palavras com tempo), window.SECOES (roteiro de edição), quadros em media/quadros.
   Cada quadro é função pura do tempo: window.__seek(t).
   ===================================================================== */
(function () {
  const CFG = window.MOTOR_CONFIG || {};
  const W = 720, H = 1280, CX = 360, FPS = 30;
  let K = CFG.K || 1.5;
  const F = '"Google Sans", sans-serif';
  const COR = { laranja: '#ff5a00', laranja2: '#ff7a27', laranja3: '#ffa468', pessego: '#ffd2b3', grafite: '#1a1917', grafite2: '#232220', grafite3: '#2e2d2a', linha: '#3a3936', branco: '#ffffff', cinza: '#a7a29b', claro: '#f4f2ef' };
  const cv = CFG.canvas || document.createElement('canvas'); cv.width = W * K; cv.height = H * K;
  if (!CFG.canvas) { cv.style.width = W * K + 'px'; cv.style.height = H * K + 'px'; document.body.appendChild(cv); }
  const ctx = cv.getContext('2d');

  const cl = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v, pr = (t, a, d) => cl((t - a) / d);
  const eo = p => 1 - Math.pow(1 - p, 3), eio = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  const eob = p => { const c = 1.5; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  const lerp = (a, b, p) => a + (b - a) * p;
  const FA = window.FALAS, PAL = FA.palavras, FRA = FA.frases;
  const Wt = i => PAL[Math.max(0, Math.min(PAL.length - 1, i))].t0;     // tempo de uma palavra (índice)
  const SEC = window.SECOES, DUR_VIDEO = window.DURACAO_VIDEO, FIM = window.FECHO || null;
  const NQ = Math.floor(DUR_VIDEO * FPS);
  const DUR = DUR_VIDEO + (FIM ? FIM.duracao : 0);

  /* ---------- quadros do vídeo ---------- */
  const cache = new Map();
  function carregar(i) {
    i = Math.max(1, Math.min(NQ, i)); const src = `media/quadros/${String(i).padStart(5, '0')}.jpg`;
    if (cache.has(src)) return cache.get(src);
    const p = new Promise(ok => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(null); im.src = src; });
    cache.set(src, p); if (cache.size > 24) cache.delete(cache.keys().next().value);
    return p;
  }

  /* ---------- texto ---------- */
  // título com partes em itálico: 'Trabalho *eficiente*'
  function titulo(txt, y, a, o = {}) {
    if (a <= 0) return;
    const tam = o.tam || 40, cor = o.cor || COR.branco, partes = [];
    txt.split(/(\*[^*]+\*)/).filter(Boolean).forEach(p => partes.push(p.startsWith('*') ? [p.slice(1, -1), true] : [p, false]));
    ctx.save(); ctx.globalAlpha = a; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '-0.6px';
    const fnt = it => it ? `italic 400 ${tam}px ${F}` : `700 ${tam}px ${F}`;
    let tot = 0; partes.forEach(([s, it]) => { ctx.font = fnt(it); tot += ctx.measureText(s).width; });
    let x = CX - tot / 2, dy = 14 * (1 - eo(a));
    partes.forEach(([s, it]) => { ctx.font = fnt(it); ctx.fillStyle = it ? (o.corItalico || COR.laranja2) : cor; ctx.fillText(s, x, y + dy); x += ctx.measureText(s).width; });
    ctx.restore();
  }
  function texto(s, x, y, tam, cor, a = 1, o = {}) {
    ctx.save(); ctx.globalAlpha *= a; ctx.font = `${o.peso || 500} ${o.italico ? 'italic ' : ''}${tam}px ${F}`.replace(/(\d+) italic/, 'italic $1');
    ctx.fillStyle = cor; ctx.textAlign = o.alinha || 'left'; ctx.textBaseline = 'middle'; ctx.letterSpacing = o.ls || '0px'; ctx.fillText(s, x, y); ctx.restore();
  }
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

  /* ---------- ícones simples (traço) ---------- */
  function icone(nome, x, y, s, cor) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 24, s / 24); ctx.strokeStyle = cor; ctx.fillStyle = cor; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    const P = {
      subir: () => { ctx.moveTo(-8, 6); ctx.lineTo(-2, 0); ctx.lineTo(2, 4); ctx.lineTo(9, -4); ctx.moveTo(4, -4); ctx.lineTo(9, -4); ctx.lineTo(9, 1); },
      martelo: () => { ctx.rect(-8, -9, 12, 6); ctx.moveTo(-2, -3); ctx.lineTo(-2, 9); },
      relogio: () => { ctx.arc(0, 0, 9, 0, 6.283); ctx.moveTo(0, -5); ctx.lineTo(0, 0); ctx.lineTo(4, 3); },
      raio: () => { ctx.moveTo(2, -10); ctx.lineTo(-6, 2); ctx.lineTo(0, 2); ctx.lineTo(-2, 10); ctx.lineTo(6, -2); ctx.lineTo(0, -2); ctx.closePath(); },
      chave: () => { ctx.arc(-4, 0, 5, 0, 6.283); ctx.moveTo(1, 0); ctx.lineTo(10, 0); ctx.moveTo(7, 0); ctx.lineTo(7, 4); },
      livro: () => { ctx.moveTo(0, -7); ctx.lineTo(0, 8); ctx.moveTo(0, -7); ctx.quadraticCurveTo(-5, -9, -10, -7); ctx.lineTo(-10, 7); ctx.quadraticCurveTo(-5, 5, 0, 8); ctx.quadraticCurveTo(5, 5, 10, 7); ctx.lineTo(10, -7); ctx.quadraticCurveTo(5, -9, 0, -7); },
      pessoas: () => { ctx.arc(-4, -4, 3.5, 0, 6.283); ctx.moveTo(-11, 9); ctx.quadraticCurveTo(-4, 0, 3, 9); ctx.moveTo(9, -3); ctx.arc(5, -3, 3, 0, 6.283); ctx.moveTo(5, 3); ctx.quadraticCurveTo(10, 3, 11, 9); },
      ondas: () => { for (let k = 0; k < 3; k++) { ctx.moveTo(-10, -6 + k * 6); ctx.quadraticCurveTo(-5, -10 + k * 6, 0, -6 + k * 6); ctx.quadraticCurveTo(5, -2 + k * 6, 10, -6 + k * 6); } },
      alvo: () => { ctx.arc(0, 0, 9, 0, 6.283); ctx.moveTo(5, 0); ctx.arc(0, 0, 5, 0, 6.283); ctx.moveTo(1.5, 0); ctx.arc(0, 0, 1.5, 0, 6.283); },
      check: () => { ctx.moveTo(-7, 0); ctx.lineTo(-2, 5); ctx.lineTo(8, -6); },
      seta: () => { ctx.moveTo(0, -9); ctx.lineTo(0, 9); ctx.moveTo(-6, 3); ctx.lineTo(0, 9); ctx.lineTo(6, 3); },
      interrog: () => { ctx.moveTo(-5, -4); ctx.quadraticCurveTo(-5, -10, 0, -10); ctx.quadraticCurveTo(6, -10, 6, -5); ctx.quadraticCurveTo(6, -1, 0, 1); ctx.lineTo(0, 4); ctx.moveTo(0, 9); ctx.arc(0, 8.5, .6, 0, 6.283); },
    };
    (P[nome] || P.check)(); ctx.stroke(); ctx.restore();
  }

  /* ---------- cartão de interface (como na referência) ---------- */
  function cartao(x, y, w, h, a, o = {}) {
    if (a <= 0) return;
    const claro = o.claro, dx = (o.desliza ?? 30) * (1 - eo(a));
    ctx.save(); ctx.globalAlpha = cl(a * 1.5); ctx.translate(dx, 0);
    rr(x, y, w, h, 14);
    if (claro) { ctx.fillStyle = '#ffffff'; ctx.shadowColor = 'rgba(26,25,23,.12)'; ctx.shadowBlur = 18 * K; ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(26,25,23,.08)'; ctx.stroke(); }
    else { const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#2c2b29'); g.addColorStop(1, '#1f1e1c'); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = o.destaque ? COR.laranja2 : 'rgba(255,255,255,.08)'; ctx.lineWidth = o.destaque ? 2 : 1; ctx.stroke(); }
    if (o.icone) {
      const ix = x + 16, iy = y + h / 2 - 17; rr(ix, iy, 34, 34, 9); ctx.fillStyle = o.destaque ? COR.laranja : (claro ? '#ffe9db' : '#383734'); ctx.fill();
      icone(o.icone, ix + 17, iy + 17, 18, o.destaque ? '#fff' : (claro ? COR.laranja : COR.laranja3));
    }
    if (o.texto) texto(o.texto, x + (o.icone ? 64 : 18), y + h / 2 + 1, o.tam || 21, claro ? COR.grafite : '#f4f2ef', 1, { peso: 600 });
    if (o.sub) texto(o.sub, x + w - 16, y + h / 2 + 1, 14, claro ? '#6b6965' : COR.cinza, 1, { alinha: 'right' });
    ctx.restore();
  }
  function seta(x0, y0, x1, y1, a, cor = COR.laranja2) {
    if (a <= 0) return; ctx.save(); ctx.globalAlpha *= cl(a * 2); ctx.strokeStyle = cor; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
    const xm = lerp(x0, x1, eo(a)), ym = lerp(y0, y1, eo(a)); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(xm, ym); ctx.stroke(); ctx.restore();
  }
  function seloVerificado(x, y, r, a) {
    ctx.save(); ctx.globalAlpha = a; ctx.beginPath();
    for (let k = 0; k <= 48; k++) { const an = k / 48 * 6.283, rr2 = r * (0.88 + 0.12 * Math.cos(an * 8)); k ? ctx.lineTo(x + Math.cos(an) * rr2, y + Math.sin(an) * rr2) : ctx.moveTo(x + Math.cos(an) * rr2, y + Math.sin(an) * rr2); }
    ctx.fillStyle = COR.laranja; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = r * .26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - r * .42, y); ctx.lineTo(x - r * .1, y + r * .32); ctx.lineTo(x + r * .45, y - r * .3); ctx.stroke(); ctx.restore();
  }

  /* ---------- GRAFISMOS por tipo de secção (zona de cima: y 60–790) ---------- */
  const G = {};
  G.pergunta = (s, t, a) => {         // dois cartões ligados por uma seta, com ponto de interrogação
    titulo(s.titulo, 190, a * eo(pr(t, s.t0 + .05, .4)));
    const [c1, c2] = s.cartoes;
    cartao(110, 300, 500, 76, eo(pr(t, Wt(c1.i) - .1, .4)) * a, { icone: c1.icone, texto: c1.texto });
    seta(360, 384, 360, 470, pr(t, Wt(c2.i) - .4, .4) * a);
    cartao(110, 478, 500, 76, eo(pr(t, Wt(c2.i) - .1, .4)) * a, { icone: c2.icone, texto: c2.texto, destaque: true });
    const q = eob(pr(t, Wt(s.iPergunta) - .05, .4));
    if (q > 0) { ctx.save(); ctx.globalAlpha = a; ctx.translate(560, 470); ctx.scale(q, q); ctx.fillStyle = COR.laranja; ctx.beginPath(); ctx.arc(0, 0, 26, 0, 6.283); ctx.fill(); icone('interrog', 0, 0, 30, '#fff'); ctx.restore(); }
  };
  G.meta = (s, t, a) => {             // contador de anos + barra de meta que trava
    titulo(s.titulo, 190, a * eo(pr(t, s.t0 + .05, .4)));
    const pa = pr(t, Wt(s.iAnos) - .3, 1.0), anos = Math.round(lerp(0, s.anos, eo(pa)));
    if (pa > 0) {
      ctx.save(); ctx.globalAlpha = a * cl(pa * 3); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#fff'; ctx.font = `700 120px ${F}`; ctx.letterSpacing = '-4px';
      ctx.fillText(anos + (pa >= 1 ? '+' : ''), CX, 380); ctx.restore();
      texto('ANOS DE TRABALHO DURO', CX, 412, 15, COR.cinza, a * cl(pa * 3), { alinha: 'center', ls: '3px', peso: 600 });
    }
    const pb = pr(t, Wt(s.iMeta) - .2, .4);
    if (pb > 0) {
      const ab = a * eo(pb), x = 110, y = 500, w = 500;
      cartao(x - 10, y - 30, w + 20, 150, ab, { desliza: 0 });
      texto(s.meta, x + 12, y + 8, 20, '#f4f2ef', ab, { peso: 600 }); texto('META', x + w - 12, y + 8, 13, COR.cinza, ab, { alinha: 'right', ls: '2px', peso: 600 });
      const enche = eo(pr(t, Wt(s.iMeta), 2.2)) * s.chega, trava = pr(t, Wt(s.iTrava) - .1, .3);
      ctx.save(); ctx.globalAlpha = ab; rr(x + 12, y + 44, w - 24, 22, 11); ctx.fillStyle = '#383734'; ctx.fill();
      rr(x + 12, y + 44, Math.max(22, (w - 24) * enche), 22, 11); ctx.fillStyle = COR.laranja; ctx.fill();
      if (trava > 0) { const tx = x + 12 + (w - 24) * s.chega; ctx.globalAlpha = ab * trava; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(tx + 4, y + 36); ctx.lineTo(tx + 4, y + 74); ctx.stroke(); }
      ctx.restore();
      if (trava > 0) texto(s.textoTrava, x + 12, y + 94, 16, COR.laranja3, ab * trava, { peso: 600 });
    }
  };
  G.equacao = (s, t, a) => {          // A + B = C
    titulo(s.titulo, 190, a * eo(pr(t, s.t0 + .05, .4)));
    s.itens.forEach((it, k) => {
      const y = 290 + k * 130, p = eo(pr(t, Wt(it.i) - .1, .4)) * a;
      cartao(130, y, 460, 84, p, { icone: it.icone, texto: it.texto, destaque: k === s.itens.length - 1, tam: 24 });
      if (k > 0) texto(k === s.itens.length - 1 ? '=' : '+', CX, y - 24, 30, COR.laranja2, p, { alinha: 'center', peso: 700 });
    });
  };
  G.crescimento = (s, t, a) => {      // barras a subir + contador por etapas
    titulo(s.titulo, 190, a * eo(pr(t, s.t0 + .05, .4)));
    const base = 700, xs = [170, 300, 430, 560], hs = [70, 150, 260, 380];
    xs.forEach((x, k) => {
      const p = eo(pr(t, Wt(s.iAnos) - .2 + k * .18, .6)) * a; if (p <= 0) return;
      const h = hs[k] * p; ctx.save(); ctx.globalAlpha = a; rr(x - 42, base - h, 84, h, 10);
      const g = ctx.createLinearGradient(0, base - h, 0, base); g.addColorStop(0, k === 3 ? COR.laranja : '#4a4845'); g.addColorStop(1, k === 3 ? '#b83600' : '#2b2a28'); ctx.fillStyle = g; ctx.fill(); ctx.restore();
      texto(s.rotulos[k], x, base + 24, 15, COR.cinza, a * p, { alinha: 'center', peso: 600 });
    });
    let valor = '', vp = 0;
    s.etapas.forEach(e => { const p = pr(t, Wt(e.i) - .1, .35); if (p > 0) { valor = e.texto; vp = p; } });
    if (valor) { ctx.save(); ctx.globalAlpha = a; ctx.translate(CX, 300); ctx.scale(.85 + .15 * eob(vp), .85 + .15 * eob(vp)); ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = `700 64px ${F}`; ctx.letterSpacing = '-2px'; ctx.fillText(valor, 0, 0); ctx.restore(); }
    const pu = pr(t, Wt(s.iUnico) - .1, .4);
    if (pu > 0) { ctx.save(); ctx.globalAlpha = a * pu; rr(CX - 120, 326, 240, 36, 18); ctx.fillStyle = COR.laranja; ctx.fill(); ctx.restore(); texto(s.textoUnico, CX, 345, 17, '#fff', a * pu, { alinha: 'center', peso: 700 }); }
  };
  G.formula = (s, t, a) => {          // círculo central com ramos para cartões que acendem
    titulo(s.titulo, 190, a * eo(pr(t, s.t0 + .05, .4)));
    const cx = 175, cy = 480, pc = eob(pr(t, s.t0 + .2, .5));
    s.itens.forEach((it, k) => {
      const y = 300 + k * 118, p = pr(t, Wt(it.i) - .15, .4), aceso = t >= Wt(it.i) - .05;
      if (p > 0) { ctx.save(); ctx.globalAlpha = a * cl(p * 2); ctx.strokeStyle = aceso ? COR.laranja2 : '#555'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + 70, cy); ctx.bezierCurveTo(cx + 120, cy, 270, y + 38, 300, y + 38); ctx.stroke(); ctx.restore(); }
      cartao(300, y, 330, 76, eo(p) * a, { icone: it.icone, texto: it.texto, destaque: aceso && k === s.itens.length - 1, tam: 20 });
    });
    if (pc > 0) {
      ctx.save(); ctx.globalAlpha = a; ctx.translate(cx, cy); ctx.scale(pc, pc);
      const g = ctx.createRadialGradient(-20, -20, 5, 0, 0, 72); g.addColorStop(0, '#ff8a3d'); g.addColorStop(1, '#b83600');
      ctx.shadowColor = 'rgba(255,90,0,.55)'; ctx.shadowBlur = 30 * K; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 70, 0, 6.283); ctx.fill(); ctx.restore();
      s.circulo.forEach((l, k) => texto(l, cx, cy + (k - (s.circulo.length - 1) / 2) * 24, 21, '#fff', a * pc, { alinha: 'center', peso: 700 }));
    }
  };
  G.oferta = (s, t, a) => {           // secção clara: logo + nome do programa + lista que se confirma
    if (LOGO) { const p = eob(pr(t, s.t0 + .1, .5)); ctx.save(); ctx.globalAlpha = a * cl(p); const tm = 64 * p; ctx.drawImage(LOGO, CX - tm / 2, 110 - tm / 2, tm, tm); ctx.restore(); }
    titulo(s.titulo, 205, a * eo(pr(t, Wt(s.iTitulo) - .15, .4)), { cor: COR.grafite, corItalico: COR.laranja, tam: 44 });
    s.itens.forEach((it, k) => {
      const y = 270 + k * 100, p = eo(pr(t, Wt(it.i) - .25, .4)) * a, ok = pr(t, Wt(it.i) + .15, .3);
      cartao(110, y, 500, 78, p, { claro: true, texto: it.texto, tam: 21, icone: it.icone });
      if (ok > 0) { ctx.save(); ctx.globalAlpha = a * ok; ctx.translate(575, y + 39); ctx.scale(eob(ok), eob(ok)); ctx.fillStyle = COR.laranja; ctx.beginPath(); ctx.arc(0, 0, 15, 0, 6.283); ctx.fill(); icone('check', 0, 0, 18, '#fff'); ctx.restore(); }
    });
  };
  G.chamada = (s, t, a) => {          // cartão do programa + botão tocado + seta "link abaixo"
    titulo(s.titulo, 190, a * eo(pr(t, s.t0 + .05, .4)));
    const pc = eo(pr(t, s.t0 + .25, .5)) * a;
    cartao(110, 270, 500, 300, pc, { desliza: 0 });
    if (pc > 0) {
      if (LOGO) { ctx.save(); ctx.globalAlpha = pc; ctx.drawImage(LOGO, 140, 300, 44, 44); ctx.restore(); }
      texto(s.programa, 198, 314, 22, '#fff', pc, { peso: 700 }); texto(s.subtitulo, 198, 338, 15, COR.cinza, pc);
      (s.lista || []).forEach((l, k) => { icone('check', 152, 392 + k * 34, 16, COR.laranja2); texto(l, 172, 392 + k * 34, 17, '#e8e5e1', pc); });
      const toque = Wt(s.iToque), press = pr(t, toque - .05, .16), feito = t >= toque + .05, bw = 440, bh = 56, by = 520;
      const sc = 1 - .06 * Math.sin(Math.PI * press);
      ctx.save(); ctx.globalAlpha = pc; ctx.translate(CX, by); ctx.scale(sc, sc); rr(-bw / 2, -bh / 2, bw, bh, 14);
      ctx.fillStyle = feito ? '#2b2a28' : COR.laranja; if (!feito) { ctx.shadowColor = 'rgba(255,90,0,.5)'; ctx.shadowBlur = 20 * K; } ctx.fill(); ctx.shadowBlur = 0;
      if (feito) { ctx.strokeStyle = COR.laranja2; ctx.lineWidth = 1.5; ctx.stroke(); }
      ctx.restore();
      texto(feito ? s.botaoFeito : s.botao, CX, by + 1, 21, '#fff', pc, { alinha: 'center', peso: 700 });
      const ent = eo(pr(t, toque - .7, .6)), sai = eio(pr(t, toque + .35, .5));
      if (ent > 0 && sai < 1) cursor(lerp(CX + 200, CX + 40, ent) + 110 * sai, lerp(by + 170, by + 8, ent) + 70 * sai, (1 - sai) * ent * pc, 1.1 * (1 - .12 * Math.sin(Math.PI * press)));
    }
    const pl = pr(t, Wt(s.iLink) - .1, .4);
    if (pl > 0) { const b = 10 * Math.abs(Math.sin(t * 4)); texto(s.textoLink, CX, 640, 22, '#fff', a * pl, { alinha: 'center', peso: 700 }); ctx.save(); ctx.globalAlpha = a * pl; ctx.translate(0, b); icone('seta', CX, 692, 34, COR.laranja2); ctx.restore(); }
  };
  function cursor(x, y, a, s = 1) {
    if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 26); ctx.lineTo(7, 20); ctx.lineTo(12, 31); ctx.lineTo(17, 29); ctx.lineTo(12, 18); ctx.lineTo(21, 18); ctx.closePath();
    ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 8 * K; ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = COR.grafite; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  }

  /* ---------- vídeo: cartão (dividido) ou ecrã inteiro, com transição ---------- */
  const FOCO_Y = window.FOCO_Y ?? 0.38;               // altura do rosto no quadro (0–1)
  const CARTAO = { x: 48, y: 930, w: 624, h: 400, r: 26 };
  function retangulos(modo, zoom) {
    if (modo === 'full') {
      const sw = 1080 / zoom, sh = 1920 / zoom, sx = 540 - sw / 2, sy = cl(FOCO_Y * 1920 - sh * FOCO_Y, 0, 1920 - sh);
      return { d: [0, 0, W, H, 0], s: [sx, sy, sw, sh] };
    }
    const sh = 1080 * CARTAO.h / CARTAO.w, visivel = sh * (H - CARTAO.y) / CARTAO.h; const sy = cl(FOCO_Y * 1920 - visivel * 0.32, 0, 1920 - sh); // rosto a ~1/3 da parte visível
    return { d: [CARTAO.x, CARTAO.y, CARTAO.w, CARTAO.h, CARTAO.r], s: [0, sy, 1080, sh] };
  }
  function zoomFull(s, t) { // zoom lento e salto de zoom nos cortes (jump cut)
    let z = 1.0 + 0.05 * pr(t, s.t0, s.t1 - s.t0);
    (s.cortes || []).forEach(c => { if (t >= c) z += 0.12; });
    return z;
  }
  function desenharVideo(im, t, si) {
    const s = SEC[si], ant = SEC[si - 1];
    let R = retangulos(s.modo, s.modo === 'full' ? zoomFull(s, t) : 1);
    if (ant && ant.modo !== s.modo) {
      const m = eio(pr(t, s.t0, 0.42)); const R0 = retangulos(ant.modo, ant.modo === 'full' ? zoomFull(ant, s.t0) : 1);
      R = { d: R0.d.map((v, k) => lerp(v, R.d[k], m)), s: R0.s.map((v, k) => lerp(v, R.s[k], m)) };
    }
    const [dx, dy, dw, dh, dr] = R.d, [sx, sy, sw, sh] = R.s;
    ctx.save(); rr(dx, dy, dw, dh + (dr ? 40 : 0), dr); ctx.clip();
    if (im) ctx.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh); else { ctx.fillStyle = '#333'; ctx.fillRect(dx, dy, dw, dh); }
    if (dr) { ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; rr(dx, dy, dw, dh + 40, dr); ctx.stroke(); }
    ctx.restore();
    return dh / H; // 1 = ecrã inteiro
  }

  /* ---------- legenda curta (1–3 palavras) ---------- */
  const DESTAQUE = window.PALAVRAS_DESTAQUE || /^$/;
  function legenda(t, cheio, claro = 0) {
    const f = FRA.find(f => t >= f.t0 && t < f.t1); if (!f) return;
    const ws = PAL.slice(f.i0, f.i1 + 1), tam = 38, p = eo(pr(t, f.t0, .12));
    ctx.save(); ctx.font = `700 ${tam}px ${F}`; ctx.letterSpacing = '-0.5px'; ctx.textBaseline = 'alphabetic';
    const esp = ctx.measureText(' ').width, lg = ws.map(w => ctx.measureText(w.w).width), tot = lg.reduce((a, b) => a + b, 0) + esp * (ws.length - 1);
    const y = 846, s = .9 + .1 * p; ctx.translate(CX, y); ctx.scale(s, s); ctx.translate(-CX, -y);
    let x = CX - tot / 2;
    ws.forEach((w, k) => {
      const dita = t >= w.t0 - .03;
      ctx.globalAlpha = p * (dita ? 1 : .55);
      const sobreClaro = claro > .5 && !cheio;
      ctx.shadowColor = sobreClaro ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,' + (cheio ? .75 : .35) + ')'; ctx.shadowBlur = (cheio ? 16 : 8) * K;
      ctx.fillStyle = DESTAQUE.test(w.w.replace(/[.,?!:]/g, '')) ? (sobreClaro ? COR.laranja : COR.laranja2) : (sobreClaro ? COR.grafite : '#ffffff');
      ctx.fillText(w.w, x, y); x += lg[k] + esp;
    });
    ctx.restore();
  }

  /* ---------- fecho: o vídeo fecha-se em direção ao logo ---------- */
  function fecho(u, im) {
    const d = FIM.duracao, p = eio(pr(u, 0, .9)), y = lerp(80, 520, p), tm = lerp(40, 130, p);
    const rIn = lerp(1500, 0, eio(pr(u, 0, .9))), g = ctx.createRadialGradient(CX, y, rIn, CX, y, rIn + 260);
    g.addColorStop(0, 'rgba(26,25,23,0)'); g.addColorStop(1, 'rgba(26,25,23,1)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const c = eo(pr(u, .6, .3)); if (c > 0) { ctx.fillStyle = `rgba(26,25,23,${c})`; ctx.fillRect(0, 0, W, H); }
    if (LOGO) { ctx.save(); ctx.shadowColor = 'rgba(255,90,0,.7)'; ctx.shadowBlur = lerp(18, 50, p) * K; ctx.drawImage(LOGO, CX - tm / 2, y - tm / 2, tm, tm); ctx.restore(); }
    const pt = eo(pr(u, .8, .45)); titulo(FIM.titulo, 650, pt, { tam: 46 });
    const ph = eo(pr(u, 1.0, .45));
    if (ph > 0) { ctx.save(); ctx.font = `500 22px ${F}`; const w = ctx.measureText(FIM.handle).width; ctx.restore(); texto(FIM.handle, CX - 14, 700, 22, '#ffffff', ph * .85, { alinha: 'center' }); seloVerificado(CX + w / 2 + 2, 700, 11, ph); }
  }

  /* ---------- quadro ---------- */
  let LOGO = null;
  function fundo(t, si) {
    const s = SEC[si], ant = SEC[si - 1];
    const claro = s.claro ? 1 : 0, claroAnt = ant && ant.claro ? 1 : 0, m = eio(pr(t, s.t0, .4)), k = lerp(claroAnt, claro, m);
    ctx.fillStyle = COR.grafite; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(CX, 200, 20, CX, 260, 700); g.addColorStop(0, 'rgba(255,90,0,.10)'); g.addColorStop(1, 'rgba(255,90,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (k > 0) { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = COR.claro; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    // grelha fina
    ctx.save(); ctx.globalAlpha = .05; ctx.strokeStyle = k > .5 ? '#000' : '#fff'; ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 40) { ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, 800); ctx.stroke(); }
    for (let y = 0; y <= 800; y += 40) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); ctx.stroke(); }
    ctx.restore();
    return k;
  }
  function secaoEm(t) { let i = SEC.findIndex(s => t >= s.t0 && t < s.t1); if (i < 0) i = t < SEC[0].t0 ? 0 : SEC.length - 1; return i; }
  function quadro(t, im) {
    ctx.setTransform(K, 0, 0, K, 0, 0); ctx.globalAlpha = 1;
    const tv = Math.min(t, DUR_VIDEO - 0.001), si = secaoEm(tv), s = SEC[si];
    const claro = fundo(tv, si);
    // grafismos da secção (somem nos 0,25 s finais; não aparecem em ecrã inteiro)
    if (s.modo === 'split' && G[s.tipo]) G[s.tipo](s, tv, 1 - pr(tv, s.t1 - .25, .25));
    // logo pequeno no topo (fora da secção clara, que tem o seu próprio)
    if (LOGO && s.modo === 'split' && !s.claro) { ctx.save(); ctx.globalAlpha = .9; ctx.drawImage(LOGO, CX - 17, 58, 34, 34); ctx.restore(); }
    const cheio = desenharVideo(im, tv, si) > .9;
    legenda(tv, cheio, claro);
    if (FIM && t > DUR_VIDEO) fecho(t - DUR_VIDEO, im);
  }

  /* ---------- eventos: corte, palavra, efeitos e trilha (para sons.py e o editor) ---------- */
  function eventos() {
    const E = [];
    SEC.forEach((s, k) => { E.push({ t: s.t0, type: 'cut', label: s.tipo || s.modo }); if (k) E.push({ t: s.t0 - .08, type: 'sfx', label: 'sopro|0.45|0|0' }); });
    PAL.forEach(p => E.push({ t: p.t0, type: 'word', label: p.w }));
    const sfx = (t, som, g, d = 0, tom = 0) => E.push({ t, type: 'sfx', label: [som, g, d, tom].join('|') });
    SEC.forEach(s => {
      if (s.modo !== 'split') return;
      (s.cartoes || s.itens || []).forEach((it, k) => sfx(Wt(it.i) - .1, 'pop', .28, 0, 0));
      if (s.tipo === 'meta') { for (let k = 0; k < 14; k++) sfx(Wt(s.iAnos) - .3 + k * .07, 'tique', .18); sfx(Wt(s.iTrava), 'trava', .35); }
      if (s.tipo === 'crescimento') s.etapas.forEach((e, k) => sfx(Wt(e.i) - .1, 'ping', .32, 0, [880, 1109, 1319][k % 3]));
      if (s.tipo === 'oferta') s.itens.forEach((it, k) => sfx(Wt(it.i) + .15, 'ping', .3, 0, [1175, 1319, 1480, 1760][k % 4]));
      if (s.tipo === 'chamada') { sfx(Wt(s.iToque), 'tique', .55); sfx(Wt(s.iToque) + .05, 'ping', .4, 0, 1319); }
      if (s.tipo === 'formula') s.itens.forEach((it, k) => sfx(Wt(it.i) - .05, 'ping', .22, 0, [587, 740, 880, 1175][k % 4]));
    });
    if (FIM) { sfx(DUR_VIDEO, 'sopro', .5); sfx(DUR_VIDEO + .85, 'impacto', .4); sfx(DUR_VIDEO + .9, 'formar', .35, 1.0); }
    const TR = window.TRILHA;
    if (TR) TR.acordes.forEach(([t0, ac, it, d]) => E.push({ t: t0, type: 'musica', label: [ac, it, d, TR.bpm].join('|') }));
    E.forEach(e => e.frame = Math.round(e.t * FPS));
    window.__events = E;
  }

  async function iniciar() {
    await Promise.all([`700 38px ${F}`, `400 38px ${F}`, `italic 400 40px ${F}`, `600 20px ${F}`].map(f => document.fonts.load(f).catch(() => {})));
    await new Promise(ok => { const im = new Image(); im.onload = () => { LOGO = im; ok(); }; im.onerror = ok; im.src = window.LOGO_SRC || 'logo-kingdom.png'; });
    window.__duration = DUR; eventos();
  }
  window.__ready = iniciar();
  window.__seek = async t => { await window.__ready; const tv = Math.min(t, DUR_VIDEO - 1 / FPS); const im = await carregar(Math.round(tv * FPS) + 1); quadro(t, im); };
  window.MOTOR_FALADO = { ready: window.__ready, seek: window.__seek, canvas: cv, escala(k) { K = k; cv.width = Math.round(W * K); cv.height = Math.round(H * K); }, get duracao() { return DUR; } };
})();
