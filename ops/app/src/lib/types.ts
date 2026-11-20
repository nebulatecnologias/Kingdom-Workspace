// Row types: the column names of ops/supabase/migrations (plan §3).
import type { Kind } from "./texts";

export type Tone = "neutral" | "info" | "warning" | "danger" | "success";
export type LocationKind = "in_person" | "online" | "phone";

export type Profile = {
  id: string;
  full_name: string;
  role: "admin" | "member";
  job_title: string | null;
  phone_whatsapp: string | null;
  avatar_url: string | null;
  color: string | null;
  active: boolean;
};

export type Pipeline = { id: string; slug: string; name: string; kind: Kind; icon: string; position: number; archived_at: string | null };

export type Stage = {
  id: string;
  pipeline_id: string;
  name: string;
  position: number;
  tone: Tone;
  is_done: boolean;
  is_lost: boolean;
  requires_note: boolean;
  requires_reschedule: boolean;
};

export type Card = {
  id: string;
  pipeline_id: string;
  stage_id: string;
  title: string;
  owner_id: string | null;
  starts_at: string | null;
  ends_at: string | null;
  all_day: boolean;
  location_kind: LocationKind | null;
  location: string | null;
  contact_name: string | null;
  contact_role: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  company_name: string | null;
  company_tax_id: string | null;
  company_sector: string | null;
  value_cents: number | null;
  due_at: string | null;
  description: string | null;
  fields: Record<string, unknown> | null;
  position: number;
  stage_changed_at: string;
  created_by?: string | null;
  created_at: string;
  archived_at: string | null;
};

export type Activity = {
  id: string;
  card_id: string;
  actor_id: string | null;
  type: "created" | "stage_changed" | "rescheduled" | "updated" | "archived" | "restored" | "minutes_created" | "minutes_finalized" | "minutes_reopened";
  from_stage_id: string | null;
  to_stage_id: string | null;
  /** Stage names as they were when it happened (#49); older rows may only have the ids. */
  from_stage_name?: string | null;
  to_stage_name?: string | null;
  /** What changed, e.g. "Hora: 10:00 → 23:30 · Responsável: Shelton → Maria" (#12). */
  details?: string | null;
  note: string | null;
  at: string;
};

export type Attendee = { name: string; org: string; role: string; present: boolean };
export type AgendaItem = { topic: string; summary: string };
export type Decision = { text: string };
export type ActionItem = { what: string; who: string; due: string; status: "pending" | "done" };

export type Minutes = {
  id: string;
  card_id: string;
  title: string | null;
  held_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  location: string | null;
  attendees: Attendee[];
  agenda: AgendaItem[];
  decisions: Decision[];
  actions: ActionItem[];
  next_steps: string | null;
  next_meeting_at: string | null;
  written_by: string | null;
  approved_by: string | null;
  status: "draft" | "final";
  finalized_at: string | null;
  created_at: string;
  updated_at: string;
};
