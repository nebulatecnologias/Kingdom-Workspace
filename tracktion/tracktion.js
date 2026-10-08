/* Kingdom Tracktion: revelar ao rolar, topo sólido depois do herói e ligação da candidatura num só sítio. */
(function(){
  "use strict";

  /* Quando houver link do formulário, basta colocá-lo aqui: todos os botões "Candidatar-me" passam a usá-lo. */
  var LINK_CANDIDATURA = "";
  if(LINK_CANDIDATURA){
    document.querySelectorAll("[data-candidatura]").forEach(function(a){
      a.href = LINK_CANDIDATURA; a.target = "_blank"; a.rel = "noopener";
    });
  }

  var topo = document.getElementById("topo");
  var rolar = function(){ topo.classList.toggle("rolado", window.scrollY > 40); };
  window.addEventListener("scroll", rolar, { passive:true });
  rolar();

  var revelaveis = document.querySelectorAll(".revela");
  if(!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    revelaveis.forEach(function(el){ el.classList.add("visto"); });
    return;
  }
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("visto"); io.unobserve(e.target); } });
  }, { rootMargin:"0px 0px -8% 0px", threshold:0.08 });
  revelaveis.forEach(function(el){ io.observe(el); });
})();
