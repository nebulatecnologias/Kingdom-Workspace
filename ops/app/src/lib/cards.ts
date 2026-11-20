// Pure rules over cards (no I/O): who is involved, which are meetings, missing minutes.
import { dayKey } from "./format";
import type { Card, Stage } from "./types";

export type Participation = { card_id: string; profile_id: string };

export const involves = (card: Pick<Card, "id" | "owner_id">, member: string | null | undefined, parts: Participation[]) =>
  !member || card.owner_id === member || parts.some((p) => p.card_id === card.id && p.profile_id === member);

export const byStart = (a: Pick<Card, "starts_at">, b: Pick<Card, "starts_at">) =>
  new Date(a.starts_at ?? 0).getTime() - new Date(b.starts_at ?? 0).getTime();

export const isOpen = (stage: Pick<Stage, "is_done" | "is_lost"> | undefined) => !!stage && !stage.is_done && !stage.is_lost;

export const locationIcon = (kind: string | null) => (kind === "online" ? "video" : kind === "phone" ? "phone" : "map-pin");
export const locationShort = (card: Pick<Card, "location_kind" | "location">) =>
  card.location_kind === "online" ? "Online" : card.location_kind === "phone" ? "Chamada" : (card.location ?? "").split(",")[0];

/** A due date is a day (#4): late only from the next day on, in Maputo, and never once done or lost. */
export const isLate = (dueAt: string | null, today: string, stage?: Pick<Stage, "is_done" | "is_lost">) =>
  !!dueAt && (!stage || isOpen(stage)) && dayKey(dueAt) < today;

/** A meeting whose time has passed but is still in an open, not-started stage (#19). */
export const isUnclosed = (card: Pick<Card, "starts_at" | "ends_at">, stage: Pick<Stage, "is_done" | "is_lost" | "requires_reschedule"> | undefined, nowMs: number) =>
  !!card.starts_at && !!stage && isOpen(stage) && !stage.requires_reschedule && new Date(card.ends_at ?? card.starts_at).getTime() < nowMs;

/** Minutes are missing for a meeting that is done, has started and has no ata at all (drafts are counted apart) (#3). */
export const needsMinutes = (card: Pick<Card, "id" | "starts_at">, stage: Pick<Stage, "is_done"> | undefined, withMinutes: Set<string>, nowMs: number) =>
  !!stage?.is_done && !!card.starts_at && new Date(card.starts_at).getTime() <= nowMs && !withMinutes.has(card.id);

/** Next meeting candidates: still to happen (not done, cancelled or postponed) (#2). */
export const isUpcomingStage = (stage: Pick<Stage, "is_done" | "is_lost" | "requires_reschedule"> | undefined) => isOpen(stage) && !stage!.requires_reschedule;
