/* Home Center — Gestão de lojas. Protótipo: os dados ficam no navegador (localStorage). */
(function () {
  'use strict';

  const KEY = 'hc-gestao-v2';
  const UIKEY = 'hc-gestao-ui';
  const NOW = new Date(2026, 9, 27, 9, 0); // data de demonstração: terça-feira, 27 Out 2026, 09:00
  const HOJE = '2026-10-27';
  const DIAS_MES = 31;
  const B = window.HC_BRANDS;

  /* ---------- formatação ---------- */
  const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const MESES_L = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const DIAS_L = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const grp = (n) => String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const fNum = (n) => (n < 0 ? '−' : '') + grp(n);
  const fMT = (n) => fNum(n) + ' MT';
  const fDec = (x, d = 1) => (x < 0 ? '−' : '') + Math.abs(x).toFixed(d).replace('.', ',');
  const fM = (n, d = 1) => (Math.abs(n) < 1e6 ? fMT(n) : fDec(n / 1e6, d) + ' M MT');
  const fPct = (x, d = 1) => (isFinite(x) ? fDec(x * 100, d) : '0') + '%';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pn = (v) => { const s = String(v == null ? '' : v).replace(/\s|\./g, '').replace(',', '.'); return s === '' ? NaN : Number(s); };
  const pad = (n) => String(n).padStart(2, '0');
  const dt = (s) => { const [y, m, d] = s.slice(0, 10).split('-').map(Number); const t = s.length > 10 ? s.slice(11, 16).split(':').map(Number) : [0, 0]; return new Date(y, m - 1, d, t[0], t[1]); };
  const isoD = (x) => x.getFullYear() + '-' + pad(x.getMonth() + 1) + '-' + pad(x.getDate());
  const isoT = (x) => isoD(x) + 'T' + pad(x.getHours()) + ':' + pad(x.getMinutes());
  const fData = (s) => { const x = dt(s); return x.getDate() + ' ' + MESES[x.getMonth()]; };
  const fDataS = (s) => { const x = dt(s); return DIAS[x.getDay()] + ', ' + x.getDate() + ' ' + MESES[x.getMonth()]; };
  const fDataL = (s) => { const x = dt(s); return DIAS_L[x.getDay()] + ', ' + x.getDate() + ' de ' + MESES_L[x.getMonth()] + ' de ' + x.getFullYear(); };
  const fHora = (s) => s.slice(11, 16);
  const diasEntre = (a, b) => Math.round((new Date(b.getFullYear(), b.getMonth(), b.getDate()) - new Date(a.getFullYear(), a.getMonth(), a.getDate())) / 864e5);
  const rel = (s) => { const n = diasEntre(dt(s), NOW); if (n === 0) return 'hoje, ' + fHora(s); if (n === 1) return 'ontem, ' + fHora(s); if (n < 7) return 'há ' + n + ' dias'; return fData(s); };
  const dur = (m) => { m = Math.max(0, Math.round(m)); if (m < 60) return m + ' min'; const h = Math.floor(m / 60), r = m % 60; if (h < 24) return h + ' h' + (r ? ' ' + r + ' min' : ''); const d = Math.floor(h / 24); return d + (d === 1 ? ' dia' : ' dias'); };
  const addDays = (s, n) => { const x = dt(s); x.setDate(x.getDate() + n); return isoD(x); };
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const sum = (arr, f) => arr.reduce((a, x) => a + f(x), 0);

  // Minutos dentro do horário de atendimento (08:00–17:30): o relógio da 1.ª resposta não conta a noite.
  function bizMin(fromIso, to) {
    let t = dt(fromIso), total = 0;
    while (t < to) {
      const ini = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 8, 0);
      const fim = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 17, 30);
      const s = t > ini ? t : ini, e = to < fim ? to : fim;
      if (e > s) total += (e - s) / 6e4;
      t = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1, 0, 0);
    }
    return total;
  }

  /* ---------- estado ---------- */
  function load() {
    try {
      const r = localStorage.getItem(KEY);
      if (r) { const x = JSON.parse(r); if (x && x.versao === 2) { const seed = window.HC_SEED(); Object.keys(seed).forEach((k) => { if (!(k in x)) x[k] = seed[k]; }); return x; } }
    } catch (e) { /* sem armazenamento */ }
    return window.HC_SEED();
  }
  let S = load();
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* sem armazenamento */ } };
  const uiPrefs = (() => { try { return JSON.parse(localStorage.getItem(UIKEY)) || {}; } catch (e) { return {}; } })();
  const ui = {
    loja: S.lojas[uiPrefs.loja] ? uiPrefs.loja : 'todas',
    lojaLocal: 'angola',
    flt: { canal: 'todos', est: 'pendente', etapa: 'todos', pcanal: 'todos', ctipo: 'todas', aest: 'pendente', fin: 'factura', func: 'todos', af: 'todas', cf: 'todos' },
    rkAll: {}, seen: null,
    sel: {}, open: null, view: 'list', drafts: {}, pop: null, sheet: false, anim: false, scrollTo: null, path: ''
  };
  const saveUi = () => { try { localStorage.setItem(UIKEY, JSON.stringify({ loja: ui.loja })); } catch (e) { /* sem armazenamento */ } };

  /* ---------- vocabulário ---------- */
  const LOJAS = () => Object.keys(S.lojas);
  const lojaN = (k) => (S.lojas[k] ? S.lojas[k].nome : 'Todas as lojas');
  const CANAL_N = { whatsapp: 'WhatsApp', instagram: 'Instagram', facebook: 'Facebook', google: 'Google', site: 'Site' };
  const ORIG = [['espontanea', 'Visita espontânea à loja'], ['whatsapp', 'WhatsApp das lojas'], ['redes', 'Instagram e Facebook'], ['empresas', 'Clientes empresariais'], ['site', 'Site'], ['outdoors', 'Outdoors (código e QR)'], ['parcerias', 'Parcerias']];
  const PED_CANAL = { loja: 'Loja', site: 'Site', whatsapp: 'WhatsApp', empresas: 'Empresas', redes: 'Instagram ou Facebook' };
  const ETAPAS = ['Pedido recebido', 'Pagamento confirmado', 'Preparado no armazém', 'Entregue ao cliente', 'Montagem concluída'];
  const EST_PED = { 1: ['Aguarda pagamento', 'warn'], 2: ['Em preparação', ''], 3: ['Em entrega', 'info'], 4: ['Por montar', 'info'], 5: ['Concluído', 'ok'] };
  const PROX = { 1: 'Confirmar pagamento', 2: 'Marcar como preparado', 3: 'Confirmar entrega', 4: 'Concluir montagem' };
  const PAGAMENTOS = ['M-Pesa', 'e-Mola', 'Cartão', 'Transferência bancária', 'Numerário', 'Prestações', 'Fatura a 30 dias'];
  const EQUIPAS = ['A', 'B', 'C', 'D'];
  const MOTIVOS = ['Atraso na entrega', 'Montagem em falta ou mal feita', 'Atendimento na loja', 'Produto danificado', 'Outros'];
  const META_CONV = 0.16, META_NPS = 50, META_ROTEIRO = 85, META_DESC = 0.04;

  const SECOES = [
    { id: 'visao-geral', label: 'Visão geral', short: 'Geral', icon: 'space_dashboard', tabs: [['painel', 'Painel'], ['fechar', 'Fechar o dia', 1]] },
    { id: 'mensagens', label: 'Mensagens', icon: 'forum', tabs: [['caixa', 'Caixa de entrada'], ['respostas', 'Respostas rápidas', 1]] },
    { id: 'pedidos', label: 'Pedidos e entregas', short: 'Pedidos', icon: 'local_shipping', tabs: [['lista', 'Pedidos'], ['agenda', 'Agenda de entregas'], ['novo', 'Novo pedido', 1]] },
    { id: 'lojas', label: 'Lojas e equipas', short: 'Lojas', icon: 'storefront', tabs: [['desempenho', 'Desempenho'], ['briefing', 'Briefing e coaching'], ['avaliar', 'Avaliar atendimento', 1]] },
    { id: 'rankings', label: 'Avaliações e rankings', short: 'Rankings', icon: 'leaderboard', tabs: [['rankings', 'Rankings'], ['colaboradores', 'Colaboradores e QR'], ['avaliacoes', 'Avaliações recebidas'], ['novo', 'Registar colaborador', 1]] },
    { id: 'clientes', label: 'Clientes', icon: 'group', tabs: [['lista', 'Clientes e histórico'], ['registar', 'Registar compra ou contacto', 1]] },
    { id: 'satisfacao', label: 'Satisfação e NPS', short: 'Satisfação', icon: 'sentiment_satisfied', tabs: [['painel', 'Painel'], ['avaliacoes', 'Avaliações públicas'], ['registar', 'Registar resposta', 1]] },
    { id: 'campanhas', label: 'Campanhas', icon: 'campaign', tabs: [['resultados', 'Resultados'], ['nova', 'Nova campanha', 1], ['registar', 'Registar resultados', 1]] },
    { id: 'financeiro', label: 'Financeiro', icon: 'account_balance_wallet', tabs: [['resumo', 'Resumo'], ['receber', 'Contas a receber'], ['registar', 'Registar', 1]] }
  ];

  /* ---------- cálculos ---------- */
  const inLoja = (x, k) => k === 'todas' || x.loja === k || x.loja == null;
  const lojasDe = (k) => (k === 'todas' ? LOJAS() : [k]);
  function agg(k) {
    const ks = lojasDe(k);
    const r = { visitas: 0, vendas: 0, valor: 0, recebido: 0, descontos: 0, meta: 0, setembro: 0, vendedores: 0, origem: {} };
    ORIG.forEach(([o]) => { r.origem[o] = 0; });
    for (const s of ks) {
      const b = S.base[s];
      r.visitas += b.visitas; r.vendas += b.vendas; r.valor += b.valor; r.recebido += b.recebido; r.descontos += b.descontos;
      r.meta += S.lojas[s].meta; r.setembro += S.lojas[s].setembro; r.vendedores += S.lojas[s].vendedores;
      ORIG.forEach(([o]) => { r.origem[o] += b.origem[o] || 0; });
    }
    for (const f of S.fechos) {
      if (!ks.includes(f.loja)) continue;
      r.visitas += f.visitas; r.vendas += f.vendas; r.valor += f.valor; r.recebido += f.recebido;
      ORIG.forEach(([o]) => { r.origem[o] += f.origem[o] || 0; });
    }
    for (const x of S.descontos) if (ks.includes(x.loja)) r.descontos += x.valor;
    return r;
  }
  const ultimoFecho = (k) => { const ds = S.fechos.filter((f) => lojasDe(k).includes(f.loja)).map((f) => f.data).sort(); return ds[ds.length - 1] || '2026-10-23'; };
  const npsVal = (o) => { const n = o.p + o.neu + o.d; return n ? Math.round((o.p - o.d) / n * 100) : 0; };
  const npsObj = (k) => lojasDe(k).reduce((a, s) => { const o = S.nps.lojas[s]; return { p: a.p + o.p, neu: a.neu + o.neu, d: a.d + o.d }; }, { p: 0, neu: 0, d: 0 });
  const nResp = (o) => o.p + o.neu + o.d;
  const prazo = (k) => lojasDe(k).reduce((a, s) => ({ total: a.total + S.entregas[s].total, prazo: a.prazo + S.entregas[s].prazo }), { total: 0, prazo: 0 });
  const pendentes = (k) => S.conversas.filter((c) => c.estado === 'pendente' && inLoja(c, k));
  const atrasado = (p) => !!p.entrega && p.entrega < HOJE && p.passo < 5;
  const diasAtraso = (p) => diasEntre(dt(p.entrega), NOW);
  const roteiroLoja = (s) => Math.round(sum(S.roteiro.lojas[s].p, (x) => x) / S.roteiro.lojas[s].p.length);
  const prazoDet = (d) => (dt(d.em).getTime() + 864e5 - NOW.getTime()) / 6e4;
  const facturaEstado = (f) => {
    if (f.paga) return ['Paga a ' + fData(f.paga.data), 'ok'];
    const n = diasEntre(dt(f.vencimento), NOW);
    if (n > 0) return ['Vencida há ' + n + (n === 1 ? ' dia' : ' dias'), 'bad'];
    if (n === 0) return ['Vence hoje', 'warn'];
    return [-n <= 7 ? 'Vence em ' + -n + ' dias' : 'Em dia', -n <= 7 ? 'warn' : 'ok'];
  };
  const pedidoEstado = (p) => (atrasado(p) ? ['Atrasado', 'bad'] : (p.passo === 4 && p.remarcada ? ['Montagem remarcada', 'warn'] : EST_PED[p.passo]));
  const vendedoresDe = (k) => lojasDe(k).flatMap((s) => S.vendedores[s].map((v) => Object.assign({ loja: s }, v)));

  function alertas(k) {
    const out = [];
    const rv = S.conversas.filter((c) => c.tipo === 'avaliacao' && c.estado === 'pendente' && inLoja(c, k));
    if (rv.length) {
      const velha = Math.max(...rv.map((c) => diasEntre(dt(c.recebida), NOW)));
      out.push({ o: 4, n: rv.length, t: 'Avaliações públicas sem resposta', d: 'A mais antiga tem ' + velha + ' dias. Meta: responder em 48 horas.', cta: 'Responder', href: '#satisfacao/avaliacoes' });
    }
    const fora = S.conversas.filter((c) => c.tipo === 'conversa' && c.estado === 'pendente' && c.fora && inLoja(c, k));
    if (fora.length) out.push({ o: 3, n: fora.length, t: 'Conversas recebidas fora de horas', d: 'A resposta automática foi enviada; falta o contacto do consultor.', cta: 'Abrir', href: '#mensagens/caixa?est=fora' });
    const det = S.detratores.filter((d) => !d.contacto && (k === 'todas' || d.loja === k));
    if (det.length) {
      const prox = det.reduce((a, d) => (prazoDet(d) < prazoDet(a) ? d : a));
      const fim = new Date(dt(prox.em).getTime() + 864e5);
      out.push({ o: 1, n: det.length, t: 'Clientes insatisfeitos por contactar', d: 'O prazo de 24 horas mais curto termina ' + (diasEntre(NOW, fim) === 0 ? 'hoje' : 'amanhã') + ' às ' + pad(fim.getHours()) + 'h' + pad(fim.getMinutes()) + '.', cta: 'Contactar', href: '#satisfacao/painel' });
    }
    const cmap = new Map(colaboradores().map((c) => [c.codigo, c]));
    const baixas = R.aval.filter((a) => a.estado === 'confirmada' && a.estrelas <= 2 && Date.now() - new Date(a.criado_em) < 7 * 864e5 && cmap.has(a.codigo) && (k === 'todas' || cmap.get(a.codigo).loja === k));
    if (baixas.length) out.push({ o: 3, n: baixas.length, t: baixas.length === 1 ? 'Avaliação de 1 ou 2 estrelas por QR' : 'Avaliações de 1 ou 2 estrelas por QR', d: 'Últimos 7 dias. Fale com o colaborador e, se possível, com o cliente.', cta: 'Ver', href: '#rankings/avaliacoes?f=baixa' });
    const late = S.pedidos.filter((p) => atrasado(p) && (k === 'todas' || p.loja === k));
    if (late.length) {
      const by = LOJAS().map((s) => [s, late.filter((p) => p.loja === s).length]).filter((x) => x[1]).map(([s, n]) => n + (s === 'baia' ? ' no ' : s === 'matola' ? ' na ' : ' na ') + lojaN(s));
      out.push({ o: 2, n: late.length, t: 'Entregas atrasadas', d: by.join(', ') + '.', cta: 'Ver', href: '#pedidos/lista?etapa=atrasados' });
    }
    const ab = S.abandonadas.filter((a) => !a.contacto);
    if (ab.length && (k === 'todas' || k === 'angola')) out.push({ o: 6, n: ab.length, t: 'Compras abandonadas no site', d: 'Valor total de ' + fMT(sum(ab, (a) => a.valor)) + '.', cta: 'Recuperar', href: '#pedidos/lista?ab=1' });
    const venc = S.facturas.filter((f) => !f.paga && f.vencimento < HOJE);
    if (venc.length && (k === 'todas' || k === 'angola')) out.push({ o: 5, n: venc.length, t: venc.length === 1 ? 'Factura de empresa vencida' : 'Facturas de empresas vencidas', d: fMT(sum(venc, (f) => f.valor)) + ' por receber.', cta: 'Ver', href: '#financeiro/receber' });
    const coach = vendedoresDe(k).filter((v) => v.score < 70 && !S.coaching[v.nome]);
    if (coach.length) out.push({ o: 8, n: coach.length, t: 'Vendedores abaixo de 70% no roteiro', d: 'Ainda sem sessão de coaching marcada.', cta: 'Marcar', href: '#lojas/briefing' });
    const semBrief = lojasDe(k).filter((s) => !S.briefing.feito[s]);
    if (semBrief.length) out.push({ o: 7, n: semBrief.length, t: 'Briefing de hoje por confirmar', d: semBrief.map(lojaN).join(', ') + '.', cta: 'Confirmar', href: '#lojas/briefing' });
    return out.sort((a, b) => a.o - b.o);
  }

  /* ---------- peças de interface ---------- */
  const ic = (n, c) => '<span class="ms' + (c ? ' ' + c : '') + '" aria-hidden="true">' + n + '</span>';
  const brand = (ch, cls) => (ch === 'site' ? ic('language', 's18 ch-site') : B[ch] ? '<svg class="' + (cls || 'brand-ic') + ' ch-' + ch + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + B[ch] + '"/></svg>' : '');
  const st = (t, tone, icon) => '<span class="st ' + (tone || '') + '">' + (icon ? ic(icon) : '') + esc(t) + '</span>';
  const stars = (n) => '<span class="stars" role="img" aria-label="' + n + ' de 5 estrelas">' + [1, 2, 3, 4, 5].map((i) => ic('star', i <= n ? 'f' : 'f off')).join('') + '</span>';
  const initials = (n) => n.replace(/,.*$/, '').split(/\s+/).filter((w) => /^[A-ZÀ-Ý]/.test(w)).slice(0, 2).map((w) => w[0]).join('');
  const tone = (n) => 't' + ((n.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 4) + 1);
  const FMT = { r: (v) => fDec(v, 1), M: (v) => fM(v), pct: (v) => fPct(v), int: (v) => fNum(v), x: (v) => fDec(v) + '×', nps: (v) => String(Math.round(v)), MT: (v) => fMT(v) };
  const val = (v, f, k) => '<span data-k="' + k + '" data-v="' + v + '" data-f="' + f + '">' + FMT[f](v) + '</span>';
  function metric(o) {
    return '<div><div class="m-l">' + o.l + '</div><div class="m-v">' + o.v + '</div>' + (o.s || []).map((x) => '<div class="m-s">' + x + '</div>').join('') + (o.extra || '') + '</div>';
  }
  function bar(p, o) {
    o = o || {};
    const pp = Math.max(0, Math.min(1, isFinite(p) ? p : 0));
    return '<div class="bar ' + (o.size || '') + '"' + (o.label ? ' role="img" aria-label="' + esc(o.label) + '"' : '') + '><i class="' + (o.cls || '') + '" style="--p:' + pp.toFixed(4) + '"' + (o.k ? ' data-bk="' + o.k + '"' : '') + '></i>' + (o.mark != null ? '<b style="--m:' + (o.mark * 100).toFixed(2) + '%"></b>' : '') + '</div>';
  }
  const trend = (x, txt) => '<span class="trend ' + (x >= 0 ? 'up' : 'down') + '">' + ic(x >= 0 ? 'trending_up' : 'trending_down') + (x >= 0 ? '+' : '') + fPct(x) + '</span> ' + txt;
  const card = (title, aside, body, cls, id) => '<section class="card ' + (cls || '') + '"' + (id ? ' id="' + id + '"' : '') + ' aria-labelledby="' + (id || 't') + '-h"><div class="card-h"><h2 class="card-t" id="' + (id || 't') + '-h">' + title + '</h2>' + (aside ? '<div class="card-a">' + aside + '</div>' : '') + '</div>' + body + '</section>';
  const chip = (act, arg, label, on, extra) => '<button type="button" class="fc" data-act="' + act + '" data-arg="' + esc(arg) + '" aria-pressed="' + (on ? 'true' : 'false') + '" data-fk="' + act + ':' + esc(arg) + '">' + ic('check', 'ck') + (extra || '') + label + '</button>';
  const empty = (icon, t, d) => '<div class="empty">' + ic(icon) + '<strong>' + t + '</strong>' + (d || '') + '</div>';
  const lojaOpts = (v, todas) => (todas ? [['', 'Escolha a loja']] : []).concat(LOJAS().map((s) => [s, lojaN(s)]));

  // Campos de formulário (rótulo sempre visível, ajuda e erro por baixo).
  function fld(form, o) {
    const id = form + '-' + o.name;
    const req = o.req ? ' required aria-required="true"' : '';
    const desc = ' aria-describedby="' + id + '-h"';
    let ctl;
    if (o.type === 'select') {
      ctl = '<select id="' + id + '" name="' + o.name + '"' + req + desc + (o.change ? ' data-change="' + o.change + '"' : '') + '>' + o.options.map((op) => Array.isArray(op[1]) ? '<optgroup label="' + esc(op[0]) + '">' + op[1].map((x) => '<option value="' + esc(x[0]) + '"' + (String(x[0]) === String(o.value) ? ' selected' : '') + '>' + esc(x[1]) + '</option>').join('') + '</optgroup>' : '<option value="' + esc(op[0]) + '"' + (String(op[0]) === String(o.value == null ? '' : o.value) ? ' selected' : '') + '>' + esc(op[1]) + '</option>').join('') + '</select>';
    } else if (o.type === 'textarea') {
      ctl = '<textarea id="' + id + '" name="' + o.name + '" rows="' + (o.rows || 3) + '"' + req + desc + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.max ? ' maxlength="' + o.max + '"' : '') + '>' + esc(o.value || '') + '</textarea>';
    } else {
      const num = o.type === 'num';
      ctl = '<input id="' + id + '" name="' + o.name + '" type="' + (num ? 'text' : (o.type || 'text')) + '"' + (num ? ' inputmode="numeric" data-num autocomplete="off"' : '') + ' value="' + esc(o.value == null ? '' : o.value) + '"' + req + desc + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.min ? ' min="' + o.min + '"' : '') + (o.max ? ' max="' + o.max + '"' : '') + (o.auto ? ' autocomplete="' + o.auto + '"' : '') + '>';
    }
    return '<div class="' + (o.cls || '') + '"><label class="tf' + (o.type === 'select' ? ' sel' : '') + (o.suffix ? ' has-suffix' : '') + '"><span class="l">' + o.label + (o.req ? ' *' : '') + '</span>' + ctl + (o.suffix ? '<span class="suffix">' + o.suffix + '</span>' : '') + '</label><span class="hint" id="' + id + '-h" data-hint="' + esc(o.hint || '') + '">' + esc(o.hint || '') + '</span></div>';
  }
  function opts(form, name, list, value, o) {
    o = o || {};
    return '<fieldset class="fs ' + (o.cls || '') + '" id="' + form + '-' + name + '"' + (o.req ? ' data-req="' + name + '"' : '') + '><legend>' + o.legend + (o.req ? ' *' : '') + (o.small ? '<small>' + o.small + '</small>' : '') + '</legend><div class="opts ' + (o.kind || '') + '">' + list.map(([v, l, c]) => '<label class="opt ' + (c || '') + '"><input type="radio" name="' + name + '" value="' + esc(v) + '"' + (String(v) === String(value) ? ' checked' : '') + '><span>' + ic('check') + esc(l) + '</span></label>').join('') + '</div><span class="hint" id="' + form + '-' + name + '-h" data-hint="' + esc(o.hint || '') + '">' + esc(o.hint || '') + '</span></fieldset>';
  }
  const horas = () => { const h = []; for (let m = 8 * 60; m <= 17 * 60; m += 30) h.push([pad(Math.floor(m / 60)) + ':' + pad(m % 60), pad(Math.floor(m / 60)) + 'h' + pad(m % 60)]); return h; };
  const proximosDias = (n) => { const out = []; let x = HOJE; while (out.length < n) { x = addDays(x, 1); if (dt(x).getDay() !== 0) out.push([x, fDataS(x)]); } return out; };

  /* ---------- secção: Visão geral ---------- */
  function vGeral(tab) {
    if (tab === 'fechar') return vFechar();
    const k = ui.loja, a = agg(k), ult = ultimoFecho(k);
    const dia = dt(ult).getDate(), restam = DIAS_MES - dia, esperado = dia / DIAS_MES;
    const pm = a.valor / a.meta, conv = a.vendas / a.visitas, no = npsObj(k), nps = npsVal(no);
    const pend = pendentes(k), fora = pend.filter((c) => c.fora).length;
    const al = alertas(k);
    const band = '<div class="band hero">' +
      metric({ l: 'Vendas de Outubro', v: val(a.valor, 'M', 'g-valor'), s: [trend(a.valor / a.setembro - 1, 'face a Setembro')], extra: '<div style="margin-top:14px">' + bar(pm, { k: 'g-meta', mark: esperado, label: fPct(pm, 0) + ' da meta' }) + '</div><div class="m-s" style="margin-top:8px">' + fPct(pm, 0) + ' da meta de ' + fM(a.meta) + '</div>' }) +
      metric({ l: 'Conversão nas lojas', v: val(conv, 'pct', 'g-conv'), s: [fNum(a.visitas) + ' visitas no contador, ' + fNum(a.vendas) + ' vendas'], extra: '<div style="margin-top:14px">' + bar(conv / META_CONV, { k: 'g-convb', label: fPct(conv / META_CONV, 0) + ' da meta de conversão' }) + '</div><div class="m-s" style="margin-top:8px">' + (conv >= META_CONV ? 'Meta de 16% atingida' : 'Meta 16%: faltam ' + fDec((META_CONV - conv) * 100) + ' pontos') + '</div>' }) +
      metric({ l: 'NPS após entrega', v: val(nps, 'nps', 'g-nps'), s: [nResp(no) + ' respostas ao inquérito'], extra: '<div style="margin-top:14px">' + bar(nps / META_NPS, { k: 'g-npsb', label: nps + ' de 50 na meta de NPS' }) + '</div><div class="m-s" style="margin-top:8px">' + (nps >= META_NPS ? 'Meta 50 atingida' : 'Meta 50: faltam ' + (META_NPS - nps) + ' pontos') + '</div>' }) +
      metric({ l: 'Mensagens por responder', v: val(pend.length, 'int', 'g-msg'), s: [fora + (fora === 1 ? ' chegou' : ' chegaram') + ' fora de horas'], extra: '<div class="m-row"><a class="b b-t b-s" href="#mensagens/caixa">' + ic('forum') + 'Responder</a></div>' }) +
      '</div>';

    const lojas = LOJAS().map((s) => {
      const x = agg(s), p = x.valor / x.meta, d = x.valor - x.meta * (dt(ultimoFecho(s)).getDate() / DIAS_MES);
      const falta = Math.max(0, x.meta - x.valor), rest = Math.max(1, DIAS_MES - dt(ultimoFecho(s)).getDate());
      const uf = S.fechos.filter((f) => f.loja === s).sort((f1, f2) => f2.data.localeCompare(f1.data))[0];
      return '<div class="row' + (k !== 'todas' && k !== s ? ' dim' : '') + '"><div class="row-h"><div><strong>' + lojaN(s) + '</strong> <span class="muted small">' + S.lojas[s].sub + ', ' + S.lojas[s].vendedores + ' vendedores</span></div><div class="num"><strong>' + val(x.valor, 'M', 'l-' + s) + '</strong> <span class="muted">de ' + fM(x.meta) + '</span></div></div>' +
        bar(p, { k: 'lb-' + s, size: 'thick', mark: dt(ultimoFecho(s)).getDate() / DIAS_MES, label: fPct(p, 0) + ' da meta' }) +
        '<div class="row-s">' + fPct(p, 0) + ' da meta, ' + (d >= 0 ? '<span style="color:var(--ok)">' + fM(Math.round(d / 1000) * 1000) + ' à frente</span>' : '<span style="color:var(--bad)">' + fM(Math.round(-d / 1000) * 1000) + ' atrás</span>') + ' do ritmo do mês</div>' +
        '<div class="row-s">' + (falta > 0 ? 'Precisa de ' + fMT(Math.round(falta / rest / 1000) * 1000) + ' por dia nos ' + rest + ' dias que faltam' : 'Meta atingida') + (uf ? ' · último fecho ' + fM(uf.valor) + ' (' + fData(uf.data) + ')' : '') + '</div></div>';
    }).join('');
    const falta = Math.max(0, a.meta - a.valor);
    const pace = falta > 0
      ? '<p>Faltam <strong>' + fM(falta) + '</strong> para a meta ' + (k === 'todas' ? 'das três lojas' : 'da loja') + '.<br>Ritmo necessário: <strong>' + fMT(Math.round(falta / Math.max(1, restam) / 1000) * 1000) + ' por dia</strong> ' + (restam === 1 ? 'no último dia' : 'nos ' + restam + ' dias que faltam') + '.</p>'
      : '<p><strong>Meta de Outubro atingida.</strong> ' + fM(a.valor - a.meta) + ' acima da meta.</p>';
    const cardLojas = card('Vendas por loja face à meta', 'Outubro, até ao fecho de ' + fData(ult), '<div class="rows">' + lojas + '</div><div class="legend" style="margin:16px 0"><span><i class="mark"></i>Onde a loja deveria estar, ao ritmo da meta</span></div><div class="pace">' + pace + '<a class="b b-f b-s" href="#visao-geral/fechar">' + ic('edit_note') + 'Fechar o dia</a></div>', 'flex', 'c-lojas');

    const cardAlertas = card('Precisa de atenção hoje', al.length ? st(al.length + (al.length === 1 ? ' pendente' : ' pendentes'), 'bad') : '', al.length ? '<div class="alerts">' + (ui.alMore ? al : al.slice(0, 5)).map((x) => '<div class="al"><div class="al-n">' + x.n + '</div><div><div class="al-t">' + x.t + '</div><div class="al-d">' + x.d + '</div></div><a class="b b-o b-s" href="' + x.href + '">' + x.cta + '</a></div>').join('') + '</div>' + (al.length > 5 ? '<div class="foot-row"><button type="button" class="b b-x b-s" data-act="al-more" aria-expanded="' + !!ui.alMore + '">' + ic(ui.alMore ? 'expand_less' : 'expand_more') + (ui.alMore ? 'Mostrar menos' : 'Mostrar mais ' + (al.length - 5)) + '</button></div>' : '') : empty('task_alt', 'Tudo em dia', 'Não há pendentes para ' + (k === 'todas' ? 'as lojas' : lojaN(k)) + '.'), 'flex', 'c-alertas');

    const rowsT = LOJAS().map((s) => {
      const x = agg(s), pz = S.entregas[s], ps = pz.prazo / pz.total, n = npsVal(S.nps.lojas[s]);
      return '<tr class="' + (k === s ? 'hl' : '') + '"><td class="h" data-l="Loja">' + lojaN(s) + '</td><td class="r" data-l="Vendedores">' + S.lojas[s].vendedores + '</td><td class="r" data-l="Visitas">' + fNum(x.visitas) + '</td><td class="r" data-l="Vendas">' + fNum(x.vendas) + '</td><td class="r" data-l="Conversão">' + fPct(x.vendas / x.visitas) + '</td><td class="r nw" data-l="Ticket médio">' + fMT(Math.round(x.valor / x.vendas / 100) * 100) + '</td><td class="r" data-l="NPS">' + n + '</td><td class="r" data-l="Entregas no prazo">' + st(fPct(ps, 0), ps >= 0.85 ? 'ok' : ps >= 0.8 ? 'warn' : 'bad') + '</td><td class="r" data-l="Descontos">' + st(fPct(x.descontos / x.valor), x.descontos / x.valor <= META_DESC ? 'ok' : 'warn') + '</td></tr>';
    }).join('');
    const tt = agg('todas'), ptot = prazo('todas');
    const tabela = card('Comparação das lojas', '<a href="#lojas/desempenho">Ver equipas</a>', '<div class="tw"><table class="t cards"><thead><tr><th scope="col">Loja</th><th scope="col" class="r">Vendedores</th><th scope="col" class="r">Visitas</th><th scope="col" class="r">Vendas</th><th scope="col" class="r">Conversão</th><th scope="col" class="r">Ticket médio</th><th scope="col" class="r">NPS</th><th scope="col" class="r">Entregas no prazo</th><th scope="col" class="r">Descontos</th></tr></thead><tbody>' + rowsT + '</tbody><tfoot><tr><td class="h" data-l="Total">Três lojas</td><td class="r" data-l="Vendedores">' + tt.vendedores + '</td><td class="r" data-l="Visitas">' + fNum(tt.visitas) + '</td><td class="r" data-l="Vendas">' + fNum(tt.vendas) + '</td><td class="r" data-l="Conversão">' + fPct(tt.vendas / tt.visitas) + '</td><td class="r nw" data-l="Ticket médio">' + fMT(Math.round(tt.valor / tt.vendas / 100) * 100) + '</td><td class="r" data-l="NPS">' + npsVal(npsObj('todas')) + '</td><td class="r" data-l="Entregas no prazo">' + fPct(ptot.prazo / ptot.total, 0) + '</td><td class="r" data-l="Descontos">' + fPct(tt.descontos / tt.valor) + '</td></tr></tfoot></table></div>', '', 'c-comp');

    const totO = sum(ORIG, ([o]) => a.origem[o]);
    const origem = card('De onde vêm as vendas', fNum(totO) + ' vendas' + (k === 'todas' ? '' : ', ' + lojaN(k)), '<div class="hb">' + ORIG.slice().sort((x, y) => a.origem[y[0]] - a.origem[x[0]]).map(([o, l]) => '<div><div class="hb-h"><span>' + l + '</span><span>' + fPct(a.origem[o] / totO, 0) + '</span></div>' + bar(a.origem[o] / totO, { cls: 'dark', size: 'thin', k: 'o-' + o }) + '</div>').join('') + '</div><p class="card-note">Outdoors e parcerias medidos por código promocional e QR; os restantes pela pergunta «como nos conheceu?» no fecho de cada venda.</p>', '', 'c-origem');

    const fs = S.fechos.filter((f) => lojasDe(k).includes(f.loja)).sort((x, y) => (y.data + y.loja).localeCompare(x.data + x.loja)).slice(0, 6);
    const fechos = card('Últimos fechos do dia', '<a href="#visao-geral/fechar">Fechar o dia</a>', fs.length ? '<div>' + fs.map((f) => {
      const dif = f.recebido - f.valor;
      return '<div class="li"><div><div class="li-t">' + lojaN(f.loja) + ' · ' + fDataS(f.data) + '</div><div class="li-d num">' + fNum(f.visitas) + ' visitas · ' + f.vendas + (f.vendas === 1 ? ' venda' : ' vendas') + ' · ' + fM(f.valor) + '</div>' + (dif ? '<div style="margin-top:6px">' + st('Diferença de caixa ' + fMT(dif), 'warn') + '</div>' : '') + '</div><div class="acts"><button type="button" class="ib" data-act="del-fecho" data-arg="' + f.id + '" aria-label="Apagar o fecho de ' + esc(lojaN(f.loja)) + ' de ' + fData(f.data) + '">' + ic('delete') + '</button></div></div>';
    }).join('') + '</div>' : empty('edit_note', 'Ainda sem fechos', 'Registe o primeiro fecho do dia.'), 'flex', 'c-fechos');

    return head('Bom dia, equipa de gestão', fDataL(HOJE) + ' · dados até ao fecho de ' + fData(ult) + (k === 'todas' ? '' : ' · ' + lojaN(k)), '<a class="b b-f" href="#visao-geral/fechar">' + ic('edit_note') + 'Fechar o dia</a>') + tabs('painel') +
      '<div class="stack">' + band + '<div class="g g-75">' + cardLojas + cardAlertas + '</div>' + tabela + '<div class="g g-75">' + origem + fechos + '</div></div>';
  }

  function vFechar() {
    const loja = ui.loja !== 'todas' ? ui.loja : '';
    const F = 'fecho';
    const curto = { espontanea: 'Visita espontânea', whatsapp: 'WhatsApp', redes: 'Instagram, Facebook', empresas: 'Empresas', site: 'Site', outdoors: 'Outdoors', parcerias: 'Parcerias' };
    const origem = ORIG.map(([o]) => fld(F, { name: 'o_' + o, label: curto[o], type: 'num', ph: '0' })).join('');
    const form = '<form class="form" data-form="fecho" novalidate>' +
      '<div class="form-h">Dados do dia<small>Registe no fim do dia, depois de fechar a caixa.</small></div>' +
      fld(F, { name: 'loja', label: 'Loja', type: 'select', req: true, value: loja, options: lojaOpts(loja, true) }) +
      fld(F, { name: 'data', label: 'Data', type: 'date', req: true, value: HOJE, min: '2026-10-01', max: HOJE }) +
      fld(F, { name: 'visitas', label: 'Visitas no contador', type: 'num', req: true, hint: 'Contador da entrada da loja' }) +
      fld(F, { name: 'vendas', label: 'Número de vendas', type: 'num', req: true, hint: 'Vendas fechadas no dia' }) +
      fld(F, { name: 'valor', label: 'Valor vendido', type: 'num', req: true, suffix: 'MT', hint: 'Total facturado no dia' }) +
      fld(F, { name: 'recebido', label: 'Valor recebido', type: 'num', req: true, suffix: 'MT', hint: 'Caixa, M-Pesa, e-Mola, cartão e transferências' }) +
      '<fieldset class="fs full" id="fecho-origem"><legend>Como nos conheceu?<small>Pergunta feita no fecho de cada venda</small></legend><div class="form f4">' + origem + '</div><div class="compose-a" style="margin-top:12px"><span class="hint" id="fecho-origem-h" data-hint="" style="margin:0">A soma tem de dar o número de vendas.</span><button type="button" class="b b-x b-s" data-act="fill-origem">' + ic('auto_fix_high') + 'Atribuir o restante a visita espontânea</button></div></fieldset>' +
      fld(F, { name: 'obs', label: 'Observações', type: 'textarea', cls: 'full', rows: 2, hint: 'Por exemplo, diferenças de caixa ou visitas de clientes empresariais' }) +
      '<div class="warn-box" id="fecho-dup" hidden>' + ic('info') + '<span>Já existe um fecho desta loja para este dia. Ao guardar, substitui o anterior.</span></div>' +
      '<div class="form-act"><button type="submit" class="b b-f">' + ic('check') + 'Guardar fecho</button><button type="reset" class="b b-x">Limpar</button></div></form>';
    const prev = '<div class="preview" id="fecho-prev">' + fechoPreview({}) + '</div>';
    return head('Fechar o dia', 'O fecho actualiza o painel, a comparação das lojas e a conciliação no financeiro.', '') + tabs('fechar') +
      '<div class="g g-form">' + card('Fecho do dia por loja', '', form, '', 'c-fform') + card('O que muda no painel', '', prev + '<div class="info-box" style="margin-top:16px">' + ic('undo') + '<span>Depois de guardar, pode anular na mensagem que aparece em baixo.</span></div>', '', 'c-fprev') + '</div>';
  }
  function fechoPreview(d) {
    const s = d.loja;
    if (!s) return '<p class="muted" style="margin:0">Escolha a loja para ver o efeito do fecho nos números do mês.</p>';
    const x = agg(s);
    const dup = S.fechos.find((f) => f.loja === s && f.data === d.data);
    const base = dup ? { visitas: x.visitas - dup.visitas, vendas: x.vendas - dup.vendas, valor: x.valor - dup.valor } : x;
    const v = pn(d.visitas) || 0, n = pn(d.vendas) || 0, m = pn(d.valor) || 0;
    const nv = { visitas: base.visitas + v, vendas: base.vendas + n, valor: base.valor + m };
    const diaN = Math.max(dt(ultimoFecho(s)).getDate(), d.data ? dt(d.data).getDate() : 0);
    const falta = Math.max(0, x.meta - nv.valor), restam = Math.max(1, DIAS_MES - diaN);
    const row = (l, a, b) => '<div class="pv"><span class="muted">' + l + '</span><span>' + a + ' → <span class="to">' + b + '</span></span></div>';
    return '<div class="li-t">' + lojaN(s) + '</div>' +
      row('Vendas de Outubro', fM(x.valor), fM(nv.valor)) +
      row('Da meta de ' + fM(x.meta), fPct(x.valor / x.meta, 0), fPct(nv.valor / x.meta, 0)) +
      row('Conversão', fPct(x.vendas / x.visitas), fPct(nv.vendas / nv.visitas)) +
      row('Ticket médio', fMT(Math.round(x.valor / x.vendas / 100) * 100), fMT(Math.round(nv.valor / Math.max(1, nv.vendas) / 100) * 100)) +
      '<div class="pv"><span class="muted">Ritmo necessário</span><span>' + (falta ? fMT(Math.round(falta / restam / 1000) * 1000) + ' por dia' : 'Meta atingida') + '</span></div>';
  }

  /* ---------- secção: Mensagens ---------- */
  function vMensagens(tab) {
    if (tab === 'respostas') return vRespostas();
    const k = ui.loja, all = S.conversas.filter((c) => inLoja(c, k));
    const f = ui.flt;
    const okCanal = (c) => f.canal === 'todos' || c.canal === f.canal;
    const okEst = (c) => f.est === 'todas' || (f.est === 'pendente' && c.estado === 'pendente') || (f.est === 'fora' && c.estado === 'pendente' && c.fora) || (f.est === 'respondida' && c.estado === 'respondida');
    const list = all.filter(okCanal).filter(okEst).sort((a, b) => (f.est === 'respondida' || f.est === 'todas' ? b.recebida.localeCompare(a.recebida) : a.recebida.localeCompare(b.recebida)));
    const selC = S.conversas.find((c) => c.id === ui.sel.conv);
    const cur = (selC && inLoja(selC, k) && okCanal(selC)) ? selC : list[0];
    if (cur) ui.sel.conv = cur.id;
    const pend = all.filter((c) => c.estado === 'pendente');
    const resp = S.conversas.filter((c) => c.estado === 'respondida' && c.respostaMin != null && inLoja(c, k));
    const tm = resp.length ? sum(resp, (c) => c.respostaMin) / resp.length : 0;
    const band = '<div class="band strip">' +
      metric({ l: 'Por responder', v: val(pend.length, 'int', 'm-pend'), s: ['em todos os canais' + (k === 'todas' ? '' : ', ' + lojaN(k))] }) +
      metric({ l: 'Tempo médio da 1.ª resposta', v: dur(tm), s: ['Meta: até 5 min, em horário de atendimento'] }) +
      metric({ l: 'Recebidas fora de horas', v: val(pend.filter((c) => c.fora).length, 'int', 'm-fora'), s: ['Depois das 17h30 ou antes das 8h00'] }) +
      metric({ l: 'Avaliações sem resposta', v: val(pend.filter((c) => c.tipo === 'avaliacao').length, 'int', 'm-aval'), s: ['Google e Facebook, meta 48 horas'] }) + '</div>';
    const canais = [['todos', 'Todos os canais']].concat(Object.entries(CANAL_N));
    const filtros = '<div class="g" style="gap:12px"><div class="chips canais" role="group" aria-label="Canal">' + canais.map(([c, l]) => {
      const n = all.filter((x) => (c === 'todos' || x.canal === c) && x.estado === 'pendente').length;
      return chip('canal', c, l + ' <span class="cn">' + n + '<span class="sr"> por responder</span></span>', f.canal === c, c === 'todos' ? '' : brand(c));
    }).join('') + '</div><div class="chips scroll" role="group" aria-label="Estado">' + [['pendente', 'Por responder'], ['fora', 'Fora de horas'], ['respondida', 'Respondidas'], ['todas', 'Todas']].map(([e, l]) => chip('est', e, l, f.est === e)).join('') + '</div></div>';
    const items = list.length ? list.map((c) => {
      const sta = c.estado === 'respondida' ? st('Respondida', 'ok') : c.tipo === 'avaliacao' ? st('Avaliação sem resposta', 'bad') : c.fora ? st('Fora de horas', 'warn') : st('Por responder', 'bad');
      const prev = c.msgs.filter((m) => m.de === 'cliente').slice(-1)[0];
      return '<button type="button" class="it' + (c.estado === 'pendente' ? ' unread' : '') + '" data-act="conv" data-arg="' + c.id + '" data-fk="conv:' + c.id + '" aria-current="' + (cur && cur.id === c.id ? 'true' : 'false') + '"><span class="av ' + tone(c.nome) + '" aria-hidden="true">' + esc(initials(c.nome)) + '<span class="ch">' + brand(c.canal) + '</span></span><span style="min-width:0"><span class="it-top"><strong>' + esc(c.nome) + '</strong><span class="it-time">' + rel(c.recebida) + '</span></span><span class="it-ch">' + CANAL_N[c.canal] + (c.loja ? ' · ' + lojaN(c.loja) : '') + (c.tipo === 'avaliacao' ? ' · ' + c.estrelas + ' ' + ic('star', 'f star-i') : '') + '</span><span class="it-prev">' + esc(prev ? prev.txt : '') + '</span>' + sta + '</span></button>';
    }).join('') : '<div class="list-empty">' + ic('done_all') + '<p>Nada ' + (f.est === 'respondida' ? 'respondido' : 'por responder') + (f.canal === 'todos' ? '' : ' no ' + CANAL_N[f.canal]) + '.</p></div>';
    return head('Caixa de mensagens', 'WhatsApp das 3 lojas, Instagram, Facebook, avaliações do Google e formulários do site', '') + tabs('caixa') +
      '<div class="stack">' + band + filtros + '<div class="inbox" data-view="' + ui.view + '"><section class="card list" aria-label="Conversas">' + items + '</section>' + (cur ? vConversa(cur) + vCliente(cur) : '<section class="card conv">' + empty('forum', 'Sem conversa seleccionada', 'Escolha outro canal ou estado.') + '</section>') + '</div></div>';
  }
  function vConversa(c) {
    const espera = c.estado === 'pendente' ? st('Aguarda há ' + dur((NOW - dt(c.recebida)) / 6e4), 'bad', 'schedule') : st('Respondida em ' + dur(c.respostaMin || 0), 'ok', 'check');
    const isRev = c.tipo === 'avaliacao';
    const msgs = isRev
      ? '<div class="review"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px">' + stars(c.estrelas) + '<span class="small muted">' + rel(c.recebida) + '</span></div><div style="font-size:15px;line-height:22px">' + esc(c.msgs[0].txt) + '</div></div>' + (c.msgs[1] ? '<div class="msgs"><div class="msg equipa">' + esc(c.msgs[1].txt) + '<span class="msg-m">Resposta pública da Home Center · ' + rel(c.msgs[1].em) + '</span></div></div>' : '')
      : '<div class="msgs">' + c.msgs.map((m) => m.de === 'sys' ? '<div class="msg sys">' + esc(m.txt) + ' · ' + rel(m.em) + '</div>' : '<div class="msg ' + m.de + '">' + esc(m.txt) + '<span class="msg-m">' + (m.de === 'cliente' ? 'Cliente' : m.de === 'auto' ? 'Resposta automática' : 'Equipa Home Center') + ' · ' + rel(m.em) + '</span></div>').join('') + '</div>';
    const canalAcao = { whatsapp: 'Enviar por WhatsApp', instagram: 'Responder no Instagram', facebook: 'Responder no Facebook', site: 'Responder por e-mail', google: 'Publicar resposta' }[c.canal];
    const draft = ui.drafts[c.id] != null ? ui.drafts[c.id] : (isRev && c.estado === 'pendente' ? c.sugestao : '');
    let inline = '';
    if (ui.open === 'agendar') {
      inline = '<form class="inline" data-form="visita" novalidate><div class="inline-h"><span>Agendar visita à loja</span><button type="button" class="ib" data-act="close-inline" aria-label="Fechar">' + ic('close') + '</button></div><div class="form f3">' +
        fld('visita', { name: 'data', label: 'Dia', type: 'select', req: true, options: [[HOJE, 'Hoje, ' + fData(HOJE)]].concat(proximosDias(6)), value: addDays(HOJE, 1) }) +
        fld('visita', { name: 'hora', label: 'Hora', type: 'select', req: true, options: horas(), value: '10:00' }) +
        fld('visita', { name: 'loja', label: 'Loja', type: 'select', req: true, options: lojaOpts(), value: c.loja || 'angola' }) +
        '</div><div class="acts"><button class="b b-f b-s" type="submit">' + ic('event_available') + 'Agendar e enviar confirmação</button></div></form>';
    } else if (ui.open === 'link') {
      inline = '<form class="inline" data-form="link" novalidate><div class="inline-h"><span>Link de pagamento</span><button type="button" class="ib" data-act="close-inline" aria-label="Fechar">' + ic('close') + '</button></div><div class="form">' +
        fld('link', { name: 'valor', label: 'Valor', type: 'num', req: true, suffix: 'MT' }) +
        fld('link', { name: 'meio', label: 'Pagamento por', type: 'select', req: true, options: [['M-Pesa', 'M-Pesa'], ['e-Mola', 'e-Mola'], ['cartão', 'Cartão']], value: 'M-Pesa' }) +
        '</div><div class="acts"><button class="b b-f b-s" type="submit">' + ic('add_link') + 'Inserir na resposta</button></div></form>';
    } else if (ui.open === 'qr') {
      inline = '<div class="inline"><div class="inline-h"><span>Respostas rápidas</span><button type="button" class="ib" data-act="close-inline" aria-label="Fechar">' + ic('close') + '</button></div><div class="pop" style="box-shadow:none;background:transparent;padding:0;max-width:none">' + S.respostasRapidas.map((q) => '<button type="button" class="mi noic" data-act="qr" data-arg="' + q.id + '"><span><strong style="font-weight:500">' + esc(q.titulo) + '</strong><small>' + esc(q.texto.replace('{nome}', c.nome.split(' ')[0])) + '</small></span></button>').join('') + '</div><a class="small" href="#mensagens/respostas">Gerir respostas rápidas</a></div>';
    }
    const qa = isRev ? '' : '<div class="qa">' +
      '<button type="button" class="fc" data-act="open" data-arg="qr" aria-pressed="' + (ui.open === 'qr') + '">' + ic('bolt', 's18') + 'Respostas rápidas</button>' +
      '<button type="button" class="fc" data-act="open" data-arg="agendar" aria-pressed="' + (ui.open === 'agendar') + '">' + ic('event', 's18') + 'Agendar visita à loja</button>' +
      '<button type="button" class="fc" data-act="open" data-arg="link" aria-pressed="' + (ui.open === 'link') + '">' + ic('payments', 's18') + 'Enviar link de pagamento</button>' +
      (c.pedido ? '<a class="fc" href="#pedidos/lista?p=' + c.pedido + '">' + ic('local_shipping', 's18') + 'Ver pedido ' + c.pedido + '</a>' : '<a class="fc" href="#pedidos/novo?conv=' + c.id + '">' + ic('add_shopping_cart', 's18') + 'Criar pedido</a>') + '</div>';
    const compose = '<form class="compose" data-form="resposta" novalidate>' + fld('resposta', { name: 'txt', label: isRev ? 'Resposta pública (sugestão editável)' : 'Escrever resposta', type: 'textarea', req: true, rows: 3, value: draft, hint: isRev ? 'Fica visível no ' + CANAL_N[c.canal] + ' para todos os clientes.' : '' }) +
      '<div class="compose-a"><span class="small muted">' + (c.estado === 'pendente' ? 'Ao enviar, a conversa passa a respondida.' : 'Conversa já respondida.') + '</span><button type="submit" class="b b-f">' + ic('send') + canalAcao + '</button></div></form>';
    return '<section class="card conv" aria-label="Conversa aberta"><div class="conv-h"><div style="display:flex;gap:4px;align-items:flex-start"><button type="button" class="ib back" data-act="back-list" aria-label="Voltar à lista">' + ic('arrow_back') + '</button><div><h2>' + esc(c.nome) + '</h2><div class="it-ch">' + brand(c.canal) + CANAL_N[c.canal] + (c.formulario ? ', ' + c.formulario.toLowerCase() : '') + (c.loja ? ' · loja ' + lojaN(c.loja) : ' · todas as lojas') + '</div></div></div>' + espera + '</div>' +
      (c.fora && c.estado === 'pendente' ? '<div class="banner">' + ic('nightlight') + '<span>Recebida fora do horário de atendimento. A resposta automática foi enviada e a conversa entrou na fila das 8h00.</span></div>' : '') +
      msgs + inline + qa + compose + '</section>';
  }
  function vCliente(c) {
    const vs = (c.loja ? [c.loja] : LOJAS()).map((s) => [lojaN(s), S.vendedores[s].map((v) => [v.nome, v.nome])]);
    return '<aside class="card cli" aria-label="Ficha do cliente"><h2>Ficha do cliente</h2><dl class="dl"><dt>Tipo</dt><dd>' + esc(c.cliente.tipo) + '</dd><dt>Histórico</dt><dd>' + esc(c.cliente.historico) + '</dd><dt>Valor total</dt><dd>' + (c.cliente.total ? fMT(c.cliente.total) : '—') + '</dd><dt>Última compra</dt><dd>' + esc(c.cliente.ultima || '—') + '</dd></dl>' +
      fld('cli', { name: 'vendedor', label: 'Responsável', type: 'select', value: c.vendedor, change: 'responsavel', options: [['', 'Por atribuir']].concat(vs) }) +
      '<div class="chips">' + c.tags.map((t) => '<span class="tag">' + esc(t) + '</span>').join('') + '</div>' +
      (cidDe(c.id) ? '<a class="b b-o b-s cli-link" href="' + cliUrl(cidDe(c.id)) + '">' + ic('group') + 'Histórico completo do cliente</a>' : '') + '</aside>';
  }
  function vRespostas() {
    const list = S.respostasRapidas.map((q) => ui.open === 'qr-edit:' + q.id
      ? '<form class="inline li" data-form="qr-edit" data-id="' + q.id + '" novalidate style="grid-template-columns:minmax(0,1fr)">' + fld('qre', { name: 'titulo', label: 'Título', req: true, value: q.titulo }) + fld('qre', { name: 'texto', label: 'Texto', type: 'textarea', req: true, value: q.texto, rows: 3 }) + '<div class="acts" style="justify-content:flex-start"><button class="b b-f b-s" type="submit">Guardar</button><button class="b b-x b-s" type="button" data-act="close-inline">Cancelar</button></div></form>'
      : '<div class="li"><div><div class="li-t">' + esc(q.titulo) + '</div><div class="li-d">' + esc(q.texto) + '</div></div><div class="acts"><button type="button" class="ib" data-act="open" data-arg="qr-edit:' + q.id + '" aria-label="Editar ' + esc(q.titulo) + '">' + ic('edit') + '</button><button type="button" class="ib" data-act="del-qr" data-arg="' + q.id + '" aria-label="Apagar ' + esc(q.titulo) + '">' + ic('delete') + '</button></div></div>').join('');
    const form = '<form class="form" data-form="qr-new" novalidate style="grid-template-columns:minmax(0,1fr)">' + fld('qr', { name: 'titulo', label: 'Título', req: true, hint: 'Aparece no menu da caixa de mensagens' }) + fld('qr', { name: 'texto', label: 'Texto da resposta', type: 'textarea', req: true, rows: 4, hint: 'Use {nome} para inserir o primeiro nome do cliente.' }) + '<div class="form-act"><button type="submit" class="b b-f">' + ic('add') + 'Adicionar resposta</button></div></form>';
    return head('Respostas rápidas', 'Textos prontos para a equipa responder mais depressa, em todos os canais.', '') + tabs('respostas') +
      '<div class="g g-form">' + card('Respostas guardadas', S.respostasRapidas.length + ' respostas', list || empty('bolt', 'Sem respostas rápidas', 'Adicione a primeira ao lado.'), '', 'c-qr') + card('Nova resposta rápida', '', form, '', 'c-qrn') + '</div>';
  }

  /* ---------- secção: Pedidos e entregas ---------- */
  function vPedidos(tab) {
    if (tab === 'novo') return vNovoPedido();
    if (tab === 'agenda') return vAgenda();
    const k = ui.loja, f = ui.flt;
    const base = S.pedidos.filter((p) => k === 'todas' || p.loja === k);
    const etapas = [['todos', 'Todos', () => true], ['1', 'Aguarda pagamento', (p) => p.passo === 1], ['2', 'Em preparação', (p) => p.passo === 2], ['3', 'Em entrega', (p) => p.passo === 3], ['4', 'Por montar', (p) => p.passo === 4], ['5', 'Concluídos', (p) => p.passo === 5], ['atrasados', 'Atrasados', atrasado]];
    const fe = etapas.find((e) => e[0] === f.etapa) || etapas[0];
    const pipe = '<div class="pipe" role="group" aria-label="Etapa do pedido">' + etapas.map(([e, l, fn]) => '<button type="button" class="' + (e === 'atrasados' ? 'late' : '') + '" data-act="etapa" data-arg="' + e + '" data-fk="etapa:' + e + '" aria-pressed="' + (fe[0] === e) + '"><span class="pl"><span class="pl-l">' + l + '</span><span class="pl-s">' + ({ '1': 'Por pagar', '2': 'Preparação' }[e] || l) + '</span></span><span class="pn">' + base.filter(fn).length + '</span></button>').join('') + '</div>';
    const list = base.filter(fe[2]).filter((p) => f.pcanal === 'todos' || p.canal === f.pcanal).sort((a, b) => b.id.localeCompare(a.id));
    const cur = list.find((p) => p.id === ui.sel.ped) || S.pedidos.find((p) => p.id === ui.sel.ped && (k === 'todas' || p.loja === k)) || list[0];
    if (cur) ui.sel.ped = cur.id;
    const rows = list.length ? list.map((p) => {
      const [e, t] = pedidoEstado(p);
      return '<tr class="click' + (cur && cur.id === p.id ? ' on' : '') + '" data-act="ped" data-arg="' + p.id + '"><td class="h nw" data-l="Pedido"><button type="button" class="idbtn" data-act="ped" data-arg="' + p.id + '" data-scroll="1" data-fk="ped:' + p.id + '" aria-label="Ver o pedido ' + p.id + '">' + p.id + '</button><span class="sub">' + rel(p.criado) + '</span></td><td class="clip" data-l="Cliente">' + esc(p.cliente) + '<span class="sub">' + esc(p.itens) + '</span></td><td data-l="Loja e canal" class="nw">' + lojaN(p.loja) + '<span class="sub">' + PED_CANAL[p.canal] + '</span></td><td class="r nw" data-l="Valor">' + fMT(p.valor) + '<span class="sub">' + esc(p.pagamento) + '</span></td><td data-l="Estado e entrega" class="est">' + st(e, t) + '<span class="sub"' + (atrasado(p) ? ' style="color:var(--bad)"' : '') + '>' + (p.entrega ? (atrasado(p) ? 'Previsto ' + fData(p.entrega) + ', há ' + diasAtraso(p) + (diasAtraso(p) === 1 ? ' dia' : ' dias') : (p.passo === 5 ? 'Concluído ' : p.passo === 4 ? 'Montagem ' : 'Entrega ') + (p.entrega === HOJE ? 'hoje' : fData(p.entrega))) + (p.equipa ? ', equipa ' + p.equipa : '') : 'Sem data de entrega') + '</span></td></tr>';
    }).join('') : '<tr><td colspan="5">' + empty('inventory_2', 'Sem pedidos nesta etapa', 'Experimente outra etapa ou canal.') + '</td></tr>';
    const canais = [['todos', 'Todos os canais']].concat(Object.entries(PED_CANAL).filter(([c]) => base.some((p) => p.canal === c)));
    const lista = card('Pedidos', '<div class="chips" role="group" aria-label="Canal do pedido">' + canais.map(([c, l]) => chip('pcanal', c, l, f.pcanal === c)).join('') + '</div>', '<div class="tw"><table class="t cards"><thead><tr><th scope="col">Pedido</th><th scope="col">Cliente</th><th scope="col">Loja e canal</th><th scope="col" class="r">Valor</th><th scope="col">Estado e entrega</th></tr></thead><tbody>' + rows + '</tbody></table></div>', '', 'c-ped');
    const ab = card('Compras abandonadas no site', 'Últimos 7 dias: ' + S.abandonadas.length + ' compras, ' + fMT(sum(S.abandonadas, (a) => a.valor)) + '. Pagamento online por M-Pesa, e-Mola e cartão.', '<div class="tw"><table class="t cards"><thead><tr><th scope="col">Cliente</th><th scope="col">Produto</th><th scope="col" class="r">Valor</th><th scope="col">Parou em</th><th scope="col">Quando</th><th scope="col">Seguimento</th><th scope="col"><span class="sr">Acção</span></th></tr></thead><tbody>' + S.abandonadas.map((a) => '<tr><td class="h" data-l="Cliente">' + esc(a.cliente) + '</td><td data-l="Produto">' + esc(a.produto) + '</td><td class="r nw" data-l="Valor">' + fMT(a.valor) + '</td><td data-l="Parou em">' + esc(a.passo) + '</td><td data-l="Quando" class="nw">' + rel(a.quando) + '</td><td data-l="Seguimento">' + (a.contacto ? st('Lembrete enviado ' + rel(a.contacto), 'ok', 'check') : st('Por contactar', 'warn')) + '</td><td class="act r" data-l="">' + (a.contacto ? '<a class="b b-o b-s" href="#pedidos/novo?ab=' + a.id + '">Criar pedido</a>' : '<button type="button" class="b b-t b-s" data-act="lembrete" data-arg="' + a.id + '">' + ic('send') + 'Enviar lembrete</button>') + '</td></tr>').join('') + '</tbody></table></div>', '', 'abandonadas');
    return head('Pedidos e entregas', 'Pedidos do site, das lojas, do WhatsApp e de clientes empresariais' + (k === 'todas' ? '' : ' · ' + lojaN(k)), '<a class="b b-f" href="#pedidos/novo">' + ic('add') + 'Novo pedido</a>') + tabs('lista') +
      '<div class="stack">' + pipe + '<div class="split">' + lista + (cur ? vDetalhe(cur) : '') + '</div>' + ab + '</div>';
  }
  function vDetalhe(p) {
    const [e, t] = pedidoEstado(p);
    const late = atrasado(p);
    const steps = ETAPAS.map((n, i) => {
      const done = i < p.passo, now = i === p.passo;
      const sub = done ? 'Concluído' : now ? (late ? 'Atrasado: previsto para ' + fData(p.entrega) : i === 3 ? (p.entrega ? 'Previsto para ' + (p.entrega === HOJE ? 'hoje' : fDataS(p.entrega)) : 'Sem data marcada') : i === 4 && p.entrega ? 'Marcada para ' + fDataS(p.entrega) : 'Em curso') : 'Por fazer';
      return '<li class="' + (done ? 'done' : now ? 'now' + (late ? ' late' : '') : '') + '"><span class="sd">' + (done ? ic('check') : '') + '</span><span><strong>' + n + '</strong><small>' + sub + '</small></span></li>';
    }).join('');
    const reag = ui.open === 'reag'
      ? '<form class="inline" data-form="reag" novalidate style="margin-bottom:16px"><div class="inline-h"><span>' + (p.entrega ? 'Reagendar entrega' : 'Agendar entrega') + '</span><button type="button" class="ib" data-act="close-inline" aria-label="Fechar">' + ic('close') + '</button></div>' + fld('reag', { name: 'data', label: p.passo === 4 ? 'Data da montagem' : 'Data de entrega', type: 'date', req: true, min: HOJE, value: p.entrega && p.entrega >= HOJE ? p.entrega : addDays(HOJE, 2) }) + fld('reag', { name: 'equipa', label: 'Equipa de entrega e montagem', type: 'select', req: true, value: p.equipa, options: [['', 'Escolha a equipa']].concat(EQUIPAS.map((x) => [x, 'Equipa ' + x])) }) + '<div class="acts" style="justify-content:flex-start"><button class="b b-f b-s" type="submit">Guardar data</button></div></form>' : '';
    return '<aside class="card detail" id="detail" aria-labelledby="det-h"><div class="det-h"><h2 id="det-h">' + p.id + '</h2>' + st(e, t) + '</div><p style="margin:0 0 2px;font-weight:500;font-size:15px">' + esc(p.cliente) + '</p><p class="muted" style="margin:0 0 16px">' + esc(p.itens) + '</p>' +
      '<dl class="dl" style="margin-bottom:18px"><dt>Valor</dt><dd>' + fMT(p.valor) + '</dd><dt>Pagamento</dt><dd>' + esc(p.pagamento) + '</dd><dt>Canal e loja</dt><dd>' + PED_CANAL[p.canal] + ', ' + lojaN(p.loja) + '</dd><dt>Equipa</dt><dd>' + (p.equipa ? 'Equipa ' + p.equipa : '—') + '</dd></dl>' +
      '<ol class="steps">' + steps + '</ol>' + reag +
      '<div class="acts">' + (p.passo < 5 ? '<button type="button" class="b b-f b-s" data-act="avancar" data-arg="' + p.id + '">' + ic('check') + PROX[p.passo] + '</button>' : '') + (p.passo >= 2 && p.passo < 5 ? '<button type="button" class="b b-o b-s" data-act="open" data-arg="reag">' + ic('event') + (p.entrega ? 'Reagendar' : 'Agendar entrega') + '</button>' : '') + '<button type="button" class="b b-o b-s" data-act="notificar" data-arg="' + p.id + '">' + brand('whatsapp') + 'Notificar cliente</button>' + ((p.cid || cidDe(p.id)) ? '<a class="b b-x b-s" href="' + cliUrl(p.cid || cidDe(p.id)) + '">' + ic('group') + 'Histórico do cliente</a>' : '') + '</div>' +
      (p.notas.length ? '<ul class="log" aria-label="Histórico do pedido">' + p.notas.slice().reverse().map((n) => '<li><span>' + fData(n.em) + ', ' + fHora(n.em) + '</span><span>' + esc(n.txt) + '</span></li>').join('') + '</ul>' : '') + '</aside>';
  }
  function vNovoPedido() {
    const q = ui.q || {};
    const conv = q.conv ? S.conversas.find((c) => c.id === q.conv) : null;
    const ab = q.ab ? S.abandonadas.find((a) => a.id === q.ab) : null;
    const pre = {
      cliente: conv ? conv.nome : ab ? ab.cliente : '',
      canal: conv ? ({ whatsapp: 'whatsapp', site: conv.cliente.tipo === 'Empresa' ? 'empresas' : 'site', instagram: 'redes', facebook: 'redes', google: 'loja' }[conv.canal]) : ab ? 'site' : 'loja',
      loja: (conv && conv.loja) || (ui.loja !== 'todas' ? ui.loja : ''),
      itens: ab ? ab.produto : '', valor: ab ? fNum(ab.valor) : '', tipo: conv && conv.cliente.tipo === 'Empresa' ? 'Empresa' : 'Particular'
    };
    const F = 'pedido';
    const form = '<form class="form" data-form="pedido" data-conv="' + (conv ? conv.id : '') + '" data-ab="' + (ab ? ab.id : '') + '" novalidate>' +
      (conv ? '<div class="info-box full">' + ic('forum') + '<span>A partir da conversa com ' + esc(conv.nome) + ' (' + CANAL_N[conv.canal] + '). O pedido fica ligado à conversa.</span></div>' : '') +
      (ab ? '<div class="info-box full">' + ic('shopping_cart') + '<span>Recuperação da compra abandonada no site por ' + esc(ab.cliente) + '.</span></div>' : '') +
      '<div class="form-h">Cliente</div>' +
      fld(F, { name: 'cliente', label: 'Nome do cliente ou empresa', req: true, value: pre.cliente, auto: 'name' }) +
      fld(F, { name: 'telefone', label: 'Telefone (WhatsApp)', type: 'tel', hint: 'Para os avisos de entrega, por exemplo 84 123 4567', auto: 'tel' }) +
      fld(F, { name: 'email', label: 'E-mail do cliente', type: 'email', auto: 'email', hint: 'Opcional. Junta o pedido ao histórico do cliente' }) +
      opts(F, 'tipo', [['Particular', 'Particular'], ['Empresa', 'Empresa']], pre.tipo, { legend: 'Tipo de cliente', cls: 'full' }) +
      '<div class="form-h">Pedido</div>' +
      fld(F, { name: 'canal', label: 'Canal', type: 'select', req: true, value: pre.canal, options: Object.entries(PED_CANAL) }) +
      fld(F, { name: 'loja', label: 'Loja', type: 'select', req: true, value: pre.loja, options: lojaOpts(pre.loja, true) }) +
      fld(F, { name: 'itens', label: 'Produtos', type: 'textarea', req: true, cls: 'full', rows: 2, value: pre.itens, hint: 'Por exemplo, sofá de 3 lugares cinzento e mesa de centro' }) +
      fld(F, { name: 'valor', label: 'Valor total', type: 'num', req: true, suffix: 'MT', value: pre.valor }) +
      fld(F, { name: 'pagamento', label: 'Forma de pagamento', type: 'select', req: true, value: '', options: [['', 'Escolha a forma']].concat(PAGAMENTOS.map((x) => [x, x])) }) +
      '<div class="full"><label class="sw"><input type="checkbox" name="pago" role="switch">Pagamento já confirmado</label><span class="hint" style="margin-top:0">Sem confirmação, o pedido fica em «Aguarda pagamento».</span></div>' +
      '<div class="form-h">Entrega e montagem<small>Opcional. Pode agendar depois, no detalhe do pedido.</small></div>' +
      fld(F, { name: 'entrega', label: 'Data de entrega', type: 'date', min: HOJE }) +
      fld(F, { name: 'equipa', label: 'Equipa', type: 'select', value: '', options: [['', 'Escolha a equipa']].concat(EQUIPAS.map((x) => [x, 'Equipa ' + x])) }) +
      '<div class="form-act"><button type="submit" class="b b-f">' + ic('check') + 'Criar pedido</button><a class="b b-x" href="#pedidos/lista">Cancelar</a></div></form>';
    const how = '<ol class="steps">' + ETAPAS.map((n, i) => '<li class="' + (i === 0 ? 'now' : '') + '"><span class="sd"></span><span><strong>' + n + '</strong><small>' + ['Ao guardar este formulário', 'Confirmado pela loja ou pelo M-Pesa, e-Mola ou cartão', 'O armazém separa e embala', 'A equipa entrega na data marcada', 'A equipa monta; segue o inquérito de satisfação'][i] + '</small></span></li>').join('') + '</ol><div class="info-box">' + ic('info') + '<span>O pedido serve para acompanhar a entrega. As vendas entram nos números do painel quando a loja faz o fecho do dia.</span></div>';
    return head('Novo pedido', 'Registe pedidos da loja, do site, do WhatsApp, das redes sociais e de empresas.', '') + tabs('novo') +
      '<div class="g g-form">' + card('Dados do pedido', '', form, '', 'c-pform') + card('Como o pedido avança', '', how, '', 'c-phow') + '</div>';
  }
  function vAgenda() {
    const k = ui.loja;
    const ps = S.pedidos.filter((p) => (k === 'todas' || p.loja === k) && p.entrega && p.passo < 5);
    const late = ps.filter(atrasado);
    const dias = [HOJE].concat(proximosDias(6).map((x) => x[0]));
    const dv = (p) => { const [e, t] = pedidoEstado(p); return '<div class="dv"><span class="team" aria-label="Equipa ' + p.equipa + '">' + (p.equipa || '?') + '</span><span style="min-width:0"><strong style="font-weight:500">' + p.id + ' · ' + esc(p.cliente) + '</strong><span class="li-d" style="display:block">' + esc(p.itens) + ' · ' + lojaN(p.loja) + (p.passo === 4 ? ' · montagem' : '') + '</span></span><span class="acts">' + st(e, t) + '<a class="b b-x b-s" href="#pedidos/lista?p=' + p.id + '">Ver</a></span></div>'; };
    const bloco = (titulo, sub, list) => '<div class="day"><div class="day-h"><strong>' + titulo + '</strong><span>' + sub + '</span></div><div class="day-l">' + (list.length ? list.map(dv).join('') : '<div class="day-none">Sem entregas marcadas.</div>') + '</div></div>';
    const agenda = (late.length ? bloco('Em atraso', late.length + (late.length === 1 ? ' entrega' : ' entregas'), late) : '') + dias.map((d) => { const l = ps.filter((p) => p.entrega === d && !atrasado(p)); return bloco(d === HOJE ? 'Hoje' : fDataS(d), fData(d) + ' · ' + l.length + (l.length === 1 ? ' entrega' : ' entregas'), l); }).join('') + (() => { const l = ps.filter((p) => p.entrega > dias[dias.length - 1]); return l.length ? bloco('Mais tarde', l.length + (l.length === 1 ? ' entrega' : ' entregas'), l) : ''; })();
    const semData = S.pedidos.filter((p) => (k === 'todas' || p.loja === k) && !p.entrega && p.passo >= 2 && p.passo < 4);
    const carga = EQUIPAS.map((e) => [e, ps.filter((p) => p.equipa === e && p.entrega >= HOJE && p.entrega <= dias[dias.length - 1]).length]);
    const maxC = Math.max(1, ...carga.map((x) => x[1]));
    return head('Agenda de entregas', 'Entregas e montagens marcadas para os próximos 7 dias' + (k === 'todas' ? '' : ' · ' + lojaN(k)), '<a class="b b-f" href="#pedidos/novo">' + ic('add') + 'Novo pedido</a>') + tabs('agenda') +
      '<div class="g g-84">' + card('Próximos 7 dias', fDataS(HOJE) + ' a ' + fDataS(dias[dias.length - 1]), agenda, '', 'c-ag') +
      '<div class="stack" style="align-content:start">' + card('Pagos sem data de entrega', semData.length + (semData.length === 1 ? ' pedido' : ' pedidos'), semData.length ? semData.map((p) => '<div class="li"><div><div class="li-t">' + p.id + ' · ' + esc(p.cliente) + '</div><div class="li-d">' + esc(p.itens) + ' · ' + lojaN(p.loja) + '</div></div><div class="acts"><a class="b b-t b-s" href="#pedidos/lista?p=' + p.id + '&reag=1">Agendar</a></div></div>').join('') : empty('event_available', 'Tudo agendado', ''), '', 'c-sem') +
      card('Carga por equipa', 'Próximos 7 dias', '<div class="hb">' + carga.map(([e, n]) => '<div><div class="hb-h"><span>Equipa ' + e + '</span><span>' + n + (n === 1 ? ' serviço' : ' serviços') + '</span></div>' + bar(n / maxC, { cls: 'dark', size: 'thin' }) + '</div>').join('') + '</div>', '', 'c-carga') + '</div></div>';
  }

  /* ---------- secção: Lojas e equipas ---------- */
  const lojaAtiva = () => (ui.loja !== 'todas' ? ui.loja : ui.lojaLocal);
  function escolhaLoja() {
    if (ui.loja !== 'todas') return '';
    return '<div class="chips" role="group" aria-label="Loja a analisar" style="margin-bottom:16px">' + LOJAS().map((s) => chip('loja-local', s, lojaN(s), ui.lojaLocal === s)).join('') + '</div>';
  }
  function vLojas(tab) {
    if (tab === 'avaliar') return vAvaliar();
    if (tab === 'briefing') return vBriefing();
    const s = lojaAtiva(), x = agg(s), L = S.lojas[s], rt = roteiroLoja(s), R = S.roteiro.lojas[s];
    const band = '<div class="band strip">' +
      metric({ l: 'Vendedores', v: String(L.vendedores), s: [L.morada] }) +
      metric({ l: 'Conversão', v: val(x.vendas / x.visitas, 'pct', 'j-conv'), s: ['vendas ÷ visitas no contador da entrada'] }) +
      metric({ l: 'Ticket médio', v: fMT(Math.round(x.valor / x.vendas / 100) * 100), s: ['NPS da loja: ' + npsVal(S.nps.lojas[s])] }) +
      metric({ l: 'Cumprimento do roteiro', v: val(rt, 'int', 'j-rt-' + s) + '%', s: ['Meta ' + META_ROTEIRO + '%, ' + R.n + ' visitas de cliente-mistério'], extra: '<div style="margin-top:12px">' + bar(rt / 100, { k: 'j-rtb-' + s, mark: META_ROTEIRO / 100, label: rt + '% do roteiro cumprido' }) + '</div>' }) + '</div>';
    const vs = S.vendedores[s].slice().sort((a, b) => b.vendas - a.vendas);
    const cm = colaboradores();
    const qrDe = (v) => cm.find((c) => c.nome === v.nome && c.loja === s);
    const tabela = card('Vendedores em destaque e a acompanhar', 'Outubro, ordenado por vendas', '<div class="tw"><table class="t cards"><thead><tr><th scope="col">Vendedor</th><th scope="col" class="r">Vendas</th><th scope="col" class="r">N.º de vendas</th><th scope="col" class="r">Atendimentos</th><th scope="col" class="r">Conversão</th><th scope="col">Nota no roteiro</th><th scope="col" class="r">NPS</th><th scope="col" class="r">Cliente (QR)</th></tr></thead><tbody>' + vs.map((v) => '<tr><td class="h" data-l="Vendedor">' + esc(v.nome) + (v.equipa ? '<span class="sub">' + v.equipa + '</span>' : '') + '</td><td class="r nw" data-l="Vendas">' + fMT(v.vendas) + '</td><td class="r" data-l="N.º de vendas">' + v.n + '</td><td class="r" data-l="Atendimentos">' + v.at + '</td><td class="r" data-l="Conversão">' + fPct(v.n / v.at) + '</td><td data-l="Nota no roteiro">' + st(v.score + '%', v.score >= META_ROTEIRO ? 'ok' : v.score >= 70 ? '' : 'warn') + ' <span class="small muted">' + v.aval + ' aval.</span></td><td class="r" data-l="NPS">' + v.nps + '</td><td class="r nw" data-l="Cliente (QR)">' + (qrDe(v) && qrDe(v).n ? '<a class="rate-l" href="#rankings/colaboradores?k=' + qrDe(v).codigo + '">' + fDec(qrDe(v).media, 1) + ic('star', 'f star-i') + '</a><span class="sub">' + qrDe(v).n + ' aval.</span>' : '—') + '</td></tr>').join('') + '</tbody></table></div>', '', 'c-vend');
    const passos = card('Roteiro de atendimento, passo a passo', '% de visitas em que o passo foi cumprido', '<div class="rows">' + S.roteiro.passos.map((p, i) => '<div class="row"><div class="row-h"><span>' + (i + 1) + '. ' + p + '</span><strong class="num">' + val(R.p[i], 'int', 'rp-' + s + i) + '%</strong></div>' + bar(R.p[i] / 100, { k: 'rpb-' + s + i, mark: META_ROTEIRO / 100, cls: R.p[i] >= META_ROTEIRO ? 'ok' : '' }) + '</div>').join('') + '</div><div class="legend" style="margin:16px 0"><span><i class="mark"></i>Meta de ' + META_ROTEIRO + '%</span></div><div class="foot-row"><a class="b b-t b-s" href="#lojas/avaliar">' + ic('fact_check') + 'Avaliar atendimento</a></div>', 'flex', 'c-rot');
    const coach = S.vendedores[s].filter((v) => v.score < 70);
    const brief = card('Briefing de hoje', '10 minutos, antes da abertura', '<p class="brief-t">' + esc(S.briefing.titulo) + '</p><p class="muted" style="margin:0 0 16px">' + esc(S.briefing.texto) + '</p>' + '<div>' + (S.briefing.feito[s] ? st('Realizado às ' + S.briefing.feito[s], 'ok', 'check') : st('Por confirmar nesta loja', 'warn')) + '</div>' +
      '<h3 style="font:500 14px/20px var(--font);margin:20px 0 4px">Coaching desta semana</h3>' + (coach.length ? coach.map((v) => '<div class="li"><div><div class="li-t">' + esc(v.nome) + '</div><div class="li-d">Nota ' + v.score + '% no roteiro</div></div><div class="acts">' + (S.coaching[v.nome] ? st(S.coaching[v.nome].feito ? 'Sessão realizada' : 'Sessão: ' + fDataS(S.coaching[v.nome].data) + ', ' + S.coaching[v.nome].hora.replace(':', 'h'), S.coaching[v.nome].feito ? 'ok' : 'info') : '<a class="b b-o b-s" href="#lojas/briefing">Marcar sessão</a>') + '</div></div>').join('') : '<p class="muted small">Ninguém abaixo de 70% nesta loja.</p>') + '<div class="foot-row"><a href="#lojas/briefing">Gerir briefing e coaching</a></div>', 'flex', 'c-brief');
    return head('Lojas e equipas', 'Desempenho de vendedores, roteiro de atendimento e coaching · ' + lojaN(s), '') + tabs('desempenho') + escolhaLoja() +
      '<div class="stack">' + band + tabela + '<div class="g g-75">' + passos + brief + '</div></div>';
  }
  function vAvaliar() {
    const s = lojaAtiva(), F = 'aval';
    const form = '<form class="form" data-form="aval" novalidate>' +
      fld(F, { name: 'loja', label: 'Loja', type: 'select', req: true, value: s, options: lojaOpts(), change: 'aval-loja' }) +
      fld(F, { name: 'vendedor', label: 'Vendedor avaliado', type: 'select', req: true, value: '', options: [['', 'Escolha o vendedor']].concat(S.vendedores[s].map((v) => [v.nome, v.nome + ' (nota actual ' + v.score + '%)'])) }) +
      fld(F, { name: 'data', label: 'Data da visita', type: 'date', req: true, value: HOJE, min: '2026-10-01', max: HOJE }) +
      fld(F, { name: 'tipo', label: 'Tipo de avaliação', type: 'select', req: true, value: 'Cliente-mistério', options: [['Cliente-mistério', 'Cliente-mistério'], ['Observação do gerente', 'Observação do gerente']] }) +
      '<fieldset class="fs full" id="aval-passos"><legend>Roteiro de atendimento *<small>Marque o que o vendedor cumpriu</small></legend>' + S.roteiro.passos.map((p, i) => '<div class="step-q"><span>' + (i + 1) + '. ' + p + '</span><div class="opts">' + [['1', 'Cumprido'], ['0', 'Não cumprido']].map(([v, l]) => '<label class="opt"><input type="radio" name="p' + i + '" value="' + v + '"><span>' + ic('check') + l + '</span></label>').join('') + '</div></div>').join('') + '<span class="hint" id="aval-passos-h" data-hint=""></span></fieldset>' +
      fld(F, { name: 'obs', label: 'Observações para o coaching', type: 'textarea', cls: 'full', rows: 2 }) +
      '<div class="form-act"><button type="submit" class="b b-f">' + ic('check') + 'Guardar avaliação</button></div></form>';
    const ult = S.avaliacoes.slice(-5).reverse();
    return head('Avaliar atendimento', 'Visitas de cliente-mistério e observações do gerente, passo a passo do roteiro.', '') + tabs('avaliar') +
      '<div class="g g-form">' + card('Nova avaliação', '', form, '', 'c-aform') +
      '<div class="stack" style="align-content:start">' + card('Resultado desta visita', '', '<div class="preview" id="aval-prev">' + avalPreview({ loja: s }) + '</div>', '', 'c-aprev') +
      card('Últimas avaliações registadas', '', ult.length ? ult.map((a) => '<div class="li"><div><div class="li-t">' + esc(a.vendedor) + ' · ' + a.nota + '%</div><div class="li-d">' + lojaN(a.loja) + ', ' + fData(a.data) + ', ' + a.tipo.toLowerCase() + '</div></div></div>').join('') : '<p class="muted" style="margin:0">Ainda não registou avaliações nesta sessão. As notas actuais vêm das visitas de Outubro.</p>', '', 'c-alist') + '</div></div>';
  }
  function avalPreview(d) {
    const ps = S.roteiro.passos.map((_, i) => d['p' + i]);
    const resp = ps.filter((x) => x != null).length;
    const nota = Math.round(ps.filter((x) => x === '1').length / 5 * 100);
    const v = d.vendedor ? S.vendedores[d.loja].find((x) => x.nome === d.vendedor) : null;
    const novo = v ? Math.round((v.score * v.aval + nota) / (v.aval + 1)) : null;
    return '<div class="pv"><span class="muted">Passos respondidos</span><span>' + resp + ' de 5</span></div><div class="pv"><span class="muted">Nota desta visita</span><span>' + (resp ? nota + '%' : '—') + '</span></div>' +
      (v ? '<div class="pv"><span class="muted">Nota de ' + esc(v.nome.split(' ')[0]) + '</span><span>' + v.score + '% → <span class="to">' + (resp === 5 ? novo + '%' : '…') + '</span></span></div>' + (resp === 5 && novo < 70 ? '<div class="info-box">' + ic('school') + '<span>Abaixo de 70%: entra na lista de coaching desta semana.</span></div>' : '') : '<p class="muted small" style="margin:0">Escolha o vendedor para ver o efeito na nota.</p>');
  }
  function vBriefing() {
    const k = ui.loja;
    const b = S.briefing;
    const edit = ui.open === 'brief-edit';
    const corpo = edit
      ? '<form class="form" data-form="briefing" novalidate style="grid-template-columns:minmax(0,1fr)">' + fld('brief', { name: 'titulo', label: 'Tema do briefing', req: true, value: b.titulo }) + fld('brief', { name: 'texto', label: 'O que a equipa deve fazer hoje', type: 'textarea', req: true, value: b.texto, rows: 3 }) + '<div class="form-act"><button class="b b-f b-s" type="submit">Guardar briefing</button><button class="b b-x b-s" type="button" data-act="close-inline">Cancelar</button></div></form>'
      : '<p class="brief-t">' + esc(b.titulo) + '</p><p class="muted" style="margin:0 0 12px">' + esc(b.texto) + '</p><button type="button" class="b b-o b-s" data-act="open" data-arg="brief-edit">' + ic('edit') + 'Editar briefing</button>';
    const checks = '<h3 style="font:500 14px/20px var(--font);margin:24px 0 8px">Confirmação por loja</h3>' + LOJAS().map((s) => '<label class="check"><input type="checkbox" data-change="brief-feito" value="' + s + '"' + (b.feito[s] ? ' checked' : '') + '><span>Briefing realizado em <strong style="font-weight:500">' + lojaN(s) + '</strong>' + (b.feito[s] ? ' <span class="muted small">às ' + b.feito[s] + '</span>' : '') + '</span></label>').join('');
    const vs = vendedoresDe(k).filter((v) => v.score < 70).sort((a, b2) => a.score - b2.score);
    const coach = vs.length ? vs.map((v) => {
      const c = S.coaching[v.nome];
      const form = ui.open === 'sessao:' + v.nome ? '<form class="inline full" data-form="sessao" data-nome="' + esc(v.nome) + '" novalidate><div class="form">' + fld('ses', { name: 'data', label: 'Dia', type: 'select', req: true, options: proximosDias(5) }) + fld('ses', { name: 'hora', label: 'Hora', type: 'select', req: true, options: horas(), value: '08:30' }) + '</div><div class="acts" style="justify-content:flex-start"><button class="b b-f b-s" type="submit">Marcar sessão</button><button class="b b-x b-s" type="button" data-act="close-inline">Cancelar</button></div></form>' : '';
      const act = c ? (c.feito ? st('Sessão realizada', 'ok', 'check') : st(fDataS(c.data) + ', ' + c.hora.replace(':', 'h'), 'info', 'event') + '<button type="button" class="b b-x b-s" data-act="sessao-feita" data-arg="' + esc(v.nome) + '">Concluída</button>') : (form ? '' : '<button type="button" class="b b-t b-s" data-act="open" data-arg="sessao:' + esc(v.nome) + '">' + ic('event') + 'Marcar sessão</button>');
      return '<div class="li"><div><div class="li-t">' + esc(v.nome) + '</div><div class="li-d">' + lojaN(v.loja) + ', nota ' + v.score + '% no roteiro, conversão ' + fPct(v.n / v.at) + '</div></div><div class="acts">' + act + '</div>' + form + '</div>';
    }).join('') : empty('school', 'Ninguém abaixo de 70%', 'Toda a equipa cumpre o roteiro acima do mínimo.');
    return head('Briefing e coaching', 'O briefing de 10 minutos antes da abertura e as sessões com quem está abaixo de 70% no roteiro.', '') + tabs('briefing') +
      '<div class="g g-11">' + card('Briefing de hoje', fDataS(HOJE), corpo + checks, '', 'c-b1') + card('Coaching desta semana', vs.length + (vs.length === 1 ? ' vendedor' : ' vendedores') + ' abaixo de 70%', coach, '', 'c-b2') + '</div>';
  }

  /* ---------- secção: Satisfação e NPS ---------- */
  function vSatisfacao(tab) {
    if (tab === 'registar') return vRegistarNps();
    if (tab === 'avaliacoes') return vAvaliacoes();
    const k = ui.loja, no = npsObj(k), nps = npsVal(no), n = nResp(no), pz = prazo(k);
    const det = S.detratores.filter((d) => k === 'todas' || d.loja === k);
    const porContactar = det.filter((d) => !d.contacto);
    const avs = S.conversas.filter((c) => c.tipo === 'avaliacao' && c.estado === 'pendente' && inLoja(c, k));
    const band = '<div class="band strip">' +
      metric({ l: 'NPS ' + (k === 'todas' ? 'geral' : 'da loja'), v: val(nps, 'nps', 's-nps'), s: ['Meta: 50'], extra: '<div class="m-row">' + st(no.p + ' promotores', 'ok') + st(no.d + ' detractores', 'bad') + '</div>' }) +
      metric({ l: 'Respostas ao inquérito', v: val(n, 'int', 's-n'), s: [fPct(n / pz.total, 0) + ' dos clientes com entrega em Outubro'] }) +
      metric({ l: 'Insatisfeitos por contactar', v: val(porContactar.length, 'int', 's-det'), s: ['Regra: contacto em 24 horas'] }) +
      metric({ l: 'Avaliações sem resposta', v: val(avs.length, 'int', 's-av'), s: ['Meta: responder 100% em 48 horas'] }) + '</div>';
    const npsRow = (nome, o, hl) => { const t = nResp(o) || 1; return '<div class="nps-row' + (hl ? '' : ' dim') + '" style="' + (hl ? '' : 'opacity:.55') + '"><span><strong style="font-weight:500">' + nome + '</strong> <span class="small muted">' + nResp(o) + ' respostas</span></span><span class="nps-v">' + npsVal(o) + '</span><div class="stk" role="img" aria-label="' + o.p + ' promotores, ' + o.neu + ' neutros, ' + o.d + ' detractores"><i class="d" style="width:' + (o.d / t * 100) + '%"></i><i class="n" style="width:' + (o.neu / t * 100) + '%"></i><i class="p" style="width:' + (o.p / t * 100) + '%"></i></div></div>'; };
    const legend = '<div class="legend" style="margin-top:16px"><span><i class="d"></i>Detractores (0 a 6)</span><span><i class="n"></i>Neutros (7 e 8)</span><span><i class="p"></i>Promotores (9 e 10)</span></div>';
    const eqs = Object.entries(S.nps.equipas).sort((a, b) => npsVal(a[1]) - npsVal(b[1]));
    const piores = eqs.slice(0, 2).map((e) => e[0]);
    const cLojas = card('NPS por loja', 'promotores menos detractores', '<div class="rows">' + LOJAS().map((s) => npsRow(lojaN(s), S.nps.lojas[s], k === 'todas' || k === s)).join('') + '</div>' + legend, '', 'c-nl');
    const cEq = card('NPS por equipa de entrega e montagem', 'todas as lojas', '<div class="rows">' + EQUIPAS.map((e) => npsRow('Equipa ' + e, S.nps.equipas[e], true)).join('') + '</div><p class="card-note">Equipas ' + piores.join(' e ') + ' têm as notas mais baixas: prioridade no próximo treinamento de montagem.</p>', '', 'c-ne');
    const detL = det.slice().sort((a, b) => (!!a.contacto - !!b.contacto) || (prazoDet(a) - prazoDet(b))).map((d) => {
      const m = prazoDet(d);
      const prazoTxt = d.contacto ? st('Contactado · ' + d.contacto.resultado, d.contacto.resultado === 'Resolvido' ? 'ok' : 'info', 'check') : m <= 0 ? st('Prazo ultrapassado', 'bad', 'error') : st('Termina em ' + dur(m), m < 8 * 60 ? 'bad' : 'warn', 'schedule');
      const form = ui.open === 'contacto:' + d.id ? '<form class="inline full" data-form="contacto" data-id="' + d.id + '" novalidate>' + opts('ct', 'resultado', [['Resolvido', 'Resolvido'], ['Em acompanhamento', 'Em acompanhamento'], ['Sem resposta', 'Sem resposta']], '', { legend: 'Resultado do contacto', req: true }) + fld('ct', { name: 'nota', label: 'O que ficou combinado', type: 'textarea', rows: 2, hint: 'Por exemplo, nova data de entrega ou compensação oferecida' }) + '<div class="acts" style="justify-content:flex-start"><button class="b b-f b-s" type="submit">Guardar contacto</button><button class="b b-x b-s" type="button" data-act="close-inline">Cancelar</button></div></form>' : '';
      return '<div class="li"><div><div class="li-t">' + (cidDe(d.id) ? '<a href="' + cliUrl(cidDe(d.id)) + '">' + esc(d.nome) + '</a>' : esc(d.nome)) + ' ' + st('Nota ' + d.nota, 'bad') + '</div><div class="li-d">' + lojaN(d.loja) + (d.equipa && d.equipa !== 'loja' ? ', equipa ' + d.equipa : '') + '. ' + esc(d.comentario || d.motivo) + '</div>' + (d.contacto && d.contacto.nota ? '<div class="li-d" style="margin-top:4px">«' + esc(d.contacto.nota) + '»</div>' : '') + '</div><div class="acts">' + prazoTxt + (!d.contacto && !form ? '<button type="button" class="b b-t b-s" data-act="open" data-arg="contacto:' + d.id + '">' + ic('call') + 'Registar contacto</button>' : '') + '</div>' + form + '</div>';
    }).join('');
    const cDet = card('Contactar em 24 horas', porContactar.length ? st(porContactar.length + ' por contactar', 'bad') : st('Todos contactados', 'ok'), detL || empty('sentiment_satisfied', 'Sem clientes insatisfeitos', 'Nenhuma nota de 0 a 6 nesta selecção.'), '', 'c-det');
    const totM = sum(Object.values(S.nps.motivos), (x) => x);
    const cMot = card('Motivos de reclamação', 'Outubro, ' + totM + ' reclamações', '<div class="hb">' + Object.entries(S.nps.motivos).sort((a, b) => b[1] - a[1]).map(([t, v]) => '<div><div class="hb-h"><span>' + t + '</span><span>' + fPct(v / totM, 0) + '</span></div>' + bar(v / totM, { size: 'thin', k: 'mot-' + norm(t).slice(0, 8) }) + '</div>').join('') + '</div>', '', 'c-mot');
    return head('Satisfação e NPS', 'Inquérito pós-entrega por WhatsApp e avaliações públicas' + (k === 'todas' ? '' : ' · ' + lojaN(k)), '<button type="button" class="b b-o" data-act="csv-nps">' + ic('download') + 'Exportar relatório</button><a class="b b-f" href="#satisfacao/registar">' + ic('edit_note') + 'Registar resposta</a>') + tabs('painel') +
      '<div class="stack">' + band + '<div class="g g-11">' + cLojas + cMot + '</div><div class="g g-75">' + cDet + cEq + '</div></div>';
  }
  function vRegistarNps() {
    const F = 'nps', loja = ui.loja !== 'todas' ? ui.loja : '';
    const entregues = S.pedidos.filter((p) => p.passo >= 4);
    const form = '<form class="form" data-form="nps" novalidate>' +
      fld(F, { name: 'pedido', label: 'Pedido (opcional)', type: 'select', change: 'nps-pedido', value: '', options: [['', 'Sem pedido associado']].concat(entregues.map((p) => [p.id, p.id + ' · ' + p.cliente])) , hint: 'Preenche a loja e a equipa automaticamente' }) +
      fld(F, { name: 'data', label: 'Data da resposta', type: 'date', req: true, value: HOJE, min: '2026-10-01', max: HOJE }) +
      fld(F, { name: 'cliente', label: 'Cliente', req: true }) +
      fld(F, { name: 'email', label: 'E-mail do cliente', type: 'email', auto: 'email', hint: 'Opcional. Junta a resposta ao histórico do cliente' }) +
      fld(F, { name: 'loja', label: 'Loja', type: 'select', req: true, value: loja, options: lojaOpts(loja, true) }) +
      fld(F, { name: 'equipa', label: 'Equipa de entrega e montagem', type: 'select', req: true, value: '', options: [['', 'Escolha a equipa']].concat(EQUIPAS.map((e) => [e, 'Equipa ' + e])).concat([['loja', 'Levantamento na loja']]) }) +
      '<div class="full">' + opts(F, 'nota', Array.from({ length: 11 }, (_, i) => [String(i), String(i), i <= 6 ? 'd' : i <= 8 ? 'n' : 'p']), '', { legend: 'De 0 a 10, recomendaria a Home Center a um amigo?', req: true, kind: 'nps' }) + '<div class="nps-scale" aria-hidden="true"><span>Nada provável</span><span>Muito provável</span></div></div>' +
      fld(F, { name: 'motivo', label: 'Motivo principal', type: 'select', value: '', options: [['', 'Escolha o motivo']].concat(MOTIVOS.map((m) => [m, m])), hint: 'Obrigatório para notas de 0 a 6' }) +
      fld(F, { name: 'comentario', label: 'Comentário do cliente', type: 'textarea', cls: 'full', rows: 2 }) +
      '<div class="form-act"><button type="submit" class="b b-f">' + ic('check') + 'Guardar resposta</button></div></form>';
    const ult = S.nps.respostas.slice(-5).reverse();
    return head('Registar resposta NPS', 'Respostas ao inquérito de 1 minuto enviado por WhatsApp depois da entrega.', '') + tabs('registar') +
      '<div class="g g-form">' + card('Resposta ao inquérito', '', form, '', 'c-nform') + '<div class="stack" style="align-content:start">' + card('O que acontece ao guardar', '', '<div class="preview" id="nps-prev">' + npsPreview({}) + '</div>', '', 'c-nprev') +
      card('Últimas respostas registadas', '', ult.length ? ult.map((r) => '<div class="li"><div><div class="li-t">' + esc(r.cliente) + ' ' + st('Nota ' + r.nota, r.nota <= 6 ? 'bad' : r.nota <= 8 ? '' : 'ok') + '</div><div class="li-d">' + lojaN(r.loja) + ', ' + fData(r.data) + (r.motivo ? '. ' + esc(r.motivo) : '') + '</div></div></div>').join('') : '<p class="muted" style="margin:0">Ainda não registou respostas nesta sessão.</p>', '', 'c-nlist') + '</div></div>';
  }
  function npsPreview(d) {
    const nota = d.nota != null && d.nota !== '' ? Number(d.nota) : null;
    if (nota == null || !d.loja) return '<p class="muted" style="margin:0">Escolha a loja e a nota para ver o efeito no NPS.</p>';
    const cat = nota <= 6 ? 'd' : nota <= 8 ? 'neu' : 'p';
    const o = Object.assign({}, S.nps.lojas[d.loja]), o2 = Object.assign({}, o); o2[cat]++;
    const g = npsObj('todas'), g2 = Object.assign({}, g); g2[cat]++;
    const lbl = { d: ['Detractor', 'bad'], neu: ['Neutro', ''], p: ['Promotor', 'ok'] }[cat];
    return '<div>' + st(lbl[0], lbl[1]) + '</div><div class="pv"><span class="muted">NPS de ' + lojaN(d.loja) + '</span><span>' + npsVal(o) + ' → <span class="to">' + npsVal(o2) + '</span></span></div><div class="pv"><span class="muted">NPS geral</span><span>' + npsVal(g) + ' → <span class="to">' + npsVal(g2) + '</span></span></div>' +
      (cat === 'd' ? '<div class="info-box">' + ic('call') + '<span>Entra na lista «Contactar em 24 horas», com prazo até amanhã às ' + fHora(isoT(NOW)).replace(':', 'h') + '.</span></div>' : '');
  }
  function vAvaliacoes() {
    const k = ui.loja, f = ui.flt;
    const all = S.conversas.filter((c) => c.tipo === 'avaliacao' && inLoja(c, k));
    const list = all.filter((c) => f.aest === 'todas' || c.estado === f.aest).sort((a, b) => a.recebida.localeCompare(b.recebida) * (f.aest === 'pendente' ? 1 : -1));
    const items = list.length ? list.map((c) => {
      const old = diasEntre(dt(c.recebida), NOW);
      return '<div class="li" style="align-items:start"><div style="min-width:0"><div class="li-t" style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">' + esc(c.nome) + ' ' + stars(c.estrelas) + '</div><div class="it-ch" style="margin:2px 0 8px">' + brand(c.canal) + CANAL_N[c.canal] + (c.loja ? ', ' + lojaN(c.loja) : '') + ' · ' + rel(c.recebida) + '</div><div style="font-size:15px;line-height:22px">' + esc(c.msgs[0].txt) + '</div>' +
        (c.estado === 'respondida' ? '<div class="msg equipa" style="margin-top:12px;max-width:none">' + esc(c.msgs[1] ? c.msgs[1].txt : '') + '<span class="msg-m">Resposta pública · ' + (c.msgs[1] ? rel(c.msgs[1].em) : '') + '</span></div>'
          : '<form class="compose" data-form="aval-resp" data-id="' + c.id + '" novalidate style="margin-top:14px">' + fld('ar-' + c.id, { name: 'txt', label: 'Resposta pública (sugestão editável)', type: 'textarea', req: true, rows: 2, value: ui.drafts[c.id] != null ? ui.drafts[c.id] : c.sugestao }) + '<div class="acts" style="justify-content:flex-start"><button class="b b-f b-s" type="submit">' + ic('send') + 'Publicar no ' + CANAL_N[c.canal] + '</button><a class="b b-x b-s" href="#mensagens/caixa?c=' + c.id + '&canal=' + c.canal + '&est=todas">Abrir na caixa de mensagens</a></div></form>') +
        '</div><div class="acts">' + (c.estado === 'respondida' ? st('Respondida', 'ok', 'check') : st(old > 2 ? 'Há ' + old + ' dias' : 'Dentro do prazo', old > 2 ? 'bad' : 'warn')) + '</div></div>';
    }).join('') : empty('reviews', f.aest === 'pendente' ? 'Todas as avaliações respondidas' : 'Sem avaliações', '');
    return head('Avaliações públicas', 'Google e Facebook. As respostas ficam visíveis para todos os clientes.', '') + tabs('avaliacoes') +
      '<div class="chips" role="group" aria-label="Estado" style="margin-bottom:16px">' + [['pendente', 'Por responder'], ['respondida', 'Respondidas'], ['todas', 'Todas']].map(([e, l]) => chip('aest', e, l + ' <span class="cn">' + all.filter((c) => e === 'todas' || c.estado === e).length + '</span>', f.aest === e)).join('') + '</div>' + card(list.length + (list.length === 1 ? ' avaliação' : ' avaliações'), 'ordenadas pela mais antiga por responder', items, '', 'c-avl');
  }

  /* ---------- secção: Campanhas ---------- */
  const TIPO_C = { out: 'Outdoors', par: 'Parcerias', dig: 'Digital' };
  function vCampanhas(tab) {
    if (tab === 'nova') return vNovaCampanha();
    if (tab === 'registar') return vRegistarResultados();
    const K = S.campanhas, f = ui.flt;
    const T = (l, fn) => sum(l, fn);
    const inv = T(K, (c) => c.investimento), cont = T(K, (c) => c.contactos), vend = T(K, (c) => c.vendas), rec = T(K, (c) => c.receita), conv = T(K, (c) => c.conversas), vis = T(K, (c) => c.visitas);
    const roi = inv ? rec / inv : 0;
    const band = '<div class="band strip">' +
      metric({ l: 'Investimento em Outubro', v: val(inv, 'M', 'k-inv'), s: [K.length + ' campanhas activas'] }) +
      metric({ l: 'Contactos gerados', v: val(cont, 'int', 'k-cont'), s: [fMT(Math.round(inv / Math.max(1, cont))) + ' por contacto'] }) +
      metric({ l: 'Vendas atribuídas', v: val(vend, 'int', 'k-vend'), s: [fM(rec) + ' em receita'] }) +
      metric({ l: 'Retorno sobre o investimento', v: val(roi, 'x', 'k-roi'), s: ['receita atribuída ÷ investimento'] }) + '</div>';
    const L = K.filter((c) => f.ctipo === 'todas' || c.tipo === f.ctipo);
    const rows = L.map((c) => { const r = c.investimento ? c.receita / c.investimento : 0; return '<tr><td class="h" data-l="Campanha">' + esc(c.nome) + '<span class="sub">' + esc(c.plataforma) + '</span></td><td data-l="Como é medida">' + esc(c.medida) + '</td><td class="r nw" data-l="Investimento">' + fMT(c.investimento) + '</td><td class="r" data-l="Contactos">' + fNum(c.contactos) + '</td><td class="r nw" data-l="Custo por contacto">' + (c.contactos ? fMT(Math.round(c.investimento / c.contactos)) : '—') + '</td><td class="r" data-l="Vendas">' + c.vendas + '</td><td class="r nw" data-l="Receita">' + fMT(c.receita) + '</td><td data-l="Retorno">' + (c.contactos ? st(fDec(r) + '×', r >= 2 ? 'ok' : r >= 1 ? '' : 'bad') : st('Sem resultados', '')) + '</td></tr>'; }).join('');
    const tInv = T(L, (c) => c.investimento), tRec = T(L, (c) => c.receita), tCont = T(L, (c) => c.contactos);
    const tabela = card('Resultados por campanha', '<div class="chips" role="group" aria-label="Tipo de campanha">' + [['todas', 'Todas']].concat(Object.entries(TIPO_C)).map(([t, l]) => chip('ctipo', t, l, f.ctipo === t)).join('') + '</div>', '<div class="tw"><table class="t cards"><thead><tr><th scope="col">Campanha</th><th scope="col">Como é medida</th><th scope="col" class="r">Investimento</th><th scope="col" class="r">Contactos</th><th scope="col" class="r">Custo por contacto</th><th scope="col" class="r">Vendas</th><th scope="col" class="r">Receita</th><th scope="col">Retorno</th></tr></thead><tbody>' + rows + '</tbody><tfoot><tr><td class="h" data-l="Total">Total</td><td data-l=""></td><td class="r nw" data-l="Investimento">' + fMT(tInv) + '</td><td class="r" data-l="Contactos">' + fNum(tCont) + '</td><td class="r nw" data-l="Custo por contacto">' + (tCont ? fMT(Math.round(tInv / tCont)) : '—') + '</td><td class="r" data-l="Vendas">' + T(L, (c) => c.vendas) + '</td><td class="r nw" data-l="Receita">' + fMT(tRec) + '</td><td data-l="Retorno">' + (tInv ? fDec(tRec / tInv) + '×' : '—') + '</td></tr></tfoot></table></div>', '', 'c-camp');
    const etapas = [['Contactos', cont], ['Conversas qualificadas', conv], ['Visitas à loja', vis], ['Vendas', vend]];
    const taxas = etapas.map((e, i) => (i ? e[1] / etapas[i - 1][1] : 1));
    let pior = 1; for (let i = 2; i < taxas.length; i++) if (taxas[i] < taxas[pior]) pior = i;
    const perdem = Math.round((1 - taxas[pior]) * 10);
    const funil = card('Do contacto à venda', 'Todas as campanhas, Outubro', '<div class="funnel">' + etapas.map(([t, v], i) => '<div><div class="fn-h"><span><strong>' + t + '</strong>' + (i ? ' · ' + fPct(taxas[i], 0) + ' da etapa anterior' : '') + '</span><span class="num">' + fNum(v) + '</span></div><div class="fbar' + (i === 3 ? ' last' : '') + '" style="width:' + Math.max(3, v / cont * 100).toFixed(1) + '%"></div></div>').join('') + '</div><p class="card-note">A maior perda está entre ' + etapas[pior - 1][0].toLowerCase() + ' e ' + etapas[pior][0].toLowerCase() + ': ' + perdem + ' em cada 10 não avançam.</p>', '', 'c-fun');
    return head('Campanhas', 'Quanto cada outdoor, parceria e anúncio devolve em vendas', '<a class="b b-o" href="#campanhas/registar">' + ic('edit_note') + 'Registar resultados</a><a class="b b-f" href="#campanhas/nova">' + ic('add') + 'Nova campanha</a>') + tabs('resultados') +
      (ui.loja !== 'todas' ? '<div class="info-box" style="margin-bottom:16px">' + ic('info') + '<span>As campanhas são medidas para as três lojas em conjunto; o filtro de loja não se aplica aqui.</span></div>' : '') +
      '<div class="stack">' + band + tabela + '<div class="g g-75">' + funil + card('Como cada canal é medido', '', howList(), '', 'c-how') + '</div></div>';
  }
  const howList = () => '<dl class="how"><dt>Outdoors</dt><dd>Código promocional e QR com número de WhatsApp próprio por local.</dd><dt>Parcerias</dt><dd>Código do parceiro aplicado no fecho da venda.</dd><dt>Digital</dt><dd>Anúncios com clique para WhatsApp e ligações etiquetadas para o site.</dd><dt>Lojas</dt><dd>Pergunta obrigatória «como nos conheceu?» no registo da venda.</dd></dl>';
  function vNovaCampanha() {
    const F = 'camp';
    const form = '<form class="form" data-form="camp" novalidate>' +
      fld(F, { name: 'nome', label: 'Nome da campanha', req: true, cls: 'full', ph: 'Por exemplo, Quarto completo de Novembro' }) +
      opts(F, 'tipo', Object.entries(TIPO_C).map(([k, l]) => [k, l.replace(/s$/, '')]), '', { legend: 'Tipo', req: true, cls: 'full' }) +
      fld(F, { name: 'plataforma', label: 'Local, parceiro ou plataforma', req: true, hint: 'Por exemplo, EN4 Matola, Meta Ads ou nome do parceiro' }) +
      fld(F, { name: 'medida', label: 'Como é medida', type: 'select', req: true, value: '', options: [['', 'Escolha a medição'], ['Código promocional e QR', 'Código promocional e QR'], ['Código do parceiro', 'Código do parceiro'], ['Número de WhatsApp da campanha', 'Número de WhatsApp da campanha'], ['Ligação etiquetada para o site', 'Ligação etiquetada para o site'], ['Formulário para empresas', 'Formulário para empresas']] }) +
      fld(F, { name: 'codigo', label: 'Código ou número', hint: 'Por exemplo, OUT-EN4 ou o número de WhatsApp da campanha' }) +
      fld(F, { name: 'investimento', label: 'Investimento', type: 'num', req: true, suffix: 'MT' }) +
      fld(F, { name: 'inicio', label: 'Início', type: 'date', req: true, value: HOJE }) +
      fld(F, { name: 'fim', label: 'Fim', type: 'date', req: true }) +
      '<div class="form-act"><button type="submit" class="b b-f">' + ic('add') + 'Criar campanha</button></div></form>';
    return head('Nova campanha', 'Defina como a campanha vai ser medida antes de a lançar.', '') + tabs('nova') +
      '<div class="g g-form">' + card('Dados da campanha', '', form, '', 'c-cform') + card('Como cada canal é medido', '', howList() + '<div class="info-box" style="margin-top:16px">' + ic('info') + '<span>A campanha começa com zero resultados. Registe contactos, visitas e vendas no separador «Registar resultados».</span></div>', '', 'c-chow') + '</div>';
  }
  function vRegistarResultados() {
    const F = 'res';
    const form = '<form class="form" data-form="res" novalidate>' +
      fld(F, { name: 'campanha', label: 'Campanha', type: 'select', req: true, cls: 'full', value: (ui.q && ui.q.k) || '', change: 'res-camp', options: [['', 'Escolha a campanha']].concat(S.campanhas.map((c) => [c.id, c.nome])) }) +
      fld(F, { name: 'data', label: 'Resultados até ao dia', type: 'date', req: true, value: HOJE, max: HOJE }) +
      '<div></div>' +
      fld(F, { name: 'contactos', label: 'Contactos novos', type: 'num', req: true, hint: 'Mensagens, leituras do QR ou formulários' }) +
      fld(F, { name: 'conversas', label: 'Conversas qualificadas', type: 'num', req: true, hint: 'Com interesse e orçamento' }) +
      fld(F, { name: 'visitas', label: 'Visitas à loja', type: 'num', req: true }) +
      fld(F, { name: 'vendas', label: 'Vendas', type: 'num', req: true }) +
      fld(F, { name: 'receita', label: 'Receita das vendas', type: 'num', req: true, suffix: 'MT', cls: 'full' }) +
      '<div class="form-act"><button type="submit" class="b b-f">' + ic('check') + 'Guardar resultados</button></div></form>';
    const ult = S.resultados.slice(-5).reverse();
    return head('Registar resultados', 'Some os resultados da semana a cada campanha; o retorno recalcula logo.', '') + tabs('registar') +
      '<div class="g g-form">' + card('Resultados da campanha', '', form, '', 'c-rform') + '<div class="stack" style="align-content:start">' + card('Efeito no retorno', '', '<div class="preview" id="res-prev">' + resPreview({ campanha: (ui.q && ui.q.k) || '' }) + '</div>', '', 'c-rprev') +
      card('Últimos registos', '', ult.length ? ult.map((r) => '<div class="li"><div><div class="li-t">' + esc(r.nome) + '</div><div class="li-d">Até ' + fData(r.data) + ': ' + r.contactos + ' contactos, ' + r.vendas + ' vendas, ' + fMT(r.receita) + '</div></div></div>').join('') : '<p class="muted" style="margin:0">Ainda não registou resultados nesta sessão.</p>', '', 'c-rlist') + '</div></div>';
  }
  function resPreview(d) {
    const c = S.campanhas.find((x) => x.id === d.campanha);
    if (!c) return '<p class="muted" style="margin:0">Escolha a campanha para ver o efeito.</p>';
    const add = (k) => (pn(d[k]) || 0);
    const nc = c.contactos + add('contactos'), nr = c.receita + add('receita');
    const row = (l, a, b) => '<div class="pv"><span class="muted">' + l + '</span><span>' + a + ' → <span class="to">' + b + '</span></span></div>';
    return '<div class="li-t">' + esc(c.nome) + '</div>' + row('Contactos', fNum(c.contactos), fNum(nc)) + row('Custo por contacto', c.contactos ? fMT(Math.round(c.investimento / c.contactos)) : '—', nc ? fMT(Math.round(c.investimento / nc)) : '—') + row('Vendas', c.vendas, c.vendas + add('vendas')) + row('Retorno', fDec(c.receita / c.investimento) + '×', fDec(nr / c.investimento) + '×');
  }

  /* ---------- secção: Financeiro ---------- */
  function vFinanceiro(tab) {
    if (tab === 'receber') return vReceber();
    if (tab === 'registar') return vFinRegistar();
    const k = ui.loja, a = agg(k);
    const abertas = S.facturas.filter((f) => !f.paga), venc = abertas.filter((f) => f.vencimento < HOJE);
    const dp = a.descontos / a.valor;
    const band = '<div class="band strip">' +
      metric({ l: 'Receita de Outubro', v: val(a.valor, 'M', 'f-rec'), s: [trend(a.valor / a.setembro - 1, 'face a Setembro')] }) +
      metric({ l: 'Margem bruta', v: fPct(S.margem, 0), s: [fM(a.valor * S.margem) + ', margem média da facturação'] }) +
      metric({ l: 'Descontos concedidos', v: val(dp, 'pct', 'f-desc'), s: [fM(a.descontos) + ' da receita'], extra: '<div class="m-row">' + (dp <= META_DESC ? st('Dentro da meta de 4%', 'ok', 'check') : st('Acima da meta de 4%', 'bad')) + '</div>' }) +
      metric({ l: 'A receber de empresas', v: val(sum(abertas, (f) => f.valor), 'M', 'f-ar'), s: [fM(sum(venc, (f) => f.valor)) + ' vencidos'] }) + '</div>';
    const tot = agg('todas');
    const meses = S.meses.concat([['Out', tot.valor]]);
    const maxM = Math.max(...meses.map((m) => m[1])) * 1.08;
    const cols = card('Receita mensal', 'milhões de MT, as três lojas e o site', '<div class="cols" role="img" aria-label="Receita mensal de Maio a Outubro: ' + meses.map((m) => m[0] + ' ' + fDec(m[1] / 1e6)).join('; ') + ' milhões de meticais">' + meses.map((m, i) => '<div class="col' + (i === meses.length - 1 ? ' now' : '') + '"><span class="col-v">' + fDec(m[1] / 1e6) + '</span><div class="col-b" style="height:' + (m[1] / maxM * 100).toFixed(1) + '%"></div><span class="col-m">' + m[0] + (i === meses.length - 1 ? ', até ' + fData(ultimoFecho('todas')) : '') + '</span></div>').join('') + '</div>', 'flex', 'c-cols');
    const pag = card('Formas de pagamento', '% da receita', '<div class="hb">' + S.pagamentos.map(([t, v]) => '<div><div class="hb-h"><span>' + t + '</span><span>' + v + '%</span></div>' + bar(v / 100, { cls: 'dark', size: 'thin' }) + '</div>').join('') + '</div><p class="card-note">Fonte: sistema de facturação, Outubro até ontem. Integração a definir.</p>', '', 'c-pag');
    const conc = LOJAS().filter((s) => k === 'todas' || k === s).map((s) => {
      const x = agg(s), dif = x.recebido - x.valor, sem = S.pedidos.filter((p) => p.loja === s && !p.entrega && p.passo >= 2 && p.passo < 4).length, ver = S.verificados[s];
      const estado = dif === 0 ? st('Conciliado', 'ok', 'check') : ver ? st('Verificado', 'info', 'check') : st('Por verificar', 'warn');
      const form = ui.open === 'verif:' + s ? '<tr><td colspan="8"><form class="inline" data-form="verif" data-loja="' + s + '" novalidate>' + fld('vf', { name: 'nota', label: 'Justificação da diferença de ' + fMT(dif), type: 'textarea', req: true, rows: 2, hint: 'Por exemplo, pagamento por cartão por confirmar no extracto' }) + '<div class="acts" style="justify-content:flex-start"><button class="b b-f b-s" type="submit">Marcar como verificado</button><button class="b b-x b-s" type="button" data-act="close-inline">Cancelar</button></div></form></td></tr>' : '';
      return '<tr><td class="h" data-l="Loja">' + lojaN(s) + (ver ? '<span class="sub">' + esc(ver.nota) + '</span>' : '') + '</td><td class="r nw" data-l="Vendas registadas">' + fMT(x.valor) + '</td><td class="r nw" data-l="Recebido ou facturado">' + fMT(x.recebido) + '</td><td class="r nw" data-l="Diferença"' + (dif ? ' style="color:var(--bad)"' : '') + '>' + fMT(dif) + '</td><td class="r" data-l="Pagos sem entrega agendada">' + sem + '</td><td class="r" data-l="Descontos">' + fPct(x.descontos / x.valor) + '</td><td data-l="Estado">' + estado + '</td><td class="act r" data-l="">' + (dif && !ver && !form ? '<button type="button" class="b b-x b-s" data-act="open" data-arg="verif:' + s + '">Verificar</button>' : '') + '</td></tr>' + form;
    }).join('');
    const tabela = card('Conciliação de vendas, caixa e entregas', 'Outubro, até ao fecho de ' + fData(ultimoFecho(k)), '<div class="tw"><table class="t cards"><thead><tr><th scope="col">Loja</th><th scope="col" class="r">Vendas registadas</th><th scope="col" class="r">Recebido ou facturado</th><th scope="col" class="r">Diferença</th><th scope="col" class="r">Pagos sem entrega agendada</th><th scope="col" class="r">Descontos</th><th scope="col">Estado</th><th scope="col"><span class="sr">Acção</span></th></tr></thead><tbody>' + conc + '</tbody></table></div>', '', 'c-conc');
    return head('Financeiro', 'Receita, margem, descontos, conciliação de caixa e contas a receber' + (k === 'todas' ? '' : ' · ' + lojaN(k)), '<button type="button" class="b b-o" data-act="csv-fin">' + ic('download') + 'Exportar para Excel</button><a class="b b-f" href="#financeiro/registar">' + ic('edit_note') + 'Registar</a>') + tabs('resumo') +
      '<div class="stack">' + band + '<div class="g g-75">' + cols + pag + '</div>' + tabela + '</div>';
  }
  function vReceber() {
    const L = S.facturas.slice().sort((a, b) => (!!a.paga - !!b.paga) || a.vencimento.localeCompare(b.vencimento));
    const rows = L.map((f) => {
      const [t, tn] = facturaEstado(f);
      const form = ui.open === 'receb:' + f.id ? '<tr><td colspan="8"><form class="inline" data-form="receb" data-id="' + f.id + '" novalidate><div class="inline-h"><span>Recebimento de ' + fMT(f.valor) + ' · ' + esc(f.empresa) + '</span><button type="button" class="ib" data-act="close-inline" aria-label="Fechar">' + ic('close') + '</button></div><div class="form">' + fld('rb', { name: 'data', label: 'Data do recebimento', type: 'date', req: true, value: HOJE, max: HOJE }) + fld('rb', { name: 'meio', label: 'Meio', type: 'select', req: true, value: 'Transferência bancária', options: ['Transferência bancária', 'Cheque', 'M-Pesa', 'Numerário'].map((x) => [x, x]) }) + '</div><div class="acts" style="justify-content:flex-start"><button class="b b-f b-s" type="submit">Registar recebimento</button></div></form></td></tr>' : '';
      return '<tr><td class="h" data-l="Empresa">' + esc(f.empresa) + '</td><td data-l="Referência">' + esc(f.ref) + '</td><td class="r nw" data-l="Valor">' + fMT(f.valor) + '</td><td data-l="Emissão" class="nw">' + fData(f.emissao) + '</td><td data-l="Vencimento" class="nw">' + fData(f.vencimento) + '</td><td data-l="Gestor de conta">' + esc(f.gestor) + '</td><td data-l="Estado">' + st(t, tn) + '</td><td class="act r" data-l="">' + (f.paga || form ? '' : '<button type="button" class="b b-t b-s" data-act="open" data-arg="receb:' + f.id + '">Registar recebimento</button>') + '</td></tr>' + form;
    }).join('');
    const ab = S.facturas.filter((f) => !f.paga);
    return head('Contas a receber', 'Facturas de clientes empresariais, a prazo.', '<a class="b b-f" href="#financeiro/registar?tipo=factura">' + ic('add') + 'Nova factura</a>') + tabs('receber') +
      card('Facturas de empresas', fM(sum(ab, (f) => f.valor)) + ' por receber em ' + ab.length + (ab.length === 1 ? ' factura' : ' facturas'), '<div class="tw"><table class="t cards"><thead><tr><th scope="col">Empresa</th><th scope="col">Referência</th><th scope="col" class="r">Valor</th><th scope="col">Emissão</th><th scope="col">Vencimento</th><th scope="col">Gestor de conta</th><th scope="col">Estado</th><th scope="col"><span class="sr">Acção</span></th></tr></thead><tbody>' + rows + '</tbody></table></div><p class="card-note">Para lembrar um cliente, abra a <a href="#mensagens/caixa">caixa de mensagens</a> ou contacte o gestor de conta.</p>', '', 'c-rec');
  }
  function vFinRegistar() {
    const t = ui.flt.fin;
    const seg = '<div class="chips" role="group" aria-label="O que registar" style="margin-bottom:16px">' + chip('fin', 'factura', 'Factura a receber', t === 'factura') + chip('fin', 'desconto', 'Desconto concedido', t === 'desconto') + '</div>';
    let form, aside;
    if (t === 'factura') {
      form = '<form class="form" data-form="factura" novalidate>' + fld('fa', { name: 'empresa', label: 'Empresa', req: true, cls: 'full' }) + fld('fa', { name: 'ref', label: 'Referência', req: true, ph: 'Por exemplo, Fatura de Novembro' }) + fld('fa', { name: 'valor', label: 'Valor', type: 'num', req: true, suffix: 'MT' }) + fld('fa', { name: 'emissao', label: 'Data de emissão', type: 'date', req: true, value: HOJE, max: HOJE }) + fld('fa', { name: 'vencimento', label: 'Vencimento', type: 'date', req: true, value: addDays(HOJE, 30) }) + fld('fa', { name: 'gestor', label: 'Gestor de conta', type: 'select', req: true, value: 'Marta Nhantumbo', options: [['Marta Nhantumbo', 'Marta Nhantumbo'], ['Hélio Sitoe', 'Hélio Sitoe'], ['Direcção Geral', 'Direcção Geral']] }) + '<div class="form-act"><button type="submit" class="b b-f">' + ic('check') + 'Guardar factura</button></div></form>';
      aside = '<div class="preview"><div class="pv"><span class="muted">A receber hoje</span><span>' + fM(sum(S.facturas.filter((f) => !f.paga), (f) => f.valor)) + '</span></div><div class="pv"><span class="muted">Já vencido</span><span>' + fM(sum(S.facturas.filter((f) => !f.paga && f.vencimento < HOJE), (f) => f.valor)) + '</span></div></div><div class="info-box" style="margin-top:16px">' + ic('info') + '<span>A factura entra em «Contas a receber» e no indicador «A receber de empresas».</span></div>';
    } else {
      const loja = ui.loja !== 'todas' ? ui.loja : '';
      form = '<form class="form" data-form="desconto" novalidate>' + fld('de', { name: 'loja', label: 'Loja', type: 'select', req: true, value: loja, options: lojaOpts(loja, true) }) + fld('de', { name: 'data', label: 'Data', type: 'date', req: true, value: HOJE, max: HOJE, min: '2026-10-01' }) + fld('de', { name: 'ref', label: 'Pedido ou venda', req: true, ph: 'Por exemplo, HC-24840' }) + fld('de', { name: 'valor', label: 'Valor do desconto', type: 'num', req: true, suffix: 'MT' }) + fld('de', { name: 'motivo', label: 'Motivo', type: 'select', req: true, value: '', options: [['', 'Escolha o motivo'], ['Negociação de preço', 'Negociação de preço'], ['Produto de exposição', 'Produto de exposição'], ['Cliente empresarial', 'Cliente empresarial'], ['Compensação por atraso', 'Compensação por atraso'], ['Outro', 'Outro']] }) + fld('de', { name: 'autorizado', label: 'Autorizado por', type: 'select', req: true, value: '', options: [['', 'Escolha quem autorizou'], ['Gerente da loja', 'Gerente da loja'], ['Direcção Geral', 'Direcção Geral']] }) + '<div class="form-act"><button type="submit" class="b b-f">' + ic('check') + 'Guardar desconto</button></div></form>';
      aside = '<div class="preview" id="desc-prev">' + descPreview({ loja: loja }) + '</div>';
    }
    const ult = S.descontos.slice(-4).reverse().map((x) => '<div class="li"><div><div class="li-t">' + fMT(x.valor) + ' · ' + esc(x.ref) + '</div><div class="li-d">' + lojaN(x.loja) + ', ' + fData(x.data) + '. ' + esc(x.motivo) + ', autorizado por ' + esc(x.autorizado.toLowerCase()) + '</div></div></div>').join('');
    return head('Registar no financeiro', 'Facturas de clientes empresariais e descontos concedidos nas lojas.', '') + tabs('registar') + seg +
      '<div class="g g-form">' + card(t === 'factura' ? 'Nova factura a receber' : 'Desconto concedido', '', form, '', 'c-fin') + '<div class="stack" style="align-content:start">' + card(t === 'factura' ? 'Contas a receber' : 'Efeito nos descontos', '', aside, '', 'c-finp') + (t === 'desconto' && ult ? card('Últimos descontos registados', '', ult, '', 'c-finl') : '') + '</div></div>';
  }
  function descPreview(d) {
    if (!d.loja) return '<p class="muted" style="margin:0">Escolha a loja para ver o efeito na percentagem de descontos.</p>';
    const x = agg(d.loja), v = pn(d.valor) || 0, a = x.descontos / x.valor, b = (x.descontos + v) / x.valor;
    return '<div class="li-t">' + lojaN(d.loja) + '</div><div class="pv"><span class="muted">Descontos de Outubro</span><span>' + fM(x.descontos) + ' → <span class="to">' + fM(x.descontos + v) + '</span></span></div><div class="pv"><span class="muted">Percentagem da receita</span><span>' + fPct(a) + ' → <span class="to">' + fPct(b) + '</span></span></div>' + (b > META_DESC ? '<div class="info-box">' + ic('warning') + '<span>Acima da meta de 4% da receita.</span></div>' : '');
  }

  /* ---------- secção: Avaliações e rankings (QR code) ---------- */
  const CFG = window.HC_CONFIG || {};
  const CRIT = { vendedor: ['Simpatia e acolhimento', 'Conhecimento dos produtos', 'Rapidez e clareza'], montagem: ['Pontualidade', 'Cuidado com a casa', 'Qualidade da montagem'] };
  const FUNCAO_N = { vendedor: 'Atendimento e vendas', montagem: 'Entrega e montagem' };
  const MIN_RANK = 5;
  const RKEY = 'hc-gestao-remoto';
  const R = (() => { try { return Object.assign({ colabs: [], aval: [], clientes: [], at: null }, JSON.parse(localStorage.getItem(RKEY)) || {}); } catch (e) { return { colabs: [], aval: [], clientes: [], at: null }; } })();
  R.status = 'a-ligar';
  const saveRemote = () => { try { localStorage.setItem(RKEY, JSON.stringify({ colabs: R.colabs, aval: R.aval.slice(0, 1000), clientes: R.clientes, at: R.at })); } catch (e) { /* sem armazenamento */ } };

  // Supabase por REST. A chave publicável lê os colaboradores e regista-os; avaliações e clientes
  // só passam por funções da base, que devolvem nomes e e-mails abreviados.
  function sb(path, opt) {
    opt = opt || {};
    if (!CFG.supabaseUrl) return Promise.reject(new Error('sem configuração'));
    const headers = { apikey: CFG.supabaseKey };
    if (opt.body) { headers['Content-Type'] = 'application/json'; if (!opt.rpc) headers.Prefer = 'return=minimal'; }
    return fetch(CFG.supabaseUrl + '/rest/v1/' + path, { method: opt.method || 'GET', headers, body: opt.body ? JSON.stringify(opt.body) : undefined })
      .then((res) => {
        if (res.ok) return res.status === 201 || res.status === 204 ? null : res.json();
        return res.json().catch(() => ({})).then((j) => { const e = new Error(j.message || 'erro ' + res.status); e.status = res.status; e.code = j.code; throw e; });
      });
  }
  const rpc = (fn, args) => sb('rpc/' + fn, { method: 'POST', body: args || {}, rpc: true });
  const marca = () => [R.colabs.length, R.aval.length, (R.aval[0] || {}).id, R.aval.filter((a) => a.estado === 'confirmada').length, R.clientes.length, (R.clientes[0] || {}).ultimo_em].join(':');
  // Um pedido de cada vez; o que chegar a meio fica para logo a seguir (quem espera, espera pelos dois).
  let syncP = null, outraVez = false;
  function syncRemote() {
    if (syncP) { outraVez = true; return syncP; }
    syncP = Promise.all([
      sb('hc_colaboradores?select=codigo,nome,funcao,loja,equipa&activo=eq.true'),
      rpc('hc_avaliacoes_lista', { p_limite: 1000 }),
      rpc('hc_clientes_lista')
    ]).then(([cs, as, cl]) => {
      const antes = marca();
      R.colabs = cs; R.aval = as; R.clientes = cl; R.status = 'ok'; R.at = Date.now(); saveRemote();
      if (antes !== marca()) refreshLive();
    }).catch(() => { R.status = 'erro'; }).then(() => {
      syncP = null; updLive();
      if (outraVez) { outraVez = false; return syncRemote(); }
    });
    return syncP;
  }
  const typing = () => { const a = document.activeElement; return !!a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && !!a.closest('#main'); };
  function refreshLive() {
    if (typing() || ui.pop) return;
    if (['rankings', 'visao-geral', 'lojas', 'clientes'].includes(cur.sec) && cur.tab !== 'novo' && cur.tab !== 'registar') { ui.anim = true; render(); }
    else { const n = alertas(ui.loja).length; const dot = document.getElementById('bell-dot'); dot.textContent = n || ''; dot.hidden = !n; }
  }
  const relSync = () => { const s = Math.round((Date.now() - (R.at || 0)) / 1000); return s < 10 ? 'agora' : s < 60 ? 'há ' + s + ' s' : 'há ' + Math.round(s / 60) + ' min'; };
  const horaSync = () => { const t = new Date(R.at); return pad(t.getHours()) + ':' + pad(t.getMinutes()); };
  const liveChip = () => (R.status === 'ok' ? st('Ao vivo · actualizado ' + relSync(), 'ok', 'cloud_done') : R.status === 'erro' ? st('Sem ligação' + (R.at ? ' · cópia das ' + horaSync() : ''), 'warn', 'cloud_off') : st('A ligar à base de dados…', '', 'cloud_done'));
  const updLive = () => document.querySelectorAll('[data-live]').forEach((el) => { el.innerHTML = liveChip(); });
  const relLive = (iso) => {
    const t = new Date(iso), s = (Date.now() - t) / 1000, h = pad(t.getHours()) + ':' + pad(t.getMinutes());
    if (s < 60) return 'agora mesmo';
    if (s < 3600) return 'há ' + Math.floor(s / 60) + ' min';
    if (t.toDateString() === new Date().toDateString()) return 'hoje, ' + h;
    if (t.toDateString() === new Date(Date.now() - 864e5).toDateString()) return 'ontem, ' + h;
    return t.getDate() + ' ' + MESES[t.getMonth()] + ', ' + h;
  };

  // Histórico de Outubro (dados de demonstração) somado às notas que chegam por QR, depois de o cliente as confirmar no e-mail.
  function colaboradores() {
    const map = new Map();
    S.colaboradores.forEach((c) => map.set(c.codigo, Object.assign({}, c, { live: { n: 0, s: [0, 0, 0, 0] } })));
    R.colabs.forEach((c) => { if (!map.has(c.codigo)) map.set(c.codigo, { codigo: c.codigo, nome: c.nome, funcao: c.funcao, loja: c.loja, equipa: c.equipa, aval: { n: 0, s: [0, 0, 0, 0] }, live: { n: 0, s: [0, 0, 0, 0] } }); });
    R.aval.forEach((a) => { const c = map.get(a.codigo); if (!c || a.estado !== 'confirmada') return; c.live.n++; c.live.s[0] += a.estrelas; c.live.s[1] += a.c1; c.live.s[2] += a.c2; c.live.s[3] += a.c3; });
    return Array.from(map.values()).map((c) => {
      const n = c.aval.n + c.live.n, s2 = c.aval.s.map((x, i) => x + c.live.s[i]);
      return Object.assign(c, { n, s: s2, media: n ? s2[0] / n : 0, crit: s2.slice(1).map((x) => (n ? x / n : 0)) });
    });
  }
  const grupo = (list) => { const n = sum(list, (c) => c.n), s2 = [0, 1, 2, 3].map((i) => sum(list, (c) => c.s[i])); return { n, media: n ? s2[0] / n : 0, crit: s2.slice(1).map((x) => (n ? x / n : 0)) }; };
  const nota = (m, n) => (n ? '<span class="rate-v"><strong>' + fDec(m, 1) + '</strong>' + ic('star', 'f star-i') + '</span>' : '<span class="muted">Sem notas</span>');
  const quem = (c) => FUNCAO_N[c.funcao] + (c.equipa ? ', equipa ' + c.equipa : '') + ' · ' + lojaN(c.loja);
  const avaliarUrl = (codigo) => new URL('avaliar.html?c=' + encodeURIComponent(codigo), location.href).href;
  function qrSvg(text) { try { const q = window.qrcode(0, 'M'); q.addData(text); q.make(); return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (e) { return ''; } }
  function qrCard(c) {
    return '<div class="qr-card"><div class="qr-top"><img src="assets/logo.png" alt="" width="20" height="32"><span>' + (c.funcao === 'montagem' ? 'Avalie a entrega e a montagem' : 'Avalie o meu atendimento') + '</span></div><div class="qr-name">' + esc(c.nome || 'Nome do colaborador') + '</div><div class="qr-role">' + quem(c) + '</div><div class="qr-code" role="img" aria-label="QR code para avaliar ' + esc(c.nome) + '">' + qrSvg(avaliarUrl(c.codigo)) + '</div><div class="qr-id">' + c.codigo + '</div><div class="qr-hint">Aponte a câmara do telemóvel. Demora um minuto; a avaliação é confirmada pelo seu e-mail.</div></div>';
  }
  function imprimir(list) {
    if (!list.length) { snack('Não há colaboradores nesta selecção.'); return; }
    document.getElementById('print-area').innerHTML = list.map(qrCard).join('');
    setTimeout(() => window.print(), 50);
  }
  const nextCode = (funcao) => { const p = funcao === 'montagem' ? 'HC-M' : 'HC-V'; const max = Math.max(0, ...colaboradores().filter((c) => c.codigo.startsWith(p)).map((c) => Number(c.codigo.slice(4)))); return p + String(max + 1).padStart(3, '0'); };

  function rankList(list, key, sub) {
    const ranked = list.filter((c) => c.n >= MIN_RANK).sort((a, b) => b.media - a.media || b.n - a.n);
    const few = list.length - ranked.length;
    const show = ui.rkAll[key] ? ranked : ranked.slice(0, 5);
    const rows = show.map((c, i) => '<li class="rk' + (i < 3 ? ' lead' : '') + '"><span class="rk-n">' + (i + 1) + '</span><span class="av ' + tone(c.nome) + '" aria-hidden="true">' + esc(initials(c.nome)) + '</span><span class="rk-b"><a class="rk-t" href="#rankings/colaboradores?k=' + c.codigo + '">' + esc(c.nome) + '</a><span class="rk-s">' + sub(c) + '</span></span><span class="rk-v">' + nota(c.media, c.n) + '<small>' + c.n + ' avaliações</small></span></li>').join('');
    return (ranked.length ? '<ol class="rk-list">' + rows + '</ol>' : empty('leaderboard', 'Ainda sem ranking', 'São precisas pelo menos ' + MIN_RANK + ' avaliações por pessoa.')) +
      '<div class="foot-row rk-foot">' + (ranked.length > 5 ? '<button type="button" class="b b-x b-s" data-act="rk-all" data-arg="' + key + '" aria-expanded="' + !!ui.rkAll[key] + '">' + ic(ui.rkAll[key] ? 'expand_less' : 'expand_more') + (ui.rkAll[key] ? 'Ver só os 5 melhores' : 'Ver os ' + ranked.length) + '</button>' : '<span></span>') + '<span class="small muted">' + (few ? few + (few === 1 ? ' pessoa' : ' pessoas') + ' com menos de ' + MIN_RANK + ' avaliações fora do ranking' : 'Mínimo de ' + MIN_RANK + ' avaliações para entrar') + '</span></div>';
  }
  const confirmada = (a) => a.estado === 'confirmada';
  function feedItem(a, c, fresh) {
    const ok = confirmada(a);
    const quemAvaliou = a.cliente_nome ? '<div class="fi-w">' + (a.cliente_id ? '<a href="' + cliUrl(a.cliente_id) + '">' + esc(a.cliente_nome) + '</a>' : esc(a.cliente_nome)) + ' · ' + esc(a.cliente_email || '') + (a.com_compra ? ' · cliente com compras' : ' · sem compras registadas') + '</div>' : '';
    return '<div class="fi' + (fresh ? ' new' : '') + (ok ? '' : ' pend') + '"><span class="av ' + tone(c.nome) + '" aria-hidden="true">' + esc(initials(c.nome)) + '</span><div style="min-width:0"><div class="fi-h"><a class="rk-t" href="#rankings/colaboradores?k=' + c.codigo + '">' + esc(c.nome) + '</a>' + stars(a.estrelas) + (ok ? st('E-mail confirmado', 'ok', 'verified') : st('Por confirmar', 'warn', 'schedule')) + (ok && a.estrelas <= 2 ? st('A acompanhar', 'bad') : '') + '</div><div class="rk-s">' + quem(c) + ' · ' + relLive(a.criado_em) + '</div><div class="fi-c">' + CRIT[c.funcao].map((t, i) => t + ' ' + a['c' + (i + 1)]).join(' · ') + '</div>' + (a.comentario ? '<div class="fi-q">«' + esc(a.comentario) + '»</div>' : '') + quemAvaliou + '</div></div>';
  }
  function feed(list, max) {
    const cmap = new Map(colaboradores().map((c) => [c.codigo, c]));
    const first = ui.seen === null;
    if (first) ui.seen = new Set();
    const html = list.slice(0, max).map((a) => { const c = cmap.get(a.codigo); return c ? feedItem(a, c, !first && !ui.seen.has(a.id)) : ''; }).join('');
    R.aval.forEach((a) => ui.seen.add(a.id));
    return html;
  }
  const avalDaSel = (k) => { const cmap = new Map(colaboradores().map((c) => [c.codigo, c])); return R.aval.filter((a) => cmap.has(a.codigo) && (k === 'todas' || cmap.get(a.codigo).loja === k)); };

  function vRankings(tab) {
    if (tab === 'colaboradores') return vColaboradores();
    if (tab === 'avaliacoes') return vAvalRecebidas();
    if (tab === 'novo') return vNovoColab();
    const k = ui.loja, all = colaboradores(), sel = all.filter((c) => k === 'todas' || c.loja === k);
    const vend = sel.filter((c) => c.funcao === 'vendedor'), mont = sel.filter((c) => c.funcao === 'montagem');
    const gv = grupo(vend), gm = grupo(mont), ga = grupo(sel);
    const live = avalDaSel(k), hoje = live.filter((a) => new Date(a.criado_em).toDateString() === new Date().toDateString());
    const band = '<div class="band strip">' +
      metric({ l: 'Avaliações dos clientes', v: val(ga.n, 'int', 'q-n'), s: ['Outubro, por QR code'] }) +
      metric({ l: 'Nota do atendimento', v: val(gv.media, 'r', 'q-v') + ic('star', 'f star-big'), s: [gv.n + ' avaliações de vendedores'] }) +
      metric({ l: 'Nota da entrega e montagem', v: (gm.n ? val(gm.media, 'r', 'q-m') + ic('star', 'f star-big') : '—'), s: [gm.n + ' avaliações de montadores'] }) +
      metric({ l: 'Recebidas por QR hoje', v: val(hoje.length, 'int', 'q-h'), s: [(hoje.filter((a) => !confirmada(a)).length ? hoje.filter((a) => !confirmada(a)).length + ' por confirmar no e-mail' : 'todas confirmadas no e-mail'), '<span data-live>' + liveChip() + '</span>'] }) + '</div>';
    const lojas = LOJAS().map((s2) => { const L = all.filter((c) => c.loja === s2); return { s: s2, g: grupo(L), v: grupo(L.filter((c) => c.funcao === 'vendedor')), m: grupo(L.filter((c) => c.funcao === 'montagem')) }; }).sort((a, b) => b.g.media - a.g.media);
    const cLojas = card('Melhores lojas', 'nota média dos clientes, todas as funções', '<ol class="rk-list">' + lojas.map((x, i) => '<li class="rk rk-loja' + (i === 0 ? ' lead' : '') + (k !== 'todas' && k !== x.s ? ' dim' : '') + '"><span class="rk-n">' + (i + 1) + '</span><span class="rk-b"><span class="rk-t">' + lojaN(x.s) + '</span><span class="rk-s">Atendimento ' + fDec(x.v.media, 1) + (x.m.n ? ' · Entrega e montagem ' + fDec(x.m.media, 1) : '') + '</span>' + bar(x.g.media / 5, { size: 'thin', k: 'rl-' + x.s, label: fDec(x.g.media, 1) + ' de 5' }) + '</span><span class="rk-v">' + nota(x.g.media, x.g.n) + '<small>' + x.g.n + ' avaliações</small></span></li>').join('') + '</ol><p class="card-note">As equipas de entrega e montagem contam para a loja onde estão sediadas.</p>', 'flex', 'c-rl');
    const cLive = card('Ao vivo', '<a href="#rankings/avaliacoes">Ver todas</a>', live.length ? '<div class="feed">' + feed(live, 3) + '</div>' : empty('qr_code_2', 'Ainda sem avaliações por QR', 'Abra o QR de um colaborador em «Colaboradores e QR» e avalie pelo telemóvel: a nota aparece aqui em segundos.'), 'flex', 'c-live');
    const cVend = card('Melhores vendedores', 'atendimento e vendas', rankList(vend, 'v', (c) => lojaN(c.loja)), 'flex', 'c-rv');
    const cMont = card('Melhores montadores', 'entrega e montagem', rankList(mont, 'm', (c) => 'Equipa ' + c.equipa + ' · ' + lojaN(c.loja)), 'flex', 'c-rm');
    const critCol = (titulo, g, nomes, key) => { const pior = g.crit.indexOf(Math.min(...g.crit)); return '<div><h3 class="crit-h">' + titulo + '</h3>' + (g.n ? '<div class="hb">' + nomes.map((t, i) => '<div><div class="hb-h"><span>' + t + (i === pior ? ' ' + st('Ponto mais fraco', 'warn') : '') + '</span><span>' + fDec(g.crit[i], 1) + '</span></div>' + bar(g.crit[i] / 5, { size: 'thin', cls: i === pior ? '' : 'dark', k: 'cr-' + key + i }) + '</div>').join('') + '</div>' : '<p class="muted small">Sem avaliações nesta selecção.</p>') + '</div>'; };
    const cCrit = card('Onde a equipa perde pontos', 'média de cada pergunta, de 1 a 5', '<div class="crit-cols">' + critCol('Atendimento e vendas', gv, CRIT.vendedor, 'v') + critCol('Entrega e montagem', gm, CRIT.montagem, 'm') + '</div>', '', 'c-crit');
    return head('Avaliações e rankings', 'Notas dos clientes por QR code, colaborador a colaborador. Só contam as que o cliente confirmou no e-mail' + (k === 'todas' ? '.' : ' · ' + lojaN(k)), '<a class="b b-o" href="#rankings/colaboradores">' + ic('qr_code_2') + 'Ver QR codes</a><a class="b b-f" href="#rankings/novo">' + ic('person_add') + 'Registar colaborador</a>') + tabs('rankings') +
      '<div class="stack">' + band + '<div class="g g-75">' + cLojas + cLive + '</div><div class="g g-11">' + cVend + cMont + '</div>' + cCrit + '</div>';
  }
  function vColaboradores() {
    const k = ui.loja, f = ui.flt.func;
    const base = colaboradores().filter((c) => k === 'todas' || c.loja === k);
    const list = base.filter((c) => f === 'todos' || c.funcao === f).sort((a, b) => b.funcao.localeCompare(a.funcao) || a.codigo.localeCompare(b.codigo));
    const cur2 = list.find((c) => c.codigo === ui.sel.colab) || base.find((c) => c.codigo === ui.sel.colab) || list[0];
    if (cur2) ui.sel.colab = cur2.codigo;
    const chips = '<div class="chips" role="group" aria-label="Função">' + [['todos', 'Todos'], ['vendedor', 'Atendimento e vendas'], ['montagem', 'Entrega e montagem']].map(([v, l]) => chip('func', v, l + ' <span class="cn">' + base.filter((c) => v === 'todos' || c.funcao === v).length + '</span>', f === v)).join('') + '</div>';
    const rows = list.map((c) => '<tr class="click' + (cur2 && cur2.codigo === c.codigo ? ' on' : '') + '" data-act="colab" data-arg="' + c.codigo + '"><td class="h nw" data-l="Código"><button type="button" class="idbtn" data-act="colab" data-arg="' + c.codigo + '" data-scroll="1" data-fk="colab:' + c.codigo + '" aria-label="Ver o QR de ' + esc(c.nome) + '">' + c.codigo + '</button></td><td class="clip" data-l="Colaborador">' + esc(c.nome) + '<span class="sub">' + FUNCAO_N[c.funcao] + (c.equipa ? ', equipa ' + c.equipa : '') + '</span></td><td data-l="Loja" class="nw">' + lojaN(c.loja) + '</td><td class="r nw" data-l="Nota">' + nota(c.media, c.n) + '<span class="sub">' + c.n + ' aval.</span></td></tr>').join('');
    const tabela = card('Colaboradores', chips, list.length ? '<div class="tw"><table class="t cards"><thead><tr><th scope="col">Código</th><th scope="col">Colaborador</th><th scope="col">Loja</th><th scope="col" class="r">Nota</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : empty('badge', 'Sem colaboradores nesta selecção', ''), '', 'c-colabs');
    let det = '';
    if (cur2) {
      const ult = R.aval.filter((a) => a.codigo === cur2.codigo).slice(0, 3);
      det = '<aside class="card detail" id="qr-detail" aria-labelledby="qr-h"><h2 class="sr" id="qr-h">QR code de ' + esc(cur2.nome) + '</h2>' + qrCard(cur2) +
        '<div class="acts" style="justify-content:center;margin:16px 0 20px"><button type="button" class="b b-f b-s" data-act="print-one" data-arg="' + cur2.codigo + '">' + ic('print') + 'Imprimir cartão</button><button type="button" class="b b-o b-s" data-act="copy-link" data-arg="' + cur2.codigo + '">' + ic('content_copy') + 'Copiar link</button><a class="b b-x b-s" href="' + avaliarUrl(cur2.codigo) + '" target="_blank" rel="noopener">' + ic('open_in_new') + 'Abrir a avaliação</a></div>' +
        '<dl class="dl"><dt>Nota geral<span class="sub">' + cur2.n + ' avaliações</span></dt><dd>' + nota(cur2.media, cur2.n) + '</dd>' + CRIT[cur2.funcao].map((t, i) => '<dt>' + t + '</dt><dd>' + (cur2.n ? fDec(cur2.crit[i], 1) : '—') + '</dd>').join('') + '</dl>' +
        (ult.length ? '<h3 class="crit-h" style="margin-top:20px">Últimas avaliações por QR</h3><div class="feed">' + ult.map((a) => feedItem(a, cur2, false)).join('') + '</div>' : '<p class="card-note">Ainda sem avaliações por QR' + (cur2.aval.n ? '. As ' + cur2.aval.n + ' avaliações de Outubro vêm do histórico.' : '.') + '</p>') + '</aside>';
    }
    return head('Colaboradores e QR', 'Cada colaborador tem um código e um QR próprio, para o cliente o avaliar no fim do atendimento ou da montagem.', '<button type="button" class="b b-o" data-act="print-all">' + ic('print') + 'Imprimir cartões</button><a class="b b-f" href="#rankings/novo">' + ic('person_add') + 'Registar colaborador</a>') + tabs('colaboradores') +
      '<div class="split">' + tabela + det + '</div>';
  }
  function vAvalRecebidas() {
    const k = ui.loja, f = ui.flt.af;
    const cmap = new Map(colaboradores().map((c) => [c.codigo, c]));
    const base = avalDaSel(k);
    const fil = { todas: () => true, vendedor: (a) => cmap.get(a.codigo).funcao === 'vendedor', montagem: (a) => cmap.get(a.codigo).funcao === 'montagem', baixa: (a) => a.estrelas <= 2, pendente: (a) => !confirmada(a), semcompra: (a) => confirmada(a) && !a.com_compra };
    const list = base.filter(fil[f] || fil.todas);
    const chips = '<div class="chips" role="group" aria-label="Filtrar avaliações">' + [['todas', 'Todas'], ['vendedor', 'Atendimento e vendas'], ['montagem', 'Entrega e montagem'], ['baixa', '1 ou 2 estrelas'], ['pendente', 'Por confirmar'], ['semcompra', 'Confirmadas sem compra']].map(([v, l]) => chip('af', v, l + ' <span class="cn">' + base.filter(fil[v]).length + '</span>', f === v)).join('') + '</div>';
    return head('Avaliações recebidas', 'O que os clientes escreveram depois de ler o QR code, da mais recente para a mais antiga. Cada avaliação leva o nome e o e-mail do cliente e só conta nos rankings depois de confirmada no e-mail.', '<span data-live>' + liveChip() + '</span><button type="button" class="b b-o b-s" data-act="sync">' + ic('sync') + 'Actualizar</button>') + tabs('avaliacoes') +
      '<div class="stack">' + chips + card(list.length + (list.length === 1 ? ' avaliação' : ' avaliações'), R.status === 'erro' ? 'sem ligação à base de dados' : 'recebidas por QR code', list.length ? '<div class="feed">' + feed(list, 200) + '</div>' : empty('qr_code_2', f === 'baixa' ? 'Nenhuma nota de 1 ou 2 estrelas' : f === 'pendente' ? 'Nenhuma avaliação por confirmar' : f === 'semcompra' ? 'Todas as confirmadas têm compra registada' : 'Ainda sem avaliações por QR', 'Abra o QR de um colaborador em «Colaboradores e QR» e avalie pelo telemóvel.'), '', 'c-arec') + '</div>';
  }
  function colabPreview(d) {
    const funcao = d.funcao || 'vendedor';
    return qrCard({ codigo: nextCode(funcao), nome: d.nome || '', funcao, loja: d.loja || 'angola', equipa: funcao === 'montagem' ? (d.equipa || '?') : null }) + '<p class="card-note" style="text-align:center">O código é atribuído ao guardar. O QR abre a página de avaliação deste colaborador.</p>';
  }
  function vNovoColab() {
    const F = 'colab', loja = ui.loja !== 'todas' ? ui.loja : '';
    const form = '<form class="form" data-form="colab" novalidate>' +
      fld(F, { name: 'nome', label: 'Nome do colaborador', req: true, cls: 'full', auto: 'name', hint: 'Como aparece no cartão e no ranking' }) +
      opts(F, 'funcao', [['vendedor', 'Atendimento e vendas'], ['montagem', 'Entrega e montagem']], 'vendedor', { legend: 'Função', req: true, cls: 'full' }) +
      fld(F, { name: 'loja', label: 'Loja', type: 'select', req: true, value: loja, options: lojaOpts(loja, true) }) +
      fld(F, { name: 'equipa', label: 'Equipa de entrega e montagem', type: 'select', value: '', options: [['', 'Não se aplica']].concat(EQUIPAS.map((e) => [e, 'Equipa ' + e])), hint: 'Obrigatório para entrega e montagem' }) +
      '<div class="form-act"><button type="submit" class="b b-f">' + ic('person_add') + '<span>Registar e criar QR</span></button></div></form>';
    return head('Registar colaborador', 'O colaborador fica com um código e um QR code para os clientes o avaliarem.', '') + tabs('novo') +
      '<div class="g g-form">' + card('Dados do colaborador', '', form, '', 'c-cform2') + card('Cartão com QR code', '', '<div id="colab-prev">' + colabPreview({ loja: loja || 'angola' }) + '</div>', '', 'c-cprev') + '</div>';
  }
  /* ---------- clientes: um por e-mail, com o histórico de compras, avaliações, NPS e mensagens ---------- */
  const CREF = (window.HC_SEED && window.HC_SEED().clienteRef) || {};
  const H = {};
  const EMAIL_RE = /^[^@\s<>"]+@[^@\s<>"]+\.[^@\s<>"]+$/;
  const TIPO_EV = { compra: ['Compra', 'shopping_cart'], avaliacao_qr: ['Avaliação por QR', 'qr_code_2'], nps: ['Inquérito NPS', 'sentiment_satisfied'], mensagem: ['Mensagem', 'forum'], avaliacao_publica: ['Avaliação pública', 'reviews'] };
  const fQuando = (iso) => { const t = new Date(iso); return t.getDate() + ' ' + MESES[t.getMonth()] + (t.getFullYear() !== NOW.getFullYear() ? ' ' + t.getFullYear() : '') + ', ' + pad(t.getHours()) + ':' + pad(t.getMinutes()); };
  const cliUrl = (id) => '#clientes/lista?cl=' + id;
  const cidDe = (ref) => CREF[ref] || null;
  function ligarCliente(o) {
    return rpc('hc_registar_evento', { p_email: o.email, p_nome: o.nome, p_tipo: o.tipo, p_referencia: o.ref || null, p_resumo: o.resumo, p_valor: o.valor == null || isNaN(o.valor) ? null : o.valor, p_loja: ['angola', 'baia', 'matola'].includes(o.loja) ? o.loja : null, p_dados: o.dados || {} })
      .then((cid) => { delete H[cid]; return syncRemote().then(() => cid); });
  }
  // O histórico vem da base quando se abre o cliente, e outra vez quando ele tem actividade nova.
  function historico(c) {
    const h = H[c.id];
    if (h && !h.busy && h.ultimo === c.ultimo_em) return h;
    if (!h || !h.busy) {
      H[c.id] = { busy: true, rows: h && h.rows };
      rpc('hc_cliente_historico', { p_cliente: c.id })
        .then((rows) => { H[c.id] = { rows, ultimo: c.ultimo_em }; }, () => { H[c.id] = { erro: true, rows: h && h.rows, ultimo: c.ultimo_em }; })
        .then(() => { if (cur.sec === 'clientes' && cur.tab === 'lista' && ui.sel.cli === c.id && !typing()) render(); });
    }
    return H[c.id];
  }
  function refLink(e) {
    const r = e.referencia || '', m = /^(MSG|REV)-(.+)$/.exec(r);
    if (e.tipo === 'compra' && S.pedidos.some((p) => p.id === r)) return ['#pedidos/lista?p=' + r, 'Ver pedido ' + r];
    if (m) { const c = S.conversas.find((x) => x.id === m[2]); if (c) return ['#mensagens/caixa?c=' + c.id + '&canal=' + c.canal + '&est=todas', m[1] === 'MSG' ? 'Abrir conversa' : 'Abrir avaliação']; }
    if (e.tipo === 'avaliacao_qr' && e.dados && e.dados.codigo) return ['#rankings/colaboradores?k=' + e.dados.codigo, 'Ver colaborador'];
    if (e.tipo === 'nps') return ['#satisfacao/painel', 'Ver satisfação'];
    return null;
  }
  function evento(e) {
    const [t, icon] = TIPO_EV[e.tipo] || ['Registo', 'info'], d = e.dados || {}, lk = refLink(e);
    const extra = e.tipo === 'compra' && e.valor != null ? '<span class="tl-v">' + fMT(e.valor) + '</span>'
      : e.tipo === 'avaliacao_qr' ? (d.estado === 'confirmada' ? st('E-mail confirmado', 'ok', 'verified') : st('Por confirmar', 'warn', 'schedule'))
      : e.tipo === 'nps' && d.nota != null ? st('Nota ' + d.nota, d.nota <= 6 ? 'bad' : d.nota <= 8 ? '' : 'ok') : '';
    const ref = lk ? '<a href="' + lk[0] + '">' + lk[1] + '</a>' : e.referencia && !/^(QR|NPS)-/.test(e.referencia) ? esc(e.referencia) : '';
    return '<li class="tl-i"><span class="tl-ic">' + ic(icon) + '</span><div class="tl-b"><div class="tl-h"><strong>' + t + '</strong>' + extra + '</div><div class="tl-t">' + esc(e.resumo) + (d.comentario ? '<span class="tl-q">«' + esc(d.comentario) + '»</span>' : '') + '</div><div class="tl-m">' + fQuando(e.criado_em) + (e.loja ? ' · ' + lojaN(e.loja) : '') + (ref ? ' · ' + ref : '') + '</div></div></li>';
  }
  function vClientes(tab) {
    if (tab === 'registar') return vRegistarEvento();
    const f = ui.flt.cf, L = R.clientes || [];
    const fil = { todos: () => true, compras: (c) => c.compras > 0, avaliaram: (c) => c.avaliacoes > 0, semcompra: (c) => c.avaliacoes > 0 && !c.compras };
    const list = L.filter(fil[f] || fil.todos);
    const sel = list.find((c) => c.id === ui.sel.cli) || L.find((c) => c.id === ui.sel.cli) || list[0];
    if (sel) ui.sel.cli = sel.id;
    const aval = sum(L, (c) => c.avaliacoes), conf = sum(L, (c) => c.avaliacoes_confirmadas), voltaram = L.filter((c) => c.compras >= 2).length;
    const band = '<div class="band strip">' +
      metric({ l: 'Clientes identificados', v: val(L.length, 'int', 'cl-n'), s: ['pelo e-mail, em todos os canais'] }) +
      metric({ l: 'Com compras registadas', v: val(L.filter(fil.compras).length, 'int', 'cl-c'), s: [voltaram + (voltaram === 1 ? ' voltou' : ' voltaram') + ' a comprar'] }) +
      metric({ l: 'Avaliações por QR confirmadas', v: aval ? val(conf / aval, 'pct', 'cl-a') : '—', s: [conf + ' de ' + aval + ' com o e-mail confirmado'] }) +
      metric({ l: 'Avaliaram sem compra registada', v: val(L.filter(fil.semcompra).length, 'int', 'cl-s'), s: ['para confirmar com a loja'] }) + '</div>';
    const chips = '<div class="chips" role="group" aria-label="Filtrar clientes">' + [['todos', 'Todos'], ['compras', 'Com compras'], ['avaliaram', 'Avaliaram por QR'], ['semcompra', 'Avaliação sem compra']].map(([v, l]) => chip('cf', v, l + ' <span class="cn">' + L.filter(fil[v]).length + '</span>', f === v)).join('') + '</div>';
    const rows = list.map((c) => '<tr class="click' + (sel && sel.id === c.id ? ' on' : '') + '" data-act="cli" data-arg="' + c.id + '"><td class="clip" data-l="Cliente"><button type="button" class="idbtn" data-act="cli" data-arg="' + c.id + '" data-scroll="1" data-fk="cli:' + c.id + '" aria-label="Ver o histórico de ' + esc(c.nome) + '">' + esc(c.nome) + '</button><span class="sub">' + esc(c.email) + '</span></td><td class="r nw" data-l="Compras">' + (c.compras ? fMT(c.total_compras) + '<span class="sub">' + c.compras + (c.compras === 1 ? ' compra' : ' compras') + '</span>' : '<span class="muted">Sem compras</span>') + '</td><td class="nw" data-l="Avaliações por QR">' + (c.avaliacoes ? c.avaliacoes_confirmadas + ' de ' + c.avaliacoes + '<span class="sub">confirmadas</span>' : '<span class="muted">—</span>') + '</td><td class="nw" data-l="Última actividade">' + (c.ultimo_em ? relLive(c.ultimo_em) : '—') + '</td></tr>').join('');
    const tabela = card(list.length + (list.length === 1 ? ' cliente' : ' clientes'), chips, list.length
      ? '<div class="tw"><table class="t cards"><thead><tr><th scope="col">Cliente</th><th scope="col" class="r">Compras</th><th scope="col">Avaliações por QR</th><th scope="col">Última actividade</th></tr></thead><tbody>' + rows + '</tbody></table></div><p class="card-note">Nomes e e-mails aparecem abreviados: sem login, a base de dados não os mostra completos.' + (ui.loja === 'todas' ? '' : ' A lista inclui clientes de todas as lojas.') + '</p>'
      : L.length ? empty('group', 'Nenhum cliente neste filtro', '') : R.status === 'erro' ? empty('cloud_off', 'Sem ligação à base de dados', 'A lista de clientes aparece quando a ligação voltar.') : empty('group', 'A carregar os clientes…', ''), '', 'c-clis');
    let det = '';
    if (sel) {
      const h = historico(sel);
      const tl = h.rows ? (h.rows.length ? '<ol class="tl" aria-label="Histórico do cliente">' + h.rows.map(evento).join('') + '</ol>' : '<p class="muted small">Ainda sem registos.</p>') + (h.erro ? '<p class="card-note">' + ic('cloud_off') + ' Sem ligação: pode faltar actividade recente.</p>' : '')
        : h.erro ? empty('cloud_off', 'Sem ligação à base de dados', 'O histórico aparece quando a ligação voltar.') : '<p class="muted small" aria-busy="true">A carregar o histórico…</p>';
      det = '<aside class="card detail" id="cli-detail" aria-labelledby="cli-h"><div class="cli-top"><span class="av ' + tone(sel.nome) + '" aria-hidden="true">' + esc(initials(sel.nome)) + '</span><div><h2 id="cli-h">' + esc(sel.nome) + '</h2><p>' + esc(sel.email) + '</p></div></div>' +
        '<div class="chips cli-tags">' + (sel.compras ? st(sel.compras >= 2 ? 'Cliente recorrente' : 'Cliente com compras', 'ok', 'shopping_cart') : st('Sem compras registadas', '', 'shopping_cart')) + (sel.avaliacoes_confirmadas ? st('E-mail confirmado', 'ok', 'verified') : sel.avaliacoes ? st('Avaliação por confirmar', 'warn', 'schedule') : '') + '</div>' +
        '<dl class="dl"><dt>Cliente desde</dt><dd>' + fQuando(sel.criado_em).split(',')[0] + '</dd><dt>Compras</dt><dd>' + (sel.compras ? sel.compras + ' · ' + fMT(sel.total_compras) : '—') + '</dd><dt>Avaliações por QR</dt><dd>' + (sel.avaliacoes ? sel.avaliacoes_confirmadas + ' de ' + sel.avaliacoes + ' confirmadas' : '—') + '</dd><dt>Respostas NPS</dt><dd>' + (sel.nps || '—') + '</dd><dt>Mensagens</dt><dd>' + (sel.mensagens || '—') + '</dd><dt>Avaliações públicas</dt><dd>' + (sel.publicas || '—') + '</dd></dl>' +
        '<h3 class="crit-h" style="margin-top:20px">Histórico</h3>' + tl + '</aside>';
    }
    return head('Clientes', 'Cada cliente é reconhecido pelo e-mail: compras, avaliações por QR, inquéritos e mensagens juntam-se no mesmo histórico.', '<span data-live>' + liveChip() + '</span><a class="b b-f" href="#clientes/registar">' + ic('add_shopping_cart') + 'Registar compra ou contacto</a>') + tabs('lista') +
      '<div class="stack">' + band + '<div class="split">' + tabela + det + '</div></div>';
  }
  function vRegistarEvento() {
    const F = 'evento', loja = ui.loja !== 'todas' ? ui.loja : '';
    const form = '<form class="form" data-form="evento" novalidate>' +
      '<div class="form-h">Cliente</div>' +
      fld(F, { name: 'email', label: 'E-mail do cliente', type: 'email', req: true, auto: 'email', hint: 'É o e-mail que junta tudo no mesmo histórico' }) +
      fld(F, { name: 'nome', label: 'Nome do cliente ou empresa', req: true, auto: 'name', hint: 'Se o e-mail já existir, fica o nome do primeiro registo' }) +
      '<div class="form-h">Registo</div>' +
      opts(F, 'tipo', [['compra', 'Compra'], ['mensagem', 'Mensagem ou contacto']], 'compra', { legend: 'O que aconteceu', req: true, cls: 'full' }) +
      fld(F, { name: 'loja', label: 'Loja', type: 'select', req: true, value: loja, options: lojaOpts(loja, true) }) +
      fld(F, { name: 'canal', label: 'Canal', type: 'select', value: 'loja', options: [['loja', 'Na loja'], ['whatsapp', 'WhatsApp'], ['site', 'Site'], ['redes', 'Instagram ou Facebook'], ['telefone', 'Telefone'], ['email', 'E-mail']] }) +
      fld(F, { name: 'resumo', label: 'O que comprou ou o que pediu', type: 'textarea', req: true, cls: 'full', rows: 2, max: 300, hint: 'Por exemplo, sofá de 3 lugares e mesa de centro' }) +
      fld(F, { name: 'valor', label: 'Valor da compra', type: 'num', suffix: 'MT', hint: 'Obrigatório para compras' }) +
      fld(F, { name: 'ref', label: 'Número do pedido ou da factura', hint: 'Opcional. Evita registar a mesma compra duas vezes' }) +
      '<div class="form-act"><button type="submit" class="b b-f">' + ic('check') + '<span>Juntar ao histórico</span></button><a class="b b-x" href="#clientes/lista">Cancelar</a></div></form>';
    const passos = [['O e-mail identifica o cliente', 'Maiúsculas e espaços não contam: é sempre o mesmo cliente'], ['O registo junta-se ao histórico', 'Se o e-mail é novo, o cliente é criado; se já existe, junta-se ao que já lá está'], ['Tudo lado a lado', 'Compras, avaliações por QR, inquéritos NPS e mensagens, por ordem de data']];
    const how = '<ol class="steps">' + passos.map(([t, x], i) => '<li class="' + (i === 0 ? 'now' : '') + '"><span class="sd"></span><span><strong>' + t + '</strong><small>' + x + '</small></span></li>').join('') + '</ol><div class="info-box">' + ic('info') + '<span>Os pedidos criados em «Novo pedido» e as respostas NPS com e-mail entram aqui sozinhos. As avaliações por QR também, assim que o cliente as envia.</span></div>';
    return head('Registar compra ou contacto', 'Junte ao histórico de um cliente uma compra feita na loja ou um contacto que não passou pela caixa de mensagens.', '') + tabs('registar') +
      '<div class="g g-form">' + card('Dados do registo', '', form, '', 'c-eform') + card('Como juntamos os dados', '', how, '', 'c-ehow') + '</div>';
  }
  function formError(form, msg) {
    const old = form.querySelector('.err-sum'); if (old) old.remove();
    const box = document.createElement('div');
    box.className = 'err-sum'; box.setAttribute('role', 'alert'); box.tabIndex = -1;
    box.innerHTML = '<h3>Não foi possível guardar</h3><p style="margin:0">' + esc(msg) + '</p>';
    form.prepend(box); box.focus();
  }

  /* ---------- estrutura comum ---------- */
  let cur = { sec: 'visao-geral', tab: 'painel' };
  const secDef = (id) => SECOES.find((s) => s.id === id) || SECOES[0];
  function head(title, sub, actions) {
    return '<div class="sh"><div><h1 tabindex="-1" id="page-h">' + title + '</h1>' + (sub ? '<p class="sub">' + sub + '</p>' : '') + '</div>' + (actions ? '<div class="sh-act">' + actions + '</div>' : '') + '</div>';
  }
  function tabs(active) {
    const s = secDef(cur.sec);
    const badge = (t) => {
      if (s.id === 'mensagens' && t === 'caixa') { const n = pendentes(ui.loja).length; return n ? '<span class="tab-n">' + n + '</span>' : ''; }
      if (s.id === 'satisfacao' && t === 'avaliacoes') { const n = S.conversas.filter((c) => c.tipo === 'avaliacao' && c.estado === 'pendente' && inLoja(c, ui.loja)).length; return n ? '<span class="tab-n">' + n + '</span>' : ''; }
      return '';
    };
    return '<nav class="tabs" role="tablist" aria-label="' + s.label + '">' + s.tabs.map(([t, l, entry]) => '<a class="tab" role="tab" href="#' + s.id + '/' + t + '" aria-selected="' + (t === active) + '" data-fk="tab:' + t + '">' + (entry ? ic('edit_note') : '') + l + badge(t) + '</a>').join('') + '</nav>';
  }
  const VIEWS = { 'visao-geral': vGeral, mensagens: vMensagens, pedidos: vPedidos, lojas: vLojas, rankings: vRankings, clientes: vClientes, satisfacao: vSatisfacao, campanhas: vCampanhas, financeiro: vFinanceiro };

  function navHTML() {
    const pend = pendentes('todas').length;
    return SECOES.map((s) => '<a class="ni" href="#' + s.id + '" data-fk="nav:' + s.id + '"' + (cur.sec === s.id ? ' aria-current="page"' : '') + '>' + ic(s.icon) + '<span class="lb"><span class="lb-long">' + s.label + '</span><span class="lb-short">' + (s.short || s.label) + '</span></span>' + (s.id === 'mensagens' && pend ? '<span class="nb">' + pend + '<span class="sr"> por responder</span></span>' : '') + '</a>').join('');
  }
  function bottomHTML() {
    const pend = pendentes('todas').length;
    const main = SECOES.slice(0, 4).map((s) => '<a href="#' + s.id + '"' + (cur.sec === s.id ? ' aria-current="page"' : '') + '>' + ic(s.icon) + (s.short || s.label) + (s.id === 'mensagens' && pend ? '<span class="nb">' + pend + '</span>' : '') + '</a>').join('');
    const mais = SECOES.slice(4).some((s) => s.id === cur.sec);
    return main + '<button type="button" data-act="sheet"' + (mais ? ' aria-current="page"' : '') + ' aria-haspopup="dialog">' + ic('more_horiz') + 'Mais</button>';
  }
  function lojaSelectors() {
    const ops = [['todas', 'Todas as lojas']].concat(LOJAS().map((s) => [s, lojaN(s)]));
    document.getElementById('seg').innerHTML = ops.map(([v, l]) => '<button type="button" data-act="loja" data-arg="' + v + '" aria-pressed="' + (ui.loja === v) + '" data-fk="loja:' + v + '">' + ic('check') + (v === 'todas' ? 'Todas' : l) + '</button>').join('');
    document.getElementById('seg-sel').innerHTML = '<label class="tf sel"><span class="l">Loja</span><select data-change="loja-sel" aria-label="Loja">' + ops.map(([v, l]) => '<option value="' + v + '"' + (ui.loja === v ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></label>';
    document.getElementById('lojas-m').innerHTML = '<div class="chips" role="group" aria-label="Loja">' + ops.map(([v, l]) => chip('loja', v, v === 'todas' ? 'Todas' : l, ui.loja === v)).join('') + '</div>';
  }

  /* ---------- render ---------- */
  let lastNums = { n: {}, b: {} };
  function snapNums() {
    document.querySelectorAll('#main [data-k]').forEach((el) => { lastNums.n[el.dataset.k] = +el.dataset.v; });
    document.querySelectorAll('#main [data-bk]').forEach((el) => { lastNums.b[el.dataset.bk] = el.style.getPropertyValue('--p'); });
  }
  function animateNums() {
    const prev = { n: Object.assign({}, lastNums.n), b: Object.assign({}, lastNums.b) };
    snapNums();
    if (!ui.anim) return;
    ui.anim = false;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('#main [data-k]').forEach((el) => {
      const from = prev.n[el.dataset.k], to = +el.dataset.v, fmt = FMT[el.dataset.f];
      if (from == null || from === to || !fmt) return;
      const t0 = performance.now(), D = 900;
      el.textContent = fmt(from);
      const step = (t) => { const x = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - x, 4); el.textContent = fmt(from + (to - from) * e); if (x < 1) requestAnimationFrame(step); else el.textContent = fmt(to); };
      requestAnimationFrame(step);
    });
    document.querySelectorAll('#main [data-bk]').forEach((el) => {
      const from = prev.b[el.dataset.bk], to = el.style.getPropertyValue('--p');
      if (from == null || from === to) return;
      el.style.transition = 'none'; el.style.setProperty('--p', from); void el.offsetWidth;
      el.style.transition = ''; requestAnimationFrame(() => el.style.setProperty('--p', to));
    });
  }

  function render() {
    const h = location.hash.slice(1) || 'visao-geral';
    const [path] = h.split('?');
    const [sec, tab] = path.split('/');
    const s = secDef(sec);
    const t = s.tabs.some((x) => x[0] === tab) ? tab : s.tabs[0][0];
    const changedSec = cur.sec !== s.id;
    const changedPath = ui.path !== s.id + '/' + t;
    cur = { sec: s.id, tab: t };
    ui.path = s.id + '/' + t;
    const fk = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.fk : null;
    document.getElementById('main').innerHTML = VIEWS[s.id](t) + '<div class="sig"><span>Dados ilustrativos para demonstração. O que registar fica neste navegador, excepto as avaliações por QR e o histórico de clientes, que ficam na base de dados.</span><span>Protótipo desenvolvido por Mídia Pro – Comunicação e Imagem</span></div>';
    document.getElementById('nav-list').innerHTML = navHTML();
    document.getElementById('bn').innerHTML = bottomHTML();
    document.getElementById('top-title').textContent = s.short || s.label;
    lojaSelectors();
    const pendA = alertas(ui.loja).length;
    document.getElementById('bell-dot').textContent = pendA || '';
    document.getElementById('bell-dot').hidden = !pendA;
    document.title = s.label + ' · Home Center';
    animateNums();
    if (changedPath) window.scrollTo(0, 0);
    if (changedSec && fk && fk.startsWith('nav:')) { const hh = document.getElementById('page-h'); if (hh) hh.focus({ preventScroll: true }); }
    else if (fk) { const el = document.querySelector('[data-fk="' + CSS.escape(fk) + '"]'); if (el && el !== document.activeElement) el.focus({ preventScroll: true }); }
    if (ui.scrollTo) {
      const el = document.querySelector(ui.scrollTo), sp = document.querySelector('.split');
      const stacked = !sp || getComputedStyle(sp).gridTemplateColumns.split(' ').length < 2;
      if (el && (!['#detail', '#qr-detail', '#cli-detail'].includes(ui.scrollTo) || stacked)) el.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      ui.scrollTo = null;
    }
    renderPop();
  }

  function onHash() {
    const h = location.hash.slice(1);
    const qs = h.split('?')[1];
    ui.q = {};
    if (qs) {
      const q = Object.fromEntries(new URLSearchParams(qs));
      ui.q = q;
      if (q.est) ui.flt.est = q.est;
      if (q.canal) ui.flt.canal = q.canal;
      if (q.c) { ui.sel.conv = q.c; ui.view = 'conv'; }
      if (q.etapa) ui.flt.etapa = q.etapa;
      if (q.p) { ui.sel.ped = q.p; ui.flt.etapa = 'todos'; ui.flt.pcanal = 'todos'; ui.scrollTo = '#detail'; if (q.reag) ui.open = 'reag'; }
      if (q.ab) ui.scrollTo = h.startsWith('pedidos/lista') ? '#abandonadas' : null;
      if (q.tipo) ui.flt.fin = q.tipo;
      if (q.k) { ui.sel.colab = q.k; ui.flt.func = 'todos'; ui.scrollTo = '#qr-detail'; }
      if (q.f) ui.flt.af = q.f;
      if (q.cl) { ui.sel.cli = q.cl; ui.flt.cf = 'todos'; ui.scrollTo = '#cli-detail'; }
    }
    if (!(qs && (q_has(qs, 'reag')))) ui.open = null;
    ui.pop = null; ui.sheet = false;
    renderSheet();
    render();
  }
  const q_has = (qs, k) => new URLSearchParams(qs).has(k);

  /* ---------- menus e folhas ---------- */
  function renderPop() {
    const host = document.getElementById('pops');
    if (!ui.pop) { host.innerHTML = ''; return; }
    const anchor = document.querySelector('[data-pop-anchor="' + ui.pop + '"]');
    if (!anchor) { host.innerHTML = ''; return; }
    const r = anchor.getBoundingClientRect();
    let html = '';
    if (ui.pop === 'bell') {
      const al = alertas(ui.loja);
      html = '<div class="pop-h">Precisa de atenção hoje · ' + lojaN(ui.loja) + '</div>' + (al.length ? al.map((a) => '<a class="mi" href="' + a.href + '"><span class="al-n" style="font-size:18px;line-height:24px">' + a.n + '</span><span>' + a.t + '<small>' + a.d + '</small></span><span class="ms s20" aria-hidden="true">chevron_right</span></a>').join('') : '<div class="pop-h">Sem pendentes.</div>');
    } else if (ui.pop === 'avatar') {
      html = '<div class="pop-h">Sessão de demonstração</div><div class="mi" style="cursor:default"><span class="ms" aria-hidden="true">account_circle</span><span>Direcção Geral<small>Acesso a todas as lojas</small></span><span></span></div><div class="pop-sep"></div><button type="button" class="mi" data-act="reset"><span class="ms" aria-hidden="true">restart_alt</span><span>Repor dados de demonstração<small>Apaga o que registou neste navegador</small></span><span></span></button>';
    }
    host.innerHTML = '<div class="pop fixed" role="menu" id="pop-el" style="top:' + (r.bottom + 8) + 'px;right:' + Math.max(8, window.innerWidth - r.right) + 'px">' + html + '</div>';
  }
  function renderSheet() {
    const host = document.getElementById('sheet-host');
    if (!ui.sheet) { host.innerHTML = ''; return; }
    host.innerHTML = '<div class="scrim" data-act="sheet-close"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Mais secções"><div class="sheet-handle"></div>' + SECOES.slice(4).map((s) => '<a class="mi" href="#' + s.id + '">' + ic(s.icon) + '<span>' + s.label + '</span><span></span></a>').join('') + '<div class="pop-sep"></div><button type="button" class="mi" data-act="reset">' + ic('restart_alt') + '<span>Repor dados de demonstração<small>Apaga o que registou neste navegador</small></span><span></span></button><p class="small muted" style="padding:8px 16px 0;margin:0">Protótipo desenvolvido por <strong>Mídia Pro</strong> – Comunicação e Imagem</p></div>';
    const first = host.querySelector('.mi'); if (first) first.focus();
  }

  /* ---------- snackbar ---------- */
  let snackT = null;
  function snack(msg, action) {
    const el = document.getElementById('snack');
    el.innerHTML = '<p>' + esc(msg) + '</p>' + (action ? '<button type="button" class="b b-x b-s" id="snack-a">' + esc(action.label) + '</button>' : '') + '<button type="button" class="ib" id="snack-x" aria-label="Fechar aviso" style="color:var(--on-inverse)">' + ic('close') + '</button>';
    el.classList.add('show');
    clearTimeout(snackT);
    snackT = setTimeout(() => el.classList.remove('show'), action ? 8000 : 4000);
    const a = document.getElementById('snack-a');
    if (a) a.onclick = () => { el.classList.remove('show'); action.run(); };
    document.getElementById('snack-x').onclick = () => el.classList.remove('show');
  }
  function commit(msg, fn, o) {
    o = o || {};
    const snap = JSON.stringify(S);
    fn(S);
    persist();
    ui.anim = true;
    ui.open = null;
    if (o.go && location.hash !== '#' + o.go) location.hash = o.go; else render();
    snack(msg, { label: 'Anular', run: () => { S = JSON.parse(snap); persist(); ui.anim = true; render(); snack('Alteração anulada.'); } });
  }

  /* ---------- validação ---------- */
  function fieldErr(form, name, msg) {
    const el = form.querySelector('[name="' + name + '"]') || form.querySelector('#' + CSS.escape(form.dataset.form + '-' + name));
    const fs = form.querySelector('fieldset[data-req="' + name + '"]') || (el && el.closest('fieldset.fs') && el.type === 'radio' ? el.closest('fieldset.fs') : null);
    const box = fs || (el && el.closest('.tf'));
    if (!box) return;
    const hintId = (fs ? fs.id : el.id) + '-h';
    const hint = form.querySelector('#' + CSS.escape(hintId)) || (fs && fs.querySelector('.hint'));
    if (msg) {
      box.classList.add('err');
      if (el && !fs) el.setAttribute('aria-invalid', 'true');
      if (hint) { hint.textContent = msg; hint.classList.add('err'); }
    } else {
      box.classList.remove('err');
      if (el && !fs) el.removeAttribute('aria-invalid');
      if (hint) { hint.textContent = hint.dataset.hint || ''; hint.classList.remove('err'); }
    }
  }
  function basicCheck(el) {
    if (el.type === 'radio' || el.type === 'checkbox') return '';
    const v = el.value.trim();
    if (el.required && !v) return 'Preencha este campo.';
    if (el.hasAttribute('data-num') && v && (isNaN(pn(v)) || pn(v) < 0)) return 'Escreva só números, por exemplo 45000.';
    if (el.type === 'email' && v && !EMAIL_RE.test(v)) return 'Escreva um e-mail válido, por exemplo nome@gmail.com.';
    if (el.type === 'date' && v) { if (el.min && v < el.min) return 'A data não pode ser antes de ' + fData(el.min) + '.'; if (el.max && v > el.max) return 'A data não pode ser depois de ' + fData(el.max) + '.'; }
    return '';
  }
  function validate(form, extra) {
    const errs = [];
    form.querySelectorAll('input[name], select[name], textarea[name]').forEach((el) => { const m = basicCheck(el); fieldErr(form, el.name, m); if (m) errs.push([el.name, m, el.id]); });
    form.querySelectorAll('fieldset[data-req]').forEach((fs) => { const n = fs.dataset.req; const ok = form.querySelector('[name="' + n + '"]:checked'); fieldErr(form, n, ok ? '' : 'Escolha uma opção.'); if (!ok) errs.push([n, 'Escolha uma opção.', fs.id]); });
    (extra || []).forEach(([n, m, id]) => { if (!errs.some((e) => e[0] === n)) { fieldErr(form, n, m); errs.push([n, m, id || form.dataset.form + '-' + n]); } });
    const old = form.querySelector('.err-sum'); if (old) old.remove();
    if (errs.length) {
      const box = document.createElement('div');
      box.className = 'err-sum'; box.setAttribute('role', 'alert'); box.tabIndex = -1;
      box.innerHTML = '<h3>' + (errs.length === 1 ? 'Falta corrigir 1 campo' : 'Falta corrigir ' + errs.length + ' campos') + '</h3><ul>' + errs.map((e) => '<li><button type="button" class="linkbtn" data-act="focusf" data-arg="' + esc(e[2]) + '">' + esc(e[1].replace(/\.$/, '')) + '</button></li>').join('') + '</ul>';
      form.prepend(box);
      if (form.classList.contains('form')) box.focus();
      else { const f = form.querySelector('#' + CSS.escape(errs[0][2])); if (f) f.focus(); }
      return false;
    }
    return true;
  }
  const fd = (form) => { const o = {}; new FormData(form).forEach((v, k) => { o[k] = typeof v === 'string' ? v.trim() : v; }); form.querySelectorAll('input[type=checkbox][name]').forEach((c) => { o[c.name] = c.checked; }); return o; };

  /* ---------- formulários ---------- */
  const FORMS = {
    fecho(form, d) {
      const v = pn(d.visitas), n = pn(d.vendas), m = pn(d.valor);
      const org = ORIG.map(([o]) => pn(d['o_' + o]) || 0), so = sum(org, (x) => x);
      const ex = [];
      if (!isNaN(n) && !isNaN(v) && n > v) ex.push(['vendas', 'O número de vendas não pode ser maior do que as visitas.']);
      if (!isNaN(n) && n > 0 && !isNaN(m) && m === 0) ex.push(['valor', 'Indique o valor vendido.']);
      if (!isNaN(n) && so !== n) ex.push(['o_espontanea', 'A origem soma ' + so + ' e há ' + n + ' vendas. Acerte os números ou use «Atribuir o restante».', 'fecho-o_espontanea']);
      if (!validate(form, ex)) return;
      const dup = S.fechos.find((f) => f.loja === d.loja && f.data === d.data);
      const rec = { id: dup ? dup.id : uid('f-'), data: d.data, loja: d.loja, visitas: v, vendas: n, valor: m, recebido: pn(d.recebido), origem: Object.fromEntries(ORIG.map(([o], i) => [o, org[i]])), obs: d.obs || '', registado: isoT(NOW) };
      commit('Fecho de ' + lojaN(d.loja) + ' de ' + fData(d.data) + (dup ? ' actualizado.' : ' guardado.'), (s) => { if (dup) s.fechos = s.fechos.map((f) => (f.id === dup.id ? rec : f)); else s.fechos.push(rec); }, { go: 'visao-geral/painel' });
    },
    resposta(form, d) {
      if (!validate(form)) return;
      const id = ui.sel.conv;
      const c0 = S.conversas.find((c) => c.id === id); if (!c0) return;
      delete ui.drafts[id];
      const onde = { whatsapp: 'Resposta enviada por WhatsApp.', instagram: 'Resposta enviada no Instagram.', facebook: 'Resposta enviada no Facebook.', site: 'Resposta enviada por e-mail.', google: 'Resposta publicada no Google.' }[c0.canal];
      commit(c0.tipo === 'avaliacao' && c0.canal === 'facebook' ? 'Resposta publicada no Facebook.' : onde, (s) => {
        const c = s.conversas.find((x) => x.id === id);
        c.msgs.push({ de: 'equipa', txt: d.txt, em: isoT(NOW) });
        if (c.estado === 'pendente') { c.estado = 'respondida'; c.respostaMin = Math.round(bizMin(c.recebida, NOW)); }
      });
    },
    visita(form, d) {
      if (!validate(form)) return;
      const id = ui.sel.conv;
      commit('Visita marcada e confirmação enviada.', (s) => {
        const c = s.conversas.find((x) => x.id === id);
        c.msgs.push({ de: 'equipa', txt: 'Combinado, ' + c.nome.split(' ')[0] + ': a sua visita à loja ' + lojaN(d.loja) + ' fica marcada para ' + fDataS(d.data) + ' às ' + d.hora.replace(':', 'h') + '. Vamos ter as peças preparadas para ver.', em: isoT(NOW) });
        if (c.estado === 'pendente') { c.estado = 'respondida'; c.respostaMin = Math.round(bizMin(c.recebida, NOW)); }
        if (!c.tags.includes('Visita marcada')) c.tags.push('Visita marcada');
      });
    },
    link(form, d) {
      if (!validate(form)) return;
      const c = S.conversas.find((x) => x.id === ui.sel.conv);
      ui.drafts[c.id] = 'Olá ' + c.nome.split(' ')[0] + ', segue o link para pagamento de ' + fMT(pn(d.valor)) + ' por ' + d.meio + ': [link de pagamento]. Assim que o pagamento entrar, confirmamos a data de entrega.';
      ui.open = null; render();
      const ta = document.querySelector('form[data-form="resposta"] textarea'); if (ta) ta.focus();
    },
    'qr-new'(form, d) {
      if (!validate(form)) return;
      commit('Resposta rápida adicionada.', (s) => { s.respostasRapidas.push({ id: uid('q'), titulo: d.titulo, texto: d.texto }); });
    },
    'qr-edit'(form, d) {
      if (!validate(form)) return;
      const id = form.dataset.id;
      commit('Resposta rápida actualizada.', (s) => { const q = s.respostasRapidas.find((x) => x.id === id); q.titulo = d.titulo; q.texto = d.texto; });
    },
    pedido(form, d) {
      const ex = [];
      if (d.entrega && !d.equipa) ex.push(['equipa', 'Escolha a equipa para a data de entrega.']);
      if (d.pagamento === 'Fatura a 30 dias' && d.tipo !== 'Empresa') ex.push(['pagamento', 'Fatura a 30 dias é só para clientes empresariais.']);
      if (!validate(form, ex)) return;
      const max = Math.max(...S.pedidos.map((p) => Number(p.id.slice(3))));
      const id = 'HC-' + (max + 1);
      const conv = form.dataset.conv, ab = form.dataset.ab;
      const pago = d.pago || d.pagamento === 'Fatura a 30 dias';
      ui.sel.ped = id; ui.flt.etapa = 'todos'; ui.flt.pcanal = 'todos';
      commit('Pedido ' + id + ' criado para ' + d.cliente + '.', (s) => {
        s.pedidos.push({ id, cliente: d.cliente, telefone: d.telefone, canal: d.canal, loja: d.loja, valor: pn(d.valor), pagamento: pago ? d.pagamento : 'Por pagar (' + d.pagamento + ')', passo: pago ? 2 : 1, entrega: d.entrega || null, equipa: d.equipa || '', itens: d.itens, criado: isoT(NOW), notas: [{ em: isoT(NOW), txt: 'Pedido criado' + (conv ? ' a partir da conversa' : ab ? ' a partir da compra abandonada no site' : '') + '.' }] });
        if (conv) { const c = s.conversas.find((x) => x.id === conv); if (c) { c.pedido = id; c.tags.push('Pedido ' + id); c.msgs.push({ de: 'sys', txt: 'Pedido ' + id + ' criado', em: isoT(NOW) }); } }
        if (ab) s.abandonadas = s.abandonadas.filter((a) => a.id !== ab);
      }, { go: 'pedidos/lista' });
      if (d.email) ligarCliente({ email: d.email, nome: d.cliente, tipo: 'compra', ref: id, resumo: d.itens, valor: pn(d.valor), loja: d.loja, dados: { pagamento: d.pagamento, canal: d.canal } })
        .then((cid) => { const p = S.pedidos.find((x) => x.id === id); if (p) { p.cid = cid; persist(); } if (cur.sec === 'pedidos' && !typing()) render(); })
        .catch(() => snack('Pedido ' + id + ' criado, mas sem ligação à base de clientes: não entrou no histórico do cliente.'));
    },
    reag(form, d) {
      if (!validate(form)) return;
      const id = ui.sel.ped;
      commit('Entrega de ' + id + ' marcada para ' + fDataS(d.data) + ', equipa ' + d.equipa + '.', (s) => {
        const p = s.pedidos.find((x) => x.id === id);
        const antes = p.entrega;
        p.entrega = d.data; p.equipa = d.equipa;
        if (p.passo === 4) p.remarcada = true;
        p.notas.push({ em: isoT(NOW), txt: (antes ? 'Reagendado de ' + fData(antes) + ' para ' : 'Agendado para ') + fData(d.data) + ', equipa ' + d.equipa + '.' });
      });
    },
    aval(form, d) {
      const ps = S.roteiro.passos.map((_, i) => d['p' + i]);
      const ex = ps.some((x) => x == null) ? [['p0', 'Responda aos 5 passos do roteiro.', 'aval-passos']] : [];
      if (!validate(form, ex)) return;
      const nota = Math.round(ps.filter((x) => x === '1').length / 5 * 100);
      ui.lojaLocal = d.loja;
      commit('Avaliação de ' + d.vendedor + ' guardada: ' + nota + '%.', (s) => {
        const v = s.vendedores[d.loja].find((x) => x.nome === d.vendedor);
        v.score = Math.round((v.score * v.aval + nota) / (v.aval + 1)); v.aval++;
        const R = s.roteiro.lojas[d.loja];
        R.p = R.p.map((p, i) => Math.round((p * R.n + (ps[i] === '1' ? 100 : 0)) / (R.n + 1))); R.n++;
        s.avaliacoes.push({ loja: d.loja, vendedor: d.vendedor, data: d.data, tipo: d.tipo, nota, obs: d.obs });
      }, { go: 'lojas/desempenho' });
    },
    briefing(form, d) {
      if (!validate(form)) return;
      commit('Briefing de hoje actualizado.', (s) => { s.briefing.titulo = d.titulo; s.briefing.texto = d.texto; });
    },
    sessao(form, d) {
      if (!validate(form)) return;
      const nome = form.dataset.nome;
      commit('Sessão de coaching com ' + nome + ' marcada para ' + fDataS(d.data) + '.', (s) => { s.coaching[nome] = { data: d.data, hora: d.hora, feito: false }; });
    },
    nps(form, d) {
      const ex = [];
      if (d.nota != null && Number(d.nota) <= 6 && !d.motivo) ex.push(['motivo', 'Escolha o motivo: a nota é de 0 a 6.']);
      if (!validate(form, ex)) return;
      const nota = Number(d.nota), cat = nota <= 6 ? 'd' : nota <= 8 ? 'neu' : 'p';
      commit('Resposta de ' + d.cliente + ' registada (nota ' + nota + ').', (s) => {
        s.nps.lojas[d.loja][cat]++;
        if (d.equipa !== 'loja') s.nps.equipas[d.equipa][cat]++;
        s.nps.respostas.push({ data: d.data, cliente: d.cliente, loja: d.loja, equipa: d.equipa, nota, motivo: d.motivo, comentario: d.comentario, pedido: d.pedido });
        if (d.motivo && nota <= 8) s.nps.motivos[d.motivo] = (s.nps.motivos[d.motivo] || 0) + 1;
        if (nota <= 6) s.detratores.push({ id: uid('d'), nome: d.cliente, nota, loja: d.loja, equipa: d.equipa, motivo: d.motivo, comentario: d.comentario || d.motivo, em: isoT(NOW), contacto: null });
      }, { go: 'satisfacao/painel' });
      if (d.email) ligarCliente({ email: d.email, nome: d.cliente, tipo: 'nps', ref: uid('NPS-'), resumo: 'Nota ' + nota + ' no inquérito pós-entrega' + (d.motivo ? ': ' + d.motivo.toLowerCase() : ''), loja: d.loja, dados: { nota, motivo: d.motivo || null, pedido: d.pedido || null, comentario: d.comentario || null } })
        .catch(() => snack('Resposta registada, mas sem ligação à base de clientes: não entrou no histórico do cliente.'));
    },
    contacto(form, d) {
      if (!validate(form)) return;
      const id = form.dataset.id;
      commit('Contacto registado.', (s) => { const x = s.detratores.find((y) => y.id === id); x.contacto = { em: isoT(NOW), resultado: d.resultado, nota: d.nota }; });
    },
    'aval-resp'(form, d) {
      if (!validate(form)) return;
      const id = form.dataset.id;
      const c0 = S.conversas.find((x) => x.id === id);
      delete ui.drafts[id];
      commit('Resposta publicada no ' + CANAL_N[c0.canal] + '.', (s) => {
        const c = s.conversas.find((x) => x.id === id);
        c.msgs.push({ de: 'equipa', txt: d.txt, em: isoT(NOW) }); c.estado = 'respondida'; c.respostaMin = Math.round(bizMin(c.recebida, NOW));
      });
    },
    camp(form, d) {
      const ex = [];
      if (d.fim && d.inicio && d.fim < d.inicio) ex.push(['fim', 'O fim não pode ser antes do início.']);
      if (!validate(form, ex)) return;
      commit('Campanha «' + d.nome + '» criada.', (s) => { s.campanhas.push({ id: uid('k'), nome: d.nome, tipo: d.tipo, plataforma: d.plataforma, medida: d.medida + (d.codigo ? ' (' + d.codigo + ')' : ''), investimento: pn(d.investimento), contactos: 0, conversas: 0, visitas: 0, vendas: 0, receita: 0, inicio: d.inicio, fim: d.fim }); }, { go: 'campanhas/resultados' });
    },
    res(form, d) {
      const n = (k) => pn(d[k]);
      const ex = [];
      if (n('conversas') > n('contactos')) ex.push(['conversas', 'Não pode haver mais conversas do que contactos.']);
      if (n('visitas') > n('conversas')) ex.push(['visitas', 'Não pode haver mais visitas do que conversas qualificadas.']);
      if (n('vendas') > n('visitas')) ex.push(['vendas', 'Não pode haver mais vendas do que visitas.']);
      if (n('vendas') > 0 && !(n('receita') > 0)) ex.push(['receita', 'Indique a receita das vendas.']);
      if (!validate(form, ex)) return;
      const c0 = S.campanhas.find((c) => c.id === d.campanha);
      commit('Resultados de «' + c0.nome + '» guardados.', (s) => {
        const c = s.campanhas.find((x) => x.id === d.campanha);
        ['contactos', 'conversas', 'visitas', 'vendas', 'receita'].forEach((k) => { c[k] += n(k); });
        s.resultados.push({ nome: c.nome, data: d.data, contactos: n('contactos'), vendas: n('vendas'), receita: n('receita') });
      }, { go: 'campanhas/resultados' });
    },
    verif(form, d) {
      if (!validate(form)) return;
      const l = form.dataset.loja;
      commit('Diferença de ' + lojaN(l) + ' marcada como verificada.', (s) => { s.verificados[l] = { nota: d.nota, em: isoT(NOW) }; });
    },
    receb(form, d) {
      if (!validate(form)) return;
      const id = form.dataset.id;
      const f0 = S.facturas.find((f) => f.id === id);
      commit('Recebimento de ' + fMT(f0.valor) + ' de ' + f0.empresa + ' registado.', (s) => { s.facturas.find((f) => f.id === id).paga = { data: d.data, meio: d.meio }; });
    },
    factura(form, d) {
      const ex = [];
      if (d.vencimento && d.emissao && d.vencimento < d.emissao) ex.push(['vencimento', 'O vencimento não pode ser antes da emissão.']);
      if (!validate(form, ex)) return;
      commit('Factura de ' + d.empresa + ' guardada.', (s) => { s.facturas.push({ id: uid('i'), empresa: d.empresa, ref: d.ref, valor: pn(d.valor), emissao: d.emissao, vencimento: d.vencimento, gestor: d.gestor, paga: null }); }, { go: 'financeiro/receber' });
    },
    colab(form, d) {
      const ex = [];
      if (d.funcao === 'montagem' && !d.equipa) ex.push(['equipa', 'Escolha a equipa de entrega e montagem.']);
      if (!validate(form, ex)) return;
      const btn = form.querySelector('button[type=submit]'), lbl = btn.querySelector('span:last-child');
      btn.disabled = true; lbl.textContent = 'A registar…';
      const tentar = (vez) => {
        const novo = { codigo: nextCode(d.funcao), nome: d.nome, funcao: d.funcao, loja: d.loja, equipa: d.funcao === 'montagem' ? d.equipa : null };
        return sb('hc_colaboradores', { method: 'POST', body: novo }).then(() => novo, (e) => {
          if (e.code === '23505' && vez === 0) return syncRemote().then(() => tentar(1));
          throw e;
        });
      };
      tentar(0).then((novo) => {
        S.colaboradores.push(Object.assign({}, novo, { aval: { n: 0, s: [0, 0, 0, 0] } })); persist();
        R.colabs.push(novo); saveRemote();
        ui.sel.colab = novo.codigo; ui.flt.func = 'todos';
        location.hash = 'rankings/colaboradores';
        snack(novo.nome + ' registado com o código ' + novo.codigo + '. O QR já está pronto a imprimir.');
      }).catch((e) => {
        btn.disabled = false; lbl.textContent = 'Registar e criar QR';
        formError(form, (e.status ? 'A base de dados recusou o registo: ' + e.message + '.' : 'Sem ligação à base de dados.') + ' Verifique a ligação e tente de novo.');
      });
    },
    evento(form, d) {
      const ex = [];
      if (d.tipo === 'compra' && !d.valor) ex.push(['valor', 'Indique o valor da compra.']);
      if (!validate(form, ex)) return;
      const btn = form.querySelector('[type=submit]'), lbl = btn.querySelector('span:last-child');
      btn.disabled = true; lbl.textContent = 'A guardar…';
      ligarCliente({ email: d.email, nome: d.nome, tipo: d.tipo, ref: d.ref, resumo: d.resumo, valor: d.tipo === 'compra' ? pn(d.valor) : null, loja: d.loja, dados: { canal: d.canal } })
        .then((cid) => { ui.sel.cli = cid; ui.flt.cf = 'todos'; location.hash = 'clientes/lista?cl=' + cid; snack((d.tipo === 'compra' ? 'Compra juntada' : 'Contacto juntado') + ' ao histórico de ' + d.nome + '.'); })
        .catch((e) => { btn.disabled = false; lbl.textContent = 'Juntar ao histórico'; formError(form, e.status ? e.message : 'Sem ligação à base de dados. Tente de novo daqui a pouco.'); });
    },
    desconto(form, d) {
      if (!validate(form)) return;
      commit('Desconto de ' + fMT(pn(d.valor)) + ' registado em ' + lojaN(d.loja) + '.', (s) => { s.descontos.push({ id: uid('x'), loja: d.loja, data: d.data, ref: d.ref, valor: pn(d.valor), motivo: d.motivo, autorizado: d.autorizado }); }, { go: 'financeiro/resumo' });
    }
  };

  /* ---------- acções ---------- */
  const ACT = {
    loja(arg) { ui.loja = arg; saveUi(); ui.open = null; render(); },
    'loja-local'(arg) { ui.lojaLocal = arg; render(); },
    canal(arg) { ui.flt.canal = arg; ui.open = null; ui.view = 'list'; render(); },
    est(arg) { ui.flt.est = arg; ui.open = null; ui.view = 'list'; render(); },
    conv(arg) { ui.sel.conv = arg; ui.view = 'conv'; ui.open = null; if (window.matchMedia('(max-width: 839px)').matches) ui.scrollTo = '.inbox'; render(); },
    'back-list'() { ui.view = 'list'; render(); },
    open(arg) { ui.open = ui.open === arg ? null : arg; render(); const f = document.querySelector('.inline input, .inline select, .inline textarea, .inline .mi'); if (f && ui.open) f.focus(); },
    'close-inline'() { ui.open = null; render(); },
    qr(arg) {
      const c = S.conversas.find((x) => x.id === ui.sel.conv), q = S.respostasRapidas.find((x) => x.id === arg);
      ui.drafts[c.id] = q.texto.replace(/\{nome\}/g, c.nome.split(' ')[0]); ui.open = null; render();
      const ta = document.querySelector('form[data-form="resposta"] textarea'); if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
    },
    'del-qr'(arg) { const q = S.respostasRapidas.find((x) => x.id === arg); commit('Resposta «' + q.titulo + '» apagada.', (s) => { s.respostasRapidas = s.respostasRapidas.filter((x) => x.id !== arg); }); },
    etapa(arg) { ui.flt.etapa = arg; render(); },
    'al-more'() { ui.alMore = !ui.alMore; render(); },
    func(arg) { ui.flt.func = arg; render(); },
    af(arg) { ui.flt.af = arg; render(); },
    colab(arg, el) { ui.sel.colab = arg; if (el && el.dataset.scroll) ui.scrollTo = '#qr-detail'; render(); },
    cli(arg, el) { ui.sel.cli = arg; if (el && el.dataset.scroll) ui.scrollTo = '#cli-detail'; render(); },
    cf(arg) { ui.flt.cf = arg; render(); },
    'rk-all'(arg) { ui.rkAll[arg] = !ui.rkAll[arg]; render(); },
    'print-one'(arg) { const c = colaboradores().find((x) => x.codigo === arg); if (c) imprimir([c]); },
    'print-all'() { const k = ui.loja, f = ui.flt.func; imprimir(colaboradores().filter((c) => (k === 'todas' || c.loja === k) && (f === 'todos' || c.funcao === f))); },
    'copy-link'(arg) {
      const url = avaliarUrl(arg);
      const ok = () => snack('Link de avaliação copiado: ' + url);
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(ok, () => window.prompt('Copie o link', url));
      else window.prompt('Copie o link', url);
    },
    sync() { syncRemote().then(() => render()); },
    pcanal(arg) { ui.flt.pcanal = arg; render(); },
    ped(arg, el) { ui.sel.ped = arg; ui.open = null; if (el && el.dataset.scroll) ui.scrollTo = '#detail'; render(); },
    avancar(arg) {
      const p0 = S.pedidos.find((p) => p.id === arg);
      if (p0.passo === 2 && !p0.entrega) { ui.open = 'reag'; render(); snack('Marque a data de entrega antes de passar o pedido para entrega.'); return; }
      commit(arg + ': ' + ETAPAS[p0.passo].toLowerCase() + '.', (s) => {
        const p = s.pedidos.find((x) => x.id === arg);
        if (p.passo === 1 && p.pagamento.startsWith('Por pagar')) p.pagamento = p.pagamento.replace(/^Por pagar \((.*)\)$/, '$1');
        if (p.passo === 3) { const e = s.entregas[p.loja]; e.total++; if (!atrasado(p)) e.prazo++; }
        p.notas.push({ em: isoT(NOW), txt: ETAPAS[p.passo] + '.' });
        p.passo++;
        if (p.passo === 4 && !p.remarcada) p.entrega = p.entrega && p.entrega >= HOJE ? p.entrega : HOJE;
      });
    },
    notificar(arg) {
      commit('Mensagem de acompanhamento enviada por WhatsApp.', (s) => {
        const p = s.pedidos.find((x) => x.id === arg);
        p.notas.push({ em: isoT(NOW), txt: 'Cliente notificado por WhatsApp' + (p.entrega ? ': ' + (p.passo === 4 ? 'montagem' : 'entrega') + ' em ' + fData(p.entrega) + '.' : '.') });
      });
    },
    lembrete(arg) { const a = S.abandonadas.find((x) => x.id === arg); commit('Lembrete enviado a ' + a.cliente + ' por WhatsApp.', (s) => { s.abandonadas.find((x) => x.id === arg).contacto = isoT(NOW); }); },
    'del-fecho'(arg) { const f = S.fechos.find((x) => x.id === arg); commit('Fecho de ' + lojaN(f.loja) + ' de ' + fData(f.data) + ' apagado.', (s) => { s.fechos = s.fechos.filter((x) => x.id !== arg); }); },
    'fill-origem'() {
      const form = document.querySelector('form[data-form="fecho"]');
      const n = pn(form.elements.vendas.value);
      if (isNaN(n)) { fieldErr(form, 'vendas', 'Indique primeiro o número de vendas.'); form.elements.vendas.focus(); return; }
      const outros = ORIG.slice(1).reduce((a, [o]) => a + (pn(form.elements['o_' + o].value) || 0), 0);
      form.elements.o_espontanea.value = Math.max(0, n - outros);
      updatePreview(form);
    },
    'sessao-feita'(arg) { commit('Sessão com ' + arg + ' marcada como realizada.', (s) => { s.coaching[arg].feito = true; }); },
    aest(arg) { ui.flt.aest = arg; render(); },
    ctipo(arg) { ui.flt.ctipo = arg; render(); },
    fin(arg) { ui.flt.fin = arg; render(); },
    focusf(arg) { const el = document.getElementById(arg); if (el) { el.focus(); el.scrollIntoView({ block: 'center' }); } },
    sheet() { ui.sheet = true; renderSheet(); },
    'sheet-close'() { ui.sheet = false; renderSheet(); },
    pop(arg) { ui.pop = ui.pop === arg ? null : arg; renderPop(); const f = document.querySelector('#pop-el .mi'); if (f && ui.pop) f.focus(); },
    reset() {
      ui.pop = null; ui.sheet = false; renderSheet();
      commit('Dados de demonstração repostos.', (s) => { const fresh = window.HC_SEED(); Object.keys(s).forEach((k) => delete s[k]); Object.assign(s, fresh); });
    },
    'search-open'() { document.querySelector('.top').classList.add('searching'); document.getElementById('q').focus(); },
    'csv-fin'() {
      const rows = [['Conciliação', 'Loja', 'Vendas registadas (MT)', 'Recebido (MT)', 'Diferença (MT)', 'Descontos (MT)']].concat(LOJAS().map((s) => { const x = agg(s); return ['', lojaN(s), x.valor, x.recebido, x.recebido - x.valor, x.descontos]; }))
        .concat([[], ['Contas a receber', 'Empresa', 'Referência', 'Valor (MT)', 'Vencimento', 'Estado']]).concat(S.facturas.map((f) => ['', f.empresa, f.ref, f.valor, f.vencimento, facturaEstado(f)[0]]));
      csv('home-center-financeiro-outubro-2026.csv', rows);
    },
    'csv-nps'() {
      const rows = [['Grupo', 'Nome', 'NPS', 'Promotores', 'Neutros', 'Detractores']].concat(LOJAS().map((s) => ['Loja', lojaN(s), npsVal(S.nps.lojas[s]), S.nps.lojas[s].p, S.nps.lojas[s].neu, S.nps.lojas[s].d])).concat(EQUIPAS.map((e) => ['Equipa', 'Equipa ' + e, npsVal(S.nps.equipas[e]), S.nps.equipas[e].p, S.nps.equipas[e].neu, S.nps.equipas[e].d]))
        .concat([[], ['Contactar em 24 horas', 'Cliente', 'Nota', 'Loja', 'Motivo', 'Contacto']]).concat(S.detratores.map((d) => ['', d.nome, d.nota, lojaN(d.loja), d.motivo, d.contacto ? d.contacto.resultado : 'Por contactar']));
      csv('home-center-satisfacao-outubro-2026.csv', rows);
    }
  };
  function csv(name, rows) {
    const txt = '﻿' + rows.map((r) => r.map((c) => { const s = String(c == null ? '' : c); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(';')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8' }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    snack('Ficheiro ' + name + ' descarregado.');
  }

  /* ---------- pré-visualizações ao escrever ---------- */
  function updatePreview(form) {
    const d = fd(form);
    if (form.dataset.form === 'fecho') {
      document.getElementById('fecho-prev').innerHTML = fechoPreview(d);
      const so = sum(ORIG, ([o]) => pn(d['o_' + o]) || 0), n = pn(d.vendas);
      const h = document.getElementById('fecho-origem-h');
      if (h && !h.classList.contains('err')) h.textContent = 'Soma: ' + so + (isNaN(n) ? '' : ' de ' + n) + ' vendas.';
      document.getElementById('fecho-dup').hidden = !S.fechos.some((f) => f.loja === d.loja && f.data === d.data);
    } else if (form.dataset.form === 'aval') {
      document.getElementById('aval-prev').innerHTML = avalPreview(d);
    } else if (form.dataset.form === 'nps') {
      document.getElementById('nps-prev').innerHTML = npsPreview(d);
    } else if (form.dataset.form === 'res') {
      document.getElementById('res-prev').innerHTML = resPreview(d);
    } else if (form.dataset.form === 'desconto') {
      document.getElementById('desc-prev').innerHTML = descPreview(d);
    } else if (form.dataset.form === 'colab') {
      document.getElementById('colab-prev').innerHTML = colabPreview(d);
    }
  }

  /* ---------- pesquisa ---------- */
  let res = [], resI = -1;
  function search(q) {
    const n = norm(q).trim();
    if (n.length < 2) return [];
    const out = [];
    S.pedidos.forEach((p) => { if (norm(p.id + ' ' + p.cliente).includes(n)) out.push({ ic: 'local_shipping', t: p.id + ' · ' + p.cliente, s: 'Pedido, ' + lojaN(p.loja) + ', ' + pedidoEstado(p)[0].toLowerCase(), h: '#pedidos/lista?p=' + p.id }); });
    S.conversas.forEach((c) => { if (norm(c.nome).includes(n)) out.push({ ic: c.tipo === 'avaliacao' ? 'reviews' : 'forum', t: c.nome, s: (c.tipo === 'avaliacao' ? 'Avaliação no ' : 'Conversa no ') + CANAL_N[c.canal] + (c.estado === 'pendente' ? ', por responder' : ''), h: '#mensagens/caixa?c=' + c.id + '&canal=' + c.canal + '&est=todas' }); });
    LOJAS().forEach((s) => S.vendedores[s].forEach((v) => { if (norm(v.nome).includes(n)) out.push({ ic: 'badge', t: v.nome, s: 'Vendedor, ' + lojaN(s) + ', nota ' + v.score + '% no roteiro', h: '#lojas/desempenho', loja: s }); }));
    colaboradores().forEach((c) => { if (norm(c.nome + ' ' + c.codigo).includes(n)) out.push({ ic: 'qr_code_2', t: c.nome + ' · ' + c.codigo, s: FUNCAO_N[c.funcao] + ', ' + lojaN(c.loja) + (c.n ? ', nota ' + fDec(c.media, 1) : ''), h: '#rankings/colaboradores?k=' + c.codigo }); });
    (R.clientes || []).forEach((c) => { if (norm(c.nome + ' ' + c.email).includes(n)) out.push({ ic: 'group', t: c.nome, s: 'Cliente, ' + c.email + (c.compras ? ', ' + c.compras + (c.compras === 1 ? ' compra' : ' compras') : ''), h: cliUrl(c.id) }); });
    S.facturas.forEach((f) => { if (norm(f.empresa).includes(n)) out.push({ ic: 'receipt_long', t: f.empresa + ' · ' + f.ref, s: 'Factura, ' + fMT(f.valor), h: '#financeiro/receber' }); });
    S.campanhas.forEach((c) => { if (norm(c.nome).includes(n)) out.push({ ic: 'campaign', t: c.nome, s: 'Campanha, ' + c.plataforma, h: '#campanhas/resultados' }); });
    return out.slice(0, 8);
  }
  function renderResults() {
    const box = document.getElementById('results'), inp = document.getElementById('q');
    if (!res.length) { box.innerHTML = inp.value.trim().length >= 2 ? '<div class="pop"><div class="pop-h">Sem resultados para «' + esc(inp.value.trim()) + '»</div></div>' : ''; inp.setAttribute('aria-expanded', inp.value.trim().length >= 2 ? 'true' : 'false'); return; }
    inp.setAttribute('aria-expanded', 'true');
    box.innerHTML = '<div class="pop" role="listbox" id="results-l" aria-label="Resultados">' + res.map((r, i) => '<a class="mi" role="option" id="res-' + i + '" href="' + r.h + '" data-res="' + i + '" aria-selected="' + (i === resI) + '">' + ic(r.ic) + '<span>' + esc(r.t) + '<small>' + esc(r.s) + '</small></span><span></span></a>').join('') + '</div>';
    inp.setAttribute('aria-activedescendant', resI >= 0 ? 'res-' + resI : '');
  }
  function closeSearch() { res = []; resI = -1; document.getElementById('results').innerHTML = ''; const q = document.getElementById('q'); q.setAttribute('aria-expanded', 'false'); document.querySelector('.top').classList.remove('searching'); }
  function pickResult(i) { const r = res[i]; if (!r) return; if (r.loja) { ui.lojaLocal = r.loja; if (ui.loja !== 'todas') { ui.loja = r.loja; saveUi(); } } document.getElementById('q').value = ''; closeSearch(); if (location.hash === r.h) onHash(); else location.hash = r.h.slice(1); }

  /* ---------- ligações de eventos ---------- */
  document.addEventListener('click', (e) => {
    const r = e.target.closest('[data-res]');
    if (r) { e.preventDefault(); pickResult(+r.dataset.res); return; }
    const a = e.target.closest('[data-act]');
    if (ui.pop && !e.target.closest('#pop-el') && !(a && a.dataset.act === 'pop')) { ui.pop = null; renderPop(); }
    if (!e.target.closest('.search') && !(a && a.dataset.act === 'search-open')) closeSearch();
    if (!a) return;
    if (a.tagName === 'A' && a.getAttribute('href') && a.getAttribute('href') !== '#') return;
    const fn = ACT[a.dataset.act];
    if (fn) { e.preventDefault(); fn(a.dataset.arg, a); }
  });
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('form[data-form]');
    if (!form) return;
    e.preventDefault();
    const fn = FORMS[form.dataset.form];
    if (fn) fn(form, fd(form));
  });
  document.addEventListener('reset', (e) => {
    const form = e.target.closest('form[data-form]');
    if (form) setTimeout(() => { form.querySelectorAll('.err').forEach((x) => x.classList.remove('err')); const s = form.querySelector('.err-sum'); if (s) s.remove(); form.querySelectorAll('.hint').forEach((h) => { h.textContent = h.dataset.hint || ''; h.classList.remove('err'); }); updatePreview(form); });
  });
  document.addEventListener('focusout', (e) => {
    const el = e.target, form = el.closest && el.closest('form[data-form]');
    if (!form || !el.name || el.type === 'radio') return;
    if (el.value.trim() || el.closest('.tf.err')) fieldErr(form, el.name, basicCheck(el));
  });
  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.id === 'q') { res = search(el.value); resI = -1; renderResults(); return; }
    const form = el.closest && el.closest('form[data-form]');
    if (!form) return;
    if (el.closest('.tf.err') && !basicCheck(el)) fieldErr(form, el.name, '');
    if (form.dataset.form === 'resposta') ui.drafts[ui.sel.conv] = el.value;
    if (form.dataset.form === 'aval-resp') ui.drafts[form.dataset.id] = el.value;
    updatePreview(form);
  });
  document.addEventListener('change', (e) => {
    const el = e.target;
    const form = el.closest && el.closest('form[data-form]');
    if (form && el.type === 'radio') { const fs = el.closest('fieldset'); if (fs && fs.classList.contains('err')) { const n = fs.dataset.req || el.name; fieldErr(form, n, ''); } updatePreview(form); }
    const k = el.dataset && el.dataset.change;
    if (!k) { if (form) updatePreview(form); return; }
    if (k === 'loja-sel') { ui.loja = el.value; saveUi(); render(); return; }
    if (k === 'responsavel') { const id = ui.sel.conv; const v = el.value; commit('Responsável: ' + (v || 'por atribuir') + '.', (s) => { s.conversas.find((c) => c.id === id).vendedor = v; }); return; }
    if (k === 'brief-feito') { const l = el.value, on = el.checked; commit(on ? 'Briefing confirmado em ' + lojaN(l) + '.' : 'Confirmação retirada.', (s) => { if (on) s.briefing.feito[l] = fHora(isoT(NOW)).replace(':', 'h'); else delete s.briefing.feito[l]; }); return; }
    if (k === 'aval-loja') { const sel = form.elements.vendedor; sel.innerHTML = '<option value="">Escolha o vendedor</option>' + S.vendedores[el.value].map((v) => '<option value="' + esc(v.nome) + '">' + esc(v.nome) + ' (nota actual ' + v.score + '%)</option>').join(''); updatePreview(form); return; }
    if (k === 'nps-pedido') { const p = S.pedidos.find((x) => x.id === el.value); if (p) { form.elements.loja.value = p.loja; form.elements.equipa.value = p.equipa || 'loja'; form.elements.cliente.value = p.cliente; ['loja', 'equipa', 'cliente'].forEach((n) => fieldErr(form, n, '')); } updatePreview(form); return; }
    if (form) updatePreview(form);
  });
  document.addEventListener('keydown', (e) => {
    if (e.target.id === 'q') {
      if (e.key === 'ArrowDown' && res.length) { e.preventDefault(); resI = (resI + 1) % res.length; renderResults(); }
      else if (e.key === 'ArrowUp' && res.length) { e.preventDefault(); resI = (resI - 1 + res.length) % res.length; renderResults(); }
      else if (e.key === 'Enter') { e.preventDefault(); pickResult(resI >= 0 ? resI : 0); }
      else if (e.key === 'Escape') { e.target.value = ''; closeSearch(); }
      return;
    }
    if (e.key === 'Escape') {
      if (ui.pop) { const a = document.querySelector('[data-pop-anchor="' + ui.pop + '"]'); ui.pop = null; renderPop(); if (a) a.focus(); }
      else if (ui.sheet) { ui.sheet = false; renderSheet(); }
      else if (ui.open) { ui.open = null; render(); }
    }
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); const q = document.getElementById('q'); if (q.offsetParent) q.focus(); else ACT['search-open'](); }
  });
  window.addEventListener('hashchange', onHash);
  window.addEventListener('resize', () => { if (ui.pop) renderPop(); });

  onHash();
  syncRemote();
  let tick = 0;
  setInterval(() => {
    updLive();
    if (document.hidden) return;
    tick++;
    if (cur.sec === 'rankings' || tick % 3 === 0) syncRemote();
  }, 10000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) syncRemote(); });
  window.addEventListener('afterprint', () => { document.getElementById('print-area').innerHTML = ''; });
})();
