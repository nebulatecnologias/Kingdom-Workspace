/* ============================================================
   Kingdom Training Center: os efeitos do site de vendas da área de membros
   (entradas ao deslizar, separadores que seguem a leitura, desenhos que acordam,
   perguntas e estrelas), mais a frase que se acende, a roda dos valores e as galerias.
   ============================================================ */
(() => {
  const $ = id => document.getElementById(id);
  const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = t => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  const icone = id => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;

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

  /* ---------------- «Sem negociar»: cada linha acende quando chega ao meio do ecrã ---------------- */
  const linhas = [...document.querySelectorAll("[data-acende]")];
  if(calmo) linhas.forEach(l => l.classList.add("acesa"));
  else {
    let pedido = 0;
    const acende = () => {
      pedido = 0;
      const limite = innerHeight * 0.62;
      linhas.forEach(l => l.classList.toggle("acesa", l.getBoundingClientRect().top + l.offsetHeight / 2 < limite));
    };
    addEventListener("scroll", () => { if(!pedido) pedido = requestAnimationFrame(acende); }, { passive:true });
    addEventListener("resize", acende); acende();
  }

  /* ---------------- Os três focos: separadores que seguem a leitura ---------------- */
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

  /* ---------------- Valores: a lista vira roda ----------------
     Cada valor é um botão na roda; o escolhido gira até ao topo e o cartão ao lado conta-o.
     Avança sozinho a cada 8 s (a barra mostra o tempo) e pára ao passar o rato ou com o foco. */
  const VALORES = [...document.querySelectorAll("#valores-lista li")].map(li => ({
    nome:li.querySelector("b").textContent, desc:li.querySelector("p").textContent,
    pratica:li.querySelector("em").textContent, ico:li.dataset.ico
  }));
  const roda = $("roda-valores"), giro = $("roda-giro"), cartao = $("valor-cartao"), tempo = $("valor-tempo");
  if(roda && VALORES.length){
    const passo = 360 / VALORES.length;
    giro.innerHTML = VALORES.map((v, i) =>
      `<button type="button" class="no-valor" role="tab" id="no-valor-${i}" aria-controls="valor-cartao" aria-label="${esc(v.nome)}" title="${esc(v.nome)}" style="--ang:${i * passo}deg">${icone(v.ico)}</button>`).join("");
    const nos = [...giro.querySelectorAll(".no-valor")];
    let atual = -1, rot = 0, troca = 0;
    const mostra = i => {
      i = (i + VALORES.length) % VALORES.length;
      if(i === atual) return;
      /* gira pelo caminho mais curto até pôr o valor no topo */
      let alvo = -i * passo, d = alvo - rot;
      d = ((d % 360) + 540) % 360 - 180;
      rot += d;
      giro.style.setProperty("--rot", `${rot}deg`);
      atual = i;
      nos.forEach((b, k) => { b.setAttribute("aria-selected", String(k === i)); b.tabIndex = k === i ? 0 : -1; });
      cartao.setAttribute("aria-labelledby", `no-valor-${i}`);
      const v = VALORES[i];
      const aplica = () => {
        $("valor-ico").innerHTML = icone(v.ico);
        $("valor-nome").textContent = v.nome;
        $("valor-desc").textContent = v.desc;
        $("valor-pratica").textContent = v.pratica;
        $("roda-num").textContent = i + 1;
        cartao.classList.remove("muda");
      };
      clearTimeout(troca);
      if(calmo || !cartao.textContent.trim() || !$("valor-nome").textContent) aplica();
      else { cartao.classList.add("muda"); troca = setTimeout(aplica, 260); }
      if(!calmo){ tempo.classList.remove("corre"); void tempo.offsetWidth; tempo.classList.add("corre"); }
    };
    tempo.addEventListener("animationend", () => mostra(atual + 1));
    nos.forEach((b, k) => b.addEventListener("click", () => mostra(k)));
    giro.addEventListener("keydown", e => {
      const mapa = { ArrowRight:1, ArrowDown:1, ArrowLeft:-1, ArrowUp:-1 };
      if(e.key in mapa){ e.preventDefault(); mostra(atual + mapa[e.key]); nos[atual].focus(); }
      if(e.key === "Home"){ e.preventDefault(); mostra(0); nos[0].focus(); }
      if(e.key === "End"){ e.preventDefault(); mostra(VALORES.length - 1); nos[atual].focus(); }
    });
    $("valor-seg").addEventListener("click", () => mostra(atual + 1));
    $("valor-ant").addEventListener("click", () => mostra(atual - 1));
    const pausa = on => roda.classList.toggle("pausa", on);
    roda.addEventListener("pointerenter", () => pausa(true));
    roda.addEventListener("pointerleave", () => pausa(false));
    roda.addEventListener("focusin", () => pausa(true));
    roda.addEventListener("focusout", () => pausa(false));
    /* só começa a contar quando a roda está à vista */
    if("IntersectionObserver" in window){
      new IntersectionObserver(([e]) => { if(!e.isIntersecting) pausa(true); else if(!roda.matches(":hover, :focus-within")) pausa(false); }, { threshold:0.3 }).observe(roda);
    }
    roda.hidden = false;
    $("valores-caixa").classList.add("com-roda");
    mostra(0);
  }

  /* ---------------- Galerias dos eventos ----------------
     Para pôr fotografias, basta juntar os caminhos (ex.: "/img/eventos/founders-1.webp") à lista do evento.
     Enquanto a lista está vazia, ficam os lugares reservados. */
  const GALERIAS = {
    founders:[],
    tracktion:[],
    outros:[]
  };
  const LUGARES = { founders:3, tracktion:3, outros:5 };
  const dialogo = $("foto-aberta"), palco = $("foto-aberta-palco");
  let aberta = { lista:[], i:0 };
  const pintaAberta = () => {
    const f = aberta.lista[aberta.i];
    palco.innerHTML = `<img src="${esc(f)}" alt="Fotografia ${aberta.i + 1} de ${aberta.lista.length}">`;
  };
  if(dialogo && dialogo.showModal){
    const navega = d => { aberta.i = (aberta.i + d + aberta.lista.length) % aberta.lista.length; pintaAberta(); };
    dialogo.insertAdjacentHTML("beforeend",
      `<button type="button" class="foto-nav ant" aria-label="Fotografia anterior">${icone("i-ant")}</button><button type="button" class="foto-nav seg" aria-label="Fotografia seguinte">${icone("i-seta")}</button>`);
    dialogo.querySelector(".foto-nav.ant").addEventListener("click", () => navega(-1));
    dialogo.querySelector(".foto-nav.seg").addEventListener("click", () => navega(1));
    $("foto-fechar").addEventListener("click", () => dialogo.close());
    dialogo.addEventListener("click", e => { if(e.target === dialogo) dialogo.close(); });
    dialogo.addEventListener("keydown", e => { if(e.key === "ArrowRight") navega(1); if(e.key === "ArrowLeft") navega(-1); });
  }
  document.querySelectorAll("[data-galeria]").forEach(g => {
    const nome = g.dataset.galeria, lista = GALERIAS[nome] || [], lugares = LUGARES[nome] || 3;
    let html = "";
    for(let i = 0; i < lugares; i++){
      const f = lista[i];
      if(!f){
        html += `<div class="foto foto-vazia" role="img" aria-label="Lugar reservado para uma fotografia">${icone("i-camara")}<span>As fotografias deste evento chegam em breve</span></div>`;
        continue;
      }
      const resto = i === lugares - 1 && lista.length > lugares ? lista.length - lugares : 0;
      html += `<button type="button" class="foto" data-i="${i}" aria-label="Abrir fotografia ${i + 1}${resto ? ` e mais ${resto}` : ""}"><img src="${esc(f)}" alt="" loading="lazy">${resto ? `<span class="foto-mais">+${resto}</span>` : ""}</button>`;
    }
    g.innerHTML = html;
    g.querySelectorAll("button.foto").forEach(b => b.addEventListener("click", () => {
      if(!dialogo || !dialogo.showModal) return window.open(lista[Number(b.dataset.i)], "_blank");
      aberta = { lista, i:Number(b.dataset.i) };
      dialogo.querySelectorAll(".foto-nav").forEach(n => { n.hidden = lista.length < 2; });
      pintaAberta(); dialogo.showModal();
    }));
  });

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
        ctx.fillStyle = s.quente ? "#F59A55" : "#ffffff";
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
