/* Escala Previsível: o que é próprio desta página. O resto vem de site.js. */
(function(){
  "use strict";
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var milhares = function(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); };

  /* números da prova: correm até ao valor, com o prefixo e a unidade */
  var nums = document.querySelectorAll("[data-contar]");
  if(nums.length && "IntersectionObserver" in window && !reduz){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, fim = +el.getAttribute("data-contar"), pre = el.getAttribute("data-prefixo") || "";
        var unidade = el.querySelector("small"), suf = unidade ? unidade.outerHTML : "", t0 = performance.now();
        (function passo(t){
          var k = Math.min((t - t0) / 1400, 1), e2 = 1 - Math.pow(1 - k, 4);
          el.innerHTML = pre + milhares(fim * e2) + suf;
          if(k < 1) requestAnimationFrame(passo);
        })(t0);
      });
    }, { threshold:.5 });
    nums.forEach(function(el){ io.observe(el); });
  }

  /* caso de sucesso: comparar antes e depois */
  document.querySelectorAll(".comparar-fotos").forEach(function(caixa){
    var r = caixa.querySelector("input[type=range]");
    if(!r) return;
    var por = function(){ caixa.style.setProperty("--pos", r.value + "%"); };
    r.addEventListener("input", por); por();
  });
})();
