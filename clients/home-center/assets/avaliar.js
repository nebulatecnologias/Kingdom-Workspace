/* Home Center — página pública de avaliação aberta pelo QR code de cada colaborador. */
(function () {
  'use strict';

  const CFG = window.HC_CONFIG || {};
  const LOJA = { angola: 'Av. de Angola', baia: 'Baía Mall', matola: 'Matola' };
  const FUNCAO = { vendedor: 'Atendimento e vendas', montagem: 'Entrega e montagem' };
  const CRIT = { vendedor: ['Simpatia e acolhimento', 'Conhecimento dos produtos', 'Rapidez e clareza'], montagem: ['Pontualidade', 'Cuidado com a casa', 'Qualidade da montagem'] };
  const PALAVRA = ['', 'Muito mau', 'Mau', 'Razoável', 'Bom', 'Excelente'];
  const main = document.getElementById('rate-main');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ic = (n) => '<span class="ms" aria-hidden="true">' + n + '</span>';
  const initials = (n) => n.split(/\s+/).filter((w) => /^[A-ZÀ-Ý]/.test(w)).slice(0, 2).map((w) => w[0]).join('');
  const primeiro = (n) => n.split(' ')[0];

  function sb(path, opt) {
    opt = opt || {};
    if (!CFG.supabaseUrl) return Promise.reject(new Error('sem configuração'));
    const headers = { apikey: CFG.supabaseKey };
    if (opt.body) { headers['Content-Type'] = 'application/json'; headers.Prefer = 'return=minimal'; }
    return fetch(CFG.supabaseUrl + '/rest/v1/' + path, { method: opt.method || 'GET', headers, body: opt.body ? JSON.stringify(opt.body) : undefined })
      .then((res) => {
        if (res.ok) return res.status === 201 || res.status === 204 ? null : res.json();
        return res.json().catch(() => ({})).then((j) => { const e = new Error(j.message || 'erro ' + res.status); e.status = res.status; throw e; });
      });
  }

  // Um aparelho avalia a mesma pessoa no máximo uma vez a cada 12 horas.
  const chave = (c) => 'hc-avaliado-' + c;
  const jaAvaliou = (c) => { try { const t = Number(localStorage.getItem(chave(c))); return !!t && Date.now() - t < 12 * 3600e3; } catch (e) { return false; } };
  const marcar = (c) => { try { localStorage.setItem(chave(c), String(Date.now())); } catch (e) { /* sem armazenamento */ } };

  function pedirCodigo(msg, valor) {
    document.title = 'Avalie o atendimento · Home Center';
    main.innerHTML = '<form class="rate-card" id="fc" novalidate><div class="rate-who"><span class="rate-qr">' + ic('qr_code_2') + '</span><h1>Avalie o atendimento</h1><p>Escreva o código que está no cartão do colaborador.</p></div>' +
      (msg ? '<div class="rate-err" role="alert">' + ic('error') + '<span>' + esc(msg) + '</span></div>' : '') +
      '<label class="tf"><span class="l">Código do colaborador</span><input id="code" name="code" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Por exemplo, HC-V001" value="' + esc(valor || '') + '"></label>' +
      '<button class="b b-f rate-go" type="submit"><span>Continuar</span>' + ic('arrow_forward') + '</button></form>';
    document.getElementById('fc').addEventListener('submit', (e) => {
      e.preventDefault();
      let c = document.getElementById('code').value.trim().toUpperCase().replace(/\s+/g, '');
      if (/^[VM]\d{3}$/.test(c)) c = 'HC-' + c;
      if (/^HC[VM]\d{3}$/.test(c)) c = 'HC-' + c.slice(2);
      if (!/^HC-[VM]\d{3}$/.test(c)) { pedirCodigo('O código tem o formato HC-V001 ou HC-M001.', c); document.getElementById('code').focus(); return; }
      history.replaceState(null, '', '?c=' + encodeURIComponent(c));
      procurar(c);
    });
  }

  function procurar(c) {
    main.innerHTML = '<div class="rate-card" aria-busy="true"><p class="muted rate-wait">A carregar…</p></div>';
    sb('hc_colaboradores?select=codigo,nome,funcao,loja,equipa&activo=eq.true&codigo=eq.' + encodeURIComponent(c))
      .then((rows) => rows[0] || null, () => {
        const seed = window.HC_SEED ? window.HC_SEED().colaboradores.find((x) => x.codigo === c) : null;
        if (seed) return Object.assign({ offline: true }, seed);
        throw new Error('sem ligação');
      })
      .then((col) => {
        if (!col) return pedirCodigo('Não encontrámos o código ' + c + '. Confirme o código no cartão.', c);
        if (jaAvaliou(col.codigo)) return obrigado(col, true);
        formulario(col);
      })
      .catch(() => pedirCodigo('Sem ligação à internet. Verifique a rede e tente de novo.', c));
  }

  const estrelas = (name, labelId) => '<div class="st-row" role="radiogroup" aria-labelledby="' + labelId + '">' + [1, 2, 3, 4, 5].map((i) => '<input type="radio" id="' + name + i + '" name="' + name + '" value="' + i + '"><label for="' + name + i + '">' + ic('star') + '<span class="sr">' + i + (i === 1 ? ' estrela' : ' estrelas') + ', ' + PALAVRA[i] + '</span></label>').join('') + '</div>';

  function formulario(col) {
    const mont = col.funcao === 'montagem';
    document.title = 'Avaliar ' + col.nome + ' · Home Center';
    main.innerHTML = '<form class="rate-card" id="f" novalidate>' +
      '<div class="rate-who"><span class="av" aria-hidden="true">' + esc(initials(col.nome)) + '</span><h1>' + esc(col.nome) + '</h1><p>' + FUNCAO[col.funcao] + (col.equipa ? ', equipa ' + col.equipa : '') + ' · ' + (LOJA[col.loja] || '') + '</p></div>' +
      '<div class="st-in big"><div class="st-q" id="q0">' + (mont ? 'Como correu a entrega e a montagem?' : 'Como foi o atendimento de ' + esc(primeiro(col.nome)) + '?') + '</div>' + estrelas('estrelas', 'q0') + '<div class="st-word" id="w-estrelas">Toque nas estrelas</div></div>' +
      '<div class="crit"><div class="st-q2">Em detalhe</div>' + CRIT[col.funcao].map((t, i) => '<div class="crit-r"><span id="q' + (i + 1) + '">' + t + '</span>' + estrelas('c' + (i + 1), 'q' + (i + 1)) + '</div>').join('') + '</div>' +
      '<div><label class="tf"><span class="l">Quer deixar um comentário? (opcional)</span><textarea name="comentario" rows="3" maxlength="500" aria-describedby="cc"></textarea></label><span class="hint" id="cc">0 de 500 caracteres</span></div>' +
      '<div class="rate-err" id="err" role="alert" hidden></div>' +
      '<button class="b b-f rate-go" type="submit">' + ic('send') + '<span>Enviar avaliação</span></button></form>';
    const f = document.getElementById('f');
    f.addEventListener('change', (e) => {
      if (e.target.type !== 'radio') return;
      const v = Number(e.target.value);
      f.querySelectorAll('input[name="' + e.target.name + '"] + label').forEach((l, i) => l.classList.toggle('on', i < v));
      if (e.target.name === 'estrelas') document.getElementById('w-estrelas').textContent = PALAVRA[v];
      document.getElementById('err').hidden = true;
    });
    f.addEventListener('input', (e) => { if (e.target.name === 'comentario') document.getElementById('cc').textContent = e.target.value.length + ' de 500 caracteres'; });
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const get = (n) => { const x = f.querySelector('input[name="' + n + '"]:checked'); return x ? Number(x.value) : null; };
      const d = { codigo: col.codigo, estrelas: get('estrelas'), c1: get('c1'), c2: get('c2'), c3: get('c3') };
      const falta = ['estrelas', 'c1', 'c2', 'c3'].filter((n) => !d[n]);
      const err = document.getElementById('err');
      if (falta.length) {
        err.innerHTML = ic('error') + '<span>' + (falta[0] === 'estrelas' ? 'Escolha as estrelas da nota geral.' : 'Responda às ' + (falta.length === 1 ? 'pergunta que falta' : falta.length + ' perguntas que faltam') + ' em «Em detalhe».') + '</span>';
        err.hidden = false;
        f.querySelector('input[name="' + falta[0] + '"]').focus();
        return;
      }
      const com = f.elements.comentario.value.trim();
      if (com) d.comentario = com;
      const btn = f.querySelector('.rate-go'), lbl = btn.querySelector('span:last-child');
      btn.disabled = true; lbl.textContent = 'A enviar…';
      sb('hc_avaliacoes', { method: 'POST', body: d }).then(() => { marcar(col.codigo); obrigado(col, false); }).catch((x) => {
        btn.disabled = false; lbl.textContent = 'Enviar avaliação';
        err.innerHTML = ic('error') + '<span>' + esc(x.status ? x.message : 'Sem ligação à internet. A sua avaliação não foi enviada; tente de novo.') + '</span>';
        err.hidden = false;
      });
    });
  }

  function obrigado(col, antes) {
    const p = esc(primeiro(col.nome));
    main.innerHTML = '<div class="rate-card rate-sent"><span class="rate-ok">' + ic('check') + '</span><h1>' + (antes ? 'Já avaliou ' + p + ' hoje' : 'Obrigado pela avaliação!') + '</h1><p>' + (antes ? 'A sua opinião já chegou à equipa da Home Center.' : 'A sua opinião chegou à equipa da Home Center e ajuda ' + p + ' a fazer ainda melhor.') + '</p><button type="button" class="b b-o" id="outra">Avaliar outro colaborador</button></div>';
    document.getElementById('outra').addEventListener('click', () => { history.replaceState(null, '', location.pathname); pedirCodigo(''); });
    main.querySelector('h1').focus && main.querySelector('h1').setAttribute('tabindex', '-1');
  }

  const c = (new URLSearchParams(location.search).get('c') || '').trim().toUpperCase();
  if (/^HC-[VM]\d{3}$/.test(c)) procurar(c); else pedirCodigo(c ? 'O código ' + c + ' não é válido.' : '', c);
})();
