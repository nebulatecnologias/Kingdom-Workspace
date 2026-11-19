import "server-only";
import { CARD_COLS, type Base, profileOf } from "@/lib/data";
import { dayKey, localTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Card, Minutes, Profile } from "@/lib/types";

export const MINUTES_COLS = "*";

export async function loadMinutes(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("minutes").select(`${MINUTES_COLS}, cards(${CARD_COLS})`).eq("id", id).maybeSingle();
  return data as (Minutes & { cards: Card }) | null;
}

/** Form values: an existing ata, or a new one pre-filled from its meeting (plan §6). */
export function minutesDraft(base: Base, card: Card & { card_participants?: { profile_id: string }[] }, me: Profile, m?: Minutes | null) {
  if (m) {
    return {
      id: m.id, card_id: m.card_id, title: m.title ?? card.title, held_at: m.held_at ?? "", started_at: (m.started_at ?? "").slice(0, 5), ended_at: (m.ended_at ?? "").slice(0, 5),
      location: m.location ?? "", attendees: m.attendees, agenda: m.agenda.length ? m.agenda : [{ topic: "", summary: "" }],
      decisions: m.decisions.length ? m.decisions : [{ text: "" }], actions: m.actions.length ? m.actions : [{ what: "", who: "", due: "", status: "pending" as const }],
      next_steps: m.next_steps ?? "", next_meeting_date: m.next_meeting_at ? dayKey(m.next_meeting_at) : "", next_meeting_time: m.next_meeting_at ? localTime(m.next_meeting_at) : "",
      approved_by: m.approved_by ?? "",
    };
  }
  const owner = profileOf(base, card.owner_id);
  const parts = (card.card_participants ?? []).map((p) => profileOf(base, p.profile_id)).filter((p): p is Profile => !!p && p.id !== owner?.id);
  return {
    id: null, card_id: card.id, title: card.title,
    held_at: card.starts_at ? dayKey(card.starts_at) : dayKey(new Date()), started_at: card.starts_at ? localTime(card.starts_at) : "", ended_at: card.ends_at ? localTime(card.ends_at) : "",
    location: card.location_kind === "online" ? "Online" : card.location_kind === "phone" ? "Chamada" : (card.location ?? ""),
    attendees: [
      ...(card.contact_name ? [{ name: card.contact_name, org: card.company_name ?? "", role: card.contact_role ?? "", present: true }] : []),
      ...(owner ? [{ name: owner.full_name, org: "Kingdom", role: owner.job_title ?? "", present: true }] : []),
      ...parts.map((p) => ({ name: p.full_name, org: "Kingdom", role: p.job_title ?? "", present: true })),
    ],
    agenda: [{ topic: "", summary: "" }], decisions: [{ text: "" }],
    actions: [{ what: "", who: owner?.full_name ?? me.full_name, due: "", status: "pending" as const }],
    next_steps: "", next_meeting_date: "", next_meeting_time: "", approved_by: "",
  };
}
