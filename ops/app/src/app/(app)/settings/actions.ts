"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { z } from "@/lib/zod";

const stageSchema = z.object({
  id: z.string().uuid().nullable(),
  name: z.string().trim().min(1, "Cada etapa precisa de um nome.").max(60, "Máximo de 60 caracteres por etapa."),
  tone: z.enum(["neutral", "info", "warning", "danger", "success"]),
  is_done: z.boolean(),
  is_lost: z.boolean(),
  requires_note: z.boolean(),
  requires_reschedule: z.boolean(),
});

export type StagesResult = { ok: true } | { ok: false; error: string };

/** Saves the stage list of a pipeline: order = position; removed stages must be empty. */
export async function saveStages(pipelineId: string, stages: z.input<typeof stageSchema>[]): Promise<StagesResult> {
  await requireAdmin();
  const parsed = z.array(stageSchema).min(1, "O pipeline precisa de pelo menos uma etapa.").max(20, "Máximo de 20 etapas.").safeParse(stages);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  // #34 Names are unique inside a pipeline. #33 A stage is open, done or lost — not done and lost.
  const seen = new Set<string>();
  for (const s of parsed.data) {
    const k = s.name.toLocaleLowerCase("pt");
    if (seen.has(k)) return { ok: false, error: `Há duas etapas com o nome "${s.name}". Use nomes diferentes.` };
    seen.add(k);
    if (s.is_done && s.is_lost) return { ok: false, error: `A etapa "${s.name}" não pode contar como concluída e perdida ao mesmo tempo.` };
  }
  const supabase = await createClient();
  const { data: existing } = await supabase.from("pipeline_stages").select("id, name").eq("pipeline_id", pipelineId);
  const keep = new Set(parsed.data.map((s) => s.id).filter(Boolean));
  const removed = (existing ?? []).filter((s) => !keep.has(s.id as string));
  if (removed.length) {
    const { data: busy } = await supabase.from("cards").select("stage_id").in("stage_id", removed.map((s) => s.id as string)).limit(1);
    if (busy?.length) {
      const name = removed.find((s) => s.id === busy[0].stage_id)?.name ?? "";
      return { ok: false, error: `A etapa "${name}" ainda tem cartões. Mova-os primeiro.` };
    }
    const { error } = await supabase.from("pipeline_stages").delete().in("id", removed.map((s) => s.id as string));
    if (error) return { ok: false, error: "Não foi possível remover a etapa." };
  }
  for (const [i, s] of parsed.data.entries()) {
    const row = { pipeline_id: pipelineId, name: s.name, tone: s.tone, position: i + 1, is_done: s.is_done, is_lost: s.is_lost, requires_note: s.requires_note, requires_reschedule: s.requires_reschedule };
    const { error } = s.id ? await supabase.from("pipeline_stages").update(row).eq("id", s.id) : await supabase.from("pipeline_stages").insert(row);
    if (error) return { ok: false, error: "Não foi possível guardar as etapas." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

const nameSchema = z.string().trim().min(1, "Dê um nome ao pipeline.").max(60, "Máximo de 60 caracteres.");

/** #32 New pipeline from a template, with a name of its own. */
export async function createFromTemplate(kind: string, name: string): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  await requireAdmin();
  const n = nameSchema.safeParse(name);
  if (!n.success) return { ok: false, error: n.error.issues[0].message };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_pipeline_from_template", { p_kind: kind, p_name: n.data });
  if (error?.message.includes("pipeline_name_taken")) return { ok: false, error: `Já existe um pipeline "${n.data}". Escolha outro nome.` };
  if (error || !data) return { ok: false, error: "Não foi possível criar o pipeline." };
  revalidatePath("/", "layout");
  return { ok: true, slug: (data as { slug: string }).slug };
}

/** #32 Rename a pipeline (the address stays the same). */
export async function renamePipeline(id: string, name: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  const n = nameSchema.safeParse(name);
  if (!n.success) return { ok: false, error: n.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase.from("pipelines").update({ name: n.data }).eq("id", id);
  if (error) return { ok: false, error: error.code === "23505" ? `Já existe um pipeline "${n.data}".` : "Não foi possível mudar o nome." };
  revalidatePath("/", "layout");
  return { ok: true };
}

/** #32 Remove a pipeline: deleted when it never had cards, archived (hidden, data kept) otherwise. */
export async function removePipeline(id: string): Promise<{ ok: true; archived: boolean } | { ok: false; error: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: pl } = await supabase.from("pipelines").select("kind").eq("id", id).maybeSingle();
  if (!pl) return { ok: false, error: "Pipeline não encontrado." };
  if (pl.kind === "meetings") {
    const { count } = await supabase.from("pipelines").select("id", { count: "exact", head: true }).eq("kind", "meetings").is("archived_at", null);
    if ((count ?? 0) <= 1) return { ok: false, error: "O pipeline de Reuniões alimenta a Agenda e as Atas e não pode ser removido." };
  }
  const { count: cards } = await supabase.from("cards").select("id", { count: "exact", head: true }).eq("pipeline_id", id);
  const { error } = cards
    ? await supabase.from("pipelines").update({ archived_at: new Date().toISOString() }).eq("id", id)
    : await supabase.from("pipelines").delete().eq("id", id);
  if (error) return { ok: false, error: "Não foi possível remover o pipeline." };
  revalidatePath("/", "layout");
  return { ok: true, archived: !!cards };
}
