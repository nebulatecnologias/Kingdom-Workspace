/*! Painel · recolha.js — envia formulários de um site para o painel de gestão.
 * Uso: <script src="/assets/painel-recolha.js" data-site="CHAVE_DO_SITE" data-api="https://<projecto>.supabase.co/functions/v1/painel-recolher" defer></script>
 * 1) Formulários com data-painel="cotacao|avaliacao|contacto|newsletter" são enviados automaticamente.
 *    Campos reconhecidos: nome, email, telefone, empresa, cargo, cidade, servico, assunto, mensagem, consentimento.
 *    Os restantes campos vão em «dados». Um campo escondido name="website" serve de armadilha para robôs.
 *    Eventos: «painel:enviado» e «painel:erro» no formulário.
 * 2) Ou chamar window.Painel.enviar({ tipo, nome, email, ... }) → Promise<{ ok }>.
 * Guarda a origem da primeira visita (UTM, referência e página de entrada) para atribuir o lead.
 */
(function () {
  'use strict';
  var tag = document.currentScript || document.querySelector('script[data-site][data-api]');
  if (!tag) return;
  var CHAVE = tag.getAttribute('data-site'), API = tag.getAttribute('data-api');
  var CONHECIDOS = ['nome', 'email', 'telefone', 'empresa', 'cargo', 'cidade', 'servico', 'assunto', 'mensagem', 'consentimento'];
  var K = 'painel-origem';

  function ler() { try { return JSON.parse(localStorage.getItem(K) || 'null'); } catch (e) { return null; } }
  function grava(v) { try { localStorage.setItem(K, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } }

  // Origem: guarda a primeira visita com UTM ou referência externa
  (function () {
    var q = new URLSearchParams(location.search), utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(function (k) { if (q.get(k)) utm[k] = q.get(k); });
    var ref = document.referrer && document.referrer.indexOf(location.host) === -1 ? document.referrer : '';
    var atual = ler();
    if (!atual || Object.keys(utm).length) grava({ utm: utm, referencia: ref || (atual && atual.referencia) || '', entrada: location.pathname, em: new Date().toISOString() });
  })();

  function origem(o) {
    var u = (o && o.utm) || {}, r = (o && o.referencia) || '';
    if (u.utm_source) return String(u.utm_source).toLowerCase();
    if (u.gclid) return 'google-ads';
    if (u.fbclid) return 'facebook';
    if (!r) return 'directo';
    var h = ''; try { h = new URL(r).hostname.replace(/^www\./, ''); } catch (e) { h = r; }
    if (/google\./.test(h)) return 'google';
    if (/bing\./.test(h)) return 'bing';
    if (/facebook\.|fb\./.test(h)) return 'facebook';
    if (/instagram\./.test(h)) return 'instagram';
    if (/linkedin\./.test(h)) return 'linkedin';
    if (/whatsapp|wa\.me/.test(h)) return 'whatsapp';
    return h;
  }

  function enviar(campos) {
    var o = ler() || {};
    var corpo = Object.assign({}, campos, {
      chave: CHAVE,
      pagina: location.pathname,
      utm: Object.assign({}, o.utm || {}, { referencia: o.referencia || '', entrada: o.entrada || '' }),
      origem: campos.origem || origem(o)
    });
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo), keepalive: true })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return r.ok && j.ok ? { ok: true } : { ok: false, erro: j.erro || ('HTTP ' + r.status) }; }); })
      .catch(function (e) { return { ok: false, erro: String(e) }; });
  }

  function doFormulario(f) {
    var d = { tipo: f.getAttribute('data-painel') || 'contacto', dados: {} };
    new FormData(f).forEach(function (v, k) {
      if (typeof v !== 'string') return;
      v = v.trim(); if (!v) return;
      if (k === 'website') { d.website = v; return; }
      if (CONHECIDOS.indexOf(k) > -1) d[k] = k === 'consentimento' ? true : v; else d.dados[k] = v;
    });
    return d;
  }

  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || !f.matches || !f.matches('form[data-painel]')) return;
    e.preventDefault();
    enviar(doFormulario(f)).then(function (r) {
      f.dispatchEvent(new CustomEvent(r.ok ? 'painel:enviado' : 'painel:erro', { detail: r, bubbles: true }));
      if (r.ok && f.hasAttribute('data-painel-limpar')) f.reset();
    });
  }, true);

  window.Painel = { enviar: enviar, origem: function () { return origem(ler()); } };
})();
