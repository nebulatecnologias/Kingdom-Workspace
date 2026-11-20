// The Início numbers against the seed data (ops/prototype/src/data.js), at the prototype's fixed "now".
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it } from "vitest";
import { computeDashboard } from "@/lib/dashboard";

const ctx: Record<string, unknown> = {};
vm.runInNewContext(`${readFileSync(new URL("../../prototype/src/data.js", import.meta.url), "utf8")};globalThis.__DB = DB;`, ctx);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DB = ctx.__DB as any;

const d = computeDashboard({
  now: new Date("2026-11-19T09:45:00+02:00"),
  me: "p1",
  team: DB.profiles,
  pipelines: DB.pipelines,
  stages: DB.pipeline_stages,
  cards: DB.cards,
  parts: DB.card_participants,
  minutes: DB.minutes,
  activity: DB.card_activity,
});

describe("dashboard against the seed", () => {
  it("counts today's and this week's meetings", () => {
    expect(d.todayAll.map((c) => c.id)).toEqual(["c1", "c2", "c3"]);
    expect(d.mine.length).toBe(1); // p1 owns c3
    expect(d.next?.id).toBe("c1");
    expect(d.weekCount).toBe(8); // c1–c5, c8–c10 (Mon 16 – Sun 22), without cancelled c7
  });
  it("finds missing minutes and drafts", () => {
    // "Em falta" = done, already happened, no ata at all; c5 has a draft and is counted as a draft (#3).
    expect(d.missing.map((c) => c.id).sort()).toEqual(["c12"]);
    expect(d.drafts).toBe(1);
  });
  it("counts postponed/cancelled in 30 days and the completion rate", () => {
    expect(d.postponed).toBe(1);
    expect(d.cancelled).toBe(1);
    expect(d.completion).toBe(75); // 3 concluded / (3 + 1 cancelled)
  });
  it("tasks and sales", () => {
    expect(d.lateTasks).toBe(1); // c51 (due 18/11 18:00); c52 is due at 10:00, after "now"
    expect(d.sales.find((s) => s.label === "Proposta")?.value).toBe(247000000);
  });
});

describe("operation labels", async () => {
  const { stageLabel } = await import("@/lib/dashboard");
  it("reads like the prototype", () => {
    expect(["Em curso", "No ar", "Bloqueado", "Proposta", "Planeamento"].map(stageLabel)).toEqual(["em curso", "no ar", "bloqueado", "em proposta", "em planeamento"]);
  });
});

describe("rules from the test report", async () => {
  const { isLate, needsMinutes, isUpcomingStage } = await import("@/lib/cards");
  it("a due date is late only from the next day (#4)", () => {
    expect(isLate("2026-11-20T07:00:00Z", "2026-11-20")).toBe(false);
    expect(isLate("2026-11-19T22:30:00Z", "2026-11-20")).toBe(false); // 00:30 on the 20th in Maputo
    expect(isLate("2026-11-19T10:00:00Z", "2026-11-20")).toBe(true);
    expect(isLate("2026-11-19T10:00:00Z", "2026-11-20", { is_done: true, is_lost: false })).toBe(false);
  });
  it("the next meeting skips done, cancelled and postponed ones (#2)", () => {
    expect(isUpcomingStage({ is_done: true, is_lost: false, requires_reschedule: false })).toBe(false);
    expect(isUpcomingStage({ is_done: false, is_lost: false, requires_reschedule: true })).toBe(false);
    expect(isUpcomingStage({ is_done: false, is_lost: false, requires_reschedule: false })).toBe(true);
  });
  it("minutes are missing only after a done meeting has happened (#3)", () => {
    const now = Date.parse("2026-11-20T08:00:00Z");
    expect(needsMinutes({ id: "a", starts_at: "2026-11-20T10:00:00Z" }, { is_done: true }, new Set(), now)).toBe(false);
    expect(needsMinutes({ id: "a", starts_at: "2026-11-20T06:00:00Z" }, { is_done: true }, new Set(), now)).toBe(true);
    expect(needsMinutes({ id: "a", starts_at: "2026-11-20T06:00:00Z" }, { is_done: true }, new Set(["a"]), now)).toBe(false);
  });
});
