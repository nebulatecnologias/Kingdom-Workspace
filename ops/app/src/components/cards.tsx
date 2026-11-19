import clsx from "clsx";
import Link from "next/link";
import { Avatar, Pill } from "@/components/ui/bits";
import { Icon } from "@/components/ui/icon";
import { locationIcon, locationShort } from "@/lib/cards";
import { fmtDate, fmtDateTime, fmtMoney, fmtTime } from "@/lib/format";
import type { Card, Pipeline, Profile, Stage } from "@/lib/types";

/** Meeting row in the agenda and on Início (prototype MeetingCard). */
export function MeetingCard({ card, stage, owner }: { card: Card; stage: Stage; owner: Profile | null }) {
  return (
    <Link className="meeting-card" href={`/cards/${card.id}`}>
      <Avatar name={owner?.full_name} className="tile" />
      <div style={{ minWidth: 0 }}>
        <div className="title">{card.title}</div>
        <div className="sub">
          {card.starts_at ? fmtTime(card.starts_at) : ""}
          {card.ends_at ? `–${fmtTime(card.ends_at)}` : ""}
          {card.company_name ? ` · ${card.company_name}` : ""}
        </div>
        <div className="foot">
          <span className="who">
            <Icon name={locationIcon(card.location_kind)} size="xs" />
            <span>{locationShort(card)}</span>
          </span>
          <Pill stage={stage} />
        </div>
      </div>
    </Link>
  );
}

/** Kanban card item (prototype CardItem). `now` makes "Atrasado" deterministic per request. */
export function CardItemBody({ card, pipeline, stage, owner, now }: { card: Card; pipeline: Pipeline; stage: Stage; owner: Profile | null; now: number }) {
  const sub = [card.company_name, card.contact_name].filter(Boolean).join(" · ");
  let when: React.ReactNode = <span />;
  if (pipeline.kind === "meetings" && card.starts_at) {
    when = (
      <span className="when">
        <Icon name="clock" size="xs" />
        {fmtDateTime(card.starts_at)}
      </span>
    );
  } else if (card.due_at) {
    const over = new Date(card.due_at).getTime() < now && !stage.is_done;
    when = (
      <span className={clsx("when", over && "is-overdue")}>
        {over ? (
          <>
            <span className="dot danger" />
            Atrasado ·{" "}
          </>
        ) : (
          <Icon name="calendar" size="xs" />
        )}
        {fmtDate(card.due_at)}
      </span>
    );
  }
  return (
    <>
      <div className="inline" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="title">{card.title}</div>
        <Icon name="grip" size="sm" className="grip" />
      </div>
      {sub ? <div className="sub">{sub}</div> : null}
      <div className="foot">
        {when}
        <span className="inline">
          {card.value_cents ? <span className="value num">{fmtMoney(card.value_cents)}</span> : null}
          <Avatar name={owner?.full_name} className="sm" />
        </span>
      </div>
    </>
  );
}
