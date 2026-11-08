// Kingdom Company · comportamento da página
(() => {
  const topo = document.getElementById('topo');
  const abertura = document.querySelector('.abertura');
  const menu = topo && topo.querySelector('.menu');
  const nav = document.getElementById('nav');

  // Topo: transparente sobre a abertura, sólido no resto da página
  if (topo && abertura && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => topo.classList.toggle('solido', !e.isIntersecting), { rootMargin: `-${topo.offsetHeight}px 0px 0px 0px` }).observe(abertura);
  } else if (topo) {
    topo.classList.add('solido');
  }

  // Menu no telemóvel
  const fechar = () => { topo.classList.remove('aberto'); menu.setAttribute('aria-expanded', 'false'); menu.querySelector('span').textContent = 'Menu'; };
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const aberto = topo.classList.toggle('aberto');
      menu.setAttribute('aria-expanded', String(aberto));
      menu.querySelector('span').textContent = aberto ? 'Fechar' : 'Menu';
      menu.querySelector('use').setAttribute('href', aberto ? '#i-fechar' : '#i-menu');
      if (aberto) nav.querySelector('a').focus();
    });
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) { fechar(); menu.querySelector('use').setAttribute('href', '#i-menu'); } });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && topo.classList.contains('aberto')) { fechar(); menu.querySelector('use').setAttribute('href', '#i-menu'); menu.focus(); } });
  }

  // Atalhos das áreas: leva à linha da área e acende-a por um momento
  document.querySelectorAll('[data-area]').forEach((a) => {
    a.addEventListener('click', () => {
      const alvo = document.getElementById(a.dataset.area);
      if (!alvo) return;
      alvo.classList.remove('realce');
      void alvo.offsetWidth;
      alvo.classList.add('realce');
      setTimeout(() => alvo.classList.remove('realce'), 900);
      const titulo = alvo.querySelector('h3 a');
      if (titulo) setTimeout(() => titulo.focus({ preventScroll: true }), 500);
    });
  });
})();
