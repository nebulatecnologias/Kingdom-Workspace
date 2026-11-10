// DT Company · comportamento da página
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
      posts.querySelectorAll('[data-categoria]').forEach((li) => { li.hidden = !!f && li.dataset.categoria !== f; });
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
      const corpo = `Quero receber a newsletter da DT Company neste email: ${email}`;
      location.href = `mailto:contacto@dtcompany.example?subject=${encodeURIComponent('Subscrever a newsletter')}&body=${encodeURIComponent(corpo)}`;
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
        `Fase do negócio: ${v('fase') || 'Não indicada'}`,
        `Para quando: ${v('prazo') || 'Não indicado'}`,
        '', 'O desafio:', v('desafio'), '',
        `Nome: ${v('nome')}${v('cargo') ? ` (${v('cargo')})` : ''}`,
        `Empresa: ${v('empresa')}`,
        `Email: ${v('email')}`,
        `Telefone ou WhatsApp: ${v('telefone')}`,
        `Prefere ser contactado por: ${v('canal')}`,
      ].join('\n');
      location.href = `mailto:contacto@dtcompany.example?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(pedido)}`;
      if (window.kcEvento) window.kcEvento('generate_lead', { tipo: avaliacao ? 'avaliacao_inicial' : 'cotacao', servico: sel.value || 'nao_sabe' });
      const feito = cot.querySelector('[data-cot-feito]');
      feito.hidden = false; feito.focus();
    });
    const copiar = cot.querySelector('[data-cot-copiar]'), copiado = cot.querySelector('[data-cot-copiado]');
    copiar.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(`Para: contacto@dtcompany.example\n\n${pedido}`); copiado.textContent = 'Pedido copiado. Cole-o num email para contacto@dtcompany.example.'; }
      catch { copiado.textContent = 'Não foi possível copiar. Escreva para contacto@dtcompany.example.'; }
    });
  }

  // Páginas legais: marca no índice a secção que está a ser lida
  const indice = document.querySelectorAll('.legal-indice a');
  if (indice.length && 'IntersectionObserver' in window) {
    const marca = (id) => indice.forEach((a) => a.setAttribute('aria-current', a.hash === `#${id}` ? 'true' : 'false'));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) marca(e.target.id); }), { rootMargin: '-30% 0px -60% 0px' });
    document.querySelectorAll('.legal-texto section[id]').forEach((s) => io.observe(s));
  }

  // Google Analytics (só quando fonte/seo.json tem o ID): aviso de cookies e eventos de conversão
  const evento = (nome, dados) => { if (window.KC_GA && typeof window.gtag === 'function') window.gtag('event', nome, dados || {}); };
  if (window.KC_GA) {
    const guarda = (v) => { try { localStorage.setItem('kc-consentimento', v); } catch (e) { /* sem armazenamento */ } };
    let escolha = null; try { escolha = localStorage.getItem('kc-consentimento'); } catch (e) { /* sem armazenamento */ }
    const aviso = () => {
      if (document.querySelector('.cookies')) return;
      const caixa = document.createElement('div');
      caixa.className = 'cookies'; caixa.setAttribute('role', 'region'); caixa.setAttribute('aria-label', 'Cookies de análise');
      caixa.innerHTML = '<p>Usamos cookies de análise do Google Analytics para perceber como o site é usado. Só os ativamos se aceitar. <a href="/privacidade#dados">Saber mais</a></p><div class="cookies-botoes"><button type="button" class="botao botao-contorno botao-pequeno" data-c="nao">Recusar</button><button type="button" class="botao botao-acao botao-pequeno" data-c="sim">Aceitar</button></div>';
      caixa.addEventListener('click', (e) => {
        const b = e.target.closest('[data-c]'); if (!b) return;
        guarda(b.dataset.c);
        window.gtag('consent', 'update', { analytics_storage: b.dataset.c === 'sim' ? 'granted' : 'denied' });
        caixa.remove();
      });
      document.body.appendChild(caixa);
    };
    if (!escolha) aviso();
    document.querySelectorAll('[data-cookies-rever]').forEach((b) => { b.hidden = false; b.addEventListener('click', aviso); });
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]'); if (!a) return;
    const h = a.getAttribute('href');
    if (h.startsWith('tel:')) evento('contacto', { metodo: 'telefone' });
    else if (h.startsWith('mailto:')) evento('contacto', { metodo: 'email' });
    else if (/wa\.me|whatsapp/.test(h)) evento('contacto', { metodo: 'whatsapp' });
    else if (h.startsWith('/pedido-de-cotacao')) evento('clique_cotacao', { origem: location.pathname, destino: h });
  });
  window.kcEvento = evento;

  // Ferramentas gratuitas: números escritos à moçambicana (250 000 · 1.500 · 2,5)
  const numero = (v) => {
    let t = String(v || '').replace(/[\s ]/g, '').replace(/MT|%/gi, '');
    if (!t) return NaN;
    if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
    const n = Number(t);
    return Number.isFinite(n) ? n : NaN;
  };
  const fmt = (n, casas = 0) => new Intl.NumberFormat('pt-PT', { maximumFractionDigits: casas, minimumFractionDigits: casas }).format(n);
  const mt = (n) => `${fmt(Math.round(n))} MT`;
  const linha = (rotulo, valor, forte) => `<div class="ferr-linha${forte ? ' forte' : ''}"><dt>${rotulo}</dt><dd>${valor}</dd></div>`;

  const diag = document.querySelector('[data-diagnostico]');
  if (diag) {
    const dados = JSON.parse(document.getElementById('diag-dados').textContent);
    const saida = diag.querySelector('[data-diag-resultado]');
    const mostra = () => {
      const marcadas = [...diag.querySelectorAll('input[name="dor"]:checked')];
      if (!marcadas.length) { saida.innerHTML = '<p class="ferr-vazio">Marque pelo menos uma frase para ver o resultado.</p>'; return; }
      const conta = {};
      marcadas.forEach((c) => { conta[c.dataset.area] = (conta[c.dataset.area] || 0) + 1; });
      const area = Object.keys(conta).sort((a, b) => conta[b] - conta[a])[0];
      const servs = marcadas.map((c) => `<li><a href="/${c.value}">${dados.servicos[c.value]}</a></li>`).join('');
      const um = marcadas.length === 1 ? marcadas[0].value.split('/')[1] : '';
      saida.innerHTML = `<p class="ferr-titulo">Comece pela área de <a href="/${area}">${dados.areas[area]}</a></p><p>Marcou ${marcadas.length} ${marcadas.length === 1 ? 'frase' : 'frases'}, ${conta[area]} desta área. Estes são os serviços que respondem ao que marcou:</p><ul class="ferr-servs">${servs}</ul><a class="botao botao-acao" href="/pedido-de-cotacao?tipo=avaliacao${um ? `&servico=${um}` : ''}">Pedir avaliação inicial</a>`;
    };
    diag.addEventListener('change', mostra);
    diag.addEventListener('submit', (e) => e.preventDefault());
  }

  const equi = document.querySelector('[data-equilibrio]');
  if (equi) {
    const saida = equi.querySelector('[data-equi-resultado]');
    const calc = () => {
      const fixos = numero(equi.querySelector('#e-fixos').value), preco = numero(equi.querySelector('#e-preco').value), varia = numero(equi.querySelector('#e-var').value);
      if ([fixos, preco, varia].some((n) => Number.isNaN(n) || n < 0)) { saida.innerHTML = '<p class="ferr-vazio">Preencha os três valores para ver o resultado.</p>'; return; }
      const margem = preco - varia;
      if (margem <= 0) { saida.innerHTML = '<p class="ferr-alerta">O preço tem de ser maior do que o custo variável. Hoje, cada venda dá prejuízo: reveja o preço ou o custo antes de vender mais.</p>'; return; }
      const unidades = Math.ceil(fixos / margem);
      saida.innerHTML = `<dl>${linha('Margem por unidade', `${mt(margem)} (${fmt(margem / preco * 100, 1)}%)`)}${linha('Unidades a vender por mês', fmt(unidades), true)}${linha('Faturação mínima por mês', mt(unidades * preco), true)}${linha('Por dia útil (22 dias)', `${fmt(Math.ceil(unidades / 22))} unidades`)}</dl><p class="ferr-nota">Abaixo destes valores, a empresa perde dinheiro. Para lucrar, venda mais, suba a margem ou baixe os custos fixos.</p>`;
    };
    equi.addEventListener('input', calc);
    equi.addEventListener('submit', (e) => e.preventDefault());
  }

  const camp = document.querySelector('[data-campanha]');
  if (camp) {
    const saida = camp.querySelector('[data-camp-resultado]');
    const calc = () => {
      const v = (id) => numero(camp.querySelector(id).value);
      const inv = v('#c-invest'), cpc = v('#c-cpc'), conv = v('#c-conv'), fecho = v('#c-fecho'), valor = v('#c-valor');
      if ([inv, cpc, conv, fecho, valor].some((n) => Number.isNaN(n) || n <= 0)) { saida.innerHTML = '<p class="ferr-vazio">Preencha os cinco valores para ver o resultado.</p>'; return; }
      if (conv > 100 || fecho > 100) { saida.innerHTML = '<p class="ferr-alerta">As percentagens têm de estar entre 0 e 100.</p>'; return; }
      const cliques = inv / cpc, contactos = cliques * conv / 100, clientes = contactos * fecho / 100, receita = clientes * valor;
      saida.innerHTML = `<dl>${linha('Visitas ao site', fmt(cliques))}${linha('Contactos', fmt(contactos, 1))}${linha('Clientes', fmt(clientes, 1), true)}${linha('Custo por contacto', contactos ? mt(inv / contactos) : '-')}${linha('Custo por cliente', clientes ? mt(inv / clientes) : '-', true)}${linha('Vendas geradas', mt(receita), true)}</dl><p class="${receita >= inv ? 'ferr-nota' : 'ferr-alerta'}">Por cada 1 MT investido, entram ${fmt(receita / inv, 2)} MT em vendas. ${receita >= inv ? 'Lembre-se de que é faturação, não lucro: desconte o custo de cada venda.' : 'Com estes números, a campanha não paga o investimento: melhore a página, a oferta ou o seguimento dos contactos antes de investir mais.'}</p>`;
    };
    camp.addEventListener('input', calc);
    camp.addEventListener('submit', (e) => e.preventDefault());
  }

  // Autoavaliações (Sim 2 · Em parte 1 · Não 0): percentagem e faixa
  document.querySelectorAll('[data-avaliacao]').forEach((form) => {
    const cfg = JSON.parse(form.querySelector('[data-aval-dados]').textContent);
    const saida = form.querySelector('[data-aval-resultado]');
    const grupos = [...new Set([...form.querySelectorAll('input[type="radio"]')].map((r) => r.name))];
    const mostra = () => {
      const marcadas = [...form.querySelectorAll('input[type="radio"]:checked')];
      if (marcadas.length < grupos.length) { saida.innerHTML = `<p class="ferr-vazio">Respondeu a ${marcadas.length} de ${grupos.length} perguntas. Responda a todas para ver o resultado.</p>`; return; }
      const pontos = marcadas.reduce((t, r) => t + Number(r.value), 0);
      const pct = Math.round(pontos / (grupos.length * 2) * 100);
      const [, titulo, texto] = cfg.faixas.find((f) => pct >= f[0]);
      const faltam = marcadas.filter((r) => r.value !== '2').length;
      saida.innerHTML = `<p class="aval-pct"><b>${pct}%</b> <span>${titulo}</span></p><div class="aval-barra" aria-hidden="true"><i style="transform:scaleX(${pct / 100})"></i></div><p>${texto}</p>${faltam ? `<p class="ferr-nota">${faltam} ${faltam === 1 ? 'ponto' : 'pontos'} por resolver ou confirmar.</p>` : ''}<p>O serviço que responde a isto: <a href="${cfg.url}">${cfg.servico}</a>.</p><a class="botao botao-acao" href="/pedido-de-cotacao?tipo=avaliacao&servico=${cfg.slug}">Pedir avaliação inicial</a>`;
      if (window.kcEvento && !form.dataset.contado) { form.dataset.contado = '1'; window.kcEvento('usar_ferramenta', { ferramenta: form.closest('section').id }); }
    };
    form.addEventListener('change', mostra);
    form.addEventListener('submit', (e) => e.preventDefault());
  });

  // Guias e checklists: contagem, memória no navegador e impressão
  const mat = document.querySelector('.mat-texto');
  if (mat) {
    const caixas = [...mat.querySelectorAll('input[type="checkbox"]')], prog = mat.querySelector('[data-mat-progresso]');
    const chave = `kc-mat:${location.pathname}`;
    try { (JSON.parse(localStorage.getItem(chave)) || []).forEach((i) => { if (caixas[i]) caixas[i].checked = true; }); } catch (e) { /* sem memória */ }
    const atualiza = () => {
      const feitas = caixas.filter((c) => c.checked).length;
      prog.textContent = `${feitas} de ${caixas.length} pontos confirmados`;
      try { localStorage.setItem(chave, JSON.stringify(caixas.map((c, i) => (c.checked ? i : -1)).filter((i) => i >= 0))); } catch (e) { /* sem memória */ }
    };
    mat.addEventListener('change', atualiza); atualiza();
  }
  document.querySelectorAll('[data-imprimir]').forEach((b) => b.addEventListener('click', () => { if (window.kcEvento) window.kcEvento('descarregar_material', { material: location.pathname }); window.print(); }));

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
