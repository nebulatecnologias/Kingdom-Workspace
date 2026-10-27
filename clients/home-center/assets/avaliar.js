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

  // Leitura dos colaboradores (a tabela é pública para leitura).
  function sb(path) {
    if (!CFG.supabaseUrl) return Promise.reject(new Error('sem configuração'));
    return fetch(CFG.supabaseUrl + '/rest/v1/' + path, { headers: { apikey: CFG.supabaseKey } })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('erro ' + res.status))));
  }

  // A avaliação vai pela função hc-avaliacao, que guarda e manda o e-mail de confirmação.
  function funcao(corpo) {
    if (!CFG.supabaseUrl) return Promise.reject(new Error('sem configuração'));
    return fetch(CFG.supabaseUrl + '/functions/v1/hc-avaliacao', { method: 'POST', headers: { apikey: CFG.supabaseKey, 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) })
      .then((res) => res.json().catch(() => ({})).then((j) => {
        if (res.ok && j.ok) return j;
        const e = new Error(j.error || 'erro ' + res.status); e.status = res.status; throw e;
      }));
  }
  const semRede = 'Sem ligação à internet. Verifique a rede e tente de novo.';

  // O nome e o e-mail ficam neste aparelho, para avaliar o vendedor e depois a montagem sem escrever tudo outra vez.
  const lembrar = () => { try { return JSON.parse(localStorage.getItem('hc-cliente') || '{}'); } catch (e) { return {}; } };
  const guardar = (d) => { try { localStorage.setItem('hc-cliente', JSON.stringify(d)); } catch (e) { /* sem armazenamento */ } };

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
        formulario(col);
      })
      .catch(() => pedirCodigo(semRede, c));
  }

  const estrelas = (name, labelId) => '<div class="st-row" role="radiogroup" aria-labelledby="' + labelId + '">' + [1, 2, 3, 4, 5].map((i) => '<input type="radio" id="' + name + i + '" name="' + name + '" value="' + i + '"><label for="' + name + i + '">' + ic('star') + '<span class="sr">' + i + (i === 1 ? ' estrela' : ' estrelas') + ', ' + PALAVRA[i] + '</span></label>').join('') + '</div>';

  function formulario(col) {
    const mont = col.funcao === 'montagem';
    const eu = lembrar();
    document.title = 'Avaliar ' + col.nome + ' · Home Center';
    main.innerHTML = '<form class="rate-card" id="f" novalidate>' +
      '<div class="rate-who"><span class="av" aria-hidden="true">' + esc(initials(col.nome)) + '</span><h1>' + esc(col.nome) + '</h1><p>' + FUNCAO[col.funcao] + (col.equipa ? ', equipa ' + col.equipa : '') + ' · ' + (LOJA[col.loja] || '') + '</p></div>' +
      '<div class="st-in big"><div class="st-q" id="q0">' + (mont ? 'Como correu a entrega e a montagem?' : 'Como foi o atendimento de ' + esc(primeiro(col.nome)) + '?') + '</div>' + estrelas('estrelas', 'q0') + '<div class="st-word" id="w-estrelas">Toque nas estrelas</div></div>' +
      '<div class="crit"><div class="st-q2">Em detalhe</div>' + CRIT[col.funcao].map((t, i) => '<div class="crit-r"><span id="q' + (i + 1) + '">' + t + '</span>' + estrelas('c' + (i + 1), 'q' + (i + 1)) + '</div>').join('') + '</div>' +
      '<div><label class="tf"><span class="l">Quer deixar um comentário? (opcional)</span><textarea name="comentario" rows="3" maxlength="500" aria-describedby="cc"></textarea></label><span class="hint" id="cc">0 de 500 caracteres</span></div>' +
      '<fieldset class="rate-you"><legend class="st-q2">Os seus dados</legend><p class="rate-why">Enviamos um link para o seu e-mail: a avaliação só conta depois de a confirmar. Assim sabemos que é verdadeira.</p>' +
      '<label class="tf"><span class="l">Nome</span><input name="nome" type="text" autocomplete="name" maxlength="80" value="' + esc(eu.nome || '') + '"></label>' +
      '<label class="tf"><span class="l">E-mail</span><input name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" maxlength="254" value="' + esc(eu.email || '') + '"></label>' +
      '<label class="rate-chk"><input type="checkbox" name="consentimento"' + (eu.email ? ' checked' : '') + '><span>Aceito que a Home Center guarde o meu nome e e-mail para confirmar esta avaliação e juntá-la ao meu histórico de cliente.</span></label></fieldset>' +
      '<div class="rate-err" id="err" role="alert" hidden></div>' +
      '<button class="b b-f rate-go" type="submit">' + ic('send') + '<span>Enviar avaliação</span></button></form>';
    const f = document.getElementById('f');
    f.addEventListener('change', (e) => {
      if (e.target.type !== 'radio') { if (e.target.name === 'consentimento') document.getElementById('err').hidden = true; return; }
      const v = Number(e.target.value);
      f.querySelectorAll('input[name="' + e.target.name + '"] + label').forEach((l, i) => l.classList.toggle('on', i < v));
      if (e.target.name === 'estrelas') document.getElementById('w-estrelas').textContent = PALAVRA[v];
      document.getElementById('err').hidden = true;
    });
    f.addEventListener('input', (e) => {
      if (e.target.name === 'comentario') document.getElementById('cc').textContent = e.target.value.length + ' de 500 caracteres';
      if (e.target.closest('.tf.err')) e.target.closest('.tf').classList.remove('err');
    });
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
      const nome = f.elements.nome.value.trim().replace(/\s+/g, ' '), email = f.elements.email.value.trim().toLowerCase();
      const campo = (n, msg) => {
        err.innerHTML = ic('error') + '<span>' + msg + '</span>';
        err.hidden = false;
        if (f.elements[n].closest('.tf')) f.elements[n].closest('.tf').classList.add('err');
        f.elements[n].focus();
      };
      if (nome.length < 2) return campo('nome', 'Escreva o seu nome.');
      if (!/^[^@\s<>"]+@[^@\s<>"]+\.[^@\s<>"]+$/.test(email)) return campo('email', 'Escreva um e-mail válido, por exemplo nome@gmail.com.');
      if (!f.elements.consentimento.checked) return campo('consentimento', 'Para enviar, marque a caixa que autoriza a Home Center a guardar o seu nome e e-mail.');
      Object.assign(d, { accao: 'enviar', nome, email, consentimento: true });
      const btn = f.querySelector('.rate-go'), lbl = btn.querySelector('span:last-child');
      btn.disabled = true; lbl.textContent = 'A enviar…';
      funcao(d).then((r) => { guardar({ nome, email }); porConfirmar(col, r.email); }).catch((x) => {
        btn.disabled = false; lbl.textContent = 'Enviar avaliação';
        err.innerHTML = ic('error') + '<span>' + esc(x.status ? x.message : semRede + ' A avaliação não foi enviada.') + '</span>';
        err.hidden = false;
      });
    });
  }

  // Enviada, mas ainda por confirmar no e-mail.
  function porConfirmar(col, email) {
    const p = esc(primeiro(col.nome));
    main.innerHTML = '<div class="rate-card rate-sent"><span class="rate-ok rate-mail">' + ic('mark_email_unread') + '</span><h1 tabindex="-1">Confirme no seu e-mail</h1>' +
      '<p>Enviámos um link para <strong>' + esc(email) + '</strong>. A avaliação de ' + p + ' só conta depois de carregar em «Confirmar a avaliação».</p>' +
      '<p class="rate-why">Não chegou? Veja a pasta de spam ou promoções. O link vale 7 dias.</p>' +
      '<button type="button" class="b b-o" id="outra">Avaliar outro colaborador</button></div>';
    ligarOutra();
  }

  // Aberta pelo link do e-mail. Pede um toque no botão: alguns e-mails abrem os links sozinhos, para os verificar.
  function confirmar(token) {
    document.title = 'Confirmar a avaliação · Home Center';
    main.innerHTML = '<div class="rate-card rate-sent"><span class="rate-ok rate-mail">' + ic('verified') + '</span><h1 tabindex="-1">Confirmar a avaliação</h1>' +
      '<p>Carregue no botão para confirmar que foi você a avaliar. A partir daí, a sua avaliação conta nos resultados da equipa.</p>' +
      '<div class="rate-err" id="err" role="alert" hidden></div>' +
      '<button type="button" class="b b-f rate-go" id="conf">' + ic('check') + '<span>Confirmar a minha avaliação</span></button></div>';
    const btn = document.getElementById('conf'), lbl = btn.querySelector('span:last-child'), err = document.getElementById('err');
    btn.addEventListener('click', () => {
      btn.disabled = true; lbl.textContent = 'A confirmar…';
      funcao({ accao: 'confirmar', token }).then((r) => {
        history.replaceState(null, '', location.pathname);
        const quem = r.colaborador ? esc(r.colaborador) : 'o colaborador';
        main.innerHTML = '<div class="rate-card rate-sent"><span class="rate-ok">' + ic('check') + '</span><h1 tabindex="-1">' + (r.ja_estava ? 'Já estava confirmada' : 'Avaliação confirmada') + '</h1>' +
          '<p>' + (r.cliente ? 'Obrigado, ' + esc(r.cliente) + '. ' : 'Obrigado. ') + 'A sua avaliação de ' + quem + ' já conta nos resultados da equipa da Home Center.</p>' +
          '<button type="button" class="b b-o" id="outra">Avaliar outro colaborador</button></div>';
        ligarOutra();
      }).catch((x) => {
        btn.disabled = false; lbl.textContent = 'Confirmar a minha avaliação';
        err.innerHTML = ic('error') + '<span>' + esc(x.status ? x.message : semRede) + '</span>';
        err.hidden = false;
      });
    });
  }

  function ligarOutra() {
    document.getElementById('outra').addEventListener('click', () => { history.replaceState(null, '', location.pathname); pedirCodigo(''); });
    main.querySelector('h1').focus();
  }

  const q = new URLSearchParams(location.search);
  const token = (q.get('confirmar') || '').trim().toLowerCase();
  const c = (q.get('c') || '').trim().toUpperCase();
  if (token) confirmar(token);
  else if (/^HC-[VM]\d{3}$/.test(c)) procurar(c); else pedirCodigo(c ? 'O código ' + c + ' não é válido.' : '', c);
})();
