/* O Bloqueio Invisível: o que é próprio desta página. O resto vem de site.js. */
(function(){
  "use strict";
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* espelho: o que está por baixo de cada frase fica nítido à medida que desces */
  var verdades = document.querySelectorAll(".reflexo .verdade");
  if(verdades.length && !reduz){
    var pedido = false;
    var nitidez = function(){
      pedido = false;
      var vh = window.innerHeight;
      verdades.forEach(function(el){
        var topo = el.getBoundingClientRect().top;
        var n = Math.min(Math.max((vh * 0.88 - topo) / (vh * 0.3), 0), 1);
        el.style.setProperty("--n", n.toFixed(3));
      });
    };
    window.addEventListener("scroll", function(){ if(!pedido){ pedido = true; requestAnimationFrame(nitidez); } }, { passive:true });
    window.addEventListener("resize", nitidez);
    nitidez();
  }

  /* como funciona: cada passo acende quando chega ao meio do ecrã, e fica aceso */
  var passos = document.querySelectorAll(".mapa-passos .passo");
  if(passos.length){
    if(reduz || !("IntersectionObserver" in window)){
      passos.forEach(function(p){ p.classList.add("aceso"); });
    } else {
      var io = new IntersectionObserver(function(es){
        es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("aceso"); io.unobserve(e.target); } });
      }, { rootMargin:"0px 0px -45% 0px" });
      passos.forEach(function(p){ io.observe(p); });
    }
  }
})();
