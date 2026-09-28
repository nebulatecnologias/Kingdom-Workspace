import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProductComment = { id: string; author: string; body: string; createdAt: string; mine: boolean; pending: boolean };

/** "Thandi Mokoena" -> "Thandi M.": other members see a first name and an initial, never an email. */
export function publicName(fullName: string | null | undefined) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.` : parts[0];
}

/** Approved comments on a product, plus the member's own ones still waiting for review. Newest first. */
export async function productComments(productId: string, userId: string, limit = 50): Promise<ProductComment[]> {
  const { data } = await createAdminClient()
    .from("product_comments")
    .select("id, body, created_at, status, user_id, author:profiles!product_comments_user_id_fkey(full_name)")
    .eq("product_id", productId)
    .or(`status.eq.approved,and(status.eq.pending,user_id.eq.${userId})`)
    .order("created_at", { ascending: false })
    .limit(limit);
  return ((data ?? []) as unknown as { id: string; body: string; created_at: string; status: string; user_id: string; author: { full_name: string } | null }[]).map((c) => ({
    id: c.id,
    author: publicName(c.author?.full_name),
    body: c.body,
    createdAt: c.created_at,
    mine: c.user_id === userId,
    pending: c.status === "pending",
  }));
}
