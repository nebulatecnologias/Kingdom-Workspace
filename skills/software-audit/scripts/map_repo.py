#!/usr/bin/env python3
"""
Map an existing codebase before auditing it: stack, entry points, routes, API endpoints, auth and
data layers, migrations, env vars, tests, CI. Read-only; prints Markdown (and JSON with --json).

  python scripts/map_repo.py <repo-root> [--json out.json]

It finds candidates, not truths: open the files it lists before drawing conclusions.
"""

import argparse
import json
import os
import re
import signal
import sys
from pathlib import Path

SKIP_DIRS = {"node_modules", ".git", ".next", "dist", "build", "out", ".venv", "venv", "__pycache__",
             "coverage", "playwright-report", "test-results", ".turbo", ".vercel", "vendor", "target"}
CODE_EXT = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".rb", ".php", ".go", ".java", ".kt", ".cs", ".rs", ".vue", ".svelte"}

FRAMEWORK_HINTS = {
    "next": "Next.js", "react": "React", "vue": "Vue", "nuxt": "Nuxt", "svelte": "Svelte", "@sveltejs/kit": "SvelteKit",
    "@angular/core": "Angular", "express": "Express", "fastify": "Fastify", "@nestjs/core": "NestJS", "hono": "Hono",
    "@supabase/supabase-js": "Supabase", "firebase": "Firebase", "prisma": "Prisma", "@prisma/client": "Prisma",
    "drizzle-orm": "Drizzle", "mongoose": "MongoDB/Mongoose", "pg": "PostgreSQL", "mysql2": "MySQL",
    "next-auth": "NextAuth/Auth.js", "@clerk/nextjs": "Clerk", "passport": "Passport", "jsonwebtoken": "JWT",
    "stripe": "Stripe", "@paystack/inline-js": "Paystack", "resend": "Resend", "nodemailer": "Nodemailer",
    "zod": "zod", "tailwindcss": "Tailwind", "vitest": "Vitest", "jest": "Jest", "@playwright/test": "Playwright", "cypress": "Cypress",
}
PY_HINTS = {"django": "Django", "flask": "Flask", "fastapi": "FastAPI", "sqlalchemy": "SQLAlchemy", "pytest": "pytest"}

ROUTE_PATTERNS = [
    (re.compile(r"""\b(app|router|server)\.(get|post|put|patch|delete|all)\(\s*['"`]([^'"`]+)"""), "express-like"),
    (re.compile(r"""@(Get|Post|Put|Patch|Delete)\(\s*['"]?([^'")]*)"""), "decorator"),
    (re.compile(r"""@(?:app|router|bp|blueprint)\.(get|post|put|patch|delete|route)\(\s*['"]([^'"]+)"""), "python"),
    (re.compile(r"""path\(\s*['"]([^'"]*)['"]"""), "django"),
]
AUTH_WORDS = re.compile(r"\b(requireAuth|requireAdmin|isAdmin|is_admin|getUser|getSession|auth\(\)|currentUser|verifyToken|jwt\.verify|@login_required|permission_classes|authorize|middleware|role)\b")
DANGER = [
    (re.compile(r"dangerouslySetInnerHTML|v-html|innerHTML\s*="), "raw HTML rendering (XSS review)"),
    (re.compile(r"\beval\(|new Function\("), "dynamic code execution"),
    (re.compile(r"service_role|SERVICE_ROLE|serviceRole"), "service-role / admin credentials in code path"),
    (re.compile(r"(?i)(api[_-]?key|secret|password|token)\s*[:=]\s*['\"][A-Za-z0-9_\-]{16,}['\"]"), "possible hard-coded secret"),
    (re.compile(r"sk_live_[A-Za-z0-9]{10,}|sk_test_[A-Za-z0-9]{10,}|AKIA[0-9A-Z]{16}|-----BEGIN (RSA |EC )?PRIVATE KEY"), "credential pattern"),
    (re.compile(r"(?i)cors\(\s*\{[^}]*origin\s*:\s*['\"]\*"), "CORS open to any origin"),
    (re.compile(r"(?i)\b(query|execute|raw)\(\s*[`'\"][^`'\"]*\$\{"), "string-built SQL (injection review)"),
]
ENV_RE = re.compile(r"process\.env\.([A-Z0-9_]+)|import\.meta\.env\.([A-Z0-9_]+)|os\.environ(?:\.get)?\[?\(?['\"]([A-Z0-9_]+)")


def walk(root: Path):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".") or d in {".github"}]
        for f in filenames:
            yield Path(dirpath) / f


def main() -> int:
    signal.signal(signal.SIGPIPE, signal.SIG_DFL)  # allow `| head`
    ap = argparse.ArgumentParser()
    ap.add_argument("root")
    ap.add_argument("--json")
    args = ap.parse_args()
    root = Path(args.root).resolve()
    if not root.is_dir():
        print(f"Not a folder: {root}", file=sys.stderr)
        return 1

    stack, manifests, next_pages, next_api, routes = set(), [], [], [], []
    migrations, tests, ci, env_vars, danger, auth_files, server_actions = [], [], [], {}, [], [], []
    files = list(walk(root))
    for p in files:
        rel = p.relative_to(root).as_posix()
        name = p.name
        if name == "package.json":
            try:
                pkg = json.loads(p.read_text(encoding="utf-8"))
            except Exception:
                continue
            deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
            manifests.append({"file": rel, "scripts": pkg.get("scripts", {}), "deps": sorted(deps)})
            for d, label in FRAMEWORK_HINTS.items():
                if d in deps:
                    stack.add(f"{label} {deps[d]}")
        elif name in {"requirements.txt", "pyproject.toml", "Pipfile"}:
            text = p.read_text(encoding="utf-8", errors="ignore").lower()
            manifests.append({"file": rel})
            stack.update(label for d, label in PY_HINTS.items() if d in text)
        elif name in {"composer.json", "Gemfile", "go.mod", "pom.xml", "Cargo.toml"}:
            manifests.append({"file": rel})
        if re.search(r"(^|/)(migrations?|prisma|supabase/migrations|db/migrate|alembic/versions)/", rel) and p.suffix in {".sql", ".prisma", ".py", ".rb", ".ts", ".js"}:
            migrations.append(rel)
        if re.search(r"(\.test\.|\.spec\.|(^|/)tests?/|(^|/)e2e/|(^|/)__tests__/)", rel):
            tests.append(rel)
        if rel.startswith(".github/workflows/") or name in {".gitlab-ci.yml", "vercel.json", "netlify.toml", "Dockerfile", "docker-compose.yml"}:
            ci.append(rel)
        if re.search(r"(^|/)app/.*(page|layout)\.(t|j)sx?$", rel) or re.search(r"(^|/)pages/(?!api/).*\.(t|j)sx?$", rel):
            next_pages.append(rel)
        if re.search(r"(^|/)app/.*route\.(t|j)s$", rel) or re.search(r"(^|/)pages/api/.*\.(t|j)s$", rel):
            next_api.append(rel)
        if p.suffix not in CODE_EXT:
            continue
        try:
            text = p.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        if '"use server"' in text[:200] or "'use server'" in text[:200]:
            server_actions.append(rel)
        for rx, kind in ROUTE_PATTERNS:
            for m in rx.finditer(text):
                routes.append({"file": rel, "kind": kind, "match": m.group(0)[:120]})
        if AUTH_WORDS.search(text) and re.search(r"(auth|session|middleware|proxy|guard|permission|policy)", rel, re.I):
            auth_files.append(rel)
        for rx, why in DANGER:
            for m in rx.finditer(text):
                line = text.count("\n", 0, m.start()) + 1
                danger.append({"file": rel, "line": line, "why": why})
        for m in ENV_RE.finditer(text):
            var = next(g for g in m.groups() if g)
            env_vars.setdefault(var, set()).add(rel)

    rls = []
    dropped = set()
    for rel in migrations:
        dropped.update(t.lower() for t in re.findall(r"drop table (?:if exists )?([\w.\"]+)", (root / rel).read_text(encoding="utf-8", errors="ignore"), re.I))
    for rel in migrations:
        text = (root / rel).read_text(encoding="utf-8", errors="ignore")
        tables = re.findall(r"create table (?:if not exists )?([\w.\"]+)", text, re.I)
        enabled = re.findall(r"alter table ([\w.\"]+) enable row level security", text, re.I)
        policies = re.findall(r"create policy \w+ on ([\w.\"]+)", text, re.I)
        definer = len(re.findall(r"security definer", text, re.I))
        if tables or enabled or policies or definer:
            rls.append({"file": rel, "tables": tables, "rls_enabled": enabled, "policies_on": sorted(set(policies)), "security_definer_functions": definer})

    out = {
        "root": str(root), "files": len(files), "stack": sorted(stack), "manifests": manifests,
        "pages": sorted(next_pages), "api_routes": sorted(next_api), "server_actions": sorted(server_actions),
        "other_routes": routes[:300], "auth_related_files": sorted(set(auth_files)), "migrations": sorted(migrations),
        "rls_summary": rls, "env_vars": {k: sorted(v) for k, v in sorted(env_vars.items())},
        "tests": sorted(tests), "ci_and_deploy": sorted(ci), "review_hotspots": danger[:300],
    }
    if args.json:
        Path(args.json).write_text(json.dumps(out, indent=2), encoding="utf-8")

    print(f"# Repository map: {root.name}\n")
    print(f"Files scanned: {len(files)}\n\n## Stack\n" + ("\n".join(f"- {s}" for s in sorted(stack)) or "- (not detected)"))
    for title, key in [("Pages / screens", "pages"), ("API routes", "api_routes"), ("Server actions", "server_actions"),
                       ("Auth-related files", "auth_related_files"), ("Migrations", "migrations"), ("Tests", "tests"), ("CI / deploy", "ci_and_deploy")]:
        items = out[key]
        print(f"\n## {title} ({len(items)})")
        for i in items[:80]:
            print(f"- {i}")
        if len(items) > 80:
            print(f"- … {len(items) - 80} more")
    if routes:
        print(f"\n## Other route declarations ({len(routes)})")
        for r in routes[:60]:
            print(f"- {r['file']}: `{r['match']}`")
    if rls:
        print("\n## Database tables and row-level security")
        all_tables = sorted({t for r in rls for t in r["tables"]} - dropped)
        enabled = {t for r in rls for t in r["rls_enabled"]}
        for t in all_tables:
            print(f"- {t}: RLS {'on' if t in enabled else '**not enabled in migrations**'}")
    print(f"\n## Environment variables ({len(env_vars)})")
    for k, v in sorted(env_vars.items()):
        public = " (exposed to the browser)" if k.startswith(("NEXT_PUBLIC_", "VITE_", "PUBLIC_", "REACT_APP_")) else ""
        print(f"- {k}{public}: {', '.join(sorted(v)[:3])}{' …' if len(v) > 3 else ''}")
    print(f"\n## Review hotspots ({len(danger)}) — candidates to open, not findings")
    for d in danger[:80]:
        print(f"- {d['file']}:{d['line']} — {d['why']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
