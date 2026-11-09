// Kingdom Company · comportamento da página
(() => {
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const telemovel = matchMedia('(max-width: 1023px)');
  const topo = document.getElementById('topo');
  const nav = document.getElementById('nav');
  const menu = topo && topo.querySelector('.menu');
  const raiz = document.documentElement;

  // Pré-visualização: o material «A receber» só aparece fora do domínio público
  const h = location.hostname;
  if (/^(localhost|127\.|0\.0\.0\.0)/.test(h) || h.endsWith('.vercel.app') || /[?&]previa\b/.test(location.search)) raiz.classList.add('previa');

  // Topo com linha por baixo depois de sair do início da página
  const marcaTopo = () => topo && topo.classList.toggle('solido', scrollY > 8);
  addEventListener('scroll', marcaTopo, { passive: true }); marcaTopo();

  // Menu: painéis (computador: passar o rato ou clicar; telemóvel: acordeão)
  const itens = [...document.querySelectorAll('.nav-item')].filter((li) => li.querySelector('.painel'));
  let espera = 0;
  const fechaPaineis = (excepto) => itens.forEach((li) => { if (li !== excepto) { li.classList.remove('aberto'); li.querySelector('.nav-botao').setAttribute('aria-expanded', 'false'); } });
  const abre = (li, sim) => {
    fechaPaineis(sim ? li : null);
    li.classList.toggle('aberto', sim);
    li.querySelector('.nav-botao').setAttribute('aria-expanded', String(sim));
    topo.classList.toggle('com-painel', sim && !telemovel.matches);
  };
  itens.forEach((li) => {
    const botao = li.querySelector('.nav-botao');
    botao.addEventListener('click', () => abre(li, !li.classList.contains('aberto')));
    li.addEventListener('mouseenter', () => { if (telemovel.matches) return; clearTimeout(espera); espera = setTimeout(() => abre(li, true), 90); });
    li.addEventListener('mouseleave', () => { if (telemovel.matches) return; clearTimeout(espera); espera = setTimeout(() => abre(li, false), 160); });
    li.addEventListener('focusout', (e) => { if (!telemovel.matches && !li.contains(e.relatedTarget)) abre(li, false); });
  });
  document.addEventListener('click', (e) => { if (!telemovel.matches && !e.target.closest('.nav-item')) { fechaPaineis(); topo.classList.remove('com-painel'); } });

  const fechaMenu = () => {
    if (!menu) return;
    topo.classList.remove('aberto'); menu.setAttribute('aria-expanded', 'false');
    menu.querySelector('span').textContent = 'Menu'; menu.querySelector('use').setAttribute('href', '#i-menu');
    document.body.style.overflow = '';
  };
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const aberto = topo.classList.toggle('aberto');
      menu.setAttribute('aria-expanded', String(aberto));
      menu.querySelector('span').textContent = aberto ? 'Fechar' : 'Menu';
      menu.querySelector('use').setAttribute('href', aberto ? '#i-fechar' : '#i-menu');
      document.body.style.overflow = aberto ? 'hidden' : '';
      if (aberto) nav.querySelector('.nav-botao').focus();
    });
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) { fechaMenu(); fechaPaineis(); topo.classList.remove('com-painel'); } });
    telemovel.addEventListener('change', () => { fechaMenu(); fechaPaineis(); topo.classList.remove('com-painel'); });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const aberto = itens.find((li) => li.classList.contains('aberto'));
    if (aberto && !telemovel.matches) { abre(aberto, false); aberto.querySelector('.nav-botao').focus(); return; }
    if (topo.classList.contains('aberto')) { fechaMenu(); menu.focus(); }
  });

  // Atalhos das áreas: leva à linha da área e acende-a por um momento
  document.querySelectorAll('[data-area]').forEach((a) => {
    a.addEventListener('click', () => {
      const alvo = document.getElementById(a.dataset.area);
      if (!alvo) return;
      alvo.classList.remove('realce'); void alvo.offsetWidth; alvo.classList.add('realce');
      setTimeout(() => alvo.classList.remove('realce'), 900);
      const titulo = alvo.querySelector('h3 a');
      if (titulo) setTimeout(() => titulo.focus({ preventScroll: true }), 500);
    });
  });

  const quandoVisivel = (el, fn, limiar = 0.35) => {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { fn(); io.disconnect(); } }, { threshold: limiar });
    io.observe(el);
  };

  // Números: contam ao aparecer e o destaque passa de um para o outro
  const numeros = document.querySelector('[data-numeros]');
  if (numeros) {
    const celulas = [...numeros.children];
    const conta = (el) => {
      const alvo = +el.dataset.conta; let t0 = 0;
      const passo = (t) => { if (!t0) t0 = t; const p = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(passo); };
      el.textContent = '0'; requestAnimationFrame(passo);
    };
    quandoVisivel(numeros, () => {
      if (!calmo) numeros.querySelectorAll('[data-conta]').forEach(conta);
      if (calmo) return;
      let i = 0, pausa = false;
      numeros.addEventListener('mouseenter', () => { pausa = true; });
      numeros.addEventListener('mouseleave', () => { pausa = false; });
      setInterval(() => {
        if (pausa || document.hidden) return;
        i = (i + 1) % celulas.length;
        celulas.forEach((c, n) => c.classList.toggle('ativo', n === i));
        numeros.style.setProperty('--i', i);
      }, 2800);
    }, 0.5);
  }

  // Anel de treino: anima ao aparecer
  document.querySelectorAll('[data-anima]').forEach((el) => quandoVisivel(el, () => el.classList.add('visivel'), 0.4));

  const parado = false;

  // Plano de ação: a linha de «Hoje» avança semana a semana, as barras enchem e os marcos acendem
  const gantt = document.querySelector('[data-gantt]');
  if (gantt) {
    const marcos = [...gantt.querySelectorAll('.gl-marco')].map((m) => [m, parseFloat(m.style.getPropertyValue('--s'))]);
    const aplica = (t) => { gantt.style.setProperty('--t', t.toFixed(4)); marcos.forEach(([m, s0]) => m.classList.toggle('feito', t >= s0)); };
    const ciclo = 14000, espera = 1600;
    let visivel = false, pedido = 0, decorrido = 0, antes = 0;
    const f = (agora) => {
      if (antes && !parado && !document.hidden) decorrido += agora - antes;
      antes = agora;
      const p = (decorrido % (ciclo + espera)) / ciclo;
      aplica(Math.min(1, p) * 0.98 + 0.02);
      pedido = visivel ? requestAnimationFrame(f) : 0;
      if (!visivel) antes = 0;
    };
    aplica(0.25);
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visivel = e.isIntersecting; if (visivel && !pedido) pedido = requestAnimationFrame(f); }).observe(gantt);
  }

  // Órbita: as cinco áreas giram à volta do globo, sempre (como no site anterior)
  const rodas = [...document.querySelectorAll('.orbita .roda')].map((r, k) => ({ r, astros: [...r.querySelectorAll('.astro')], periodo: [28000, 44000, 64000][k] || 50000, sentido: k === 1 ? -1 : 1 }));
  if (rodas.length) {
    let visivelO = true;
    const orb = document.querySelector('.orbita');
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visivelO = e.isIntersecting; }).observe(orb);
    const gira = (agora) => {
      if (visivelO && !document.hidden) rodas.forEach(({ r, astros, periodo, sentido }) => {
        const a = (sentido * 360 * agora / periodo) % 360;
        r.style.transform = `rotate(${a}deg)`;
        astros.forEach((x) => { x.style.rotate = `${-a}deg`; });
      });
      requestAnimationFrame(gira);
    };
    requestAnimationFrame(gira);
  }

  // Faixas de entregáveis: duplica a lista para o movimento contínuo
  document.querySelectorAll('.trilho, .logos-trilho').forEach((ul) => {
    [...ul.children].forEach((li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); ul.appendChild(c); });
  });

  // Blog de notícias: lê blog/noticias.json (mantido pela automação) e mostra as 5 mais recentes
  const not = document.querySelector('[data-noticias]');
  if (not) {
    const vazio = document.querySelector('[data-n-vazio]');
    const setas = document.querySelector('[data-n-setas]');
    const capas = { 'Negócios': 'capa-negocios', 'Tecnologia': 'capa-tecnologia', 'Inteligência artificial': 'capa-ia' };
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const dataPt = (d) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || ''); return m ? `${+m[3]} ${meses[+m[2] - 1]} ${m[1]}` : ''; };
    const ler = (url) => fetch(url, { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : [])).catch(() => []);
    const monta = (itens) => {
      itens = (Array.isArray(itens) ? itens : []).filter((x) => x && x.titulo).sort((a, b) => String(b.data).localeCompare(String(a.data))).slice(0, 5);
      if (!itens.length) { if (setas) setas.hidden = true; return; }
      const faixa = not.querySelector('.noticias-faixa');
      itens.forEach((x, k) => {
        const li = document.createElement('li'); li.className = 'noticia' + (k ? '' : ' ativa');
        const b = document.createElement('button'); b.type = 'button';
        b.className = 'noticia-capa ' + (x.imagem ? 'capa-foto' : (capas[x.categoria] || 'capa-negocios'));
        b.setAttribute('aria-label', x.titulo);
        if (x.imagem) { const im = document.createElement('img'); im.src = x.imagem; im.alt = ''; im.loading = 'lazy'; b.append(im); }
        const et = document.createElement('span'); et.className = 'capa-etiqueta'; et.textContent = (x.exemplo ? 'Exemplo · ' : '') + (x.categoria || 'Notícias'); b.append(et);
        li.append(b); faixa.append(li);
      });
      const lista = [...faixa.children];
      const texto = not.querySelector('.noticia-texto');
      let i = 0;
      const mostra = (n) => {
        i = (n + lista.length) % lista.length;
        const x = itens[i];
        lista.forEach((li, k) => { li.classList.toggle('ativa', k === i); li.firstChild.setAttribute('aria-current', String(k === i)); });
        const aplica = () => {
          not.querySelector('[data-n-meta]').textContent = [x.categoria, x.ambito, x.fonte, dataPt(x.data)].filter(Boolean).join(' · ');
          not.querySelector('[data-n-titulo]').textContent = x.titulo;
          not.querySelector('[data-n-texto]').textContent = x.resumo || '';
          const a = not.querySelector('[data-n-link]'); a.href = x.link || x.fonte_url || '/blog';
          const fora = /^https?:/.test(a.getAttribute('href')); a.target = fora ? '_blank' : ''; a.rel = fora ? 'noopener' : '';
          texto.classList.remove('muda');
        };
        if (calmo) aplica(); else { texto.classList.add('muda'); setTimeout(aplica, 280); }
      };
      lista.forEach((li, k) => li.firstChild.addEventListener('click', () => mostra(k)));
      document.querySelector('[data-n-ant]').addEventListener('click', () => mostra(i - 1));
      document.querySelector('[data-n-seg]').addEventListener('click', () => mostra(i + 1));
      let toque = null;
      not.addEventListener('pointerdown', (e) => { toque = e.clientX; });
      not.addEventListener('pointerup', (e) => { if (toque !== null && Math.abs(e.clientX - toque) > 50) mostra(i + (e.clientX < toque ? 1 : -1)); toque = null; });
      not.hidden = false; if (vazio) vazio.hidden = true;
      mostra(0);
    };
    ler(not.dataset.fonte).then((itens) => (itens.length || !raiz.classList.contains('previa') ? itens : ler(not.dataset.exemplos))).then(monta);
  }

  // Blog: filtros por categoria
  const posts = document.querySelector('[data-posts]');
  if (posts) {
    const botoes = [...document.querySelectorAll('[data-filtro]')];
    botoes.forEach((b) => b.addEventListener('click', () => {
      const f = b.dataset.filtro;
      botoes.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      posts.querySelectorAll('.post').forEach((li) => { li.hidden = !!f && li.dataset.categoria !== f; });
    }));
  }

  // Newsletter: enquanto a lista não está ligada, a subscrição segue por email
  const form = document.querySelector('[data-newsletter]');
  if (form) {
    const campo = form.querySelector('input'), msg = form.querySelector('[data-nl-msg]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = campo.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        campo.setAttribute('aria-invalid', 'true'); msg.className = 'newsletter-msg erro';
        msg.textContent = 'Escreva um email completo, por exemplo nome@empresa.co.mz.'; campo.focus(); return;
      }
      campo.removeAttribute('aria-invalid'); msg.className = 'newsletter-msg';
      const corpo = `Quero receber a newsletter da Kingdom Company neste email: ${email}`;
      location.href = `mailto:contact@kingdomcompany.co.za?subject=${encodeURIComponent('Subscrever a newsletter')}&body=${encodeURIComponent(corpo)}`;
      msg.textContent = 'Abrimos o seu programa de email com o pedido pronto. Só falta enviar.';
    });
    campo.addEventListener('input', () => { if (campo.hasAttribute('aria-invalid')) { campo.removeAttribute('aria-invalid'); msg.textContent = ''; } });
  }

  // Pedido de cotação: preenche a partir do link, valida e abre o email com o pedido escrito
  const cot = document.querySelector('[data-cotacao]');
  if (cot) {
    const q = new URLSearchParams(location.search);
    const sel = cot.querySelector('#c-servico');
    if (q.get('servico') && sel.querySelector(`option[value="${CSS.escape(q.get('servico'))}"]`)) sel.value = q.get('servico');
    if (q.get('tipo') === 'avaliacao') cot.querySelector('input[name="tipo"][value="avaliacao"]').checked = true;
    const regras = {
      desafio: [(v) => v.length >= 10, 'Escreva em duas ou três frases o que quer resolver.'],
      nome: [(v) => v.length >= 2, 'Escreva o seu nome.'],
      empresa: [(v) => v.length >= 2, 'Escreva o nome da empresa.'],
      email: [(v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), 'Escreva um email completo, por exemplo nome@empresa.co.mz.'],
      telefone: [(v) => v.replace(/\D/g, '').length >= 9, 'Escreva um número com o indicativo, por exemplo +258 84 123 4567.'],
    };
    const valida = (nome) => {
      const campo = cot.elements[nome], erro = cot.querySelector(`#c-${nome}-erro`);
      const [ok, texto] = regras[nome];
      const bom = ok(campo.value.trim());
      if (bom) { campo.removeAttribute('aria-invalid'); erro.textContent = ''; } else { campo.setAttribute('aria-invalid', 'true'); erro.textContent = texto; }
      return bom;
    };
    Object.keys(regras).forEach((n) => cot.elements[n].addEventListener('input', () => { if (cot.elements[n].hasAttribute('aria-invalid')) valida(n); }));
    let pedido = '';
    cot.addEventListener('submit', (e) => {
      e.preventDefault();
      const falhas = Object.keys(regras).filter((n) => !valida(n));
      if (falhas.length) { cot.elements[falhas[0]].focus(); return; }
      const v = (n) => (cot.elements[n].value || '').trim();
      const avaliacao = v('tipo') === 'avaliacao';
      const servico = sel.value ? sel.options[sel.selectedIndex].text : 'Ainda não sei';
      const assunto = `${avaliacao ? 'Avaliação inicial' : 'Pedido de cotação'} · ${servico} · ${v('empresa')}`;
      pedido = [
        `Tipo de pedido: ${avaliacao ? 'Avaliação inicial' : 'Cotação'}`,
        `Serviço: ${servico}`,
        `Para quando: ${v('prazo') || 'Não indicado'}`,
        '', 'O desafio:', v('desafio'), '',
        `Nome: ${v('nome')}${v('cargo') ? ` (${v('cargo')})` : ''}`,
        `Empresa: ${v('empresa')} · ${v('pais')}`,
        `Email: ${v('email')}`,
        `Telefone ou WhatsApp: ${v('telefone')}`,
        `Prefere ser contactado por: ${v('canal')}`,
      ].join('\n');
      location.href = `mailto:contact@kingdomcompany.co.za?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(pedido)}`;
      const feito = cot.querySelector('[data-cot-feito]');
      feito.hidden = false; feito.focus();
    });
    const copiar = cot.querySelector('[data-cot-copiar]'), copiado = cot.querySelector('[data-cot-copiado]');
    copiar.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(`Para: contact@kingdomcompany.co.za\n\n${pedido}`); copiado.textContent = 'Pedido copiado. Cole-o num email para contact@kingdomcompany.co.za.'; }
      catch { copiado.textContent = 'Não foi possível copiar. Escreva para contact@kingdomcompany.co.za.'; }
    });
  }

  // Perguntas: abrir e fechar com movimento
  if (!calmo) document.querySelectorAll('.faq details').forEach((d) => {
    const s = d.querySelector('summary'), corpo = d.querySelector('.faq-resposta');
    if (!corpo || !corpo.animate) return;
    s.addEventListener('click', (e) => {
      e.preventDefault();
      if (d.open) {
        const a = corpo.animate([{ height: `${corpo.offsetHeight}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 300, easing: 'cubic-bezier(.16,1,.3,1)' });
        a.onfinish = () => { d.open = false; };
      } else {
        d.open = true;
        corpo.animate([{ height: '0px', opacity: 0 }, { height: `${corpo.offsetHeight}px`, opacity: 1 }], { duration: 400, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
    });
  });
})();
