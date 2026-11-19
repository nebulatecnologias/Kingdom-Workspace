import { Icon } from "@/components/ui/icon";
import { firstName, fmtDateTime } from "@/lib/format";
import type { Activity, Profile, Stage } from "@/lib/types";

const ICON: Record<Activity["type"], string> = {
  created: "plus", stage_changed: "arrow-right", rescheduled: "calendar-clock", updated: "pencil", minutes_created: "file-text", minutes_finalized: "check",
};

export function ActivityItem({ a, actor, to }: { a: Activity; actor: Profile | null; to: Stage | null }) {
  const who = actor ? firstName(actor.full_name) : "Alguém";
  const what = {
    created: <>{who} criou o cartão{to ? <> em <b>{to.name}</b></> : null}</>,
    stage_changed: <>{who} moveu para <b>{to?.name}</b></>,
    rescheduled: to ? <>{who} adiou a reunião (<b>{to.name}</b>)</> : <>{who} mudou a data</>,
    updated: <>{who} editou os dados</>,
    minutes_created: <>{who} criou a ata</>,
    minutes_finalized: <>{who} marcou a ata como final</>,
  }[a.type];
  return (
    <div className="activity-item">
      <span className="ico">
        <Icon name={ICON[a.type] ?? "history"} />
      </span>
      <div>
        <div className="what">{what}</div>
        <div className="when num">{fmtDateTime(a.at)}</div>
        {a.note ? <div className="note">{a.note}</div> : null}
      </div>
    </div>
  );
}
