(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile menu ---------- */
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  menuBtn.addEventListener('click', () => {
    const hidden = mobileMenu.classList.toggle('hidden');
    menuBtn.setAttribute('aria-expanded', String(!hidden));
  });
  mobileMenu.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
    })
  );

  /* ---------- scroll progress + nav state + parallax ---------- */
  const progress = document.getElementById('progress');
  const navInner = document.getElementById('nav-inner');
  const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    navInner.classList.toggle('py-2', y > 40);
    navInner.classList.toggle('py-3', y <= 40);
    navInner.classList.toggle('bg-black/80', y > 40);

    if (!reduced) {
      for (const el of parallaxEls) {
        el.style.transform = `translate3d(0, ${y * parseFloat(el.dataset.parallax)}px, 0)`;
      }
    }
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true }
  );
  onScroll();

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- cursor spotlight on cards ---------- */
  if (!reduced && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.spotlight').forEach((card) => {
      card.addEventListener('pointermove', (ev) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${ev.clientX - r.left}px`);
        card.style.setProperty('--my', `${ev.clientY - r.top}px`);
      });
    });

    /* ---------- magnetic buttons ---------- */
    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      btn.addEventListener('pointermove', (ev) => {
        const r = btn.getBoundingClientRect();
        const dx = (ev.clientX - (r.left + r.width / 2)) * 0.18;
        const dy = (ev.clientY - (r.top + r.height / 2)) * 0.3;
        btn.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transition = 'transform .45s cubic-bezier(.16,1,.3,1)';
        btn.style.transform = '';
        setTimeout(() => (btn.style.transition = ''), 450);
      });
    });
  }

  /* ---------- count up ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const run = (el) => {
      const target = parseInt(el.dataset.count, 10);
      if (reduced) {
        el.textContent = String(target);
        return;
      }
      const start = performance.now();
      const dur = 900;
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if ('IntersectionObserver' in window) {
      const cio = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              run(e.target);
              cio.unobserve(e.target);
            }
          }
        },
        { threshold: 0.6 }
      );
      counters.forEach((el) => cio.observe(el));
    } else {
      counters.forEach(run);
    }
  }

  /* ---------- online / presencial toggle ---------- */
  const toggle = document.getElementById('format-toggle');
  const knob = document.getElementById('toggle-knob');
  const panelOnline = document.getElementById('panel-online');
  const panelPresencial = document.getElementById('panel-presencial');
  const labelOnline = document.getElementById('label-online');
  const labelPresencial = document.getElementById('label-presencial');

  toggle.addEventListener('click', () => {
    const presencial = toggle.getAttribute('aria-checked') !== 'true';
    toggle.setAttribute('aria-checked', String(presencial));
    knob.style.transform = presencial ? 'translateX(24px)' : '';
    panelOnline.classList.toggle('hidden', presencial);
    panelPresencial.classList.toggle('hidden', !presencial);
    labelOnline.classList.toggle('text-white', !presencial);
    labelOnline.classList.toggle('text-muted', presencial);
    labelPresencial.classList.toggle('text-white', presencial);
    labelPresencial.classList.toggle('text-muted', !presencial);
  });
})();
