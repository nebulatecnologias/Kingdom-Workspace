/* ============================================================
   Kingdom InCompany, versão 2: os efeitos do GUIA-SITES-DE-VENDAS.
   Barra que ganha fundo, entradas ao deslizar, janela que se endireita,
   «Experimente» (nome e cor da empresa na demonstração), faixas sem fim,
   separadores que seguem a leitura, desenhos que acordam, fluxo que se acende,
   números que contam, método que se acende, carrossel, perguntas e estrelas.
   Sem JavaScript, tudo continua visível.
   ============================================================ */
(() => {
  const $ = id => document.getElementById(id);
  const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(!calmo) document.documentElement.classList.add("anima");
  const aoDeslizar = fn => { let p = 0; const f = () => { p = 0; fn(); }; addEventListener("scroll", () => { if(!p) p = requestAnimationFrame(f); }, { passive:true }); addEventListener("resize", fn); fn(); };

  /* ---------- barra de cima ---------- */
  const nav = $("nav");
  if(nav) aoDeslizar(() => nav.classList.toggle("solida", scrollY > 24));

  /* ---------- entradas ao deslizar ---------- */
  const revela = [...document.querySelectorAll(".revela")];
  revela.forEach(el => {
    const irmaos = [...el.parentElement.children].filter(x => x.classList.contains("revela"));
    el.style.setProperty("--atraso", `${Math.min(irmaos.indexOf(el), 5) * 0.08}s`);
  });
  if(calmo || !("IntersectionObserver" in window)) revela.forEach(el => el.classList.add("visto"));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if(e.isIntersecting){ e.target.classList.add("visto"); io.unobserve(e.target); }
    }), { rootMargin:"0px 0px -8% 0px", threshold:0.08 });
    revela.forEach(el => io.observe(el));
  }

  /* ---------- a janela da abertura começa inclinada e endireita-se ---------- */
  const janela = $("janela-hero");
  if(janela && !calmo) aoDeslizar(() => {
    const p = Math.min(Math.max(scrollY / 520, 0), 1);
    janela.style.setProperty("--rx", `${(16 * (1 - p)).toFixed(2)}deg`);
    janela.style.setProperty("--sc", (0.93 + 0.07 * p).toFixed(4));
  });

  /* ---------- Experimente: o nome e a cor da empresa na demonstração ---------- */
  const campo = $("exp-nome");
  if(campo && janela){
    const iniciais = t => (t.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join("") || "AE").toUpperCase();
    const aplicaNome = () => {
      const nome = campo.value.trim() || "A sua empresa";
      ["demo-nome", "demo-nome-2", "demo-capa"].forEach(id => { const el = $(id); if(el) el.textContent = nome; });
      $("demo-iniciais").textContent = iniciais(campo.value || "A sua empresa");
    };
    campo.addEventListener("input", aplicaNome);
    const cores = [...document.querySelectorAll(".cores button")];
    const escolhe = b => {
      cores.forEach(x => { const sim = x === b; x.setAttribute("aria-checked", String(sim)); x.tabIndex = sim ? 0 : -1; });
      janela.style.setProperty("--m", b.dataset.cor);
    };
    cores.forEach((b, i) => {
      b.tabIndex = i === 0 ? 0 : -1;
      b.addEventListener("click", () => escolhe(b));
      b.addEventListener("keydown", e => {
        const d = { ArrowRight:1, ArrowDown:1, ArrowLeft:-1, ArrowUp:-1 }[e.key];
        if(d){ e.preventDefault(); const n = cores[(i + d + cores.length) % cores.length]; escolhe(n); n.focus(); }
      });
    });
  }

  /* ---------- faixas de entregáveis: a lista vai duas vezes ---------- */
  document.querySelectorAll(".trilho-lista").forEach(l => {
    [...l.children].forEach(li => { const c = li.cloneNode(true); c.setAttribute("aria-hidden", "true"); l.appendChild(c); });
  });

  /* ---------- luz que segue o rato nos cartões ---------- */
  document.querySelectorAll(".luz-rato").forEach(c => c.addEventListener("pointermove", e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", `${e.clientX - r.left}px`);
    c.style.setProperty("--my", `${e.clientY - r.top}px`);
  }));

  /* ---------- áreas: separadores que seguem a leitura ---------- */
  const abas = [...document.querySelectorAll("#pilares-abas a")];
  const indicador = $("pilares-indicador");
  const marcaAba = a => {
    abas.forEach(x => { x.classList.toggle("ativo", x === a); if(x === a) x.setAttribute("aria-current", "true"); else x.removeAttribute("aria-current"); });
    indicador.style.setProperty("--x", `${a.offsetLeft}px`);
    indicador.style.setProperty("--w", `${a.offsetWidth}px`);
    const caixa = a.parentElement;
    if(caixa.scrollWidth > caixa.clientWidth) caixa.scrollTo({ left:a.offsetLeft - 20, behavior:calmo ? "auto" : "smooth" });
  };
  if(abas.length && indicador){
    requestAnimationFrame(() => marcaAba(abas[0]));
    addEventListener("resize", () => marcaAba(abas.find(a => a.classList.contains("ativo")) || abas[0]));
    if("IntersectionObserver" in window){
      const visiveis = new Map();
      const espiao = new IntersectionObserver(es => {
        es.forEach(e => visiveis.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
        let melhor = null, r = 0;
        visiveis.forEach((v, id) => { if(v > r){ r = v; melhor = id; } });
        if(melhor){ const a = abas.find(x => x.getAttribute("href") === `#${melhor}`); if(a && !a.classList.contains("ativo")) marcaAba(a); }
      }, { rootMargin:"-150px 0px -35% 0px", threshold:[0, .2, .4, .6, .8, 1] });
      document.querySelectorAll(".pilar").forEach(p => espiao.observe(p));
    }
  }

  /* os desenhos acordam quando entram no ecrã */
  const desenhos = [...document.querySelectorAll(".pilar-visual")];
  const correFluxo = caixa => {
    const passos = [...caixa.querySelectorAll(".fluxo-passo")];
    if(calmo){ passos.forEach(p => p.classList.add("aceso")); return; }
    let i = 0;
    const passo = () => {
      if(i === passos.length){ setTimeout(() => { passos.forEach(p => p.classList.remove("aceso")); i = 0; setTimeout(passo, 700); }, 2600); return; }
      passos[i++].classList.add("aceso");
      setTimeout(passo, 750);
    };
    setTimeout(passo, 400);
  };
  const acorda = el => { el.classList.add("visto"); const f = el.querySelector("[data-fluxo]"); if(f) correFluxo(f); };
  if(calmo || !("IntersectionObserver" in window)) desenhos.forEach(acorda);
  else {
    const io2 = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ acorda(e.target); io2.unobserve(e.target); } }), { threshold:0.35 });
    desenhos.forEach(el => io2.observe(el));
  }

  /* ---------- método: a linha enche e os passos acendem ao deslizar ---------- */
  const fluxo = $("metodo-fluxo"), linha = $("metodo-linha");
  if(fluxo){
    const passos = [...fluxo.querySelectorAll(".passo")];
    if(calmo){ passos.forEach(p => p.classList.add("aceso")); if(linha) linha.style.setProperty("--p", 1); }
    else aoDeslizar(() => {
      const meio = innerHeight * 0.62;
      let acesos = 0;
      passos.forEach((p, i) => {
        const r = p.getBoundingClientRect();
        // em linha, acendem um a um à medida que a secção sobe; em coluna, cada um quando chega ao meio
        const limite = r.top + r.height * 0.3 - (getComputedStyle(fluxo).gridTemplateColumns.split(" ").length > 2 ? i * 70 : 0);
        const aceso = limite < meio;
        p.classList.toggle("aceso", aceso);
        if(aceso) acesos = i + 1;
      });
      if(linha) linha.style.setProperty("--p", acesos <= 1 ? 0 : (acesos - 1) / (passos.length - 1));
    });
  }

  /* ---------- números que contam ---------- */
  const contas = [...document.querySelectorAll("[data-conta]")];
  const formata = (n, mil) => mil ? new Intl.NumberFormat("pt-PT", { useGrouping:"always" }).format(n).replace(/\s/g, ".") : String(n);
  const conta = el => {
    const alvo = +el.dataset.conta, mil = el.hasAttribute("data-mil"); let t0 = 0;
    const passo = t => { if(!t0) t0 = t; const p = Math.min(1, (t - t0) / 1500), e = 1 - Math.pow(1 - p, 4); el.textContent = formata(Math.round(alvo * e), mil); if(p < 1) requestAnimationFrame(passo); };
    requestAnimationFrame(passo);
  };
  if(contas.length && !calmo && "IntersectionObserver" in window){
    const ioc = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ conta(e.target); ioc.unobserve(e.target); } }), { threshold:0.6 });
    contas.forEach(el => { el.textContent = "0"; ioc.observe(el); });
  }

  /* ---------- carrossel: para cada momento da empresa ---------- */
  const EXEMPLOS = [
    { tipo:"Startups", ico:"i-foguete", cor:"#1D5BFF", nome:"Nova Vida, Lda.", sigla:"NV", capa:"Business plan", areas:"Editorial · Tecnologia",
      frase:"Uma empresa a arrancar precisa de um plano que convença o banco e de um primeiro site que venda. Juntamos o business plan, o pitch deck e a presença digital." },
    { tipo:"Pequenas e médias empresas", ico:"i-loja", cor:"#0E9F6E", nome:"Mercado Sol, Lda.", sigla:"MS", capa:"Funil de vendas", areas:"Consultoria · Marketing & Vendas",
      frase:"Uma empresa que já vende e quer crescer sem perder o controlo. Diagnosticamos, definimos as prioridades e montamos um processo comercial que trabalha todos os meses." },
    { tipo:"Empresas que concorrem", ico:"i-trofeu", cor:"#B8892B", nome:"Construtora Horizonte", sigla:"CH", capa:"Proposta de concurso", areas:"Editorial · Treinamento",
      frase:"Quem concorre com frequência não pode perder por falhas de forma. Construímos modelos de proposta a partir do caderno de encargos e treinamos a equipa para os adaptar." },
    { tipo:"Instituições", ico:"i-instituicao", cor:"#7357E8", nome:"Fundação Caminho", sigla:"FC", capa:"Relatório institucional", areas:"Editorial · Tecnologia · Treinamento",
      frase:"Uma instituição que precisa de prestar contas e de trabalhar com menos papel. Fazemos os relatórios, automatizamos os processos e treinamos quem os vai usar." }
  ];
  const slider = $("slider");
  if(slider){
    const tel = $("tel"), frase = $("slider-frase");
    let i = 0, tempo = 0, toque = null;
    $("slider-total").textContent = EXEMPLOS.length;
    const mostra = n => {
      i = (n + EXEMPLOS.length) % EXEMPLOS.length;
      const x = EXEMPLOS[i];
      const aplica = () => {
        slider.style.setProperty("--m", x.cor);
        $("slider-tipo").textContent = x.tipo;
        $("slider-ico").innerHTML = `<svg aria-hidden="true"><use href="#${x.ico}"/></svg>`;
        frase.textContent = x.frase;
        $("slider-quem").textContent = x.nome; $("slider-areas").textContent = x.areas;
        $("slider-n").textContent = i + 1;
        $("tel-nome").textContent = x.nome; $("tel-sinal").textContent = x.sigla; $("tel-capa").textContent = x.capa;
        tel.classList.remove("muda"); frase.classList.remove("muda");
      };
      if(calmo) aplica();
      else { tel.classList.add("muda"); frase.classList.add("muda"); setTimeout(aplica, 280); }
      clearTimeout(tempo);
      if(!calmo) tempo = setTimeout(() => mostra(i + 1), 7000);
    };
    $("slider-ant").addEventListener("click", () => mostra(i - 1));
    $("slider-seg").addEventListener("click", () => mostra(i + 1));
    slider.addEventListener("pointerdown", e => { toque = e.clientX; });
    slider.addEventListener("pointerup", e => { if(toque !== null && Math.abs(e.clientX - toque) > 50) mostra(i + (e.clientX < toque ? 1 : -1)); toque = null; });
    slider.addEventListener("mouseenter", () => clearTimeout(tempo));
    slider.addEventListener("mouseleave", () => { if(!calmo) tempo = setTimeout(() => mostra(i + 1), 7000); });
    if(!calmo) tempo = setTimeout(() => mostra(1), 7000);
  }

  /* ---------- perguntas: abrir e fechar com movimento ---------- */
  document.querySelectorAll(".faq-item").forEach(d => {
    const s = d.querySelector("summary"), corpo = d.querySelector(".faq-resposta");
    s.addEventListener("click", e => {
      if(calmo || !corpo.animate) return;
      e.preventDefault();
      if(d.open){
        const a = corpo.animate([{ height:`${corpo.offsetHeight}px`, opacity:1 }, { height:"0px", opacity:0 }], { duration:320, easing:"cubic-bezier(.16,1,.3,1)" });
        a.onfinish = () => { d.open = false; };
      } else {
        d.open = true;
        const h = corpo.offsetHeight;
        corpo.animate([{ height:"0px", opacity:0 }, { height:`${h}px`, opacity:1 }], { duration:420, easing:"cubic-bezier(.16,1,.3,1)" });
      }
    });
  });

  /* ---------- estrelas no fecho ---------- */
  const tela = $("estrelas");
  if(tela && tela.getContext){
    const ctx = tela.getContext("2d");
    let estrelas = [], largura = 0, altura = 0, visivel = false, pedido = 0;
    const prepara = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      largura = tela.clientWidth; altura = tela.clientHeight;
      tela.width = Math.round(largura * dpr); tela.height = Math.round(altura * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      estrelas = Array.from({ length:Math.round(largura * altura / 5200) }, () => ({
        x:Math.random() * largura, y:Math.random() * altura, r:Math.random() * 1.1 + .25,
        f:Math.random() * Math.PI * 2, v:Math.random() * 1.4 + .4, fria:Math.random() < .25, dy:-(Math.random() * .06 + .01)
      }));
    };
    const desenha = t => {
      ctx.clearRect(0, 0, largura, altura);
      for(const s of estrelas){
        const a = calmo ? .55 : .25 + .75 * Math.abs(Math.sin(s.f + t * .001 * s.v));
        if(!calmo){ s.y += s.dy; if(s.y < -2) s.y = altura + 2; }
        ctx.globalAlpha = a * (.35 + .65 * (1 - s.y / altura * .5));
        ctx.fillStyle = s.fria ? "#8FE2FF" : "#ffffff";
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const ciclo = t => { desenha(t); pedido = visivel && !calmo ? requestAnimationFrame(ciclo) : 0; };
    prepara(); desenha(0);
    addEventListener("resize", () => { prepara(); desenha(performance.now()); });
    if("IntersectionObserver" in window) new IntersectionObserver(([e]) => { visivel = e.isIntersecting; if(visivel && !pedido && !calmo) pedido = requestAnimationFrame(ciclo); }).observe(tela);
  }
})();
