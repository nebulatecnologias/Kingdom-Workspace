/* Advising com O Conselheiro: efeitos da página de vendas.
   JavaScript simples, sem bibliotecas. Sem JavaScript, tudo continua visível. */
(function(){
  "use strict";
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var milhares = function(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); };

  /* ---------- entrar ao deslizar (com pequeno atraso entre irmãos) ---------- */
  var revelaveis = $$(".revela, [data-desenho]");
  revelaveis.forEach(function(el){
    if(!el.classList.contains("revela")) return;
    var irmaos = Array.prototype.filter.call(el.parentNode.children, function(c){ return c.classList.contains("revela"); });
    var i = irmaos.indexOf(el);
    if(i > 0) el.style.setProperty("--atraso", Math.min(i * 0.08, 0.4) + "s");
  });
  if("IntersectionObserver" in window && !reduz){
    var io = new IntersectionObserver(function(entradas){
      entradas.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add("visto"); io.unobserve(e.target); }
      });
    }, { rootMargin:"0px 0px -10% 0px", threshold:0.12 });
    revelaveis.forEach(function(el){ io.observe(el); });
  } else {
    revelaveis.forEach(function(el){ el.classList.add("visto"); });
  }

  /* ---------- barra de cima e janela que endireita ---------- */
  var barra = $("#barra"), janela = $("#janela"), pedido = false;
  function aoRolar(){
    pedido = false;
    var y = window.scrollY || window.pageYOffset;
    barra.classList.toggle("rolou", y > 12);
    if(janela && !reduz){
      var p = Math.min(Math.max(y / 520, 0), 1);
      janela.style.setProperty("--rx", (16 * (1 - p)).toFixed(2) + "deg");
      janela.style.setProperty("--sc", (0.93 + 0.07 * p).toFixed(4));
    }
  }
  window.addEventListener("scroll", function(){ if(!pedido){ pedido = true; requestAnimationFrame(aoRolar); } }, { passive:true });
  if(janela && reduz){ janela.style.setProperty("--rx", "0deg"); janela.style.setProperty("--sc", "1"); }
  aoRolar();

  /* ---------- luz que segue o rato ---------- */
  $$(".holofote").forEach(function(c){
    c.addEventListener("pointermove", function(e){
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- separadores que seguem a leitura ---------- */
  var sep = $("#separadores");
  if(sep){
    var ind = $(".indicador", sep), links = $$("a", sep);
    var pilares = links.map(function(a){ return document.querySelector(a.getAttribute("href")); });
    var mover = function(a){
      links.forEach(function(l){ l.classList.toggle("activo", l === a); });
      ind.style.width = a.offsetWidth + "px";
      ind.style.transform = "translateX(" + a.offsetLeft + "px)";
      if(sep.scrollWidth > sep.clientWidth) sep.scrollTo({ left:a.offsetLeft - 20, behavior:reduz ? "auto" : "smooth" });
    };
    var visivel = {};
    if("IntersectionObserver" in window){
      var iop = new IntersectionObserver(function(es){
        es.forEach(function(e){ visivel[e.target.id] = e.intersectionRatio; });
        var melhor = null, max = 0;
        pilares.forEach(function(p, i){ if((visivel[p.id] || 0) > max){ max = visivel[p.id]; melhor = links[i]; } });
        if(melhor) mover(melhor);
      }, { threshold:[0, .15, .3, .45, .6, .75, .9, 1], rootMargin:"-20% 0px -30% 0px" });
      pilares.forEach(function(p){ iop.observe(p); });
    }
    requestAnimationFrame(function(){ mover($(".activo", sep) || links[0]); });
    window.addEventListener("resize", function(){ mover($(".activo", sep) || links[0]); });
  }

  /* ---------- fluxo do Advising: os passos acendem um a um ---------- */
  var fluxo = $("#fluxo");
  if(fluxo){
    var nos = $$(".no", fluxo), acendeu = false;
    var acender = function(){
      if(acendeu) return; acendeu = true;
      nos.forEach(function(n, i){ setTimeout(function(){ n.classList.add("aceso"); }, reduz ? 0 : 350 + i * 550); });
    };
    if("IntersectionObserver" in window){
      var iof = new IntersectionObserver(function(es){ if(es[0].isIntersecting){ acender(); iof.disconnect(); } }, { threshold:.4 });
      iof.observe(fluxo);
    } else acender();
  }

  /* ---------- Raio-X rápido ---------- */
  var AREAS = ["vendas", "equipa", "processos", "delegacao", "direccao"];
  var NOMES = { vendas:"Vendas", equipa:"Equipa", processos:"Processos", delegacao:"Delegação", direccao:"Direcção" };
  var PESOS = {
    vendas:{ vendas:3, direccao:1 },
    equipa:{ equipa:3, processos:1 },
    dono:{ delegacao:3, equipa:1 },
    processos:{ processos:3, delegacao:1 },
    sobrecarga:{ delegacao:2, processos:1, direccao:1 },
    ideia:{ direccao:3, vendas:1 },
    conhecimento:{ vendas:2, direccao:2 },
    decisao:{ direccao:3 }
  };
  var COMECO = {
    vendas:"Começaríamos pelas vendas: perceber se o que trava está na oferta, no posicionamento ou no processo comercial, antes de pôr mais esforço no mesmo sítio.",
    equipa:"Começaríamos pela equipa: clarificar funções, metas e responsáveis, para perceber se o problema é de performance, de organização ou de execução.",
    processos:"Começaríamos pelos processos: identificar o que precisa de ser organizado primeiro para o resto deixar de travar.",
    delegacao:"Começaríamos pela tua dependência da operação: o que só tu podes fazer, o que pode ser delegado e por onde começar a sair.",
    direccao:"Começaríamos pela direcção: separar o essencial do acessório e definir a próxima decisão, com prioridades claras."
  };
  var sintomas = $("#sintomas");
  if(sintomas){
    var poligono = $("#radar-area"), lista = $("#areas"), titulo = $("#por-onde-titulo"), texto = $("#por-onde-texto"),
        botao = $("#por-onde-botao"), contagem = $("#contagem-sinais"), nome = $("#nome-negocio"), nomeSaida = $("#nome-saida");
    var actual = [0, 0, 0, 0, 0], animacao = null;
    var ponto = function(i, v){
      var a = (-90 + 72 * i) * Math.PI / 180, r = 80 * Math.max(v, 0.04);
      return (100 + r * Math.cos(a)).toFixed(1) + "," + (100 + r * Math.sin(a)).toFixed(1);
    };
    var desenhar = function(vals){ poligono.setAttribute("points", vals.map(function(v, i){ return ponto(i, v); }).join(" ")); };
    var animarPara = function(alvo){
      if(animacao) cancelAnimationFrame(animacao);
      if(reduz){ actual = alvo.slice(); desenhar(actual); return; }
      var inicio = actual.slice(), t0 = performance.now();
      var passo = function(t){
        var k = Math.min((t - t0) / 600, 1), e = 1 - Math.pow(1 - k, 3);
        actual = inicio.map(function(v, i){ return v + (alvo[i] - v) * e; });
        desenhar(actual);
        if(k < 1) animacao = requestAnimationFrame(passo);
      };
      animacao = requestAnimationFrame(passo);
    };
    var calcular = function(){
      var soma = { vendas:0, equipa:0, processos:0, delegacao:0, direccao:0 }, n = 0;
      $$("input:checked", sintomas).forEach(function(c){
        n++;
        var p = PESOS[c.value]; for(var k in p) soma[k] += p[k];
      });
      var vals = AREAS.map(function(a){ return Math.min(soma[a] / 6, 1); });
      contagem.textContent = n === 1 ? "1 sinal" : n + " sinais";
      AREAS.forEach(function(a, i){
        var li = $('[data-area="' + a + '"]', lista);
        $("b", li).textContent = Math.round(vals[i] * 100) + "%";
        $("i", li).style.setProperty("--s", vals[i]);
      });
      animarPara(vals);
      if(n === 0){
        titulo.textContent = "Por onde começar";
        texto.textContent = "Marca pelo menos um sinal ao lado para veres onde está a maior pressão.";
        botao.hidden = true;
        return;
      }
      var topo = 0; vals.forEach(function(v, i){ if(v > vals[topo]) topo = i; });
      titulo.textContent = "Maior pressão: " + NOMES[AREAS[topo]] + " (" + Math.round(vals[topo] * 100) + "%)";
      texto.textContent = COMECO[AREAS[topo]];
      botao.hidden = false;
    };
    sintomas.addEventListener("change", calcular);
    nome.addEventListener("input", function(){
      var v = nome.value.trim();
      nomeSaida.textContent = v || "O teu negócio";
    });
    calcular();
  }

  /* ---------- carrossel ---------- */
  var SLIDES = [
    { t:"O negócio estagnou.", p:"As vendas deixaram de crescer e já tentaste de tudo um pouco. O Raio-X separa o que é sintoma do que é causa, e o plano diz o que mudar primeiro.",
      ini:"LM", nome:"Loja Marés", sector:"Comércio", g:"A oferta é igual à da concorrência.",
      l:["Rever o posicionamento e a oferta", "Definir uma meta de vendas mensal", "Acompanhar dois indicadores por semana"], prox:"Esta semana: falar com 10 clientes actuais." },
    { t:"A equipa não entrega.", p:"Há gente a trabalhar muito e pouco a sair. Na sessão percebemos se o problema é de performance, de organização ou de execução, e o que resolver primeiro.",
      ini:"AK", nome:"Atelier Kumbi", sector:"Serviços", g:"Funções e metas pouco claras.",
      l:["Definir um responsável por área", "Metas individuais para o trimestre", "Reunião semanal de 30 minutos"], prox:"Esta semana: escrever o papel de cada pessoa." },
    { t:"Tudo depende de ti.", p:"Se paras, a empresa pára. O plano mostra o que só tu podes fazer, o que pode ser delegado e por onde começar a sair da operação.",
      ini:"OB", nome:"Oficina Baobá", sector:"Indústria", g:"Todas as decisões passam pelo dono.",
      l:["Listar as decisões que podem ser delegadas", "Documentar três processos-chave", "Escolher um braço direito"], prox:"Esta semana: registar onde vai o teu tempo." },
    { t:"A ideia não sai do papel.", p:"Tens a ideia, mas não sabes se vale a pena nem por onde começar. Saímos com os passos para validar, estruturar e dar o primeiro passo.",
      ini:"MA", nome:"Projecto Maré Alta", sector:"Ideia de negócio", g:"A ideia ainda não foi validada.",
      l:["Validar o problema com 10 potenciais clientes", "Definir a oferta mínima", "Testar o primeiro preço"], prox:"Esta semana: marcar as primeiras 5 conversas." },
    { t:"Sabes muito, mas não facturas com isso.", p:"O teu conhecimento tem valor, falta-lhe um modelo. Clarificamos o posicionamento, a oferta e o caminho de monetização.",
      ini:"CA", nome:"Consultoria Acácia", sector:"Especialista", g:"Conhecimento sem modelo de negócio.",
      l:["Escolher um público principal", "Desenhar uma oferta clara", "Definir o canal de venda"], prox:"Esta semana: escrever a oferta numa frase." }
  ];
  var car = $("#carrossel");
  if(car){
    var idx = 0, temporizador = null, marcadores = $("#car-marcadores"), trocas = $$("[data-troca]", car);
    SLIDES.forEach(function(s, i){
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("aria-label", "Exemplo " + (i + 1) + ": " + s.t);
      b.addEventListener("click", function(){ ir(i); reiniciar(); });
      marcadores.appendChild(b);
    });
    var pintar = function(){
      var s = SLIDES[idx];
      $("#car-contagem").textContent = (idx + 1) + " / " + SLIDES.length;
      $("#car-titulo").textContent = s.t;
      $("#car-texto").textContent = s.p;
      $("#tel-inic").textContent = s.ini;
      $("#tel-nome").textContent = s.nome;
      $("#tel-sector").textContent = s.sector + " · Plano de acção";
      $("#tel-gargalo").textContent = s.g;
      $("#tel-passo").textContent = s.prox;
      var ul = $("#tel-lista"); ul.textContent = "";
      s.l.forEach(function(item, i){
        var li = document.createElement("li"), n = document.createElement("i");
        n.textContent = i + 1; li.appendChild(n); li.appendChild(document.createTextNode(item)); ul.appendChild(li);
      });
      $$("button", marcadores).forEach(function(b, i){ b.classList.toggle("activo", i === idx); b.setAttribute("aria-current", i === idx ? "true" : "false"); });
    };
    var ir = function(n){
      var novo = (n + SLIDES.length) % SLIDES.length;
      if(novo === idx && marcadores.querySelector(".activo")) return;
      idx = novo;
      if(reduz){ pintar(); return; }
      trocas.forEach(function(t){ t.classList.add("sai"); });
      setTimeout(function(){ pintar(); trocas.forEach(function(t){ t.classList.remove("sai"); }); }, 320);
    };
    var reiniciar = function(){
      clearInterval(temporizador);
      if(!reduz) temporizador = setInterval(function(){ ir(idx + 1); }, 7000);
    };
    $("#car-ant").addEventListener("click", function(){ ir(idx - 1); reiniciar(); });
    $("#car-seg").addEventListener("click", function(){ ir(idx + 1); reiniciar(); });
    car.addEventListener("pointerenter", function(){ clearInterval(temporizador); });
    car.addEventListener("pointerleave", reiniciar);
    var x0 = null;
    car.addEventListener("touchstart", function(e){ x0 = e.touches[0].clientX; }, { passive:true });
    car.addEventListener("touchend", function(e){
      if(x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if(Math.abs(dx) > 45){ ir(idx + (dx < 0 ? 1 : -1)); reiniciar(); }
    }, { passive:true });
    pintar(); reiniciar();
  }

  /* ---------- preços: os números correm até ao valor ---------- */
  var valores = $$("[data-valor]");
  if(valores.length && "IntersectionObserver" in window && !reduz){
    var correr = function(el){
      var fim = +el.getAttribute("data-valor"), t0 = performance.now();
      var passo = function(t){
        var k = Math.min((t - t0) / 700, 1), e = 1 - Math.pow(1 - k, 3);
        el.textContent = milhares(fim * e);
        if(k < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    };
    var iov = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ correr(e.target); iov.unobserve(e.target); } });
    }, { threshold:.6 });
    valores.forEach(function(v){ iov.observe(v); });
  }

  /* ---------- perguntas ---------- */
  $$(".pergunta-item button").forEach(function(b){
    b.addEventListener("click", function(){
      var item = b.parentNode, aberta = !item.classList.contains("aberta");
      item.classList.toggle("aberta", aberta);
      b.setAttribute("aria-expanded", aberta ? "true" : "false");
    });
  });

  /* ---------- estrelas no fecho ---------- */
  var canvas = $("#estrelas");
  if(canvas && canvas.getContext){
    var ctx = canvas.getContext("2d"), estrelas = [], w = 0, h = 0, dpr = 1, aVer = false, raf = null;
    var medir = function(){
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(w * h / 5200);
      estrelas = [];
      for(var i = 0; i < n; i++) estrelas.push({ x:Math.random() * w, y:Math.random() * h, r:0.25 + Math.random() * 1.1, f:Math.random() * 6.28, v:0.4 + Math.random() * 1.4, d:0.02 + Math.random() * 0.06 });
    };
    var pintarCeu = function(t){
      ctx.clearRect(0, 0, w, h);
      for(var i = 0; i < estrelas.length; i++){
        var s = estrelas[i];
        var a = reduz ? 0.6 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.f + t * 0.001 * s.v));
        if(!reduz){ s.y -= s.d; if(s.y < -2){ s.y = h + 2; s.x = Math.random() * w; } }
        ctx.globalAlpha = a; ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    var ciclo = function(t){ pintarCeu(t); if(aVer && !reduz) raf = requestAnimationFrame(ciclo); };
    medir(); pintarCeu(0);
    window.addEventListener("resize", function(){ medir(); pintarCeu(performance.now()); });
    if("IntersectionObserver" in window){
      new IntersectionObserver(function(es){
        aVer = es[0].isIntersecting;
        if(aVer && !reduz){ cancelAnimationFrame(raf); raf = requestAnimationFrame(ciclo); }
      }).observe(canvas);
    }
  }
})();
