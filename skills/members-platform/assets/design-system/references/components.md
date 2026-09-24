# Components

Class names match `assets/kingdom-ui.css`. The snippets are plain HTML: copy them into prototypes, or translate them into React components with the same class names or Tailwind equivalents (see `implementation-nextjs.md`). Icons are `<svg class="icon">` from `assets/icons.js` (Lucide shapes).

**Contents:**
1. Buttons
2. Split CTA
3. Icon button
4. Pills, chips, badges
5. Filters and segmented control
6. Cards
7. KPI card
8. Countdown card
9. Activity feed
10. Person card
11. Table
12. Forms
13. Notices, empty and loading states
14. Dialog, drawer, toast
15. Navigation (sidebar, top bar, mobile bar, tab bar, tabs)
16. Brand
17. Product card (owned / locked / soon)
18. Detail hero
19. Table of contents and reader
20. Code field, key-value list, dropzone, status dot

---

## 1. Buttons
Full pill. Heights 42px (default), 52px (`.btn-lg`), 34px (`.btn-sm`). Labels 500 weight.

```html
<button class="btn btn-primary">Save changes</button>       <!-- the ONE gradient action of the view -->
<button class="btn btn-ghost">Cancel</button>                <!-- secondary: white + hairline -->
<button class="btn btn-quiet">Skip</button>                  <!-- tertiary / menu item -->
<button class="btn btn-danger">Delete account</button>       <!-- destructive: red text, red-soft hover -->
<button class="btn btn-primary btn-lg btn-block">Create account</button>
<button class="btn btn-primary is-loading"><span class="spin"></span>Creating your account…</button>
```
- Put a 15–18px icon before the label when it helps scanning (`gap: 8px` is built in).
- **Loading:** swap the label for a spinner plus the in-progress text; the button goes to 60% opacity and ignores clicks.
- **Destructive actions need an inline confirmation.** Do not use a browser `confirm()`. Swap the row's actions for `Delete? [Yes] [No]`, or show a warning notice with the two buttons.

## 2. Split CTA (admin primary)
Sits at the top of the admin sidebar. The main segment runs the most common creation; the chevron opens a menu of other "create" actions.

```html
<div class="split">
  <button class="split-main"><svg class="icon">…plus…</svg>New invite</button>
  <button class="split-more" aria-label="More actions" aria-expanded="false"><svg class="icon">…chevronDown…</svg></button>
  <!-- open state: absolutely positioned .card menu with .btn-quiet.btn-block items, shadow-pop -->
</div>
```

## 3. Icon button
A 40px white circle with a hairline border (help, notifications, close). Inside tables it is 34px, borderless and transparent until hover.

```html
<button class="icon-btn" aria-label="Help"><svg class="icon">…help…</svg></button>
<div class="row-actions"><button class="icon-btn" aria-label="Resend">…</button><button class="icon-btn" aria-label="Revoke">…</button></div>
```

## 4. Pills, chips, badges
All 28px tall, 13px/500, with an optional 7px dot.

```html
<span class="pill pill-green"><span class="dot"></span>Unlocked</span>     <!-- solid: owned / active -->
<span class="pill pill-red">Expiring</span>                                 <!-- solid: urgent -->
<span class="pill pill-orange"><svg class="icon icon-sm">…lock…</svg>R 69,00</span>  <!-- price / sent -->
<span class="pill pill-blue"><span class="dot"></span>Opened</span>
<span class="pill pill-soft-green"><span class="dot"></span>Accepted</span>
<span class="pill pill-grey">Coming soon</span>
<span class="pill pill-soft-red"><span class="dot"></span>Revoked</span>
<span class="pill pill-violet">Free sample</span>
<span class="chip-mention">@Thandi Mokoena</span>   <!-- people, inside feeds -->
<span class="chip-code">#KG-8F3K2</span>           <!-- references, IDs, event names -->
<nav class="nav"><a href="#invites">…mail… Invites <span class="badge">5</span></a></nav>  <!-- nav count badge: orange-soft -->
```

## 5. Filters and segmented control

```html
<div class="filters scroll" role="group">
  <button class="filter" aria-pressed="true">Everything <span class="count">10</span></button>
  <button class="filter" aria-pressed="false">My library <span class="count">3</span></button>
</div>
<div class="seg" role="group"><button aria-pressed="true">Visible</button><button aria-pressed="false">Coming soon</button><button aria-pressed="false">Hidden</button></div>
<div class="seg seg-sm">…</div>
```
- Selected filter inverts to `ink` fill.
- Use `.scroll` so the row scrolls sideways on phones instead of wrapping.
- Segmented controls are for 2–4 mutually exclusive states (visibility, sign-in method, language, preview mode).

## 6. Cards

```html
<section class="card">
  <div class="card-head"><h2 class="card-title"><svg class="icon">…</svg>Activity</h2><a class="btn btn-ghost btn-sm">View all</a></div>
  <div class="card-pad">…</div>
</section>
<section class="card card-pad stack">…</section>   <!-- .stack = grid with 18px gap -->
```
- Cards group one job. **Never nest a card in a card.** Inside a card, use `.bought`-style rows (white, hairline, 16px radius) or plain dividers.

## 7. KPI card
The card has an icon label, a big tabular value, a five-bar mini chart and a delta line. The bars should show a real series (e.g. the last 5 weeks); set their heights from data.

```html
<div class="card kpi">
  <span class="kpi-label"><svg class="icon icon-sm">…users…</svg>Members</span>
  <div class="kpi-row"><span class="kpi-value">214</span>
    <div class="bars" aria-hidden="true"><i style="height:45%"></i><i style="height:70%"></i><i style="height:55%"></i><i style="height:90%"></i><i style="height:75%"></i></div></div>
  <span class="kpi-delta">+18 this month</span>   <!-- green-ink; use amber-ink style for warnings -->
</div>
```
Layout: `.kpis` grid = 3 KPI cards + 1 wider card.

## 8. Countdown card (time-critical item)
Violet is spent here: it shows the next deadline, who it is for, and one action.

```html
<div class="card countdown">
  <div class="countdown-top"><div><b style="font-size:18px">Pieter's invite</b><span class="muted" style="display:block;font-size:13px">pieter@example.co.za</span></div><span class="pill pill-red">Expiring</span></div>
  <div class="clock">05<span>:</span>42<span>:</span>18</div>
  <div style="display:flex;justify-content:space-between;align-items:center"><span class="muted tnum" style="font-size:13px;white-space:nowrap">Expires in 5 h 42 min</span><button class="btn btn-ghost btn-sm">Resend now</button></div>
</div>
```

## 9. Activity feed
Rows are 14px at line-height 1.7 so the chips have room, with a right-aligned 12.5px timestamp.

```html
<div class="feed">
  <div class="feed-item"><span><span class="chip-mention">@Ayesha Patel</span> unlocked <span class="chip-code">Money God's Way</span></span><time>10:15</time></div>
</div>
```

## 10. Person card
Avatar (initials on a colour from a fixed palette), name, one line of context and a status pill. When the context is a list, show the first item plus "+n".

```html
<div class="person"><span class="avatar" style="background:#564cc9;width:44px;height:44px">PV</span>
  <div class="who"><b>Pieter van der Merwe</b><span class="pk"><span class="pk-t">Build a Sermon in 7 Steps</span><span class="pk-n">+1</span></span></div>
  <span class="pill pill-blue"><span class="dot"></span>Opened</span></div>
```
Avatar palette: `#f4621d #564cc9 #15803d #1f5f9a #b8400a #8a5b00 #b4202d #0f7a6c`, picked by a stable hash of the name.

## 11. Table
Inside a card, with a toolbar (filters + mini search) and horizontal scroll on small screens.

```html
<section class="card">
  <div class="toolbar"><div class="filters">…</div><label class="mini-search"><svg class="icon icon-sm">…search…</svg><input type="search" placeholder="Search members…"></label></div>
  <div class="table-wrap"><table class="table">
    <thead><tr><th>Member</th><th>Language</th><th>Joined</th><th>Status</th><th></th></tr></thead>
    <tbody><tr class="clickable" tabindex="0">
      <td><div class="cell-person"><span class="avatar">TM</span><div><b>Thandi Mokoena</b><span>thandi@example.co.za</span></div></div></td>
      <td><span class="pill pill-grey">EN</span></td><td class="muted tnum">23 Sep</td>
      <td><span class="pill pill-soft-green"><span class="dot"></span>Active</span></td><td>…chevron…</td></tr></tbody>
  </table></div>
</section>
```
- Headers are 12.5px `muted`; cells are 14px with 13px vertical padding; rows hover to `surface-2`.
- A clickable row opens a **drawer**, not a new page, when the task is quick (grant access, resend, deactivate).

## 12. Forms

```html
<div class="field"><label for="email">Email</label><input class="input" id="email" type="email" placeholder="you@example.co.za"><span class="hint">The email you used at checkout.</span></div>
<div class="field has-error"><label for="name">Your name</label><input class="input" id="name"><span class="error-text"><svg class="icon icon-sm">…alert…</svg>Please tell us your name.</span></div>
<div class="field"><label for="pw">Password</label>
  <div class="input-wrap"><input class="input" id="pw" type="password"><button type="button" class="adorn" aria-label="Show password">…eye…</button></div>
  <div class="meter" data-level="3"><i></i><i></i><i></i><i></i></div></div>
<select class="select">…</select>  <textarea class="textarea"></textarea>
<label class="check"><input type="checkbox"> I agree to the Terms and the Privacy Policy (POPIA).</label>
<label class="toggle"><input type="checkbox" checked><span></span></label>
<input class="input" readonly value="locked@example.co.za">   <!-- read-only = sunken fill -->
```
- Inputs are 48px tall, with a 14px radius and `line-strong` border. Focus gives an orange border plus the ring.
- **Validate on submit.** Errors say what is wrong and how to fix it. Focus the first invalid field.
- `.grid-2` puts two fields side by side; it stacks under 640px.

## 13. Notices, empty and loading states

```html
<div class="notice notice-ok"><svg class="icon">…check…</svg><span>Welcome! Everything you bought is below.</span></div>
<div class="notice notice-info">…</div>  <div class="notice notice-warn">…</div>
<div class="empty"><svg class="icon">…</svg><p>Nothing here yet. Your purchases appear here automatically.</p></div>
<span class="state-icon" style="background:var(--amber-soft);color:var(--amber-ink)"><svg class="icon">…clock…</svg></span>  <!-- big 64px icon tile for full-page states -->
```
- An empty state teaches: say what will appear and how.
- Loading uses skeletons in the card shapes, not a centred spinner. Spinners go inside buttons only.

## 14. Dialog, drawer, toast

```html
<div class="scrim"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="t">
  <div class="dialog-head"><div><h2 id="t">Unlock Build a Sermon</h2><p class="muted">One payment, yours to keep.</p></div><button class="icon-btn" aria-label="Close">…x…</button></div>
  …</div></div>
<div class="scrim drawer-scrim"><div class="drawer" role="dialog" aria-modal="true">…</div></div>   <!-- right side panel, 460px -->
<div class="toasts"><div class="toast" role="status"><svg class="icon">…check…</svg><span>Invite sent to ana@example.co.mz</span></div></div>
```
- **Dialog:** for short, focused tasks (checkout summary, reader, colouring studio). Close with Escape, the scrim or ✕. Trap focus and return it on close.
- **Drawer:** for editing one record from a list (new invite, member detail).
- **Toast:** bottom-centre, dark (`ink`) with a green check, about 3.4s. It confirms what happened ("Invite revoked. The link no longer works.").

## 15. Navigation
- **Sidebar** (≥ 980px): `.sidebar` > `.brand`, [split CTA in admin], `.nav` > `<a aria-current="page">`, `.sidebar-foot` (secondary links + `.user-chip`). The active item is a white raised tile with an orange icon.
- **Top bar:** `.topbar` > `.search` pill, spacer, language `.select.lang-select`, `.icon-btn`s.
- **Mobile bar** (< 980px): `.mobile-bar`, a sticky blurred bar with the brand, compact controls and an avatar.
- **Tab bar** (< 980px): `.tabbar`, fixed at the bottom with 3–5 items (icon + 11.5px label). The active item is orange.
- **Tabs** inside editors: `.tabs` > `button[role=tab][aria-selected]`, with a 2px orange underline.
- **Back link:** `.back`, a muted text link with a chevron, above detail page heads.

## 16. Brand

```html
<a class="brand" href="/"><svg>…logo.svg…</svg><span><b>Kingdom Members</b><small>Administrator</small></span></a>
```

## 17. Product card (owned / locked / soon)
This is the signature component for any catalogue: courses, books, templates, events, plans.

```html
<button class="pack" data-href="/products/money">                        <!-- owned -->
  <div class="pack-cover" style="background:var(--field-mint)"><svg class="art">…coloured art…</svg></div>
  <div class="pack-body"><h3>Money God's Way</h3>
    <div class="pack-foot"><span class="pack-meta">eBook · 9 chapters</span><span class="pill pill-green"><span class="dot"></span>Unlocked</span></div></div>
</button>
<button class="pack is-locked">                                          <!-- locked: desaturated, line art, padlock, price -->
  <div class="pack-cover" style="background:var(--field-periwinkle)"><svg class="art">…line art…</svg><span class="pack-lock">…lock…</span></div>
  <div class="pack-body"><h3>Build a Sermon in 7 Steps</h3>
    <div class="pack-foot"><span class="pack-meta">Guide · 7 steps</span><span class="pill pill-orange">…lock… R 149,00</span></div></div>
</button>
<div class="pack is-soon" aria-disabled="true">…<span class="pill pill-grey">Coming soon</span></div>
```
- The meta line is `type · count` below the title. The status pill is always last.
- Group cards into titled sections (`.lib-sec > h2 + .lib-grid`) when a catalogue has more than one kind of item.

## 18. Detail hero

```html
<a class="back" href="/library">…chevronLeft… Back to library</a>
<section class="pack-hero">
  <div class="cover-lg" style="background:var(--field-mint)">…art…</div>
  <div><div class="filters"><span class="pill pill-green">Unlocked</span><span class="pill pill-grey">eBook</span></div>
    <h1>Money God's Way</h1><p class="desc">…</p><p class="muted">“Verse” · Ref</p>
    <div class="facts"><span class="pill pill-grey">9 chapters</span>…</div>
    <div class="actions"><button class="btn btn-primary btn-lg">Continue reading</button><button class="btn btn-ghost btn-lg">Download PDF</button></div></div>
</section>
```

## 19. Table of contents and reader

```html
<ol class="card toc"><li><button class="toc-row"><span class="toc-n">1</span><span class="toc-t"><b>Whose money is it?</b><span class="muted">12 min</span></span><span class="pill pill-soft-green">Read</span><span class="toc-go">…chevronRight…</span></button></li></ol>
<div class="dialog dialog-wide reader-dlg">… <article class="reader" style="font-size:17px"><p>…</p></article>
  <div class="reader-nav"><button class="btn btn-ghost">Previous</button><span class="muted tnum">4 / 9</span><button class="btn btn-primary">Next chapter</button></div></div>
```
- Numbering is used because chapters are a real sequence.
- The row states are Read (green soft), Reading (orange soft), Free sample (violet), or a lock icon.

## 20. Utility components

```html
<div class="code-field"><span>https://members.example.co.za/api/webhooks/gateway</span><button class="btn btn-ghost btn-sm">Copy</button></div>
<dl class="kv"><div><dt>Price</dt><dd class="tnum">R 129,00</dd></div></dl>
<div class="dropzone" role="button" tabindex="0">…upload… <b>Drop the PDF here</b><span>A4, up to 20 MB</span></div>
<span class="status-dot"></span>   <!-- green live dot with soft halo -->
<div class="progress" role="progressbar" aria-valuenow="3" aria-valuemax="9"><i style="width:33%"></i></div>
```
