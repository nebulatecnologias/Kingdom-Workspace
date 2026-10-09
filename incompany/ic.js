/* Kingdom InCompany: o edifício.
   Sem JavaScript tudo fica visível (os quatro pisos, as quatro fases, o edifício pronto);
   com JavaScript, o painel do elevador escolhe o piso e o método percorre as fases da obra. */
(function(){
  var raiz = document.documentElement;
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- cabeçalho: ganha fundo ao deslizar ---------- */
  var topo = document.getElementById("topo");
  if(topo){
    var marca = function(){ topo.classList.toggle("preso", window.scrollY > 8); };
    marca(); window.addEventListener("scroll", marca, { passive:true });
  }

  /* ---------- menu do telemóvel: fecha ao escolher ---------- */
  var menu = document.querySelector(".menu");
  if(menu){
    menu.addEventListener("click", function(e){ if(e.target.closest("a")) menu.removeAttribute("open"); });
    document.addEventListener("keydown", function(e){ if(e.key === "Escape") menu.removeAttribute("open"); });
  }

  /* ---------- entrar ao deslizar ---------- */
  var els = document.querySelectorAll(".revela");
  els.forEach(function(el){
    var irmaos = Array.prototype.filter.call(el.parentNode.children, function(c){ return c.classList.contains("revela"); });
    var i = irmaos.indexOf(el);
    if(i > 0) el.style.setProperty("--atraso", Math.min(i * 0.08, 0.32) + "s");
  });
  if(!("IntersectionObserver" in window) || reduz){
    els.forEach(function(el){ el.classList.add("visto"); });
  } else {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("visto"); io.unobserve(e.target); } });
    }, { threshold:0.12 });
    els.forEach(function(el){ io.observe(el); });
  }

  /* ---------- o edifício da abertura: a cabine percorre os pisos ---------- */
  var cabine = document.getElementById("cabine");
  var andares = document.querySelectorAll(".andar");
  var pisoParado = 4;
  function levaCabine(n){
    if(!cabine) return;
    cabine.style.setProperty("--piso", n);
    andares.forEach(function(a){ a.classList.toggle("aceso", +a.dataset.piso === n); });
  }
  if(cabine){
    // ao abrir: o edifício levanta-se piso a piso e a cabine sobe até ao topo
    setTimeout(function(){ levaCabine(pisoParado); }, reduz ? 0 : 1200);
    andares.forEach(function(a){
      var n = +a.dataset.piso;
      a.addEventListener("mouseenter", function(){ levaCabine(n); });
      a.addEventListener("focus", function(){ levaCabine(n); });
      a.addEventListener("mouseleave", function(){ levaCabine(pisoParado); });
      a.addEventListener("click", function(){ if(n > 0) escolhePiso(n, true); });
    });
  }

  /* ---------- painel do elevador: um piso de cada vez ---------- */
  var botoes = Array.prototype.slice.call(document.querySelectorAll(".painel-botoes [role=tab]"));
  var pisos = document.querySelectorAll(".piso");
  var visorN = document.getElementById("visor-n");
  var visorSeta = document.getElementById("visor-seta");
  var atual = 1;
  function escolhePiso(n, foca){
    if(!botoes.length) return;
    var dir = n > atual ? "vem-de-cima" : "vem-de-baixo";
    pisos.forEach(function(p){
      var este = +p.dataset.piso === n;
      p.classList.remove("vem-de-cima", "vem-de-baixo");
      p.classList.toggle("ativo", este);
      if(este && n !== atual) p.classList.add(dir);
    });
    botoes.forEach(function(b){
      var este = +b.dataset.piso === n;
      b.setAttribute("aria-selected", este ? "true" : "false");
      b.tabIndex = este ? 0 : -1;
      if(este && foca) b.focus({ preventScroll:true });
    });
    if(visorSeta){
      visorSeta.classList.remove("parado");
      visorSeta.classList.toggle("desce", n < atual);
      clearTimeout(escolhePiso.t);
      escolhePiso.t = setTimeout(function(){ visorSeta.classList.add("parado"); }, reduz ? 0 : 900);
    }
    if(visorN){
      // o visor conta os pisos pelo caminho, como num elevador
      var de = atual, passo = n > de ? 1 : -1;
      clearInterval(escolhePiso.c);
      if(reduz || de === n){ visorN.textContent = n; }
      else escolhePiso.c = setInterval(function(){ de += passo; visorN.textContent = de; if(de === n) clearInterval(escolhePiso.c); }, 170);
    }
    atual = n;
  }
  if(botoes.length){
    raiz.classList.add("com-js");
    var inicial = /^#piso-([1-4])$/.exec(location.hash);
    atual = inicial ? +inicial[1] : 1;
    escolhePiso(atual);
    if(visorSeta) visorSeta.classList.add("parado");
    botoes.forEach(function(b){
      b.addEventListener("click", function(){ escolhePiso(+b.dataset.piso); });
      b.addEventListener("keydown", function(e){
        var n = null;
        if(e.key === "ArrowUp" || e.key === "ArrowRight") n = Math.min(4, atual + 1);
        if(e.key === "ArrowDown" || e.key === "ArrowLeft") n = Math.max(1, atual - 1);
        if(e.key === "Home") n = 1;
        if(e.key === "End") n = 4;
        if(n !== null){ e.preventDefault(); escolhePiso(n, true); }
      });
    });
    window.addEventListener("hashchange", function(){
      var m = /^#piso-([1-4])$/.exec(location.hash);
      if(m) escolhePiso(+m[1]);
    });
  }

  /* ---------- método: as fases da obra ---------- */
  var desenho = document.getElementById("desenho");
  var fases = Array.prototype.slice.call(document.querySelectorAll(".fase"));
  if(desenho && fases.length){
    var TEMPO = 4200, fase = 1, roda = null, parou = false;
    function mostraFase(n, anima){
      fase = n;
      desenho.setAttribute("data-fase", n);
      fases.forEach(function(f){
        var esta = +f.dataset.fase === n;
        f.classList.remove("ativa");
        f.style.setProperty("--tempo", (anima && !reduz) ? TEMPO + "ms" : "0s");
        f.querySelector("button").setAttribute("aria-pressed", esta ? "true" : "false");
        if(esta){ void f.offsetWidth; f.classList.add("ativa"); }
      });
    }
    function anda(){
      clearTimeout(roda);
      if(parou || reduz) return;
      roda = setTimeout(function(){ mostraFase(fase % 4 + 1, true); anda(); }, TEMPO);
    }
    mostraFase(1, false);
    fases.forEach(function(f){
      f.querySelector("button").addEventListener("click", function(){ parou = true; clearTimeout(roda); mostraFase(+f.dataset.fase, false); });
    });
    if("IntersectionObserver" in window && !reduz){
      new IntersectionObserver(function(es){
        es.forEach(function(e){
          if(e.isIntersecting && !parou){ mostraFase(fase, true); anda(); }
          else clearTimeout(roda);
        });
      }, { threshold:0.35 }).observe(desenho);
    }
  }
})();
