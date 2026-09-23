import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Short-lived URLs for covers and page previews stored in the private "products" bucket.
 * Only call with paths of products the member can already see listed (library or outline rows).
 */
export async function signedImageUrls(paths: (string | null | undefined)[], seconds = 3600): Promise<Map<string, string>> {
  const stored = [...new Set(paths.filter((p): p is string => !!p && !p.startsWith("builtin:")))];
  if (!stored.length) return new Map();
  const { data } = await createAdminClient().storage.from("products").createSignedUrls(stored, seconds);
  return new Map((data ?? []).flatMap((d) => (d.path && d.signedUrl ? [[d.path, d.signedUrl] as const] : [])));
}
