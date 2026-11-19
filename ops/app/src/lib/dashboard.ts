// Início indicators (plan §7), computed from one read of cards, minutes and recent history.
import { involves, isOpen, type Participation } from "./cards";
import { addDays, dayKey, minutesDiff, mondayOf } from "./format";
import type { Activity, Card, Pipeline, Profile, Stage } from "./types";

export type DashInput = {
  now: Date;
  me: string;
  team: Profile[];
  pipelines: Pipeline[];
  stages: Stage[];
  cards: Card[];
  parts: Participation[];
  minutes: { card_id: string; status: "draft" | "final" }[];
  activity: Pick<Activity, "type" | "to_stage_id" | "at">[];
};

/** "Em curso" -> "em curso", "No ar" -> "no ar", "Bloqueado" -> "bloqueado", "Proposta" -> "em proposta". */
export const stageLabel = (name: string) => {
  const l = name.toLowerCase();
  return /^(em |no |na )/.test(l) || /^bloquead/.test(l) ? l : `em ${l}`;
};

export function computeDashboard(i: DashInput) {
  const stage = (id: string) => i.stages.find((s) => s.id === id);
  const meetingsPl = i.pipelines.find((p) => p.kind === "meetings");
  const meetings = i.cards.filter((c) => c.pipeline_id === meetingsPl?.id && c.starts_at && !c.archived_at);
  const lost = (c: Card) => !!stage(c.stage_id)?.is_lost;
  const today = dayKey(i.now);
  const monday = mondayOf(today);
  const nowMs = i.now.getTime();

  const todayAll = meetings.filter((c) => dayKey(c.starts_at!) === today && !lost(c)).sort((a, b) => +new Date(a.starts_at!) - +new Date(b.starts_at!));
  const mine = todayAll.filter((c) => involves(c, i.me, i.parts));
  let next = todayAll.find((c) => +new Date(c.ends_at ?? c.starts_at!) > nowMs) ?? null;
  if (!next) next = meetings.filter((c) => +new Date(c.starts_at!) > nowMs && !lost(c)).sort((a, b) => +new Date(a.starts_at!) - +new Date(b.starts_at!))[0] ?? null;
  const rest = todayAll.filter((c) => c.id !== next?.id);
  const week = meetings.filter((c) => { const k = dayKey(c.starts_at!); return k >= monday && k <= addDays(monday, 6) && !lost(c); });
  const next7 = meetings.filter((c) => { const k = dayKey(c.starts_at!); return k >= today && k <= addDays(today, 6) && !lost(c); });

  const finals = new Set(i.minutes.filter((m) => m.status === "final").map((m) => m.card_id));
  const hasMinutes = new Set(i.minutes.map((m) => m.card_id));
  const missing = meetings.filter((c) => stage(c.stage_id)?.is_done && !finals.has(c.id));
  const drafts = i.minutes.filter((m) => m.status === "draft").length;

  const last30 = meetings.filter((c) => minutesDiff(i.now, c.starts_at!) < 30 * 1440 && minutesDiff(i.now, c.starts_at!) > -30 * 1440);
  const meetingStages = i.stages.filter((s) => s.pipeline_id === meetingsPl?.id).sort((a, b) => a.position - b.position);
  const byStage = meetingStages.map((s) => ({ label: s.name, dot: s.tone, value: last30.filter((c) => c.stage_id === s.id).length }));
  const byPerson = i.team.filter((p) => p.active).map((p) => ({ label: p.full_name.split(" ")[0], value: next7.filter((c) => involves(c, p.id, i.parts)).length }));

  const recent = i.activity.filter((a) => minutesDiff(i.now, a.at) <= 30 * 1440 && (a.type === "stage_changed" || a.type === "rescheduled") && a.to_stage_id);
  const toStage = (a: (typeof recent)[number]) => stage(a.to_stage_id!);
  const postponed = recent.filter((a) => toStage(a)?.requires_reschedule && toStage(a)?.pipeline_id === meetingsPl?.id).length;
  const cancelled = recent.filter((a) => toStage(a)?.is_lost && toStage(a)?.pipeline_id === meetingsPl?.id).length;
  const doneN = recent.filter((a) => toStage(a)?.is_done && toStage(a)?.pipeline_id === meetingsPl?.id).length;
  const completion = doneN + cancelled ? Math.round((doneN / (doneN + cancelled)) * 100) : null;

  const tasksPl = i.pipelines.filter((p) => p.kind === "tasks").map((p) => p.id);
  const tasks = i.cards.filter((c) => tasksPl.includes(c.pipeline_id));
  const openTasks = tasks.filter((c) => isOpen(stage(c.stage_id)));
  const lateTasks = openTasks.filter((c) => c.due_at && +new Date(c.due_at) < nowMs);

  const salesPl = i.pipelines.find((p) => p.kind === "sales");
  const sales = salesPl
    ? i.stages.filter((s) => s.pipeline_id === salesPl.id).sort((a, b) => a.position - b.position).map((s) => {
        const v = i.cards.filter((c) => c.stage_id === s.id).reduce((x, c) => x + (c.value_cents ?? 0), 0);
        return { label: s.name, dot: s.tone, value: v };
      })
    : [];

  // One line per non-meeting pipeline: counts in its open stages (and the open value for sales, late tasks first).
  const operation = i.pipelines.filter((p) => p.kind !== "meetings").map((p) => {
    const cards = i.cards.filter((c) => c.pipeline_id === p.id);
    const open = cards.filter((c) => isOpen(stage(c.stage_id)));
    const parts: { n: number | string; label: string }[] = [];
    if (p.kind === "tasks") {
      const late = open.filter((c) => c.due_at && +new Date(c.due_at) < nowMs).length;
      parts.push({ n: late, label: late === 1 ? "atrasada" : "atrasadas" });
    }
    for (const s of i.stages.filter((s) => s.pipeline_id === p.id && isOpen(s)).sort((a, b) => b.position - a.position)) {
      const n = open.filter((c) => c.stage_id === s.id).length;
      if (n) parts.push({ n, label: stageLabel(s.name) });
    }
    if (p.kind === "sales") parts.push({ n: open.reduce((x, c) => x + (c.value_cents ?? 0), 0), label: "em aberto" });
    return { pipeline: p, parts: p.kind === "sales" ? [...parts.slice(0, 2), parts[parts.length - 1]] : parts.slice(0, 3), openCount: open.length };
  });

  return { today, todayAll, mine, next, rest, weekCount: week.length, next7Count: next7.length, missing, hasMinutes, drafts, byStage, byPerson, postponed, cancelled, completion, openTasks: openTasks.length, lateTasks: lateTasks.length, sales, operation };
}
