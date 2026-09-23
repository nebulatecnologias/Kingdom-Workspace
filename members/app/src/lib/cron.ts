import "server-only";
import { timingSafeEqual } from "node:crypto";

/** Vercel Cron calls with `Authorization: Bearer <CRON_SECRET>`. Without CRON_SECRET the jobs stay closed. */
export function isCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
