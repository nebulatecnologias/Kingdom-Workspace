/**
 * Creates (or activates) a team account. Run by an admin with the secret key in .env.local:
 *
 *   npm run user:create -- --email ana@kingdom.co.mz --name "Ana Cossa" --password "..." [--role admin|member]
 *                          [--job "Diretora"] [--whatsapp "+258 84 000 0000"]
 *
 * If a profile with the same --name already exists (the seed creates the team with placeholder emails),
 * that account gets the real email and password instead of a new one.
 */
import { createClient } from "@supabase/supabase-js";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    email: { type: "string" },
    name: { type: "string" },
    password: { type: "string" },
    role: { type: "string", default: "member" },
    job: { type: "string" },
    whatsapp: { type: "string" },
  },
});

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local (vercel env pull .env.local).");
  const email = values.email?.trim().toLowerCase();
  const name = values.name?.trim();
  const password = values.password ?? "";
  if (!email || !name) throw new Error('Usage: npm run user:create -- --email x@y --name "Full Name" --password "..." [--role admin]');
  if (password.length < 8) throw new Error("--password must have at least 8 characters.");
  if (values.role !== "admin" && values.role !== "member") throw new Error("--role must be admin or member.");

  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: existing } = await admin.from("profiles").select("id").eq("full_name", name).maybeSingle();

  let id: string;
  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, { email, password, email_confirm: true, user_metadata: { full_name: name } });
    if (error) throw error;
    id = existing.id;
    console.log(`Updated the existing account of ${name}.`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: name } });
    if (error || !data.user) throw error ?? new Error("createUser failed");
    id = data.user.id;
    console.log(`Created an account for ${name}.`);
  }
  const patch: Record<string, unknown> = { full_name: name, role: values.role, active: true };
  if (values.job) patch.job_title = values.job;
  if (values.whatsapp) patch.phone_whatsapp = values.whatsapp;
  const { error: pErr } = await admin.from("profiles").update(patch).eq("id", id);
  if (pErr) throw pErr;
  console.log(`${email} can now sign in (${values.role}).`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
