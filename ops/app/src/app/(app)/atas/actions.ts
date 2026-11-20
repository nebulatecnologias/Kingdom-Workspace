"use server";

import { revalidatePath } from "next/cache";
import { requireMember } from "@/lib/auth";
import { dayKey, fmtDayShort, toIso } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { ActionItem } from "@/lib/types";
import { z } from "@/lib/zod";

const s = (max = 500) => z.string().trim().max(max, `Máximo de ${max} caracteres`).default("");
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal(""));
const schema = z.object({
  id: z.string().uuid().nullable(),
  card_id: z.string().uuid(),
  status: z.enum(["draft", "final"]),
  reopen: z.boolean().optional(),
  title: z.string().trim().min(1, "Dê um título à ata.").max(200, "Máximo de 200 caracteres"),
  held_at: day,
  started_at: z.string().regex(/^\d{2}:\d{2}/).or(z.literal("")),
  ended_at: z.string().regex(/^\d{2}:\d{2}/).or(z.literal("")),
  location: s(),
  attendees: z.array(z.object({ name: s(160), org: s(160), role: s(160), present: z.boolean() })).max(60),
  agenda: z.array(z.object({ topic: s(300), summary: s(5000) })).max(60),
  decisions: z.array(z.object({ text: s(1000) })).max(60),
  actions: z.array(z.object({ what: s(500), who: s(160), due: day, status: z.enum(["pending", "done"]) })).max(60),
  next_steps: s(5000),
  next_meeting_date: day,
  next_meeting_time: z.string().regex(/^\d{2}:\d{2}$/).or(z.literal("")),
  approved_by: z.string().uuid().or(z.literal("")),
});

export type MinutesInput = z.input<typeof schema>;
export type SaveMinutesResult =
  | { ok: true; id: string; askConclude: boolean }
  | { ok: false; error: string; field?: string; needsReopen?: boolean };

const DB_ERRORS: [string, string, string?][] = [
  ["duplicate", "Esta reunião já tem ata."],
  ["only_author", "Só quem redigiu, o responsável da reunião ou um admin pode marcar como final."],
  ["minutes_final_locked", "Esta ata é final. Só um admin a pode alterar."],
  ["minutes_incomplete", "Para marcar como final, escreva pelo menos um tópico e escolha quem aprova.", "approved_by"],
  ["minutes_time_order", "A hora de fim tem de ser depois da hora de início.", "ended_at"],
];

export async function saveMinutes(input: MinutesInput): Promise<SaveMinutesResult> {
  await requireMember();
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, error: i.path[0] === "title" ? i.message : `Reveja os campos da ata: ${i.message}`, field: String(i.path[0]) };
  }
  const d = parsed.data;
  const today = dayKey(new Date());

  // #43 Times in order.
  if (d.started_at && d.ended_at && d.ended_at.slice(0, 5) <= d.started_at.slice(0, 5)) {
    return { ok: false, error: "A hora de fim tem de ser depois da hora de início.", field: "ended_at" };
  }
  // #11 #46 Each action says what and who; nothing is dropped silently.
  for (const [i, a] of d.actions.entries()) {
    // "Quem" alone is the pre-filled blank row; a deadline without a description is a real action missing its text.
    if (a.due && !a.what) return { ok: false, error: `Descreva a ação ${i + 1} ou remova a linha.`, field: `actions.${i}.what` };
    if (a.what && !a.who) return { ok: false, error: `Indique quem faz a ação ${i + 1}.`, field: `actions.${i}.who` };
  }
  // #45 The next meeting is after this one and not in the past.
  if (d.next_meeting_date) {
    if (d.next_meeting_date < today) return { ok: false, error: "A próxima reunião tem de ser hoje ou depois.", field: "next_meeting_date" };
    if (d.held_at && d.next_meeting_date < d.held_at) return { ok: false, error: "A próxima reunião tem de ser depois desta.", field: "next_meeting_date" };
  }
  const agenda = d.agenda.filter((a) => a.topic || a.summary);
  if (agenda.some((a) => !a.topic)) return { ok: false, error: "Cada ponto da ordem de trabalhos precisa de um tópico.", field: "agenda" };
  // #9 A final ata has at least one topic and an approver.
  if (d.status === "final") {
    if (!agenda.length) return { ok: false, error: "Para marcar como final, escreva pelo menos um tópico na ordem de trabalhos.", field: "agenda" };
    if (!d.approved_by) return { ok: false, error: "Para marcar como final, escolha quem aprova a ata.", field: "approved_by" };
  }

  const supabase = await createClient();
  // #10 Saving a final ata as a draft reopens it: only after an explicit confirmation.
  if (d.id && d.status === "draft" && !d.reopen) {
    const { data: cur } = await supabase.from("minutes").select("status").eq("id", d.id).maybeSingle();
    if (cur?.status === "final") return { ok: false, error: "Esta ata já é final.", needsReopen: true };
  }

  const row = {
    card_id: d.card_id,
    status: d.status,
    title: d.title,
    held_at: d.held_at || null,
    started_at: d.started_at || null,
    ended_at: d.ended_at || null,
    location: d.location || null,
    attendees: d.attendees.filter((a) => a.name),
    agenda,
    decisions: d.decisions.filter((x) => x.text),
    actions: d.actions.filter((a) => a.what),
    next_steps: d.next_steps || null,
    next_meeting_at: d.next_meeting_date ? toIso(d.next_meeting_date, d.next_meeting_time || "09:00") : null,
    approved_by: d.approved_by || null,
  };
  const res = d.id
    ? await supabase.from("minutes").update(row).eq("id", d.id).select("id").single()
    : await supabase.from("minutes").insert(row).select("id").single();
  if (res.error || !res.data) {
    const known = DB_ERRORS.find(([code]) => res.error?.message.includes(code));
    if (known) return { ok: false, error: known[1], field: known[2] };
    return { ok: false, error: "Não foi possível guardar a ata. Tente outra vez." };
  }
  let askConclude = false;
  if (d.status === "final") {
    const { data: card } = await supabase.from("cards").select("starts_at, pipeline_stages!cards_stage_id_fkey(is_done, is_lost)").eq("id", d.card_id).single();
    const st = card?.pipeline_stages as unknown as { is_done: boolean; is_lost: boolean } | null;
    askConclude = !!card && !st?.is_done && !st?.is_lost && !!card.starts_at && new Date(card.starts_at as string).getTime() <= Date.now();
  }
  revalidatePath("/", "layout");
  return { ok: true, id: res.data.id as string, askConclude };
}

/** "Concluir reunião": moves the meeting to its done stage (the stage rules in SQL still apply). */
export async function concludeMeeting(cardId: string): Promise<{ ok: boolean; error?: string }> {
  await requireMember();
  const supabase = await createClient();
  const { data: card } = await supabase.from("cards").select("pipeline_id").eq("id", cardId).single();
  if (!card) return { ok: false, error: "Reunião não encontrada." };
  const { data: done } = await supabase.from("pipeline_stages").select("id").eq("pipeline_id", card.pipeline_id).eq("is_done", true).order("position").limit(1).single();
  if (!done) return { ok: false, error: "Este pipeline não tem etapa de concluído." };
  const { error } = await supabase.rpc("move_card", { p_card_id: cardId, p_stage_id: done.id });
  revalidatePath("/", "layout");
  if (error?.message.includes("meeting_not_started")) return { ok: false, error: "A reunião ainda não começou." };
  if (error?.message.includes("reopen_first")) return { ok: false, error: "A reunião foi cancelada. Reabra-a antes de a concluir." };
  return error ? { ok: false, error: "Não foi possível concluir." } : { ok: true };
}

/** #1 Delete an ata: admins, or whoever wrote it while it is a draft (enforced by RLS). */
export async function deleteMinutes(id: string): Promise<{ ok: true; back: string } | { ok: false; error: string }> {
  await requireMember();
  const supabase = await createClient();
  const { data: m } = await supabase.from("minutes").select("card_id").eq("id", id).maybeSingle();
  if (!m) return { ok: false, error: "Ata não encontrada." };
  const { data, error } = await supabase.from("minutes").delete().eq("id", id).select("id");
  if (error || !data?.length) return { ok: false, error: "Só um admin, ou quem redigiu um rascunho, pode apagar esta ata." };
  revalidatePath("/", "layout");
  return { ok: true, back: `/cards/${m.card_id}?tab=ata` };
}

/** #44 Turn an action of an ata into a task (once), so it is followed up in the Tarefas pipeline. */
export async function createTaskFromAction(minutesId: string, index: number): Promise<{ ok: true; cardId: string } | { ok: false; error: string }> {
  const me = await requireMember();
  const supabase = await createClient();
  const { data: m } = await supabase.from("minutes").select("id, title, held_at, actions").eq("id", minutesId).maybeSingle();
  const action = (m?.actions as ActionItem[] | undefined)?.[index];
  if (!m || !action?.what) return { ok: false, error: "Ação não encontrada." };
  const source = `${minutesId}:${index}`;
  const { data: existing } = await supabase.from("cards").select("id").eq("fields->>source_action", source).is("archived_at", null).maybeSingle();
  if (existing) return { ok: true, cardId: existing.id as string };
  const { data: tasks } = await supabase.from("pipelines").select("id").eq("kind", "tasks").is("archived_at", null).order("position").limit(1).maybeSingle();
  if (!tasks) return { ok: false, error: "Não há um pipeline de Tarefas." };
  const { data: people } = await supabase.from("profiles").select("id, full_name").eq("active", true);
  const owner = (people ?? []).find((p) => p.full_name.toLowerCase() === action.who.trim().toLowerCase())?.id ?? me.id;
  const { data, error } = await supabase
    .from("cards")
    .insert({
      pipeline_id: tasks.id,
      title: action.what.slice(0, 200),
      owner_id: owner,
      due_at: action.due ? toIso(action.due, "12:00") : null,
      description: `Ação da ata "${m.title}"${m.held_at ? ` (${fmtDayShort(m.held_at as string)})` : ""}. Responsável indicado: ${action.who}.`,
      fields: { source_action: source, source_minutes: minutesId },
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: "Não foi possível criar a tarefa." };
  revalidatePath("/", "layout");
  return { ok: true, cardId: data.id as string };
}
