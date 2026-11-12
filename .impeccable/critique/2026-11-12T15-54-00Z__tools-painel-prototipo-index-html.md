---
target: protótipo do painel
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/home/user/Kingdom-Workspace/tools/painel/prototipo/index.html"
target_fingerprint: "sha256:57c0dc1bae4f5b8b5b03f13d7ffb034826ff10c2ef95124892be4f871b136c5b"
target_path: /home/user/Kingdom-Workspace/tools/painel/prototipo/index.html
timestamp: 2026-11-12T15-54-00Z
slug: tools-painel-prototipo-index-html
---
Method: dual-agent (A: design review · B: detector + browser)

Heuristics: 1 Visibility 3 · 2 Real world 3 · 3 Control 2 · 4 Consistency 2 · 5 Error prevention 2 · 6 Recognition 3 · 7 Efficiency 2 · 8 Minimalist 2 · 9 Recovery 2 · 10 Help 1 = 22/40

Design specificity: content specific to Kingdom (PT-PT, MT, real slugs, BANT, stage rules); visual language generic SaaS template; little from the Academy system; violet acting as a third brand colour.

Detector: 5 low-contrast (CLI), all dark-mode or false positives; browser: cramped-padding (false positives), low-contrast 4.4:1 on green deltas and selected inbox row, tiny 11px text, dark-mode overrides only under [data-theme], pulsing dot.

Priority issues:
- [P1] Colour system ignores the two-colour brief (~14 hues). Fix: indigo + orange only, tints, Academy warm neutrals, semantic pairs only in pills.
- [P1] Charts: square-wave line (mid-x Bézier), 6-slice donut with off-palette hues, grouped bars contradicting totals, funnel sliver. Fix: daily bars + 7-day monotone average, merged channel table, split bar, step conversions.
- [P1] Academy pieces not borrowed (canvas, active nav tile, 18px icons, 400/500 weights, pills, 22px cards, warm shadows, KPI mini bars).
- [P2] Dashboard without hierarchy (11 equal cards).
- [P2] Kanban off-screen columns, rainbow stage dots, «Mover» forward only, Tarefas filter not filtering, wrong back arrow, Ganho rule as toast.

Applied in this session: all of the above.
