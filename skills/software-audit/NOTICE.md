# Notices

This skill was written for the Kingdom Library project. Parts of the UX and design review checklist (`references/03-ux-and-design.md`, `references/04-accessibility-performance.md`) adapt ideas from these open-source skills:

- **impeccable** by Paul Bakaus, Apache License 2.0. Design-quality review: hierarchy, typography, spacing, colour and contrast, "AI-generated look" anti-patterns, polish passes.
- **ui-ux-pro-max** by Next Level Builder, MIT License. UX rules for forms, touch targets, states, accessibility and responsive layout.

No code from those projects is included; the text here is a rewrite in our own words. Their licences apply to their original material.

Related tools the workflow calls on when they are available, not bundled:

- A security-review or code-review skill, for a second pass over the diff or codebase.
- Supabase database advisors (`get_advisors`, security and performance), for projects on Supabase.
- axe-core (Deque Systems, MPL-2.0), loaded by `scripts/crawl_screens.mjs` from the audited project's or a scratch folder's `node_modules`.
- Playwright (Microsoft, Apache-2.0), used by the browser scripts.
- Lighthouse (Google, Apache-2.0), for performance measurements.

The OWASP Top 10 and WCAG 2.2 are referenced as public standards.
