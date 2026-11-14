---
target: 3 modelos de post Kingdom Company
total_score: 12
max_score: 24
na_heuristics: 3,7,9,10
p0_count: 0
p1_count: 3
target_identity: "file:/home/user/Kingdom-Workspace/content/brand/kingdom-company/templates.html"
target_fingerprint: "sha256:d70b1b378004e44789036bce4d8dcffd57cbe45ed57a45eff7711e3fa9e06d8e"
target_path: /home/user/Kingdom-Workspace/content/brand/kingdom-company/templates.html
timestamp: 2026-11-14T19-21-51Z
slug: content-brand-kingdom-company-templates-html
---
Method: dual-agent (A: design review · B: detector + Playwright)

Heuristics (applicable 6 of 10; 3,7,9,10 n/a for static posts): 1:2 2:3 4:2 5:1 6:2 8:2 = 12/24 (before fixes).

Priority issues and status after the fix batch:
- [P1] 03 rising curve read as a growth arrow (manual anti-reference) and Lavanda used as solid text: FIXED (line rises then settles flat inside margins, last node is the Direção star, labels white 78%).
- [P1] Secondary text unreadable at phone size (18-24px): FIXED (floor 26-30px; logo --g 62 so the horizontal logo stays above 120px on screen).
- [P1] 03 repeated the brand name and stages, two competing CTAs, glass read as grey: FIXED (card has eyebrow, title, full-white 36px subtitle; one orange CTA + "Link na bio"; Aurora shape and Brasa corner behind the glass).
- [P2] 02 contrast below 3:1 on the 72% white setup line and the "O método" label: SUPERSEDED (template 2 redone to the user's new reference: all text full white).
- [P2] 01 tiles did not match the headline; CTA had no route: FIXED (Estratégia · Vendas · Tecnologia, Vendas in indigo; "Link na bio" next to the button; no drop shadows; pattern kept out of the logo protection zone).
Open: number slot (manual voice asks for numbers; none confirmed), single post vs carousel cover, photo placeholders in 02.
