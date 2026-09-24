import type { NextRequest } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Polled by the checkout return page: has the payment for this product reached the member's account yet?
 * Answers only about the signed-in member, through their own session.
 */
export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("product") ?? "";
  const headers = { "Cache-Control": "private, no-store" };
  if (!UUID.test(productId)) return Response.json({ error: "not found" }, { status: 404, headers });
  const profile = await getProfile();
  if (!profile || profile.status !== "active") return Response.json({ error: "sign in" }, { status: 401, headers });
  const { data, error } = await (await createClient()).rpc("has_access", { p_product_id: productId });
  if (error) return Response.json({ error: "unavailable" }, { status: 503, headers });
  return Response.json({ owned: data === true }, { headers });
}
