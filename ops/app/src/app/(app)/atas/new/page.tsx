import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MinutesForm } from "@/components/minutes-form";
import { Topbar } from "@/components/shell/topbar";
import { Avatar, PageHead } from "@/components/ui/bits";
import { Icon } from "@/components/ui/icon";
import { requireMember } from "@/lib/auth";
import { byStart } from "@/lib/cards";
import { CARD_COLS, getBase, meetingsPipeline, profileOf, stageOf } from "@/lib/data";
import { dayKey, fmtDayShort, fmtTime } from "@/lib/format";
import { minutesDraft } from "@/lib/minutes-data";
import { createClient } from "@/lib/supabase/server";
import { T } from "@/lib/texts";
import type { Card } from "@/lib/types";

export const metadata: Metadata = { title: T.actions.createMinutes };

export default async function NewMinutesPage({ searchParams }: PageProps<"/atas/new">) {
  const sp = await searchParams;
  const me = await requireMember("/atas/new");
  const base = await getBase();
  const supabase = await createClient();
  const cardId = typeof sp.card === "string" && /^[0-9a-f-]{36}$/i.test(sp.card) ? sp.card : null;

  if (cardId) {
    const [{ data: card }, { data: existing }] = await Promise.all([
      supabase.from("cards").select(`${CARD_COLS}, card_participants(profile_id)`).eq("id", cardId).maybeSingle(),
      supabase.from("minutes").select("id").eq("card_id", cardId).maybeSingle(),
    ]);
    if (existing) redirect(`/atas/${existing.id}/edit`);
    const c = card as (Card & { card_participants: { profile_id: string }[] }) | null;
    if (c && base.pipelines.find((p) => p.id === c.pipeline_id)?.kind === "meetings") {
      const meeting = (
        <div className="alert info">
          <Icon name="calendar" />
          <div>
            <b>{c.title}</b>
            <div className="caption">
              {c.company_name} · {c.starts_at ? `${fmtDayShort(dayKey(c.starts_at))} ${fmtTime(c.starts_at)}` : ""} · {stageOf(base, c.stage_id).name}
            </div>
          </div>
        </div>
      );
      return (
        <>
          <Topbar title={T.actions.createMinutes} back={`/cards/${c.id}?tab=ata`} />
          <div className="page" style={{ maxWidth: 760 }}>
            <PageHead desktopOnly title={T.actions.createMinutes} sub={`${T.minutes.one} · ${c.company_name ?? ""}`} />
            <MinutesForm initial={minutesDraft(base, c, me)} meeting={meeting} writer={me.full_name} team={base.activeTeam} back={`/cards/${c.id}?tab=ata`} />
          </div>
        </>
      );
    }
  }

  // No meeting chosen: minutes are always born from a meeting.
  const mp = meetingsPipeline(base);
  const [{ data: cards }, { data: mins }] = await Promise.all([
    supabase.from("cards").select(CARD_COLS).eq("pipeline_id", mp?.id ?? "").is("archived_at", null),
    supabase.from("minutes").select("card_id"),
  ]);
  const has = new Set((mins ?? []).map((m) => m.card_id));
  const list = ((cards ?? []) as Card[]).filter((c) => c.starts_at && !has.has(c.id));
  const done = list.filter((c) => stageOf(base, c.stage_id).is_done).sort(byStart).reverse();
  const others = list.filter((c) => !stageOf(base, c.stage_id).is_done && !stageOf(base, c.stage_id).is_lost).sort(byStart).slice(0, 6);
  const li = (c: Card) => (
    <Link key={c.id} className="row" href={`/atas/new?card=${c.id}`}>
      <Avatar name={profileOf(base, c.owner_id)?.full_name} className="tile" />
      <span className="row-main">
        <span className="row-title">{c.title}</span>
        <span className="row-sub">{fmtDayShort(dayKey(c.starts_at!))} · {c.company_name} · {stageOf(base, c.stage_id).name}</span>
      </span>
      <span className="row-end"><Icon name="chevron-right" size="sm" /></span>
    </Link>
  );
  return (
    <>
      <Topbar title={T.actions.createMinutes} back="/atas" />
      <div className="page" style={{ maxWidth: 720 }}>
        <PageHead desktopOnly title={T.minutes.chooseMeeting} />
        <p className="caption" style={{ margin: "4px 0 14px" }}>{T.minutes.chooseHint}</p>
        {done.length ? (
          <section className="section" style={{ marginTop: 0 }}>
            <div className="section-head"><h2 className="h-section">Concluídas sem ata</h2></div>
            <div className="card list">{done.map(li)}</div>
          </section>
        ) : null}
        <section className="section">
          <div className="section-head"><h2 className="h-section">Outras reuniões</h2></div>
          <div className="card list">{others.length ? others.map(li) : <div className="empty"><p>Sem reuniões.</p></div>}</div>
        </section>
      </div>
    </>
  );
}
