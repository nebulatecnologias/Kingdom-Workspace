// Modelo de carta Kingdom Company em PowerPoint (A4 vertical), com dois esquemas:
// «Carta» (1.ª página, logótipo completo) e «Continuação» (só o símbolo).
// Uso: NODE_PATH=<node_modules com pptxgenjs> node tools/marca/carta-pptx.js <saida.pptx>
const path = require("path");
const pptxgen = require("pptxgenjs");
const { applyTheme } = require(process.env.APPLY_THEME);   // scripts/apply_theme.js da skill pptx
const RAIZ = path.resolve(__dirname, "../..");
const LOGO = path.join(RAIZ, "docs/marca/logotipo/png/kingdom-company-horizontal-indigo.png");
const SIMBOLO = path.join(RAIZ, "docs/marca/logotipo/png/kingdom-simbolo-indigo.png");
const CANTO = path.join(RAIZ, "docs/marca/papelaria/recursos/globo-canto.png");
const mm = v => v / 25.4;

const THEME = {
  name: "Kingdom Company", headFontFace: "Google Sans", bodyFontFace: "Google Sans",
  colors: { dk1: "1C1A30", lt1: "FFFFFF", dk2: "2B2850", lt2: "FAF9F5",
    accent1: "FF521A", accent2: "2B2850", accent3: "6A6682", accent4: "D63E12", accent5: "E8E4DC", accent6: "37336A",
    hlink: "D63E12", folHlink: "6A6682" },
};
const pres = new pptxgen();
pres.defineLayout({ name: "A4", width: mm(210), height: mm(297) });
pres.layout = "A4";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Modelo de carta · Kingdom Company"; pres.company = "Kingdom Company"; pres.author = "Kingdom Company";
const C = pres.SchemeColor;
const ESQ = mm(20), LARG = mm(170);

function rodape() {
  return [
    { image: { path: CANTO, x: mm(108), y: mm(187), w: mm(102), h: mm(110) } },
    { line: { x: ESQ, y: mm(279.6), w: LARG, h: 0, line: { color: "E8E4DC", width: 0.75 } } },
    { text: { text: "Kingdom Company", options: { x: ESQ, y: mm(281.2), w: mm(60), h: mm(5), fontSize: 7.6, color: C.text2, margin: 0, valign: "middle" } } },
    { text: { text: "+258 85 1800 920  ·  kingdomcompny.com  ·  Maputo, Moçambique", options: { x: ESQ + mm(60), y: mm(281.2), w: LARG - mm(60), h: mm(5), fontSize: 7.6, color: C.accent3, align: "right", margin: 0, valign: "middle" } } },
  ];
}
const corpo = (y, h) => ({ placeholder: { options: { name: "corpo", type: "body", x: ESQ, y, w: mm(166), h, fontSize: 10.5, color: C.text1, lineSpacingMultiple: 1.35, paraSpaceAfter: 6, valign: "top", margin: 0 }, text: "Texto da carta" } });

pres.defineSlideMaster({
  title: "Carta", background: { color: "FFFFFF" },
  objects: [
    ...rodape(),
    { image: { path: LOGO, x: ESQ, y: mm(18), w: mm(74), h: mm(74) * 120 / 671.44 } },
    { rect: { x: ESQ, y: mm(42), w: mm(14), h: mm(1.1), fill: { color: C.accent1 }, line: { type: "none" } } },
    { placeholder: { options: { name: "data", type: "body", x: ESQ, y: mm(56), w: LARG, h: mm(7), fontSize: 10.5, color: C.accent3, align: "right", valign: "top", margin: 0 }, text: "Maputo, dia de mês de ano" } },
    { placeholder: { options: { name: "destinatario", type: "body", x: ESQ, y: mm(68), w: mm(110), h: mm(20), fontSize: 10.5, color: C.text1, lineSpacingMultiple: 1.3, valign: "top", margin: 0 }, text: "Nome do destinatário" } },
    { placeholder: { options: { name: "assunto", type: "body", x: ESQ, y: mm(93), w: mm(166), h: mm(7), fontSize: 10.5, color: C.text1, valign: "top", margin: 0 }, text: "Assunto" } },
    corpo(mm(106), mm(165)),
  ],
});
pres.defineSlideMaster({
  title: "Continuacao", background: { color: "FFFFFF" },
  objects: [
    ...rodape(),
    { image: { path: SIMBOLO, x: ESQ, y: mm(16), w: mm(9), h: mm(9) } },
    corpo(mm(36), mm(232)),
  ],
});

pres.addSection({ title: "Carta" });
let s = pres.addSlide({ masterName: "Carta", sectionTitle: "Carta" });
s.addText("Maputo, 9 de novembro de 2026", { placeholder: "data" });
s.addText([
  { text: "Nome do destinatário", options: { bold: true, breakLine: true } },
  { text: "Cargo · Empresa", options: { breakLine: true } },
  { text: "Endereço" },
], { placeholder: "destinatario" });
s.addText([{ text: "Assunto: ", options: { bold: true } }, { text: "Proposta de acompanhamento estratégico" }], { placeholder: "assunto" });
s.addText([
  { text: "Exmo. Senhor,", options: { breakLine: true } },
  { text: "Na sequência da nossa conversa, enviamos a proposta de acompanhamento para os próximos seis meses. O objetivo é dar à vossa equipa comercial uma estrutura clara de vendas, com metas, rotinas e indicadores que a direção consiga acompanhar todas as semanas.", options: { breakLine: true } },
  { text: "A proposta inclui o diagnóstico inicial, o plano de ação e as sessões de acompanhamento. Os valores e o calendário seguem em anexo.", options: { breakLine: true } },
  { text: "Ficamos à disposição para qualquer esclarecimento.", options: { breakLine: true } },
  { text: "Com os melhores cumprimentos,", options: { breakLine: true } },
  { text: " ", options: { breakLine: true } },
  { text: "Nome Apelido", options: { bold: true, breakLine: true } },
  { text: "Cargo · Kingdom Company" },
], { placeholder: "corpo" });
s.addNotes("Primeira página. Para uma carta nova, duplicar este diapositivo e substituir o texto. Se a carta tiver mais de uma página, continuar num diapositivo com o esquema «Continuacao».");

s = pres.addSlide({ masterName: "Continuacao", sectionTitle: "Carta" });
s.addText("Continuação da carta. Este esquema é usado a partir da segunda página: só leva o símbolo no topo e o mesmo rodapé.", { placeholder: "corpo" });

(async () => {
  const out = process.argv[2];
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log("ok", out);
})();
