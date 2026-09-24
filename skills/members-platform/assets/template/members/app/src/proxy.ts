import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Kept local: proxy runs separately from the app bundle.
const LOCALES = ["en", "pt", "es"];
const LOCALE_COOKIE = "km-locale";
const PROTECTED = ["/library", "/products", "/purchase", "/profile", "/admin", "/help"];

/**
 * Content Security Policy with a fresh nonce per request: Next.js adds it to its own scripts, and nothing
 * else may run. Styles allow inline attributes (the UI uses style props); images and API calls may also go
 * to Supabase (signed file URLs, uploads, two-step verification).
 */
function contentSecurityPolicy(nonce: string) {
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : "";
  const https = (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https:");
  const dev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${supabase}`.trim(),
    // Audio materials play from signed Supabase links; blob: lets the admin read an upload's length.
    `media-src 'self' blob: ${supabase}`.trim(),
    "font-src 'self'",
    `connect-src 'self' ${supabase}`.trim(),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(https ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

/**
 * Refreshes the Supabase session cookie on every page request and sends signed-out visitors
 * away from private areas. Role checks (admin) happen again on the server in requireAdmin().
 */
export async function proxy(request: NextRequest) {
  // Layouts cannot see the URL; this lets the admin layout send people back to the page they asked for.
  request.headers.set("x-km-path", request.nextUrl.pathname + request.nextUrl.search);
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = contentSecurityPolicy(nonce);
  request.headers.set("x-nonce", nonce);
  request.headers.set("Content-Security-Policy", csp);
  // Links in emails carry ?lang=xx so the page opens in the recipient's language.
  const lang = request.nextUrl.searchParams.get("lang");
  const langCookie = lang && LOCALES.includes(lang) ? lang : null;
  if (langCookie) request.cookies.set(LOCALE_COOKIE, langCookie);
  const withLang = (res: NextResponse) => {
    if (langCookie) res.cookies.set(LOCALE_COOKIE, langCookie, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    res.headers.set("Content-Security-Policy", csp);
    return res;
  };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return withLang(NextResponse.next({ request }));

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getClaims refreshes the session cookies like getUser, but checks the token locally when the project
  // signs with asymmetric keys, saving a round trip to the auth server on every navigation. This only
  // decides the redirect to sign in: pages and actions still check the user with the auth server.
  const { data } = await supabase.auth.getClaims();
  const path = request.nextUrl.pathname;
  if (!data?.claims && PROTECTED.some((p) => path === p || path.startsWith(p + "/"))) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = `?next=${encodeURIComponent(path + request.nextUrl.search)}`;
    return withLang(NextResponse.redirect(login));
  }
  return withLang(response);
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|email/|api/webhooks|api/cron|api/health|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|woff2?)$).*)",
      // Link prefetches skip the proxy (as the Next.js CSP guide recommends): they carry no page to protect
      // with a CSP, and checking the session on each one cost an auth-server round trip per link on screen.
      // The pages and layouts they render check the user themselves.
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
