// Pure rules over cards (no I/O): who is involved, which are meetings, missing minutes.
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
