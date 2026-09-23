/* Kingdom Members — clickable prototype. All data below is synthetic sample data. */
const TODAY = new Date('2026-09-23T10:00:00');
const DAY = 864e5;

const PACKS = [
  { id: 'noah', art: ['ark', 'dove', 'rainbow'], field: '#d6ebf8', pages: 12, price: 89, vis: 'visible', access: 'paid', gid: 'prod_noah_ark', size: '8,4 MB' },
  { id: 'creation', art: ['sky', 'tree', 'fish'], field: '#ffe6b3', pages: 10, price: 89, vis: 'visible', access: 'paid', gid: 'prod_creation', size: '7,1 MB' },
  { id: 'shepherd', art: ['lamb', 'shepherd'], field: '#d9eed0', pages: 8, price: 69, vis: 'visible', access: 'paid', gid: 'prod_good_shepherd', size: '5,6 MB' },
  { id: 'christmas', art: ['stable', 'manger', 'gifts'], field: '#f8d5cf', pages: 12, price: 99, vis: 'visible', access: 'paid', gid: 'prod_first_christmas', size: '9,2 MB' },
  { id: 'jonah', art: ['whale', 'boat'], field: '#cbedee', pages: 8, price: 69, vis: 'visible', access: 'paid', gid: 'prod_jonah', size: '5,9 MB' },
  { id: 'verses', art: ['heart', 'bible'], field: '#e8e2fb', pages: 6, price: 0, vis: 'visible', access: 'free', gid: 'prod_verse_cards', size: '2,3 MB' },
  { id: 'daniel', art: ['lion'], field: '#f3e0c3', pages: 8, price: 69, vis: 'soon', access: 'paid', gid: 'prod_daniel', size: '—' },
  { id: 'easter', art: ['heart'], field: '#fde0c6', pages: 10, price: 89, vis: 'hidden', access: 'paid', gid: 'prod_easter', size: '—' },
];
const P = Object.fromEntries(PACKS.map(p => [p.id, p]));

const state = {
  lang: 'en',
  user: { name: 'Thandi Mokoena', first: 'Thandi', email: 'thandi.mokoena@example.co.za', hasPw: true },
  owned: new Set(['noah', 'creation']),
  order: PACKS.map(p => p.id),
  filter: 'all', q: '', justJoined: false,
  dialog: null, menu: false, proto: false,
  crayon: '#f2594b', fills: {},
  loginMode: 'link', loginEmail: 'thandi.mokoena@example.co.za', accessSent: null,
  invFilter: 'all', invQ: '', revoking: null,
  memQ: '', edTab: 'details', edLang: 'en', edPreview: 'locked', secretShown: false,
  profDelete: false, mailTab: 'invite',
  invites: [
    { id: 1, name: 'Pieter van der Merwe', email: 'pieter.vdm@example.co.za', packs: ['shepherd'], lang: 'en', sent: -6.8, exp: 5.705, status: 'opened', src: 'gateway' },
    { id: 2, name: 'Ana Sitoe', email: 'ana.sitoe@example.co.mz', packs: ['christmas'], lang: 'pt', sent: -4, exp: 72, status: 'sent', src: 'gateway' },
    { id: 3, name: 'Lerato Dlamini', email: 'lerato.dlamini@example.co.za', packs: ['noah', 'creation'], lang: 'en', sent: -1, exp: 144, status: 'sent', src: 'gateway' },
    { id: 4, name: 'Carmen Ruiz', email: 'carmen.ruiz@example.es', packs: ['noah'], lang: 'es', sent: -0.2, exp: 163, status: 'opened', src: 'gateway' },
    { id: 5, name: 'Grace Mahlangu', email: 'grace.m@example.co.za', packs: ['jonah', 'shepherd'], lang: 'en', sent: -2, exp: 120, status: 'sent', src: 'manual' },
    { id: 6, name: 'Sipho Nkosi', email: 'sipho.nkosi@example.co.za', packs: ['jonah'], lang: 'en', sent: -3, exp: 0, status: 'accepted', src: 'gateway' },
    { id: 7, name: 'Chantelle Adams', email: 'chantelle.a@example.co.za', packs: ['creation'], lang: 'en', sent: -9, exp: -48, status: 'expired', src: 'gateway' },
    { id: 8, name: 'Johan Botha', email: 'johan.botha@example.co.za', packs: ['noah'], lang: 'en', sent: -5, exp: 0, status: 'revoked', src: 'manual' },
    { id: 9, name: 'Ayesha Patel', email: 'ayesha.patel@example.co.za', packs: ['christmas', 'shepherd'], lang: 'en', sent: -12, exp: 0, status: 'accepted', src: 'gateway' },
  ],
  members: [
    { id: 'm1', name: 'Thandi Mokoena', email: 'thandi.mokoena@example.co.za', packs: ['noah', 'creation'], lang: 'en', joined: 0, seen: 0, active: true },
    { id: 'm2', name: 'Sipho Nkosi', email: 'sipho.nkosi@example.co.za', packs: ['jonah', 'noah'], lang: 'en', joined: 3, seen: 0, active: true },
    { id: 'm3', name: 'Ayesha Patel', email: 'ayesha.patel@example.co.za', packs: ['christmas', 'shepherd', 'noah'], lang: 'en', joined: 12, seen: 1, active: true },
    { id: 'm4', name: 'Mariana Cossa', email: 'mariana.cossa@example.co.mz', packs: ['noah'], lang: 'pt', joined: 8, seen: 1, active: true },
    { id: 'm5', name: 'Naledi Khumalo', email: 'naledi.k@example.co.za', packs: ['creation'], lang: 'en', joined: 20, seen: 2, active: true },
    { id: 'm6', name: 'Lucía Fernández', email: 'lucia.fernandez@example.es', packs: ['creation', 'jonah'], lang: 'es', joined: 15, seen: 3, active: true },
    { id: 'm7', name: 'Ruth Petersen', email: 'ruth.petersen@example.co.za', packs: ['noah', 'creation', 'shepherd', 'jonah'], lang: 'en', joined: 41, seen: 5, active: true },
    { id: 'm8', name: 'Kagiso Molefe', email: 'kagiso.molefe@example.co.za', packs: ['shepherd'], lang: 'en', joined: 30, seen: 19, active: false },
  ],
  feed: [
    { k: 'created', who: 'Thandi Mokoena', time: '11:48' },
    { k: 'paid', who: 'Pieter van der Merwe', ref: 'KG-8F3K2', time: '11:42' },
    { k: 'unlocked', who: 'Ayesha Patel', pack: 'christmas', time: '10:15' },
    { k: 'opened', who: 'Carmen Ruiz', time: '09:58' },
    { k: 'refund', ref: 'KG-2LQ9A', time: '08:31' },
    { k: 'paid', who: 'Ana Sitoe', ref: 'KG-7HX4M', time: '07:12' },
  ],
  deliveries: [
    { ev: 'order.paid', ref: 'KG-20260923-8F3K2', time: '11:42:07', res: 'ok' },
    { ev: 'order.paid', ref: 'KG-20260923-8F3K2', time: '11:42:39', res: 'dup' },
    { ev: 'order.refunded', ref: 'KG-20260923-2LQ9A', time: '08:31:15', res: 'ok' },
    { ev: 'order.paid', ref: 'KG-20260923-7HX4M', time: '07:12:51', res: 'ok' },
    { ev: 'order.paid', ref: '—', time: '03:04:22', res: 'bad' },
  ],
};

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function t(k, vars = {}) {
  let s = (I18N[state.lang] && I18N[state.lang][k]) ?? I18N.en[k] ?? k;
  for (const [a, b] of Object.entries(vars)) s = s.split('{' + a + '}').join(b);
  return s;
}
const loc = () => LOCALES[state.lang];
const money = (n) => new Intl.NumberFormat(loc(), { style: 'currency', currency: 'ZAR' }).format(n);
const fmtDate = (d) => new Intl.DateTimeFormat(loc(), { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
const fmtShort = (d) => new Intl.DateTimeFormat(loc(), { day: 'numeric', month: 'short' }).format(d);
const pt = (id) => (PACK_TEXT[state.lang] || PACK_TEXT.en)[id];
const artT = (a) => (ART_TITLE[state.lang] || ART_TITLE.en)[a];
const owns = (p) => p.access === 'free' || state.owned.has(p.id);
const initials = (n) => n.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const AV = ['#f4621d', '#564cc9', '#17a34a', '#1f5f9a', '#b8400a', '#8a5b00', '#b4202d', '#0f7a6c'];
const avColor = (n) => AV[[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % AV.length];
const avatar = (n, size = 36) => `<span class="avatar" style="background:${avColor(n)};width:${size}px;height:${size}px">${initials(n)}</span>`;
function relDays(n) { return n <= 0 ? t('today') : n === 1 ? t('yesterday') : t('daysAgo', { n }); }
function durH(h) {
  if (h >= 48) return t('days', { n: Math.round(h / 24) });
  const H = Math.floor(h), M = Math.round((h - H) * 60);
  return `${H} h ${String(M).padStart(2, '0')} min`;
}

const ICONS = {
  library: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7"/><path d="M12 17h.01"/>',
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14a6 6 0 0 1 3.5 6"/>',
  store: '<path d="M3 9 4.5 4h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8"/><path d="M10 20v-5h4v5"/>',
  plug: '<path d="M9 2v6M15 2v6"/><path d="M6 8h12v4a6 6 0 0 1-12 0z"/><path d="M12 18v4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 20h16"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.5-1.9-.3-1 .4-2.1 1.5-2.1H17a4 4 0 0 0 4-4c0-5.5-4-10-9-10z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10.5" cy="7" r="1.2"/><circle cx="15.5" cy="7.5" r="1.2"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
  refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5M3 21v-5h5"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/>',
  send: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  grip: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
  upload: '<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M4 4h16"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a2 2 0 0 0 3.4 0"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  message: '<path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5z"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.3-9.3M17 6l3 3M15 8l2 2"/>',
  file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  arrowUp: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  arrowDown: '<path d="M12 5v14M6 13l6 6 6-6"/>',
};
const icon = (n, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
let logoN = 0;
const logo = () => { const g = 'km-g' + (++logoN); return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#ff8a4a"/><stop offset=".55" stop-color="#f7662a"/><stop offset="1" stop-color="#e8480c"/></linearGradient></defs><rect width="64" height="64" rx="15" fill="#f4621d"/><rect width="64" height="64" rx="15" fill="url(#${g})"/><path d="M12.5 27.1 23.9 30.7 31.9 17.9 39.9 30.7 49.7 27.1 46.5 44.8H17.7Z" fill="#fff" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/></svg>`; };
const brand = (sub) => `<a class="brand" href="#library" aria-label="Kingdom Members">${logo()}<span><b>Kingdom Members</b>${sub ? `<small>${sub}</small>` : ''}</span></a>`;
const langSelect = (id = 'lang') => `<label class="sr" for="${id}">${t('language')}</label><select class="select lang-select" id="${id}" data-act="lang">${['en', 'pt', 'es'].map(l => `<option value="${l}" ${l === state.lang ? 'selected' : ''}>${t('lang_' + l)}</option>`).join('')}</select>`;
const protoBtn = (cls = '') => `<button class="proto-btn ${cls}" data-act="proto" aria-expanded="${state.proto}" title="${t('protoMap')}">${icon('map', 'icon-sm')}<span>${t('protoMap')}</span></button>`;
const bars = (hs) => `<div class="bars" aria-hidden="true">${hs.map(h => `<i style="height:${h}%"></i>`).join('')}</div>`;

/* ---------- toasts ---------- */
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.innerHTML = icon('check') + `<span>${msg}</span>`;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 3400);
}

/* ---------- routing ---------- */
const route = () => decodeURIComponent(location.hash.slice(1)) || 'library';
const go = (r) => { if (route() === r) render(); else location.hash = r; };
const AUTH = ['invite', 'link-expired', 'link-used', 'login', 'login-sent', 'access'];

/* ---------- pack card ---------- */
function packCard(p, opts = {}) {
  const tx = pt(p.id);
  const own = opts.forceOwned ?? owns(p);
  const soon = p.vis === 'soon';
  const cls = soon ? 'is-soon' : own ? '' : 'is-locked';
  let foot;
  if (soon) foot = `<span class="pill pill-grey">${t('soon')}</span>`;
  else if (own) foot = `<span class="pill pill-green"><span class="dot"></span>${p.access === 'free' ? t('free') : t('unlocked')}</span>`;
  else foot = `<span class="pill pill-orange">${icon('lock', 'icon-sm')}${money(p.price)}</span>`;
  const tag = opts.static ? 'div' : 'button';
  const act = opts.static ? '' : soon ? 'aria-disabled="true"' : own ? `data-go="pack-${p.id}"` : `data-act="checkout" data-id="${p.id}"`;
  return `<${tag} class="pack ${cls}" ${act} ${tag === 'button' ? 'type="button"' : ''} aria-label="${esc(tx.t)}${own ? '' : ' — ' + t('locked')}">
    <div class="pack-cover" style="background:${p.field}">${artSVG(p.art[0], own ? 'color' : 'line')}
      ${!own && !soon ? `<span class="pack-lock">${icon('lock')}</span>` : ''}</div>
    <div class="pack-body"><h3>${esc(tx.t)}</h3>
      <div class="pack-foot"><span class="pack-meta">${t('pages', { n: p.pages })}</span>${foot}</div></div>
  </${tag}>`;
}

/* ---------- member shell ---------- */
function memberShell(active, content) {
  const ownedCount = PACKS.filter(p => p.vis !== 'hidden' && owns(p)).length;
  const nav = [
    ['library', 'library', t('nav_library'), ownedCount],
    ['profile', 'user', t('nav_profile')],
  ];
  return `<div class="app">
    <aside class="sidebar" aria-label="Main">
      ${brand()}
      <nav class="nav">${nav.map(([r, ic, label, badge]) => `<a href="#${r}" ${active === r ? 'aria-current="page"' : ''}>${icon(ic)}${label}${badge ? `<span class="badge">${badge}</span>` : ''}</a>`).join('')}
        <a href="#${route()}" data-act="help">${icon('message')}${t('nav_help')}</a></nav>
      <div class="sidebar-foot">
        ${protoBtn()}
        <div class="user-chip">${avatar(state.user.name)}<div class="who"><b>${esc(state.user.name)}</b><span>${esc(state.user.email)}</span></div>
          <a class="icon-btn" href="#login" title="${t('signOut')}" aria-label="${t('signOut')}">${icon('logout', 'icon-sm')}</a></div>
      </div>
    </aside>
    <div>
      <header class="mobile-bar">${brand()}<div style="display:flex;gap:8px;align-items:center">${protoBtn('icon-only')}${langSelect('lang-m')}<a href="#profile" aria-label="${t('nav_profile')}">${avatar(state.user.name, 36)}</a></div></header>
      <main class="main" id="main">
        <div class="topbar">
          <label class="search">${icon('search')}<span class="sr">${t('searchPacks')}</span><input id="lib-search" type="search" placeholder="${t('searchPacks')}" value="${esc(state.q)}" autocomplete="off"></label>
          <span class="spacer"></span>${langSelect()}
          <button class="icon-btn" data-act="help" aria-label="${t('nav_help')}">${icon('help')}</button>
        </div>
        ${content}
      </main>
    </div>
    <nav class="tabbar" aria-label="Main">
      <a href="#library" ${active === 'library' ? 'aria-current="page"' : ''}>${icon('library')}${t('nav_library')}</a>
      <a href="#profile" ${active === 'profile' ? 'aria-current="page"' : ''}>${icon('user')}${t('nav_profile')}</a>
      <a href="#${route()}" data-act="help">${icon('message')}${t('nav_help')}</a>
    </nav>
  </div>`;
}

function libraryView() {
  const list = state.order.map(id => P[id]).filter(p => p.vis !== 'hidden');
  const mine = list.filter(p => p.vis === 'visible' && owns(p));
  const lockd = list.filter(p => p.vis === 'visible' && !owns(p));
  const cont = P.noah;
  const done = state.owned.has('noah') ? 5 : 0;
  return memberShell('library', `
    ${state.justJoined ? `<div class="notice notice-ok" style="margin-bottom:18px">${icon('check')}<span>${t('lib_welcome')}</span><button class="btn-quiet btn btn-sm" style="margin-left:auto" data-act="dismiss-welcome" aria-label="${t('close')}">${icon('x', 'icon-sm')}</button></div>` : ''}
    <div class="page-head"><div><h1>${t('lib_hello', { name: esc(state.user.first) })}</h1><p>${t('lib_lead')}</p></div></div>
    ${done ? `<div class="card continue">
      <div class="thumb" style="background:${cont.field}">${artSVG('ark')}</div>
      <div style="display:grid;gap:10px;min-width:0">
        <h2>${t('continue_h', { pack: esc(pt('noah').t) })}</h2>
        <div class="progress" role="progressbar" aria-label="${t('continue_p', { done, total: cont.pages })}" aria-valuemin="0" aria-valuemax="${cont.pages}" aria-valuenow="${done}"><i style="width:${(done / cont.pages) * 100}%"></i></div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span class="muted tnum progress-meta" style="font-size:13.5px">${t('continue_p', { done, total: cont.pages })}</span>
        <a class="btn btn-primary btn-sm" href="#pack-noah">${t('open')}${icon('arrowRight', 'icon-sm')}</a></div>
      </div>
    </div>` : ''}
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px">
      <div class="filters scroll" role="group">
        ${[['all', t('filter_all'), list.length], ['mine', t('filter_mine'), mine.length], ['locked', t('filter_locked'), lockd.length]].map(([v, l, n]) => `<button class="filter" data-act="filter" data-v="${v}" aria-pressed="${state.filter === v}">${l}<span class="count">${n}</span></button>`).join('')}
      </div>
    </div>
    <div class="lib-grid" id="lib-grid">${libGrid()}</div>
    <p class="lib-verse"><q>${t('verse_text')}</q> ${t('verse_ref')}</p>`);
}
function libGrid() {
  let list = state.order.map(id => P[id]).filter(p => p.vis !== 'hidden');
  if (state.filter === 'mine') list = list.filter(p => p.vis === 'visible' && owns(p));
  if (state.filter === 'locked') list = list.filter(p => p.vis === 'visible' && !owns(p));
  const q = state.q.trim().toLowerCase();
  if (q) list = list.filter(p => pt(p.id).t.toLowerCase().includes(q));
  if (!list.length) return `<div class="empty" style="grid-column:1/-1">${icon('library')}<p>${q ? t('empty_search', { q: esc(state.q) }) : t('empty_mine')}</p></div>`;
  return list.map(p => packCard(p)).join('');
}

function packView(id) {
  const p = P[id];
  if (!p) return libraryView();
  const tx = pt(id);
  const own = owns(p);
  const extra = p.pages - p.art.length;
  return memberShell('library', `
    <a class="back" href="#library">${icon('chevronLeft', 'icon-sm')}${t('pack_backLib')}</a>
    <section class="pack-hero">
      <div class="cover-lg" style="background:${p.field}">${artSVG(p.art[0], own ? 'color' : 'line')}</div>
      <div>
        ${own ? `<span class="pill pill-green"><span class="dot"></span>${p.access === 'free' ? t('free') : t('unlocked')}</span>` : `<span class="pill pill-orange">${icon('lock', 'icon-sm')}${t('locked')}</span>`}
        <h1 style="margin-top:14px">${esc(tx.t)}</h1>
        <p class="desc">${esc(tx.d)}</p>
        <p class="muted" style="margin-top:12px">“${esc(tx.v)}” · ${esc(tx.r)}</p>
        <div class="facts"><span class="pill pill-grey">${t('pages', { n: p.pages })}</span><span class="pill pill-grey">${t('fact_a4')}</span><span class="pill pill-grey">${t('fact_ages')}</span><span class="pill pill-grey">${t('fact_lang')}</span></div>
        <div class="actions">
          ${own ? `<button class="btn btn-primary btn-lg" data-act="download">${icon('download')}${t('pack_download')}</button>
            <span class="muted" style="align-self:center;font-size:13.5px">${t('pack_file', { size: p.size })}</span>`
          : `<button class="btn btn-primary btn-lg" data-act="checkout" data-id="${id}">${icon('lock')}${t('unlockFor', { price: money(p.price) })}</button>
            <p class="muted" style="flex-basis:100%;font-size:14px">${t('pack_lockedLead')}</p>`}
        </div>
      </div>
    </section>
    <div class="page-head" style="margin-bottom:16px"><h2 style="font-size:21px">${t('pack_pagesTitle')}</h2></div>
    <div class="pages-grid">
      ${p.art.map((a, i) => `<div class="card page-card">
        <div class="sheet">${artSVG(a, 'line')}<span class="num tnum">${i + 1}/${p.pages}</span>${own ? '' : `<span class="pack-lock" style="width:32px;height:32px">${icon('lock', 'icon-sm')}</span>`}</div>
        <h4>${esc(artT(a))}</h4>
        ${own ? `<div class="row"><button class="btn btn-ghost btn-sm" data-act="studio" data-art="${a}">${icon('palette', 'icon-sm')}${t('pack_colour')}</button><button class="btn btn-quiet btn-sm" data-act="download" aria-label="${t('pack_dl')}">${icon('download', 'icon-sm')}${t('pack_dl')}</button></div>` : ''}
      </div>`).join('')}
      ${extra > 0 ? `<div class="more-sheet"><div><b class="tnum">+${extra}</b>${t('pack_more')}</div></div>` : ''}
    </div>`);
}

function profileView() {
  const u = state.user;
  return memberShell('profile', `
    <div class="page-head"><div><h1>${t('prof_title')}</h1><p>${t('prof_lead')}</p></div></div>
    <div class="stack" style="max-width:760px">
      <section class="card card-pad stack">
        <h2 class="card-title">${t('prof_details')}</h2>
        <div class="grid-2">
          <div class="field"><label for="pf-name">${t('fullName')}</label><input class="input" id="pf-name" value="${esc(u.name)}" autocomplete="name"></div>
          <div class="field"><label for="pf-email">${t('email')}</label><input class="input" id="pf-email" value="${esc(u.email)}" readonly><span class="hint">${t('prof_emailNote')}</span></div>
        </div>
        <div><button class="btn btn-primary" data-act="saved">${t('save')}</button></div>
      </section>
      <section class="card card-pad stack">
        <div><h2 class="card-title">${icon('globe')}${t('prof_lang')}</h2><p class="muted" style="margin-top:4px">${t('prof_langLead')}</p></div>
        <div class="seg" role="group" aria-label="${t('language')}">${['en', 'pt', 'es'].map(l => `<button data-act="setlang" data-v="${l}" aria-pressed="${state.lang === l}">${t('lang_' + l)}</button>`).join('')}</div>
      </section>
      <section class="card card-pad stack">
        <h2 class="card-title">${icon('key')}${t('prof_signin')}</h2>
        <div style="display:flex;justify-content:space-between;gap:16px;align-items:center"><div><b style="font-weight:500">${t('prof_link')}</b><p class="muted" style="font-size:14px">${t('prof_linkP')}</p></div><span class="pill pill-soft-green">${icon('check', 'icon-sm')}${t('active')}</span></div>
        <div style="display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap"><div><b style="font-weight:500">${t('prof_pw')}</b><p class="muted" style="font-size:14px">${t('prof_pwP')}</p></div><button class="btn btn-ghost btn-sm" data-act="saved">${t('prof_changePw')}</button></div>
      </section>
      <section class="card card-pad stack">
        <div><h2 class="card-title">${icon('shield')}${t('prof_privacy')}</h2><p class="muted" style="margin-top:4px;max-width:60ch">${t('prof_privacyP')}</p></div>
        ${state.profDelete ? `<div class="notice notice-warn">${icon('alert')}<div style="display:grid;gap:12px"><span>${t('prof_deleteConfirm')}</span><div class="actions"><button class="btn btn-danger btn-sm" data-act="delete-yes">${t('prof_deleteYes')}</button><button class="btn btn-quiet btn-sm" data-act="delete-no">${t('cancel')}</button></div></div></div>`
          : `<div class="actions"><button class="btn btn-ghost btn-sm" data-act="export">${icon('download', 'icon-sm')}${t('prof_export')}</button><button class="btn btn-danger btn-sm" data-act="delete">${icon('trash', 'icon-sm')}${t('prof_delete')}</button></div>`}
      </section>
    </div>`);
}

/* ---------- auth ---------- */
function authShell(card) {
  const sheets = ['ark', 'lamb', 'stable'].map(a => `<div class="sheet">${artSVG(a)}</div>`).join('');
  return `<div class="auth">
    <section class="auth-art" aria-hidden="false">
      ${brand()}
      <div class="collage" aria-hidden="true">${sheets}</div>
      <div><h2>${t('inv_art_title')}</h2><p>${t('inv_art_p')}</p></div>
    </section>
    <section class="auth-side"><div class="auth-card">
      <div class="auth-top">${protoBtn()}${langSelect()}</div>
      ${card}
    </div></section>
  </div>`;
}
const exp7 = () => fmtDate(new Date(TODAY.getTime() + 7 * DAY));

function inviteView() {
  const packs = ['noah', 'creation'];
  return authShell(`
    <div><h1>${t('inv_title')}</h1><p class="lead">${t('inv_lead')}</p></div>
    <div class="bought">
      <div style="display:flex">${packs.map((id, i) => `<span class="mini" style="background:${P[id].field};${i ? 'margin-left:-14px;box-shadow:0 0 0 3px var(--surface)' : ''}">${artSVG(P[id].art[0])}</span>`).join('')}</div>
      <div style="min-width:0"><b style="display:block;font-weight:500;font-size:14.5px">${packs.map(id => esc(pt(id).t)).join(' + ')}</b></div>
    </div>
    <form class="stack" id="invite-form" novalidate>
      <div class="field"><label for="iv-email">${t('email')}</label><input class="input" id="iv-email" value="${esc(state.user.email)}" readonly><span class="hint">${t('inv_emailHint')}</span></div>
      <div class="field" id="f-name"><label for="iv-name">${t('fullName')}</label><input class="input" id="iv-name" placeholder="${t('fullNamePh')}" autocomplete="name" value="Thandi Mokoena"></div>
      <div class="field" id="f-pw"><label for="iv-pw">${t('password')}</label>
        <div class="input-wrap"><input class="input" id="iv-pw" type="password" placeholder="${t('passwordPh')}" autocomplete="new-password"><button type="button" class="adorn" data-act="pw-toggle" data-for="iv-pw" aria-label="${t('showPw')}">${icon('eye')}</button></div>
        <div style="display:flex;gap:12px;align-items:center"><div class="meter" id="pw-meter" data-level="0" style="flex:1"><i></i><i></i><i></i><i></i></div><span class="hint" id="pw-label" style="min-width:64px;text-align:right"></span></div>
      </div>
      <label class="check"><input type="checkbox" id="iv-nopw" data-act="nopw">${t('inv_noPw')}</label>
      <label class="check" id="f-terms"><input type="checkbox" id="iv-terms" checked><span>${t('inv_terms')}</span></label>
      <div id="iv-errors" role="alert"></div>
      <button class="btn btn-primary btn-lg btn-block" type="submit" id="iv-submit">${t('inv_submit')}</button>
      <p class="hint" style="display:flex;gap:8px;align-items:center;justify-content:center">${icon('clock', 'icon-sm')}${t('inv_expires', { date: exp7() })}</p>
    </form>`);
}

function linkStateView(kind) {
  const expired = kind === 'expired';
  const sent = state.accessSent;
  return authShell(`
    <span class="state-icon" style="background:${expired ? 'var(--amber-soft)' : 'var(--violet-soft)'};color:${expired ? 'var(--amber-ink)' : 'var(--violet-ink)'}">${icon(expired ? 'clock' : 'link')}</span>
    <div><h1>${t(expired ? 'exp_title' : 'used_title')}</h1><p class="lead">${t(expired ? 'exp_lead' : 'used_lead')}</p></div>
    ${sent ? `<div class="notice notice-ok">${icon('mail')}<span>${t('access_sent', { email: esc(sent) })}</span></div>` : accessForm()}
    ${expired ? '' : `<a class="btn btn-ghost btn-block" href="#login">${t('goSignIn')}</a>`}`);
}
function accessForm() {
  return `<form class="stack" id="access-form" novalidate>
      <div class="field" id="f-acc"><label for="acc-email">${t('email')}</label><input class="input" id="acc-email" type="email" placeholder="${t('emailPh')}" autocomplete="email" value="thandi.mokoena@example.co.za"></div>
      <button class="btn btn-primary btn-lg btn-block" type="submit">${icon('send', 'icon-sm')}${t('sendNewLink')}</button>
    </form>`;
}
function accessView() {
  const sent = state.accessSent;
  return authShell(`
    <div><h1>${t(sent ? 'access_sent_title' : 'access_title')}</h1><p class="lead">${sent ? t('access_sent', { email: esc(sent) }) : t('access_lead')}</p></div>
    ${sent ? `<a class="btn btn-primary btn-lg btn-block" href="#email-invite">${icon('mail', 'icon-sm')}${t('sent_open')}</a>` : accessForm()}
    <a class="btn btn-ghost btn-block" href="#login">${t('goSignIn')}</a>`);
}

function loginView() {
  const pw = state.loginMode === 'pw';
  return authShell(`
    <div><h1>${t('login_title')}</h1><p class="lead">${t('login_lead')}</p></div>
    <div class="seg" role="group" style="width:100%">${[['link', t('login_modeLink')], ['pw', t('login_modePw')]].map(([v, l]) => `<button style="flex:1" data-act="login-mode" data-v="${v}" aria-pressed="${state.loginMode === v}">${l}</button>`).join('')}</div>
    <form class="stack" id="login-form" novalidate>
      <div class="field" id="f-lemail"><label for="lg-email">${t('email')}</label><input class="input" id="lg-email" type="email" placeholder="${t('emailPh')}" autocomplete="email" value="${esc(state.loginEmail)}"></div>
      ${pw ? `<div class="field" id="f-lpw"><div style="display:flex;justify-content:space-between;gap:12px"><label for="lg-pw">${t('password')}</label><a href="#login" data-act="forgot" style="font-size:13.5px">${t('login_forgot')}</a></div>
        <div class="input-wrap"><input class="input" id="lg-pw" type="password" autocomplete="current-password" placeholder="${t('passwordPh')}"><button type="button" class="adorn" data-act="pw-toggle" data-for="lg-pw" aria-label="${t('showPw')}">${icon('eye')}</button></div></div>`
        : `<p class="hint" style="display:flex;gap:8px">${icon('info', 'icon-sm')}${t('login_linkHint')}</p>`}
      <div id="lg-errors" role="alert"></div>
      <button class="btn btn-primary btn-lg btn-block" type="submit">${pw ? t('login_signIn') : icon('send', 'icon-sm') + t('login_sendLink')}</button>
    </form>
    <div class="or"></div>
    <p style="text-align:center;font-size:14px" class="muted">${t('login_noAccount')} <a href="#access">${t('login_getLink')}</a></p>`);
}
function loginSentView() {
  return authShell(`
    <span class="state-icon" style="background:var(--orange-soft);color:var(--orange-ink)">${icon('mail')}</span>
    <div><h1>${t('sent_title')}</h1><p class="lead">${t('sent_lead', { email: `<b style="color:var(--ink);font-weight:500">${esc(state.loginEmail)}</b>` })}</p></div>
    <a class="btn btn-primary btn-lg btn-block" href="#email-link">${icon('mail', 'icon-sm')}${t('sent_open')}</a>
    <div class="actions" style="justify-content:space-between"><button class="btn btn-ghost" id="resend-btn" data-act="resend-link" disabled>${t('sent_resendIn', { s: 30 })}</button><a class="btn btn-quiet" href="#login">${t('sent_other')}</a></div>`);
}

/* ---------- emails ---------- */
function emailView(kind) {
  const u = state.user;
  const tabs = [
    ['invite', t('mail_subject_invite'), t('mail_preview_invite')],
    ['link', t('mail_subject_link'), t('mail_preview_link')],
    ['unlocked', t('mail_subject_unlocked', { pack: pt('shepherd').t }), t('mail_preview_unlocked')],
  ];
  const cur = tabs.find(x => x[0] === kind) || tabs[0];
  let body = '';
  const hi = `<p>${t('mail_hi', { name: esc(u.first) })}</p>`;
  if (kind === 'invite') body = `<h1>${t('inv_art_title')}</h1>${hi}<p>${t('mail_invite_p1')}</p>
      <div style="display:grid;gap:10px"><span class="email-small">${t('mail_youGot')}</span><div class="email-packs">${['noah', 'creation'].map(id => `<div style="background:${P[id].field}" title="${esc(pt(id).t)}">${artSVG(P[id].art[0])}</div>`).join('')}</div></div>
      <p>${t('mail_invite_p2')}</p><a class="email-cta" href="#invite">${t('mail_invite_cta')}</a>
      <p class="email-small">${t('mail_invite_expiry', { date: exp7() })}</p>`;
  if (kind === 'link') body = `<h1>${t('mail_link_title')}</h1>${hi}<p>${t('mail_link_p')}</p><a class="email-cta" href="#library">${t('mail_link_cta')}</a><p class="email-small">${t('mail_link_note')}</p>`;
  if (kind === 'unlocked') body = `<h1>${t('mail_unlocked_title', { pack: esc(pt('shepherd').t) })}</h1>${hi}
      <div class="email-packs"><div style="background:${P.shepherd.field};width:96px;height:96px">${artSVG('lamb')}</div></div>
      <p>${t('mail_unlocked_p', { pack: esc(pt('shepherd').t), pages: P.shepherd.pages })}</p><a class="email-cta" href="#pack-shepherd">${t('mail_unlocked_cta')}</a>
      <p class="email-small">${t('mail_order', { ref: 'KG-20260923-5TR8D', amount: money(P.shepherd.price) })}</p>`;
  return `<div class="main" style="max-width:1180px;margin:0 auto">
    <div class="topbar" style="display:flex">${brand(t('mail_inbox'))}<span class="spacer"></span>${protoBtn()}${langSelect()}</div>
    <div class="mail-shell">
      <nav class="card mail-list" aria-label="${t('mail_inbox')}">${tabs.map(([k, s, pv]) => `<a class="mail-item" style="text-decoration:none;color:inherit" href="#email-${k}" aria-current="${k === kind}"><b>${esc(s)}</b><span>${esc(pv)}</span></a>`).join('')}</nav>
      <article class="card mail-view">
        <div class="mail-meta"><h2>${esc(cur[1])}</h2>
          <span>${t('mail_from')}: Kingdom Members &lt;hello@yourdomain.co.za&gt;</span><span>${t('mail_to')}: ${esc(u.name)} &lt;${esc(u.email)}&gt;</span></div>
        <div class="mail-canvas"><div class="email">
          <div class="email-band"><span style="width:34px;height:34px;display:block">${logo()}</span><b>Kingdom Members</b></div>
          <div class="email-body">${body}<p class="email-verse">${t('mail_verse')}</p><p>${t('mail_signoff')}</p><p class="email-small">${t('mail_help')}</p></div>
          <div class="email-foot">${t('mail_footer')}</div>
        </div></div>
      </article>
    </div>
  </div>`;
}

/* ---------- admin shell ---------- */
function adminShell(active, content) {
  const pending = state.invites.filter(i => i.status === 'sent' || i.status === 'opened').length;
  const nav = [
    ['admin', 'dashboard', t('nav_overview')],
    ['admin-invites', 'mail', t('nav_invites'), pending],
    ['admin-members', 'users', t('nav_members')],
    ['admin-showcase', 'store', t('nav_showcase')],
    ['admin-integrations', 'plug', t('nav_integrations')],
  ];
  return `<div class="app">
    <aside class="sidebar" aria-label="Admin">
      ${brand(t('nav_admin'))}
      <div class="split">
        <button class="split-main" data-act="new-invite">${icon('plus')}${t('newInvite')}</button>
        <button class="split-more" data-act="menu" aria-label="${t('moreActions')}" aria-expanded="${state.menu}">${icon('chevronDown')}</button>
        ${state.menu ? `<div class="card" style="position:absolute;top:calc(100% + 8px);left:0;right:0;z-index:30;padding:6px;box-shadow:var(--shadow-pop)">
          <button class="btn btn-quiet btn-block" style="justify-content:flex-start" data-act="new-invite">${icon('mail', 'icon-sm')}${t('newInvite')}</button>
          <button class="btn btn-quiet btn-block" style="justify-content:flex-start" data-go="admin-pack-daniel">${icon('plus', 'icon-sm')}${t('newPack')}</button>
          <button class="btn btn-quiet btn-block" style="justify-content:flex-start" data-act="upload-pages">${icon('upload', 'icon-sm')}${t('uploadPages')}</button></div>` : ''}
      </div>
      <nav class="nav">${nav.map(([r, ic, label, badge]) => `<a href="#${r}" ${active === r ? 'aria-current="page"' : ''}>${icon(ic)}${label}${badge ? `<span class="badge">${badge}</span>` : ''}</a>`).join('')}</nav>
      <div class="sidebar-foot">
        ${protoBtn()}
        <a class="btn btn-ghost btn-block" href="#library">${icon('library', 'icon-sm')}${t('nav_viewMember')}</a>
        <div class="user-chip">${avatar('Kingdom Admin')}<div class="who"><b>Kingdom Admin</b><span>admin@yourdomain.co.za</span></div></div>
      </div>
    </aside>
    <div>
      <header class="mobile-bar">${brand(t('nav_admin'))}<div style="display:flex;gap:8px">${protoBtn('icon-only')}${langSelect('lang-m')}<button class="icon-btn" data-act="new-invite" aria-label="${t('newInvite')}" style="background:var(--cta);color:#fff;border:0">${icon('plus')}</button></div></header>
      <main class="main" id="main">
        <div class="topbar">
          <label class="search">${icon('search')}<span class="sr">${t('searchAdmin')}</span><input type="search" placeholder="${t('searchAdmin')}" autocomplete="off"></label>
          <span class="spacer"></span>${langSelect()}
          <button class="icon-btn" aria-label="${t('feed_title')}">${icon('bell')}</button>
        </div>
        ${content}
      </main>
    </div>
    <nav class="tabbar" aria-label="Admin">${nav.map(([r, ic, label]) => `<a href="#${r}" ${active === r ? 'aria-current="page"' : ''}>${icon(ic)}${label}</a>`).join('')}</nav>
  </div>`;
}
const statusPill = (s) => {
  const m = { sent: 'pill-orange', opened: 'pill-blue', accepted: 'pill-soft-green', expired: 'pill-grey', revoked: 'pill-soft-red' };
  return `<span class="pill ${m[s]}"><span class="dot"></span>${t('st_' + s)}</span>`;
};
function nextExpiring() {
  return state.invites.filter(i => (i.status === 'sent' || i.status === 'opened') && i.exp > 0).sort((a, b) => a.exp - b.exp)[0];
}

function adminOverview() {
  const pending = state.invites.filter(i => i.status === 'sent' || i.status === 'opened');
  const nx = nextExpiring();
  const feedLine = (f) => {
    const who = f.who ? `<span class="chip-mention">@${esc(f.who)}</span>` : '';
    const ref = f.ref ? `<span class="chip-code">#${f.ref}</span>` : '';
    const pack = f.pack ? `<span class="chip-code">${esc(pt(f.pack).t)}</span>` : '';
    return t('feed_' + f.k, { who, ref, pack });
  };
  return adminShell('admin', `
    <div class="page-head"><div><h1>${t('ad_title')}</h1><p>${t('ad_lead')}</p></div></div>
    <div class="kpis">
      <div class="card kpi"><span class="kpi-label">${icon('users', 'icon-sm')}${t('kpi_members')}</span><div class="kpi-row"><span class="kpi-value">214</span>${bars([45, 70, 55, 90, 75])}</div><span class="kpi-delta">${t('kpi_delta', { n: 18 })}</span></div>
      <div class="card kpi"><span class="kpi-label">${icon('mail', 'icon-sm')}${t('kpi_invites')}</span><div class="kpi-row"><span class="kpi-value">${pending.length}</span>${bars([80, 50, 95, 60, 40])}</div><span class="kpi-delta" style="color:var(--amber-ink)">${t('kpi_deltaWeek', { n: 2 })}</span></div>
      <div class="card kpi"><span class="kpi-label">${icon('lock', 'icon-sm')}${t('kpi_unlocks')}</span><div class="kpi-row"><span class="kpi-value">37</span>${bars([35, 60, 50, 85, 100])}</div><span class="kpi-delta">${t('kpi_deltaUnlock', { amount: money(2913) })}</span></div>
      ${nx ? `<div class="card countdown">
        <div class="countdown-top"><div><b style="font-size:18px">${t('cd_title2', { name: esc(nx.name.split(' ')[0]) })}</b><span class="muted" style="display:block;font-size:13px">${esc(nx.email)}</span></div><span class="pill pill-red">${t('cd_expiring')}</span></div>
        <div class="clock" id="clock" aria-live="off">--<span>:</span>--<span>:</span>--</div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span class="muted tnum" style="font-size:13px;white-space:nowrap">${t('expiresIn', { t: durH(nx.exp) })}</span><button class="btn btn-ghost btn-sm" data-act="resend" data-id="${nx.id}">${icon('refresh', 'icon-sm')}${t('cd_resend')}</button></div>
      </div>` : ''}
    </div>
    <div class="admin-grid">
      <section class="card">
        <div class="card-head"><h2 class="card-title"><span class="status-dot" style="background:var(--orange-500);box-shadow:0 0 0 4px var(--orange-soft)"></span>${t('ad_pending')}<span class="pill pill-grey tnum">${pending.length}</span></h2><a class="btn btn-ghost btn-sm" href="#admin-invites">${t('viewAll')}</a></div>
        <div class="team">${pending.slice(0, 6).map(i => `<div class="person">${avatar(i.name, 44)}<div class="who"><b>${esc(i.name)}</b><span class="pk"><span class="pk-t">${esc(pt(i.packs[0]).t)}</span>${i.packs.length > 1 ? `<span class="pk-n">+${i.packs.length - 1}</span>` : ''}</span></div>${statusPill(i.status)}</div>`).join('')}</div>
      </section>
      <section class="card">
        <div class="card-head"><h2 class="card-title">${icon('bell')}${t('feed_title')}</h2><span class="muted" style="font-size:13.5px">${t('feed_unread')}</span></div>
        <div class="feed">${state.feed.slice(0, 6).map(f => `<div class="feed-item"><span>${feedLine(f)}</span><time>${f.time}</time></div>`).join('')}</div>
      </section>
    </div>`);
}

function invitesView() {
  const f = state.invFilter;
  const q = state.invQ.trim().toLowerCase();
  const counts = { all: state.invites.length };
  state.invites.forEach(i => counts[i.status] = (counts[i.status] || 0) + 1);
  let rows = state.invites.filter(i => f === 'all' || i.status === f);
  if (q) rows = rows.filter(i => (i.name + i.email).toLowerCase().includes(q));
  return adminShell('admin-invites', `
    <div class="page-head"><div><h1>${t('inv_ad_title')}</h1><p>${t('inv_ad_lead')}</p></div></div>
    <section class="card">
      <div class="toolbar">
        <div class="filters">${['all', 'sent', 'opened', 'accepted', 'expired', 'revoked'].map(s => `<button class="filter" data-act="inv-filter" data-v="${s}" aria-pressed="${f === s}">${s === 'all' ? t('all') : t('st_' + s)}<span class="count">${counts[s] || 0}</span></button>`).join('')}</div>
        <label class="mini-search">${icon('search', 'icon-sm')}<span class="sr">${t('searchAdmin')}</span><input id="inv-search" type="search" value="${esc(state.invQ)}" placeholder="${t('searchAdmin')}"></label>
      </div>
      <div class="table-wrap"><table class="table">
        <thead><tr><th>${t('th_person')}</th><th>${t('th_packs')}</th><th>${t('th_lang')}</th><th>${t('th_source')}</th><th>${t('th_sent')}</th><th>${t('th_expires')}</th><th>${t('th_status')}</th><th><span class="sr">${t('th_actions')}</span></th></tr></thead>
        <tbody>${rows.map(i => {
          const live = i.status === 'sent' || i.status === 'opened';
          const expTxt = live ? `<span class="${i.exp < 24 ? '' : 'muted'}" style="${i.exp < 24 ? 'color:var(--red-ink);font-weight:500' : ''}">${t('expiresIn', { t: durH(i.exp) })}</span>` : i.status === 'expired' ? fmtShort(new Date(TODAY.getTime() + i.exp * 36e5)) : '—';
          const actions = state.revoking === i.id
            ? `<span style="display:inline-flex;gap:6px;align-items:center"><span style="font-size:13px">${t('revokeQ')}</span><button class="btn btn-danger btn-sm" data-act="revoke-yes" data-id="${i.id}">${t('yes')}</button><button class="btn btn-quiet btn-sm" data-act="revoke-no">${t('no')}</button></span>`
            : `<div class="row-actions">
              ${i.status !== 'accepted' ? `<button class="icon-btn" data-act="resend" data-id="${i.id}" title="${t('act_resend')}" aria-label="${t('act_resend')}">${icon('refresh', 'icon-sm')}</button>` : ''}
              ${live ? `<button class="icon-btn" data-act="copy-invite" data-id="${i.id}" title="${t('act_copy')}" aria-label="${t('act_copy')}">${icon('copy', 'icon-sm')}</button>
              <button class="icon-btn" data-act="revoke" data-id="${i.id}" title="${t('act_revoke')}" aria-label="${t('act_revoke')}">${icon('x', 'icon-sm')}</button>` : ''}</div>`;
          return `<tr><td><div class="cell-person">${avatar(i.name, 34)}<div><b>${esc(i.name)}</b><span>${esc(i.email)}</span></div></div></td>
            <td>${i.packs.map(id => esc(pt(id).t)).join('<br>')}</td>
            <td><span class="pill pill-grey">${i.lang.toUpperCase()}</span></td>
            <td class="muted">${t(i.src === 'gateway' ? 'src_gateway' : 'src_manual')}</td>
            <td class="muted tnum">${fmtShort(new Date(TODAY.getTime() + i.sent * DAY))}</td>
            <td class="tnum">${expTxt}</td>
            <td>${statusPill(i.status)}</td><td>${actions}</td></tr>`;
        }).join('') || `<tr><td colspan="8"><div class="empty">${icon('mail')}<p>${t('empty_search', { q: esc(state.invQ) })}</p></div></td></tr>`}</tbody>
      </table></div>
    </section>`);
}

function membersView() {
  const q = state.memQ.trim().toLowerCase();
  const rows = state.members.filter(m => !q || (m.name + m.email).toLowerCase().includes(q));
  return adminShell('admin-members', `
    <div class="page-head"><div><h1>${t('mem_title')}</h1><p>${t('mem_lead')}</p></div></div>
    <section class="card">
      <div class="toolbar"><span class="muted tnum" style="font-size:14px">${rows.length} / 214</span>
        <label class="mini-search">${icon('search', 'icon-sm')}<span class="sr">${t('searchAdmin')}</span><input id="mem-search" type="search" value="${esc(state.memQ)}" placeholder="${t('searchAdmin')}"></label></div>
      <div class="table-wrap"><table class="table">
        <thead><tr><th>${t('th_member')}</th><th>${t('th_packs')}</th><th>${t('th_lang')}</th><th>${t('th_joined')}</th><th>${t('th_lastSeen')}</th><th>${t('th_status')}</th><th></th></tr></thead>
        <tbody>${rows.map(m => `<tr class="clickable" data-act="member" data-id="${m.id}" tabindex="0">
          <td><div class="cell-person">${avatar(m.name, 34)}<div><b>${esc(m.name)}</b><span>${esc(m.email)}</span></div></div></td>
          <td><div style="display:flex;align-items:center;gap:8px">${m.packs.slice(0, 4).map((id, i) => `<span style="width:30px;height:30px;border-radius:9px;background:${P[id].field};display:grid;place-items:center;${i ? 'margin-left:-12px;' : ''}box-shadow:0 0 0 2px var(--surface)">${artSVG(P[id].art[0]).replace('class="art', 'style="width:80%" class="art')}</span>`).join('')}<span class="muted tnum">${m.packs.length}</span></div></td>
          <td><span class="pill pill-grey">${m.lang.toUpperCase()}</span></td>
          <td class="muted tnum">${fmtShort(new Date(TODAY.getTime() - m.joined * DAY))}</td>
          <td class="muted">${relDays(m.seen)}</td>
          <td>${m.active ? `<span class="pill pill-soft-green"><span class="dot"></span>${t('active')}</span>` : `<span class="pill pill-grey"><span class="dot"></span>${t('deactivated')}</span>`}</td>
          <td style="text-align:right;color:var(--faint)">${icon('chevronRight', 'icon-sm')}</td></tr>`).join('')}</tbody>
      </table></div>
    </section>`);
}

function showcaseView() {
  const list = state.order.map(id => P[id]);
  const previewOwned = new Set(['noah', 'creation']);
  return adminShell('admin-showcase', `
    <div class="page-head"><div><h1>${t('sc_title')}</h1><p>${t('sc_lead')}</p></div><button class="btn btn-primary" data-go="admin-pack-daniel">${icon('plus')}${t('newPack')}</button></div>
    <div class="showcase">
      <section class="card" style="overflow:hidden">
        <div class="toolbar"><span class="muted" style="font-size:14px;display:flex;gap:8px;align-items:center">${icon('grip', 'icon-sm')}${t('sc_drag')}</span></div>
        <div id="sc-list">${list.map(p => `<div class="sc-row" draggable="true" data-id="${p.id}">
          <button class="handle" data-act="sc-key" data-id="${p.id}" aria-label="${t('sc_drag')}: ${esc(pt(p.id).t)}">${icon('grip')}</button>
          <span class="sc-thumb" style="background:${p.field}">${artSVG(p.art[0])}</span>
          <div class="sc-info" style="min-width:0"><b>${esc(pt(p.id).t)}</b><span class="tnum">${t('pages', { n: p.pages })} · ${p.access === 'free' ? t('free') : money(p.price)} · ${p.gid}</span></div>
          <div class="sc-controls">
            <div class="seg seg-sm" role="group">${['visible', 'soon', 'hidden'].map(v => `<button data-act="vis" data-id="${p.id}" data-v="${v}" aria-pressed="${p.vis === v}">${t('vis_' + v)}</button>`).join('')}</div>
            <a class="btn btn-ghost btn-sm" href="#admin-pack-${p.id}">${icon('edit', 'icon-sm')}${t('edit')}</a>
          </div></div>`).join('')}</div>
      </section>
      <aside>
        <h2 style="font-size:17px">${t('sc_preview')}</h2><p class="muted" style="font-size:13.5px;margin:4px 0 12px">${t('sc_previewP')}</p>
        <div class="preview-phone"><div class="preview-screen"><div class="preview-grid">
          ${list.filter(p => p.vis !== 'hidden').map(p => { const own = p.access === 'free' || previewOwned.has(p.id); return `<div class="p" style="${p.vis === 'soon' ? 'opacity:.55' : ''}"><div class="c" style="background:${p.field}">${artSVG(p.art[0], own ? 'color' : 'line')}</div>${!own && p.vis === 'visible' ? `<span class="lk">${icon('lock')}</span>` : ''}<small>${esc(pt(p.id).t)}</small></div>`; }).join('')}
        </div></div></div>
      </aside>
    </div>`);
}

function editorView(id) {
  const p = P[id] || P.noah;
  const tx = (PACK_TEXT[state.edLang] || PACK_TEXT.en)[p.id];
  const tab = state.edTab;
  const extra = p.pages - p.art.length;
  let body = '';
  if (tab === 'details') body = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
      <div class="seg" role="group" aria-label="${t('language')}">${['en', 'pt', 'es'].map(l => `<button data-act="ed-lang" data-v="${l}" aria-pressed="${state.edLang === l}">${l.toUpperCase()}</button>`).join('')}</div>
      <span class="hint">${t('ed_translating', { lang: t('lang_' + state.edLang) })}</span></div>
    <div class="field"><label for="ed-title">${t('ed_title')}</label><input class="input" id="ed-title" value="${esc(tx.t)}"></div>
    <div class="field"><label for="ed-desc">${t('ed_desc')}</label><textarea class="textarea" id="ed-desc">${esc(tx.d)}</textarea></div>
    <div class="grid-2"><div class="field"><label for="ed-verse">${t('ed_verse')}</label><input class="input" id="ed-verse" value="${esc(tx.v)}"></div>
      <div class="field"><label for="ed-ref">Ref.</label><input class="input" id="ed-ref" value="${esc(tx.r)}"></div></div>`;
  if (tab === 'pages') body = `
    <div class="dropzone" id="dropzone" data-act="upload-pages" role="button" tabindex="0">${icon('upload')}<b style="color:var(--ink);font-weight:500">${t('ed_drop')}</b><span style="font-size:13.5px">${t('ed_dropP')}</span><span class="btn btn-ghost btn-sm" style="margin-top:6px">${t('ed_browse')}</span></div>
    <p class="hint">${t('ed_pagesCount', { n: p.pages })}</p>
    <div class="page-list">${p.art.map((a, i) => `<div class="pl">${artSVG(a, 'line')}<span>${t('page', { n: i + 1 })}</span></div>`).join('')}
      ${extra > 0 ? `<div class="more-sheet" style="aspect-ratio:210/297;padding:8px"><div><b class="tnum" style="font-size:20px">+${extra}</b></div></div>` : ''}</div>`;
  if (tab === 'sales') body = `
    <div class="grid-2">
      <div class="field"><label for="ed-price">${t('ed_price')}</label><input class="input tnum" id="ed-price" inputmode="decimal" value="${p.price.toFixed(2).replace('.', ',')}"></div>
      <div class="field"><label for="ed-access">${t('ed_access')}</label><select class="select" id="ed-access" data-act="ed-access" data-id="${p.id}"><option value="paid" ${p.access === 'paid' ? 'selected' : ''}>${t('acc_paid')}</option><option value="free" ${p.access === 'free' ? 'selected' : ''}>${t('acc_free')}</option></select></div>
    </div>
    <div class="field"><label for="ed-gid">${t('ed_gid')}</label><input class="input" id="ed-gid" value="${p.gid}" style="font-family:ui-monospace,Menlo,Consolas,monospace"><span class="hint">${t('ed_gidP')}</span></div>
    <div class="field"><label for="ed-co">${t('ed_checkout')}</label><input class="input" id="ed-co" value="https://pay.yourdomain.co.za/checkout/${p.gid}"><span class="hint">${t('ed_checkoutP')}</span></div>
    <div class="field"><span class="label">${t('ed_visibility')}</span><div class="seg" role="group">${['visible', 'soon', 'hidden'].map(v => `<button data-act="vis" data-id="${p.id}" data-v="${v}" aria-pressed="${p.vis === v}">${t('vis_' + v)}</button>`).join('')}</div></div>`;
  const prevOwn = state.edPreview === 'owned';
  return adminShell('admin-showcase', `
    <a class="back" href="#admin-showcase">${icon('chevronLeft', 'icon-sm')}${t('sc_title')}</a>
    <div class="page-head"><div><h1>${esc(pt(p.id).t)}</h1><p class="tnum">${p.gid} · ${t('vis_' + p.vis)}</p></div><button class="btn btn-primary" data-act="saved">${icon('check')}${t('ed_save')}</button></div>
    <div class="editor">
      <section class="card card-pad">
        <div class="tabs" role="tablist">${[['details', t('ed_details')], ['pages', t('ed_pages')], ['sales', t('ed_sales')]].map(([v, l]) => `<button role="tab" data-act="ed-tab" data-v="${v}" aria-selected="${tab === v}">${l}</button>`).join('')}</div>
        <div class="stack">${body}</div>
      </section>
      <aside class="stack">
        <div class="card card-pad stack">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h2 style="font-size:16px">${t('ed_preview')}</h2>
            <div class="seg seg-sm" role="group">${[['owned', t('ed_asOwner')], ['locked', t('ed_asLocked')]].map(([v, l]) => `<button data-act="ed-preview" data-v="${v}" aria-pressed="${state.edPreview === v}">${l}</button>`).join('')}</div></div>
          ${packCard(p, { static: true, forceOwned: prevOwn })}
        </div>
        <div class="card card-pad"><dl class="kv" style="margin:0">
          <div><dt>${t('ed_pages')}</dt><dd class="tnum">${p.pages}</dd></div>
          <div><dt>${t('ed_price')}</dt><dd class="tnum">${p.access === 'free' ? t('free') : money(p.price)}</dd></div>
          <div><dt>${t('ed_visibility')}</dt><dd>${t('vis_' + p.vis)}</dd></div>
          <div><dt>${t('ed_access')}</dt><dd>${t(p.access === 'free' ? 'acc_free' : 'acc_paid')}</dd></div>
        </dl></div>
      </aside>
    </div>`);
}

function integrationsView() {
  const secret = 'whsec_7f3a9c2e4b1d8f60a5c3e9b2d4f1a7c8';
  const resPill = { ok: `<span class="pill pill-soft-green">${icon('check', 'icon-sm')}${t('res_ok')}</span>`, dup: `<span class="pill pill-grey">${t('res_dup')}</span>`, bad: `<span class="pill pill-soft-red">${icon('x', 'icon-sm')}${t('res_bad')}</span>`, test: `<span class="pill pill-violet">${icon('check', 'icon-sm')}${t('res_test')}</span>` };
  return adminShell('admin-integrations', `
    <div class="page-head"><div><h1>${t('int_title')}</h1><p>${t('int_lead')}</p></div></div>
    <div class="editor">
      <div class="stack">
        <section class="card card-pad stack">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
            <h2 class="card-title"><span class="sc-thumb" style="width:42px;height:42px;border-radius:12px;background:var(--orange-soft);color:var(--orange-ink)">${icon('card')}</span>${t('int_gateway')}</h2>
            <span class="pill pill-soft-green"><span class="status-dot" style="width:8px;height:8px;box-shadow:none"></span>${t('int_connected')} · ${t('int_lastEvent', { t: '11:42' })}</span>
          </div>
          <div class="field"><span class="label">${t('int_endpoint')}</span><div class="code-field"><span id="endpoint">https://members.yourdomain.co.za/api/webhooks/gateway</span><button class="btn btn-ghost btn-sm" data-act="copy-text" data-target="endpoint">${icon('copy', 'icon-sm')}${t('copy')}</button></div><span class="hint">${t('int_endpointP')}</span></div>
          <div class="field"><span class="label">${t('int_secret')}</span><div class="code-field"><span id="secret">${state.secretShown ? secret : 'whsec_' + '•'.repeat(24)}</span>
            <button class="btn btn-quiet btn-sm" data-act="secret">${icon(state.secretShown ? 'eyeOff' : 'eye', 'icon-sm')}${t(state.secretShown ? 'int_hide' : 'int_reveal')}</button>
            <button class="btn btn-ghost btn-sm" data-act="rotate">${icon('refresh', 'icon-sm')}${t('int_rotate')}</button></div><span class="hint">${t('int_secretP')}</span></div>
          <div class="field"><span class="label">${t('int_events')}</span><div class="filters">${['order.paid', 'order.refunded', 'order.disputed', 'order.dispute_resolved'].map(e => `<span class="chip-code" style="padding:5px 10px">${e}</span>`).join('')}</div></div>
          <div><button class="btn btn-primary" data-act="test-event">${icon('zap', 'icon-sm')}${t('int_test')}</button></div>
        </section>
        <section class="card">
          <div class="card-head"><div><h2 class="card-title">${t('int_mapping')}</h2><p class="muted" style="font-size:13.5px">${t('int_mappingP')}</p></div></div>
          <div class="table-wrap" style="padding:8px 6px 6px"><table class="table" style="min-width:520px"><thead><tr><th>${t('th_gateway')}</th><th>${t('th_pack')}</th><th>${t('ed_price')}</th></tr></thead>
            <tbody>${PACKS.filter(p => p.access === 'paid').map(p => `<tr><td><span class="chip-code">${p.gid}</span></td><td><div class="cell-person"><span class="sc-thumb" style="width:34px;height:34px;border-radius:10px;background:${p.field}">${artSVG(p.art[0])}</span><b>${esc(pt(p.id).t)}</b></div></td><td class="tnum">${money(p.price)}</td></tr>`).join('')}</tbody></table></div>
        </section>
        <section class="card">
          <div class="card-head"><h2 class="card-title">${t('int_log')}</h2></div>
          <div class="table-wrap" style="padding:8px 6px 6px"><table class="table" style="min-width:600px"><thead><tr><th>${t('th_event')}</th><th>${t('th_order')}</th><th>${t('th_time')}</th><th>${t('th_result')}</th></tr></thead>
            <tbody>${state.deliveries.map(d => `<tr><td><span class="chip-code">${d.ev}</span></td><td class="tnum">${d.ref}</td><td class="muted tnum">${d.time}</td><td>${resPill[d.res]}</td></tr>`).join('')}</tbody></table></div>
        </section>
      </div>
      <aside class="stack">
        <section class="card card-pad stack">
          <h2 class="card-title">${t('int_checklist')}</h2>
          ${['ck1', 'ck2', 'ck3', 'ck4'].map((k, i) => { const done = i < 3 || state.deliveries.some(d => d.res === 'test'); return `<div style="display:flex;gap:12px;align-items:center"><span style="width:28px;height:28px;border-radius:50%;display:grid;place-items:center;flex:none;background:${done ? 'var(--green)' : 'var(--sunken)'};color:${done ? '#fff' : 'var(--muted)'};font-size:13px;font-weight:500">${done ? icon('check', 'icon-sm') : i + 1}</span><span style="font-size:14px;${done ? 'color:var(--muted)' : ''}">${t(k)}</span></div>`; }).join('')}
        </section>
        <section class="card card-pad stack"><h2 class="card-title">${icon('plug')}${t('int_more')}</h2><p class="muted" style="font-size:14px">${t('int_moreP')}</p></section>
      </aside>
    </div>`);
}

/* ---------- dialogs ---------- */
const CRAYONS = ['#f2594b', '#ff9f43', '#ffd54a', '#6cc56a', '#5ab0e6', '#5e8fd6', '#b69cff', '#ff8fb1', '#a8743f', '#8a8f98', '#2e2a26'];
function dialogView() {
  const d = state.dialog;
  if (!d) return '';
  const close = `<button class="icon-btn" data-act="close" aria-label="${t('close')}">${icon('x')}</button>`;
  if (d.type === 'studio') {
    return `<div class="scrim" data-act="scrim"><div class="dialog dialog-wide" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
      <div class="dialog-head"><div><h2 id="dlg-title">${t('studio_title')} · ${esc(artT(d.art))}</h2><p class="muted" style="margin-top:4px">${t('studio_lead')}</p></div>${close}</div>
      <div class="studio">
        <div class="paper" id="paper">${artSVG(d.art, 'line').replace('<svg class="art', '<svg id="colour-svg" class="art')}</div>
        <div class="stack" style="align-content:start">
          <div class="crayons" role="group">${CRAYONS.map((c, i) => `<button class="crayon" style="background:${c}" data-act="crayon" data-c="${c}" aria-pressed="${state.crayon === c}" aria-label="${t('crayon', { n: i + 1 })}"></button>`).join('')}
            <button class="crayon eraser" data-act="crayon" data-c="#ffffff" aria-pressed="${state.crayon === '#ffffff'}" aria-label="${t('eraser')}">${icon('x', 'icon-sm')}</button></div>
          <button class="btn btn-ghost btn-block" data-act="studio-reset">${icon('refresh', 'icon-sm')}${t('studio_reset')}</button>
          <button class="btn btn-ghost btn-block" data-act="download">${icon('download', 'icon-sm')}${t('pack_dl')}</button>
          <button class="btn btn-primary btn-block" data-act="close">${t('studio_done')}</button>
        </div>
      </div></div></div>`;
  }
  if (d.type === 'checkout') {
    const p = P[d.id], tx = pt(d.id);
    let inner;
    if (d.step === 'summary') inner = `
      <div class="dialog-head"><div style="display:flex;gap:14px;align-items:center"><span class="sc-thumb" style="width:64px;height:64px;border-radius:16px;background:${p.field}">${artSVG(p.art[0])}</span><div><h2 id="dlg-title">${t('co_title', { pack: esc(tx.t) })}</h2><p class="muted" style="font-size:14px">${t('co_lead')}</p></div></div>${close}</div>
      <div class="stack" style="gap:14px">
        <span class="label">${t('co_includes')}</span>
        ${[t('co_inc1', { n: p.pages }), t('co_inc2'), t('co_inc3')].map(x => `<div style="display:flex;gap:10px;align-items:center;font-size:14.5px"><span style="width:24px;height:24px;border-radius:50%;background:var(--green-soft);color:var(--green-ink);display:grid;place-items:center">${icon('check', 'icon-sm')}</span>${x}</div>`).join('')}
        <div style="display:flex;justify-content:space-between;align-items:baseline;padding-top:14px;border-top:1px solid var(--line)"><span class="muted">${t('co_total')}</span><b class="tnum" style="font-size:26px;font-weight:500">${money(p.price)}</b></div>
        <button class="btn btn-primary btn-lg btn-block" data-act="co-next">${icon('lock', 'icon-sm')}${t('co_continue')}</button>
        <p class="hint" style="display:flex;gap:8px">${icon('shield', 'icon-sm')}${t('co_secure')}</p>
      </div>`;
    else if (d.step === 'gateway') inner = `
      <div class="dialog-head"><div style="display:flex;gap:12px;align-items:center"><span style="width:40px;height:40px;border-radius:12px;background:var(--ink);color:var(--canvas);display:grid;place-items:center">${icon('card')}</span><div><h2 id="dlg-title" style="font-size:19px">Kingdom Pay</h2><p class="hint">${t('co_gw_note')}</p></div></div>${close}</div>
      <div class="stack" style="gap:14px">
        <div class="notice notice-info">${icon('user')}<span>${t('co_email', { email: esc(state.user.email) })}</span></div>
        <div class="field"><label for="co-card">${t('co_card')}</label><input class="input tnum" id="co-card" value="4084 0840 8408 4081" inputmode="numeric"></div>
        <div class="grid-2"><div class="field"><label for="co-exp">${t('co_expiry')}</label><input class="input tnum" id="co-exp" value="12/28"></div><div class="field"><label for="co-cvc">${t('co_cvc')}</label><input class="input tnum" id="co-cvc" value="408"></div></div>
        <button class="btn btn-primary btn-lg btn-block" data-act="co-pay">${t('co_pay', { price: money(p.price) })}</button>
      </div>`;
    else inner = `<div class="empty" style="padding:36px 10px"><span class="state-icon" style="background:var(--orange-soft);color:var(--orange-ink)"><span class="spin" style="width:26px;height:26px;border:3px solid var(--orange-300);border-top-color:var(--orange-600);border-radius:50%;animation:spin .7s linear infinite"></span></span><b style="color:var(--ink);font-weight:500;font-size:17px">${t(d.step === 'paying' ? 'co_paying' : 'co_unlocking')}</b></div>`;
    return `<div class="scrim" data-act="scrim"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title" aria-label="${esc(tx.t)}">${inner}</div></div>`;
  }
  if (d.type === 'help') {
    return `<div class="scrim" data-act="scrim"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
      <div class="dialog-head"><div><h2 id="dlg-title">${t('help_title')}</h2><p class="muted" style="margin-top:4px">${t('help_lead')}</p></div>${close}</div>
      <div class="stack" style="gap:12px">
        <div class="bought"><span class="mini" style="background:var(--green-soft);color:var(--green-ink)">${icon('message')}</span><div><span class="hint">${t('help_whatsapp')}</span><b style="display:block;font-weight:500;user-select:all">+27 00 000 0000 <span class="muted" style="font-weight:400">(${t('help_placeholder')})</span></b></div></div>
        <div class="bought"><span class="mini" style="background:var(--orange-soft);color:var(--orange-ink)">${icon('mail')}</span><div><span class="hint">${t('help_email')}</span><b style="display:block;font-weight:500;user-select:all">help@yourdomain.co.za</b></div></div>
      </div></div></div>`;
  }
  if (d.type === 'invite-new') {
    return `<div class="scrim drawer-scrim" data-act="scrim"><form class="drawer" id="ni-form" role="dialog" aria-modal="true" aria-labelledby="dlg-title" novalidate>
      <div class="dialog-head" style="margin:0"><div><h2 id="dlg-title">${t('ni_title')}</h2><p class="muted" style="margin-top:4px;font-size:14px">${t('ni_lead')}</p></div>${close}</div>
      <div class="field" id="f-ni-email"><label for="ni-email">${t('email')}</label><input class="input" id="ni-email" type="email" placeholder="${t('emailPh')}" autocomplete="off"></div>
      <div class="field"><label for="ni-name">${t('fullName')}</label><input class="input" id="ni-name" placeholder="${t('fullNamePh')}" autocomplete="off"></div>
      <div class="grid-2">
        <div class="field"><label for="ni-lang">${t('language')}</label><select class="select" id="ni-lang">${['en', 'pt', 'es'].map(l => `<option value="${l}">${t('lang_' + l)}</option>`).join('')}</select></div>
        <div class="field"><label for="ni-exp">${t('ni_expiry')}</label><select class="select" id="ni-exp">${[3, 7, 14].map(n => `<option value="${n}" ${n === 7 ? 'selected' : ''}>${t('days', { n })}</option>`).join('')}</select></div>
      </div>
      <fieldset class="field" style="border:0;padding:0;margin:0"><legend class="label" style="margin-bottom:8px">${t('ni_packs')}</legend>
        <div class="stack" style="gap:8px">${PACKS.filter(p => p.vis === 'visible' && p.access === 'paid').map((p, i) => `<label class="bought" style="cursor:pointer"><input type="checkbox" name="ni-pack" value="${p.id}" ${i === 0 ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--orange-500)"><span class="mini" style="width:40px;height:40px;background:${p.field}">${artSVG(p.art[0])}</span><span style="font-weight:500;font-size:14.5px">${esc(pt(p.id).t)}</span></label>`).join('')}</div>
      </fieldset>
      <div style="margin-top:auto;display:flex;gap:10px"><button type="button" class="btn btn-ghost" data-act="close">${t('cancel')}</button><button type="submit" class="btn btn-primary" style="flex:1">${icon('send', 'icon-sm')}${t('ni_send')}</button></div>
    </form></div>`;
  }
  if (d.type === 'member') {
    const m = state.members.find(x => x.id === d.id);
    return `<div class="scrim drawer-scrim" data-act="scrim"><div class="drawer" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
      <div class="dialog-head" style="margin:0"><div style="display:flex;gap:14px;align-items:center">${avatar(m.name, 52)}<div><h2 id="dlg-title">${esc(m.name)}</h2><p class="muted" style="font-size:14px">${esc(m.email)}</p></div></div>${close}</div>
      <div class="filters"><span class="pill pill-grey">${m.lang.toUpperCase()}</span>${m.active ? `<span class="pill pill-soft-green"><span class="dot"></span>${t('active')}</span>` : `<span class="pill pill-grey"><span class="dot"></span>${t('deactivated')}</span>`}<span class="pill pill-grey">${t('th_joined')}: ${fmtShort(new Date(TODAY.getTime() - m.joined * DAY))}</span></div>
      <div><h3 style="font-size:16px">${t('md_access')}</h3><p class="hint" style="margin-top:4px">${t('md_accessP')}</p></div>
      <div class="stack" style="gap:8px">${PACKS.filter(p => p.vis !== 'hidden' && p.access === 'paid').map(p => `<div class="bought"><span class="mini" style="width:40px;height:40px;background:${p.field}">${artSVG(p.art[0], m.packs.includes(p.id) ? 'color' : 'line')}</span><span style="flex:1;font-weight:500;font-size:14.5px">${esc(pt(p.id).t)}</span>
        <span class="toggle"><input type="checkbox" data-act="grant" data-m="${m.id}" data-p="${p.id}" ${m.packs.includes(p.id) ? 'checked' : ''} aria-label="${esc(pt(p.id).t)}"><span></span></span></div>`).join('')}</div>
      <div><h3 style="font-size:16px;margin-bottom:10px">${t('md_actions')}</h3><div class="actions">
        <button class="btn btn-ghost btn-sm" data-act="member-link" data-id="${m.id}">${icon('send', 'icon-sm')}${t('md_sendLink')}</button>
        <button class="btn ${m.active ? 'btn-danger' : 'btn-ghost'} btn-sm" data-act="member-active" data-id="${m.id}">${t(m.active ? 'md_deactivate' : 'md_reactivate')}</button></div></div>
    </div></div>`;
  }
  return '';
}

/* ---------- prototype map ---------- */
function protoView() {
  const r = route();
  const groups = [
    ['grp_emails', [['email-invite', 'r_email_invite'], ['email-link', 'r_email_link'], ['email-unlocked', 'r_email_unlocked']]],
    ['grp_access', [['invite', 'r_invite'], ['link-expired', 'r_link_expired'], ['link-used', 'r_link_used'], ['login', 'r_login'], ['login-sent', 'r_login_sent'], ['access', 'r_access']]],
    ['grp_member', [['library', 'r_library'], ['pack-noah', 'r_pack'], ['profile', 'r_profile']]],
    ['grp_admin', [['admin', 'r_admin'], ['admin-invites', 'r_admin_invites'], ['admin-members', 'r_admin_members'], ['admin-showcase', 'r_admin_showcase'], ['admin-pack-noah', 'r_admin_pack'], ['admin-integrations', 'r_admin_integrations']]],
  ];
  return `${state.proto ? `<div class="proto-panel" role="dialog" aria-label="${t('protoMap')}"><h3>${t('protoMap')}</h3><p class="hint">${t('protoNote')}</p>
      ${groups.map(([g, items]) => `<div class="proto-group"><p>${t(g)}</p>${items.map(([id, k]) => `<a href="#${id}" ${r === id ? 'aria-current="page"' : ''}>${t(k)}${icon('chevronRight', 'icon-sm')}</a>`).join('')}</div>`).join('')}
    </div>` : ''}`;
}

/* ---------- render ---------- */
let clockTimer = null, resendTimer = null;
function render() {
  const r = route();
  let html;
  if (r.startsWith('email-')) html = emailView(r.slice(6));
  else if (r === 'invite') html = inviteView();
  else if (r === 'link-expired') html = linkStateView('expired');
  else if (r === 'link-used') html = linkStateView('used');
  else if (r === 'login') html = loginView();
  else if (r === 'login-sent') html = loginSentView();
  else if (r === 'access') html = accessView();
  else if (r === 'profile') html = profileView();
  else if (r.startsWith('pack-')) html = packView(r.slice(5));
  else if (r === 'admin') html = adminOverview();
  else if (r === 'admin-invites') html = invitesView();
  else if (r === 'admin-members') html = membersView();
  else if (r === 'admin-showcase') html = showcaseView();
  else if (r.startsWith('admin-pack-')) html = editorView(r.slice(11));
  else if (r === 'admin-integrations') html = integrationsView();
  else html = libraryView();
  document.documentElement.lang = LOCALES[state.lang];
  $('#app').innerHTML = html;
  renderOverlay();
  $('#proto').innerHTML = protoView();
  startTimers();
}
function renderOverlay() {
  $('#overlay').innerHTML = dialogView();
  const svg = $('#colour-svg');
  if (svg && state.dialog) {
    const fills = state.fills[state.dialog.art] || {};
    svg.querySelectorAll('.r').forEach((el, i) => { el.dataset.i = i; if (fills[i]) el.setAttribute('fill', fills[i]); });
  }
}
function openDialog(d) {
  state.dialog = d; state.lastFocus = document.activeElement; renderOverlay();
  const first = $('#overlay [role="dialog"] input, #overlay [role="dialog"] button:not([data-act="close"]), #overlay [role="dialog"] button');
  first && first.focus();
}
function closeDialog() {
  state.dialog = null; renderOverlay();
  state.lastFocus && state.lastFocus.focus && document.contains(state.lastFocus) && state.lastFocus.focus();
}
function startTimers() {
  clearInterval(clockTimer); clearInterval(resendTimer);
  const clock = $('#clock');
  if (clock) {
    const nx = nextExpiring();
    const end = Date.now() + nx.exp * 36e5;
    const tick = () => {
      const s = Math.max(0, Math.round((end - Date.now()) / 1000));
      const p = (n) => String(n).padStart(2, '0');
      clock.innerHTML = `${p(Math.floor(s / 3600))}<span>:</span>${p(Math.floor(s / 60) % 60)}<span>:</span>${p(s % 60)}`;
    };
    tick(); clockTimer = setInterval(tick, 1000);
  }
  const rb = $('#resend-btn');
  if (rb) {
    let s = 30;
    resendTimer = setInterval(() => {
      s--; if (!document.contains(rb)) return clearInterval(resendTimer);
      if (s <= 0) { rb.disabled = false; rb.textContent = t('sent_resend'); clearInterval(resendTimer); }
      else rb.textContent = t('sent_resendIn', { s });
    }, 1000);
  }
}

/* ---------- validation helpers ---------- */
const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
function setError(fieldId, msg) {
  const f = document.getElementById(fieldId);
  if (!f) return;
  f.classList.toggle('has-error', !!msg);
  f.querySelector('.error-text')?.remove();
  if (msg) f.insertAdjacentHTML('beforeend', `<span class="error-text">${icon('alert', 'icon-sm')}${msg}</span>`);
}
function pwLevel(v) {
  if (!v) return 0;
  let s = 0;
  if (v.length >= 8) s++;
  if (v.length >= 12) s++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
  if (/\d/.test(v) || /[^\w]/.test(v)) s++;
  return Math.max(1, Math.min(4, s));
}

/* ---------- events ---------- */
document.addEventListener('click', (e) => {
  const goEl = e.target.closest('[data-go]');
  if (goEl && !e.target.closest('[data-act="grant"]')) { e.preventDefault(); state.menu = false; go(goEl.dataset.go); return; }
  const el = e.target.closest('[data-act]');
  if (!el) {
    if (state.menu && !e.target.closest('.split')) { state.menu = false; render(); }
    if (state.proto && !e.target.closest('.proto-panel, .proto-btn')) { state.proto = false; $('#proto').innerHTML = protoView(); }
    return;
  }
  const a = el.dataset.act, id = el.dataset.id, v = el.dataset.v;
  const needsHref = el.tagName === 'A';
  switch (a) {
    case 'scrim': if (e.target === el) closeDialog(); return;
    case 'close': e.preventDefault(); closeDialog(); return;
    case 'proto': state.proto = !state.proto; $('#proto').innerHTML = protoView(); document.querySelectorAll('.proto-btn').forEach(b => b.setAttribute('aria-expanded', state.proto)); return;
    case 'help': e.preventDefault(); openDialog({ type: 'help' }); return;
    case 'filter': state.filter = v; render(); return;
    case 'dismiss-welcome': state.justJoined = false; render(); return;
    case 'checkout': openDialog({ type: 'checkout', id, step: 'summary' }); return;
    case 'co-next': state.dialog.step = 'gateway'; renderOverlay(); $('#co-card')?.focus(); return;
    case 'co-pay': {
      const pid = state.dialog.id;
      state.dialog.step = 'paying'; renderOverlay();
      setTimeout(() => {
        if (!state.dialog) return;
        state.dialog.step = 'unlocking'; renderOverlay();
        setTimeout(() => {
          state.owned.add(pid);
          state.feed.unshift({ k: 'unlocked', who: state.user.name, pack: pid, time: new Date().toTimeString().slice(0, 5) });
          state.deliveries.unshift({ ev: 'order.paid', ref: 'KG-20260923-' + Math.random().toString(36).slice(2, 7).toUpperCase(), time: new Date().toTimeString().slice(0, 8), res: 'ok' });
          state.dialog = null;
          toast(t('co_toast', { pack: esc(pt(pid).t) }));
          go('pack-' + pid);
        }, 1100);
      }, 1300);
      return;
    }
    case 'studio': openDialog({ type: 'studio', art: el.dataset.art }); return;
    case 'crayon': state.crayon = el.dataset.c; document.querySelectorAll('.crayon').forEach(c => c.setAttribute('aria-pressed', c.dataset.c === state.crayon)); return;
    case 'studio-reset': state.fills[state.dialog.art] = {}; renderOverlay(); return;
    case 'download': toast(t('pack_dlToast')); return;
    case 'saved': toast(t('saved')); return;
    case 'setlang': setLang(v); return;
    case 'export': toast(t('prof_exportToast')); return;
    case 'delete': state.profDelete = true; render(); return;
    case 'delete-no': state.profDelete = false; render(); return;
    case 'delete-yes': state.profDelete = false; toast(t('prof_deleteToast')); go('login'); return;
    case 'pw-toggle': {
      const inp = document.getElementById(el.dataset.for);
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      el.innerHTML = icon(show ? 'eyeOff' : 'eye');
      el.setAttribute('aria-label', t(show ? 'hidePw' : 'showPw'));
      return;
    }
    case 'login-mode': state.loginEmail = $('#lg-email')?.value || state.loginEmail; state.loginMode = v; render(); return;
    case 'forgot': {
      e.preventDefault();
      const em = $('#lg-email').value;
      if (!validEmail(em)) return setError('f-lemail', t('err_email'));
      setError('f-lemail', ''); toast(t('login_reset', { email: esc(em) })); return;
    }
    case 'resend-link': toast(t('sent_lead', { email: esc(state.loginEmail) })); el.disabled = true; startTimers(); return;
    case 'menu': state.menu = !state.menu; render(); return;
    case 'new-invite': state.menu = false; render(); openDialog({ type: 'invite-new' }); return;
    case 'upload-pages': state.menu = false; if (!route().startsWith('admin-pack-')) { state.edTab = 'pages'; go('admin-pack-noah'); } else toast(t('ed_uploadToast')); return;
    case 'inv-filter': state.invFilter = v; render(); return;
    case 'resend': { const i = state.invites.find(x => x.id == id); if (i.status === 'expired' || i.status === 'revoked') { i.status = 'sent'; i.exp = 168; i.sent = 0; } toast(t('toast_resent', { email: esc(i.email) })); render(); return; }
    case 'copy-invite': copyText('https://members.yourdomain.co.za/invite/kmi_' + Math.random().toString(36).slice(2, 14)).then(() => toast(t('toast_copied'))); return;
    case 'revoke': state.revoking = +id; render(); return;
    case 'revoke-no': state.revoking = null; render(); return;
    case 'revoke-yes': { const i = state.invites.find(x => x.id == id); i.status = 'revoked'; i.exp = 0; state.revoking = null; toast(t('toast_revoked')); render(); return; }
    case 'member': openDialog({ type: 'member', id }); return;
    case 'member-link': { const m = state.members.find(x => x.id === id); toast(t('toast_linkSent', { email: esc(m.email) })); return; }
    case 'member-active': { const m = state.members.find(x => x.id === id); m.active = !m.active; toast(t(m.active ? 'toast_reactivated' : 'toast_deactivated', { name: esc(m.name) })); render(); return; }
    case 'vis': P[id].vis = v; render(); return;
    case 'sc-key': return;
    case 'ed-tab': state.edTab = v; render(); return;
    case 'ed-lang': state.edLang = v; render(); return;
    case 'ed-preview': state.edPreview = v; render(); return;
    case 'secret': state.secretShown = !state.secretShown; render(); return;
    case 'rotate': toast(t('rotateToast')); return;
    case 'copy-text': copyText($('#' + el.dataset.target).textContent).then(() => toast(t('copied'))); return;
    case 'test-event': state.deliveries.unshift({ ev: 'integration.test', ref: '—', time: new Date().toTimeString().slice(0, 8), res: 'test' }); toast(t('int_testToast')); render(); return;
    default: if (needsHref) return;
  }
});

document.addEventListener('change', (e) => {
  const el = e.target;
  const a = el.dataset.act;
  if (a === 'lang') return setLang(el.value);
  if (a === 'nopw') {
    const pw = $('#iv-pw');
    pw.disabled = el.checked;
    $('#f-pw').style.opacity = el.checked ? .45 : 1;
    if (el.checked) setError('f-pw', '');
    return;
  }
  if (a === 'grant') {
    const m = state.members.find(x => x.id === el.dataset.m);
    const pid = el.dataset.p;
    if (el.checked) { m.packs.push(pid); toast(t('toast_granted', { pack: esc(pt(pid).t), name: esc(m.name) })); }
    else { m.packs = m.packs.filter(x => x !== pid); toast(t('toast_removed', { pack: esc(pt(pid).t), name: esc(m.name) })); }
    const mini = el.closest('.bought').querySelector('.mini');
    mini.innerHTML = artSVG(P[pid].art[0], el.checked ? 'color' : 'line');
    const row = $('#app').querySelector(`tr[data-id="${m.id}"]`);
    if (row) { const html = membersView(); const tmp = document.createElement('div'); tmp.innerHTML = html; const nr = tmp.querySelector(`tr[data-id="${m.id}"]`); nr && row.replaceWith(nr); }
    return;
  }
  if (a === 'ed-access') { P[el.dataset.id].access = el.value; render(); }
});

document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.id === 'lib-search') { state.q = el.value; if (state.q && state.filter !== 'all') state.filter = 'all'; const g = $('#lib-grid'); if (g) g.innerHTML = libGrid(); return; }
  if (el.id === 'iv-pw') {
    const lv = pwLevel(el.value);
    $('#pw-meter').dataset.level = lv;
    $('#pw-label').textContent = lv ? t(['pw_weak', 'pw_weak', 'pw_ok', 'pw_good', 'pw_strong'][lv]) : '';
    if (el.value.length >= 8) setError('f-pw', '');
    return;
  }
  if (el.id === 'inv-search' || el.id === 'mem-search') {
    if (el.id === 'inv-search') state.invQ = el.value; else state.memQ = el.value;
    const pos = el.selectionStart; render();
    const n = document.getElementById(el.id); n.focus(); n.setSelectionRange(pos, pos);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (state.dialog) closeDialog();
    else if (state.proto) { state.proto = false; $('#proto').innerHTML = protoView(); }
    else if (state.menu) { state.menu = false; render(); }
  }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('tr[data-act="member"], .dropzone')) { e.preventDefault(); e.target.click(); }
  const h = e.target.closest?.('[data-act="sc-key"]');
  if (h && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
    e.preventDefault();
    const i = state.order.indexOf(h.dataset.id), j = i + (e.key === 'ArrowUp' ? -1 : 1);
    if (j < 0 || j >= state.order.length) return;
    [state.order[i], state.order[j]] = [state.order[j], state.order[i]];
    render(); document.querySelector(`[data-act="sc-key"][data-id="${h.dataset.id}"]`)?.focus();
    toast(t('sc_moved'));
  }
  if (state.dialog && e.key === 'Tab') {
    const box = $('#overlay [role="dialog"]');
    const f = [...box.querySelectorAll('button, input, select, textarea, a[href]')].filter(x => !x.disabled);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }
});

/* colouring: tap a region */
document.addEventListener('pointerdown', (e) => {
  const r = e.target.closest('#colour-svg .r');
  if (!r) return;
  const art = state.dialog.art;
  state.fills[art] = state.fills[art] || {};
  state.fills[art][r.dataset.i] = state.crayon;
  r.setAttribute('fill', state.crayon);
});

/* forms */
document.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  if (f.id === 'invite-form') {
    const name = $('#iv-name').value.trim(), noPw = $('#iv-nopw').checked, pw = $('#iv-pw').value, terms = $('#iv-terms').checked;
    setError('f-name', name ? '' : t('err_name'));
    setError('f-pw', noPw || pw.length >= 8 ? '' : t('err_pw'));
    setError('f-terms', terms ? '' : t('err_terms'));
    if (!name || (!noPw && pw.length < 8) || !terms) { f.querySelector('.has-error input')?.focus(); return; }
    const btn = $('#iv-submit');
    btn.classList.add('is-loading'); btn.innerHTML = `<span class="spin"></span>${t('inv_creating')}`;
    setTimeout(() => {
      state.user.name = name; state.user.first = name.split(' ')[0]; state.user.hasPw = !noPw;
      state.justJoined = true; state.filter = 'all';
      toast(t('inv_welcomeToast', { name: esc(state.user.first) }));
      go('library');
    }, 1200);
  }
  if (f.id === 'access-form') {
    const em = $('#acc-email').value;
    if (!validEmail(em)) { setError('f-acc', t('err_email')); $('#acc-email').focus(); return; }
    state.accessSent = em; render();
  }
  if (f.id === 'login-form') {
    const em = $('#lg-email').value;
    if (!validEmail(em)) { setError('f-lemail', t('err_email')); $('#lg-email').focus(); return; }
    setError('f-lemail', '');
    state.loginEmail = em;
    if (state.loginMode === 'link') return go('login-sent');
    const pw = $('#lg-pw').value;
    if (pw.length < 8) { $('#lg-errors').innerHTML = `<div class="notice notice-warn">${icon('alert')}<span>${t('err_login')}</span></div>`; $('#lg-pw').focus(); return; }
    go('library');
  }
  if (f.id === 'ni-form') {
    const em = $('#ni-email').value;
    if (!validEmail(em)) { setError('f-ni-email', t('err_email')); $('#ni-email').focus(); return; }
    const packs = [...f.querySelectorAll('input[name="ni-pack"]:checked')].map(x => x.value);
    const name = $('#ni-name').value.trim() || em.split('@')[0];
    state.invites.unshift({ id: Date.now(), name, email: em, packs: packs.length ? packs : ['noah'], lang: $('#ni-lang').value, sent: 0, exp: +$('#ni-exp').value * 24, status: 'sent', src: 'manual' });
    state.dialog = null; toast(t('toast_sent', { email: esc(em) }));
    state.invFilter = 'all'; go('admin-invites');
  }
});

/* showcase drag & drop */
let dragId = null;
document.addEventListener('dragstart', (e) => { const row = e.target.closest?.('.sc-row'); if (!row) return; dragId = row.dataset.id; row.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
document.addEventListener('dragover', (e) => {
  const row = e.target.closest?.('.sc-row'); if (!row || !dragId) return;
  e.preventDefault(); document.querySelectorAll('.sc-row').forEach(r => r.classList.toggle('drop-before', r === row));
});
document.addEventListener('drop', (e) => {
  const row = e.target.closest?.('.sc-row'); if (!row || !dragId) return;
  e.preventDefault();
  const from = state.order.indexOf(dragId);
  state.order.splice(from, 1);
  state.order.splice(state.order.indexOf(row.dataset.id) + (from <= state.order.indexOf(row.dataset.id) ? 1 : 0), 0, dragId);
  dragId = null; render(); toast(t('sc_moved'));
});
document.addEventListener('dragend', () => { dragId = null; document.querySelectorAll('.sc-row').forEach(r => r.classList.remove('dragging', 'drop-before')); });
document.addEventListener('dragover', (e) => { const dz = e.target.closest?.('#dropzone'); if (dz) { e.preventDefault(); dz.classList.add('over'); } });
document.addEventListener('drop', (e) => { const dz = e.target.closest?.('#dropzone'); if (dz) { e.preventDefault(); dz.classList.remove('over'); toast(t('ed_uploadToast')); } });

function copyText(s) {
  try { return navigator.clipboard.writeText(s).catch(() => {}); } catch (_) { return Promise.resolve(); }
}
function setLang(l) {
  state.lang = l;
  try { localStorage.setItem('km-lang', l); } catch (_) { }
  render();
}

window.addEventListener('hashchange', () => { state.dialog = null; state.menu = false; state.proto = false; state.revoking = null; state.accessSent = null; state.profDelete = false; window.scrollTo(0, 0); render(); });
try { const l = localStorage.getItem('km-lang'); if (l && I18N[l]) state.lang = l; } catch (_) { }
render();
