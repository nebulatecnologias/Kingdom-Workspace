import Link from "next/link";
import { Bars } from "@/components/bars";
import { MeetingCard } from "@/components/cards";
import { Countdown } from "@/components/countdown";
import { Avatar, Empty, PageHead } from "@/components/ui/bits";
import { Icon } from "@/components/ui/icon";
import { requireMember } from "@/lib/auth";
import { locationIcon, type Participation } from "@/lib/cards";
import { computeDashboard } from "@/lib/dashboard";
import { CARD_COLS, getBase, profileOf, stageOf } from "@/lib/data";
import { dayKey, firstName, fmtDayLong, fmtDayShort, fmtMoney, fmtTime, greeting } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { T } from "@/lib/texts";
import type { ActionItem, Activity, Card } from "@/lib/types";

export default async function HomePage() {
  const me = await requireMember();
  const now = new Date();
  const since = new Date(now.getTime() - 31 * 86400000).toISOString();
  const supabase = await createClient();
  const [base, cardsRes, minRes, actRes] = await Promise.all([
    getBase(),
    supabase.from("cards").select(`${CARD_COLS}, card_participants(card_id, profile_id)`).is("archived_at", null),
    supabase.from("minutes").select("card_id, status, actions, cards!inner(archived_at)").is("cards.archived_at", null),
    supabase.from("card_activity").select("type, to_stage_id, at").gte("at", since).in("type", ["stage_changed", "rescheduled"]),
  ]);
  const rows = (cardsRes.data ?? []) as (Card & { card_participants: Participation[] })[];
  const d = computeDashboard({
    now, me: me.id, team: base.team, pipelines: base.pipelines, stages: base.stages, cards: rows,
    parts: rows.flatMap((r) => r.card_participants),
    minutes: (minRes.data ?? []) as unknown as { card_id: string; status: "draft" | "final" }[],
    activity: (actRes.data ?? []) as Pick<Activity, "type" | "to_stage_id" | "at">[],
  });
  const hello = `${greeting(now)}, ${firstName(me.full_name)}`;
  const pendingActions = ((minRes.data ?? []) as unknown as { actions: ActionItem[] }[]).flatMap((m) => m.actions ?? []).filter((a) => a.what && a.status !== "done").length;
  const next = d.next;

  let nextCard;
  if (next) {
    const owner = profileOf(base, next.owner_id);
    const involved = next.owner_id === me.id || rows.find((r) => r.id === next.id)?.card_participants.some((p) => p.profile_id === me.id);
    const label = involved || !owner ? T.next.title : `${T.next.title} · ${firstName(owner.full_name)}`;
    nextCard = (
      <section className="next-card" aria-label={label}>
        <div className="eyebrow">
          <span>{label}</span>
          <strong className="num">{fmtTime(next.starts_at!)} · <Countdown start={next.starts_at!} end={next.ends_at} initialNow={now.getTime()} /></strong>
        </div>
        <h2 className="h-title">{next.title}</h2>
        <div className="meta">
          {[next.company_name, next.contact_name ? `${next.contact_name}${next.contact_role ? `, ${next.contact_role}` : ""}` : null].filter(Boolean).join(" · ")}
        </div>
        {next.location ? (
          <div className="where"><Icon name={locationIcon(next.location_kind)} size="sm" /><span>{next.location}</span></div>
        ) : null}
        <div className="actions">
          <Link className="btn btn-on-dark" href={`/cards/${next.id}`}>{T.actions.open}<Icon name="arrow-right" size="sm" /></Link>
        </div>
      </section>
    );
  } else {
    nextCard = (
      <section className="card card-pad">
        <div className="h-title">{T.next.none}</div>
        <p className="caption" style={{ margin: "4px 0 0" }}>Bom momento para escrever as atas em falta.</p>
      </section>
    );
  }

  const left = (
    <>
      {nextCard}
      <section className="section">
        <div className="section-head">
          <h2 className="h-section">{T.today} · {fmtDayShort(d.today)}</h2>
          <Link href="/agenda">{T.actions.seeAll}</Link>
        </div>
        {d.rest.length ? (
          <div className="timeline">
            {d.rest.map((c) => <MeetingCard key={c.id} card={c} stage={stageOf(base, c.stage_id)} owner={profileOf(base, c.owner_id)} />)}
          </div>
        ) : (
          <div className="card">
            <Empty icon="calendar" title={next ? "Mais nada hoje" : T.empty.agenda} hint={next ? "Depois desta reunião, o dia está livre." : T.empty.agendaHint} />
          </div>
        )}
      </section>
      <section className="section">
        <div className="section-head"><h2 className="h-section">{T.operation}</h2></div>
        <div className="card list">
          {d.operation.map((o) => (
            <Link key={o.pipeline.id} className="row ops-row" href={`/pipelines/${o.pipeline.slug}`}>
              <span className="ops-icon"><Icon name={o.pipeline.icon} /></span>
              <span className="row-main">
                <span className="row-title">{o.pipeline.name}</span>
                <span className="count-line">
                  {o.parts.length ? o.parts.map((p, i) => (
                    <span key={i} style={{ color: "inherit", margin: 0 }}>
                      {i ? <span>·</span> : null}
                      <b className="num">{p.label === "em aberto" ? fmtMoney(Number(p.n)) : p.n}</b> {p.label}
                    </span>
                  )) : "Nada em aberto"}
                </span>
              </span>
              <span className="row-end"><Icon name="chevron-right" size="sm" /></span>
            </Link>
          ))}
          <Link className="row ops-row" href="/atas">
            <span className="ops-icon"><Icon name="file-text" /></span>
            <span className="row-main">
              <span className="row-title">{T.minutes.title}</span>
              <span className="count-line"><b>{d.missing.length}</b> em falta <span>·</span> <b>{d.drafts}</b> {d.drafts === 1 ? "rascunho" : "rascunhos"}{pendingActions ? <> <span>·</span> <b>{pendingActions}</b> {pendingActions === 1 ? "ação pendente" : "ações pendentes"}</> : null}</span>
            </span>
            <span className="row-end"><Icon name="chevron-right" size="sm" /></span>
          </Link>
        </div>
      </section>
    </>
  );

  const right = (
    <>
      <div className="card card-pad counts">
        <div><span>Reuniões hoje <span className="delta">· {d.mine.length} {d.mine.length === 1 ? "sua" : "suas"}</span></span><span className="value">{d.todayAll.length}</span></div>
        <div><span>Reuniões esta semana <span className="delta">· seg a dom · {d.weekAhead} por fazer</span></span><span className="value">{d.weekCount}</span></div>
        <div><span>Atas em falta <span className="delta">· sem ata · {d.drafts} {d.drafts === 1 ? "rascunho" : "rascunhos"} à parte</span></span><span className="value">{d.missing.length}</span></div>
        <div><span>Tarefas atrasadas <span className="delta">· de {d.openTasks} abertas</span></span><span className="value">{d.lateTasks}</span></div>
        <div><span>Adiadas / canceladas <span className="delta">· 30 dias{d.completion !== null ? ` · ${d.completion}% concluídas` : ""}</span></span><span className="value">{d.postponed} / {d.cancelled}</span></div>
      </div>
      <section className="section">
        <div className="section-head"><h2 className="h-section">Reuniões por etapa · 30 dias</h2></div>
        <div className="card card-pad"><Bars rows={d.byStage} /></div>
      </section>
      <section className="section">
        <div className="section-head"><h2 className="h-section">Reuniões por pessoa · esta semana</h2></div>
        <div className="card card-pad"><Bars rows={d.byPerson} /></div>
      </section>
      {d.sales.some((s) => s.value) ? (
        <section className="section">
          <div className="section-head"><h2 className="h-section">Vendas por etapa</h2></div>
          <div className="card card-pad"><Bars rows={d.sales.map((s) => ({ ...s, text: fmtMoney(s.value).replace(/\s?MZN/, "") }))} /></div>
        </section>
      ) : null}
      <section className="section">
        <div className="section-head"><h2 className="h-section">{T.minutes.missing}</h2><Link href="/atas">{T.actions.seeAll}</Link></div>
        {d.missing.length ? (
          <div className="card list">
            {d.missing.map((c) => (
              <Link key={c.id} className="row" href={`/atas/new?card=${c.id}`}>
                <span className="tile"><Icon name="file-text" /></span>
                <span className="row-main">
                  <span className="row-title">{c.title}</span>
                  <span className="row-sub">{[c.company_name, fmtDayShort(dayKey(c.starts_at!))].filter(Boolean).join(" · ")}</span>
                </span>
                <span className="row-end"><span className="btn btn-ghost btn-sm">{T.actions.createMinutes}</span></span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card"><Empty icon="check" title="Tudo em dia" hint="Todas as reuniões concluídas têm ata." /></div>
        )}
      </section>
    </>
  );

  return (
    <>
      <header className="topbar home">
        <div style={{ flex: 1 }}>
          <div className="caption">{fmtDayLong(d.today)}</div>
          <h1 className="h-display">{hello}</h1>
        </div>
        <Link href="/team" aria-label={T.nav.team}><Avatar name={me.full_name} className="lg" /></Link>
      </header>
      <div className="page">
        <PageHead
          desktopOnly
          title={hello}
          sub={fmtDayLong(d.today)}
          actions={
            <>
              <Link className="btn btn-ghost" href="/agenda"><Icon name="calendar" />{T.nav.agenda}</Link>
              <Link className="btn btn-primary" href="/cards/new?pipeline=reunioes"><Icon name="plus" />{T.actions.newMeeting}</Link>
            </>
          }
        />
        <div className="home-grid">
          <div>{left}</div>
          <div className="only-desktop">{right}</div>
        </div>
      </div>
    </>
  );
}
