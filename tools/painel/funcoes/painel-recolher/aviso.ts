// Aviso por email à equipa quando alguém submete um formulário do site.
// Regras de email (não são as de uma página): tabelas, estilos em linha, cores por extenso,
// sempre claro, botões como células com cor de fundo, uma só imagem (o logótipo) com texto alternativo.

export interface Marca {
  principal?: string; acao?: string; fundo?: string; linha?: string; tinta?: string; cinza?: string;
  site?: string; logo?: string; logo_largura?: number; logo_altura?: number;
}
export interface Pedido {
  site: string; marca: Marca; tipo: string; assunto: string;
  nome: string | null; cargo: string | null; empresa: string | null; cidade: string | null;
  email: string | null; telefone: string | null; servico: string | null; mensagem: string | null;
  dados: Record<string, unknown>; pagina: string | null; origem: string | null; utm: Record<string, unknown>;
  quando: Date;
}

const LETRA = "'Google Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const esc = (t: unknown) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
const vazio = (v: unknown) => v === null || v === undefined || String(v).trim() === "";

const ACCAO: Record<string, string> = {
  cotacao: "pediu uma cotação", avaliacao: "pediu uma avaliação inicial", contacto: "enviou uma mensagem",
  newsletter: "subscreveu a newsletter", outro: "enviou um pedido",
};
const ROTULO: Record<string, string> = {
  cotacao: "Pedido de cotação", avaliacao: "Avaliação inicial", contacto: "Mensagem", newsletter: "Newsletter", outro: "Pedido",
};

/** Número só com algarismos, com o indicativo 258 quando parece um número moçambicano sem ele. */
export function numero(t: string | null): string | null {
  if (!t) return null;
  let d = t.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("00")) d = d.slice(2);
  else if (/^8[2-7]\d{7}$/.test(d)) d = "258" + d;
  return d.length >= 9 ? d : null;
}

function quandoTexto(d: Date) {
  const f = new Intl.DateTimeFormat("pt-PT", { timeZone: "Africa/Maputo", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.day} de ${p.month}, às ${p.hour}:${p.minute}`;
}

export function emailDeAviso(o: Pedido): { assunto: string; html: string; texto: string } {
  const M = { principal: "#2B2850", acao: "#D63E12", fundo: "#FAF9F5", linha: "#E8E4DC", tinta: "#1C1A30", cinza: "#5E5A75", ...o.marca };
  const quem = o.nome || o.email || "Alguém";
  const primeiro = (o.nome || "").trim().split(/\s+/)[0] || "";
  const accao = ACCAO[o.tipo] || ACCAO.outro;
  const tel = numero(o.telefone);
  const preferido = String(o.dados?.["Prefere ser contactado por"] || "").toLowerCase();
  const quando = quandoTexto(o.quando);

  // Assunto: o que é, de quem, sobre quê. Curto para caber no telemóvel.
  const assunto = o.tipo === "newsletter"
    ? `Newsletter · ${o.email}`
    : [ROTULO[o.tipo] || "Pedido", o.empresa || o.nome, o.servico].filter(Boolean).join(" · ");

  // Acções: a preferida primeiro e cheia; as outras em contorno.
  const respAssunto = encodeURIComponent(`${o.site}: ${ROTULO[o.tipo] || "o seu pedido"}${o.servico ? " · " + o.servico : ""}`);
  const respCorpo = encodeURIComponent(`Olá${primeiro ? " " + primeiro : ""},\n\n`);
  const waTexto = encodeURIComponent(`Olá${primeiro ? " " + primeiro : ""}, fala da ${o.site}. Recebemos o seu pedido no site${o.servico ? " sobre " + o.servico : ""}.`);
  const accoes: { id: string; texto: string; link: string }[] = [];
  if (tel) accoes.push({ id: "chamada", texto: "Ligar", link: `tel:+${tel}` });
  if (tel) accoes.push({ id: "whatsapp", texto: "WhatsApp", link: `https://wa.me/${tel}?text=${waTexto}` });
  if (o.email) accoes.push({ id: "email", texto: "Responder por email", link: `mailto:${o.email}?subject=${respAssunto}&body=${respCorpo}` });
  const iPref = Math.max(0, accoes.findIndex((a) => a.id === preferido));
  if (accoes.length) accoes.unshift(...accoes.splice(iPref, 1));

  // Botões como ligações em bloco em linha: no telemóvel passam para a linha de baixo em vez de alargar o email.
  const botao = (a: { texto: string; link: string }, cheio: boolean) =>
    `<a href="${esc(a.link)}" style="display:inline-block;margin:0 8px 10px 0;padding:13px 20px;border:1px solid ${cheio ? M.acao : M.linha};border-radius:999px;background:${cheio ? M.acao : "#FFFFFF"};font-family:${LETRA};font-size:15px;font-weight:500;line-height:20px;color:${cheio ? "#FFFFFF" : M.principal};text-decoration:none;white-space:nowrap;">${esc(a.texto)}</a>`;
  const barra = accoes.length ? `<div style="margin:22px 0 0;">${accoes.map((a, i) => botao(a, i === 0)).join("")}</div>` : "";

  const secao = (titulo: string, corpo: string) => `
    <tr><td style="padding:26px 0 0;">
      <h2 style="margin:0 0 10px;font-family:${LETRA};font-size:13px;font-weight:700;line-height:18px;letter-spacing:.02em;color:${M.cinza};">${titulo}</h2>
      ${corpo}
    </td></tr>`;
  const linhas = (pares: [string, string][]) => {
    const p = pares.filter(([, v]) => !vazio(v));
    if (!p.length) return "";
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${LETRA};border-top:1px solid ${M.linha};">${
      p.map(([r, v]) => `<tr>
        <td valign="top" style="width:40%;padding:11px 12px 11px 0;border-bottom:1px solid ${M.linha};font-size:14px;line-height:20px;color:${M.cinza};">${esc(r)}</td>
        <td valign="top" style="padding:11px 0;border-bottom:1px solid ${M.linha};font-size:15px;line-height:20px;color:${M.tinta};font-weight:500;">${v}</td>
      </tr>`).join("")}</table>`;
  };
  const link = (href: string, texto: string) => `<a href="${esc(href)}" style="color:${M.principal};text-decoration:underline;text-underline-offset:2px;">${esc(texto)}</a>`;

  const extra = Object.entries(o.dados || {}).filter(([k, v]) => !vazio(v) && !/^utm_/.test(k)) as [string, unknown][];
  const pedido = linhas([
    ["Serviço", esc(o.servico || (o.tipo === "newsletter" ? "" : "Ainda não sabe"))],
    ...extra.map(([k, v]) => [k, esc(v)] as [string, string]),
  ]);
  const contacto = linhas([
    ["Nome", esc(o.nome)], ["Cargo", esc(o.cargo)], ["Empresa", esc(o.empresa)], ["Cidade", esc(o.cidade)],
    ["Email", o.email ? link(`mailto:${o.email}`, o.email) : ""],
    ["Telefone", o.telefone ? (tel ? link(`tel:+${tel}`, o.telefone) : esc(o.telefone)) : ""],
  ]);
  const u = o.utm || {};
  const campanha = [u.utm_source, u.utm_medium, u.utm_campaign].filter(Boolean).map(String).join(" · ");
  let pagina = o.pagina || "";
  try { if (pagina) pagina = new URL(pagina, M.site || "https://example.com").pathname; } catch { /* fica como veio */ }
  const chegada = linhas([
    ["Página", pagina ? link((M.site || "") + pagina, pagina) : ""],
    ["Origem", esc(o.origem && o.origem !== "directo" ? o.origem : (campanha ? "" : "Direto"))],
    ["Campanha", esc(campanha)],
  ]);
  const mensagem = vazio(o.mensagem) ? "" : `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td bgcolor="${M.fundo}" style="background:${M.fundo};border-radius:12px;padding:16px 18px;font-family:${LETRA};font-size:16px;line-height:25px;color:${M.tinta};">${esc(o.mensagem).replace(/\n/g, "<br>")}</td>
    </tr></table>`;

  const sub = [o.cargo, o.empresa].filter(Boolean).map(esc).join(" · ");
  const preferencia = preferido && o.tipo !== "newsletter" ? ` · prefere ${esc(preferido === "chamada" ? "chamada" : preferido === "whatsapp" ? "WhatsApp" : "email")}` : "";
  const preheader = o.tipo === "newsletter" ? `${o.email} subscreveu a newsletter.` : [o.empresa, o.servico, String(o.dados?.["Para quando"] || "")].filter(Boolean).join(" · ") || `${quem} ${accao}.`;
  const logo = M.logo
    ? `<img src="${esc(M.logo)}" width="${M.logo_largura || 168}" height="${M.logo_altura || 30}" alt="${esc(o.site)}" style="display:block;border:0;outline:none;height:auto;max-width:${M.logo_largura || 168}px;font-family:${LETRA};font-size:16px;font-weight:700;color:${M.principal};">`
    : `<span style="font-family:${LETRA};font-size:17px;font-weight:700;color:${M.principal};">${esc(o.site)}</span>`;

  const html = `<!doctype html>
<html lang="pt-PT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${esc(assunto)}</title>
<style>@media (max-width:480px){.folha{padding:16px 10px 28px !important}.cartao{padding:24px 18px !important}.h1{font-size:23px !important;line-height:29px !important}}</style>
</head><body style="margin:0;padding:0;background:${M.fundo};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${M.fundo};font-size:1px;line-height:1px;">${esc(preheader)}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${M.fundo}" style="background:${M.fundo};">
<tr><td align="center" class="folha" style="padding:28px 16px 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
    <tr><td style="padding:0 4px 18px;">${logo}</td></tr>
    <tr><td class="cartao" bgcolor="#FFFFFF" style="background:#FFFFFF;border:1px solid ${M.linha};border-radius:16px;padding:32px 30px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${LETRA};">
        <tr><td>
          <h1 class="h1" style="margin:0;font-family:${LETRA};font-size:26px;font-weight:500;line-height:32px;letter-spacing:-.02em;color:${M.tinta};">${esc(quem)} ${accao}</h1>
          ${sub ? `<p style="margin:6px 0 0;font-family:${LETRA};font-size:16px;line-height:22px;color:${M.tinta};">${sub}</p>` : ""}
          <p style="margin:8px 0 0;font-family:${LETRA};font-size:14px;line-height:20px;color:${M.cinza};">${esc(quando)}${preferencia}</p>
          ${barra}
        </td></tr>
        ${mensagem ? secao(o.tipo === "avaliacao" || o.tipo === "cotacao" ? "O que quer resolver" : "Mensagem", mensagem) : ""}
        ${pedido ? secao("O pedido", pedido) : ""}
        ${contacto ? secao("Contacto", contacto) : ""}
        ${chegada ? secao("Como chegou ao site", chegada) : ""}
        ${o.email ? `<tr><td style="padding:24px 0 0;font-family:${LETRA};font-size:14px;line-height:21px;color:${M.cinza};">Responda a este email para escrever diretamente a ${esc(primeiro || o.email)}: a resposta vai para ${esc(o.email)}.</td></tr>` : ""}
      </table>
    </td></tr>
    <tr><td align="center" style="padding:18px 8px 0;font-family:${LETRA};font-size:12.5px;line-height:18px;color:${M.cinza};">Aviso automático do site ${esc((M.site || "").replace(/^https?:\/\//, ""))}. O pedido fica também guardado no painel.</td></tr>
  </table>
</td></tr></table></body></html>`;

  const t = (pares: [string, unknown][]) => pares.filter(([, v]) => !vazio(v)).map(([k, v]) => `${k}: ${v}`).join("\n");
  const texto = [
    `${quem} ${accao}`, sub.replace(/&amp;/g, "&"), `${quando}${preferencia}`, "",
    o.mensagem ? `O que quer resolver:\n${o.mensagem}\n` : "",
    t([["Serviço", o.servico], ...extra]), "",
    t([["Nome", o.nome], ["Cargo", o.cargo], ["Empresa", o.empresa], ["Cidade", o.cidade], ["Email", o.email], ["Telefone", o.telefone]]), "",
    t([["Página", pagina], ["Origem", o.origem], ["Campanha", campanha]]),
    tel ? `\nLigar: tel:+${tel}\nWhatsApp: https://wa.me/${tel}` : "",
  ].filter((x) => x !== undefined).join("\n").replace(/\n{3,}/g, "\n\n").trim();

  return { assunto, html, texto };
}
