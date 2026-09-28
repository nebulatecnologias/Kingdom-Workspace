#!/usr/bin/env python3
"""
Create a new members-area project from the reference implementation (Kingdom Library).

Copies assets/template/ into the target folder and swaps the brand, domain, sender, company and
support details for the new product. Everything else (auth, invites, gateway webhooks, kits,
admin, security headers, tests, CI) stays exactly as proven in production.

Usage:
  python scripts/new_project.py --target ../acme-library \
      --name "Acme Library" --slug acme-library \
      --domain library.acme.co.za --from-email library@acme.co.za \
      --support-email help@acme.co.za --support-phone "+27 82 000 0000" \
      --company "Acme Media (Pty) Ltd" --company-reg 2024/000000/07 \
      --company-address "1 Main Road, Sandton, South Africa"

Only --target and --name are required; anything left out keeps a clearly marked placeholder
that the report at the end lists, so nothing ships with another company's details by accident.
"""

import argparse
import re
import shutil
import sys
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
TEMPLATE = SKILL / "assets" / "template"
TEXT_SUFFIXES = {
    ".ts", ".tsx", ".js", ".mjs", ".json", ".md", ".css", ".sql", ".toml", ".yml", ".yaml",
    ".sh", ".txt", ".example", ".html", ".gitignore",
}

# What the reference implementation contains, and the option that replaces it.
REFERENCE = {
    "name": ["Kingdom Library", "Kingdom Members"],
    "slug": ["kingdom-members"],
    "domain": ["library.kingdomcompny.com"],
    "from_email": ["library@kingdomcompny.com", "members@kingdomcompny.com"],
    "support_email": ["contact@sheltondouglas.co.za"],
    "company": ["Shelton Douglas Group (Pty) Ltd"],
    "company_reg": ["2025/432920/07"],
    "company_address": ["2 Mushroom Road, Plooysville AH, Midrand, South Africa", "2 Mushroom Road, Plooysville AH, Midrand"],
    "support_phone": ["+27 78 448 6040"],
}
PLACEHOLDER = {
    "domain": "members.example.com",
    "from_email": "members@example.com",
    "support_email": "help@example.com",
    "company": "YOUR COMPANY (Pty) Ltd",
    "company_reg": "REGISTRATION-NUMBER",
    "company_address": "COMPANY ADDRESS",
    "support_phone": "+00 00 000 0000",
}


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def is_text(path: Path) -> bool:
    return path.suffix in TEXT_SUFFIXES or path.name in {".gitignore", ".env.example", "AGENTS.md", "CLAUDE.md"}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--target", required=True, help="Folder of the new repository (created if missing)")
    ap.add_argument("--name", required=True, help='Product name shown everywhere, e.g. "Acme Library"')
    ap.add_argument("--slug", help="Short id (default: from --name)")
    ap.add_argument("--domain", help="Public domain, e.g. library.acme.co.za")
    ap.add_argument("--from-email", help="Sender address on a domain verified in Resend")
    ap.add_argument("--support-email")
    ap.add_argument("--support-phone", help="Also used for the WhatsApp link")
    ap.add_argument("--company", help="Legal name of the company that sells the products")
    ap.add_argument("--company-reg", help="Company registration number")
    ap.add_argument("--company-address")
    ap.add_argument("--force", action="store_true", help="Overwrite an existing members/ folder")
    args = ap.parse_args()

    target = Path(args.target).resolve()
    if (target / "members").exists() and not args.force:
        print(f"{target}/members already exists. Use --force to overwrite.", file=sys.stderr)
        return 1
    target.mkdir(parents=True, exist_ok=True)
    shutil.copytree(TEMPLATE, target, dirs_exist_ok=True)
    # Packaged skills can lose the executable bit; the DB tests and the lite stack are shell scripts.
    for script in target.rglob("*.sh"):
        script.chmod(0o755)

    values = {
        "name": args.name,
        "slug": args.slug or slugify(args.name),
        "domain": args.domain,
        "from_email": args.from_email,
        "support_email": args.support_email,
        "company": args.company,
        "company_reg": args.company_reg,
        "company_address": args.company_address,
        "support_phone": args.support_phone,
    }
    missing = [k for k, v in values.items() if not v]
    for k in missing:
        values[k] = PLACEHOLDER[k]

    pairs = [(old, values[key]) for key, olds in REFERENCE.items() for old in olds]
    digits = re.sub(r"\D", "", values["support_phone"])
    pairs.append(("https://wa.me/27784486040", f"https://wa.me/{digits}"))
    # Longest first, so "2 Mushroom Road, …, South Africa" is replaced before its shorter form.
    pairs.sort(key=lambda p: len(p[0]), reverse=True)

    changed = 0
    for path in target.rglob("*"):
        if not path.is_file() or not is_text(path) or "node_modules" in path.parts:
            continue
        text = path.read_text(encoding="utf-8")
        new = text
        for old, rep in pairs:
            new = new.replace(old, rep)
        if new != text:
            path.write_text(new, encoding="utf-8")
            changed += 1

    print(f"Created {values['name']} in {target} ({changed} files updated).\n")
    print("Next steps (see the skill's references/10-deploy-and-launch.md):")
    print("  1. cd members/app && npm install && npm run typecheck && npm test")
    print("  2. Replace the logo: node <skill>/scripts/make_icons.mjs <square-logo.png> members/app/src/app")
    print("     and the crown SVG in members/app/src/components/ui/logo.tsx and public/email/logo.png")
    print("  3. Review members/app/src/content/legal.ts for your country's law (it is written for South Africa/POPIA)")
    print("  4. Currency and number formats: members/app/src/lib/format.ts (ZAR, en-ZA by default)")
    print("  5. Replace the demo products in members/supabase/seed.sql or load real ones in the admin")
    if missing:
        print("\nStill placeholders (search for them before launch): " + ", ".join(f"{k} → {PLACEHOLDER[k]}" for k in missing))
    return 0


if __name__ == "__main__":
    sys.exit(main())
