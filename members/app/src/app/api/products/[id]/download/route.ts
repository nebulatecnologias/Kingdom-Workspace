import type { NextRequest } from "next/server";
import { artSvgDocument, isBuiltinArt } from "@/lib/art";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const text = (body: string, status: number) => new Response(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });

/**
 * Downloads: ?format=pdf|epub for the whole product, ?page=<n> for one colouring page.
 * Access is checked with the member's own session first; only then is a 60-second signed URL issued.
 * Typing the URL directly without access gets 403, and without a session 401.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/products/[id]/download">) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return text("Not found", 404);
  const profile = await getProfile();
  if (!profile || profile.status !== "active") return text("Sign in to download.", 401);

  const supabase = await createClient();
  const { data: allowed, error } = await supabase.rpc("has_access", { p_product_id: id });
  if (error) return text("Something went wrong. Please try again.", 500);
  if (!allowed) return text("You don’t have access to this product.", 403);

  const admin = createAdminClient();
  const { data: product } = await admin.from("products").select("slug").eq("id", id).single();
  const slug = product?.slug ?? "product";
  const locales = [profile.locale, "en"];
  const params = request.nextUrl.searchParams;
  const signed = async (path: string, filename: string) => {
    const { data, error: signError } = await admin.storage.from("products").createSignedUrl(path, 60, { download: filename });
    if (signError || !data) return text("This file is not available yet.", 404);
    return Response.redirect(data.signedUrl, 302);
  };

  const pageParam = params.get("page");
  if (pageParam) {
    const position = Number(pageParam);
    if (!Number.isInteger(position) || position < 1) return text("Not found", 404);
    const { data: pages } = await admin
      .from("product_pages")
      .select("locale, title, pdf_path, lineart_path")
      .eq("product_id", id)
      .eq("position", position);
    const page =
      (pages ?? []).find((p) => p.locale === profile.locale) ?? (pages ?? []).find((p) => p.locale === null) ?? (pages ?? []).find((p) => p.locale === "en");
    if (!page) return text("Not found", 404);
    if (page.pdf_path) return signed(page.pdf_path, `${slug}-page-${position}.pdf`);
    if (isBuiltinArt(page.lineart_path)) {
      return new Response(artSvgDocument(page.lineart_path.slice(8), page.title), {
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Content-Disposition": `attachment; filename="${slug}-page-${position}.svg"`,
          "Cache-Control": "private, no-store",
        },
      });
    }
    if (page.lineart_path) return signed(page.lineart_path, `${slug}-page-${position}${page.lineart_path.slice(page.lineart_path.lastIndexOf("."))}`);
    return text("This file is not available yet.", 404);
  }

  const format = params.get("format") ?? "pdf";
  if (format !== "pdf" && format !== "epub") return text("Not found", 404);
  const { data: files } = await admin.from("product_files").select("locale, path").eq("product_id", id).eq("format", format).in("locale", locales);
  const file = (files ?? []).find((f) => f.locale === profile.locale) ?? (files ?? [])[0];
  if (!file) return text("This file is not available yet.", 404);
  return signed(file.path, `${slug}-${file.locale}.${format}`);
}
