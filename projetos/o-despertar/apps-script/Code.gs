/**
 * O Despertar · Pipeline de vendas
 *
 * 1. onEdit: quando alguém muda o Status da ligação na aba Leads, preenche Último contacto,
 *    Tentativas e Data da compra, e regista a mudança na aba Histórico.
 * 2. doGet: devolve ao dashboard os números agregados (sem nomes, telefones
 *    nem emails de leads), calculados a partir das abas Leads, Histórico,
 *    Relatório diário e Config.
 *
 * Instalação: ver projetos/o-despertar/GUIA.md.
 */

var ABA = { LEADS: 'Leads', HIST: 'Histórico', RELATORIO: 'Relatório diário', CONFIG: 'Config' };
var COL_STATUS = 'Status da ligação';
var ORDEM_ETAPAS = ['Por contactar', 'Sem resposta', 'Em conversa', 'Vai comprar', 'Comprou',
  'Não vai participar', 'Contacto inválido'];
var ATENDERAM = ['Em conversa', 'Vai comprar', 'Comprou', 'Não vai participar'];
var ABERTAS = ['Sem resposta', 'Em conversa', 'Vai comprar'];
var SEGUNDOS_CACHE = 30;

// ---------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------

function onOpen() {
  SpreadsheetApp.getUi().createMenu('O Despertar')
    .addItem('Adicionar 100 linhas para novos leads', 'adicionarLinhas')
    .addItem('Ver os dados que o dashboard recebe', 'mostrarDadosDashboard')
    .addToUi();
}

/** Acrescenta linhas no fim da aba Leads com listas, formatos e fórmulas. */
function adicionarLinhas() {
  var sh = SpreadsheetApp.getActive().getSheetByName(ABA.LEADS);
  var n = 100;
  var ultima = sh.getLastRow();
  var faltam = ultima + n - sh.getMaxRows();
  if (faltam > 0) sh.insertRowsAfter(sh.getMaxRows(), faltam);
  var modelo = sh.getRange(2, 1, 1, sh.getLastColumn());
  var destino = sh.getRange(ultima + 1, 1, n, sh.getLastColumn());
  modelo.copyTo(destino, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
  modelo.copyTo(destino, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
  var C = colunas_(sh);
  var formulasWa = [], formulasValor = [];
  for (var i = 0; i < n; i++) {
    formulasWa.push([formulaWhatsApp_(C, ultima + 1 + i)]);
    formulasValor.push([formulaValor_(C, ultima + 1 + i)]);
  }
  if (C['WhatsApp']) sh.getRange(ultima + 1, C['WhatsApp'], n, 1).setFormulas(formulasWa);
  if (C['Valor']) sh.getRange(ultima + 1, C['Valor'], n, 1).setFormulas(formulasValor);
  SpreadsheetApp.getActive().toast(n + ' linhas prontas a partir da linha ' + (ultima + 1) + '.', 'O Despertar');
}

function mostrarDadosDashboard() {
  var dados = calcularDados_();
  var html = HtmlService.createHtmlOutput('<pre style="font:12px monospace;white-space:pre-wrap">' +
    JSON.stringify(dados, null, 2).replace(/</g, '&lt;') + '</pre>').setWidth(700).setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Dados enviados ao dashboard');
}

// ---------------------------------------------------------------------------
// Registo automático
// ---------------------------------------------------------------------------

function onEdit(e) {
  try {
    tratarEdicao_(e);
  } catch (err) {
    console.error(err && err.stack || err);
  }
}

function tratarEdicao_(e) {
  if (!e || !e.range) return;
  var sh = e.range.getSheet();
  if (sh.getName() !== ABA.LEADS) return;
  var r0 = e.range.getRow(), nr = e.range.getNumRows();
  var c0 = e.range.getColumn(), nc = e.range.getNumColumns();
  if (r0 + nr - 1 < 2 || nr > 300) return;           // cabeçalho ou colagem muito grande
  var C = colunas_(sh);
  var tocou = function (nome) { return C[nome] && C[nome] >= c0 && C[nome] < c0 + nc; };
  var mudouEtapa = tocou(COL_STATUS);
  var mudouDados = tocou('Telefone') || tocou('Nome') || tocou('Qtd ingressos') || tocou('Sector');
  if (!mudouEtapa && !mudouDados) return;

  var ss = sh.getParent();
  var tz = ss.getSpreadsheetTimeZone();
  var agora = new Date();
  var hoje = serialHoje_(tz);
  var primeira = Math.max(r0, 2), n = r0 + nr - primeira;
  var largura = sh.getLastColumn();
  var bloco = sh.getRange(primeira, 1, n, largura);
  var vals = bloco.getValues();
  var formulas = bloco.getFormulas();
  var hist = [];

  for (var i = 0; i < n; i++) {
    var linha = primeira + i;
    var v = function (nome) { return C[nome] ? vals[i][C[nome] - 1] : ''; };
    var escrever = function (nome, valor, formato) {
      if (!C[nome]) return;
      var cel = sh.getRange(linha, C[nome]);
      cel.setValue(valor);
      if (formato) cel.setNumberFormat(formato);
    };
    // Fórmulas em linhas novas
    if (C['WhatsApp'] && !formulas[i][C['WhatsApp'] - 1] && v('Telefone') !== '') {
      sh.getRange(linha, C['WhatsApp']).setFormula(formulaWhatsApp_(C, linha));
    }
    if (C['Valor'] && !formulas[i][C['Valor'] - 1]) {
      sh.getRange(linha, C['Valor']).setFormula(formulaValor_(C, linha));
    }
    if (C['ID'] && v('ID') === '' && v('Nome') !== '') {
      escrever('ID', 'L' + ('00000' + (linha - 1)).slice(-5));
    }
    if (!mudouEtapa) continue;

    var etapa = String(v(COL_STATUS) || '').trim();
    if (!etapa) continue;
    var anterior = (n === 1 && nr === 1 && e.oldValue !== undefined) ? e.oldValue : '';
    var qtd = v('Qtd ingressos'), cond = v('Cupão');
    if (etapa !== 'Por contactar') {
      escrever('Último contacto', hoje, 'dd/mm/yyyy');
      escrever('Tentativas', (Number(v('Tentativas')) || 0) + 1);
    }
    if (etapa === 'Comprou') {
      if (v('Data da compra') === '') escrever('Data da compra', hoje, 'dd/mm/yyyy');
      if (qtd === '') { qtd = 1; escrever('Qtd ingressos', 1); }
      if (cond === '') { cond = 'Sem cupão'; escrever('Cupão', cond); }
    }
    hist.push([agora, hoje, v('ID'), v('Responsável'), anterior, etapa, v('Canal'), v('Faixa'),
      v('Sector'), qtd, cond, 'Automático']);
  }

  if (hist.length) {
    var hs = ss.getSheetByName(ABA.HIST);
    var dest = hs.getRange(hs.getLastRow() + 1, 1, hist.length, hist[0].length);
    dest.setValues(hist);
    hs.getRange(dest.getRow(), 1, hist.length, 1).setNumberFormat('dd/mm/yyyy hh:mm');
    hs.getRange(dest.getRow(), 2, hist.length, 1).setNumberFormat('dd/mm/yyyy');
  }
  CacheService.getScriptCache().remove('dados');
}

function formulaWhatsApp_(C, linha) {
  var t = letra_(C['Telefone']) + linha;
  return '=IF(' + t + '="","",HYPERLINK("https://wa.me/"&SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(' + t +
    ',"+","")," ",""),"-",""),"Abrir WhatsApp"))';
}

function formulaValor_(C, linha) {
  var p = letra_(C['Qtd ingressos']) + linha, s = letra_(C['Sector']) + linha, q = letra_(C['Cupão']) + linha;
  return '=IF(OR(' + p + '="",' + s + '=""),"",ROUND(' + p + '*IFERROR(VLOOKUP(' + s +
    ',Config!$F$3:$G$8,2,FALSE),0)*IFERROR(VLOOKUP(' + q + ',Config!$J$3:$K$8,2,FALSE),1),0))';
}

// ---------------------------------------------------------------------------
// API do dashboard
// ---------------------------------------------------------------------------

function doGet(e) {
  var chave = PropertiesService.getScriptProperties().getProperty('CHAVE_DASHBOARD');
  if (chave && (!e || !e.parameter || e.parameter.chave !== chave)) {
    return json_({ erro: 'Acesso negado: chave em falta ou errada.' });
  }
  var cache = CacheService.getScriptCache();
  var guardado = cache.get('dados');
  if (guardado) return ContentService.createTextOutput(guardado).setMimeType(ContentService.MimeType.JSON);
  var texto = JSON.stringify(calcularDados_());
  try { cache.put('dados', texto, SEGUNDOS_CACHE); } catch (err) { /* resposta grande demais para a cache */ }
  return ContentService.createTextOutput(texto).setMimeType(ContentService.MimeType.JSON);
}

/** Lê a planilha e entrega a agregar_() só dados planos. */
function calcularDados_() {
  var ss = SpreadsheetApp.getActive();
  var tz = ss.getSpreadsheetTimeZone();
  var dia = function (d) {
    return (d instanceof Date) ? Utilities.formatDate(d, tz, 'yyyy-MM-dd') : '';
  };
  var ler = function (nome) {
    var sh = ss.getSheetByName(nome);
    if (!sh) return [];
    var lr = sh.getLastRow(), lc = sh.getLastColumn();
    if (lr < 2) return [];
    var vals = sh.getRange(1, 1, lr, lc).getValues();
    var cab = vals.shift().map(function (h) { return String(h).trim(); });
    return vals.map(function (row) {
      var o = {};
      cab.forEach(function (h, i) { o[h] = row[i]; });
      return o;
    });
  };
  var nome = function (n) { var r = ss.getRangeByName(n); return r ? r.getValue() : ''; };
  var tabela = function (n) { var r = ss.getRangeByName(n); return r ? r.getValues() : []; };

  var leads = ler(ABA.LEADS).filter(function (l) { return l['ID'] !== '' || l['Nome'] !== ''; })
    .map(function (l) {
      return {
        faixa: l['Faixa'], resp: l['Responsável'], status: l[COL_STATUS], canal: l['Canal'],
        tentativas: l['Tentativas'], followup: dia(l['Próximo follow-up']), sector: l['Sector'],
        qtd: l['Qtd ingressos'], cupao: l['Cupão'], motivo: l['Motivo (se não vai)'],
        dataCompra: dia(l['Data da compra'])
      };
    });
  var hist = ler(ABA.HIST).map(function (h) {
    return { dia: dia(h['Data']) || dia(h['Data e hora']), novo: h['Novo status'], resp: h['Responsável'] };
  });
  var relatorios = ler(ABA.RELATORIO).map(function (r) {
    return { dia: dia(r['Data']), autor: r['Autor da análise'], analise: r['Análise do dia'], proximos: r['Próximos passos'] };
  });
  var config = {
    evento: nome('evento_nome'), subtitulo: nome('evento_subtitulo'), artista: nome('evento_artista'),
    dataEvento: dia(nome('evento_data')), hora: nome('evento_hora'), local: nome('evento_local'),
    cidade: nome('evento_cidade'), inscricoes: nome('evento_inscricoes'), inicio: dia(nome('campanha_inicio')),
    meta: nome('meta_ingressos'), moeda: nome('moeda'), producao: nome('producao'), equipa: nome('equipa_vendas'),
    responsaveis: tabela('lista_responsaveis').map(function (r) { return r[0]; }),
    sectores: tabela('tabela_sectores'), cupoes: tabela('tabela_cupoes'),
    canais: tabela('lista_canais').map(function (r) { return r[0]; }),
    motivos: tabela('lista_motivos').map(function (r) { return r[0]; })
  };
  return agregar_({ leads: leads, hist: hist, relatorios: relatorios, config: config,
    hoje: Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd'), agora: new Date().toISOString() });
}

/**
 * Função pura: recebe dados planos e devolve o JSON do dashboard.
 * Não usa serviços do Google, por isso pode ser testada fora do Apps Script.
 */
function agregar_(d) {
  var cfg = d.config, hoje = d.hoje;
  var num = function (x) { var n = Number(x); return isFinite(n) ? n : 0; };
  var txt = function (x) { return x === null || x === undefined ? '' : String(x).trim(); };
  var lista = function (a) { return (a || []).map(txt).filter(Boolean); };

  var precos = [], preco = {};
  (cfg.sectores || []).forEach(function (r) {
    if (!txt(r[0])) return;
    preco[txt(r[0])] = num(r[1]);
    precos.push({ sector: txt(r[0]), preco: num(r[1]), descricao: txt(r[2]) });
  });
  var cupoes = [], fator = {};
  (cfg.cupoes || []).forEach(function (r) {
    if (!txt(r[0])) return;
    fator[txt(r[0])] = r[1] === '' ? 1 : num(r[1]);
    cupoes.push({ cupao: txt(r[0]), fator: fator[txt(r[0])], validade: txt(r[2]) });
  });
  var valores = function (l) {
    var q = num(l.qtd) || 1, p = preco[txt(l.sector)] || 0;
    var f = fator.hasOwnProperty(txt(l.cupao)) ? fator[txt(l.cupao)] : 1;
    var bruto = q * p;
    return { q: q, bruto: bruto, liquido: Math.round(bruto * f) };
  };
  var status = function (l) { return txt(l.status) || 'Por contactar'; };

  var vazio = function () {
    return { leads: 0, contactados: 0, tentativas: 0, atenderam: 0, interessados: 0, compraram: 0,
      ingressos: 0, receita: 0, followHoje: 0, followAtraso: 0 };
  };
  var somar = function (acc, l) {
    var s = status(l);
    acc.leads++;
    acc.tentativas += num(l.tentativas);
    if (s !== 'Por contactar') acc.contactados++;
    if (ATENDERAM.indexOf(s) >= 0) acc.atenderam++;
    if (s === 'Vai comprar') acc.interessados++;
    if (s === 'Comprou') { var v = valores(l); acc.compraram++; acc.ingressos += v.q; acc.receita += v.liquido; }
    if (l.followup && ABERTAS.indexOf(s) >= 0) {
      if (l.followup === hoje) acc.followHoje++;
      else if (l.followup < hoje) acc.followAtraso++;
    }
    return acc;
  };
  var compras = d.leads.filter(function (l) { return status(l) === 'Comprou'; });
  var total = d.leads.reduce(somar, vazio());
  var bruto = compras.reduce(function (a, l) { return a + valores(l).bruto; }, 0);

  // Equipa
  var porResp = {};
  d.leads.forEach(function (l) { var r = txt(l.resp) || 'Sem responsável'; porResp[r] = somar(porResp[r] || vazio(), l); });
  var nomesEquipa = lista(cfg.responsaveis);
  Object.keys(porResp).forEach(function (r) { if (nomesEquipa.indexOf(r) < 0) nomesEquipa.push(r); });
  var equipa = nomesEquipa.filter(function (r) { return porResp[r]; })
    .map(function (r) { var o = porResp[r]; o.nome = r; return o; });

  var faixas = ['A', 'B', 'C', 'D'].map(function (f) {
    var o = d.leads.filter(function (l) { return txt(l.faixa) === f; }).reduce(somar, vazio());
    o.faixa = f; return o;
  });

  var contar = function (arr, fn) { var m = {}; arr.forEach(function (x) { var k = fn(x); if (k) m[k] = (m[k] || 0) + 1; }); return m; };
  var porStatus = contar(d.leads, status);
  var funil = ORDEM_ETAPAS.map(function (e) { return { status: e, n: porStatus[e] || 0 }; });
  var porCanal = contar(d.leads.filter(function (l) { return status(l) !== 'Por contactar'; }), function (l) { return txt(l.canal); });
  var canais = lista(cfg.canais).map(function (c) { return { canal: c, n: porCanal[c] || 0 }; });
  var recusas = d.leads.filter(function (l) { return status(l) === 'Não vai participar'; });
  var porMotivo = contar(recusas, function (l) { return txt(l.motivo) || 'Não indicado'; });
  var motivos = lista(cfg.motivos).concat(['Não indicado']).map(function (m) { return { motivo: m, n: porMotivo[m] || 0 }; });

  // Vendas por sector e por cupão
  var agrupar = function (arr, chave, base) {
    var m = {};
    base.forEach(function (b) { m[b] = { ingressos: 0, receita: 0, pessoas: 0, desconto: 0 }; });
    arr.forEach(function (l) {
      var k = chave(l), v = valores(l);
      m[k] = m[k] || { ingressos: 0, receita: 0, pessoas: 0, desconto: 0 };
      m[k].ingressos += v.q; m[k].receita += v.liquido; m[k].pessoas++; m[k].desconto += v.bruto - v.liquido;
    });
    return m;
  };
  var porSector = agrupar(compras, function (l) { return txt(l.sector) || 'Sector por indicar'; }, precos.map(function (p) { return p.sector; }));
  var sectores = Object.keys(porSector).map(function (k) {
    var p = precos.filter(function (x) { return x.sector === k; })[0] || {};
    var o = porSector[k];
    return { sector: k, preco: p.preco || null, descricao: p.descricao || '', ingressos: o.ingressos, receita: o.receita, pessoas: o.pessoas };
  });
  var porCupao = agrupar(compras, function (l) { return txt(l.cupao) || 'Sem cupão'; }, cupoes.map(function (c) { return c.cupao; }));
  var cupoesVendas = Object.keys(porCupao).map(function (k) {
    var c = cupoes.filter(function (x) { return x.cupao === k; })[0] || {};
    var o = porCupao[k];
    return { cupao: k, validade: c.validade || '', fator: c.fator || 1, ingressos: o.ingressos, receita: o.receita, desconto: o.desconto };
  });

  // Dias: atividade (Histórico), vendas (Data da compra), relatório do responsável
  var dias = {};
  var novoDia = function (k) {
    return dias[k] = dias[k] || { dia: k, tentativas: 0, atenderam: 0, interessados: 0, recusas: 0, vendas: 0,
      ingressos: 0, receita: 0, _eq: {}, _sec: {}, _cup: {}, relatorio: null };
  };
  var eqDia = function (o, r) {
    r = txt(r) || 'Sem responsável';
    return o._eq[r] = o._eq[r] || { nome: r, tentativas: 0, atenderam: 0, vendas: 0, ingressos: 0, receita: 0 };
  };
  d.hist.forEach(function (h) {
    if (!h.dia) return;
    var o = novoDia(h.dia), e = txt(h.novo), p = eqDia(o, h.resp);
    if (e && e !== 'Por contactar') { o.tentativas++; p.tentativas++; }
    if (ATENDERAM.indexOf(e) >= 0) { o.atenderam++; p.atenderam++; }
    if (e === 'Vai comprar') o.interessados++;
    if (e === 'Não vai participar') o.recusas++;
  });
  compras.forEach(function (l) {
    if (!l.dataCompra) return;
    var o = novoDia(l.dataCompra), v = valores(l), p = eqDia(o, l.resp);
    o.vendas++; o.ingressos += v.q; o.receita += v.liquido;
    p.vendas++; p.ingressos += v.q; p.receita += v.liquido;
    var s = txt(l.sector) || 'Sector por indicar', c = txt(l.cupao) || 'Sem cupão';
    o._sec[s] = (o._sec[s] || 0) + v.q; o._cup[c] = (o._cup[c] || 0) + v.q;
  });
  (d.relatorios || []).forEach(function (r) {
    if (!r.dia || !(txt(r.analise) || txt(r.proximos))) return;
    novoDia(r.dia).relatorio = { autor: txt(r.autor), analise: txt(r.analise), proximos: txt(r.proximos) };
  });
  var chaves = Object.keys(dias).sort();
  var inicio = cfg.inicio || chaves[0] || hoje;
  if (chaves.length && chaves[0] < inicio) inicio = chaves[0];
  var fim = cfg.dataEvento && cfg.dataEvento > hoje ? cfg.dataEvento : hoje;
  var serie = [];
  var cur = new Date(inicio + 'T12:00:00Z'), ate = new Date(fim + 'T12:00:00Z'), limite = 120;
  while (cur <= ate && limite-- > 0) {
    var k = cur.toISOString().slice(0, 10);
    var o = dias[k] || novoDia(k);
    var ordem = nomesEquipa.concat(Object.keys(o._eq).filter(function (n) { return nomesEquipa.indexOf(n) < 0; }));
    serie.push({
      dia: k, futuro: k > hoje, evento: k === cfg.dataEvento,
      tentativas: o.tentativas, atenderam: o.atenderam, interessados: o.interessados, recusas: o.recusas,
      vendas: o.vendas, ingressos: o.ingressos, receita: o.receita,
      equipa: ordem.filter(function (n) { return o._eq[n]; }).map(function (n) { return o._eq[n]; }),
      sectores: Object.keys(o._sec).map(function (s) { return { sector: s, ingressos: o._sec[s] }; }),
      cupoes: Object.keys(o._cup).map(function (c) { return { cupao: c, ingressos: o._cup[c] }; }),
      relatorio: o.relatorio
    });
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  var meta = num(cfg.meta);
  return {
    versao: 2,
    geradoEm: d.agora,
    hoje: hoje,
    evento: {
      nome: txt(cfg.evento) || 'O Despertar', subtitulo: txt(cfg.subtitulo), artista: txt(cfg.artista),
      data: cfg.dataEvento || '', hora: txt(cfg.hora), local: txt(cfg.local), cidade: txt(cfg.cidade),
      inscricoes: txt(cfg.inscricoes), inicioCampanha: cfg.inicio || '', producao: txt(cfg.producao),
      equipaVendas: txt(cfg.equipa), moeda: txt(cfg.moeda) || 'MT', meta: meta || null
    },
    precos: precos,
    cupoes: cupoes,
    kpis: {
      base: total.leads,
      porContactar: porStatus['Por contactar'] || 0,
      contactados: total.contactados,
      tentativas: total.tentativas,
      atenderam: total.atenderam,
      interessados: total.interessados,
      compraram: total.compraram,
      ingressos: total.ingressos,
      receita: total.receita,
      receitaBruta: bruto,
      descontos: bruto - total.receita,
      ticketMedio: total.ingressos ? total.receita / total.ingressos : 0,
      progressoMeta: meta ? total.ingressos / meta : null,
      taxaContacto: total.leads ? total.contactados / total.leads : 0,
      taxaAtendimento: total.contactados ? total.atenderam / total.contactados : 0,
      conversao: total.atenderam ? total.compraram / total.atenderam : 0,
      followHoje: total.followHoje,
      followAtraso: total.followAtraso
    },
    funil: funil,
    equipa: equipa,
    faixas: faixas,
    canais: canais,
    motivos: motivos,
    sectores: sectores,
    cupoesVendas: cupoesVendas,
    dias: serie
  };
}

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

function colunas_(sh) {
  var cab = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var m = {};
  cab.forEach(function (h, i) { m[String(h).trim()] = i + 1; });
  return m;
}

function letra_(col) {
  var s = '';
  while (col > 0) { var r = (col - 1) % 26; s = String.fromCharCode(65 + r) + s; col = Math.floor((col - 1) / 26); }
  return s;
}

/** Dia de hoje como número de série do Sheets: não depende do fuso do script. */
function serialHoje_(tz) {
  var p = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd').split('-').map(Number);
  return (Date.UTC(p[0], p[1] - 1, p[2]) - Date.UTC(1899, 11, 30)) / 86400000;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
