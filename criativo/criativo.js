/* O Criativo que Aprendeu a Vender: o que é próprio desta página. O resto vem de site.js. */
(function(){
  "use strict";
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* a conversa: alternar entre antes e depois; vira sozinha uma vez, se ninguém mexer */
  var seccao = document.getElementById("conversa");
  if(!seccao) return;
  var botoes = seccao.querySelectorAll(".alternar button"), mexeu = false;
  var mostra = function(estado){
    seccao.setAttribute("data-estado", estado);
    botoes.forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-ver") === estado ? "true" : "false"); });
  };
  botoes.forEach(function(b){ b.addEventListener("click", function(){ mexeu = true; mostra(b.getAttribute("data-ver")); }); });
  if(!reduz && "IntersectionObserver" in window){
    var io = new IntersectionObserver(function(es){
      if(!es[0].isIntersecting) return;
      io.disconnect();
      setTimeout(function(){ if(!mexeu) mostra("depois"); }, 4200);
    }, { threshold:.5 });
    io.observe(seccao.querySelector(".telefone"));
  }
})();
