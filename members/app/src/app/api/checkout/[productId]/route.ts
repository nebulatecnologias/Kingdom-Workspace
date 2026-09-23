import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { getProfile } from "@/lib/auth";
import { siteUrl } from "@/lib/request";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The padlock: sends a member to the product's checkout on the gateway, with their details and member id,
 * so the payment unlocks this account even if they type another email at checkout (metadata.member_user_id).
 */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/checkout/[productId]">) {
  const { productId } = await ctx.params;
  if (!UUID.test(productId)) redirect("/library");
  const profile = await getProfile();
  if (!profile || profile.status !== "active") redirect(`/login?next=${encodeURIComponent(`/api/checkout/${productId}`)}`);

  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("id, slug, visibility, checkout_url").eq("id", productId).maybeSingle();
  if (!product) redirect("/library");
  const { data: owned } = await supabase.rpc("has_access", { p_product_id: product.id });
  if (owned) redirect(`/products/${product.slug}`);

  let target: URL | null = null;
  try {
    target = product.checkout_url ? new URL(product.checkout_url) : null;
  } catch {
    target = null;
  }
  const safe = target && (target.protocol === "https:" || target.hostname === "localhost");
  if (product.visibility !== "visible" || !target || !safe) redirect(`/products/${product.slug}?checkout=unavailable`);

  target.searchParams.set("email", profile.email);
  if (profile.fullName) target.searchParams.set("name", profile.fullName);
  target.searchParams.set("locale", profile.locale);
  target.searchParams.set("ref", profile.id);
  target.searchParams.set("return_url", `${siteUrl()}/products/${product.slug}?purchase=return`);
  redirect(target.toString());
}
