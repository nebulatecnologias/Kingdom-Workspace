// Painel · envia um email a um contacto a partir do painel (via Resend) e regista-o na ficha.
import { createClient } from "jsr:@supabase/supabase-js@2";

const URL_ = Deno.env.get("SUPABASE_URL")!;
const admin = createClient(URL_, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  const resp = (status: number, corpo: unknown) => new Response(JSON.stringify(corpo), { status, headers: { ...cors, "Content-Type": "application/json" } });
  const jwt = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const { data: u } = await admin.auth.getUser(jwt);
  if (!u?.user) return resp(401, { erro: "sessão inválida" });

  let d: Record<string, any>;
  try { d = await req.json(); } catch { return resp(400, { erro: "pedido inválido" }); }
  const { site_id, para, assunto, corpo } = d;
  if (!site_id || !para || !assunto || !corpo) return resp(400, { erro: "faltam campos" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(para))) return resp(400, { erro: "email do destinatário inválido" });

  const { data: m } = await admin.from("painel_membros").select("papel").eq("site_id", site_id).eq("user_id", u.user.id).maybeSingle();
  if (!m) return resp(403, { erro: "sem acesso a este site" });
  const { data: site } = await admin.from("painel_sites").select("nome, email_remetente, nome_remetente").eq("id", site_id).single();

  const RESEND = Deno.env.get("RESEND_API_KEY");
  if (!RESEND || !site?.email_remetente) return resp(400, { erro: "dominio_nao_configurado: o envio de email ainda não está configurado para este site" });

  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1b1b1f">${esc(String(corpo)).replace(/\n/g, "<br>")}</div>`;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: `${site.nome_remetente || site.nome} <${site.email_remetente}>`, to: [para], reply_to: site.email_remetente, subject: String(assunto).slice(0, 200), text: String(corpo), html }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const txt = JSON.stringify(j);
    return resp(502, { erro: /domain|verify|not verified/i.test(txt) ? "dominio_nao_configurado: o domínio de envio ainda não está verificado na Resend" : "falha no envio: " + (j.message || r.status) });
  }

  await admin.from("painel_actividades").insert({
    site_id, contacto_id: d.contacto_id || null, oportunidade_id: d.oportunidade_id || null, tipo: "email",
    texto: String(assunto).slice(0, 200), dados: { para, corpo: String(corpo).slice(0, 10000), resend_id: j.id, mensagem_id: d.mensagem_id || null }, autor: u.user.id,
  });
  if (d.mensagem_id) await admin.from("painel_mensagens").update({ respondida_em: new Date().toISOString(), estado: "lida" }).eq("id", d.mensagem_id).eq("site_id", site_id);
  return resp(200, { ok: true, id: j.id });
});
