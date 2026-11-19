// Kingdom Ops — clickable prototype. One function per route (screen*), pure components (capitalised),
// hash router, in-memory mutations. Class names, field names and screen names map one-to-one to the Next.js app.
'use strict';

/* ======================================================================
   Copy (pt-PT). The app copies this object into its messages file.
   ====================================================================== */
const T = {
  app: 'Kingdom Ops',
  nav: { home: 'Início', agenda: 'Agenda', pipelines: 'Pipelines', pipeline: 'Pipeline', minutes: 'Atas', team: 'Equipa', settings: 'Definições', logout: 'Sair' },
  greet: { morning: 'Bom dia', afternoon: 'Boa tarde', evening: 'Boa noite' },
  next: { title: 'A seguir', none: 'Sem mais reuniões hoje', team: 'Próxima da equipa', now: 'a decorrer', in: 'em', tomorrow: 'Amanhã' },
  today: 'Hoje', week: 'Esta semana', restOfWeek: 'Resto da semana', operation: 'Operação', all: 'Todos',
  periods: { morning: 'Manhã', afternoon: 'Tarde', evening: 'Noite' },
  actions: { newMeeting: 'Nova reunião', newCard: { meetings: 'Nova reunião', sales: 'Nova oportunidade', projects: 'Novo projeto', campaigns: 'Nova campanha', tasks: 'Nova tarefa', custom: 'Novo cartão' }, move: 'Mover para', whatsapp: 'WhatsApp', edit: 'Editar', save: 'Guardar', cancel: 'Cancelar', back: 'Voltar', open: 'Abrir', create: 'Criar', print: 'Imprimir / PDF', confirm: 'Confirmar', add: 'Adicionar', remove: 'Remover', seeAll: 'Ver tudo', today: 'Hoje', filter: 'Filtrar', createMinutes: 'Criar ata', openMinutes: 'Abrir ata', saveDraft: 'Guardar rascunho', finalize: 'Marcar como final', conclude: 'Concluir reunião', login: 'Entrar', forgot: 'Esqueci a palavra-passe', invite: 'Convidar membro', addStage: 'Adicionar etapa', newPipeline: 'Novo pipeline a partir de modelo' },
  minutes: { title: 'Atas', one: 'Ata', draft: 'Rascunho', final: 'Final', missing: 'Atas em falta', missingHint: 'Reuniões concluídas sem ata final', none: 'Nenhuma ata ainda', noneHint: 'As atas nascem a partir de uma reunião. Abra a reunião e toque em "Criar ata".', noMinutes: 'Ainda sem ata', noMinutesHint: 'Normalmente escreve-se logo a seguir à reunião. Fica pré-preenchida com os dados desta reunião.', writtenBy: 'Redigida por', approvedBy: 'Aprovada por', sections: { meeting: 'Reunião', attendees: 'Participantes', agenda: 'Ordem de trabalhos', decisions: 'Decisões', actions: 'Ações', next: 'Próximos passos', close: 'Fecho' }, chooseMeeting: 'A que reunião pertence esta ata?', chooseHint: 'Cada ata está ligada a uma reunião. Escolha a reunião para pré-preencher a ata.' },
  stageRules: { note: 'pede motivo', reschedule: 'pede nova data' },
  empty: { agenda: 'Nada marcado', agendaHint: 'Toque em + para marcar uma reunião neste dia.', stage: 'Sem cartões nesta etapa', pipeline: 'Nada aqui ainda', pipelineHint: 'Arraste cartões para esta etapa ou crie um novo.' },
  form: { required: 'Campo obrigatório', saved: 'Guardado', created: 'Criado' },
  toast: { moved: 'Movido para', whatsapp: 'A abrir o WhatsApp com a mensagem pronta', minutesSaved: 'Rascunho guardado', minutesFinal: 'Ata marcada como final', concludeAsk: 'Concluir a reunião também?', phase2: 'Fica para a fase 2', pipelineCreated: 'Pipeline criado a partir do modelo', stagesSaved: 'Etapas guardadas' },
  kind: { meetings: 'Reunião', sales: 'Oportunidade', projects: 'Projeto', campaigns: 'Campanha', tasks: 'Tarefa', custom: 'Cartão' },
  location: { in_person: 'Presencial', online: 'Online', phone: 'Chamada' },
  sample: 'Dados de exemplo',
};

/* ======================================================================
   Icons (lucide, 24-grid). The app uses lucide-react with the same names.
   ====================================================================== */
const ICONS = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  kanban: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 7v7"/><path d="M12 7v4"/><path d="M16 7v9"/>',
  'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'map-pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  video: '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  building: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  printer: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
  message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  grip: '<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>',
  pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  'check-square': '<path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  crown: '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>',
  alert: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  'calendar-clock': '<path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h5"/><path d="M17.5 17.5 16 16.3V14"/><circle cx="16" cy="16" r="6"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
};
const icon = (name, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

/* ======================================================================
   Utilities
   ====================================================================== */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const uid = (p) => p + Math.random().toString(36).slice(2, 8);
const dayKey = (iso) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
const TODAY = dayKey(NOW.toISOString());
const addDays = (key, n) => { const d = new Date(key + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const mondayOf = (key) => { const d = new Date(key + 'T00:00:00Z'); return addDays(key, -((d.getUTCDay() + 6) % 7)); };
const fmtTime = (iso) => new Intl.DateTimeFormat('pt-PT', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
const fmtDay = (key, opts) => cap(new Intl.DateTimeFormat('pt-PT', { timeZone: 'UTC', ...opts }).format(new Date(key + 'T00:00:00Z')));
const fmtDayLong = (key) => fmtDay(key, { weekday: 'long', day: 'numeric', month: 'long' });
const fmtDayShort = (key) => fmtDay(key, { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', '');
const fmtDate = (iso) => fmtDay(dayKey(iso), { day: 'numeric', month: 'short' }).replace('.', '');
const fmtDateTime = (iso) => `${fmtDayShort(dayKey(iso))} · ${fmtTime(iso)}`;
const fmtMonth = (key) => fmtDay(key, { month: 'long', year: 'numeric' });
const fmtMoney = (cents) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'MZN', maximumFractionDigits: 0 }).format(cents / 100);
const minutesDiff = (a, b) => Math.round((new Date(a) - new Date(b)) / 60000);
const relFromNow = (iso) => {
  const m = minutesDiff(iso, NOW.toISOString());
  if (m < 0) return `há ${fmtDuration(-m)}`;
  return `${T.next.in} ${fmtDuration(m)}`;
};
const fmtDuration = (m) => (m < 60 ? `${m} min` : m % 60 === 0 ? `${m / 60} h` : `${Math.floor(m / 60)} h ${m % 60}`);
const initials = (name) => name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
const hourOf = (iso) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', hour12: false }).format(new Date(iso)));
const periodOf = (iso) => { const h = hourOf(iso); return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'; };
const greeting = () => { const h = hourOf(NOW.toISOString()); return h < 12 ? T.greet.morning : h < 19 ? T.greet.afternoon : T.greet.evening; };
const localDate = (iso) => dayKey(iso);
const localTime = (iso) => fmtTime(iso);
const toIso = (date, time) => `${date}T${time || '00:00'}:00+02:00`;

/* ======================================================================
   Data access
   ====================================================================== */
const find = (table, id) => DB[table].find((r) => r.id === id);
const profile = (id) => find('profiles', id);
const pipeline = (id) => find('pipelines', id);
const pipelineBySlug = (slug) => DB.pipelines.find((p) => p.slug === slug);
const stage = (id) => find('pipeline_stages', id);
const stagesOf = (pipelineId) => DB.pipeline_stages.filter((s) => s.pipeline_id === pipelineId).sort((a, b) => a.position - b.position);
const cardsOf = (pipelineId) => DB.cards.filter((c) => c.pipeline_id === pipelineId && !c.archived_at);
const participantsOf = (cardId) => DB.card_participants.filter((p) => p.card_id === cardId).map((p) => profile(p.profile_id));
const activityOf = (cardId) => DB.card_activity.filter((a) => a.card_id === cardId).sort((a, b) => new Date(b.at) - new Date(a.at));
const minutesOfCard = (cardId) => DB.minutes.find((m) => m.card_id === cardId);
const meetingsPipeline = () => DB.pipelines.find((p) => p.kind === 'meetings');
const isMeeting = (card) => pipeline(card.pipeline_id).kind === 'meetings';
const meetings = () => DB.cards.filter((c) => isMeeting(c) && c.starts_at && !c.archived_at);
const involves = (card, profileId) => !profileId || card.owner_id === profileId || DB.card_participants.some((p) => p.card_id === card.id && p.profile_id === profileId);
const meetingsOn = (key, member) => meetings().filter((c) => dayKey(c.starts_at) === key && involves(c, member)).sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
const isCancelled = (card) => stage(card.stage_id).is_lost;
const missingMinutes = () => meetings().filter((c) => stage(c.stage_id).is_done && !(minutesOfCard(c.id) && minutesOfCard(c.id).status === 'final'));
const kindLabel = (card) => T.kind[pipeline(card.pipeline_id).kind] || T.kind.custom;

/* ======================================================================
   State and router
   ====================================================================== */
const state = { route: null, sheet: null, draft: null, errors: {}, member: '', loggedIn: true, menu: false, tab: null, dragging: null, changedPill: null };
// Embedded (Claude Artifact) mode: the viewer blocks hash routes and window.print, so routing is in memory there.
const EMBED = !!window.KOPS_EMBED;
let memHash = '/';
const currentHash = () => (EMBED ? memHash : location.hash.replace(/^#/, '')) || '/';

function parseHash() {
  const raw = currentHash();
  const [path, qs] = raw.split('?');
  const params = Object.fromEntries(new URLSearchParams(qs || ''));
  return { path: path.replace(/\/+$/, '') || '/', params };
}
const ROUTES = [
  ['/login', () => screenLogin()],
  ['/', () => screenHome()],
  ['/agenda', (p) => screenAgenda(p)],
  ['/cards/new', (p) => screenCardForm(null, p)],
  [/^\/cards\/([^/]+)\/edit$/, (p, m) => screenCardForm(m[1], p)],
  [/^\/cards\/([^/]+)$/, (p, m) => screenCard(m[1], p)],
  [/^\/pipelines\/([^/]+)$/, (p, m) => screenPipeline(m[1], p)],
  ['/atas', (p) => screenMinutesList(p)],
  ['/atas/new', (p) => screenMinutesForm(null, p)],
  [/^\/atas\/([^/]+)\/edit$/, (p, m) => screenMinutesForm(m[1], p)],
  [/^\/atas\/([^/]+)\/print$/, (p, m) => screenMinutesPrint(m[1])],
  [/^\/atas\/([^/]+)$/, (p, m) => screenMinutes(m[1])],
  ['/team', () => screenTeam()],
  [/^\/settings\/pipelines\/([^/]+)$/, (p, m) => screenPipelineSettings(m[1])],
];
const go = (hash) => { if (EMBED) { memHash = hash; state.sheet = null; render(); } else location.hash = hash; };
const waLink = (text) => 'https://wa.me/?text=' + encodeURIComponent(text);

function render() {
  const route = parseHash();
  const changed = !state.route || state.route.path !== route.path;
  if (changed) { state.draft = null; state.errors = {}; state.tab = null; }
  state.route = route;
  const scroller = document.querySelector('.app-scroll');
  const scrollTop = scroller && !changed ? scroller.scrollTop : 0;
  let out = null;
  for (const [match, fn] of ROUTES) {
    if (typeof match === 'string') { if (match === route.path) { out = fn(route.params); break; } }
    else { const m = route.path.match(match); if (m) { out = fn(route.params, m); break; } }
  }
  if (!out) out = screenHome();
  const root = document.getElementById('root');
  root.innerHTML = out.bare ? `<div class="app"><div class="app-scroll">${out.html}</div>${Overlay()}<div class="toasts" id="toasts" aria-live="polite"></div></div>`
    : `<div class="app"><div class="app-scroll"><div class="shell">${Sidebar(out.nav)}<main class="main"><div class="panel">${out.html}</div></main></div>${Tabbar(out.nav)}</div>${Overlay()}<div class="toasts" id="toasts" aria-live="polite"></div></div>`;
  const s = document.querySelector('.app-scroll');
  if (s) s.scrollTop = scrollTop;
  renderProtoTools();
  if (state.changedPill) { const el = document.querySelector(`[data-pill="${state.changedPill}"]`); if (el) el.classList.add('is-changed'); state.changedPill = null; }
  document.title = `${out.title ? out.title + ' · ' : ''}${T.app}`;
}

/* ======================================================================
   Shell components
   ====================================================================== */
function Sidebar(active) {
  const me = profile(ME);
  const item = (href, ico, label, key, n) => `<a class="nav-item ${active === key ? 'is-active' : ''}" href="#${href}">${icon(ico)}<span>${label}</span>${n ? `<span class="n num">${n}</span>` : ''}</a>`;
  const todayN = meetingsOn(TODAY).filter((c) => !isCancelled(c)).length;
  return `<aside class="sidebar">
    <a class="logo" href="#/"><span class="mark">${icon('crown')}</span>${T.app}</a>
    <nav class="nav" aria-label="Principal">
      ${item('/', 'home', T.nav.home, 'home')}
      ${item('/agenda', 'calendar', T.nav.agenda, 'agenda', todayN)}
      ${item('/atas', 'file-text', T.nav.minutes, 'minutes', missingMinutes().length || '')}
      ${item('/team', 'users', T.nav.team, 'team')}
      <div class="nav-group">${T.nav.pipelines}</div>
      ${DB.pipelines.map((p) => `<a class="nav-item nav-sub ${active === 'pipeline:' + p.slug ? 'is-active' : ''}" href="#/pipelines/${p.slug}"><span class="dot ${p.kind === 'meetings' ? 'info' : ''}" style="width:6px;height:6px"></span><span>${esc(p.name)}</span><span class="n num">${cardsOf(p.id).filter((c) => !stage(c.stage_id).is_done && !stage(c.stage_id).is_lost).length}</span></a>`).join('')}
    </nav>
    <div class="foot">
      <a class="nav-item ${active === 'settings' ? 'is-active' : ''}" href="#/settings/pipelines/reunioes">${icon('settings')}<span>${T.nav.settings}</span></a>
      <a class="me" href="#/team">${Avatar(me)}<span><span class="name">${esc(me.full_name)}</span><br><span class="role">${esc(me.job_title)}</span></span></a>
    </div>
  </aside>`;
}
function Tabbar(active) {
  const tab = (href, ico, label, key) => `<a class="tab ${active === key || (key === 'pipeline' && String(active).startsWith('pipeline')) ? 'is-active' : ''}" href="#${href}" aria-current="${active === key ? 'page' : 'false'}">${icon(ico)}<span>${label}</span></a>`;
  return `<div class="tabbar-wrap"><nav class="tabbar" aria-label="Principal">
    ${tab('/', 'home', T.nav.home, 'home')}
    ${tab('/agenda', 'calendar', T.nav.agenda, 'agenda')}
    ${tab('/pipelines/reunioes', 'kanban', T.nav.pipeline, 'pipeline')}
    ${tab('/atas', 'file-text', T.nav.minutes, 'minutes')}
  </nav><a class="fab" href="#/cards/new?pipeline=reunioes" aria-label="${T.actions.newMeeting}">${icon('plus')}</a></div>`;
}
function Topbar({ title, back, actions = '' }) {
  return `<header class="topbar">
    ${back ? `<a class="btn btn-quiet btn-icon" href="#${back}" aria-label="${T.actions.back}">${icon('arrow-left')}</a>` : '<span class="spacer"></span>'}
    <h1 class="h-title">${esc(title)}</h1>
    ${actions || '<span class="spacer"></span>'}
  </header>`;
}
function PageHead(title, actions = '', sub = '') {
  return `<div class="page-head"><div>${sub ? `<div class="caption">${sub}</div>` : ''}<h1 class="h-display">${esc(title)}</h1></div><div class="page-actions">${actions}</div></div>`;
}

/* ======================================================================
   Small components
   ====================================================================== */
const Avatar = (p, cls = '') => p ? `<span class="avatar ${cls}" title="${esc(p.full_name)}">${initials(p.full_name)}</span>` : '';
const Pill = (st, cardId = '') => `<span class="pill ${st.tone}" data-pill="${cardId}"><span class="dot ${st.tone}"></span>${esc(st.name)}</span>`;
const Empty = (ico, title, hint, action = '') => `<div class="empty"><div class="ico">${icon(ico)}</div><h3 class="h-title">${title}</h3><p>${hint}</p>${action}</div>`;
const locationIcon = (kind) => kind === 'online' ? 'video' : kind === 'phone' ? 'phone' : 'map-pin';
const locationShort = (card) => card.location_kind === 'online' ? 'Online' : card.location_kind === 'phone' ? T.location.phone : (card.location || '').split(',')[0];

function MeetingCard(card) {
  const st = stage(card.stage_id);
  const owner = profile(card.owner_id);
  const past = new Date(card.ends_at) < NOW && !st.is_done;
  void past;
  return `<a class="meeting-card" href="#/cards/${card.id}">
    ${Avatar(owner, 'tile')}
    <div style="min-width:0">
      <div class="title">${esc(card.title)}</div>
      <div class="sub">${fmtTime(card.starts_at)}–${fmtTime(card.ends_at)} · ${esc(card.company_name)}</div>
      <div class="foot"><span class="who">${icon(locationIcon(card.location_kind), 'xs')}<span>${esc(locationShort(card))}</span></span>${Pill(st, card.id)}</div>
    </div>
  </a>`;
}
function CardItem(card) {
  const pl = pipeline(card.pipeline_id);
  const owner = profile(card.owner_id);
  let when = '';
  if (pl.kind === 'meetings' && card.starts_at) when = `<span class="when">${icon('clock', 'xs')}${fmtDateTime(card.starts_at)}</span>`;
  else if (card.due_at) { const over = new Date(card.due_at) < NOW && !stage(card.stage_id).is_done; when = `<span class="when ${over ? 'is-overdue' : ''}">${over ? '<span class="dot danger"></span>Atrasado · ' : icon('calendar', 'xs')}${fmtDate(card.due_at)}</span>`; }
  const sub = pl.kind === 'meetings' ? `${card.company_name} · ${card.contact_name}` : [card.company_name, card.contact_name].filter(Boolean).join(' · ');
  return `<a class="card-item" href="#/cards/${card.id}" draggable="true" data-card="${card.id}">
    <div class="inline" style="justify-content:space-between;align-items:flex-start"><div class="title">${esc(card.title)}</div>${icon('grip', 'sm grip')}</div>
    <div class="sub">${esc(sub)}</div>
    <div class="foot">${when || '<span></span>'}<span class="inline">${card.value_cents ? `<span class="value num">${fmtMoney(card.value_cents)}</span>` : ''}${Avatar(owner, 'sm')}</span></div>
  </a>`;
}
function WeekStrip(selected, member) {
  const monday = mondayOf(selected);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  return `<div class="week-nav">
      <span class="label">${fmtMonth(selected)}</span>
      <span class="inline"><button class="btn btn-quiet btn-sm" data-action="agenda-day" data-day="${TODAY}">${T.actions.today}</button><button class="btn btn-ghost btn-icon btn-sm" data-action="agenda-day" data-day="${addDays(selected, -7)}" aria-label="Semana anterior">${icon('chevron-left')}</button><button class="btn btn-ghost btn-icon btn-sm" data-action="agenda-day" data-day="${addDays(selected, 7)}" aria-label="Semana seguinte">${icon('chevron-right')}</button></span>
    </div>
    <div class="week-strip" role="tablist">${days.map((d) => {
      const n = meetingsOn(d, member).filter((c) => !isCancelled(c)).length;
      return `<button class="day-chip ${d === selected ? 'is-selected' : ''} ${d === TODAY ? 'is-today' : ''} ${n ? 'has-events' : ''}" data-action="agenda-day" data-day="${d}" role="tab" aria-selected="${d === selected}" aria-label="${fmtDayLong(d)}, ${n} reuniões"><span class="dow">${fmtDay(d, { weekday: 'short' }).replace('.', '').slice(0, 3)}</span><span class="num">${Number(d.slice(8))}</span><span class="mark"></span></button>`;
    }).join('')}</div>`;
}
function MemberChips(selected, baseHref) {
  const chip = (id, label, av) => `<a class="chip ${av ? '' : 'text-only'} ${selected === id ? 'is-active' : ''}" href="#${baseHref(id)}">${av || ''}${label}</a>`;
  return `<div class="chip-row">${chip('', T.all)}${DB.profiles.map((p) => chip(p.id, p.full_name.split(' ')[0], Avatar(p, 'sm'))).join('')}</div>`;
}
function Bars(rows) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return `<div class="bars">${rows.map((r) => `<div class="bar"><span class="bar-label">${r.dot ? `<span class="dot ${r.dot}"></span>` : ''}${esc(r.label)}</span><span class="bar-track"><span class="bar-fill ${r.dot || ''}" style="width:${Math.round((r.value / max) * 100)}%"></span></span><span class="bar-value num">${r.text || r.value}</span></div>`).join('')}</div>`;
}
function whatsappText(card) {
  const owner = profile(card.owner_id);
  const lines = [`*Reunião agendada* · Kingdom`, `📅 ${fmtDayShort(dayKey(card.starts_at))} · ${fmtTime(card.starts_at)}–${fmtTime(card.ends_at)}`, `📍 ${card.location_kind === 'online' ? 'Online: ' + card.location : card.location}`, `👤 ${card.contact_name}${card.contact_role ? ' (' + card.contact_role + ')' : ''}${card.contact_phone ? ' · ' + card.contact_phone : ''}`, `🏢 ${card.company_name}${card.company_sector ? ' · ' + card.company_sector : ''}`, `📝 Assunto: ${card.title}`, `Responsável: ${owner.full_name}`];
  const parts = participantsOf(card.id); if (parts.length) lines.push(`Com: ${parts.map((p) => p.full_name).join(', ')}`);
  if (card.description) lines.push(`Notas: ${card.description}`);
  return lines.join('\n');
}
function whatsappMinutesText(m) {
  const card = find('cards', m.card_id);
  const lines = [`*Ata · ${m.title}*`, `${card.company_name} · ${fmtDayShort(m.held_at)} ${m.started_at}–${m.ended_at}`, '', '*Decisões*', ...(m.decisions.length ? m.decisions.map((d) => `• ${d.text}`) : ['• (nenhuma)']), '', '*Ações*', ...m.actions.map((a) => `• ${a.what} — ${a.who}${a.due ? ' · até ' + fmtDayShort(a.due) : ''}`)];
  if (m.next_meeting_at) lines.push('', `Próxima reunião: ${fmtDateTime(m.next_meeting_at)}`);
  return lines.join('\n');
}

/* ======================================================================
   Screens
   ====================================================================== */
function screenLogin() {
  const err = state.errors.login;
  return { bare: true, title: T.actions.login, html: `<div class="auth" style="background:var(--ground)"><form class="card" data-form="login" novalidate>
    <div class="logo" style="margin-bottom:18px"><span class="mark">${icon('crown')}</span>${T.app}</div>
    <h1 class="h-display" style="font-size:22px">Entrar</h1>
    <p class="caption" style="margin:4px 0 18px">A conta é criada pela administração do escritório.</p>
    <div class="form">
      <div class="field ${err ? 'has-error' : ''}"><label for="email">Email</label><input class="input" id="email" name="email" type="email" autocomplete="username" placeholder="o seu email de trabalho" value="${esc(state.draft?.email || '')}" data-bind="email"></div>
      <div class="field ${err ? 'has-error' : ''}"><label for="password">Palavra-passe</label><input class="input" id="password" name="password" type="password" autocomplete="current-password" data-bind="password">${err ? `<span class="error">${err}</span>` : ''}</div>
      <button class="btn btn-primary btn-lg btn-block" type="submit">${T.actions.login}</button>
      <button class="btn btn-quiet btn-block" type="button" data-action="toast" data-msg="Enviámos um link para repor a palavra-passe (simulação).">${T.actions.forgot}</button>
    </div>
  </form></div>` };
}

function screenHome() {
  const me = profile(ME);
  const todayAll = meetingsOn(TODAY).filter((c) => !isCancelled(c));
  const mine = todayAll.filter((c) => involves(c, ME));
  let next = todayAll.find((c) => new Date(c.ends_at) > NOW);
  let nextLabel = T.next.title;
  if (!next) { const up = meetings().filter((c) => new Date(c.starts_at) > NOW && !isCancelled(c)).sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))[0]; if (up) next = up; }
  if (next && !involves(next, ME)) nextLabel = `${T.next.title} · ${profile(next.owner_id).full_name.split(' ')[0]}`;
  const rest = todayAll.filter((c) => !next || c.id !== next.id);
  const weekN = meetings().filter((c) => { const k = dayKey(c.starts_at); return k >= mondayOf(TODAY) && k <= addDays(mondayOf(TODAY), 6) && !isCancelled(c); }).length;
  const missing = missingMinutes();
  const tasks = cardsOf('pl5');
  const lateTasks = tasks.filter((c) => c.due_at && new Date(c.due_at) < NOW && !stage(c.stage_id).is_done);
  const sales = cardsOf('pl2');
  const openSales = sales.filter((c) => !stage(c.stage_id).is_done && !stage(c.stage_id).is_lost);
  const openValue = openSales.reduce((s, c) => s + (c.value_cents || 0), 0);
  const stageCount = (plId, sId) => cardsOf(plId).filter((c) => c.stage_id === sId).length;

  const nextCard = next ? (() => {
    const inProgress = new Date(next.starts_at) <= NOW && new Date(next.ends_at) > NOW;
    const isToday = dayKey(next.starts_at) === TODAY;
    const when = inProgress ? T.next.now : isToday ? relFromNow(next.starts_at) : `${dayKey(next.starts_at) === addDays(TODAY, 1) ? T.next.tomorrow : fmtDayShort(dayKey(next.starts_at))}`;
    return `<section class="next-card" aria-label="${nextLabel}">
      <div class="eyebrow"><span>${nextLabel}</span><strong class="num">${fmtTime(next.starts_at)} · ${when}</strong></div>
      <h2 class="h-title">${esc(next.title)}</h2>
      <div class="meta">${esc(next.company_name)} · ${esc(next.contact_name)}${next.contact_role ? ', ' + esc(next.contact_role) : ''}</div>
      <div class="where">${icon(locationIcon(next.location_kind), 'sm')}<span>${esc(next.location)}</span></div>
      <div class="actions"><a class="btn btn-on-dark-ghost" href="${waLink(whatsappText(next))}" target="_blank" rel="noopener">${icon('message', 'sm')}${T.actions.whatsapp}</a><a class="btn btn-on-dark" href="#/cards/${next.id}">${T.actions.open}${icon('arrow-right', 'sm')}</a></div>
    </section>`;
  })() : `<section class="card card-pad"><div class="h-title">${T.next.none}</div><p class="caption" style="margin:4px 0 0">Bom momento para escrever as atas em falta.</p></section>`;

  const opsRows = [
    { href: '/pipelines/vendas', ico: 'target', name: 'Vendas', line: `<b>${stageCount('pl2', 'v_proposta')}</b> em proposta <span>·</span> <b>${stageCount('pl2', 'v_negociacao')}</b> em negociação <span>·</span> <b class="num">${fmtMoney(openValue)}</b> em aberto` },
    { href: '/pipelines/projetos', ico: 'briefcase', name: 'Projetos', line: `<b>${stageCount('pl3', 'pj_curso') + stageCount('pl3', 'pj_kickoff')}</b> em curso <span>·</span> <b>${stageCount('pl3', 'pj_revisao')}</b> em revisão <span>·</span> <b>${stageCount('pl3', 'pj_bloqueado')}</b> bloqueado` },
    { href: '/pipelines/campanhas', ico: 'megaphone', name: 'Campanhas', line: `<b>${stageCount('pl4', 'c_noar')}</b> no ar <span>·</span> <b>${stageCount('pl4', 'c_producao')}</b> em produção <span>·</span> <b>${stageCount('pl4', 'c_plano')}</b> em planeamento` },
    { href: '/pipelines/tarefas', ico: 'check-square', name: 'Tarefas', line: `<b>${lateTasks.length}</b> atrasada${lateTasks.length === 1 ? '' : 's'} <span>·</span> <b>${stageCount('pl5', 't_curso')}</b> em curso <span>·</span> <b>${stageCount('pl5', 't_bloqueada')}</b> bloqueada` },
    { href: '/atas', ico: 'file-text', name: 'Atas', line: `<b>${missing.length}</b> em falta <span>·</span> <b>${DB.minutes.filter((m) => m.status === 'draft').length}</b> rascunho` },
  ];
  const ops = `<div class="card list">${opsRows.map((r) => `<a class="row ops-row" href="#${r.href}"><span class="ops-icon">${icon(r.ico)}</span><span class="row-main"><span class="row-title">${r.name}</span><span class="count-line">${r.line}</span></span><span class="row-end">${icon('chevron-right', 'sm')}</span></a>`).join('')}</div>`;

  const left = `${nextCard}
    <section class="section"><div class="section-head"><h2 class="h-section">${T.today} · ${fmtDayShort(TODAY)}</h2><a href="#/agenda">${T.actions.seeAll}</a></div>
      ${rest.length ? `<div class="timeline">${rest.map(MeetingCard).join('')}</div>` : `<div class="card">${Empty('calendar', next ? 'Mais nada hoje' : T.empty.agenda, next ? 'Depois desta reunião, o dia está livre.' : T.empty.agendaHint)}</div>`}
    </section>
    <section class="section"><div class="section-head"><h2 class="h-section">${T.operation}</h2></div>${ops}</section>`;

  const meetingStages = stagesOf('pl1');
  const last30 = meetings().filter((c) => minutesDiff(NOW.toISOString(), c.starts_at) < 30 * 1440);
  const barsStage = Bars(meetingStages.map((s) => ({ label: s.name, dot: s.tone, value: last30.filter((c) => c.stage_id === s.id).length })));
  const next7 = meetings().filter((c) => { const k = dayKey(c.starts_at); return k >= TODAY && k <= addDays(TODAY, 6) && !isCancelled(c); });
  const barsPerson = Bars(DB.profiles.map((p) => ({ label: p.full_name.split(' ')[0], value: next7.filter((c) => involves(c, p.id)).length })));
  const right = `<div class="card card-pad counts">
      <div><span>Reuniões hoje <span class="delta">· ${mine.length} ${mine.length === 1 ? 'sua' : 'suas'}</span></span><span class="value">${todayAll.length}</span></div>
      <div><span>Esta semana <span class="delta">· ${next7.length} nos próximos 7 dias</span></span><span class="value">${weekN}</span></div>
      <div><span>Atas em falta <span class="delta">· ${DB.minutes.filter((m) => m.status === 'draft').length} em rascunho</span></span><span class="value">${missing.length}</span></div>
      <div><span>Tarefas atrasadas <span class="delta">· de ${tasks.filter((c) => !stage(c.stage_id).is_done).length} abertas</span></span><span class="value">${lateTasks.length}</span></div>
    </div>
    <section class="section"><div class="section-head"><h2 class="h-section">Reuniões por etapa · 30 dias</h2></div><div class="card card-pad">${barsStage}</div></section>
    <section class="section"><div class="section-head"><h2 class="h-section">Reuniões por pessoa · 7 dias</h2></div><div class="card card-pad">${barsPerson}</div></section>
    <section class="section"><div class="section-head"><h2 class="h-section">${T.minutes.missing}</h2><a href="#/atas">${T.actions.seeAll}</a></div>
      ${missing.length ? `<div class="card list">${missing.map((c) => `<a class="row" href="#/atas/new?card=${c.id}"><span class="tile">${icon('file-text')}</span><span class="row-main"><span class="row-title">${esc(c.title)}</span><span class="row-sub">${esc(c.company_name)} · ${fmtDayShort(dayKey(c.starts_at))}${minutesOfCard(c.id) ? ' · rascunho' : ''}</span></span><span class="row-end"><span class="btn btn-ghost btn-sm">${minutesOfCard(c.id) ? 'Continuar' : T.actions.createMinutes}</span></span></a>`).join('')}</div>` : `<div class="card">${Empty('check', 'Tudo em dia', 'Todas as reuniões concluídas têm ata final.')}</div>`}
    </section>`;

  return { nav: 'home', title: T.nav.home, html: `
    <header class="topbar" style="align-items:flex-start;padding:14px 16px 4px;min-height:auto"><div style="flex:1"><div class="caption">${fmtDayLong(TODAY)}</div><h1 class="h-display" style="margin-top:2px">${greeting()}, ${esc(me.full_name.split(' ')[0])}</h1></div><a href="#/team" aria-label="${T.nav.team}">${Avatar(me, 'lg')}</a></header>
    <div class="page">
      <div class="page-head only-desktop"><div><div class="caption">${fmtDayLong(TODAY)}</div><h1 class="h-display">${greeting()}, ${esc(me.full_name.split(' ')[0])}</h1></div><div class="page-actions"><a class="btn btn-ghost" href="#/agenda">${icon('calendar')}${T.nav.agenda}</a><a class="btn btn-primary" href="#/cards/new?pipeline=reunioes">${icon('plus')}${T.actions.newMeeting}</a></div></div>
      <div class="home-grid"><div>${left}</div><div class="only-desktop">${right}</div></div>
    </div>` };
}

function screenAgenda(params) {
  const selected = params.date || TODAY;
  const member = params.member || '';
  const href = (day, m) => `/agenda?date=${day}${m ? '&member=' + m : ''}`;
  const list = meetingsOn(selected, member);
  const groups = ['morning', 'afternoon', 'evening'].map((p) => ({ p, items: list.filter((c) => periodOf(c.starts_at) === p) })).filter((g) => g.items.length);
  const weekRest = meetings().filter((c) => { const k = dayKey(c.starts_at); return k > selected && k <= addDays(mondayOf(selected), 6) && involves(c, member) && !isCancelled(c); }).sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
  const body = groups.length ? `<div class="timeline">${groups.map((g) => `<div class="period">${T.periods[g.p]}</div>${g.items.map(MeetingCard).join('')}`).join('')}</div>`
    : Empty('calendar', T.empty.agenda, member ? `${profile(member).full_name.split(' ')[0]} não tem reuniões neste dia.` : T.empty.agendaHint, `<a class="btn btn-primary btn-sm" href="#/cards/new?pipeline=reunioes&date=${selected}">${icon('plus', 'sm')}${T.actions.newMeeting}</a>`);
  return { nav: 'agenda', title: T.nav.agenda, html: `
    ${Topbar({ title: T.nav.agenda, actions: `<a class="btn btn-quiet btn-icon" href="#/cards/new?pipeline=reunioes&date=${selected}" aria-label="${T.actions.newMeeting}">${icon('plus')}</a>` })}
    <div class="page">
      ${PageHead(T.nav.agenda, `<a class="btn btn-primary" href="#/cards/new?pipeline=reunioes&date=${selected}">${icon('plus')}${T.actions.newMeeting}</a>`).replace('class="page-head"', 'class="page-head only-desktop"')}
      <div class="card card-pad" style="padding:12px 12px 8px" data-member="${member}">${WeekStrip(selected, member)}</div>
      <div class="section" style="margin-top:14px">${MemberChips(member, (id) => href(selected, id))}</div>
      <section class="section" style="margin-top:4px"><div class="section-head"><h2 class="h-section">${selected === TODAY ? T.today + ' · ' : ''}${fmtDayLong(selected)}</h2><span class="caption num">${list.length} ${list.length === 1 ? 'reunião' : 'reuniões'}</span></div>${body}</section>
      ${weekRest.length ? `<section class="section"><div class="section-head"><h2 class="h-section">${T.restOfWeek}</h2></div><div class="card list">${weekRest.map((c) => `<a class="row" href="#/cards/${c.id}">${Avatar(profile(c.owner_id), 'tile')}<span class="row-main"><span class="row-title">${esc(c.title)}</span><span class="row-sub">${fmtDay(dayKey(c.starts_at), { weekday: 'short' }).replace('.', '')} ${fmtTime(c.starts_at)} · ${esc(c.company_name)}</span></span><span class="row-end">${icon('chevron-right', 'sm')}</span></a>`).join('')}</div></section>` : ''}
    </div>` };
}

/* ---------- card form (new / edit) ---------- */
function blankCard(pl, params) {
  return { id: null, pipeline_id: pl.id, stage_id: stagesOf(pl.id)[0].id, title: '', owner_id: ME, date: params.date || TODAY, time: '10:00', duration: 60, location_kind: 'in_person', location: '', contact_name: '', contact_role: '', contact_phone: '', contact_email: '', company_name: '', company_sector: '', value: '', due: '', due_time: '', description: '', participants: [], channel: 'LinkedIn' };
}
function screenCardForm(id, params) {
  const existing = id ? find('cards', id) : null;
  const pl = existing ? pipeline(existing.pipeline_id) : (pipelineBySlug(params.pipeline) || meetingsPipeline());
  if (!state.draft) {
    state.draft = existing ? { ...blankCard(pl, params), ...existing, date: existing.starts_at ? localDate(existing.starts_at) : TODAY, time: existing.starts_at ? localTime(existing.starts_at) : '10:00', duration: existing.starts_at ? minutesDiff(existing.ends_at, existing.starts_at) : 60, value: existing.value_cents ? existing.value_cents / 100 : '', due: existing.due_at ? localDate(existing.due_at) : '', due_time: existing.due_at ? localTime(existing.due_at) : '', participants: participantsOf(existing.id).map((p) => p.id) } : blankCard(pl, params);
  }
  const d = state.draft, e = state.errors;
  const F = (key, label, input, hint = '') => `<div class="field ${e[key] ? 'has-error' : ''}"><label for="f-${key}">${label}</label>${input}${e[key] ? `<span class="error">${e[key]}</span>` : hint ? `<span class="hint">${hint}</span>` : ''}</div>`;
  const inp = (key, type = 'text', extra = '') => `<input class="input" id="f-${key}" type="${type}" data-bind="${key}" value="${esc(d[key] ?? '')}" ${extra}>`;
  const sel = (key, options) => `<select class="select" id="f-${key}" data-bind="${key}">${options.map(([v, l]) => `<option value="${v}" ${String(d[key]) === String(v) ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  const owners = DB.profiles.map((p) => [p.id, p.full_name]);
  const title = existing ? `${T.actions.edit} ${kindLabel(existing).toLowerCase()}` : T.actions.newCard[pl.kind];
  let fields = '';
  if (pl.kind === 'meetings') {
    fields = `<div class="card fieldset"><h2 class="h-section">Reunião</h2>
        ${F('title', 'Assunto', inp('title', 'text', 'placeholder="Ex.: Diagnóstico de processos comerciais" autofocus'))}
        <div class="field-row">${F('date', 'Data', inp('date', 'date'))}${F('time', 'Hora', inp('time', 'time'))}</div>
        <div class="field-row">${F('duration', 'Duração', sel('duration', [[30, '30 min'], [45, '45 min'], [60, '1 h'], [90, '1 h 30'], [120, '2 h'], [180, '3 h']]))}${F('owner_id', 'Responsável', sel('owner_id', owners))}</div>
        <div class="field"><span class="field-label">Local</span><div class="radio-cards">${['in_person', 'online', 'phone'].map((k) => `<button type="button" class="radio-card ${d.location_kind === k ? 'is-active' : ''}" data-action="set" data-key="location_kind" data-value="${k}">${icon(locationIcon(k), 'sm')}${T.location[k]}</button>`).join('')}</div></div>
        ${d.location_kind === 'phone' ? '' : F('location', d.location_kind === 'online' ? 'Link da reunião' : 'Morada', inp('location', d.location_kind === 'online' ? 'url' : 'text', `placeholder="${d.location_kind === 'online' ? 'https://meet.google.com/…' : 'Av. 25 de Setembro, Maputo'}"`))}
        <div class="field"><span class="field-label">Participantes internos</span><div class="inline" style="flex-wrap:wrap">${DB.profiles.filter((p) => p.id !== d.owner_id).map((p) => `<button type="button" class="chip ${d.participants.includes(p.id) ? 'is-active' : ''}" data-action="toggle-participant" data-id="${p.id}">${Avatar(p, 'sm')}${p.full_name.split(' ')[0]}</button>`).join('')}</div></div>
      </div>
      <div class="card fieldset"><h2 class="h-section">Pessoa</h2>
        <div class="field-row">${F('contact_name', 'Nome', inp('contact_name'))}${F('contact_role', 'Cargo', inp('contact_role'))}</div>
        <div class="field-row">${F('contact_phone', 'Telemóvel', inp('contact_phone', 'tel', 'placeholder="+258 8x xxx xxxx"'))}${F('contact_email', 'Email', inp('contact_email', 'email'))}</div>
      </div>
      <div class="card fieldset"><h2 class="h-section">Empresa</h2>
        <div class="field-row">${F('company_name', 'Nome da empresa', inp('company_name'))}${F('company_sector', 'Sector', inp('company_sector', 'text', 'placeholder="Ex.: Logística"'))}</div>
      </div>
      <div class="card fieldset"><h2 class="h-section">Notas</h2>${F('description', 'Notas internas', `<textarea class="textarea" id="f-description" data-bind="description" placeholder="O que levar, quem decide, contexto…">${esc(d.description)}</textarea>`, 'Não vão na mensagem de WhatsApp a não ser que queira.')}</div>`;
  } else if (pl.kind === 'sales') {
    fields = `<div class="card fieldset"><h2 class="h-section">Oportunidade</h2>
        ${F('title', 'Título', inp('title', 'text', 'placeholder="Ex.: ERP com módulo de frota" autofocus'))}
        <div class="field-row">${F('value', 'Valor (MZN)', inp('value', 'number', 'inputmode="decimal" placeholder="0"'))}${F('due', 'Fecho previsto', inp('due', 'date'))}</div>
        ${F('owner_id', 'Responsável', sel('owner_id', owners))}
      </div>
      <div class="card fieldset"><h2 class="h-section">Empresa e contacto</h2>
        <div class="field-row">${F('company_name', 'Empresa', inp('company_name'))}${F('company_sector', 'Sector', inp('company_sector'))}</div>
        <div class="field-row">${F('contact_name', 'Pessoa', inp('contact_name'))}${F('contact_role', 'Cargo', inp('contact_role'))}</div>
        <div class="field-row">${F('contact_phone', 'Telemóvel', inp('contact_phone', 'tel'))}${F('contact_email', 'Email', inp('contact_email', 'email'))}</div>
      </div>
      <div class="card fieldset"><h2 class="h-section">Notas</h2>${F('description', 'Contexto', `<textarea class="textarea" id="f-description" data-bind="description">${esc(d.description)}</textarea>`)}</div>`;
  } else if (pl.kind === 'projects') {
    fields = `<div class="card fieldset"><h2 class="h-section">Projeto</h2>
        ${F('title', 'Título', inp('title', 'text', 'autofocus'))}
        <div class="field-row">${F('company_name', 'Cliente', inp('company_name'))}${F('contact_name', 'Pessoa de contacto', inp('contact_name'))}</div>
        <div class="field-row">${F('due', 'Prazo de entrega', inp('due', 'date'))}${F('owner_id', 'Responsável', sel('owner_id', owners))}</div>
        ${F('description', 'Descrição', `<textarea class="textarea" id="f-description" data-bind="description">${esc(d.description)}</textarea>`)}
      </div>`;
  } else if (pl.kind === 'campaigns') {
    fields = `<div class="card fieldset"><h2 class="h-section">Campanha</h2>
        ${F('title', 'Título', inp('title', 'text', 'autofocus'))}
        <div class="field-row">${F('channel', 'Canal', sel('channel', [['LinkedIn', 'LinkedIn'], ['Instagram', 'Instagram'], ['Email', 'Email'], ['Webinar', 'Webinar'], ['Rádio', 'Rádio'], ['Evento', 'Evento']]))}${F('value', 'Orçamento (MZN)', inp('value', 'number', 'inputmode="decimal"'))}</div>
        <div class="field-row">${F('due', 'Lançamento', inp('due', 'date'))}${F('owner_id', 'Responsável', sel('owner_id', owners))}</div>
        ${F('description', 'Descrição', `<textarea class="textarea" id="f-description" data-bind="description">${esc(d.description)}</textarea>`)}
      </div>`;
  } else {
    fields = `<div class="card fieldset"><h2 class="h-section">${T.kind[pl.kind] || T.kind.custom}</h2>
        ${F('title', 'Título', inp('title', 'text', 'autofocus'))}
        <div class="field-row">${F('owner_id', 'Responsável', sel('owner_id', owners))}${F('due', 'Prazo', inp('due', 'date'))}</div>
        ${F('company_name', 'Cliente (opcional)', inp('company_name'))}
        ${F('description', 'Descrição', `<textarea class="textarea" id="f-description" data-bind="description">${esc(d.description)}</textarea>`)}
      </div>`;
  }
  const back = existing ? `/cards/${existing.id}` : (pl.kind === 'meetings' ? '/agenda' : `/pipelines/${pl.slug}`);
  return { nav: pl.kind === 'meetings' ? 'agenda' : 'pipeline:' + pl.slug, title, html: `
    ${Topbar({ title, back })}
    <div class="page" style="max-width:720px">
      ${PageHead(title, `<a class="btn btn-quiet" href="#${back}">${T.actions.cancel}</a>`, pl.name).replace('class="page-head"', 'class="page-head only-desktop"')}
      <form class="form" data-form="card" novalidate>
        ${fields}
        <div class="form-foot"><a class="btn btn-ghost only-phone" href="#${back}">${T.actions.cancel}</a><button class="btn btn-primary" type="submit">${existing ? T.actions.save : T.actions.create}</button></div>
      </form>
    </div>` };
}

function screenCard(id, params) {
  const card = find('cards', id);
  if (!card) return { nav: 'agenda', title: '', html: `<div class="page">${Empty('alert', 'Cartão não encontrado', 'Pode ter sido arquivado.')}</div>` };
  const pl = pipeline(card.pipeline_id);
  const st = stage(card.stage_id);
  const owner = profile(card.owner_id);
  const parts = participantsOf(card.id);
  const m = minutesOfCard(card.id);
  const tab = state.tab || params.tab || 'details';
  const meeting = pl.kind === 'meetings';
  const acts = activityOf(card.id);
  const detailRows = meeting ? [
    ['Quando', `<span class="num">${fmtDayLong(dayKey(card.starts_at))}, ${fmtTime(card.starts_at)}–${fmtTime(card.ends_at)}</span>`],
    ['Onde', `${T.location[card.location_kind]}${card.location && card.location_kind !== 'phone' ? ' · ' + (card.location_kind === 'online' ? `<a href="${esc(card.location)}" style="text-decoration:underline">${esc(card.location)}</a>` : esc(card.location)) : ''}`],
    ['Pessoa', `${esc(card.contact_name)}${card.contact_role ? ', ' + esc(card.contact_role) : ''}${card.contact_phone ? `<br><a href="tel:${esc(card.contact_phone)}" class="muted">${esc(card.contact_phone)}</a>` : ''}${card.contact_email ? `<br><a href="mailto:${esc(card.contact_email)}" class="muted">${esc(card.contact_email)}</a>` : ''}`],
    ['Empresa', `${esc(card.company_name)}${card.company_sector ? ' · ' + esc(card.company_sector) : ''}`],
    ['Responsável', `<span class="inline">${Avatar(owner, 'sm')}${esc(owner.full_name)}</span>`],
    ['Participantes', parts.length ? `<span class="inline" style="flex-wrap:wrap">${parts.map((p) => `<span class="inline">${Avatar(p, 'sm')}${esc(p.full_name.split(' ')[0])}</span>`).join('')}</span>` : '<span class="muted">—</span>'],
    ['Notas', card.description ? esc(card.description) : '<span class="muted">—</span>'],
  ] : [
    ...(card.value_cents ? [[pl.kind === 'campaigns' ? 'Orçamento' : 'Valor', `<span class="num strong">${fmtMoney(card.value_cents)}</span>`]] : []),
    ...(card.due_at ? [[pl.kind === 'sales' ? 'Fecho previsto' : pl.kind === 'campaigns' ? 'Lançamento' : 'Prazo', `<span class="num">${fmtDayLong(dayKey(card.due_at))}</span>`]] : []),
    ...(card.company_name ? [['Empresa', `${esc(card.company_name)}${card.company_sector ? ' · ' + esc(card.company_sector) : ''}`]] : []),
    ...(card.contact_name ? [['Pessoa', `${esc(card.contact_name)}${card.contact_role ? ', ' + esc(card.contact_role) : ''}${card.contact_phone ? '<br><span class="muted">' + esc(card.contact_phone) + '</span>' : ''}`]] : []),
    ['Responsável', `<span class="inline">${Avatar(owner, 'sm')}${esc(owner.full_name)}</span>`],
    ['Descrição', card.description ? esc(card.description) : '<span class="muted">—</span>'],
  ];
  const details = `<div class="card card-pad"><dl class="kv">${detailRows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></div>`;
  const minutesTab = m ? `<div class="card"><a class="row" href="#/atas/${m.id}" style="min-height:64px"><span class="ops-icon" style="width:40px;height:40px;border-radius:12px;background:var(--canvas);display:inline-flex;align-items:center;justify-content:center">${icon('file-text')}</span><span class="row-main"><span class="row-title">${esc(m.title)}</span><span class="row-sub">${T.minutes.writtenBy} ${esc(profile(m.written_by).full_name)} · ${fmtDayShort(m.held_at)}</span></span><span class="row-end">${m.status === 'final' ? `<span class="pill success"><span class="dot success"></span>${T.minutes.final}</span>` : `<span class="pill warning"><span class="dot warning"></span>${T.minutes.draft}</span>`}${icon('chevron-right', 'sm')}</span></a></div>`
    : `<div class="card">${Empty('file-text', T.minutes.noMinutes, T.minutes.noMinutesHint, `<a class="btn btn-primary btn-sm" href="#/atas/new?card=${card.id}">${icon('plus', 'sm')}${T.actions.createMinutes}</a>`)}</div>`;
  const history = `<div class="card card-pad"><div class="activity">${acts.map((a) => ActivityItem(a)).join('') || '<span class="caption">Sem histórico.</span>'}</div></div>`;
  const tabs = `<div class="tabs" role="tablist"><button role="tab" class="${tab === 'details' ? 'is-active' : ''}" data-action="tab" data-tab="details">Detalhes</button>${meeting ? `<button role="tab" class="${tab === 'ata' ? 'is-active' : ''}" data-action="tab" data-tab="ata">${T.minutes.one}${m ? `<span class="n">${m.status === 'final' ? 'final' : 'rascunho'}</span>` : ''}</button>` : ''}<button role="tab" class="${tab === 'history' ? 'is-active' : ''}" data-action="tab" data-tab="history">Histórico<span class="n num">${acts.length}</span></button></div>`;
  const actions = `<button class="btn btn-primary" data-action="move-open" data-card="${card.id}">${icon('arrow-right', 'sm')}${T.actions.move}</button>${meeting ? `<a class="btn btn-ghost" href="${waLink(whatsappText(card))}" target="_blank" rel="noopener">${icon('message', 'sm')}${T.actions.whatsapp}</a>` : ''}<a class="btn btn-ghost btn-icon" href="#/cards/${card.id}/edit" aria-label="${T.actions.edit}">${icon('pencil', 'sm')}</a>`;
  const back = meeting ? '/agenda' : `/pipelines/${pl.slug}`;
  return { nav: meeting ? 'agenda' : 'pipeline:' + pl.slug, title: card.title, html: `
    ${Topbar({ title: kindLabel(card), back, actions: `<a class="btn btn-quiet btn-icon" href="#/cards/${card.id}/edit" aria-label="${T.actions.edit}">${icon('pencil')}</a>` })}
    <div class="page" style="max-width:860px">
      <div class="page-head" style="padding-top:8px;align-items:flex-start;flex-direction:column;gap:12px">
        <div><div class="caption"><a href="#/pipelines/${pl.slug}">${esc(pl.name)}</a> · ${esc(card.company_name || '')}</div><h1 class="h-display" style="margin-top:4px">${esc(card.title)}</h1>
        <div class="inline" style="margin-top:10px;flex-wrap:wrap">${Pill(st, card.id)}${meeting ? `<span class="caption num">${fmtDayShort(dayKey(card.starts_at))} · ${fmtTime(card.starts_at)}</span>` : card.due_at ? `<span class="caption num">${fmtDayShort(dayKey(card.due_at))}</span>` : ''}<span class="caption inline">${Avatar(owner, 'sm')}${esc(owner.full_name.split(' ')[0])}</span></div></div>
        <div class="page-actions" style="width:100%;flex-wrap:wrap">${actions}</div>
      </div>
      ${tabs}
      ${tab === 'ata' ? minutesTab : tab === 'history' ? history : details}
    </div>` };
}
function ActivityItem(a) {
  const who = profile(a.actor_id).full_name.split(' ')[0];
  const to = a.to_stage_id ? stage(a.to_stage_id) : null;
  const what = { created: `${who} criou o cartão${to ? ` em <b>${esc(to.name)}</b>` : ''}`, stage_changed: `${who} moveu para <b>${esc(to?.name || '')}</b>`, rescheduled: `${who} adiou a reunião`, updated: `${who} editou os dados`, minutes_created: `${who} criou a ata`, minutes_finalized: `${who} marcou a ata como final` }[a.type] || a.type;
  const ico = { created: 'plus', stage_changed: 'arrow-right', rescheduled: 'calendar-clock', updated: 'pencil', minutes_created: 'file-text', minutes_finalized: 'check' }[a.type] || 'history';
  return `<div class="activity-item"><span class="ico">${icon(ico)}</span><div><div class="what">${what}</div><div class="when num">${fmtDateTime(a.at)}</div>${a.note ? `<div class="note">${esc(a.note)}</div>` : ''}</div></div>`;
}

function screenPipeline(slug, params) {
  const pl = pipelineBySlug(slug) || meetingsPipeline();
  const stages = stagesOf(pl.id);
  const member = params.member || '';
  const current = params.stage && stages.find((s) => s.id === params.stage) ? params.stage : stages[0].id;
  const all = cardsOf(pl.id).filter((c) => involves(c, member));
  const openValue = pl.kind === 'sales' ? all.filter((c) => !stage(c.stage_id).is_done && !stage(c.stage_id).is_lost).reduce((s, c) => s + (c.value_cents || 0), 0) : 0;
  const col = (s) => { const items = all.filter((c) => c.stage_id === s.id).sort((a, b) => a.position - b.position); return `<section class="stage-col ${s.id === current ? '' : 'is-hidden'}" data-stage="${s.id}"><div class="stage-head"><span class="dot ${s.tone}"></span>${esc(s.name)}<span class="n num">${items.length}${pl.kind === 'sales' && items.length ? ` · ${fmtMoney(items.reduce((x, c) => x + (c.value_cents || 0), 0))}` : ''}</span></div><div class="stage-body" data-drop="${s.id}">${items.map(CardItem).join('') || `<div class="empty" style="padding:24px 12px"><p style="margin:0">${T.empty.stage}</p></div>`}</div></section>`; };
  const switcher = `<div class="pipeline-switch">${DB.pipelines.map((p) => `<a class="chip text-only ${p.id === pl.id ? 'is-active' : ''}" href="#/pipelines/${p.slug}">${esc(p.name)}</a>`).join('')}</div>`;
  const segmented = `<div class="segmented" role="tablist">${stages.map((s) => `<button role="tab" class="${s.id === current ? 'is-active' : ''}" data-action="nav" data-href="/pipelines/${pl.slug}?stage=${s.id}${member ? '&member=' + member : ''}" aria-selected="${s.id === current}"><span class="dot ${s.tone}"></span>${esc(s.name)}<span class="n">${all.filter((c) => c.stage_id === s.id).length}</span></button>`).join('')}</div>`;
  const memberSel = `<select class="select" style="width:auto;min-height:40px" aria-label="${T.actions.filter}" data-action-change="nav" data-href="/pipelines/${pl.slug}?member="><option value="">${T.all}</option>${DB.profiles.map((p) => `<option value="${p.id}" ${member === p.id ? 'selected' : ''}>${esc(p.full_name.split(' ')[0])}</option>`).join('')}</select>`;
  const sub = pl.kind === 'sales' ? `<span class="num">${fmtMoney(openValue)}</span> em aberto` : `${all.length} ${all.length === 1 ? 'cartão' : 'cartões'}`;
  return { nav: 'pipeline:' + pl.slug, title: pl.name, html: `
    ${Topbar({ title: T.nav.pipelines, actions: `<a class="btn btn-quiet btn-icon" href="#/cards/new?pipeline=${pl.slug}" aria-label="${T.actions.newCard[pl.kind]}">${icon('plus')}</a>` })}
    <div class="page" style="max-width:none">
      <div class="page-head only-desktop"><div><div class="caption">${T.nav.pipelines} · ${sub}</div><h1 class="h-display">${esc(pl.name)}</h1></div><div class="page-actions">${memberSel}<a class="btn btn-ghost btn-icon" href="#/settings/pipelines/${pl.slug}" aria-label="${T.nav.settings}">${icon('settings')}</a><a class="btn btn-primary" href="#/cards/new?pipeline=${pl.slug}">${icon('plus')}${T.actions.newCard[pl.kind]}</a></div></div>
      ${switcher}
      <div class="only-phone caption" style="margin:0 0 10px">${sub}</div>
      ${segmented}
      <div class="kanban" style="margin-top:10px">${stages.map(col).join('')}</div>
    </div>` };
}

function screenMinutesList(params) {
  const filter = params.status || 'all';
  const items = DB.minutes.filter((m) => filter === 'all' || m.status === filter).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  const missing = missingMinutes().filter((c) => !minutesOfCard(c.id));
  const row = (m) => { const c = find('cards', m.card_id); return `<a class="row" href="#/atas/${m.id}"><span class="tile">${icon('file-text')}</span><span class="row-main"><span class="row-title">${esc(m.title)}</span><span class="row-sub">${esc(c.company_name)} · ${fmtDayShort(m.held_at)} · ${esc(profile(m.written_by).full_name.split(' ')[0])}</span></span><span class="row-end">${m.status === 'final' ? `<span class="pill success"><span class="dot success"></span>${T.minutes.final}</span>` : `<span class="pill warning"><span class="dot warning"></span>${T.minutes.draft}</span>`}${icon('chevron-right', 'sm')}</span></a>`; };
  const table = `<table class="table"><thead><tr><th>Reunião</th><th>Empresa</th><th>Data</th><th>Estado</th><th>${T.minutes.writtenBy}</th></tr></thead><tbody>${items.map((m) => { const c = find('cards', m.card_id); return `<tr data-action="nav" data-href="/atas/${m.id}"><td class="strong">${esc(m.title)}</td><td>${esc(c.company_name)}</td><td class="num">${fmtDayShort(m.held_at)}</td><td>${m.status === 'final' ? `<span class="pill success"><span class="dot success"></span>${T.minutes.final}</span>` : `<span class="pill warning"><span class="dot warning"></span>${T.minutes.draft}</span>`}</td><td>${esc(profile(m.written_by).full_name)}</td></tr>`; }).join('')}</tbody></table>`;
  const seg = `<div class="segmented" style="display:inline-flex;margin-bottom:12px">${[['all', 'Todas'], ['draft', 'Rascunhos'], ['final', 'Finais']].map(([k, l]) => `<button class="${filter === k ? 'is-active' : ''}" data-action="nav" data-href="/atas${k === 'all' ? '' : '?status=' + k}">${l}<span class="n num">${k === 'all' ? DB.minutes.length : DB.minutes.filter((m) => m.status === k).length}</span></button>`).join('')}</div>`;
  return { nav: 'minutes', title: T.minutes.title, html: `
    ${Topbar({ title: T.minutes.title, actions: `<a class="btn btn-quiet btn-icon" href="#/atas/new" aria-label="${T.actions.createMinutes}">${icon('plus')}</a>` })}
    <div class="page">
      ${PageHead(T.minutes.title, `<a class="btn btn-primary" href="#/atas/new">${icon('plus')}${T.actions.createMinutes}</a>`).replace('class="page-head"', 'class="page-head only-desktop"')}
      ${missing.length ? `<div class="alert" style="margin-bottom:14px">${icon('alert')}<div><b>${missing.length} ${missing.length === 1 ? 'reunião concluída sem ata' : 'reuniões concluídas sem ata'}</b><div class="inline" style="margin-top:6px;flex-wrap:wrap">${missing.map((c) => `<a class="btn btn-ghost btn-sm" href="#/atas/new?card=${c.id}">${icon('plus', 'xs')}${esc(c.title)}</a>`).join('')}</div></div></div>` : ''}
      ${seg.replace('class="segmented"', 'class="segmented always"')}
      ${items.length ? `<div class="card list only-phone">${items.map(row).join('')}</div><div class="card only-desktop">${table}</div>` : `<div class="card">${Empty('file-text', T.minutes.none, T.minutes.noneHint)}</div>`}
    </div>` };
}

/* ---------- minutes form ---------- */
function blankMinutes(card) {
  const owner = profile(card.owner_id);
  return { id: null, card_id: card.id, title: card.title, held_at: localDate(card.starts_at), started_at: localTime(card.starts_at), ended_at: localTime(card.ends_at), location: card.location_kind === 'online' ? 'Online' : card.location,
    attendees: [{ name: card.contact_name, org: card.company_name, role: card.contact_role, present: true }, { name: owner.full_name, org: 'Kingdom', role: owner.job_title, present: true }, ...participantsOf(card.id).map((p) => ({ name: p.full_name, org: 'Kingdom', role: p.job_title, present: true }))],
    agenda: [{ topic: '', summary: '' }], decisions: [{ text: '' }], actions: [{ what: '', who: owner.full_name, due: '', status: 'pending' }], next_steps: '', next_meeting_date: '', next_meeting_time: '', written_by: ME, approved_by: '', status: 'draft' };
}
function screenMinutesForm(id, params) {
  const existing = id ? find('minutes', id) : null;
  const cardId = existing ? existing.card_id : params.card;
  const card = cardId ? find('cards', cardId) : null;
  if (!card) {
    const done = meetings().filter((c) => stage(c.stage_id).is_done && !minutesOfCard(c.id)).sort((a, b) => new Date(b.starts_at) - new Date(a.starts_at));
    const others = meetings().filter((c) => !stage(c.stage_id).is_done && !isCancelled(c) && !minutesOfCard(c.id)).sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)).slice(0, 6);
    const li = (c) => `<a class="row" href="#/atas/new?card=${c.id}">${Avatar(profile(c.owner_id), 'tile')}<span class="row-main"><span class="row-title">${esc(c.title)}</span><span class="row-sub">${fmtDayShort(dayKey(c.starts_at))} · ${esc(c.company_name)} · ${esc(stage(c.stage_id).name)}</span></span><span class="row-end">${icon('chevron-right', 'sm')}</span></a>`;
    return { nav: 'minutes', title: T.actions.createMinutes, html: `${Topbar({ title: T.actions.createMinutes, back: '/atas' })}<div class="page" style="max-width:720px">
      ${PageHead(T.minutes.chooseMeeting).replace('class="page-head"', 'class="page-head only-desktop"')}
      <p class="caption" style="margin:4px 0 14px">${T.minutes.chooseHint}</p>
      ${done.length ? `<section class="section" style="margin-top:0"><div class="section-head"><h2 class="h-section">Concluídas sem ata</h2></div><div class="card list">${done.map(li).join('')}</div></section>` : ''}
      <section class="section"><div class="section-head"><h2 class="h-section">Outras reuniões</h2></div><div class="card list">${others.map(li).join('') || `<div class="empty"><p>Sem reuniões.</p></div>`}</div></section></div>` };
  }
  if (!state.draft) state.draft = existing ? { ...blankMinutes(card), ...JSON.parse(JSON.stringify(existing)), next_meeting_date: existing.next_meeting_at ? localDate(existing.next_meeting_at) : '', next_meeting_time: existing.next_meeting_at ? localTime(existing.next_meeting_at) : '', approved_by: existing.approved_by || '' } : blankMinutes(card);
  const d = state.draft, e = state.errors;
  const title = existing ? `${T.actions.edit} ata` : T.actions.createMinutes;
  const inp = (path, value, type = 'text', extra = '') => `<input class="input" type="${type}" data-bind="${path}" value="${esc(value ?? '')}" ${extra}>`;
  const remove = (list, i) => `<button type="button" class="btn btn-quiet btn-icon btn-sm" data-action="row-remove" data-list="${list}" data-index="${i}" aria-label="${T.actions.remove}">${icon('x', 'sm')}</button>`;
  const add = (list, label) => `<button type="button" class="btn btn-ghost btn-sm repeat-add" data-action="row-add" data-list="${list}">${icon('plus', 'sm')}${label}</button>`;
  const sec = (key, body, hint = '') => `<section class="card fieldset"><h2 class="h-section">${T.minutes.sections[key]}</h2>${hint ? `<p class="caption" style="margin:-6px 0 0">${hint}</p>` : ''}${body}</section>`;
  const html = `
    ${Topbar({ title, back: existing ? `/atas/${existing.id}` : `/cards/${card.id}?tab=ata` })}
    <div class="page" style="max-width:760px">
      ${PageHead(title, '', `${T.minutes.one} · ${esc(card.company_name)}`).replace('class="page-head"', 'class="page-head only-desktop"')}
      <form class="form" data-form="minutes" novalidate>
        ${sec('meeting', `
          <div class="alert info">${icon('calendar')}<div><b>${esc(card.title)}</b><div class="caption">${esc(card.company_name)} · ${fmtDayShort(dayKey(card.starts_at))} ${fmtTime(card.starts_at)} · ${esc(stage(card.stage_id).name)}</div></div></div>
          <div class="field ${e.title ? 'has-error' : ''}"><label>Título da ata</label>${inp('title', d.title)}${e.title ? `<span class="error">${e.title}</span>` : ''}</div>
          <div class="field-row-3"><div class="field"><label>Data</label>${inp('held_at', d.held_at, 'date')}</div><div class="field"><label>Início</label>${inp('started_at', d.started_at, 'time')}</div><div class="field"><label>Fim</label>${inp('ended_at', d.ended_at, 'time')}</div></div>
          <div class="field"><label>Local</label>${inp('location', d.location)}</div>`)}
        ${sec('attendees', `<div class="repeat-list">${d.attendees.map((a, i) => `<div class="repeat-row"><div class="fields cols-3">${inp(`attendees.${i}.name`, a.name, 'text', 'placeholder="Nome"')}${inp(`attendees.${i}.org`, a.org, 'text', 'placeholder="Organização"')}${inp(`attendees.${i}.role`, a.role, 'text', 'placeholder="Função"')}<label class="toggle"><input type="checkbox" data-bind="attendees.${i}.present" ${a.present ? 'checked' : ''}> Presente</label></div>${remove('attendees', i)}</div>`).join('')}</div>${add('attendees', 'Participante')}`)}
        ${sec('agenda', `<div class="repeat-list">${d.agenda.map((a, i) => `<div class="repeat-row"><div class="fields">${inp(`agenda.${i}.topic`, a.topic, 'text', `placeholder="Tópico ${i + 1}"`)}<textarea class="textarea" data-bind="agenda.${i}.summary" placeholder="O que foi discutido" style="min-height:64px">${esc(a.summary)}</textarea></div>${remove('agenda', i)}</div>`).join('')}</div>${add('agenda', 'Tópico')}`, 'Um ponto por tópico, com o resumo da discussão.')}
        ${sec('decisions', `<div class="repeat-list">${d.decisions.map((x, i) => `<div class="repeat-row"><div class="fields">${inp(`decisions.${i}.text`, x.text, 'text', 'placeholder="O que ficou decidido"')}</div>${remove('decisions', i)}</div>`).join('')}</div>${add('decisions', 'Decisão')}`)}
        ${sec('actions', `<div class="repeat-list">${d.actions.map((a, i) => `<div class="repeat-row"><div class="fields cols-4">${inp(`actions.${i}.what`, a.what, 'text', 'placeholder="O quê"')}${inp(`actions.${i}.who`, a.who, 'text', 'placeholder="Quem"')}${inp(`actions.${i}.due`, a.due, 'date')}<select class="select" data-bind="actions.${i}.status"><option value="pending" ${a.status !== 'done' ? 'selected' : ''}>Pendente</option><option value="done" ${a.status === 'done' ? 'selected' : ''}>Feita</option></select></div>${remove('actions', i)}</div>`).join('')}</div>${add('actions', 'Ação')}`)}
        ${sec('next', `<div class="field"><label>O que fica combinado a seguir</label><textarea class="textarea" data-bind="next_steps" placeholder="Ex.: preparar o ambiente e validar o design na primeira revisão">${esc(d.next_steps)}</textarea></div><div class="field-row"><div class="field"><label>Próxima reunião (data)</label>${inp('next_meeting_date', d.next_meeting_date, 'date')}</div><div class="field"><label>Hora</label>${inp('next_meeting_time', d.next_meeting_time, 'time')}</div></div>`)}
        ${sec('close', `<div class="field-row"><div class="field"><label>${T.minutes.writtenBy}</label><input class="input" value="${esc(profile(d.written_by).full_name)}" disabled></div><div class="field"><label>${T.minutes.approvedBy}</label><select class="select" data-bind="approved_by"><option value="">—</option>${DB.profiles.map((p) => `<option value="${p.id}" ${d.approved_by === p.id ? 'selected' : ''}>${esc(p.full_name)}</option>`).join('')}</select></div></div>`)}
        <div class="form-foot"><button class="btn btn-ghost" type="submit" data-status="draft">${T.actions.saveDraft}</button><button class="btn btn-primary" type="submit" data-status="final">${T.actions.finalize}</button></div>
      </form>
    </div>`;
  return { nav: 'minutes', title, html };
}

function MinutesDoc(m) {
  const card = find('cards', m.card_id);
  const writer = profile(m.written_by), approver = m.approved_by ? profile(m.approved_by) : null;
  return `<article class="minutes-doc">
    <header>
      <div class="inline" style="justify-content:space-between"><span class="caption">Ata de reunião · ${esc(card.company_name)}</span>${m.status === 'final' ? `<span class="pill success"><span class="dot success"></span>${T.minutes.final}</span>` : `<span class="pill warning"><span class="dot warning"></span>${T.minutes.draft}</span>`}</div>
      <h1>${esc(m.title)}</h1>
      <dl class="kv"><dt>Data</dt><dd class="num">${fmtDayLong(m.held_at)}, ${esc(m.started_at)}–${esc(m.ended_at)}</dd><dt>Local</dt><dd>${esc(m.location)}</dd><dt>Reunião</dt><dd><a href="#/cards/${card.id}" style="text-decoration:underline">${esc(card.title)}</a></dd></dl>
    </header>
    <h2>${T.minutes.sections.attendees}</h2>
    <ul>${m.attendees.map((a) => `<li>${esc(a.name)}${a.org ? ` (${esc(a.org)}${a.role ? ', ' + esc(a.role) : ''})` : ''}${a.present ? '' : ' <span class="muted">— ausente</span>'}</li>`).join('')}</ul>
    <h2>${T.minutes.sections.agenda}</h2>
    <ol>${m.agenda.filter((a) => a.topic).map((a) => `<li><div class="item-title">${esc(a.topic)}</div>${a.summary ? `<div class="item-body">${esc(a.summary)}</div>` : ''}</li>`).join('') || '<li class="muted">—</li>'}</ol>
    <h2>${T.minutes.sections.decisions}</h2>
    <ol>${m.decisions.filter((x) => x.text).map((x) => `<li>${esc(x.text)}</li>`).join('') || '<li class="muted">Sem decisões registadas.</li>'}</ol>
    <h2>${T.minutes.sections.actions}</h2>
    ${m.actions.filter((a) => a.what).length ? `<table><thead><tr><th>Ação</th><th>Responsável</th><th>Prazo</th><th>Estado</th></tr></thead><tbody>${m.actions.filter((a) => a.what).map((a) => `<tr><td>${esc(a.what)}</td><td>${esc(a.who)}</td><td class="num">${a.due ? fmtDayShort(a.due) : '—'}</td><td>${a.status === 'done' ? `<span class="inline"><span class="dot success"></span>Feita</span>` : `<span class="inline"><span class="dot"></span>Pendente</span>`}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">Sem ações.</p>'}
    ${m.next_steps || m.next_meeting_at ? `<h2>${T.minutes.sections.next}</h2>${m.next_steps ? `<p>${esc(m.next_steps)}</p>` : ''}${m.next_meeting_at ? `<p class="num">Próxima reunião: ${fmtDateTime(m.next_meeting_at)}</p>` : ''}` : ''}
    <div class="sign"><div><div class="line">${T.minutes.writtenBy}</div>${esc(writer.full_name)}, ${esc(writer.job_title)}</div><div><div class="line">${T.minutes.approvedBy}</div>${approver ? `${esc(approver.full_name)}, ${esc(approver.job_title)}` : '<span class="muted">—</span>'}</div></div>
    <p class="watermark">Kingdom Ops · ${m.status === 'final' ? `final em ${fmtDateTime(m.finalized_at)}` : `rascunho atualizado em ${fmtDateTime(m.updated_at)}`} · ${T.sample}</p>
  </article>`;
}
function screenMinutes(id) {
  const m = find('minutes', id);
  if (!m) return { nav: 'minutes', title: '', html: `<div class="page">${Empty('alert', 'Ata não encontrada', '')}</div>` };
  const card = find('cards', m.card_id);
  const canConclude = m.status === 'final' && !stage(card.stage_id).is_done;
  return { nav: 'minutes', title: m.title, html: `
    ${Topbar({ title: T.minutes.one, back: '/atas', actions: `<a class="btn btn-quiet btn-icon" href="#/atas/${m.id}/edit" aria-label="${T.actions.edit}">${icon('pencil')}</a>` })}
    <div class="page" style="max-width:820px">
      <div class="page-actions" style="justify-content:flex-end;padding:8px 0 12px;flex-wrap:wrap">
        ${canConclude ? `<button class="btn btn-ghost" data-action="conclude" data-card="${card.id}">${icon('check', 'sm')}${T.actions.conclude}</button>` : ''}
        <a class="btn btn-ghost" href="${waLink(whatsappMinutesText(m))}" target="_blank" rel="noopener">${icon('message', 'sm')}${T.actions.whatsapp}</a>
        ${EMBED ? '' : `<a class="btn btn-ghost" href="#/atas/${m.id}/print">${icon('printer', 'sm')}${T.actions.print}</a>`}
        ${m.status === 'draft' ? `<a class="btn btn-primary" href="#/atas/${m.id}/edit">${icon('pencil', 'sm')}Continuar a escrever</a>` : `<a class="btn btn-quiet only-desktop" href="#/atas/${m.id}/edit">${T.actions.edit}</a>`}
      </div>
      ${MinutesDoc(m)}
    </div>` };
}
function screenMinutesPrint(id) {
  const m = find('minutes', id);
  if (!m) return screenMinutes(id);
  return { bare: true, title: m.title, html: `<div class="print-page" style="max-width:820px;margin:0 auto;padding:16px"><div class="inline no-print" style="justify-content:space-between;margin-bottom:12px"><a class="btn btn-quiet" href="#/atas/${m.id}">${icon('arrow-left', 'sm')}${T.actions.back}</a>${EMBED ? `<span class="caption">Imprima com o menu do browser.</span>` : `<button class="btn btn-primary" data-action="print">${icon('printer', 'sm')}${T.actions.print}</button>`}</div>${MinutesDoc(m)}</div>` };
}

function screenTeam() {
  const week = meetings().filter((c) => { const k = dayKey(c.starts_at); return k >= mondayOf(TODAY) && k <= addDays(mondayOf(TODAY), 6) && !isCancelled(c); });
  const member = (p) => { const n = week.filter((c) => involves(c, p.id)).length; const open = DB.cards.filter((c) => c.owner_id === p.id && !isMeeting(c) && !stage(c.stage_id).is_done && !stage(c.stage_id).is_lost).length; return `<a class="card member" href="#/agenda?member=${p.id}">${Avatar(p, 'lg')}<div class="row-main"><div class="inline"><span class="row-title">${esc(p.full_name)}</span>${p.role === 'admin' ? '<span class="pill"><span class="dot"></span>Admin</span>' : ''}</div><div class="role">${esc(p.job_title)} · <span class="num">${esc(p.phone_whatsapp)}</span></div><div class="load num">${n} ${n === 1 ? 'reunião' : 'reuniões'} esta semana · ${open} cartões abertos</div></div>${icon('chevron-right', 'sm')}</a>`; };
  return { nav: 'team', title: T.nav.team, html: `
    ${Topbar({ title: T.nav.team })}
    <div class="page" style="max-width:860px">
      ${PageHead(T.nav.team, `<button class="btn btn-primary" data-action="toast" data-msg="${T.toast.phase2}: convites por email">${icon('plus')}${T.actions.invite}</button>`).replace('class="page-head"', 'class="page-head only-desktop"')}
      <div class="team-grid">${DB.profiles.map(member).join('')}</div>
      <section class="section"><div class="section-head"><h2 class="h-section">Conta</h2></div><div class="card list"><button class="row" data-action="toast" data-msg="${T.toast.phase2}: editar perfil"><span class="row-main"><span class="row-title">Editar o meu perfil</span><span class="row-sub">Nome, função, WhatsApp, palavra-passe</span></span><span class="row-end">${icon('chevron-right', 'sm')}</span></button><a class="row only-phone" href="#/settings/pipelines/reunioes"><span class="row-main"><span class="row-title">${T.nav.settings}</span><span class="row-sub">Etapas dos pipelines, modelos</span></span><span class="row-end">${icon('chevron-right', 'sm')}</span></a><a class="row" href="#/login"><span class="row-main"><span class="row-title">${T.nav.logout}</span></span><span class="row-end">${icon('log-out', 'sm')}</span></a></div></section>
      <p class="caption" style="margin-top:16px">${T.sample}: os nomes e contactos são fictícios.</p>
    </div>` };
}

function screenPipelineSettings(slug) {
  const pl = pipelineBySlug(slug) || meetingsPipeline();
  if (!state.draft) state.draft = { stages: stagesOf(pl.id).map((s) => ({ ...s })) };
  const d = state.draft;
  const tones = [['neutral', 'Cinza'], ['info', 'Azul'], ['warning', 'Âmbar'], ['danger', 'Vermelho'], ['success', 'Verde']];
  const row = (s, i) => `<div class="repeat-row" style="grid-template-columns:auto 1fr auto;align-items:center"><span class="muted">${icon('grip', 'sm')}</span><div class="fields cols-2"><div class="inline"><span class="dot ${s.tone}"></span><input class="input" data-bind="stages.${i}.name" value="${esc(s.name)}" aria-label="Nome da etapa"></div><select class="select" data-bind="stages.${i}.tone" aria-label="Cor">${tones.map(([v, l]) => `<option value="${v}" ${s.tone === v ? 'selected' : ''}>${l}</option>`).join('')}</select><div class="inline" style="flex-wrap:wrap;grid-column:1/-1;gap:14px"><label class="check"><input type="checkbox" data-bind="stages.${i}.is_done" ${s.is_done ? 'checked' : ''}>Conta como concluído</label><label class="check"><input type="checkbox" data-bind="stages.${i}.is_lost" ${s.is_lost ? 'checked' : ''}>Conta como perdido</label><label class="check"><input type="checkbox" data-bind="stages.${i}.requires_note" ${s.requires_note ? 'checked' : ''}>Pede motivo</label><label class="check"><input type="checkbox" data-bind="stages.${i}.requires_reschedule" ${s.requires_reschedule ? 'checked' : ''}>Pede nova data</label></div></div><button type="button" class="btn btn-quiet btn-icon btn-sm" data-action="row-remove" data-list="stages" data-index="${i}" aria-label="${T.actions.remove}">${icon('x', 'sm')}</button></div>`;
  return { nav: 'settings', title: T.nav.settings, html: `
    ${Topbar({ title: T.nav.settings, back: '/team' })}
    <div class="page" style="max-width:760px">
      ${PageHead(`Etapas · ${pl.name}`, '', T.nav.settings).replace('class="page-head"', 'class="page-head only-desktop"')}
      <div class="pipeline-switch">${DB.pipelines.map((p) => `<a class="chip text-only ${p.id === pl.id ? 'is-active' : ''}" href="#/settings/pipelines/${p.slug}">${esc(p.name)}</a>`).join('')}</div>
      <form class="form" data-form="stages" data-pipeline="${pl.id}" novalidate>
        <div class="card fieldset"><h2 class="h-section">Etapas de ${esc(pl.name)}</h2><p class="caption" style="margin:-6px 0 0">A ordem é a ordem das colunas. As regras decidem o que o app pede ao mover um cartão.</p><div class="repeat-list">${d.stages.map(row).join('')}</div><button type="button" class="btn btn-ghost btn-sm repeat-add" data-action="row-add" data-list="stages">${icon('plus', 'sm')}${T.actions.addStage}</button></div>
        <div class="form-foot"><button class="btn btn-primary" type="submit">${T.actions.save}</button></div>
      </form>
      <section class="section"><div class="section-head"><h2 class="h-section">${T.actions.newPipeline}</h2></div><div class="card card-pad"><p class="caption" style="margin:0 0 10px">Um modelo traz as etapas e os campos certos. Depois pode mudar tudo.</p><div class="inline" style="flex-wrap:wrap">${DB.pipeline_templates.map((t) => `<button class="chip text-only" data-action="pipeline-from-template" data-kind="${t.kind}" data-name="${esc(t.name)}">${icon('plus', 'xs')}${esc(t.name)}<span class="caption">· ${t.stages.length} etapas</span></button>`).join('')}</div></div></section>
    </div>` };
}

/* ======================================================================
   Overlay (sheets)
   ====================================================================== */
function Overlay() {
  const s = state.sheet;
  if (!s) return '<div id="overlay"></div>';
  if (s.type === 'move') {
    const card = find('cards', s.cardId);
    const stages = stagesOf(card.pipeline_id);
    const target = s.stageId ? stage(s.stageId) : null;
    const needsDate = target && target.requires_reschedule;
    const needsNote = target && target.requires_note;
    return `<div id="overlay"><div class="overlay" data-action="sheet-close"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" data-stop>
      <div class="sheet-handle"></div>
      <div class="sheet-head"><div><h2 class="h-title" id="sheet-title">${T.actions.move}</h2><div class="caption">${esc(card.title)}</div></div><button class="btn btn-quiet btn-icon btn-sm" data-action="sheet-close" aria-label="Fechar">${icon('x')}</button></div>
      <div class="stepper">${stages.map((st) => `<button type="button" class="${st.id === card.stage_id ? 'is-current' : ''} ${st.id === s.stageId ? 'is-selected' : ''}" data-action="move-select" data-stage="${st.id}"><span class="mark">${icon('check')}</span><span class="dot ${st.tone}"></span><span>${esc(st.name)}</span>${st.id === card.stage_id ? '<span class="rule">atual</span>' : st.requires_reschedule ? `<span class="rule">${T.stageRules.reschedule}</span>` : st.requires_note ? `<span class="rule">${T.stageRules.note}</span>` : ''}</button>${st.id === s.stageId && (needsDate || needsNote) ? `<div class="inline-fields">${needsDate ? `<div class="field-row"><div class="field ${s.errors?.date ? 'has-error' : ''}"><label>Nova data</label><input class="input" type="date" data-sheet-bind="date" value="${esc(s.date || '')}"></div><div class="field"><label>Hora</label><input class="input" type="time" data-sheet-bind="time" value="${esc(s.time || localTime(card.starts_at))}"></div></div>` : ''}${needsNote ? `<div class="field ${s.errors?.note ? 'has-error' : ''}"><label>Motivo</label><textarea class="textarea" data-sheet-bind="note" placeholder="${target.is_lost ? 'Porque foi cancelada' : 'O que está a bloquear'}" style="min-height:64px">${esc(s.note || '')}</textarea>${s.errors?.note ? `<span class="error">${T.form.required}</span>` : ''}</div>` : ''}</div>` : ''}`).join('')}</div>
      <div class="form-foot" style="margin-top:8px"><button class="btn btn-ghost" data-action="sheet-close">${T.actions.cancel}</button><button class="btn btn-primary" data-action="move-confirm" ${s.stageId && s.stageId !== card.stage_id ? '' : 'disabled'}>${T.actions.confirm}</button></div>
    </div></div></div>`;
  }
  return '<div id="overlay"></div>';
}
function renderOverlay() { const el = document.getElementById('overlay'); if (!el) return; const tmp = document.createElement('div'); tmp.innerHTML = Overlay(); el.replaceWith(tmp.firstElementChild); }

/* ======================================================================
   Mutations
   ====================================================================== */
function toast(msg, action) {
  const box = document.getElementById('toasts'); if (!box) return;
  const el = document.createElement('div'); el.className = 'toast'; el.style.pointerEvents = 'auto';
  el.innerHTML = `<span>${msg}</span>${action ? `<button class="btn btn-on-dark btn-sm" data-action="${action.action}" ${Object.entries(action.data || {}).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ')}>${action.label}</button>` : ''}`;
  box.appendChild(el); setTimeout(() => el.remove(), action ? 6000 : 2600);
}
function logActivity(cardId, type, extra = {}) { DB.card_activity.push({ id: uid('a'), card_id: cardId, actor_id: ME, from_stage_id: null, to_stage_id: null, note: null, at: NOW.toISOString(), ...extra }); }
function moveCard(cardId, stageId, { note, date, time } = {}) {
  const card = find('cards', cardId); const from = card.stage_id; const to = stage(stageId);
  if (to.requires_reschedule && date) { const dur = minutesDiff(card.ends_at, card.starts_at); card.starts_at = toIso(date, time); card.ends_at = new Date(new Date(card.starts_at).getTime() + dur * 60000).toISOString(); }
  card.stage_id = stageId; card.stage_changed_at = NOW.toISOString();
  card.position = cardsOf(card.pipeline_id).filter((c) => c.stage_id === stageId).length;
  logActivity(cardId, to.requires_reschedule ? 'rescheduled' : 'stage_changed', { from_stage_id: from, to_stage_id: stageId, note: to.requires_reschedule && date ? `${note ? note + ' ' : ''}Nova data: ${fmtDayShort(date)} às ${time || localTime(card.starts_at)}.` : note || null });
  state.changedPill = cardId;
  toast(`${T.toast.moved} <b>${esc(to.name)}</b>`);
  if (to.is_done && isMeeting(card) && !minutesOfCard(card.id)) setTimeout(() => toast('Escrever a ata agora?', { label: T.actions.createMinutes, action: 'nav', data: { href: `/atas/new?card=${card.id}` } }), 400);
}
function setPath(obj, path, value) { const keys = path.split('.'); let o = obj; for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]]; o[keys[keys.length - 1]] = value; }
function saveCard() {
  const d = state.draft; const pl = pipeline(d.pipeline_id); const e = {};
  if (!d.title.trim()) e.title = T.form.required;
  if (pl.kind === 'meetings') { if (!d.date) e.date = T.form.required; if (!d.time) e.time = T.form.required; if (!d.contact_name.trim()) e.contact_name = T.form.required; if (!d.company_name.trim()) e.company_name = T.form.required; if (d.location_kind !== 'phone' && !d.location.trim()) e.location = T.form.required; }
  if (pl.kind === 'sales' && !d.company_name.trim()) e.company_name = T.form.required;
  state.errors = e;
  if (Object.keys(e).length) { render(); const first = document.querySelector('.has-error .input, .has-error .select, .has-error .textarea'); if (first) first.focus(); return; }
  const starts = pl.kind === 'meetings' ? toIso(d.date, d.time) : null;
  const rec = { pipeline_id: d.pipeline_id, stage_id: d.id ? d.stage_id : stagesOf(pl.id)[0].id, title: d.title.trim(), owner_id: d.owner_id, starts_at: starts, ends_at: starts ? new Date(new Date(starts).getTime() + Number(d.duration) * 60000).toISOString() : null, location_kind: pl.kind === 'meetings' ? d.location_kind : null, location: pl.kind === 'meetings' ? (d.location_kind === 'phone' ? T.location.phone : d.location.trim()) : null, contact_name: d.contact_name || null, contact_role: d.contact_role || null, contact_phone: d.contact_phone || null, contact_email: d.contact_email || null, company_name: d.company_name || null, company_sector: d.company_sector || null, value_cents: d.value ? Math.round(Number(d.value) * 100) : null, due_at: d.due ? toIso(d.due, d.due_time || '00:00') : null, description: d.description || '', fields: pl.kind === 'campaigns' ? { channel: d.channel } : {}, updated_at: NOW.toISOString() };
  let card;
  if (d.id) { card = find('cards', d.id); Object.assign(card, rec); logActivity(card.id, 'updated'); toast(T.form.saved); }
  else { card = { id: uid('c'), position: cardsOf(pl.id).filter((c) => c.stage_id === rec.stage_id).length + 1, stage_changed_at: NOW.toISOString(), created_at: NOW.toISOString(), created_by: ME, ...rec }; DB.cards.push(card); logActivity(card.id, 'created', { to_stage_id: card.stage_id }); toast(`${kindLabel(card)} criad${pl.kind === 'projects' ? 'o' : 'a'}`); }
  DB.card_participants = DB.card_participants.filter((p) => p.card_id !== card.id).concat((d.participants || []).map((pid) => ({ card_id: card.id, profile_id: pid })));
  state.draft = null; go(`/cards/${card.id}`);
}
function saveMinutes(status) {
  const d = state.draft; const e = {};
  if (!d.title.trim()) e.title = T.form.required;
  state.errors = e; if (Object.keys(e).length) { render(); return; }
  const rec = { title: d.title.trim(), held_at: d.held_at, started_at: d.started_at, ended_at: d.ended_at, location: d.location, attendees: d.attendees.filter((a) => a.name), agenda: d.agenda.filter((a) => a.topic || a.summary), decisions: d.decisions.filter((x) => x.text), actions: d.actions.filter((a) => a.what), next_steps: d.next_steps, next_meeting_at: d.next_meeting_date ? toIso(d.next_meeting_date, d.next_meeting_time || '09:00') : null, approved_by: d.approved_by || null, status, finalized_at: status === 'final' ? NOW.toISOString() : null, updated_at: NOW.toISOString() };
  let m;
  if (d.id) { m = find('minutes', d.id); const wasFinal = m.status === 'final'; Object.assign(m, rec); if (status === 'final' && !wasFinal) logActivity(m.card_id, 'minutes_finalized'); }
  else { m = { id: uid('m'), card_id: d.card_id, written_by: ME, created_at: NOW.toISOString(), ...rec }; DB.minutes.push(m); logActivity(m.card_id, 'minutes_created'); if (status === 'final') logActivity(m.card_id, 'minutes_finalized'); }
  state.draft = null;
  const card = find('cards', m.card_id);
  toast(status === 'final' ? T.toast.minutesFinal : T.toast.minutesSaved);
  if (status === 'final' && !stage(card.stage_id).is_done) setTimeout(() => toast(T.toast.concludeAsk, { label: T.actions.conclude, action: 'conclude', data: { card: card.id } }), 500);
  go(`/atas/${m.id}`);
}
function saveStages(pipelineId) {
  const d = state.draft; const keep = new Set();
  d.stages.forEach((s, i) => { let st = s.id && stage(s.id); if (!st) { st = { id: uid('s'), pipeline_id: pipelineId }; DB.pipeline_stages.push(st); } Object.assign(st, { name: s.name || `Etapa ${i + 1}`, tone: s.tone, position: i + 1, is_done: !!s.is_done, is_lost: !!s.is_lost, requires_note: !!s.requires_note, requires_reschedule: !!s.requires_reschedule }); keep.add(st.id); });
  const first = d.stages[0];
  DB.pipeline_stages = DB.pipeline_stages.filter((s) => s.pipeline_id !== pipelineId || keep.has(s.id));
  DB.cards.forEach((c) => { if (c.pipeline_id === pipelineId && !keep.has(c.stage_id)) c.stage_id = stagesOf(pipelineId)[0].id; });
  state.draft = null; toast(T.toast.stagesSaved); render(); void first;
}
function createPipelineFromTemplate(kind, name) {
  const tpl = DB.pipeline_templates.find((t) => t.kind === kind && t.name === name);
  const base = tpl.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');
  let slug = base, n = 2; while (pipelineBySlug(slug)) slug = `${base}-${n++}`;
  const pl = { id: uid('pl'), slug, name: n > 2 ? `${tpl.name} ${n - 1}` : tpl.name, kind: tpl.kind, icon: 'kanban', position: DB.pipelines.length + 1 };
  DB.pipelines.push(pl);
  const last = tpl.stages.length - 1;
  tpl.stages.forEach((s, i) => DB.pipeline_stages.push({ id: uid('s'), pipeline_id: pl.id, name: s, position: i + 1, tone: i === last ? (/perdid|recusad|cancel/i.test(s) ? 'danger' : 'success') : i === 0 ? 'neutral' : 'info', is_done: i === last && !/perdid|recusad|cancel/i.test(s), is_lost: /perdid|recusad|cancel/i.test(s), requires_note: /perdid|recusad|cancel|bloquead/i.test(s), requires_reschedule: /adiad/i.test(s) }));
  toast(T.toast.pipelineCreated); go(`/pipelines/${pl.slug}`);
}

/* ======================================================================
   Events
   ====================================================================== */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (link && EMBED && !link.dataset.action) { e.preventDefault(); go(link.getAttribute('href').slice(1)); return; }
  const stop = e.target.closest('[data-stop]'); const overlay = e.target.closest('.overlay');
  const el = e.target.closest('[data-action]');
  if (!el) { return; }
  if (el.classList.contains('overlay') && stop && overlay && stop !== e.target && !e.target.closest('[data-action="sheet-close"]') ) { /* click inside sheet */ if (el === overlay) return; }
  const a = el.dataset.action; const d = el.dataset;
  if (a === 'nav') { e.preventDefault(); go(d.href); }
  else if (a === 'tab') { state.tab = d.tab; render(); }
  else if (a === 'toast') { toast(d.msg); }
  else if (a === 'agenda-day') { const member = document.querySelector('[data-member]')?.dataset.member || ''; go(`/agenda?date=${d.day}${member ? '&member=' + member : ''}`); }
  else if (a === 'set') { state.draft[d.key] = d.value; render(); }
  else if (a === 'toggle-participant') { const p = state.draft.participants; const i = p.indexOf(d.id); i >= 0 ? p.splice(i, 1) : p.push(d.id); render(); }
  else if (a === 'row-add') { const list = state.draft[d.list]; const blank = { attendees: { name: '', org: '', role: '', present: true }, agenda: { topic: '', summary: '' }, decisions: { text: '' }, actions: { what: '', who: '', due: '', status: 'pending' }, stages: { id: null, name: '', tone: 'neutral', is_done: false, is_lost: false, requires_note: false, requires_reschedule: false } }[d.list]; list.push({ ...blank }); render(); const inputs = document.querySelectorAll(`[data-bind^="${d.list}.${list.length - 1}."]`); if (inputs[0]) inputs[0].focus(); }
  else if (a === 'row-remove') { state.draft[d.list].splice(Number(d.index), 1); render(); }
  else if (a === 'move-open') { state.sheet = { type: 'move', cardId: d.card, stageId: null }; renderOverlay(); }
  else if (a === 'sheet-close') { if (e.target.closest('[data-stop]') && !e.target.closest('button[data-action="sheet-close"]')) return; state.sheet = null; renderOverlay(); }
  else if (a === 'move-select') { state.sheet.stageId = d.stage; state.sheet.errors = null; renderOverlay(); const f = document.querySelector('.inline-fields .input, .inline-fields .textarea'); if (f) f.focus(); }
  else if (a === 'move-confirm') { const s = state.sheet; const to = stage(s.stageId); const errors = {}; if (to.requires_note && !(s.note || '').trim()) errors.note = true; if (to.requires_reschedule && !s.date) errors.date = true; if (Object.keys(errors).length) { s.errors = errors; renderOverlay(); return; } state.sheet = null; moveCard(s.cardId, s.stageId, { note: s.note, date: s.date, time: s.time }); render(); }
  else if (a === 'conclude') { const card = find('cards', d.card); const done = stagesOf(card.pipeline_id).find((s) => s.is_done); moveCard(card.id, done.id); render(); }
  else if (a === 'print') { window.print(); }
  else if (a === 'pipeline-from-template') { createPipelineFromTemplate(d.kind, d.name); }
  else if (a === 'proto-menu') { state.menu = !state.menu; renderProtoTools(); }
  else if (a === 'proto-device') { setDevice(d.device); }
});
document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-bind]');
  if (el && state.draft) { const v = el.type === 'checkbox' ? el.checked : el.value; setPath(state.draft, el.dataset.bind, v); if (state.errors[el.dataset.bind]) { delete state.errors[el.dataset.bind]; el.closest('.field')?.classList.remove('has-error'); el.closest('.field')?.querySelector('.error')?.remove(); } if (el.dataset.bind.endsWith('.tone')) { const dot = el.closest('.fields')?.querySelector('.dot'); if (dot) dot.className = 'dot ' + v; } return; }
  const sb = e.target.closest('[data-sheet-bind]');
  if (sb && state.sheet) state.sheet[sb.dataset.sheetBind] = sb.value;
});
document.addEventListener('change', (e) => {
  const el = e.target.closest('[data-action-change]');
  if (el && el.dataset.actionChange === 'nav') go(el.dataset.href + el.value);
  const bind = e.target.closest('select[data-bind], input[type="checkbox"][data-bind]');
  if (bind && state.draft) setPath(state.draft, bind.dataset.bind, bind.type === 'checkbox' ? bind.checked : bind.value);
});
document.addEventListener('submit', (e) => {
  const form = e.target.closest('[data-form]'); if (!form) return; e.preventDefault();
  const kind = form.dataset.form;
  if (kind === 'login') { const d = state.draft || {}; if (!d.email || !d.password) { state.errors.login = 'Indique o email e a palavra-passe.'; render(); return; } const btn = form.querySelector('[type=submit]'); btn.classList.add('is-loading'); setTimeout(() => { state.errors = {}; go('/'); }, 600); }
  else if (kind === 'card') saveCard();
  else if (kind === 'minutes') saveMinutes(e.submitter?.dataset.status || 'draft');
  else if (kind === 'stages') saveStages(form.dataset.pipeline);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.sheet) { state.sheet = null; renderOverlay(); } });
// Drag and drop (desktop Kanban). The app uses dnd-kit for the same behaviour.
document.addEventListener('dragstart', (e) => { const c = e.target.closest('.card-item'); if (!c) return; state.dragging = c.dataset.card; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', c.dataset.card); setTimeout(() => c.classList.add('is-dragging'), 0); });
document.addEventListener('dragend', (e) => { const c = e.target.closest('.card-item'); if (c) c.classList.remove('is-dragging'); document.querySelectorAll('.stage-body.is-over').forEach((b) => b.classList.remove('is-over')); state.dragging = null; });
document.addEventListener('dragover', (e) => { const b = e.target.closest('[data-drop]'); if (!b || !state.dragging) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; document.querySelectorAll('.stage-body.is-over').forEach((x) => x !== b && x.classList.remove('is-over')); b.classList.add('is-over'); });
document.addEventListener('dragleave', (e) => { const b = e.target.closest('[data-drop]'); if (b && !b.contains(e.relatedTarget)) b.classList.remove('is-over'); });
document.addEventListener('drop', (e) => { const b = e.target.closest('[data-drop]'); if (!b) return; e.preventDefault(); const cardId = e.dataTransfer.getData('text/plain') || state.dragging; const card = find('cards', cardId); const to = stage(b.dataset.drop); state.dragging = null; if (!card || card.stage_id === to.id) { render(); return; } if (to.requires_note || to.requires_reschedule) { state.sheet = { type: 'move', cardId, stageId: to.id }; render(); return; } moveCard(cardId, to.id); render(); });
window.addEventListener('hashchange', () => { state.sheet = null; render(); });

/* ======================================================================
   Prototype tools (device toggle + screen map). Not part of the product.
   ====================================================================== */
const SCREENS = [
  ['Início', '/'], ['Agenda', '/agenda'], ['Agenda · filtro por pessoa', '/agenda?member=p2'], ['Agenda · dia vazio', '/agenda?date=2026-11-22'], ['Nova reunião', '/cards/new?pipeline=reunioes'], ['Ficha da reunião', '/cards/c1'], ['Ficha · separador Ata (sem ata)', '/cards/c3?tab=ata'], ['Ficha · reunião concluída com ata', '/cards/c4?tab=ata'], ['Pipeline · Reuniões', '/pipelines/reunioes'], ['Pipeline · Vendas', '/pipelines/vendas'], ['Pipeline · Projetos', '/pipelines/projetos'], ['Pipeline · Campanhas', '/pipelines/campanhas'], ['Pipeline · Tarefas', '/pipelines/tarefas'], ['Nova oportunidade', '/cards/new?pipeline=vendas'], ['Atas', '/atas'], ['Nova ata (escolher reunião)', '/atas/new'], ['Nova ata · pré-preenchida', '/atas/new?card=c12'], ['Ata final (leitura)', '/atas/m1'], ['Ata · rascunho', '/atas/m2'], ['Ata · impressão', '/atas/m1/print'], ['Equipa', '/team'], ['Definições · etapas', '/settings/pipelines/reunioes'], ['Entrar', '/login'],
];
function getDevice() { try { return localStorage.getItem('kops-device') || (window.innerWidth < 760 ? 'phone-native' : 'desktop'); } catch { return 'desktop'; } }
function setDevice(dev) { try { localStorage.setItem('kops-device', dev); } catch {} applyDevice(); renderProtoTools(); }
function applyDevice() { const dev = getDevice(); document.body.classList.toggle('preview', dev === 'phone' && window.innerWidth >= 760); }
function renderProtoTools() {
  let box = document.getElementById('proto'); if (!box) return;
  const dev = getDevice();
  box.innerHTML = `<div class="proto-tools"><button class="btn btn-primary btn-sm" data-action="proto-menu">${icon('kanban', 'sm')}Protótipo</button></div>${state.menu ? `<div class="proto-menu"><h4>Dispositivo</h4><div class="device"><button class="${dev !== 'phone' ? 'is-active' : ''}" data-action="proto-device" data-device="desktop">Desktop</button><button class="${dev === 'phone' ? 'is-active' : ''}" data-action="proto-device" data-device="phone">Telemóvel</button></div><h4>Ecrãs</h4>${SCREENS.map(([l, h]) => `<a href="#${h}" ${h === currentHash() ? 'style="background:var(--canvas-2)"' : ''}>${l}</a>`).join('')}<h4>Nota</h4><p class="caption" style="margin:0 6px 6px">${T.sample}. Os dados mudam em memória e voltam ao início ao recarregar.</p></div>` : ''}`;
}
applyDevice();
window.addEventListener('resize', applyDevice);
render();
