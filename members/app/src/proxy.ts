import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Kept local: proxy runs separately from the app bundle.
const LOCALES = ["en", "pt", "es"];
const LOCALE_COOKIE = "km-locale";
const PROTECTED = ["/library", "/products", "/profile", "/admin", "/help"];

/**
 * Refreshes the Supabase session cookie on every page request and sends signed-out visitors
 * away from private areas. Role checks (admin) happen again on the server in requireAdmin().
 */
export async function proxy(request: NextRequest) {
  // Layouts cannot see the URL; this lets the admin layout send people back to the page they asked for.
  request.headers.set("x-km-path", request.nextUrl.pathname + request.nextUrl.search);
  // Links in emails carry ?lang=xx so the page opens in the recipient's language.
  const lang = request.nextUrl.searchParams.get("lang");
  const langCookie = lang && LOCALES.includes(lang) ? lang : null;
  if (langCookie) request.cookies.set(LOCALE_COOKIE, langCookie);
  const withLang = (res: NextResponse) => {
    if (langCookie) res.cookies.set(LOCALE_COOKIE, langCookie, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
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

  const { data } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  if (!data.user && PROTECTED.some((p) => path === p || path.startsWith(p + "/"))) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = `?next=${encodeURIComponent(path + request.nextUrl.search)}`;
    return withLang(NextResponse.redirect(login));
  }
  return withLang(response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|email/|api/webhooks|api/cron|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|woff2?)$).*)"],
};
