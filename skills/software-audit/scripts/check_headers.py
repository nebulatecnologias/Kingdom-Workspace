#!/usr/bin/env python3
"""
Check the HTTP security posture of live URLs: security headers, cookies, HTTPS redirect, CORS on
API routes, and information leaks. Read-only GET/OPTIONS requests, one per URL.

  python scripts/check_headers.py https://app.example.com https://app.example.com/api/health [--json out.json]

Respects HTTPS_PROXY. If a sandbox blocks the domain, fetch through another tool (e.g. a hosting
provider's fetch tool) and pass the saved headers with --headers-file (JSON: {"url": {header: value}}).
"""

import argparse
import json
import sys
import urllib.error
import urllib.request

EXPECTED = {
    "strict-transport-security": ("high", "HSTS missing: browsers may use plain HTTP (add max-age≥15552000; includeSubDomains)"),
    "content-security-policy": ("high", "No Content-Security-Policy: XSS has no second line of defence"),
    "x-content-type-options": ("medium", "X-Content-Type-Options: nosniff missing"),
    "referrer-policy": ("low", "Referrer-Policy missing (use strict-origin-when-cross-origin)"),
    "permissions-policy": ("low", "Permissions-Policy missing (turn off camera, microphone, geolocation… if unused)"),
}
LEAKY = {"server": "Server header reveals the software", "x-powered-by": "X-Powered-By reveals the framework", "x-aspnet-version": "ASP.NET version exposed"}


def fetch(url: str, method: str = "GET", extra=None):
    req = urllib.request.Request(url, method=method, headers={"User-Agent": "software-audit/1.0", **(extra or {})})
    opener = urllib.request.build_opener(urllib.request.ProxyHandler(), NoRedirect())
    try:
        with opener.open(req, timeout=20) as r:
            return r.status, {k.lower(): v for k, v in r.headers.items()}, r.headers.get_all("Set-Cookie") or []
    except urllib.error.HTTPError as e:
        return e.code, {k.lower(): v for k, v in e.headers.items()}, e.headers.get_all("Set-Cookie") or []


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def audit(url: str, headers: dict, cookies: list, status: int):
    findings = []
    add = lambda sev, msg: findings.append({"url": url, "severity": sev, "finding": msg})
    html = "text/html" in headers.get("content-type", "") or not headers.get("content-type")
    for h, (sev, msg) in EXPECTED.items():
        if h in headers:
            continue
        if h == "content-security-policy" and not html:
            continue  # CSP protects documents; JSON and files don't need it
        if h == "strict-transport-security" and not url.startswith("https"):
            continue  # only meaningful over HTTPS; check the production URL
        add(sev, msg)
    csp = headers.get("content-security-policy", "")
    if not html:
        pass
    elif csp:
        if "'unsafe-inline'" in csp and "script-src" in csp and "nonce-" not in csp and "strict-dynamic" not in csp:
            add("medium", "CSP allows inline scripts without a nonce/hash")
        if "'unsafe-eval'" in csp:
            add("medium", "CSP allows 'unsafe-eval'")
        if "frame-ancestors" not in csp and "x-frame-options" not in headers:
            add("medium", "Clickjacking: no frame-ancestors in CSP and no X-Frame-Options")
        if "default-src *" in csp or "script-src *" in csp:
            add("high", "CSP allows scripts from any origin")
    elif "x-frame-options" not in headers:
        add("medium", "Clickjacking: no X-Frame-Options or CSP frame-ancestors")
    hsts = headers.get("strict-transport-security", "")
    if hsts and "max-age=" in hsts:
        try:
            if int(hsts.split("max-age=")[1].split(";")[0]) < 15552000:
                add("low", f"HSTS max-age below 180 days ({hsts})")
        except ValueError:
            pass
    for h, msg in LEAKY.items():
        if h in headers and any(c.isdigit() for c in headers[h]):
            add("low", f"{msg}: {headers[h]}")
    for c in cookies:
        name = c.split("=", 1)[0]
        low = c.lower()
        if url.startswith("https") and "secure" not in low:
            add("medium", f"Cookie {name} without Secure")
        if "httponly" not in low and any(k in name.lower() for k in ("sess", "auth", "token", "sb-")):
            add("medium", f"Session-like cookie {name} readable by JavaScript (no HttpOnly)")
        if "samesite" not in low:
            add("low", f"Cookie {name} without SameSite")
    acao = headers.get("access-control-allow-origin")
    if acao == "*" and headers.get("access-control-allow-credentials", "").lower() == "true":
        add("high", "CORS: any origin with credentials")
    elif acao == "*" and "/api" in url:
        add("low", "CORS open to any origin on an API route (fine only for public, non-personal data)")
    if status >= 500:
        add("high", f"Server error {status}")
    return findings


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("urls", nargs="*")
    ap.add_argument("--json")
    ap.add_argument("--headers-file", help="Pre-fetched headers, if the sandbox cannot reach the site")
    args = ap.parse_args()
    results = []
    if args.headers_file:
        data = json.load(open(args.headers_file))
        for url, hdrs in data.items():
            results += audit(url, {k.lower(): v for k, v in hdrs.items()}, [], 200)
    for url in args.urls:
        try:
            status, headers, cookies = fetch(url)
        except Exception as e:  # network or proxy refusal
            results.append({"url": url, "severity": "info", "finding": f"Could not fetch: {e}"})
            continue
        results += audit(url, headers, cookies, status)
        if url.startswith("https://"):
            try:
                s, h, _ = fetch("http://" + url[len("https://"):])
                if not (300 <= s < 400 and h.get("location", "").startswith("https://")):
                    results.append({"url": url, "severity": "medium", "finding": f"HTTP does not redirect to HTTPS (status {s})"})
            except Exception:
                pass
        if "/api" in url:
            try:
                s, h, _ = fetch(url, "OPTIONS", {"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"})
                if h.get("access-control-allow-origin") in ("*", "https://evil.example"):
                    results.append({"url": url, "severity": "medium", "finding": f"CORS preflight accepts a foreign origin ({h.get('access-control-allow-origin')})"})
            except Exception:
                pass
    order = {"high": 0, "medium": 1, "low": 2, "info": 3}
    results.sort(key=lambda r: (order.get(r["severity"], 9), r["url"]))
    if args.json:
        json.dump(results, open(args.json, "w"), indent=2)
    if not results:
        print("No header findings.")
    for r in results:
        print(f"[{r['severity'].upper()}] {r['url']} — {r['finding']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
