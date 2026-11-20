"use server";

import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { requireMember } from "@/lib/auth";
import { dayKey, fmtDayShort, fmtSpan, localTime, toIso } from "@/lib/format";
import { normalizePhone, PHONE_ERROR } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";
import { z } from "@/lib/zod";

export type CardFormState = { errors?: Record<string, string>; message?: string; warnings?: string[] };

const REQUIRED = "Campo obrigatório";
const MAX_MZN = 1_000_000_000; // a thousand million meticais: anything above is a typo (#17)
const maxMsg = (n: number) => `Máximo de ${n} caracteres`;
const opt = (max = 200) => z.string().trim().max(max, maxMsg(max)).optional().transform((v) => (v ? v.replace(/\s+/g, " ") : null));

const schema = z.object({
  id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  pipeline_id: z.string().uuid(),
  kind: z.enum(["meetings", "sales", "projects", "campaigns", "tasks", "custom"]),
  title: z.string().trim().min(1, REQUIRED).max(200, maxMsg(200)),
  owner_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  date: z.string().optional(),
  time: z.string().optional(),
  duration: z.coerce.number().int().min(5).max(12 * 60, "A reunião tem de durar menos de 12 horas").optional(),
  location_kind: z.enum(["in_person", "online", "phone"]).optional(),
  location: opt(500),
  contact_name: opt(),
  contact_role: opt(),
  contact_phone: opt(40),
  contact_email: z.string().trim().max(254, maxMsg(254)).optional().transform((v) => (v ? v : null)).pipe(z.email("Email inválido").nullable()),
  company_name: opt(),
  company_tax_id: opt(40),
  company_sector: opt(),
  value: z.string().optional(),
  due: z.string().optional(),
  description: z.string().trim().max(5000, maxMsg(5000)).optional().transform((v) => (v ? v : null)),
  channel: opt(60),
  confirm: z.string().optional(),
});

const dateRe = /^\d{4}-\d{2}-\d{2}$/;
const timeRe = /^\d{2}:\d{2}$/;

export async function saveCard(_prev: CardFormState, formData: FormData): Promise<CardFormState> {
  await requireMember();
  const raw = Object.fromEntries([...formData.entries()].filter(([k]) => k !== "participants").map(([k, v]) => [k, String(v)]));
  const parsed = schema.safeParse(raw);
  const errors: Record<string, string> = {};
  if (!parsed.success) {
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { errors };
  }
  const d = parsed.data;
  const meeting = d.kind === "meetings";
  const supabase = await createClient();
  const today = dayKey(new Date());

  if (meeting) {
    if (!d.date || !dateRe.test(d.date)) errors.date = REQUIRED;
    if (!d.time || !timeRe.test(d.time)) errors.time = REQUIRED;
    if (d.location_kind === "online" && d.location && !/^https?:\/\//.test(d.location)) errors.location = "Use um link que comece por https://";
  }
  // Whole meticais only, within a sane range (#17).
  let valueNum: number | null = null;
  if (d.value && d.value.trim()) {
    const v = d.value.replace(/\s/g, "").replace(",", ".");
    valueNum = Number(v);
    if (!Number.isFinite(valueNum) || valueNum < 0) errors.value = "Valor inválido";
    else if (!Number.isInteger(valueNum)) errors.value = "Use um valor inteiro em MZN (sem centavos)";
    else if (valueNum > MAX_MZN) errors.value = "Valor demasiado alto. Máximo: 1 000 000 000 MZN";
  }
  if (d.due && !dateRe.test(d.due)) errors.due = "Data inválida";
  const phone = normalizePhone(d.contact_phone);
  if (!phone.ok) errors.contact_phone = PHONE_ERROR;

  // The card as it is now (edits): its stage and due date.
  const { data: current } = d.id
    ? await supabase.from("cards").select("due_at, pipeline_stages!cards_stage_id_fkey(is_done)").eq("id", d.id).maybeSingle()
    : { data: null };
  const currentDone = !!(current?.pipeline_stages as unknown as { is_done: boolean } | null)?.is_done;
  // #40 A won opportunity keeps its value.
  if (d.kind === "sales" && currentDone && !valueNum) errors.value = "Uma oportunidade ganha precisa de valor.";
  if (Object.keys(errors).length) return { errors };

  const startsAt = meeting ? toIso(d.date!, d.time) : null;
  const endsAt = meeting ? new Date(new Date(startsAt!).getTime() + (d.duration ?? 60) * 60000).toISOString() : null;
  const participants = formData.getAll("participants").map(String).filter((p) => p && p !== d.owner_id);

  // #39 Same company, same spelling: reuse the name already in use.
  let company = d.company_name;
  if (company) {
    const { data: same } = await supabase.from("cards").select("company_name").ilike("company_name", company.replace(/[%_\\]/g, "\\$&")).limit(1);
    if (same?.[0]?.company_name) company = same[0].company_name as string;
  }

  // Warnings the person confirms with "Guardar mesmo assim": overlapping meetings (#5), dates in the past (#16).
  if (d.confirm !== "1") {
    const warnings: string[] = [];
    if (meeting && startsAt && endsAt) {
      const people = [d.owner_id, ...participants].filter(Boolean) as string[];
      const { data: overlap } = await supabase
        .from("cards")
        .select("id, title, owner_id, starts_at, ends_at, card_participants(profile_id), pipeline_stages!cards_stage_id_fkey(is_lost, requires_reschedule)")
        .eq("pipeline_id", d.pipeline_id)
        .is("archived_at", null)
        .lt("starts_at", endsAt)
        .gt("ends_at", startsAt);
      const { data: names } = await supabase.from("profiles").select("id, full_name").in("id", people.length ? people : ["00000000-0000-0000-0000-000000000000"]);
      for (const o of overlap ?? []) {
        if (o.id === d.id) continue;
        const st = o.pipeline_stages as unknown as { is_lost: boolean; requires_reschedule: boolean } | null;
        if (st?.is_lost || st?.requires_reschedule) continue;
        const busy = people.filter((p) => p === o.owner_id || (o.card_participants as { profile_id: string }[]).some((x) => x.profile_id === p));
        for (const p of busy) {
          const who = (names ?? []).find((n) => n.id === p)?.full_name.split(" ")[0] ?? "Alguém";
          warnings.push(`${who} já tem "${o.title}" das ${fmtSpan(o.starts_at as string, o.ends_at as string)}.`);
        }
      }
    }
    if (!meeting && d.due && d.due < today && (!current || (current.due_at ? dayKey(current.due_at as string) : "") !== d.due)) {
      const label = d.kind === "sales" ? "O fecho previsto" : d.kind === "campaigns" ? "O lançamento" : "O prazo";
      warnings.push(`${label} (${fmtDayShort(d.due)}) já passou.`);
    }
    if (warnings.length) return { warnings: [...new Set(warnings)] };
  }

  const row = {
    pipeline_id: d.pipeline_id,
    title: d.title,
    owner_id: d.owner_id ?? null,
    starts_at: startsAt,
    ends_at: endsAt,
    location_kind: meeting ? (d.location_kind ?? "in_person") : null,
    location: meeting ? (d.location_kind === "phone" ? "Chamada" : d.location) : null,
    contact_name: d.contact_name,
    contact_role: d.contact_role,
    contact_phone: phone.ok ? phone.value : null,
    contact_email: d.contact_email,
    company_name: company,
    company_tax_id: d.company_tax_id,
    company_sector: d.company_sector,
    value_cents: valueNum === null ? null : valueNum * 100,
    // A due date is a day, stored at noon Maputo time (#4).
    due_at: !meeting && d.due ? toIso(d.due, "12:00") : null,
    description: d.description,
    fields: d.kind === "campaigns" && d.channel ? { channel: d.channel } : {},
  };

  let id = d.id;
  if (id) {
    const { error } = await supabase.from("cards").update(row).eq("id", id);
    if (error) return { message: "Não foi possível guardar. Tente outra vez." };
  } else {
    const { data, error } = await supabase.from("cards").insert(row).select("id").single();
    if (error || !data) return { message: "Não foi possível criar. Tente outra vez." };
    id = data.id as string;
  }

  if (meeting) {
    const { data: have } = await supabase.from("card_participants").select("profile_id").eq("card_id", id);
    const haveSet = new Set((have ?? []).map((r) => r.profile_id as string));
    const toAdd = participants.filter((p) => !haveSet.has(p));
    const toRemove = [...haveSet].filter((p) => !participants.includes(p));
    if (toRemove.length) await supabase.from("card_participants").delete().eq("card_id", id).in("profile_id", toRemove);
    if (toAdd.length) await supabase.from("card_participants").insert(toAdd.map((profile_id) => ({ card_id: id, profile_id })));
  }

  revalidatePath("/", "layout");
  redirect(`/cards/${id}${d.id ? "?saved=1" : "?created=1"}`, RedirectType.replace);
}

export type MoveResult = { ok: true } | { ok: false; error: string; field?: "note" | "date" };

const MOVE_ERRORS: [string, string, ("note" | "date")?][] = [
  ["note_required", "Escreva o motivo.", "note"],
  ["reschedule_required", "Escolha a nova data.", "date"],
  ["reschedule_past", "A nova data tem de ser hoje ou depois.", "date"],
  ["reopen_first", "Este cartão foi cancelado ou perdido. Volte a pô-lo numa etapa aberta antes de o concluir."],
  ["meeting_not_started", "A reunião ainda não começou. Só pode passar a esta etapa a partir da hora de início."],
  ["value_required", "Indique o valor da oportunidade antes de a marcar como ganha (Editar)."],
  ["launch_date_required", "Defina a data de lançamento da campanha antes (Editar)."],
];

/** Moves a card through move_card() (stage rules, history and column order live in SQL). */
export async function moveCard(input: { cardId: string; stageId: string; position?: number | null; note?: string; date?: string; time?: string }): Promise<MoveResult> {
  await requireMember();
  const supabase = await createClient();
  let newStarts: string | null = null;
  if (input.date && dateRe.test(input.date)) {
    if (input.date < dayKey(new Date())) return { ok: false, error: "A nova data tem de ser hoje ou depois.", field: "date" };
    let time = input.time && timeRe.test(input.time) ? input.time : null;
    if (!time) {
      // #7 Without a new time, the meeting keeps its own.
      const { data: c } = await supabase.from("cards").select("starts_at").eq("id", input.cardId).maybeSingle();
      time = c?.starts_at ? localTime(c.starts_at as string) : "09:00";
    }
    newStarts = toIso(input.date, time);
  }
  const { error } = await supabase.rpc("move_card", {
    p_card_id: input.cardId,
    p_stage_id: input.stageId,
    p_position: input.position ?? null,
    p_note: input.note?.trim() || null,
    p_new_starts_at: newStarts,
  });
  if (error) {
    const known = MOVE_ERRORS.find(([code]) => error.message.includes(code));
    if (known) return { ok: false, error: known[1], field: known[2] };
    return { ok: false, error: "Não foi possível mover. Tente outra vez." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

/** #1 Archive (or restore) a card: it leaves every list, count and total. Owner, author or admin. */
export async function archiveCard(cardId: string, restore = false): Promise<{ ok: true; back: string } | { ok: false; error: string }> {
  await requireMember();
  const supabase = await createClient();
  const { data: card } = await supabase.from("cards").select("pipelines(slug, kind)").eq("id", cardId).maybeSingle();
  const { error } = await supabase.from("cards").update({ archived_at: restore ? null : new Date().toISOString() }).eq("id", cardId);
  if (error) {
    if (error.message.includes("only_owner_or_admin")) return { ok: false, error: "Só o responsável, quem criou o cartão ou um admin o pode arquivar." };
    return { ok: false, error: "Não foi possível arquivar. Tente outra vez." };
  }
  revalidatePath("/", "layout");
  const pl = card?.pipelines as unknown as { slug: string; kind: string } | null;
  return { ok: true, back: pl?.kind === "meetings" ? "/agenda" : `/pipelines/${pl?.slug ?? "reunioes"}` };
}
