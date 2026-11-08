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
  document.querySelectorAll('.trilho').forEach((ul) => {
    [...ul.children].forEach((li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); ul.appendChild(c); });
  });

  // Metodologia: as fases acendem à medida que a página desce
  const fases = document.querySelector('[data-fases]');
  if (fases) {
    const passos = [...fases.children];
    const atualiza = () => {
      const meio = innerHeight * 0.62; let acesos = 0;
      passos.forEach((p, n) => { const aceso = p.getBoundingClientRect().top < meio; p.classList.toggle('aceso', aceso); if (aceso) acesos = n + 1; });
      fases.style.setProperty('--p', acesos <= 1 ? 0 : (acesos - 1) / (passos.length - 1));
    };
    if (calmo) passos.forEach((p) => p.classList.add('aceso')), fases.style.setProperty('--p', 1);
    else { addEventListener('scroll', atualiza, { passive: true }); atualiza(); }
  }

  // Carrossel: para cada momento da sua empresa
  const MOMENTOS = [
    { tipo: 'Startups', ico: 'i-foguete', capa: 'Business plan', areas: 'Desenvolvimento Editorial · Desenvolvimento Tecnológico', frase: 'Uma empresa a arrancar precisa de um plano que convença o banco e de um primeiro site que venda. Juntamos o business plan, o pitch deck e a presença digital.' },
    { tipo: 'Pequenas e médias empresas', ico: 'i-loja', capa: 'Funil de vendas', areas: 'Consultoria Estratégica · Marketing & Vendas', frase: 'Uma empresa que já vende e quer crescer sem perder o controlo. Diagnosticamos, definimos as prioridades e montamos um processo comercial que trabalha todos os meses.' },
    { tipo: 'Empresas que concorrem', ico: 'i-trofeu', capa: 'Proposta de concurso', areas: 'Desenvolvimento Editorial · Treinamento Corporativo', frase: 'Quem concorre com frequência não pode perder por falhas de forma. Construímos modelos de proposta a partir do caderno de encargos e treinamos a equipa para os adaptar.' },
    { tipo: 'Instituições', ico: 'i-instituicao', capa: 'Relatório institucional', areas: 'Desenvolvimento Editorial · Desenvolvimento Tecnológico · Treinamento Corporativo', frase: 'Uma instituição que precisa de prestar contas e de trabalhar com menos papel. Fazemos os relatórios, automatizamos os processos e treinamos quem os vai usar.' }
  ];
  const mom = document.querySelector('[data-momentos]');
  let mostraMomento = () => {};
  if (mom) {
    const $ = (s) => mom.querySelector(s);
    const tel = $('.tel'), frase = $('[data-m-frase]'), pontos = [...mom.querySelectorAll('.momentos-pontos button')];
    let i = 0, tempo = 0, toque = null, parado = false;
    const agenda = () => { clearTimeout(tempo); if (!calmo && !parado) tempo = setTimeout(() => mostraMomento(i + 1), 7000); };
    mostraMomento = (n) => {
      i = (n + MOMENTOS.length) % MOMENTOS.length;
      const x = MOMENTOS[i];
      const aplica = () => {
        $('[data-m-tipo]').textContent = x.tipo; frase.textContent = x.frase; $('[data-m-areas]').textContent = x.areas;
        $('[data-m-capa]').textContent = x.capa; $('[data-m-ico]').setAttribute('href', '#' + x.ico);
        pontos.forEach((p, k) => p.setAttribute('aria-pressed', String(k === i)));
        tel.classList.remove('muda'); frase.classList.remove('muda');
      };
      if (calmo) aplica(); else { tel.classList.add('muda'); frase.classList.add('muda'); setTimeout(aplica, 280); }
      agenda();
    };
    $('[data-m-ant]').addEventListener('click', () => mostraMomento(i - 1));
    $('[data-m-seg]').addEventListener('click', () => mostraMomento(i + 1));
    pontos.forEach((p, k) => p.addEventListener('click', () => mostraMomento(k)));
    mom.addEventListener('pointerdown', (e) => { toque = e.clientX; });
    mom.addEventListener('pointerup', (e) => { if (toque !== null && Math.abs(e.clientX - toque) > 50) mostraMomento(i + (e.clientX < toque ? 1 : -1)); toque = null; });
    mom.addEventListener('mouseenter', () => { parado = true; clearTimeout(tempo); });
    mom.addEventListener('mouseleave', () => { parado = false; agenda(); });
    mom.addEventListener('focusin', () => { parado = true; clearTimeout(tempo); });
    mom.addEventListener('focusout', (e) => { if (!mom.contains(e.relatedTarget)) { parado = false; agenda(); } });
    quandoVisivel(mom, agenda, 0.4);
  }
  document.querySelectorAll('[data-momento]').forEach((a) => a.addEventListener('click', () => mostraMomento(+a.dataset.momento)));

  // Notícias: a capa ativa abre, as outras ficam em tiras
  const not = document.querySelector('[data-noticias]');
  if (not) {
    const lista = [...not.querySelectorAll('.noticia')];
    const texto = not.querySelector('.noticia-texto p');
    let i = 0;
    const mostra = (n) => {
      i = (n + lista.length) % lista.length;
      const li = lista[i];
      lista.forEach((x, k) => { x.classList.toggle('ativa', k === i); x.querySelector('button').setAttribute('aria-current', String(k === i)); });
      const aplica = () => {
        not.querySelector('[data-n-titulo]').textContent = li.dataset.titulo;
        not.querySelector('[data-n-texto]').textContent = li.dataset.texto;
        not.querySelector('[data-n-acao]').textContent = li.dataset.acao;
        not.querySelector('[data-n-link]').setAttribute('href', li.dataset.link);
        texto.classList.remove('muda');
      };
      if (calmo) aplica(); else { texto.classList.add('muda'); setTimeout(aplica, 280); }
    };
    lista.forEach((li, k) => li.querySelector('button').addEventListener('click', () => mostra(k)));
    document.querySelector('[data-n-ant]').addEventListener('click', () => mostra(i - 1));
    document.querySelector('[data-n-seg]').addEventListener('click', () => mostra(i + 1));
    let toque = null;
    not.addEventListener('pointerdown', (e) => { toque = e.clientX; });
    not.addEventListener('pointerup', (e) => { if (toque !== null && Math.abs(e.clientX - toque) > 50) mostra(i + (e.clientX < toque ? 1 : -1)); toque = null; });
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
