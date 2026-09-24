import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

export const admin = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

export const uniqueEmail = (tag: string) => `e2e+${tag}-${Date.now()}-${Math.floor(Math.random() * 1e4)}@example.co.za`;

/**
 * All tests come from one IP, so a long run would trip the real rate limits (10 invite acceptances per 15 minutes).
 * Tests that sign up call this first; the limits themselves stay on.
 */
export async function resetRateLimits() {
  await admin().from("rate_limits").delete().neq("key", "");
}

/** Creates an invite through the real code path (scripts/create-invite.ts) and returns its link. */
export function createInvite(opts: { email: string; name?: string; products?: string[]; locale?: string; ttlDays?: number }) {
  const args = ["run", "-s", "invite:create", "--", "--email", opts.email, "--name", opts.name ?? "Thandi Test", "--products", (opts.products ?? ["noah", "money"]).join(","), "--locale", opts.locale ?? "en", "--json"];
  if (opts.ttlDays !== undefined) args.push(`--ttl-days=${opts.ttlDays}`); // "=" form: a negative value would otherwise read as an option
  const out = execFileSync("npm", args, { encoding: "utf8", env: process.env });
  const line = out.trim().split("\n").filter((l) => l.startsWith("{")).pop()!;
  return JSON.parse(line) as { url: string; inviteId: string };
}

/** Latest link emailed to an address (dev mailbox mode stores links in email_log). */
export async function latestLink(to: string, template: "invite" | "signin" | "reset", after?: Date) {
  for (let i = 0; i < 20; i++) {
    let q = admin().from("email_log").select("payload, created_at").eq("to_email", to).eq("template", template).order("created_at", { ascending: false }).limit(1);
    if (after) q = q.gt("created_at", after.toISOString());
    const { data } = await q;
    const link = (data?.[0]?.payload as { link?: string } | undefined)?.link;
    if (link) return link;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`No ${template} email for ${to}`);
}
