import type { Metadata } from "next";
import Link from "next/link";
import { MeetingCard } from "@/components/cards";
import { Topbar } from "@/components/shell/topbar";
import { Avatar, Empty, PageHead } from "@/components/ui/bits";
import { Icon } from "@/components/ui/icon";
import { MemberChips, WeekStrip } from "@/components/week-strip";
import { requireMember } from "@/lib/auth";
import { byStart, involves, type Participation } from "@/lib/cards";
import { CARD_COLS, getBase, meetingsPipeline, profileOf, stageOf } from "@/lib/data";
import { addDays, dayKey, firstName, fmtDay, fmtDayLong, fmtTime, isDayKey, mondayOf, periodOf, toIso } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { T } from "@/lib/texts";
import type { Card } from "@/lib/types";

export const metadata: Metadata = { title: T.nav.agenda };

export default async function AgendaPage({ searchParams }: PageProps<"/agenda">) {
  const sp = await searchParams;
  await requireMember("/agenda");
  const today = dayKey(new Date());
  const selected = isDayKey(sp.date) ? sp.date : today;
  const base = await getBase();
  const member = typeof sp.member === "string" && base.team.some((p) => p.id === sp.member) ? sp.member : "";
  const meetings = meetingsPipeline(base);
  const monday = mondayOf(selected);

  const supabase = await createClient();
  const { data } = meetings
    ? await supabase
        .from("cards")
        .select(`${CARD_COLS}, card_participants(card_id, profile_id)`)
        .eq("pipeline_id", meetings.id)
        .is("archived_at", null)
        .gte("starts_at", toIso(monday))
        .lt("starts_at", toIso(addDays(monday, 7)))
    : { data: [] };
  const rows = (data ?? []) as (Card & { card_participants: Participation[] })[];
  const parts = rows.flatMap((r) => r.card_participants);
  const week = rows.filter((c) => involves(c, member, parts)).sort(byStart);
  const lost = (c: Card) => stageOf(base, c.stage_id)?.is_lost;

  const counts: Record<string, number> = {};
  for (const c of week) if (!lost(c)) counts[dayKey(c.starts_at!)] = (counts[dayKey(c.starts_at!)] ?? 0) + 1;
  const list = week.filter((c) => dayKey(c.starts_at!) === selected);
  const groups = (["morning", "afternoon", "evening"] as const)
    .map((p) => ({ p, items: list.filter((c) => periodOf(c.starts_at!) === p) }))
    .filter((g) => g.items.length);
  const rest = week.filter((c) => dayKey(c.starts_at!) > selected && !lost(c));

  const q = (day: string, m: string) => `/agenda?date=${day}${m ? `&member=${m}` : ""}`;
  const newHref = `/cards/new?pipeline=${meetings?.slug ?? "reunioes"}&date=${selected}`;
  const memberName = member ? firstName(profileOf(base, member)?.full_name ?? "") : "";

  return (
    <>
      <Topbar
        title={T.nav.agenda}
        actions={
          <Link className="btn btn-quiet btn-icon" href={newHref} aria-label={T.actions.newMeeting}>
            <Icon name="plus" />
          </Link>
        }
      />
      <div className="page">
        <PageHead
          desktopOnly
          title={T.nav.agenda}
          actions={
            <Link className="btn btn-primary" href={newHref}>
              <Icon name="plus" />
              {T.actions.newMeeting}
            </Link>
          }
        />
        <div className="card card-pad" style={{ padding: "12px 12px 8px" }}>
          <WeekStrip selected={selected} today={today} counts={counts} href={(d) => q(d, member)} />
        </div>
        <div className="section" style={{ marginTop: 14 }}>
          <MemberChips selected={member} team={base.activeTeam} href={(id) => q(selected, id)} />
        </div>
        <section className="section" style={{ marginTop: 4 }}>
          <div className="section-head">
            <h2 className="h-section">
              {selected === today ? `${T.today} · ` : ""}
              {fmtDayLong(selected)}
            </h2>
            <span className="caption num">
              {list.length} {list.length === 1 ? "reunião" : "reuniões"}
            </span>
          </div>
          {groups.length ? (
            <div className="timeline">
              {groups.map((g) => (
                <div key={g.p}>
                  <div className="period">{T.periods[g.p]}</div>
                  {g.items.map((c) => (
                    <MeetingCard key={c.id} card={c} stage={stageOf(base, c.stage_id)} owner={profileOf(base, c.owner_id)} />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="card">
              <Empty icon="calendar" title={T.empty.agenda} hint={member ? `${memberName} não tem reuniões neste dia.` : T.empty.agendaHint}>
                <Link className="btn btn-primary btn-sm" href={newHref}>
                  <Icon name="plus" size="sm" />
                  {T.actions.newMeeting}
                </Link>
              </Empty>
            </div>
          )}
        </section>
        {rest.length ? (
          <section className="section">
            <div className="section-head">
              <h2 className="h-section">{T.restOfWeek}</h2>
            </div>
            <div className="card list">
              {rest.map((c) => (
                <Link key={c.id} className="row" href={`/cards/${c.id}`}>
                  <Avatar name={profileOf(base, c.owner_id)?.full_name} className="tile" />
                  <span className="row-main">
                    <span className="row-title">{c.title}</span>
                    <span className="row-sub">
                      {fmtDay(dayKey(c.starts_at!), { weekday: "short" }).replace(".", "")} {fmtTime(c.starts_at!)}
                      {c.company_name ? ` · ${c.company_name}` : ""}
                    </span>
                  </span>
                  <span className="row-end">
                    <Icon name="chevron-right" size="sm" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
