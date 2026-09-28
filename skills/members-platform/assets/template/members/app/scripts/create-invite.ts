/**
 * Creates (or refreshes) an invite and emails it — the same code path the admin and the gateway use.
 *
 *   npm run invite:create -- --email thandi@example.co.za --name "Thandi Mokoena" --products noah,money --locale en
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (reads .env.local).
 * Options: --ttl-days N (use a negative number to create an already-expired invite for testing), --json.
 */
import { parseArgs } from "node:util";
import { isLocale } from "../src/i18n/config";
import { issueInvite } from "../src/lib/invites";
import { createAdminClient } from "../src/lib/supabase/admin";

async function main() {
  const { values } = parseArgs({
    options: {
      email: { type: "string" },
      name: { type: "string", default: "" },
      products: { type: "string", default: "" },
      locale: { type: "string", default: "en" },
      "ttl-days": { type: "string" },
      json: { type: "boolean", default: false },
    },
  });
  if (!values.email) throw new Error("--email is required");
  if (values["ttl-days"]) process.env.INVITE_TTL_DAYS = values["ttl-days"];
  const slugs = values.products.split(",").map((s) => s.trim()).filter(Boolean);
  const { data: products, error } = await createAdminClient().from("products").select("id, slug").in("slug", slugs.length ? slugs : ["-"]);
  if (error) throw new Error(error.message);
  const missing = slugs.filter((s) => !products?.some((p) => p.slug === s));
  if (missing.length) throw new Error(`Unknown product slugs: ${missing.join(", ")}`);

  const ttl = Number(process.env.INVITE_TTL_DAYS ?? 7);
  const result = await issueInvite({
    email: values.email,
    fullName: values.name,
    locale: isLocale(values.locale) ? values.locale : "en",
    productIds: (products ?? []).map((p) => p.id),
    source: "manual",
    expiresInDays: ttl,
  });
  if (values.json) console.log(JSON.stringify(result));
  else console.log(`Invite for ${values.email}: ${result.url}\nExpires: ${result.expiresAt.toISOString()}\nEmailed: ${result.emailed}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
