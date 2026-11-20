import "server-only";
import { CARD_COLS } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { Card } from "@/lib/types";

export async function loadCard(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("cards").select(`${CARD_COLS}, card_participants(profile_id)`).eq("id", id).maybeSingle();
  return data as (Card & { card_participants: { profile_id: string }[] }) | null;
}
