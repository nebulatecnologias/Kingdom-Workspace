# Kingdom Members — clickable prototype

Single-file prototype of the members area (all data is sample data).

- Open `index.html` in a browser (or `npm run serve` style: `python3 -m http.server -d members/prototype`).
- Edit sources in `src/` (`styles.css`, `art.js`, `i18n.js`, `app.js`), then rebuild: `node members/prototype/build.mjs`.
- `build.mjs` writes `index.html` (full document) and `dist/kingdom-members.html` (body-only variant for Claude Artifacts).
- Use the **Prototype map** button (bottom right) to jump between screens; the language switch changes UI and emails (EN / PT / ES).

Screens: invite / sign-in / pack-unlocked emails · create account from invite · link expired / already used · sign in (email link or password) · request a new link · library (owned vs locked packs) · pack page with on-screen colouring · checkout hand-off to the gateway · profile (language, sign-in, POPIA) · admin overview · invites · members (grant/revoke packs) · showcase (order, visibility) · pack editor (translations, pages, sales) · integrations (webhook URL, secret, product mapping, deliveries).

Placeholders to replace: pack names, artwork, prices, domain (`yourdomain.co.za`), WhatsApp number.
