/* Home Center (protótipo): avaliações por QR com nome e e-mail do cliente.

   Duas acções, chamadas pela página pública avaliar.html:
   - «enviar»: grava a avaliação como pendente (hc_enviar_avaliacao), junta-a ao
     cliente do e-mail e manda um e-mail com o link de confirmação.
   - «confirmar»: o cliente abriu o link e carregou no botão; a avaliação passa
     a contar nos rankings (hc_confirmar_avaliacao).

   REGRAS:
   1. A base só guarda o hash do código do link; o código só existe no e-mail.
   2. O link volta sempre para o site do protótipo (HC_SITE), nunca para um
      endereço que venha do browser.
   3. O e-mail não repete o que o cliente escreveu, além do primeiro nome:
      assim o formulário não serve para mandar texto a terceiros.
   4. Limites na base: 200 avaliações por dia no total, 5 por e-mail, uma por
      colaborador e e-mail por dia. */
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SITE = (Deno.env.get('HC_SITE') || 'https://home-center-dashboard-gestao.vercel.app').replace(/\/+$/, '');
const REMETENTE = Deno.env.get('HC_REMETENTE') || 'Home Center (demonstração) <homecenter@kingdomcompny.com>';
const LOJA: Record<string, string> = { angola: 'Av. de Angola', baia: 'Baía Mall', matola: 'Matola' };

function json(corpo: unknown, estado = 200) {
  return new Response(JSON.stringify(corpo), { status: estado, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

const escapar = (t: unknown) => String(t ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const nota = (v: unknown) => { const n = Number(v); return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null; };

/* «a•••@example.com», como no dashboard. */
const mascarar = (e: string) => { const [u, d] = e.split('@'); return (u[0] || '') + '•••@' + d; };

/* O primeiro nome, sem nada que pareça uma ligação. */
const primeiro = (n: string) => (String(n).trim().split(/\s+/)[0] || '').replace(/[^\p{L}\p{M}'-]/gu, '').slice(0, 30);

function carta(o: { nome: string; colaborador: string; funcao: string; loja: string; estrelas: number; link: string }) {
  const quem = o.funcao === 'montagem' ? 'a entrega e montagem de ' + o.colaborador : 'o atendimento de ' + o.colaborador;
  const LETRA = `'Google Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif`;
  const link = escapar(o.link);
  return `<!doctype html>
<html lang="pt-PT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>Confirme a sua avaliação</title>
</head>
<body style="margin:0;padding:0;background:#F6F2F1;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#F6F2F1;font-size:1px;line-height:1px;">Falta um clique para a sua avaliação contar.&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#F6F2F1" style="background:#F6F2F1;">
  <tr><td align="center" style="padding:32px 16px 40px;font-family:${LETRA};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
      <tr><td style="padding:0 4px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:10px;vertical-align:middle;"><img src="${SITE}/assets/logo.png" width="22" height="35" alt="" style="display:block;border:0;"></td>
          <td style="vertical-align:middle;font-family:${LETRA};font-size:15px;font-weight:500;color:#231918;">Home Center</td>
        </tr></table>
      </td></tr>
      <tr><td bgcolor="#FFFFFF" style="background:#FFFFFF;border:1px solid #EDE0DE;border-radius:16px;padding:32px 30px;font-family:${LETRA};">
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:500;line-height:1.28;color:#231918;">Confirme a sua avaliação</h1>
        <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#534341;">Olá${o.nome ? ' ' + escapar(o.nome) : ''},</p>
        <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#534341;">Recebemos a sua avaliação de <b>${o.estrelas} ${o.estrelas === 1 ? 'estrela' : 'estrelas'}</b> para ${escapar(quem)}, da loja ${escapar(o.loja)}. Para que conte nos resultados da equipa, confirme que foi você a enviá-la.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px;"><tr>
          <td align="center" bgcolor="#D7383E" style="background:#D7383E;border-radius:999px;">
            <a href="${link}" style="display:inline-block;padding:14px 26px;font-family:${LETRA};font-size:15px;font-weight:500;line-height:1.2;color:#FFFFFF;text-decoration:none;border-radius:999px;">Confirmar a avaliação</a>
          </td></tr></table>
        <p style="margin:0 0 14px;font-size:13px;line-height:1.6;color:#6F5F5D;">O link vale 7 dias. Se não foi você a avaliar, ignore este e-mail: a avaliação não conta.</p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#6F5F5D;">Se o botão não abrir, copie este link para o browser:<br><a href="${link}" style="color:#B3262D;text-decoration:underline;word-break:break-all;">${link}</a></p>
      </td></tr>
      <tr><td style="padding:16px 4px 0;font-family:${LETRA};font-size:12px;line-height:1.6;color:#6F5F5D;">
        Protótipo de demonstração da Home Center, com dados fictícios. Recebe este e-mail porque este endereço foi usado para avaliar um colaborador.
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Método não suportado.' }, 405);

  let corpo: Record<string, unknown> = {};
  try { corpo = await req.json(); } catch { return json({ error: 'Pedido inválido.' }, 400); }

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  /* Os erros da base com código P0001 são frases para o cliente; os outros não. */
  const falha = (e: { code?: string; message?: string }, onde: string) => {
    if (e.code === 'P0001') return json({ error: e.message }, 400);
    console.error(onde, e.code, (e.message || '').slice(0, 200));
    return json({ error: 'Não foi possível concluir agora. Tente daqui a pouco.' }, 500);
  };

  if (corpo.accao === 'confirmar') {
    const token = String(corpo.token ?? '');
    if (!/^[0-9a-f]{64}$/.test(token)) return json({ error: 'Este link de confirmação não é válido.' }, 400);
    const { data, error } = await admin.rpc('hc_confirmar_avaliacao', { p_token: token });
    if (error) return falha(error, 'confirmar');
    const r = (data as Record<string, unknown>[])[0];
    return json({ ok: true, colaborador: primeiro(String(r.colaborador_nome)), cliente: primeiro(String(r.cliente_nome)), ja_estava: !!r.ja_estava });
  }

  if (corpo.accao !== 'enviar') return json({ error: 'Pedido inválido.' }, 400);

  const codigo = String(corpo.codigo ?? '').trim().toUpperCase();
  const [estrelas, c1, c2, c3] = [corpo.estrelas, corpo.c1, corpo.c2, corpo.c3].map(nota);
  const nome = String(corpo.nome ?? '').trim().replace(/\s+/g, ' ');
  const email = String(corpo.email ?? '').trim().toLowerCase();
  const comentario = String(corpo.comentario ?? '').trim().slice(0, 500);
  if (!/^HC-[VM]\d{3}$/.test(codigo)) return json({ error: 'Não encontrámos este colaborador.' }, 400);
  if (!estrelas || !c1 || !c2 || !c3) return json({ error: 'Responda a todas as perguntas com estrelas.' }, 400);
  if (nome.length < 2 || nome.length > 80) return json({ error: 'Escreva o seu nome.' }, 400);
  if (corpo.consentimento !== true) return json({ error: 'Para enviar, aceite que a Home Center guarde o seu nome e e-mail.' }, 400);

  const { data, error } = await admin.rpc('hc_enviar_avaliacao', {
    p_codigo: codigo, p_estrelas: estrelas, p_c1: c1, p_c2: c2, p_c3: c3,
    p_comentario: comentario || null, p_nome: nome, p_email: email,
  });
  if (error) return falha(error, 'enviar');
  const r = (data as Record<string, string>[])[0];

  const { data: col } = await admin.from('hc_colaboradores').select('loja').eq('codigo', codigo).single();
  const link = `${SITE}/avaliar.html?confirmar=${r.token}`;
  const chave = Deno.env.get('RESEND_API_KEY');
  let enviado = false;
  if (!chave) {
    console.error('hc-avaliacao: sem RESEND_API_KEY, o e-mail não sai');
  } else {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: REMETENTE,
        to: [email],
        subject: 'Confirme a sua avaliação · Home Center',
        html: carta({ nome: primeiro(r.cliente_nome), colaborador: r.colaborador_nome, funcao: r.colaborador_funcao, loja: LOJA[String(col?.loja)] || '', estrelas, link }),
      }),
    });
    enviado = res.ok;
    if (!res.ok) console.error('hc-avaliacao: o Resend recusou', res.status, (await res.text()).slice(0, 200));
  }
  if (!enviado) {
    /* Sem e-mail não há confirmação possível: a avaliação sai, para o cliente poder tentar de novo. */
    await admin.from('hc_eventos').delete().eq('tipo', 'avaliacao_qr').eq('referencia', 'QR-' + r.avaliacao_id);
    await admin.from('hc_avaliacoes').delete().eq('id', r.avaliacao_id);
    return json({ error: 'Não conseguimos enviar o e-mail de confirmação. A avaliação não foi guardada; tente de novo daqui a pouco.' }, 502);
  }
  await admin.rpc('hc_marcar_envio', { p_avaliacao: r.avaliacao_id, p_ok: true });
  return json({ ok: true, email: mascarar(email) });
});
