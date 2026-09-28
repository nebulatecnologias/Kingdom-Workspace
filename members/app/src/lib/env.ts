import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serverSchema = publicSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

function parse<T extends z.ZodType>(schema: T, values: Record<string, string | undefined>): z.infer<T> {
  const result = schema.safeParse(values);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Missing or invalid environment variables: ${missing}. See members/app/.env.example.`);
  }
  return result.data;
}

/** Variables safe to expose to the browser. Read lazily so builds without credentials still work. */
export function publicEnv() {
  return parse(publicSchema, {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

/** Server-only variables (never import from client components). */
export function serverEnv() {
  return parse(serverSchema, { ...process.env });
}

export function hasSupabase() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
