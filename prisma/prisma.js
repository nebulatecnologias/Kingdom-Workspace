/* O Prisma da Influência: o que é próprio desta página. O resto vem de site.js. */
(function(){
  "use strict";
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mapa: o ponto "Tu" sai de Invisível e chega a Autoridade à medida que desces */
  var mapa = document.getElementById("mapa-grafico");
  if(mapa && !reduz){
    var pedido = false;
    var anda = function(){
      pedido = false;
      var r = mapa.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(Math.max((vh * 0.85 - r.top) / (vh * 0.6), 0), 1);
      mapa.style.setProperty("--p", p.toFixed(3));
    };
    window.addEventListener("scroll", function(){ if(!pedido){ pedido = true; requestAnimationFrame(anda); } }, { passive:true });
    window.addEventListener("resize", anda);
    anda();
  }
})();
