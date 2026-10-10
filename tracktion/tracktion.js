/* ============================================================
   Kingdom Tracktion: os efeitos do site de vendas da área de membros
   (entradas ao deslizar, faixas, separadores que
   seguem a leitura, fluxos que acendem, carrossel, perguntas e estrelas).
   ============================================================ */
(() => {
  const $ = id => document.getElementById(id);
  const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = t => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  const svg = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

  /* Quando houver o link do formulário, basta pô-lo aqui: todos os botões «Candidatar-me» passam a usá-lo. */
  const LINK_CANDIDATURA = "https://tracktor.kingdomcompny.com/f/kingdom-tracktion?utm_source=site&utm_medium=referencia&utm_campaign=kingdom-tracktion";
  if(LINK_CANDIDATURA) document.querySelectorAll("[data-candidatura]").forEach(a => { a.href = LINK_CANDIDATURA; a.target = "_blank"; a.rel = "noopener"; });

  if(!calmo) document.documentElement.classList.add("anima");

  /* ---------------- Navegação ---------------- */
  const nav = $("nav");
  const naRolagem = () => nav.classList.toggle("solida", scrollY > 24);
  addEventListener("scroll", naRolagem, { passive:true }); naRolagem();

  /* ---------------- Entradas ao deslizar ---------------- */
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

  /* ---------------- A luz que segue o rato nos cartões ---------------- */
  document.querySelectorAll(".luz-rato").forEach(c => c.addEventListener("pointermove", e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", `${e.clientX - r.left}px`);
    c.style.setProperty("--my", `${e.clientY - r.top}px`);
  }));

  /* ---------------- Tudo o que acontece: duas faixas ---------------- */
  const I = {
    mesa:'<path d="M3 4h18M20 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4M8 21l4-5 4 5"/>',
    um:'<circle cx="10" cy="7.5" r="3.5"/><path d="M3 20a7 7 0 0 1 11-5.7M16 18l2 2 4-4"/>',
    local:'<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    estrela:'<path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    escudo:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    rede:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    olho:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    etiqueta:'<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    equipa:'<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M18.5 20a6.5 6.5 0 0 0-2.6-5.2"/>',
    pasta:'<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M3 12.5h18"/>',
    conversa:'<path d="M21 12a8 8 0 0 1-11.5 7.2L4 20.5l1.3-5A8 8 0 1 1 21 12z"/>'
  };
  const DETALHES = [
    [["mesa", "Kingdom Class", "especialistas convidados"], ["um", "Advising individual", "uma hora, todos os meses"], ["local", "Encontro colectivo", "presencial, todos os meses"],
     ["conversa", "Experiências reais", "contadas por quem as viveu"], ["estrela", "Convidados especiais", "só para membros"], ["pasta", "Oportunidades de negócio", "entre membros"]],
    [["escudo", "Validação de decisões", "antes de arriscar"], ["rede", "Networking estratégico", "parcerias qualificadas"], ["olho", "Bastidores empresariais", "de quem já cresceu"],
     ["etiqueta", "Descontos no ecossistema", "em serviços de parceiros"], ["equipa", "Treino da equipa", "com o Training"], ["conversa", "Proximidade contínua", "entre encontros"]]
  ];
  const cartaoDetalhe = ([ico, t, s]) => `<li class="detalhe"><span class="detalhe-ico">${svg(I[ico])}</span><span><b>${esc(t)}</b><small>${esc(s)}</small></span></li>`;
  [["trilho-1", DETALHES[0]], ["trilho-2", DETALHES[1]]].forEach(([id, lista]) => {
    const um = lista.map(cartaoDetalhe).join("");
    $(id).innerHTML = um + um.replace(/<li class="detalhe">/g, '<li class="detalhe" aria-hidden="true">');
  });

  /* ---------------- Fora do ecrã: quem já passou pelo Kingdom Tracktion ----------------
     A ordem é a pedida; quem não tiver fotografia fica de fora até a imagem chegar. */
  const PESSOAS = [
    { nome:"Shinita Bijal", negocio:"Serena Beauty", foto:"/img/shinita.webp" },
    { nome:"Domingas Trindade", negocio:"DT Consultório Jurídico", foto:"/img/domingas.webp" },
    { nome:"Renato Aleixo", negocio:"MTA Nation", foto:"/img/renato.webp" },
    { nome:"Irene Solange", negocio:"Jornada Vitalidade", foto:"/img/irene.webp" },
    { nome:"Nofre Lino", negocio:"Drop Studio", foto:"/img/nofre.webp" },
    { nome:"Solange Mateus", negocio:"Sol Wash", foto:"/img/solange.webp" },
    { nome:"Liam Green", negocio:"Choise", foto:"/img/liam.webp" },
    { nome:"Tanya Janeth", negocio:"Fofices · Florista", foto:"/img/tanya.webp" },
    { nome:"Yulde Adnesse", negocio:"Adnesse Agency", foto:"/img/yulde.webp" },
    { nome:"Hostina Beatriz", negocio:"Epic Shop", foto:"/img/hostina.webp" },
    { nome:"Bruno Muianga", negocio:"Muga Agency", foto:"/img/bruno.webp" }
  ].filter(p => p.foto);
  let atual = 0, relogio = 0;
  const palco = $("slider-palco"), foto = $("slide-foto"), nomeEl = $("slide-nome"), mini = $("miniaturas");
  $("slide-total").textContent = PESSOAS.length;
  mini.innerHTML = PESSOAS.map((p, i) => `<button type="button" role="tab" aria-label="${esc(p.nome)}" data-i="${i}"><img src="${esc(p.foto)}" alt="" width="44" height="44" loading="lazy"></button>`).join("");
  const botoes = [...mini.querySelectorAll("button")];
  /* Carrega as fotografias seguintes para a troca não piscar. */
  PESSOAS.forEach(p => { const im = new Image(); im.src = p.foto; });
  const mostra = (i, primeiro) => {
    atual = (i + PESSOAS.length) % PESSOAS.length;
    const p = PESSOAS[atual];
    const aplica = () => {
      foto.src = p.foto;
      nomeEl.textContent = p.nome;
      $("slide-negocio").textContent = p.negocio;
      $("slide-n").textContent = atual + 1;
      botoes.forEach((b, k) => b.setAttribute("aria-selected", String(k === atual)));
      palco.classList.remove("muda"); nomeEl.classList.remove("muda");
    };
    if(primeiro || calmo) return aplica();
    palco.classList.add("muda"); nomeEl.classList.add("muda");
    setTimeout(aplica, 320);
  };
  const seguinte = () => mostra(atual + 1);
  const anda = () => { clearInterval(relogio); if(!calmo && PESSOAS.length > 1) relogio = setInterval(seguinte, 6000); };
  $("slide-seg").addEventListener("click", () => { seguinte(); anda(); });
  $("slide-ant").addEventListener("click", () => { mostra(atual - 1); anda(); });
  botoes.forEach(b => b.addEventListener("click", () => { mostra(Number(b.dataset.i)); anda(); }));
  const slider = $("slider");
  slider.addEventListener("pointerenter", () => clearInterval(relogio));
  slider.addEventListener("pointerleave", anda);
  slider.addEventListener("focusin", () => clearInterval(relogio));
  slider.addEventListener("focusout", anda);
  slider.addEventListener("keydown", e => {
    if(e.key === "ArrowRight"){ seguinte(); anda(); }
    if(e.key === "ArrowLeft"){ mostra(atual - 1); anda(); }
  });
  let toqueX = null;
  palco.addEventListener("touchstart", e => { toqueX = e.touches[0].clientX; }, { passive:true });
  palco.addEventListener("touchend", e => {
    if(toqueX == null) return;
    const d = e.changedTouches[0].clientX - toqueX; toqueX = null;
    if(Math.abs(d) > 40){ mostra(atual + (d < 0 ? 1 : -1)); anda(); }
  });
  mostra(0, true); anda();

  /* ---------------- Modelos: separadores que seguem a leitura ---------------- */
  const abas = [...document.querySelectorAll("#pilares-abas a")];
  const indicador = $("pilares-indicador");
  const marcaAba = a => {
    abas.forEach(x => { x.classList.toggle("ativo", x === a); if(x === a) x.setAttribute("aria-current", "true"); else x.removeAttribute("aria-current"); });
    indicador.style.setProperty("--x", `${a.offsetLeft}px`);
    indicador.style.setProperty("--w", `${a.offsetWidth}px`);
    const caixa = a.parentElement;
    if(caixa.scrollWidth > caixa.clientWidth) caixa.scrollTo({ left:a.offsetLeft - 20, behavior:calmo ? "auto" : "smooth" });
  };
  if(abas.length){
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

  /* Os desenhos acordam quando entram no ecrã. */
  const desenhos = [...document.querySelectorAll(".pilar-visual")];
  const acorda = el => {
    el.classList.add("visto");
    const f = el.querySelector("[data-fluxo]");
    if(f) correFluxo(f);
    if(el.querySelector("#ranking")) sobeRanking();
  };
  if(calmo || !("IntersectionObserver" in window)) desenhos.forEach(acorda);
  else {
    const io2 = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ acorda(e.target); io2.unobserve(e.target); } }), { threshold:0.35 });
    desenhos.forEach(el => io2.observe(el));
  }

  /* Os passos acendem-se um a um e recomeçam. */
  function correFluxo(caixa){
    const passos = [...caixa.querySelectorAll(".fluxo-passo")];
    if(calmo){ passos.forEach(p => p.classList.add("aceso")); return; }
    let i = 0;
    const passo = () => {
      if(i === passos.length){ setTimeout(() => { passos.forEach(p => p.classList.remove("aceso")); i = 0; setTimeout(passo, 700); }, 2600); return; }
      passos[i++].classList.add("aceso");
      setTimeout(passo, 750);
    };
    setTimeout(passo, 400);
  }

  /* Training: a equipa, com o plano a subir até ao valor (exemplo ilustrativo). */
  const EQUIPA = [
    ["CO", "Comercial", 86, "#136240"], ["MK", "Marketing", 78, "#7A3410"], ["LI", "Liderança", 74, "#E6DEBA", true],
    ["OP", "Operações", 71, "#3E5A38"], ["AT", "Atendimento", 66, "#532F1E"], ["FI", "Finanças", 62, "#0B4A2E"]
  ];
  $("ranking").innerHTML = EQUIPA.map(([ini, nome, v, cor, eu], i) =>
    `<li${eu ? ' class="eu"' : ""}><span class="pos">${i + 1}</span><span class="av" style="background:${cor}${eu ? ";color:#002C19" : ""}">${ini}</span><span>${esc(nome)}</span><span class="xp" data-xp="${v}">${v}</span><span class="tag">% do plano</span></li>`).join("");
  function sobeRanking(){
    if(calmo) return;
    document.querySelectorAll("#ranking .xp").forEach(el => {
      const alvo = Number(el.dataset.xp), t0 = performance.now(), dur = 1400;
      const f = agora => { const k = Math.min((agora - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(alvo * e); if(k < 1) requestAnimationFrame(f); };
      requestAnimationFrame(f);
    });
  }

  /* ---------------- Perguntas: abrir e fechar com movimento ---------------- */
  document.querySelectorAll(".faq-item").forEach(d => {
    const s = d.querySelector("summary"), corpo = d.querySelector(".faq-resposta");
    s.addEventListener("click", e => {
      if(calmo || !corpo.animate) return;
      e.preventDefault();
      if(d.open){
        const a = corpo.animate([{ height:`${corpo.offsetHeight}px`, opacity:1 }, { height:"0px", opacity:0 }], { duration:320, easing:"cubic-bezier(.16,1,.3,1)" });
        d.classList.add("a-fechar");
        a.onfinish = () => { d.open = false; d.classList.remove("a-fechar"); };
      } else {
        d.open = true;
        const h = corpo.offsetHeight;
        corpo.animate([{ height:"0px", opacity:0 }, { height:`${h}px`, opacity:1 }], { duration:420, easing:"cubic-bezier(.16,1,.3,1)" });
      }
    });
  });

  /* ---------------- Estrelas no fecho ---------------- */
  const tela = $("estrelas");
  if(tela && tela.getContext){
    const ctx = tela.getContext("2d");
    let estrelas = [], largura = 0, altura = 0, dpr = 1, visivel = false, pedido = 0;
    const prepara = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      largura = tela.clientWidth; altura = tela.clientHeight;
      tela.width = Math.round(largura * dpr); tela.height = Math.round(altura * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(largura * altura / 5200);
      estrelas = Array.from({ length:n }, () => ({
        x:Math.random() * largura, y:Math.random() * altura, r:Math.random() * 1.1 + .25,
        f:Math.random() * Math.PI * 2, v:Math.random() * 1.4 + .4, quente:Math.random() < .22,
        dy:-(Math.random() * 0.06 + 0.01)
      }));
    };
    const desenha = t => {
      ctx.clearRect(0, 0, largura, altura);
      for(const s of estrelas){
        const a = calmo ? .55 : .25 + .75 * Math.abs(Math.sin(s.f + t * 0.001 * s.v));
        if(!calmo){ s.y += s.dy; if(s.y < -2) s.y = altura + 2; }
        ctx.globalAlpha = a * (0.35 + 0.65 * (1 - s.y / altura * .5));
        ctx.fillStyle = s.quente ? "#F2D9B5" : "#ffffff";
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const ciclo = t => { desenha(t); pedido = visivel && !calmo ? requestAnimationFrame(ciclo) : 0; };
    prepara(); desenha(0);
    addEventListener("resize", () => { prepara(); desenha(performance.now()); });
    if("IntersectionObserver" in window){
      new IntersectionObserver(([e]) => {
        visivel = e.isIntersecting;
        if(visivel && !pedido && !calmo) pedido = requestAnimationFrame(ciclo);
      }).observe(tela);
    }
  }
})();
