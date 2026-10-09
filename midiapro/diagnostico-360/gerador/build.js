// Diagnóstico 360° Pro — gerador do documento DOCX (Midia Pro)
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, VerticalAlign, HeightRule,
  Header, Footer, PageNumber, PageBreak, LevelFormat, TabStopType,
  PositionalTab, PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader,
  HeadingLevel, TableLayoutType, CharacterSet,
} = require("docx");

const DIR = path.join(__dirname, "assets");
const OUT = process.argv[2] || path.join(__dirname, "out.docx");

// ---------- Marca ----------
const C = {
  navy: "011169", deep: "000C3E", blue: "2E5BE6", sky: "9DB2FF",
  tint: "EEF1FB", tint2: "F7F8FD", line: "C9D0EA", grey: "5B6384",
  text: "1A1F36", white: "FFFFFF",
  green: "1E9E5A", amber: "E3A008", red: "D63A3A",
};
const FONT = "Google Sans";
const PAGE_W = 11906, PAGE_H = 16838, MARGIN = 1134;
const W = PAGE_W - 2 * MARGIN; // 9638

const logoWhite = fs.readFileSync(path.join(DIR, "logo-white.png"));
const logoNavy = fs.readFileSync(path.join(DIR, "logo-navy.png"));
const LOGO_RATIO = 513 / 840;

// ---------- Helpers de texto ----------
// "**negrito**" dentro do texto
function runs(text, o = {}) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((t) => {
    const b = t.startsWith("**") && t.endsWith("**");
    return new TextRun({
      text: b ? t.slice(2, -2) : t,
      bold: b || o.bold, color: o.color || C.text, size: o.size || 20,
      font: FONT, allCaps: o.caps, characterSpacing: o.spacing, italics: o.italics,
    });
  });
}
const P = (text, o = {}) => new Paragraph({
  children: runs(text, o),
  alignment: o.align, keepNext: o.keepNext, keepLines: true,
  spacing: { before: o.before ?? 0, after: o.after ?? 120, line: o.line ?? 276, lineRule: "auto" },
  indent: o.indent,
});
const spacer = (h = 120) => new Paragraph({ children: [], spacing: { before: 0, after: 0, line: h, lineRule: "exact" } });

const H1 = (text, kicker) => [
  new Paragraph({ pageBreakBefore: true, keepNext: true, children: runs(kicker, { size: 18, bold: true, color: C.blue, caps: true, spacing: 40 }), spacing: { after: 60 } }),
  new Paragraph({
    heading: HeadingLevel.HEADING_1, keepNext: true,
    children: [new TextRun({ text, font: FONT })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: C.navy, space: 6 } },
  }),
];
const H2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, keepNext: true, children: [new TextRun({ text, font: FONT })] });
const H3 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_3, keepNext: true, children: [new TextRun({ text, font: FONT })] });

const bullet = (text, ref = "bul", level = 0) => new Paragraph({
  numbering: { reference: ref, level }, children: runs(text),
  spacing: { before: 0, after: 80, line: 276 },
});
let numInstance = 0;
const numbered = (items) => { numInstance++; return items.map((t) => new Paragraph({
  numbering: { reference: "num", level: 0, instance: numInstance }, children: runs(t),
  spacing: { before: 0, after: 80, line: 276 },
})); };

// ---------- Helpers de tabela ----------
const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE };
const thin = (color = C.line, size = 4) => ({ style: BorderStyle.SINGLE, size, color });
const allBorders = (color = C.line) => ({ top: thin(color), bottom: thin(color), left: thin(color), right: thin(color) });

function cell(children, o = {}) {
  return new TableCell({
    children: Array.isArray(children) ? children : [children],
    width: { size: o.w, type: WidthType.DXA },
    shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
    borders: o.borders || allBorders(),
    verticalAlign: o.valign || VerticalAlign.TOP,
    margins: o.margins || { top: 90, bottom: 90, left: 140, right: 140 },
    columnSpan: o.span,
  });
}
function table(widths, rows, o = {}) {
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: widths, layout: TableLayoutType.FIXED,
    borders: o.borders || noBorders,
    rows,
  });
}
const row = (cells, o = {}) => new TableRow({
  children: cells, cantSplit: o.cantSplit ?? true, tableHeader: o.header,
  height: o.height ? { value: o.height, rule: o.rule || HeightRule.ATLEAST } : undefined,
});

// Tabela de dados com cabeçalho azul
function dataTable(headers, rows, widths, o = {}) {
  const head = row(headers.map((h, i) => cell(P(h, { size: 17, bold: true, color: C.white, after: 0, keepNext: true }), { w: widths[i], fill: C.navy, borders: allBorders(C.navy) })), { header: true });
  const body = rows.map((r, ri) => row(r.map((v, i) => cell(
    v instanceof Paragraph ? v : P(v, { size: 18, after: 0, keepNext: o.keep && ri < rows.length - 1, bold: o.boldFirst && i === 0, color: o.boldFirst && i === 0 ? C.navy : C.text }),
    { w: widths[i], fill: ri % 2 ? C.tint2 : C.white },
  )), { height: o.rowHeight }));
  return table(widths, [head, ...body]);
}

// Caixa de destaque com barra lateral
function callout(title, children, o = {}) {
  const color = o.color || C.blue;
  return table([W], [row([cell([
    P(title, { size: 17, bold: true, color, caps: true, spacing: 30, after: 80, keepNext: true }),
    ...children,
  ], {
    w: W, fill: o.fill || C.tint,
    borders: { top: NONE, bottom: NONE, right: NONE, left: { style: BorderStyle.SINGLE, size: 36, color } },
    margins: { top: 110, bottom: 80, left: 240, right: 200 },
  })], { cantSplit: o.cantSplit ?? true })]);
}
// Linha "Rótulo: texto" dentro de caixas
const kv = (k, v) => new Paragraph({
  children: [new TextRun({ text: k + "  ", bold: true, color: C.navy, size: 18, font: FONT }), ...runs(v, { size: 18 })],
  spacing: { before: 0, after: 50, line: 252 }, keepLines: true,
});

// ---------- Campos do formulário ----------
const answerBox = (lines = 1, w = W) => table([w], [row([cell(P("", { after: 0 }), {
  w, fill: C.tint2, borders: allBorders(C.line),
})], { height: 200 + lines * 260 })]);

function optionsGrid(options, symbol, cols) {
  cols = cols || (options.length > 6 ? 3 : 2);
  const cw = Math.floor(W / cols);
  const widths = Array(cols).fill(cw); widths[cols - 1] = W - cw * (cols - 1);
  const rows = [];
  for (let i = 0; i < options.length; i += cols) {
    rows.push(row(widths.map((w, j) => {
      const o = options[i + j];
      return cell(o ? new Paragraph({
        children: [new TextRun({ text: symbol + "  ", font: FONT, size: 22, color: C.navy }), ...runs(o, { size: 18 })],
        spacing: { before: 0, after: 0, line: 264 }, indent: { left: 300, hanging: 300 }, keepNext: i + cols < options.length,
      }) : P("", { after: 0 }), { w, borders: noBorders, margins: { top: 25, bottom: 25, left: 60, right: 80 } });
    })));
  }
  return table(widths, rows);
}

function fieldHead(f) {
  const out = [];
  out.push(new Paragraph({
    keepNext: true, keepLines: true, spacing: { before: 130, after: 30 },
    children: [
      new TextRun({ text: f.id + "   ", bold: true, color: C.blue, size: 18, font: FONT }),
      new TextRun({ text: f.label, bold: true, color: C.navy, size: 18, font: FONT, allCaps: true, characterSpacing: 10 }),
      ...(f.req ? [new TextRun({ text: "  *", bold: true, color: C.red, size: 18, font: FONT })] : []),
      ...(f.type === "multi" ? [new TextRun({ text: "   (seleccione todas as que se aplicam)", color: C.grey, size: 15, font: FONT })] : []),
      ...(f.type === "choice" ? [new TextRun({ text: "   (seleccione uma opção)", color: C.grey, size: 15, font: FONT })] : []),
    ],
  }));
  const hint = (k, v) => new Paragraph({
    keepNext: true, keepLines: true, spacing: { before: 0, after: 40, line: 252 },
    indent: { left: 420 },
    children: [new TextRun({ text: k + " ", bold: true, color: C.grey, size: 16, font: FONT }), ...runs(v, { size: 16, color: C.grey })],
  });
  if (f.how) out.push(hint("Como levantar:", f.how));
  if (f.model) out.push(hint("Modelo aceite:", f.model));
  if (f.evid) out.push(new Paragraph({
    keepNext: true, keepLines: true, spacing: { before: 0, after: 40, line: 252 }, indent: { left: 420 },
    children: [new TextRun({ text: "EVIDÊNCIA A ANEXAR ", bold: true, color: C.white, size: 14, font: FONT, shading: { type: ShadingType.CLEAR, fill: C.blue, color: "auto" } }),
      new TextRun({ text: "  " + f.evid, color: C.grey, size: 16, font: FONT })],
  }));
  out.push(spacer(60));
  return out;
}

function field(f) {
  const out = fieldHead(f);
  switch (f.type) {
    case "choice": out.push(optionsGrid(f.options, "○", f.cols)); if (f.other) out.push(P("Outro / detalhe: ________________________________________________", { size: 17, color: C.grey, before: 60, after: 0 })); break;
    case "multi": out.push(optionsGrid(f.options, "□", f.cols)); if (f.other) out.push(P("Outro / detalhe: ________________________________________________", { size: 17, color: C.grey, before: 60, after: 0 })); break;
    case "pair": {
      const half = Math.floor((W - 200) / 2);
      out.pop(); // remove spacer duplicado
      out.push(spacer(40));
      out.push(table([half, 200, W - 200 - half], [
        row([cell(P(f.labels[0], { size: 15, bold: true, color: C.grey, caps: true, after: 0 }), { w: half, borders: noBorders, margins: { top: 0, bottom: 40, left: 0, right: 0 } }),
          cell(P(""), { w: 200, borders: noBorders }),
          cell(P(f.labels[1], { size: 15, bold: true, color: C.grey, caps: true, after: 0 }), { w: W - 200 - half, borders: noBorders, margins: { top: 0, bottom: 40, left: 0, right: 0 } })]),
        row([cell(P("", { after: 0 }), { w: half, fill: C.tint2 }), cell(P(""), { w: 200, borders: noBorders }), cell(P("", { after: 0 }), { w: W - 200 - half, fill: C.tint2 })], { height: 560 }),
      ]));
      break;
    }
    case "table": out.push(dataTable(f.headers, f.rows, f.widths, { rowHeight: 330, boldFirst: f.boldFirst, keep: true })); break;
    case "scale10": out.push(scaleRow(0, 10)); break;
    default: out.push(answerBox(f.lines || 1));
  }
  return out;
}

function scaleRow(a, b) {
  const n = b - a + 1, cw = Math.floor(W / n);
  const widths = Array(n).fill(cw); widths[n - 1] = W - cw * (n - 1);
  return table(widths, [row(widths.map((w, i) => cell(P(String(a + i), { size: 20, bold: true, color: C.navy, align: AlignmentType.CENTER, after: 0 }), { w, fill: i % 2 ? C.tint2 : C.white, valign: VerticalAlign.CENTER })), { height: 480 })]);
}

// Escala Likert 1–5
function likert(items, startNo) {
  const wq = W - 5 * 760, widths = [wq, 760, 760, 760, 760, 760];
  const labels = ["Muito fraco", "Fraco", "Razoável", "Bom", "Excelente"];
  const head = row([
    cell(P("Afirmação", { size: 17, bold: true, color: C.white, after: 0 }), { w: wq, fill: C.navy, borders: allBorders(C.navy), valign: VerticalAlign.CENTER }),
    ...labels.map((l, i) => cell([
      P(String(i + 1), { size: 20, bold: true, color: C.white, align: AlignmentType.CENTER, after: 0 }),
      P(l, { size: 12, color: C.sky, align: AlignmentType.CENTER, after: 0, line: 220 }),
    ], { w: 760, fill: C.navy, borders: allBorders(C.navy), margins: { top: 60, bottom: 60, left: 40, right: 40 } })),
  ], { header: true });
  const body = items.map((t, i) => row([
    cell(new Paragraph({ children: [new TextRun({ text: `${startNo}.${i + 1}  `, bold: true, color: C.blue, size: 18, font: FONT }), ...runs(t, { size: 18 })], spacing: { after: 0, line: 264 } }), { w: wq, fill: i % 2 ? C.tint2 : C.white, valign: VerticalAlign.CENTER }),
    ...[1, 2, 3, 4, 5].map(() => cell(P("○", { size: 24, color: C.navy, align: AlignmentType.CENTER, after: 0 }), { w: 760, fill: i % 2 ? C.tint2 : C.white, valign: VerticalAlign.CENTER })),
  ]));
  return table(widths, [head, ...body]);
}

// Pergunta aberta (Parte B)
const openQ = (id, text, lines = 2, hint) => [
  new Paragraph({
    keepNext: true, keepLines: true, spacing: { before: 160, after: 60 }, indent: { left: 520, hanging: 520 },
    children: [new TextRun({ text: id + "\t", bold: true, color: C.blue, size: 18, font: FONT }), ...runs(text, { size: 19, color: C.text })],
    tabStops: [{ type: TabStopType.LEFT, position: 520 }],
  }),
  ...(hint ? [new Paragraph({ keepNext: true, spacing: { before: 0, after: 60 }, indent: { left: 520 }, children: [new TextRun({ text: "Dica para o entrevistador: ", bold: true, color: C.grey, size: 16, font: FONT }), ...runs(hint, { size: 16, color: C.grey })] })] : []),
  answerBox(lines),
];

// Banda de etapa
function stageBand(no, title, area, who, time) {
  return [
    new Paragraph({ heading: HeadingLevel.HEADING_2, pageBreakBefore: true, keepNext: true, children: [new TextRun({ text: `Etapa ${no} · ${title}`, font: FONT, size: 2, color: C.white })], spacing: { before: 0, after: 0, line: 20, lineRule: "exact" } }),
    table([1700, W - 1700], [row([
      cell([
        P("ETAPA", { size: 15, bold: true, color: C.sky, spacing: 40, align: AlignmentType.CENTER, after: 0 }),
        P(no, { size: 52, bold: true, color: C.white, align: AlignmentType.CENTER, after: 0, line: 240 }),
      ], { w: 1700, fill: C.navy, borders: allBorders(C.navy), valign: VerticalAlign.CENTER, margins: { top: 120, bottom: 120, left: 100, right: 100 } }),
      cell([
        P(area, { size: 15, bold: true, color: C.blue, caps: true, spacing: 30, after: 40 }),
        P(title, { size: 32, bold: true, color: C.navy, after: 60, line: 240 }),
        new Paragraph({ spacing: { after: 0 }, children: [
          new TextRun({ text: "Tempo: ", bold: true, size: 17, color: C.grey, font: FONT }),
          new TextRun({ text: time.replace(" ", "\u00A0") + "   ·   ", size: 17, color: C.text, font: FONT }),
          new TextRun({ text: "Quem preenche: ", bold: true, size: 17, color: C.grey, font: FONT }),
          new TextRun({ text: who, size: 17, color: C.text, font: FONT }),
        ] }),
      ], { w: W - 1700, fill: C.tint, borders: allBorders(C.tint), valign: VerticalAlign.CENTER, margins: { top: 120, bottom: 120, left: 280, right: 200 } }),
    ])]),
    spacer(100),
  ];
}

function guideBox(g) {
  return callout("Como fazer o diagnóstico nesta etapa", [
    kv("Objectivo", g.goal),
    kv("Fontes internas", g.sources),
    kv("Como levantar", g.method),
    ...(g.evidence ? [kv("Evidências", g.evidence)] : []),
  ]);
}

function stage(s) {
  return [
    ...stageBand(s.no, s.title, s.area, s.who, s.time),
    guideBox(s.guide),
    ...s.fields.flatMap(field),
  ];
}

// =====================================================================
// CONTEÚDO
// =====================================================================
const STAGES = [
  {
    no: "01", title: "Identificação & Visão do Negócio", area: "Direcção-Geral",
    who: "Director-Geral, com Financeiro e RH", time: "15 min",
    guide: {
      goal: "Perceber quem é a empresa, a sua dimensão e o problema que motivou este diagnóstico.",
      sources: "Relatório de vendas mensal (últimos 12 meses, por loja), organigrama, lista de lojas e colaboradores.",
      method: "Reunião de 15 minutos com a Direcção. Os números devem vir do Financeiro/Contabilidade e não de estimativas de memória.",
      evidence: "Organigrama actual · Relatório de vendas dos últimos 12 meses por loja.",
    },
    fields: [
      { id: "1.1", label: "Nome / Marca", req: true, how: "Nome comercial usado nas lojas e, se for diferente, o nome jurídico da empresa.", model: "Home Center (Home Center, Lda.)" },
      { id: "1.2", label: "Segmento / Nicho", req: true, how: "Sector principal e tipo de cliente servido.", model: "Retalho de materiais de construção, acabamentos, casa e decoração (particulares e empresas)." },
      { id: "1.3", label: "Responsável pelo contacto", req: true, type: "pair", labels: ["Nome *", "Cargo"], model: "A pessoa que vai coordenar o briefing internamente (ponto focal)." },
      { id: "1.4", label: "Contactos", req: true, type: "pair", labels: ["Email *", "WhatsApp / Telefone"], model: "nome@empresa.co.mz  ·  +258 8X XXX XXXX" },
      { id: "1.5", label: "Website e redes sociais activas", how: "Indique apenas as contas com publicações nos últimos 30 dias.", model: "www.empresa.co.mz · Instagram @empresa · Facebook /empresa · TikTok @empresa" },
      { id: "1.6", label: "Descrição resumida do negócio", req: true, lines: 3, how: "Em 3 a 5 linhas: o que vende, a quem, onde e o que a distingue.", model: "Rede de 3 lojas em Maputo e Matola que vende materiais de construção, acabamentos e artigos para a casa a particulares e empreiteiros, com entrega ao domicílio e aconselhamento técnico." },
      { id: "1.7", label: "Estrutura: lojas e equipas", type: "table", how: "O RH confirma o número de colaboradores por unidade.", headers: ["Loja / Unidade", "Localização", "Responsável", "Nº colaboradores"], widths: [2600, 2600, 2738, 1700], rows: [["Loja 1", "", "", ""], ["Loja 2", "", "", ""], ["Loja 3", "", "", ""], ["Sede / Escritório", "", "", ""]], boldFirst: true },
      { id: "1.8", label: "Tempo de mercado", type: "choice", options: ["Menos de 1 ano", "1 a 3 anos", "3 a 5 anos", "5 a 10 anos", "Mais de 10 anos"], cols: 3 },
      { id: "1.9", label: "Facturação mensal estimada (confidencial)", how: "Média dos últimos 6 meses, fornecida pelo Financeiro.", model: "Média: 12.500.000 MZN/mês (Abril–Setembro 2026)." , evid: "Relatório de vendas mensal." },
      { id: "1.10", label: "Evolução das vendas nos últimos 12 meses", type: "choice", options: ["Crescimento acima de 10%", "Crescimento até 10%", "Estável", "Queda até 10%", "Queda acima de 10%"], cols: 3, how: "Compare o total dos últimos 12 meses com os 12 meses anteriores." },
      { id: "1.11", label: "Principal desafio que motivou este diagnóstico", req: true, lines: 3, how: "Descreva o problema em factos: o quê, desde quando, onde e com que impacto.", model: "Redução de cerca de 15% nas vendas desde Março; atendimento diferente entre as 3 lojas; clientes que pedem orçamento e não recebem follow-up." },
    ],
  },
  {
    no: "02", title: "Público-Alvo & Cliente Ideal", area: "Marketing · Comercial",
    who: "Marketing + gerente de loja + vendedor", time: "25 min",
    guide: {
      goal: "Definir com precisão quem compra, porque compra e o que o impede de comprar. É a base de toda a comunicação e do tráfego pago.",
      sources: "Facturação por tipo de cliente, base de clientes/CRM, estatísticas das redes (Meta Business Suite), conversa com os vendedores de balcão.",
      method: "Reúna-se 30 minutos com os vendedores que mais atendem: eles conhecem as perguntas e objecções reais. Liste as 10 perguntas mais frequentes dos clientes. Use as estatísticas das redes para confirmar a idade e a localização.",
      evidence: "Captura das estatísticas das redes (idade, género, localização) · Facturação por tipo de cliente.",
    },
    fields: [
      { id: "2.1", label: "Tipo de cliente", req: true, type: "multi", options: ["Particulares (obra própria / remodelação)", "Empreiteiros e construtores", "Arquitectos e designers de interiores", "Empresas e instituições", "Revendedores", "Outro"], how: "Indique também o peso aproximado de cada tipo nas vendas.", model: "Particulares 55% · Empreiteiros 30% · Empresas 15%", other: true },
      { id: "2.2", label: "Faixa etária predominante", req: true, type: "multi", options: ["18 a 24 anos", "25 a 34 anos", "35 a 44 anos", "45 a 54 anos", "55 anos ou mais"], cols: 3 },
      { id: "2.3", label: "Género predominante", type: "choice", options: ["Maioritariamente masculino", "Maioritariamente feminino", "Equilibrado"], cols: 3 },
      { id: "2.4", label: "Localização geográfica", req: true, how: "Onde vivem ou trabalham os clientes. Se possível, indique percentagens.", model: "Maputo Cidade 50% · Matola 35% · Marracuene e Boane 10% · Outras províncias 5%" },
      { id: "2.5", label: "Classe socioeconómica", type: "multi", options: ["A: Alta", "B: Média-alta", "C: Média", "D: Média-baixa"], cols: 4 },
      { id: "2.6", label: "Principais dores / problemas", req: true, lines: 3, how: "Pergunte aos vendedores: \"Com que problema o cliente chega à loja?\"", model: "Não sabe quanta quantidade de material precisa; medo de comprar com baixa qualidade; falta de produto em stock; dificuldade de transporte." },
      { id: "2.7", label: "Principais desejos / aspirações", req: true, lines: 3, how: "O resultado final que o cliente quer alcançar, não o produto.", model: "Terminar a obra dentro do orçamento; ter uma casa bonita e segura; ser bem aconselhado e confiar no fornecedor." },
      { id: "2.8", label: "Objecções mais comuns", lines: 2, how: "Frases que os clientes dizem antes de desistir da compra.", model: "\"Está mais caro que na concorrência.\" · \"Vou pensar.\" · \"Não entregam no mesmo dia?\"" },
      { id: "2.9", label: "Gatilhos de decisão de compra", type: "multi", options: ["Preço / promoção", "Disponibilidade imediata", "Qualidade / marca", "Entrega ao domicílio", "Crédito / condições de pagamento", "Atendimento e aconselhamento técnico", "Variedade de produtos", "Garantia / assistência", "Localização / conveniência", "Recomendação de terceiros"], cols: 2 },
      { id: "2.10", label: "Plataformas digitais que o público mais frequenta", req: true, type: "multi", options: ["Instagram", "Facebook", "TikTok", "YouTube", "LinkedIn", "WhatsApp / Telegram", "Google (pesquisa)", "Twitter / X", "Pinterest", "Podcasts / Spotify"], cols: 3 },
      { id: "2.11", label: "Estágio de consciência do público", req: true, type: "choice", cols: 1, how: "Essencial para o copy e o tráfego pago. Escolha o estágio da maioria dos clientes.", options: ["**Não consciente:** não sabe que tem o problema", "**Consciente do problema:** mas não conhece a solução", "**Consciente da solução:** mas não conhece o produto/marca", "**Consciente do produto:** mas ainda não decidiu", "**Mais consciente:** quase pronto para comprar"] },
    ],
  },
  {
    no: "03", title: "Posicionamento & Marca", area: "Marketing · Direcção-Geral",
    who: "Direcção-Geral + Marketing", time: "20 min",
    guide: {
      goal: "Definir como a marca quer ser percebida, contra quem compete e como deve falar.",
      sources: "Manual de marca, peças já publicadas, avaliações de clientes (Google, Facebook), observação das lojas e redes dos concorrentes.",
      method: "Escreva a proposta de valor numa só frase. Para o posicionamento actual, pergunte a 5 clientes: \"Porque compra aqui e não noutro lado?\". Visite as redes e as lojas de 2 a 5 concorrentes.",
      evidence: "Manual de marca ou logótipo em alta resolução · Exemplos de peças publicadas.",
    },
    fields: [
      { id: "3.1", label: "Proposta de Valor Única (PVU)", req: true, lines: 2, how: "Complete a frase-modelo com a realidade da empresa.", model: "Para [público] que [necessidade], a [marca] é [categoria] que [benefício principal], porque [prova / diferencial]." },
      { id: "3.2", label: "Posicionamento actual percebido", lines: 2, how: "Como os clientes descrevem a marca hoje (avaliações, conversas, reclamações).", model: "\"Tem de tudo, mas o atendimento varia muito de loja para loja.\"" },
      { id: "3.3", label: "Posicionamento desejado", lines: 2, model: "A referência em Maputo para quem constrói ou remodela: variedade, aconselhamento técnico e entrega rápida." },
      { id: "3.4", label: "Principais concorrentes (2 a 5)", type: "table", headers: ["Concorrente", "Onde actua", "Ponto forte", "Ponto fraco"], widths: [2300, 2000, 2669, 2669], rows: [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]] },
      { id: "3.5", label: "Tom de voz principal", req: true, type: "multi", cols: 2, options: ["Profissional / Sério", "Inspirador / Motivacional", "Próximo / Amigável", "Humorístico / Leve", "Educativo / Didáctico", "Provocador / Disruptivo", "Autoritário / Especialista", "Simpático / Acolhedor"] },
      { id: "3.6", label: "O que não combina com a marca", lines: 2, model: "Linguagem demasiado informal; humor sobre segurança na obra; promessas de \"o mais barato do mercado\"." },
      { id: "3.7", label: "Palavras-chave da marca (5 a 10)", how: "Palavras que devem aparecer de forma consistente na comunicação.", model: "confiança · variedade · obra · casa · qualidade · rapidez · aconselhamento" },
      { id: "3.8", label: "Marcas ou perfis de referência", how: "Indique o link e o que admira em cada uma.", model: "@marca_x: fotografia de produto · @marca_y: vídeos de dicas curtos" },
      { id: "3.9", label: "Identidade visual", type: "choice", cols: 2, options: ["Sim: completa (manual de marca)", "Sim: parcial (logótipo + cores)", "Sim: mas precisa de actualização", "Não: será desenvolvida do zero"], evid: "Manual de marca ou logótipo em alta resolução (PNG/SVG/PDF)." },
    ],
  },
  {
    no: "04", title: "Objectivos & Metas", area: "Direcção-Geral · Marketing",
    who: "Director-Geral + Marketing", time: "15 min",
    guide: {
      goal: "Definir um objectivo principal mensurável e o que significa sucesso. Sem meta clara não há estratégia.",
      sources: "Orçamento anual, plano de negócios, metas comerciais por loja.",
      method: "Escolha só um objectivo principal. Transforme-o numa meta com número e prazo (ex.: +20% de vendas até Março). Indique o que precisa de ver em 6 meses para considerar o trabalho um sucesso.",
      evidence: "Mapa de metas do ano por loja.",
    },
    fields: [
      { id: "4.1", label: "Objectivo principal", req: true, type: "choice", cols: 2, options: ["Lançamento (produto, serviço ou loja)", "Geração de leads qualificados", "Crescimento orgânico de audiência", "Construção e consolidação de autoridade", "Vendas directas", "Reposicionamento de marca", "Lançamento de nova marca do zero", "Escalar vendas já existentes"] },
      { id: "4.2", label: "Serviços pretendidos da Midia Pro", req: true, type: "multi", cols: 2, options: ["Planeamento estratégico e posicionamento", "Branding digital / identidade visual", "Copywriting", "Design gráfico", "Videomaking", "Social media / produção de conteúdo", "Gestão de tráfego pago", "Inside Sales / processo comercial", "Desenvolvimento tecnológico (web, automação)", "Formação: liderança, atendimento e vendas"] },
      { id: "4.3", label: "Meta quantitativa principal", req: true, how: "Número + indicador + prazo.", model: "Aumentar as vendas mensais de 12,5 M para 15 M MZN (+20%) até Março de 2027." },
      { id: "4.4", label: "Resultado que define sucesso para o cliente", lines: 2, model: "Vendas a crescer 3 meses seguidos, atendimento igual nas 3 lojas e 100% dos orçamentos com follow-up em 48h." },
      { id: "4.5", label: "Calendário", req: true, type: "pair", labels: ["Data de início *", "Prazo / data de entrega *"] },
      { id: "4.6", label: "KPIs a monitorizar", type: "multi", options: ["Alcance / impressões", "Taxa de interacção", "Seguidores ganhos", "Leads gerados", "Custo por lead (CPL)", "Taxa de conversão", "Custo por aquisição (CPA)", "ROAS / ROI", "Receita gerada", "Visualizações de vídeo"], cols: 3 },
    ],
  },
  {
    no: "05", title: "Oferta, Produtos & Pontos de Venda", area: "Comercial · Compras",
    who: "Comercial + Compras + Financeiro", time: "15 min",
    guide: {
      goal: "Saber o que vamos comunicar, a que preço e porque é melhor do que a alternativa.",
      sources: "Relatório de vendas por categoria, margens, tabela de preços, catálogo, avaliações de clientes.",
      method: "Escolha as categorias que mais vendem e as que se quer fazer crescer (maior margem). Ticket médio = facturação do mês ÷ número de facturas do mês.",
      evidence: "Top 20 produtos por facturação · Tabela de preços ou catálogo · Campanhas em curso.",
    },
    fields: [
      { id: "5.1", label: "Produtos / categorias prioritárias a comunicar", req: true, type: "table", how: "Peso nas vendas: relatório por categoria. Margem: indicação do Financeiro.", headers: ["Categoria / produto", "Peso nas vendas (%)", "Margem (Alta/Média/Baixa)", "Prioridade (1 a 3)"], widths: [3438, 2000, 2400, 1800], rows: [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]] },
      { id: "5.2", label: "Preço / ticket médio", req: true, model: "Ticket médio: 8.500 MZN por factura (Setembro 2026). Particulares 4.000 MZN · Empreiteiros 35.000 MZN." },
      { id: "5.3", label: "Promessa central da oferta", req: true, lines: 2, how: "Complete: \"Ao comprar na [marca], o cliente vai conseguir…\"", model: "…encontrar tudo para a obra num só lugar, com aconselhamento e entrega no próprio dia." },
      { id: "5.4", label: "Diferenciais incluídos", type: "multi", cols: 2, options: ["Entrega ao domicílio", "Crédito / pagamento a prestações", "Orçamento gratuito", "Aconselhamento técnico", "Garantia / assistência pós-venda", "Programa de fidelização", "Condições para profissionais", "Outro"], other: true },
      { id: "5.5", label: "Provas sociais disponíveis", lines: 1, how: "Links ou descrição do que existe e pode ser usado na comunicação.", model: "Avaliações Google 4,5 estrelas (320 avaliações) · vídeos de clientes · fotos de obras realizadas · parceiros e marcas representadas." },
      { id: "5.6", label: "Pontos e canais de venda", type: "multi", cols: 3, options: ["Lojas físicas", "WhatsApp Business", "Website / loja online", "Redes sociais (mensagens)", "Telefone", "Vendedores externos / B2B"] },
    ],
  },
  {
    no: "06", title: "Comunicação & Conteúdo", area: "Marketing · Social Media",
    who: "Marketing / Social Media", time: "15 min",
    guide: {
      goal: "Dimensionar a produção de conteúdo (o que, quanto e onde) para orçamentar e planear a equipa criativa.",
      sources: "Calendário editorial actual, estatísticas das redes, arquivo de fotos e vídeos.",
      method: "No inventário, indique a quantidade mensal desejada de cada peça (deixe em branco o que não precisa). Para os pilares, pense no que o cliente quer aprender ou ver.",
      evidence: "Link para a pasta de conteúdos existentes (fotos, vídeos, artes).",
    },
    fields: [
      { id: "6.1", label: "Inventário de peças (quantidade mensal)", req: true, type: "table", boldFirst: true, headers: ["Tipo de peça", "Qtd./mês", "Plataforma / destino", "Referência / observação"], widths: [2900, 1100, 2600, 3038], rows: [
        ["Posts estáticos (feed)", "", "", ""], ["Carrosséis / sequências", "", "", ""], ["Stories", "", "", ""], ["Reels / vídeos curtos", "", "", ""], ["Vídeos longos / YouTube", "", "", ""], ["Vídeo de vendas (VSL)", "", "", ""], ["Criativos para anúncios", "", "", ""], ["Copywriting (textos)", "", "", ""], ["Email marketing", "", "", ""], ["Landing page / funil", "", "", ""], ["Outros", "", "", ""],
      ] },
      { id: "6.2", label: "Frequência de publicação esperada", type: "choice", cols: 3, options: ["Diária", "5x por semana", "3x por semana", "2x por semana", "1x por semana", "Só para campanhas"] },
      { id: "6.3", label: "O cliente participa nas gravações?", type: "choice", cols: 2, options: ["Sim: é o rosto / a voz do conteúdo", "Parcialmente: conteúdo misto", "Não: conteúdo 100% produzido pela equipa", "A definir"] },
      { id: "6.4", label: "Temas / pilares de conteúdo (3 a 5)", lines: 1, model: "Dicas de obra e remodelação · Novidades e promoções · Inspiração de decoração · Bastidores e equipa · Testemunhos de clientes" },
      { id: "6.5", label: "Links de conteúdo já produzido", model: "Link do Google Drive / Dropbox com fotos de produtos, das lojas e vídeos." },
    ],
  },
  {
    no: "07", title: "Tráfego Pago & Funil", area: "Marketing · Financeiro",
    who: "Marketing + Financeiro (orçamento)", time: "15 min",
    guide: {
      goal: "Conhecer o investimento disponível, o histórico de anúncios e o caminho que o cliente percorre até comprar.",
      sources: "Gestor de Anúncios Meta / Google Ads (últimos 6 meses), despesas de publicidade, bases de contactos (WhatsApp, email).",
      method: "Exporte do Gestor de Anúncios: investimento, resultados e custo por resultado. Conte os contactos de cada base. Desenhe o funil actual em setas, do primeiro contacto à compra.",
      evidence: "Relatório de anúncios dos últimos 6 meses (exportação em Excel/PDF).",
    },
    fields: [
      { id: "7.1", label: "Orçamento mensal para tráfego pago", req: true, how: "Valor destinado só aos anúncios (sem honorários da agência).", model: "50.000 MZN/mês" },
      { id: "7.2", label: "Plataformas para anunciar", type: "multi", cols: 3, options: ["Meta Ads (Facebook/Instagram)", "Google Ads", "TikTok Ads", "YouTube Ads", "LinkedIn Ads", "A definir"] },
      { id: "7.3", label: "Objectivo do tráfego", type: "choice", cols: 2, options: ["Geração de leads (captação)", "Conversão directa em vendas", "Reconhecimento de marca (topo de funil)", "Tráfego para conteúdo / interacção", "Retargeting de audiência quente"] },
      { id: "7.4", label: "Pixel / tag de rastreio instalado?", type: "choice", cols: 3, options: ["Sim: Meta Pixel activo", "Sim: Google Tag Manager", "Ambos", "Não: será instalado pela equipa", "Não sei"] },
      { id: "7.5", label: "Histórico de anúncios", type: "choice", cols: 2, options: ["Nunca anunciou", "Já anunciou: conta activa", "Já anunciou: conta inactiva", "Conta com restrições / bloqueada"] },
      { id: "7.6", label: "CPA ou CPL máximo aceitável", model: "Até 150 MZN por lead · até 1.500 MZN por venda." },
      { id: "7.7", label: "Audiência / base própria existente", model: "WhatsApp: 4.200 contactos · Email: 1.100 · Instagram: 12 mil seguidores · Facebook: 35 mil seguidores" },
      { id: "7.8", label: "Funil de vendas actual", lines: 2, how: "Descreva o caminho em setas, do primeiro contacto à compra.", model: "Anúncio no Facebook → mensagem no WhatsApp → orçamento enviado → visita à loja → compra" },
    ],
  },
  {
    no: "08", title: "Processo Comercial & Vendas", area: "Comercial · Lojas",
    who: "Direcção Comercial + Gerentes das lojas", time: "25 min",
    guide: {
      goal: "Mapear o processo real de recepção, encaminhamento e follow-up de clientes e o uso de métricas na gestão comercial.",
      sources: "Relatórios de vendas, metas por loja e por vendedor, mapas de follow-up (CRM, Excel, WhatsApp).",
      method: "Acompanhe um período de atendimento em cada loja. Calcule a conversão: vendas fechadas ÷ orçamentos (ou leads) do mês. Peça a cada gerente para mostrar onde regista os clientes que ainda não compraram.",
      evidence: "Metas e resultados do último mês · Exemplo de mapa de follow-up · Script de vendas (se existir).",
    },
    fields: [
      { id: "8.1", label: "Método de venda actual", type: "multi", cols: 2, options: ["Venda ao balcão na loja", "Venda por WhatsApp / mensagens", "Chamada telefónica", "Visita / reunião com cliente (B2B)", "Orçamentos por email", "Loja online / checkout automático", "Webinar / evento", "Sem processo definido"] },
      { id: "8.2", label: "Dimensão da equipa de vendas", type: "choice", cols: 4, options: ["1 a 5", "6 a 10", "11 a 20", "Mais de 20"], how: "Total de vendedores e atendedores nas lojas e no comercial." },
      { id: "8.3", label: "Metas do último mês", type: "pair", labels: ["Meta definida", "Resultado alcançado"], model: "Meta: 13.000.000 MZN · Resultado: 11.200.000 MZN (86%)", evid: "Mapa de metas e resultados por loja." },
      { id: "8.4", label: "Taxa de conversão actual", how: "Vendas fechadas ÷ orçamentos ou leads recebidos no mês × 100.", model: "35% (140 vendas ÷ 400 orçamentos em Setembro). Se não for medida, escreva \"não medida\"." },
      { id: "8.5", label: "Follow-up", type: "pair", labels: ["Oportunidades em follow-up hoje", "% com follow-up dentro do prazo"], model: "85 oportunidades · 40% dentro do prazo" },
      { id: "8.6", label: "CRM / ferramenta de gestão de leads", type: "choice", cols: 3, options: ["Nenhuma", "Caderno / papel", "Excel / Google Sheets", "WhatsApp Business (etiquetas)", "CRM (indique qual)", "Sistema de facturação"], other: true, evid: "Captura de ecrã ou exemplo do registo (sem dados pessoais)." },
      { id: "8.7", label: "Jornada do cliente (do primeiro contacto à compra)", lines: 3, how: "Descreva os passos reais, quem actua em cada um e onde fica registado.", model: "1. Cliente envia mensagem no WhatsApp → 2. Recepção encaminha ao vendedor da loja → 3. Vendedor envia orçamento em 24h → 4. Liga 2 dias depois → 5. Cliente compra na loja." },
      { id: "8.8", label: "Tempo do primeiro contacto com um novo lead", type: "choice", cols: 3, options: ["Menos de 1 hora", "No mesmo dia", "Até 24 horas", "Até 48 horas", "Sem prazo definido"] },
      { id: "8.9", label: "Regista o motivo quando o cliente não compra?", type: "choice", cols: 3, options: ["Sim, sempre", "Às vezes", "Não"] },
      { id: "8.10", label: "Script / argumentário de vendas", type: "choice", cols: 3, options: ["Existe e é usado", "Existe mas não é usado", "Não existe"] },
      { id: "8.11", label: "Principal obstáculo no processo de vendas", req: true, lines: 2, model: "Os orçamentos enviados não são acompanhados e ninguém controla se o vendedor voltou a contactar o cliente." },
    ],
  },
  {
    no: "09", title: "Tecnologia & Sistemas", area: "TI · Marketing",
    who: "TI / sistemas + Marketing", time: "10 min",
    guide: {
      goal: "Saber que ferramentas existem, o que precisa de ser criado e o que pode ser automatizado.",
      sources: "Lista de sistemas (facturação/ERP, POS, website), contas de domínio e alojamento, acessos às redes.",
      method: "Liste todos os sistemas e quem os administra. Confirme quem tem acesso ao domínio e ao alojamento.",
      evidence: "Lista de sistemas. **Atenção:** palavras-passe nunca devem ser escritas neste documento; serão pedidas por canal seguro.",
    },
    fields: [
      { id: "9.1", label: "Necessita de desenvolvimento web?", type: "multi", cols: 2, options: ["Landing page", "Site institucional", "E-commerce / loja online", "Área de membros / portal", "Automação / chatbot", "Integrações / APIs", "App móvel", "Não necessita"] },
      { id: "9.2", label: "Plataformas / ferramentas actuais", lines: 2, model: "Facturação: Primavera · Site: WordPress · WhatsApp Business · Meta Business Suite · Email: Google Workspace" },
      { id: "9.3", label: "Acesso ao domínio e alojamento", type: "choice", cols: 3, options: ["Sim: acesso total", "Parcial: precisa de apoio", "Não tem domínio: será criado"] },
      { id: "9.4", label: "Necessidades de automação de marketing", lines: 2, model: "Resposta automática no WhatsApp; lembrete de orçamento 48h depois; catálogo digital partilhável." },
    ],
  },
  {
    no: "10", title: "Aprovações, Contexto & Materiais", area: "Direcção-Geral",
    who: "Director-Geral (ponto focal)", time: "10 min",
    guide: {
      goal: "Definir como vamos trabalhar juntos: quem aprova, em quanto tempo e que materiais estão disponíveis.",
      sources: "Experiência com fornecedores anteriores, regras internas de aprovação, arquivo de materiais da marca.",
      method: "Defina uma só pessoa com poder de aprovação final. Partilhe todos os materiais numa única pasta com nomes claros.",
      evidence: "Link da pasta partilhada com os materiais.",
    },
    fields: [
      { id: "10.1", label: "Experiências anteriores com agências", lines: 1, how: "O que funcionou e o que não funcionou.", model: "Agência X (2024): bom design, mas sem relatórios de resultados nem cumprimento de prazos." },
      { id: "10.2", label: "Restrições legais ou regulatórias", lines: 1, model: "Não comunicar preços em anúncios; uso obrigatório do logótipo de marcas parceiras." },
      { id: "10.3", label: "Processo de aprovação de materiais", type: "choice", cols: 2, options: ["Aprovação directa pelo cliente", "Equipa de marketing interna aprova primeiro", "Direcção aprova: processo mais lento", "Aprovação automática (confiança total na equipa)"] },
      { id: "10.4", label: "Responsável pela aprovação final", type: "pair", labels: ["Nome", "Cargo"] },
      { id: "10.5", label: "Prazo médio para feedback / aprovação", type: "choice", cols: 4, options: ["Menos de 24 horas", "1 a 2 dias úteis", "3 a 5 dias úteis", "Mais de 5 dias"] },
      { id: "10.6", label: "Materiais a partilhar com a equipa", type: "multi", cols: 3, options: ["Logótipo em alta resolução", "Manual de marca", "Fotos das lojas / produtos", "Vídeos", "Catálogo / tabela de preços", "Relatórios de vendas", "Organigrama", "Relatório de anúncios", "Outro"], how: "Assinale o que vai partilhar e indique o link abaixo.", model: "Link do Google Drive, Dropbox ou WeTransfer: https://…" },
      { id: "10.7", label: "Link da pasta partilhada", lines: 1 },
      { id: "10.8", label: "Informação adicional relevante", lines: 2 },
    ],
  },
];

// ---------- Parte B: Liderança ----------
const B2 = ["A equipa conhece claramente as suas metas.", "Cada colaborador sabe exactamente o que se espera dele.", "Existe acompanhamento regular do desempenho da equipa.", "Os colaboradores recebem feedback sobre o seu desempenho.", "As dificuldades de desempenho são identificadas e tratadas atempadamente.", "A equipa sente-se confortável para comunicar problemas e propor soluções.", "As decisões tomadas pela liderança são efectivamente implementadas.", "Existe responsabilização quando tarefas ou follow-ups não são executados."];
const B3 = ["A comunicação entre Direcção e liderança é clara.", "A comunicação entre liderança e colaboradores é consistente.", "As três lojas recebem orientações institucionais consistentes.", "Comercial, Marketing, RH e lojas trabalham de forma coordenada.", "As informações importantes chegam às equipas atempadamente.", "Existem canais claros para comunicar problemas e decisões.", "Os colaboradores compreendem as prioridades comerciais da empresa."];

// =====================================================================
// MONTAGEM
// =====================================================================
const cover = [
  table([PAGE_W], [row([cell([
    spacer(900),
    new Paragraph({ children: [new ImageRun({ type: "png", data: logoWhite, transformation: { width: 190, height: Math.round(190 * LOGO_RATIO) } })], spacing: { after: 0 } }),
    spacer(2600),
    P("Briefing Estratégico & Diagnóstico de Liderança", { size: 20, bold: true, color: C.sky, caps: true, spacing: 40, after: 160 }),
    P("Diagnóstico", { size: 84, bold: true, color: C.white, after: 0, line: 240 }),
    P("360° Pro", { size: 84, bold: true, color: C.white, after: 240, line: 240 }),
    P("Guia e formulário de recolha da informação fundamental para a construção da estratégia completa da empresa cliente.", { size: 24, color: "D7DEFF", after: 480, line: 320 }),
    table([1500, 6000], [
      ...[["Cliente", "Home Center"], ["Áreas", "Direcção-Geral · Marketing · Comercial · Lojas · Tecnologia · RH & Liderança"], ["Data", "Outubro de 2026"], ["Versão", "1.0 · Confidencial"]].map(([k, v]) => row([
        cell(P(k, { size: 16, bold: true, color: C.sky, caps: true, spacing: 30, after: 0 }), { w: 1500, borders: { top: NONE, left: NONE, right: NONE, bottom: { style: BorderStyle.SINGLE, size: 4, color: "2A3A8F" } }, margins: { top: 100, bottom: 100, left: 0, right: 100 } }),
        cell(P(v, { size: 20, color: C.white, after: 0 }), { w: 6000, borders: { top: NONE, left: NONE, right: NONE, bottom: { style: BorderStyle.SINGLE, size: 4, color: "2A3A8F" } }, margins: { top: 100, bottom: 100, left: 100, right: 0 } }),
      ])),
    ]),
    spacer(3000),
    P("Produzido por **Midia Pro · Comunicação e Imagem**", { size: 18, color: C.white, after: 60 }),
    P("Av. Vladimir Lenine nº 1895, R/C · Maputo, Moçambique", { size: 17, color: "B9C4F5", after: 30 }),
    P("+258 85 589 0000 · info@midiapro.co.mz", { size: 17, color: "B9C4F5", after: 0 }),
  ], {
    w: PAGE_W, fill: C.deep, borders: allBorders(C.deep),
    margins: { top: 0, bottom: 0, left: 1300, right: 1300 },
  })], { height: PAGE_H - 40, rule: HeightRule.EXACT })]),
  new Paragraph({ children: [], spacing: { before: 0, after: 0, line: 20, lineRule: "exact" } }),
];

// ---------- Ficha + mapa ----------
const fichaRows = [
  ["Cliente", "Home Center"], ["Código do cliente", ""], ["Data de preenchimento", ""],
  ["Ponto focal do cliente (nome e cargo)", ""], ["Responsável pelo briefing (Midia Pro)", ""],
  ["Especialista em liderança e cultura", "Mirza Jamal (especialista subcontratada pela Midia Pro)"],
  ["Data limite de devolução", ""], ["Classificação", "Confidencial · uso exclusivo Midia Pro e cliente"],
];
const ficha = table([3600, W - 3600], fichaRows.map(([k, v], i) => row([
  cell(P(k, { size: 18, bold: true, color: C.navy, after: 0 }), { w: 3600, fill: C.tint, valign: VerticalAlign.CENTER }),
  cell(P(v, { size: 18, after: 0 }), { w: W - 3600, fill: C.white, valign: VerticalAlign.CENTER }),
], { height: 400 })));

const mapa = dataTable(
  ["Etapa", "Área / Departamento", "Quem preenche", "Tempo"],
  [
    ...STAGES.map((s) => [`A${s.no}  ${s.title}`, s.area, s.who, s.time]),
    ["B  Diagnóstico de Liderança", "RH · Liderança", "Cada líder, em entrevista individual", "45–60 min por líder"],
    ["C  Consolidação", "Uso interno Midia Pro", "Responsável de planeamento", "48 h"],
  ],
  [3300, 2100, 3038, 1200], { boldFirst: true, keep: true },
);

const legend = table([1300, W - 1300], [
  ["*", "Campo obrigatório: sem esta informação não é possível construir a estratégia."],
  ["○", "Escolha única: assinale apenas uma opção."],
  ["□", "Escolha múltipla: assinale todas as opções que se aplicam."],
  ["1 a 5", "Escala de avaliação: 1 = Muito fraco · 2 = Fraco · 3 = Razoável · 4 = Bom · 5 = Excelente."],
  ["EVIDÊNCIA", "Documento ou registo que comprova a resposta e deve ser anexado na pasta partilhada."],
  ["Como levantar", "Indica quem tem a informação dentro da empresa e onde a encontrar."],
  ["Modelo aceite", "Exemplo do formato de resposta esperado. Substitua pelos dados reais da empresa."],
].map(([k, v], i, a) => row([
  cell(P(k, { size: k.length > 3 ? 15 : 24, bold: true, color: k === "*" ? C.red : C.navy, align: AlignmentType.CENTER, after: 0, keepNext: i < a.length - 1 }), { w: 1300, fill: C.tint, valign: VerticalAlign.CENTER }),
  cell(P(v, { size: 18, after: 0, keepNext: i < a.length - 1 }), { w: W - 1300, valign: VerticalAlign.CENTER }),
])));

const calendario = dataTable(
  ["Quando", "O quê", "Responsável"],
  [
    ["Dia 1", "Reunião de arranque: apresentação do documento e nomeação do ponto focal", "Midia Pro + Direcção-Geral"],
    ["Dias 2 a 5", "Preenchimento da Parte A pelos departamentos e recolha de evidências", "Ponto focal + departamentos"],
    ["Dias 3 a 8", "Entrevistas individuais da Parte B e observação das lojas", "Mirza Jamal (Midia Pro)"],
    ["Dia 9", "Revisão final pelo ponto focal e devolução do documento", "Ponto focal"],
    ["Até 48 h depois", "Consolidação e redacção do Plano Estratégico", "Planeamento estratégico (Midia Pro)"],
  ],
  [1900, 4938, 2800], { boldFirst: true, keep: true },
);

const guia = [
  ...H1("Guia de preenchimento", "Comece por aqui"),
  P("Este documento reúne, num só instrumento, o **Briefing de Cliente** e o **Modelo de Diagnóstico de Liderança** da Midia Pro. Pede apenas a informação **fundamental** para construirmos uma estratégia completa: posicionamento, comunicação, conteúdo, tráfego pago, vendas, tecnologia e liderança.", { after: 200 }),
  H2("1. Como o documento está organizado"),
  dataTable(["Parte", "Conteúdo", "Formato"], [
    ["A · Briefing Estratégico", "10 etapas, uma por área da empresa, com as perguntas que alimentam a estratégia.", "Formulário preenchido pelos departamentos"],
    ["B · Diagnóstico de Liderança", "Instrumento aplicado a cada líder: liderança, comunicação, métricas, follow-up, cultura e mudança.", "Entrevista individual de 45–60 min"],
    ["C · Consolidação", "Lista de evidências, matriz de análise e passagem do briefing para as equipas Midia Pro.", "Uso interno Midia Pro"],
  ], [2600, 4538, 2500], { boldFirst: true, keep: true }),
  spacer(200),
  H2("2. Passo a passo para o cliente"),
  ...numbered([
    "**Nomeie um ponto focal.** Uma pessoa coordena o preenchimento, distribui as etapas e devolve o documento completo.",
    "**Distribua cada etapa à área indicada.** Cada etapa começa com uma faixa azul que indica quem a deve preencher e o tempo estimado.",
    "**Leia a caixa \"Como fazer o diagnóstico nesta etapa\"** antes de responder. Explica o objectivo, onde está a informação e como levantá-la internamente.",
    "**Responda com factos e números.** Siga o \"Modelo aceite\" de cada campo e use dados dos últimos 6 a 12 meses sempre que possível.",
    "**Anexe as evidências** pedidas numa pasta partilhada, com nomes claros: HC_Etapa05_TabelaPrecos.pdf.",
    "**Não deixe campos em branco.** Se a informação não existir, escreva \"Não disponível\" e indique quem a pode ter. Isso também é um dado do diagnóstico.",
    "**Revisão final.** O ponto focal confirma que todos os campos obrigatórios (*) estão preenchidos e devolve o documento à Midia Pro.",
  ]),
  spacer(120),
  H2("3. Legenda"),
  legend,
  spacer(200),
  H2("4. Regras de ouro do diagnóstico"),
  callout("Percepção + evidência", [
    bullet("**Cruzar sempre percepção com evidência.** Uma resposta positiva sem processo, registo ou métrica que a comprove é assinalada como discrepância entre percepção e prática."),
    bullet("**Ser específico.** \"Vendemos bem\" não ajuda; \"vendemos 11,2 M MZN em Setembro, 86% da meta\" permite decidir."),
    bullet("**Comparar unidades.** As respostas das três lojas são comparadas para identificar diferenças de comunicação, atendimento e execução."),
    bullet("**Confidencialidade.** Os resultados são apresentados de forma consolidada, por dimensão, sem exposição individual."),
    bullet("**Sem procura de culpados.** O objectivo é identificar os pontos do sistema, dos processos e da liderança que precisam de intervenção."),
  ], { cantSplit: false }),
  spacer(200),
  H2("5. Calendário recomendado"),
  calendario,
  P("Calendário indicativo; é ajustado na reunião de arranque.", { size: 16, color: C.grey, before: 80 }),
];

// ---------- Parte A ----------
const parteA = [
  ...H1("Parte A · Briefing Estratégico", "Parte A"),
  P("As 10 etapas seguintes estão organizadas por área da empresa. Cada uma pode ser entregue ao departamento responsável e preenchida em paralelo. No final, o ponto focal reúne as respostas e confirma os campos obrigatórios.", { after: 200 }),
  dataTable(["Etapa", "O que a Midia Pro vai construir com esta informação"], [
    ["01 · Identificação & Visão", "Diagnóstico de contexto e definição do problema central"],
    ["02 · Público-Alvo", "Personas, segmentação de anúncios e mensagens por perfil"],
    ["03 · Posicionamento & Marca", "Posicionamento, tom de voz e linha criativa"],
    ["04 · Objectivos & Metas", "Metas SMART, KPIs e painel de resultados"],
    ["05 · Oferta & Pontos de Venda", "Oferta principal, promessa e calendário de campanhas"],
    ["06 · Comunicação & Conteúdo", "Plano editorial e dimensionamento da produção"],
    ["07 · Tráfego Pago & Funil", "Plano de media, orçamento e funil de conversão"],
    ["08 · Processo Comercial", "Processo de vendas, follow-up e argumentário"],
    ["09 · Tecnologia & Sistemas", "Plano técnico: web, automações e integrações"],
    ["10 · Aprovações & Materiais", "Fluxo de trabalho, aprovações e prazos"],
  ], [3600, W - 3600], { boldFirst: true }),
  ...STAGES.flatMap(stage),
];

// ---------- Parte B ----------
const parteB = [
  ...H1("Parte B · Diagnóstico de Liderança", "Parte B · RH & Cultura"),
  P("Esta componente avalia os factores internos que podem influenciar a consistência do atendimento, a comunicação, o acompanhamento comercial e os resultados das três lojas. É conduzida por **Mirza Jamal**, especialista subcontratada pela Midia Pro em cultura organizacional, liderança, comunicação interna, atendimento, vendas e relacionamento com o cliente.", { after: 160 }),
  P("As observações da reunião inicial são tratadas como **hipóteses** e validadas com entrevistas, evidências, observação dos processos e comparação entre as unidades.", { after: 200 }),
  H2("Objectivos do diagnóstico"),
  ...[
    "Avaliar o alinhamento entre Direcção, liderança intermédia e equipas operacionais.",
    "Identificar a clareza de papéis, responsabilidades, metas e mecanismos de responsabilização.",
    "Compreender como a comunicação interna flui entre as lojas e as áreas Comercial, Marketing e RH.",
    "Mapear o processo real de recepção, encaminhamento e follow-up de clientes e oportunidades.",
    "Avaliar a utilização de métricas na gestão das equipas e na tomada de decisão.",
    "Identificar gaps de liderança, cultura, comunicação e execução que afectem a experiência do cliente e os resultados.",
    "Produzir recomendações para uma intervenção posterior de alinhamento e capacitação.",
  ].map((t) => bullet(t)),
  spacer(160),
  H2("Metodologia"),
  dataTable(["Etapa", "Método", "Resultado esperado"], [
    ["1", "Entrevistas individuais", "Percepções, práticas e responsabilidades"],
    ["2", "Recolha de evidências", "Metas, relatórios, mapas de follow-up, CRM/Excel/WhatsApp ou outros registos"],
    ["3", "Observação das lojas e processos", "Diferenças de comunicação, atendimento e execução"],
    ["4", "Cruzamento de informação", "Convergências, discrepâncias e gaps"],
    ["5", "Relatório consolidado", "Prioridades, riscos e recomendações"],
  ], [900, 3400, W - 4300], { boldFirst: true }),
  spacer(200),
  callout("Como conduzir o diagnóstico de liderança", [
    kv("Quem responde", "Director-Geral, RH, responsáveis comerciais e lideranças das três lojas. **Um instrumento por pessoa.**"),
    kv("Formato", "Entrevista individual de 45 a 60 minutos, em local reservado. O instrumento pode ser enviado antes, mas as respostas são confirmadas na entrevista."),
    kv("Preparação do líder", "Trazer as metas e o resultado do último mês, o relatório de acompanhamento da equipa e o registo de follow-up que usa."),
    kv("Durante a entrevista", "Pedir exemplos concretos e pedir para **mostrar** os registos (\"mostre-me como acompanha os clientes que ainda não compraram\")."),
    kv("Depois", "Registar as evidências vistas e as discrepâncias no quadro do entrevistador (B9). Consolidar por dimensão na matriz da Parte C."),
  ]),
  // Instrumento
  new Paragraph({ pageBreakBefore: true, children: [], spacing: { before: 0, after: 0, line: 20, lineRule: "exact" } }),
  table([W], [row([cell([
    P("Instrumento individual de diagnóstico", { size: 28, bold: true, color: C.white, after: 40 }),
    P("Preencher um exemplar por líder · Respostas confidenciais, consolidadas por dimensão", { size: 17, color: C.sky, after: 0 }),
  ], { w: W, fill: C.navy, borders: allBorders(C.navy), margins: { top: 180, bottom: 180, left: 280, right: 200 } })])]),
  spacer(120),
  P("Respondente nº ______     Data da entrevista ____/____/______     Entrevistador(a) ___________________________", { size: 17, color: C.grey, after: 120 }),
  H3("B1 · Identificação"),
  ...field({ id: "B1.1", label: "Cargo e área / loja", type: "pair", labels: ["Cargo", "Área / Loja"] }),
  ...field({ id: "B1.2", label: "Experiência e equipa", type: "pair", labels: ["Tempo na empresa", "Nº de colaboradores sob a sua responsabilidade"] }),
  spacer(160),
  H3("B2 · Liderança e gestão da equipa"),
  P("Assinale de 1 a 5 o grau em que cada afirmação descreve a realidade actual da sua equipa.", { size: 17, color: C.grey, after: 100 }),
  likert(B2, "B2"),
  spacer(160),
  H3("B3 · Comunicação interna e alinhamento"),
  likert(B3, "B3"),
  ...openQ("B3.8", "Onde considera que ocorre actualmente a maior falha de comunicação interna?", 2),
  spacer(120),
  H3("B4 · Gestão comercial e métricas"),
  ...openQ("B4.1", "Quais são os cinco principais indicadores que utiliza para gerir a sua equipa?", 2),
  ...openQ("B4.2", "Qual era a meta da sua área no último mês e qual foi o resultado alcançado?", 1, "pedir para ver o relatório."),
  ...openQ("B4.3", "Qual é a taxa de conversão de clientes/leads em vendas?", 1),
  ...openQ("B4.4", "Quantos clientes/oportunidades estão actualmente em follow-up?", 1),
  ...openQ("B4.5", "Que percentagem recebe follow-up dentro do prazo definido?", 1),
  ...openQ("B4.6", "Quando os dados não estão disponíveis, como avalia o desempenho da sua equipa?", 2),
  spacer(120),
  H3("B5 · Jornada do cliente e follow-up"),
  ...openQ("B5.1", "Descreva o percurso de um cliente desde o primeiro contacto até à conclusão da compra.", 3),
  ...openQ("B5.2", "Quem recebe o lead ou contacto do cliente?", 1),
  ...openQ("B5.3", "Quem é responsável pelo primeiro contacto e em quanto tempo deve fazê-lo?", 1),
  ...openQ("B5.4", "Onde ficam registados os contactos, propostas e follow-ups?", 1),
  ...openQ("B5.5", "Quem verifica se o follow-up foi efectivamente realizado?", 1),
  ...openQ("B5.6", "O que acontece quando o follow-up não é realizado?", 1),
  ...openQ("B5.7", "Quando o cliente não compra, é registado o motivo? Como?", 1),
  ...openQ("B5.8", "Mostre, por favor, como acompanha actualmente os clientes que ainda não compraram.", 2, "registar o que foi efectivamente mostrado (ferramenta, actualização, responsável)."),
  spacer(120),
  H3("B6 · Cultura e responsabilização"),
  ...openQ("B6.1", "Quando uma meta não é atingida, qual é normalmente a primeira pergunta feita pela liderança?", 1),
  ...openQ("B6.2", "Quais considera serem as três principais causas da actual redução das vendas?", 2),
  ...openQ("B6.3", "Qual é a responsabilidade da liderança perante estes resultados?", 2),
  ...openQ("B6.4", "Qual é a responsabilidade dos colaboradores?", 2),
  new Paragraph({ keepNext: true, spacing: { before: 160, after: 60 }, indent: { left: 520, hanging: 520 }, tabStops: [{ type: TabStopType.LEFT, position: 520 }],
    children: [new TextRun({ text: "B6.5\t", bold: true, color: C.blue, size: 18, font: FONT }), ...runs("Que mudança deveria começar por…", { size: 19 })] }),
  table([2600, W - 2600], ["…pela Direcção", "…pelas lideranças intermédias", "…pelos colaboradores"].map((k) => row([
    cell(P(k, { size: 18, bold: true, color: C.navy, after: 0, keepNext: true }), { w: 2600, fill: C.tint, valign: VerticalAlign.CENTER }),
    cell(P("", { keepNext: true }), { w: W - 2600, fill: C.tint2 }),
  ], { height: 700 }))),
  spacer(120),
  H3("B7 · Abertura à mudança"),
  ...openQ("B7.1", "Nos últimos 12 meses, que mudança foi implementada na sua equipa e que resultados produziu?", 2),
  ...openQ("B7.2", "Quando recebe uma recomendação com a qual não concorda, como procede?", 2),
  ...openQ("B7.3", "Que mudança considera mais urgente na empresa?", 1),
  ...openQ("B7.4", "Que mudança considera menos prioritária neste momento? Porquê?", 1),
  new Paragraph({ keepNext: true, spacing: { before: 160, after: 80 }, indent: { left: 520, hanging: 520 }, tabStops: [{ type: TabStopType.LEFT, position: 520 }],
    children: [new TextRun({ text: "B7.5\t", bold: true, color: C.blue, size: 18, font: FONT }), ...runs("De 0 a 10, qual é a sua disponibilidade para alterar processos da sua área se os dados demonstrarem que o modelo actual não está a funcionar? (circule)", { size: 19 })] }),
  scaleRow(0, 10),
  spacer(120),
  H3("B8 · Desafio dos 90 dias"),
  ...openQ("B8.1", "Se amanhã assumisse a Direcção-Geral e tivesse 90 dias para melhorar os resultados, quais seriam as suas três primeiras decisões?", 3),
  ...openQ("B8.2", "Dessas três decisões, qual pode começar a implementar hoje, na função que já ocupa?", 2),
  spacer(200),
  H3("B9 · Quadro do entrevistador (uso Midia Pro)"),
  callout("Evidências vistas durante a entrevista", [
    optionsGrid(["Metas da equipa", "Relatório de resultados", "Mapa de follow-up", "CRM / Excel / WhatsApp", "Script de vendas", "Nenhuma evidência"], "□", 3),
    P("Discrepâncias entre percepção e prática:", { size: 17, bold: true, color: C.navy, before: 140, after: 60 }),
    answerBox(2, W - 440),
  ], { color: C.navy }),
];

// ---------- Parte C ----------
const tl = (label, fill, desc) => row([
  cell(P(label, { size: 17, bold: true, color: C.white, align: AlignmentType.CENTER, after: 0 }), { w: 1800, fill, borders: allBorders(fill), valign: VerticalAlign.CENTER }),
  cell(P(desc, { size: 18, after: 0 }), { w: W - 1800, valign: VerticalAlign.CENTER }),
]);
const parteC = [
  ...H1("Parte C · Consolidação", "Parte C · Uso interno Midia Pro"),
  P("Depois de recebido o briefing e concluídas as entrevistas, o responsável de planeamento estratégico consolida a informação e redige o **Plano Estratégico no prazo de 48 horas**.", { after: 200 }),
  H2("C1 · Matriz de análise da liderança"),
  P("Os resultados são consolidados por dimensão, sem avaliações pessoais nem exposição individual das respostas.", { size: 18, color: C.grey, after: 120 }),
  dataTable(["Dimensão", "Peso", "Critério", "Fonte", "Classificação"], [
    ["Liderança e responsabilização", "25%", "Clareza, acompanhamento, feedback e accountability", "B2 · B6", ""],
    ["Comunicação interna e alinhamento", "20%", "Consistência entre Direcção, áreas e lojas", "B3", ""],
    ["Gestão por métricas", "20%", "Disponibilidade e utilização de indicadores", "B4 · A04 · A08", ""],
    ["Gestão comercial e follow-up", "20%", "Processo, registo, controlo e continuidade", "B5 · A08", ""],
    ["Cultura e abertura à mudança", "15%", "Aprendizagem, colaboração e implementação", "B6 · B7 · B8", ""],
  ], [2700, 900, 3138, 1500, 1400], { boldFirst: true, rowHeight: 520 }),
  spacer(160),
  table([1800, W - 1800], [
    tl("VERDE", C.green, "Prática consolidada: confirmada por processo, registo ou métrica."),
    tl("AMARELO", C.amber, "Necessita de melhoria: existe, mas sem consistência entre lojas ou sem evidência completa."),
    tl("VERMELHO", C.red, "Gap crítico: não existe, ou a percepção declarada não corresponde à prática observada."),
  ]),
  spacer(120),
  callout("Nota metodológica", [P("A pontuação declarada deve ser sempre cruzada com evidências. Uma avaliação elevada sem processo, registo, métrica ou evidência correspondente deverá ser assinalada como **discrepância entre percepção e prática**.", { size: 18, after: 0 })], { color: C.amber, fill: "FFF7E6" }),
  spacer(200),
  H2("C2 · Hipóteses preliminares a validar"),
  dataTable(["Hipótese", "Confirmada", "Parcial", "Não confirmada"], [
    "Existem diferentes padrões de comunicação entre as três lojas.",
    "Clareza insuficiente sobre responsabilidades de follow-up.",
    "Disponibilidade e utilização efectiva de métricas comerciais e de atendimento.",
    "Integração entre o fluxo digital, as equipas comerciais e as lojas.",
    "Nível de alinhamento e abertura das lideranças intermédias às mudanças propostas.",
    "Distribuição de responsabilidades entre liderança e equipas perante a redução dos resultados.",
  ].map((h) => [h, "□", "□", "□"]), [5438, 1400, 1400, 1400], { keep: true }),
  spacer(200),
  H2("C3 · Checklist de evidências recebidas"),
  dataTable(["Evidência", "Etapa", "Recebida", "Observações"], [
    ["Organigrama e lista de lojas/colaboradores", "A01", "□", ""],
    ["Relatório de vendas 12 meses por loja", "A01 · A05", "□", ""],
    ["Estatísticas das redes sociais", "A02", "□", ""],
    ["Manual de marca / logótipo em alta", "A03 · A10", "□", ""],
    ["Mapa de metas do ano", "A04", "□", ""],
    ["Top 20 produtos e tabela de preços", "A05", "□", ""],
    ["Pasta de conteúdos existentes", "A06", "□", ""],
    ["Relatório de anúncios (6 meses)", "A07", "□", ""],
    ["Metas e resultados do último mês", "A08 · B4", "□", ""],
    ["Mapa / registo de follow-up", "A08 · B5", "□", ""],
    ["Script de vendas", "A08", "□", ""],
    ["Lista de sistemas e ferramentas", "A09", "□", ""],
  ], [4000, 1500, 1100, 3038]),
  spacer(200),
  H2("C4 · Do briefing à estratégia: quem usa o quê"),
  dataTable(["Equipa Midia Pro", "Etapas de referência", "Entregável"], [
    ["Planeamento Estratégico", "Todas", "Plano Estratégico consolidado (48 h)"],
    ["Copywriting", "A02 · A03 · A05", "Mensagens-chave, textos e argumentos de venda"],
    ["Design Gráfico", "A03 · A06", "Linha visual e peças"],
    ["Videomaking", "A03 · A06", "Guiões e plano de gravações"],
    ["Social Media", "A02 · A03 · A06", "Plano editorial e calendário"],
    ["Tráfego Pago", "A02 · A04 · A07", "Plano de media, públicos e orçamento"],
    ["Inside Sales", "A08 · B4 · B5", "Processo comercial, follow-up e argumentário"],
    ["Desenvolvimento Tecnológico", "A09", "Plano técnico, automações e integrações"],
    ["Formação e Liderança", "Parte B", "Workshop/palestra e formação de Atendimento, Vendas e Relacionamento"],
  ], [2900, 2300, W - 5200], { boldFirst: true }),
  spacer(200),
  H2("C5 · Entregáveis do diagnóstico"),
  ...[
    "Aplicação do instrumento de diagnóstico às lideranças definidas pela Midia Pro e pelo cliente.",
    "Mapa consolidado das cinco dimensões avaliadas.",
    "Identificação dos principais gaps e riscos organizacionais e comerciais.",
    "Mapeamento preliminar do fluxo de comunicação e follow-up.",
    "Recomendações de prioridades de intervenção.",
    "Base técnica para o workshop/palestra e a formação de Atendimento, Vendas e Relacionamento com o Cliente.",
  ].map((t) => bullet(t)),
  spacer(160),
  callout("Princípios de apresentação dos resultados", [P("Os resultados são apresentados de forma consolidada, factual e orientada para soluções. O diagnóstico não tem como finalidade procurar culpados, mas identificar os pontos do sistema, liderança, processos, comunicação, competências e acompanhamento que necessitam de intervenção para melhorar a experiência do cliente e apoiar a recuperação dos resultados.", { size: 18, after: 0 })]),
  spacer(240),
  H2("C6 · Validação"),
  table([Math.floor(W / 2) - 100, 200, W - Math.floor(W / 2) - 100], [row([
    cell([P("Pelo cliente", { size: 18, bold: true, color: C.navy, after: 160 }), ...["Nome", "Cargo", "Assinatura", "Data"].map((k) => P(k + ": ______________________________", { size: 18, color: C.grey, after: 200 }))], { w: Math.floor(W / 2) - 100, fill: C.tint2, margins: { top: 200, bottom: 120, left: 240, right: 200 } }),
    cell(P(""), { w: 200, borders: noBorders }),
    cell([P("Pela Midia Pro", { size: 18, bold: true, color: C.navy, after: 160 }), ...["Nome", "Cargo", "Assinatura", "Data"].map((k) => P(k + ": ______________________________", { size: 18, color: C.grey, after: 200 }))], { w: W - Math.floor(W / 2) - 100, fill: C.tint2, margins: { top: 200, bottom: 120, left: 240, right: 200 } }),
  ])]),
];

// ---------- Cabeçalho / rodapé ----------
const header = new Header({ children: [new Paragraph({
  children: [
    new ImageRun({ type: "png", data: logoNavy, transformation: { width: 62, height: Math.round(62 * LOGO_RATIO) } }),
    new TextRun({ children: [new PositionalTab({ alignment: PositionalTabAlignment.RIGHT, relativeTo: PositionalTabRelativeTo.MARGIN, leader: PositionalTabLeader.NONE })] }),
    new TextRun({ text: "Diagnóstico 360° Pro", bold: true, color: C.navy, size: 16, font: FONT }),
    new TextRun({ text: "  ·  Home Center", color: C.grey, size: 16, font: FONT }),
  ],
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.line, space: 6 } },
  spacing: { after: 0 },
})] });
const footer = new Footer({ children: [new Paragraph({
  border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.line, space: 6 } },
  children: [
    new TextRun({ text: "Midia Pro · Comunicação e Imagem", bold: true, color: C.navy, size: 14, font: FONT }),
    new TextRun({ text: "   Av. Vladimir Lenine nº 1895, R/C, Maputo · +258 85 589 0000 · info@midiapro.co.mz", color: C.grey, size: 14, font: FONT }),
    new TextRun({ children: [new PositionalTab({ alignment: PositionalTabAlignment.RIGHT, relativeTo: PositionalTabRelativeTo.MARGIN, leader: PositionalTabLeader.NONE })] }),
    new TextRun({ children: [PageNumber.CURRENT], bold: true, color: C.navy, size: 16, font: FONT }),
  ],
})] });

// ---------- Documento ----------
const doc = new Document({
  creator: "Midia Pro", title: "Diagnóstico 360° Pro · Briefing Estratégico & Diagnóstico de Liderança",
  description: "Modelo de recolha de briefing e diagnóstico de liderança · Midia Pro",
  fonts: [{ name: FONT, data: fs.readFileSync(path.join(DIR, "GoogleSans-Regular.ttf")), characterSet: CharacterSet.ANSI }],
  styles: {
    default: { document: { run: { font: FONT, size: 20, color: C.text } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 44, bold: true, color: C.navy, font: FONT }, paragraph: { spacing: { before: 0, after: 240 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: C.navy, font: FONT }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, color: C.blue, font: FONT }, paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
    ],
  },
  numbering: { config: [
    { reference: "bul", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 260 } }, run: { color: C.blue, font: FONT } } }] },
    { reference: "num", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 440, hanging: 340 } }, run: { color: C.blue, bold: true, font: FONT } } }] },
  ] },
  sections: [
    { properties: { page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: 0, bottom: 0, left: 0, right: 0, header: 0, footer: 0 } } }, children: cover },
    {
      properties: { page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: 1150, bottom: 1000, left: MARGIN, right: MARGIN, header: 450, footer: 400 }, pageNumbers: { start: 2 } } },
      headers: { default: header }, footers: { default: footer },
      children: [
        // Ficha e mapa (primeira página interior, sem quebra inicial)
        P("Antes de começar", { size: 18, bold: true, color: C.blue, caps: true, spacing: 40, after: 60 }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "Ficha do documento", font: FONT })], border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: C.navy, space: 6 } } }),
        ficha,
        spacer(300),
        H2("Mapa do diagnóstico"),
        P("Cada etapa corresponde a uma área da empresa e pode ser preenchida em paralelo pelo respectivo responsável.", { size: 18, color: C.grey, after: 120, keepNext: true }),
        mapa,
        ...guia, ...parteA, ...parteB, ...parteC,
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(OUT, buf); console.log("OK", OUT, buf.length); });
