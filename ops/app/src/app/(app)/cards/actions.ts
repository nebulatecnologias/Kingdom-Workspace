"use server";

import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { z } from "zod";
import { requireMember } from "@/lib/auth";
import { toIso } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export type CardFormState = { errors?: Record<string, string>; message?: string };

const opt = z.string().trim().max(500).optional().transform((v) => (v ? v : null));
const REQUIRED = "Campo obrigatório";

const schema = z.object({
  id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  pipeline_id: z.string().uuid(),
  kind: z.enum(["meetings", "sales", "projects", "campaigns", "tasks", "custom"]),
  title: z.string().trim().min(1, REQUIRED).max(200),
  owner_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  date: z.string().optional(),
  time: z.string().optional(),
  duration: z.coerce.number().int().min(5).max(24 * 60).optional(),
  location_kind: z.enum(["in_person", "online", "phone"]).optional(),
  location: opt,
  contact_name: opt,
  contact_role: opt,
  contact_phone: opt,
  contact_email: z.string().trim().max(254).optional().transform((v) => (v ? v : null)).pipe(z.email("Email inválido").nullable()),
  company_name: opt,
  company_tax_id: opt,
  company_sector: opt,
  value: z.string().optional(),
  due: z.string().optional(),
  description: z.string().trim().max(5000).optional().transform((v) => (v ? v : null)),
  channel: opt,
});

const dateRe = /^\d{4}-\d{2}-\d{2}$/;
const timeRe = /^\d{2}:\d{2}$/;

export async function saveCard(_prev: CardFormState, formData: FormData): Promise<CardFormState> {
  await requireMember();
  const raw = Object.fromEntries([...formData.entries()].filter(([k]) => k !== "participants").map(([k, v]) => [k, String(v)]));
  const parsed = schema.safeParse(raw);
  const errors: Record<string, string> = {};
  if (!parsed.success) {
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message.startsWith("Invalid") ? "Valor inválido" : i.message;
    return { errors };
  }
  const d = parsed.data;
  const meeting = d.kind === "meetings";
  if (meeting) {
    if (!d.date || !dateRe.test(d.date)) errors.date = REQUIRED;
    if (!d.time || !timeRe.test(d.time)) errors.time = REQUIRED;
    if (d.location_kind === "online" && d.location && !/^https?:\/\//.test(d.location)) errors.location = "Use um link que comece por https://";
  }
  const valueNum = d.value ? Number(d.value.replace(/\s/g, "").replace(",", ".")) : null;
  if (valueNum !== null && (!Number.isFinite(valueNum) || valueNum < 0)) errors.value = "Valor inválido";
  if (d.due && !dateRe.test(d.due)) errors.due = "Data inválida";
  if (Object.keys(errors).length) return { errors };

  const startsAt = meeting ? toIso(d.date!, d.time) : null;
  const endsAt = meeting ? new Date(new Date(startsAt!).getTime() + (d.duration ?? 60) * 60000).toISOString() : null;
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
    contact_phone: d.contact_phone,
    contact_email: d.contact_email,
    company_name: d.company_name,
    company_tax_id: d.company_tax_id,
    company_sector: d.company_sector,
    value_cents: valueNum === null ? null : Math.round(valueNum * 100),
    due_at: !meeting && d.due ? toIso(d.due, d.kind === "tasks" ? "18:00" : "00:00") : null,
    description: d.description,
    fields: d.kind === "campaigns" && d.channel ? { channel: d.channel } : {},
  };

  const supabase = await createClient();
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
    const wanted = formData.getAll("participants").map(String).filter((p) => p && p !== row.owner_id);
    const { data: current } = await supabase.from("card_participants").select("profile_id").eq("card_id", id);
    const have = new Set((current ?? []).map((r) => r.profile_id as string));
    const toAdd = wanted.filter((p) => !have.has(p));
    const toRemove = [...have].filter((p) => !wanted.includes(p));
    if (toRemove.length) await supabase.from("card_participants").delete().eq("card_id", id).in("profile_id", toRemove);
    if (toAdd.length) await supabase.from("card_participants").insert(toAdd.map((profile_id) => ({ card_id: id, profile_id })));
  }

  revalidatePath("/", "layout");
  redirect(`/cards/${id}${d.id ? "?saved=1" : "?created=1"}`, RedirectType.replace);
}

export type MoveResult = { ok: true } | { ok: false; error: string; field?: "note" | "date" };

/** Moves a card through move_card() (stage rules, history and column order live in SQL). */
export async function moveCard(input: { cardId: string; stageId: string; position?: number | null; note?: string; date?: string; time?: string }): Promise<MoveResult> {
  await requireMember();
  const newStarts = input.date && dateRe.test(input.date) ? toIso(input.date, input.time && timeRe.test(input.time) ? input.time : "09:00") : null;
  const supabase = await createClient();
  const { error } = await supabase.rpc("move_card", {
    p_card_id: input.cardId,
    p_stage_id: input.stageId,
    p_position: input.position ?? null,
    p_note: input.note?.trim() || null,
    p_new_starts_at: newStarts,
  });
  if (error) {
    if (error.message.includes("note_required")) return { ok: false, error: "Escreva o motivo.", field: "note" };
    if (error.message.includes("reschedule_required")) return { ok: false, error: "Escolha a nova data.", field: "date" };
    return { ok: false, error: "Não foi possível mover. Tente outra vez." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
