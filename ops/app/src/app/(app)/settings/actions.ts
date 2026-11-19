"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const stageSchema = z.object({
  id: z.string().uuid().nullable(),
  name: z.string().trim().min(1).max(60),
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
  const parsed = z.array(stageSchema).min(1).max(20).safeParse(stages);
  if (!parsed.success) return { ok: false, error: "Cada etapa precisa de um nome." };
  const supabase = await createClient();
  const { data: existing } = await supabase.from("pipeline_stages").select("id").eq("pipeline_id", pipelineId);
  const keep = new Set(parsed.data.map((s) => s.id).filter(Boolean));
  const removed = (existing ?? []).map((s) => s.id as string).filter((id) => !keep.has(id));
  if (removed.length) {
    const { count } = await supabase.from("cards").select("id", { count: "exact", head: true }).in("stage_id", removed);
    if (count) return { ok: false, error: "Não pode remover uma etapa que ainda tem cartões. Mova-os primeiro." };
    const { error } = await supabase.from("pipeline_stages").delete().in("id", removed);
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

export async function createFromTemplate(kind: string, name: string): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_pipeline_from_template", { p_kind: kind, p_name: name });
  if (error || !data) return { ok: false, error: "Não foi possível criar o pipeline." };
  revalidatePath("/", "layout");
  return { ok: true, slug: (data as { slug: string }).slug };
}
