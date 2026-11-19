import "server-only";
import { cache } from "react";
import { addDays, dayKey } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Pipeline, Profile, Stage } from "@/lib/types";

export const PROFILE_COLS = "id, full_name, role, job_title, phone_whatsapp, avatar_url, color, active";
export const CARD_COLS =
  "id, pipeline_id, stage_id, title, owner_id, starts_at, ends_at, all_day, location_kind, location, contact_name, contact_role, contact_phone, contact_email, company_name, company_tax_id, company_sector, value_cents, due_at, description, fields, position, stage_changed_at, created_at, archived_at";

/** Team, pipelines and stages: small, read on almost every page. Cached per request. */
export const getBase = cache(async () => {
  const supabase = await createClient();
  const [profiles, pipelines, stages] = await Promise.all([
    supabase.from("profiles").select(PROFILE_COLS).order("created_at"),
    supabase.from("pipelines").select("id, slug, name, kind, icon, position, archived_at").is("archived_at", null).order("position"),
    supabase.from("pipeline_stages").select("*").order("position"),
  ]);
  const team = (profiles.data ?? []) as Profile[];
  return {
    team,
    activeTeam: team.filter((p) => p.active),
    pipelines: (pipelines.data ?? []) as Pipeline[],
    stages: (stages.data ?? []) as Stage[],
  };
});

export type Base = Awaited<ReturnType<typeof getBase>>;

export const profileOf = (base: Base, id: string | null | undefined) => base.team.find((p) => p.id === id) ?? null;
export const stageOf = (base: Base, id: string) => base.stages.find((s) => s.id === id)!;
export const stagesOf = (base: Base, pipelineId: string) => base.stages.filter((s) => s.pipeline_id === pipelineId);
export const pipelineOf = (base: Base, id: string) => base.pipelines.find((p) => p.id === id)!;
export const meetingsPipeline = (base: Base) => base.pipelines.find((p) => p.kind === "meetings") ?? null;

/** Numbers in the sidebar: meetings today, missing minutes, open cards per pipeline. */
export const getShellCounts = cache(async (now: Date) => {
  const base = await getBase();
  const supabase = await createClient();
  const [{ data: cards }, { data: mins }] = await Promise.all([
    supabase.from("cards").select("id, pipeline_id, stage_id, starts_at").is("archived_at", null),
    supabase.from("minutes").select("card_id, status"),
  ]);
  const today = dayKey(now);
  const meetingsId = meetingsPipeline(base)?.id;
  const stage = (id: string) => base.stages.find((s) => s.id === id);
  const finals = new Set((mins ?? []).filter((m) => m.status === "final").map((m) => m.card_id));
  const list = cards ?? [];
  const meetings = list.filter((c) => c.pipeline_id === meetingsId && c.starts_at);
  return {
    today: meetings.filter((c) => dayKey(c.starts_at!) === today && !stage(c.stage_id)?.is_lost).length,
    missingMinutes: meetings.filter((c) => stage(c.stage_id)?.is_done && !finals.has(c.id)).length,
    open: Object.fromEntries(
      base.pipelines.map((p) => [p.slug, list.filter((c) => c.pipeline_id === p.id && !stage(c.stage_id)?.is_done && !stage(c.stage_id)?.is_lost).length]),
    ) as Record<string, number>,
    tomorrow: addDays(today, 1),
  };
});
