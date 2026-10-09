/* Kingdom InCompany: interações.
   Sem JavaScript tudo fica visível e funcional (áreas abertas, números finais, fases em lista);
   com JavaScript: luz que segue o cursor, mosaicos com profundidade, números que contam,
   painéis das áreas que se expandem, medidor do método, faixa de logótipos contínua. */
(function(){
  var raiz = document.documentElement;
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var rato = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  raiz.classList.add("com-js");

  /* ---------- cabeçalho: vira pílula branca ao deslizar ---------- */
  var topo = document.getElementById("topo");
  if(topo){
    var marca = function(){ topo.classList.toggle("preso", window.scrollY > 40); };
    marca(); window.addEventListener("scroll", marca, { passive:true });
  }

  /* ---------- menu de serviços (toque e teclado) ---------- */
  var servicos = document.querySelector(".nav-servicos");
  if(servicos){
    var bs = servicos.querySelector("button");
    bs.addEventListener("click", function(){
      var aberto = servicos.classList.toggle("aberto");
      bs.setAttribute("aria-expanded", aberto ? "true" : "false");
    });
    document.addEventListener("click", function(e){ if(!servicos.contains(e.target)){ servicos.classList.remove("aberto"); bs.setAttribute("aria-expanded","false"); } });
  }
  var menu = document.querySelector(".menu");
  if(menu){
    menu.addEventListener("click", function(e){ if(e.target.closest("a")) menu.removeAttribute("open"); });
  }
  document.addEventListener("keydown", function(e){
    if(e.key !== "Escape") return;
    if(menu) menu.removeAttribute("open");
    if(servicos){ servicos.classList.remove("aberto"); servicos.querySelector("button").setAttribute("aria-expanded","false"); }
  });

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

  /* ---------- luz que segue o cursor nos cartões noite ---------- */
  if(rato && !reduz){
    document.querySelectorAll(".cartao-noite").forEach(function(c){
      var pedido = null, ev = null;
      c.addEventListener("pointermove", function(e){
        ev = e;
        if(pedido) return;
        pedido = requestAnimationFrame(function(){
          var r = c.getBoundingClientRect();
          c.style.setProperty("--mx", ((ev.clientX - r.left) / r.width * 100).toFixed(1) + "%");
          c.style.setProperty("--my", ((ev.clientY - r.top) / r.height * 100).toFixed(1) + "%");
          pedido = null;
        });
      });
    });
  }

  /* ---------- mosaicos da abertura: profundidade com o rato ---------- */
  var heroi = document.getElementById("heroi");
  var mosaicos = document.querySelectorAll(".mosaico");
  if(heroi && mosaicos.length && rato && !reduz){
    heroi.addEventListener("pointermove", function(e){
      var r = heroi.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
      mosaicos.forEach(function(m){
        var f = parseFloat(m.dataset.fundo || 1);
        m.style.setProperty("--px", (-dx * 14 * f).toFixed(1) + "px");
        m.style.setProperty("--py", (-dy * 14 * f).toFixed(1) + "px");
      });
    });
    heroi.addEventListener("pointerleave", function(){
      mosaicos.forEach(function(m){ m.style.setProperty("--px","0px"); m.style.setProperty("--py","0px"); });
    });
  }

  /* ---------- faixa de logótipos: duplica para correr sem fim ---------- */
  if(!reduz) document.querySelectorAll(".faixa-pista").forEach(function(p){
    Array.prototype.slice.call(p.children).forEach(function(li){
      var c = li.cloneNode(true); c.setAttribute("aria-hidden","true"); p.appendChild(c);
    });
  });

  /* ---------- números que contam ---------- */
  var contas = document.querySelectorAll("[data-conta]");
  function formata(n, mil){ return mil ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : String(n); }
  function conta(el){
    var alvo = +el.dataset.conta, mil = !!el.dataset.mil, t0 = null, dur = 1600;
    function passo(t){
      if(!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = formata(Math.round(alvo * e), mil);
      if(p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }
  if(contas.length && "IntersectionObserver" in window && !reduz){
    var ioc = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ conta(e.target); ioc.unobserve(e.target); } });
    }, { threshold:0.6 });
    contas.forEach(function(el){ el.textContent = "0"; ioc.observe(el); });
  }

  /* ---------- áreas: o painel ativo expande-se ---------- */
  var areas = Array.prototype.slice.call(document.querySelectorAll(".area"));
  function ativa(a){
    areas.forEach(function(x){
      var esta = x === a;
      x.classList.toggle("ativa", esta);
      x.querySelector(".area-cabeca").setAttribute("aria-expanded", esta ? "true" : "false");
    });
  }
  areas.forEach(function(a){
    a.querySelector(".area-cabeca").addEventListener("click", function(){
      if(a.classList.contains("ativa") && window.innerWidth < 1000){ a.classList.remove("ativa"); this.setAttribute("aria-expanded","false"); return; }
      ativa(a);
    });
    if(rato) a.addEventListener("mouseenter", function(){ if(window.innerWidth >= 1000) ativa(a); });
  });
  // links "#area-n" (mosaicos da abertura) abrem a área certa
  function daHash(){
    var m = /^#area-([1-4])$/.exec(location.hash);
    if(m){ var a = document.getElementById("area-" + m[1]); if(a) ativa(a); }
  }
  window.addEventListener("hashchange", daHash); daHash();

  /* ---------- método: a fase em foco acende e o medidor acompanha ---------- */
  var fases = Array.prototype.slice.call(document.querySelectorAll(".fase"));
  var medN = document.getElementById("medidor-n"), medNome = document.getElementById("medidor-nome"), medBarra = document.getElementById("medidor-barra");
  function marcaFase(f){
    fases.forEach(function(x){ x.classList.toggle("ativa", x === f); });
    if(medN) medN.textContent = f.dataset.fase;
    if(medNome) medNome.textContent = f.dataset.nome;
    if(medBarra) medBarra.style.setProperty("--prog", f.dataset.fase / 4);
  }
  if(fases.length){
    marcaFase(fases[0]);
    if("IntersectionObserver" in window){
      var iof = new IntersectionObserver(function(es){
        es.forEach(function(e){ if(e.isIntersecting) marcaFase(e.target); });
      }, { rootMargin:"-45% 0px -45% 0px" });
      fases.forEach(function(f){ iof.observe(f); });
    }
  }
})();
