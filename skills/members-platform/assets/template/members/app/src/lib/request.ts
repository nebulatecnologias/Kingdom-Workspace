import { headers } from "next/headers";

/** Best-effort client IP for rate limiting (Vercel sets x-forwarded-for / x-real-ip). */
export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/** Only allow same-site relative paths as post-login destinations. */
export function safeNext(next: string | null | undefined, fallback = "/library") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

/** Where someone lands after signing in when no page asked for it. */
export function homeFor(role: string | null | undefined) {
  return role === "admin" ? "/admin" : "/library";
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
