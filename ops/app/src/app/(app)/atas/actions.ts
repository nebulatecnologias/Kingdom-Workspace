"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireMember } from "@/lib/auth";
import { toIso } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

const s = (max = 500) => z.string().trim().max(max).default("");
const schema = z.object({
  id: z.string().uuid().nullable(),
  card_id: z.string().uuid(),
  status: z.enum(["draft", "final"]),
  title: z.string().trim().min(1, "Campo obrigatório").max(200),
  held_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")),
  started_at: z.string().regex(/^\d{2}:\d{2}/).or(z.literal("")),
  ended_at: z.string().regex(/^\d{2}:\d{2}/).or(z.literal("")),
  location: s(),
  attendees: z.array(z.object({ name: s(160), org: s(160), role: s(160), present: z.boolean() })).max(60),
  agenda: z.array(z.object({ topic: s(300), summary: s(5000) })).max(60),
  decisions: z.array(z.object({ text: s(1000) })).max(60),
  actions: z.array(z.object({ what: s(500), who: s(160), due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")), status: z.enum(["pending", "done"]) })).max(60),
  next_steps: s(5000),
  next_meeting_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")),
  next_meeting_time: z.string().regex(/^\d{2}:\d{2}$/).or(z.literal("")),
  approved_by: z.string().uuid().or(z.literal("")),
});

export type MinutesInput = z.input<typeof schema>;
export type SaveMinutesResult = { ok: true; id: string; askConclude: boolean } | { ok: false; error: string; field?: string };

export async function saveMinutes(input: MinutesInput): Promise<SaveMinutesResult> {
  await requireMember();
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, error: i.path[0] === "title" ? "Dê um título à ata." : "Reveja os campos da ata.", field: String(i.path[0]) };
  }
  const d = parsed.data;
  const row = {
    card_id: d.card_id,
    status: d.status,
    title: d.title,
    held_at: d.held_at || null,
    started_at: d.started_at || null,
    ended_at: d.ended_at || null,
    location: d.location || null,
    attendees: d.attendees.filter((a) => a.name),
    agenda: d.agenda.filter((a) => a.topic || a.summary),
    decisions: d.decisions.filter((x) => x.text),
    actions: d.actions.filter((a) => a.what),
    next_steps: d.next_steps || null,
    next_meeting_at: d.next_meeting_date ? toIso(d.next_meeting_date, d.next_meeting_time || "09:00") : null,
    approved_by: d.approved_by || null,
  };
  const supabase = await createClient();
  const res = d.id
    ? await supabase.from("minutes").update(row).eq("id", d.id).select("id").single()
    : await supabase.from("minutes").insert(row).select("id").single();
  if (res.error || !res.data) {
    if (res.error?.message.includes("duplicate")) return { ok: false, error: "Esta reunião já tem ata." };
    if (res.error?.message.includes("only_author")) return { ok: false, error: "Só quem redigiu, o responsável da reunião ou um admin pode marcar como final." };
    return { ok: false, error: "Não foi possível guardar a ata. Tente outra vez." };
  }
  let askConclude = false;
  if (d.status === "final") {
    const { data: card } = await supabase.from("cards").select("stage_id, pipeline_stages!cards_stage_id_fkey(is_done)").eq("id", d.card_id).single();
    const st = card?.pipeline_stages as unknown as { is_done: boolean } | null;
    askConclude = !!card && !st?.is_done;
  }
  revalidatePath("/", "layout");
  return { ok: true, id: res.data.id as string, askConclude };
}

/** "Concluir reunião": moves the meeting to its done stage. */
export async function concludeMeeting(cardId: string) {
  await requireMember();
  const supabase = await createClient();
  const { data: card } = await supabase.from("cards").select("pipeline_id").eq("id", cardId).single();
  if (!card) return { ok: false };
  const { data: done } = await supabase.from("pipeline_stages").select("id").eq("pipeline_id", card.pipeline_id).eq("is_done", true).order("position").limit(1).single();
  if (!done) return { ok: false };
  const { error } = await supabase.rpc("move_card", { p_card_id: cardId, p_stage_id: done.id });
  revalidatePath("/", "layout");
  return { ok: !error };
}
