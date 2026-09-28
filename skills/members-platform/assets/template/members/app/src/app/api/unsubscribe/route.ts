import { unsubscribeByToken } from "@/lib/curation";

/** One-click unsubscribe (RFC 8058): mail apps POST here from the List-Unsubscribe header. The token is the key. */
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("t") ?? "";
  const ok = await unsubscribeByToken(token);
  return new Response(null, { status: ok ? 200 : 404 });
}
