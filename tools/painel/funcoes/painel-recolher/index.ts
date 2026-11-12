// Painel · recebe os formulários dos sites (chamado pelo recolha.js). Sem JWT: valida a chave e a origem.
import { createClient } from "jsr:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const TIPOS = ["cotacao", "avaliacao", "contacto", "newsletter", "outro"];
const corta = (v: unknown, n = 500) => (typeof v === "string" ? v.trim().slice(0, n) : null) || null;

function origemAutorizada(origin: string, lista: string[]): boolean {
  return lista.some((p) => {
    if (p === origin) return true;
    if (!p.includes("*")) return false;
    const re = new RegExp("^" + p.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\/]/g, "\\$&")).join("[a-z0-9-]+") + "$");
    return re.test(origin);
  });
}

async function hash(t: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
  return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("");
}

function cors(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const h = { ...cors(origin), "Content-Type": "application/json" };
  const resp = (status: number, corpo: unknown) => new Response(JSON.stringify(corpo), { status, headers: h });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== "POST") return resp(405, { erro: "método" });

  let d: Record<string, any>;
  try { d = await req.json(); } catch { return resp(400, { erro: "pedido inválido" }); }
  if (typeof d.chave !== "string") return resp(400, { erro: "sem chave" });

  const { data: site } = await db.from("painel_sites").select("id, nome, origens, email_remetente, nome_remetente").eq("chave", d.chave).maybeSingle();
  if (!site) return resp(403, { erro: "site desconhecido" });
  if (!origin || !origemAutorizada(origin, site.origens || [])) return resp(403, { erro: "origem não autorizada" });

  // Armadilha para robôs: responde como se tivesse corrido bem
  if (d.website) return resp(200, { ok: true });

  const email = corta(d.email, 200)?.toLowerCase() || null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return resp(400, { erro: "email inválido" });
  const tipo = TIPOS.includes(d.tipo) ? d.tipo : "contacto";
  if (!email && !corta(d.telefone)) return resp(400, { erro: "falta email ou telefone" });

  // Limite: 6 envios por IP e site em 10 minutos
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "desconhecido";
  const ipHash = await hash(ip + "|" + site.id);
  const desde = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await db.from("painel_envios").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("criado_em", desde);
  if ((count || 0) >= 6) return resp(429, { erro: "demasiados envios" });
  await db.from("painel_envios").insert({ site_id: site.id, ip_hash: ipHash });

  const campos = {
    nome: corta(d.nome, 160), telefone: corta(d.telefone, 40), empresa: corta(d.empresa, 160),
    cargo: corta(d.cargo, 120), cidade: corta(d.cidade, 120),
  };
  const utm = d.utm && typeof d.utm === "object" ? d.utm : {};
  const consentimento = tipo === "newsletter" || d.consentimento === true;

  // Contacto: um por email e site; completa os campos que faltam sem apagar os que existem
  let contactoId: string | null = null;
  let existente: any = null;
  if (email) {
    const r = await db.from("painel_contactos").select("*").eq("site_id", site.id).ilike("email", email).maybeSingle();
    existente = r.data;
  }
  if (existente) {
    const upd: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(campos)) if (v && !existente[k]) upd[k] = v;
    if (consentimento && !existente.consentimento) upd.consentimento = true;
    if (tipo === "newsletter" && !(existente.etiquetas || []).includes("newsletter")) upd.etiquetas = [...(existente.etiquetas || []), "newsletter"];
    if (Object.keys(upd).length) await db.from("painel_contactos").update(upd).eq("id", existente.id);
    contactoId = existente.id;
  } else {
    const { data: novo, error } = await db.from("painel_contactos").insert({
      site_id: site.id, email, ...campos, origem: corta(d.origem, 80) || "directo", utm, consentimento,
      etiquetas: tipo === "newsletter" ? ["newsletter"] : [],
    }).select("id").single();
    if (error) return resp(500, { erro: "não foi possível guardar" });
    contactoId = novo.id;
  }

  const dados = d.dados && typeof d.dados === "object" ? d.dados : {};
  const servico = corta(d.servico, 160);
  const assunto = corta(d.assunto, 200) || [{ cotacao: "Pedido de cotação", avaliacao: "Avaliação inicial", contacto: "Contacto", newsletter: "Subscrição da newsletter", outro: "Mensagem" }[tipo], servico, campos.empresa].filter(Boolean).join(" · ");
  const { data: msg, error: e2 } = await db.from("painel_mensagens").insert({
    site_id: site.id, contacto_id: contactoId, tipo, servico, assunto,
    corpo: corta(d.mensagem, 5000), dados, pagina: corta(d.pagina, 300),
  }).select("id").single();
  if (e2) return resp(500, { erro: "não foi possível guardar" });
  await db.from("painel_actividades").insert({ site_id: site.id, contacto_id: contactoId, tipo: "mensagem", texto: assunto, dados: { mensagem_id: msg.id, origem: d.origem || null } });

  // Aviso por email à equipa (quando a Resend está configurada)
  const RESEND = Deno.env.get("PAINEL_RESEND_API_KEY");
  if (RESEND && site.email_remetente && tipo !== "newsletter") {
    const linhas = [assunto, "", `Nome: ${campos.nome || "-"}`, `Empresa: ${campos.empresa || "-"}`, `Email: ${email || "-"}`, `Telefone: ${campos.telefone || "-"}`, "", corta(d.mensagem, 5000) || "", ...Object.entries(dados).map(([k, v]) => `${k}: ${v}`)];
    fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: `${site.nome_remetente || site.nome} <${site.email_remetente}>`, to: [site.email_remetente], reply_to: email || undefined, subject: `Novo pedido no site: ${assunto}`, text: linhas.join("\n") }),
    }).catch(() => {});
  }

  return resp(200, { ok: true });
});
