"use server";

import { redirect } from "next/navigation";
import { unsubscribeByToken } from "@/lib/curation";

export async function confirmUnsubscribe(fd: FormData) {
  const token = String(fd.get("t") ?? "");
  const ok = await unsubscribeByToken(token);
  redirect(`/unsubscribe?${ok ? "done=1" : "invalid=1"}`);
}
