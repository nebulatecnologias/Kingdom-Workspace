import { Icon } from "@/components/ui/icon";
import { firstName, fmtDateTime } from "@/lib/format";
import type { Activity, Profile, Stage } from "@/lib/types";

const ICON: Record<Activity["type"], string> = {
  created: "plus", stage_changed: "arrow-right", rescheduled: "calendar-clock", updated: "pencil", archived: "archive", restored: "history",
  minutes_created: "file-text", minutes_finalized: "check", minutes_reopened: "pencil",
};

/** One history line. Stage names come from the row itself (as they were then), falling back to today's names. */
export function ActivityItem({ a, actor, to }: { a: Activity; actor: Profile | null; to: Stage | null }) {
  const who = actor ? firstName(actor.full_name) : "Alguém";
  const toName = a.to_stage_name ?? to?.name ?? null;
  const what = {
    created: <>{who} criou o cartão{toName ? <> em <b>{toName}</b></> : null}</>,
    stage_changed: <>{who} moveu para <b>{toName}</b></>,
    rescheduled: toName ? <>{who} adiou (<b>{toName}</b>)</> : <>{who} mudou a data</>,
    updated: <>{who} editou</>,
    archived: <>{who} arquivou o cartão</>,
    restored: <>{who} repôs o cartão</>,
    minutes_created: <>{who} criou a ata</>,
    minutes_finalized: <>{who} marcou a ata como final</>,
    minutes_reopened: <>{who} reabriu a ata como rascunho</>,
  }[a.type];
  return (
    <div className="activity-item">
      <span className="ico">
        <Icon name={ICON[a.type] ?? "history"} />
      </span>
      <div>
        <div className="what">{what}</div>
        <div className="when num">{fmtDateTime(a.at)}</div>
        {a.details ? <div className="details">{a.details}</div> : null}
        {a.note ? <div className="note">{a.note}</div> : null}
      </div>
    </div>
  );
}
