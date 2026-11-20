import clsx from "clsx";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { addDays, fmtDayLong, fmtMonth, fmtWeekday, mondayOf } from "@/lib/format";
import { T } from "@/lib/texts";

/** Week of day chips with a mark under days that have meetings (prototype WeekStrip). */
export function WeekStrip({ selected, today, counts, href }: { selected: string; today: string; counts: Record<string, number>; href: (day: string) => string }) {
  const monday = mondayOf(selected);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  return (
    <>
      <div className="week-nav">
        <span className="label">{fmtMonth(selected)}</span>
        <span className="inline">
          <Link className="btn btn-quiet btn-sm" href={href(today)}>
            {T.actions.today}
          </Link>
          <Link className="btn btn-ghost btn-icon btn-sm" href={href(addDays(selected, -7))} aria-label="Semana anterior">
            <Icon name="chevron-left" />
          </Link>
          <Link className="btn btn-ghost btn-icon btn-sm" href={href(addDays(selected, 7))} aria-label="Semana seguinte">
            <Icon name="chevron-right" />
          </Link>
        </span>
      </div>
      <div className="week-strip" role="tablist">
        {days.map((d) => {
          const n = counts[d] ?? 0;
          return (
            <Link
              key={d}
              className={clsx("day-chip", d === selected && "is-selected", d === today && "is-today", n > 0 && "has-events")}
              href={href(d)}
              role="tab"
              aria-selected={d === selected}
              aria-label={`${fmtDayLong(d)}, ${n} reuniões`}
            >
              <span className="dow">{fmtWeekday(d)}</span>
              <span className="num">{Number(d.slice(8))}</span>
              <span className="mark" />
            </Link>
          );
        })}
      </div>
    </>
  );
}

export function MemberChips({ selected, team, href }: { selected: string; team: { id: string; full_name: string }[]; href: (id: string) => string }) {
  return (
    <div className="chip-row">
      <Link className={clsx("chip text-only", !selected && "is-active")} href={href("")}>
        {T.all}
      </Link>
      {team.map((p) => (
        <Link key={p.id} className={clsx("chip", selected === p.id && "is-active")} href={href(p.id)}>
          <span className="avatar sm">{p.full_name.split(" ").filter(Boolean).slice(0, 2).map((x) => x[0]).join("").toUpperCase()}</span>
          {p.full_name.split(" ")[0]}
        </Link>
      ))}
    </div>
  );
}
