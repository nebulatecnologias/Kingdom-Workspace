/**
 * O Despertar · Pipeline de vendas
 *
 * 1. onEdit: quando alguém muda a Etapa na aba Leads, preenche Último contacto,
 *    Tentativas e Data da compra, e regista a mudança na aba Histórico.
 * 2. doGet: devolve ao dashboard os números agregados (sem nomes, telefones
 *    nem emails de leads), calculados a partir das abas Leads, Histórico,
 *    Compradores e Config.
 *
 * Instalação: ver projetos/o-despertar/GUIA.md.
 */

var ABA = { LEADS: 'Leads', HIST: 'Histórico', COMPR: 'Compradores', CONFIG: 'Config' };
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
  var mudouEtapa = tocou('Etapa');
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

    var etapa = String(v('Etapa') || '').trim();
    if (!etapa) continue;
    var anterior = (n === 1 && nr === 1 && e.oldValue !== undefined) ? e.oldValue : '';
    var qtd = v('Qtd ingressos'), cond = v('Condição');
    if (etapa !== 'Por contactar') {
      escrever('Último contacto', hoje, 'dd/mm/yyyy');
      escrever('Tentativas', (Number(v('Tentativas')) || 0) + 1);
    }
    if (etapa === 'Comprou') {
      if (v('Data da compra') === '') escrever('Data da compra', hoje, 'dd/mm/yyyy');
      if (qtd === '') { qtd = 1; escrever('Qtd ingressos', 1); }
      if (cond === '') { cond = 'Preço normal'; escrever('Condição', cond); }
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
  var p = letra_(C['Qtd ingressos']) + linha, s = letra_(C['Sector']) + linha, q = letra_(C['Condição']) + linha;
  return '=IF(OR(' + p + '="",' + s + '=""),"",' + p + '*IFERROR(VLOOKUP(' + s +
    ',Config!$E$3:$F$12,2,FALSE),0)*IFERROR(VLOOKUP(' + q + ',Config!$H$3:$I$8,2,FALSE),1))';
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
        faixa: l['Faixa'], resp: l['Responsável'], etapa: l['Etapa'], canal: l['Canal'],
        tentativas: l['Tentativas'], followup: dia(l['Próximo follow-up']), sector: l['Sector'],
        qtd: l['Qtd ingressos'], cond: l['Condição'], motivo: l['Motivo (se não vai)'],
        dataCompra: dia(l['Data da compra'])
      };
    });
  var hist = ler(ABA.HIST).map(function (h) {
    return { dia: dia(h['Data']) || dia(h['Data e hora']), nova: h['Nova etapa'], resp: h['Responsável'],
      qtd: h['Qtd ingressos'], sector: h['Sector'], cond: h['Condição'] };
  });
  var compradores = ler(ABA.COMPR).filter(function (c) { return c['Nome'] !== '' || c['Telefone'] !== ''; })
    .map(function (c) {
      return { origem: c['Origem'], qtd: c['Qtd ingressos'], sector: c['Sector'], dia: dia(c['Data da compra']) };
    });
  var config = {
    evento: nome('evento_nome'), dataEvento: dia(nome('evento_data')), inicio: dia(nome('campanha_inicio')),
    meta: nome('meta_ingressos'), moeda: nome('moeda'), producao: nome('producao'), equipa: nome('equipa_vendas'),
    responsaveis: tabela('lista_responsaveis').map(function (r) { return r[0]; }),
    sectores: tabela('tabela_sectores'), condicoes: tabela('tabela_condicoes'),
    canais: tabela('lista_canais').map(function (r) { return r[0]; }),
    motivos: tabela('lista_motivos').map(function (r) { return r[0]; })
  };
  return agregar_({ leads: leads, hist: hist, compradores: compradores, config: config,
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
  var preco = {}, fator = {};
  (cfg.sectores || []).forEach(function (r) { if (txt(r[0])) preco[txt(r[0])] = num(r[1]); });
  (cfg.condicoes || []).forEach(function (r) { if (txt(r[0])) fator[txt(r[0])] = r[1] === '' ? 1 : num(r[1]); });
  var valor = function (qtd, sector, cond) {
    var q = num(qtd);
    if (!q || !txt(sector)) return 0;
    var f = fator.hasOwnProperty(txt(cond)) ? fator[txt(cond)] : 1;
    return q * (preco[txt(sector)] || 0) * f;
  };
  var temPrecos = Object.keys(preco).some(function (k) { return preco[k] > 0; });
  var contar = function (lista, chave) {
    var m = {};
    lista.forEach(function (x) { var k = txt(x[chave]); if (k) m[k] = (m[k] || 0) + 1; });
    return m;
  };
  var vazio = function () {
    return { leads: 0, contactados: 0, tentativas: 0, atenderam: 0, interessados: 0, compraram: 0,
      ingressos: 0, receita: 0, followHoje: 0, followAtraso: 0 };
  };
  var somar = function (acc, l) {
    var etapa = txt(l.etapa) || 'Por contactar';
    acc.leads++;
    acc.tentativas += num(l.tentativas);
    if (etapa !== 'Por contactar') acc.contactados++;
    if (ATENDERAM.indexOf(etapa) >= 0) acc.atenderam++;
    if (etapa === 'Vai comprar') acc.interessados++;
    if (etapa === 'Comprou') {
      acc.compraram++;
      acc.ingressos += num(l.qtd) || 1;
      acc.receita += valor(l.qtd || 1, l.sector, l.cond);
    }
    if (l.followup && ABERTAS.indexOf(etapa) >= 0) {
      if (l.followup === hoje) acc.followHoje++;
      else if (l.followup < hoje) acc.followAtraso++;
    }
    return acc;
  };

  var total = d.leads.reduce(somar, vazio());

  // Equipa: ordem da Config, depois quem não está na Config
  var porResp = {};
  d.leads.forEach(function (l) {
    var r = txt(l.resp) || 'Sem responsável';
    porResp[r] = somar(porResp[r] || vazio(), l);
  });
  var nomesEquipa = (cfg.responsaveis || []).map(txt).filter(Boolean);
  Object.keys(porResp).forEach(function (r) { if (nomesEquipa.indexOf(r) < 0) nomesEquipa.push(r); });
  var equipa = nomesEquipa.filter(function (r) { return porResp[r]; }).map(function (r) {
    var o = porResp[r]; o.nome = r; return o;
  });

  var faixas = ['A', 'B', 'C', 'D'].map(function (f) {
    var o = d.leads.filter(function (l) { return txt(l.faixa) === f; }).reduce(somar, vazio());
    o.faixa = f; return o;
  });

  var porEtapa = contar(d.leads.map(function (l) { return { e: txt(l.etapa) || 'Por contactar' }; }), 'e');
  var funil = ORDEM_ETAPAS.map(function (e) { return { etapa: e, n: porEtapa[e] || 0 }; });

  var contactados = d.leads.filter(function (l) { return txt(l.etapa) && txt(l.etapa) !== 'Por contactar'; });
  var porCanal = contar(contactados, 'canal');
  var canais = (cfg.canais || []).map(txt).filter(Boolean).map(function (c) { return { canal: c, n: porCanal[c] || 0 }; });
  var recusas = d.leads.filter(function (l) { return txt(l.etapa) === 'Não vai participar'; });
  var porMotivo = contar(recusas, 'motivo');
  var motivos = (cfg.motivos || []).map(txt).filter(Boolean).map(function (m) { return { motivo: m, n: porMotivo[m] || 0 }; });
  var semMotivo = recusas.filter(function (l) { return !txt(l.motivo); }).length;
  if (semMotivo) motivos.push({ motivo: 'Não indicado', n: semMotivo });

  // Outros canais (aba Compradores)
  var outros = { pessoas: d.compradores.length, ingressos: 0, receita: 0, porOrigem: {} };
  d.compradores.forEach(function (c) {
    var q = num(c.qtd) || 1;
    outros.ingressos += q;
    outros.receita += valor(q, c.sector, '');
    var o = txt(c.origem) || 'Não indicado';
    outros.porOrigem[o] = (outros.porOrigem[o] || 0) + q;
  });

  // Ingressos por sector (equipa + outros)
  var sectores = {};
  var addSector = function (s, q, v) {
    s = txt(s) || 'Sem sector';
    sectores[s] = sectores[s] || { sector: s, ingressos: 0, receita: 0 };
    sectores[s].ingressos += q; sectores[s].receita += v;
  };
  d.leads.forEach(function (l) {
    if (txt(l.etapa) === 'Comprou') addSector(l.sector, num(l.qtd) || 1, valor(l.qtd || 1, l.sector, l.cond));
  });
  d.compradores.forEach(function (c) { addSector(c.sector, num(c.qtd) || 1, valor(num(c.qtd) || 1, c.sector, '')); });

  // Atividade diária (aba Histórico)
  var dias = {};
  d.hist.forEach(function (h) {
    if (!h.dia) return;
    var o = dias[h.dia] = dias[h.dia] || { dia: h.dia, tentativas: 0, atenderam: 0, vendas: 0, ingressos: 0 };
    var e = txt(h.nova);
    if (e && e !== 'Por contactar') o.tentativas++;
    if (ATENDERAM.indexOf(e) >= 0) o.atenderam++;
    if (e === 'Comprou') { o.vendas++; o.ingressos += num(h.qtd) || 1; }
  });
  var chaves = Object.keys(dias).sort();
  var inicio = cfg.inicio && (!chaves.length || cfg.inicio < chaves[0]) ? cfg.inicio : chaves[0];
  var diario = [];
  if (inicio) {
    var cur = new Date(inicio + 'T12:00:00Z'), fim = new Date(hoje + 'T12:00:00Z');
    var limite = 120;
    while (cur <= fim && limite-- > 0) {
      var k = cur.toISOString().slice(0, 10);
      diario.push(dias[k] || { dia: k, tentativas: 0, atenderam: 0, vendas: 0, ingressos: 0 });
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
  }

  var meta = num(cfg.meta);
  var ingressosTotal = total.ingressos + outros.ingressos;
  return {
    versao: 1,
    geradoEm: d.agora,
    hoje: hoje,
    evento: {
      nome: txt(cfg.evento) || 'O Despertar', data: cfg.dataEvento || '', inicioCampanha: cfg.inicio || '',
      producao: txt(cfg.producao), equipaVendas: txt(cfg.equipa), moeda: txt(cfg.moeda) || 'MT',
      meta: meta || null, temPrecos: temPrecos
    },
    kpis: {
      base: total.leads,
      porContactar: porEtapa['Por contactar'] || 0,
      contactados: total.contactados,
      tentativas: total.tentativas,
      atenderam: total.atenderam,
      interessados: total.interessados,
      compraramEquipa: total.compraram,
      ingressosEquipa: total.ingressos,
      receitaEquipa: total.receita,
      pessoasOutros: outros.pessoas,
      ingressosOutros: outros.ingressos,
      receitaOutros: outros.receita,
      ingressosTotal: ingressosTotal,
      receitaTotal: total.receita + outros.receita,
      progressoMeta: meta ? ingressosTotal / meta : null,
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
    origensOutros: Object.keys(outros.porOrigem).map(function (k) { return { origem: k, ingressos: outros.porOrigem[k] }; }),
    sectores: Object.keys(sectores).map(function (k) { return sectores[k]; }),
    diario: diario
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
