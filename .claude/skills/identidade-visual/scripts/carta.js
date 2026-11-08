// Modelo de carta A4 vertical em PowerPoint (pptxgenjs). Chamado por papelaria.py com os dados em JSON.
const pptxgen = require("pptxgenjs");
const D = JSON.parse(process.argv[2]);
const mm = v => v / 25.4;
const pres = new pptxgen();
pres.defineLayout({ name: "A4", width: mm(210), height: mm(297) }); pres.layout = "A4";
pres.theme = { headFontFace: D.fam, bodyFontFace: D.fam };
pres.title = `Modelo de carta · ${D.nome}`; pres.company = D.nome.replace(/&/g, "&amp;"); pres.author = D.nome.replace(/&/g, "&amp;");
const ESQ = mm(20), LARG = mm(170);

function rodape() {
  const linha = (t, i, x, w, cor, align) => ({ text: { text: t, options: { x, y: mm(268.2 + i * 3.6), w, h: mm(3.4), fontSize: 7.6, color: cor, margin: 0, valign: "middle", align } } });
  const esq = [[D.nome, D.PRI], ...D.morada.map(t => [t, D.CIN])];
  return [
    { image: { path: D.canto, x: mm(108), y: mm(187), w: mm(102), h: mm(110) } },
    { line: { x: ESQ, y: mm(265.6), w: LARG, h: 0, line: { color: D.LIN, width: 0.75 } } },
    ...esq.map(([t, cor], i) => linha(t, i, ESQ, mm(95), cor, "left")),
    ...D.contactos.map((t, i) => linha(t, i, ESQ + mm(95), LARG - mm(95), D.CIN, "right")),
  ];
}
const corpo = (y, h) => ({ placeholder: { options: { name: "corpo", type: "body", x: ESQ, y, w: mm(166), h, fontSize: 10.5, color: D.TIN, lineSpacingMultiple: 1.35, paraSpaceAfter: 6, valign: "top", margin: 0 }, text: "Texto da carta" } });

pres.defineSlideMaster({ title: "Carta", background: { color: "FFFFFF" }, objects: [
  ...rodape(),
  { image: { path: D.logo, x: ESQ, y: mm(18), w: mm(74), h: mm(74) * D.logo_ratio } },
  { rect: { x: ESQ, y: mm(42), w: mm(14), h: mm(1.1), fill: { color: D.ACE }, line: { type: "none" } } },
  { placeholder: { options: { name: "data", type: "body", x: ESQ, y: mm(56), w: LARG, h: mm(7), fontSize: 10.5, color: D.CIN, align: "right", valign: "top", margin: 0 }, text: "Cidade, dia de mês de ano" } },
  { placeholder: { options: { name: "destinatario", type: "body", x: ESQ, y: mm(68), w: mm(110), h: mm(20), fontSize: 10.5, color: D.TIN, lineSpacingMultiple: 1.3, valign: "top", margin: 0 }, text: "Nome do destinatário" } },
  { placeholder: { options: { name: "assunto", type: "body", x: ESQ, y: mm(93), w: mm(166), h: mm(7), fontSize: 10.5, color: D.TIN, valign: "top", margin: 0 }, text: "Assunto" } },
  corpo(mm(106), mm(152)),
] });
pres.defineSlideMaster({ title: "Continuacao", background: { color: "FFFFFF" }, objects: [
  ...rodape(), { image: { path: D.simbolo, x: ESQ, y: mm(16), w: mm(9) / D.sim_ratio > mm(18) ? mm(18) : mm(9) / D.sim_ratio, h: mm(9) } }, corpo(mm(36), mm(222)),
] });

pres.addSection({ title: "Carta" });
let s = pres.addSlide({ masterName: "Carta", sectionTitle: "Carta" });
s.addText("Cidade, dia de mês de ano", { placeholder: "data" });
s.addText([{ text: "Nome do destinatário", options: { bold: true, breakLine: true } }, { text: "Cargo · Empresa", options: { breakLine: true } }, { text: "Endereço" }], { placeholder: "destinatario" });
s.addText([{ text: "Assunto: ", options: { bold: true } }, { text: "Assunto da carta" }], { placeholder: "assunto" });
s.addText([
  { text: "Exmo. Senhor,", options: { breakLine: true } },
  { text: "Texto da carta. Para uma carta nova, duplicar este diapositivo e substituir o texto.", options: { breakLine: true } },
  { text: "Com os melhores cumprimentos,", options: { breakLine: true } }, { text: " ", options: { breakLine: true } },
  { text: "Nome Apelido", options: { bold: true, breakLine: true } }, { text: "Cargo" },
], { placeholder: "corpo" });
s.addNotes("Primeira página. Se a carta continuar, usar um diapositivo com o esquema «Continuacao».");
s = pres.addSlide({ masterName: "Continuacao", sectionTitle: "Carta" });
s.addText("Continuação da carta: só o símbolo no topo e o mesmo rodapé.", { placeholder: "corpo" });
pres.writeFile({ fileName: D.saida }).then(() => console.log("carta ok"));
