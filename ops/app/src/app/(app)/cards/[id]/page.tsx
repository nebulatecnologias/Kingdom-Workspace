import clsx from "clsx";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityItem } from "@/components/activity";
import { MoveButton } from "@/components/move-sheet";
import { Topbar } from "@/components/shell/topbar";
import { Avatar, Empty, Pill } from "@/components/ui/bits";
import { Icon } from "@/components/ui/icon";
import { requireMember } from "@/lib/auth";
import { getBase, pipelineOf, profileOf, stageOf, stagesOf } from "@/lib/data";
import { dayKey, firstName, fmtDayLong, fmtDayShort, fmtMoney, fmtTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { T } from "@/lib/texts";
import type { Activity, Minutes } from "@/lib/types";
import { loadCard } from "../load";

export const metadata: Metadata = { title: "Cartão" };

export default async function CardPage({ params, searchParams }: PageProps<"/cards/[id]">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  await requireMember(`/cards/${id}`);
  const supabase = await createClient();
  const [base, card, acts, mins] = await Promise.all([
    getBase(),
    loadCard(id),
    supabase.from("card_activity").select("*").eq("card_id", id).order("at", { ascending: false }),
    supabase.from("minutes").select("id, title, held_at, status, written_by").eq("card_id", id).maybeSingle(),
  ]);
  if (!card) notFound();
  const pl = pipelineOf(base, card.pipeline_id);
  const st = stageOf(base, card.stage_id);
  const owner = profileOf(base, card.owner_id);
  const parts = card.card_participants.map((p) => profileOf(base, p.profile_id)).filter((p) => p !== null);
  const activity = (acts.data ?? []) as Activity[];
  const m = mins.data as Pick<Minutes, "id" | "title" | "held_at" | "status" | "written_by"> | null;
  const meeting = pl.kind === "meetings";
  const tab = sp.tab === "ata" && meeting ? "ata" : sp.tab === "history" ? "history" : "details";
  const back = meeting ? "/agenda" : `/pipelines/${pl.slug}`;

  const rows: [string, React.ReactNode][] = meeting
    ? [
        ["Quando", card.starts_at ? <span className="num">{fmtDayLong(dayKey(card.starts_at))}, {fmtTime(card.starts_at)}{card.ends_at ? `–${fmtTime(card.ends_at)}` : ""}</span> : "—"],
        [
          "Onde",
          <>
            {card.location_kind ? T.location[card.location_kind] : ""}
            {card.location && card.location_kind !== "phone" ? " · " : ""}
            {card.location && card.location_kind === "online" ? (
              <a href={card.location} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>{card.location}</a>
            ) : card.location_kind !== "phone" ? card.location : null}
          </>,
        ],
        [
          "Pessoa",
          <>
            {card.contact_name || "—"}
            {card.contact_role ? `, ${card.contact_role}` : ""}
            {card.contact_phone ? <><br /><a href={`tel:${card.contact_phone}`} className="muted">{card.contact_phone}</a></> : null}
            {card.contact_email ? <><br /><a href={`mailto:${card.contact_email}`} className="muted">{card.contact_email}</a></> : null}
          </>,
        ],
        ["Empresa", <>{card.company_name || "—"}{card.company_sector ? ` · ${card.company_sector}` : ""}</>],
        ["Responsável", owner ? <span className="inline"><Avatar name={owner.full_name} className="sm" />{owner.full_name}</span> : "—"],
        [
          "Participantes",
          parts.length ? (
            <span className="inline" style={{ flexWrap: "wrap" }}>
              {parts.map((p) => <span key={p.id} className="inline"><Avatar name={p.full_name} className="sm" />{firstName(p.full_name)}</span>)}
            </span>
          ) : <span className="muted">—</span>,
        ],
        ["Notas", card.description ? <span style={{ whiteSpace: "pre-wrap" }}>{card.description}</span> : <span className="muted">—</span>],
      ]
    : [
        ...(card.value_cents ? [[pl.kind === "campaigns" ? "Orçamento" : "Valor", <span key="v" className="num strong">{fmtMoney(card.value_cents)}</span>] as [string, React.ReactNode]] : []),
        ...(card.due_at ? [[pl.kind === "sales" ? "Fecho previsto" : pl.kind === "campaigns" ? "Lançamento" : "Prazo", <span key="d" className="num">{fmtDayLong(dayKey(card.due_at))}</span>] as [string, React.ReactNode]] : []),
        ...(typeof card.fields?.channel === "string" ? [["Canal", card.fields.channel] as [string, React.ReactNode]] : []),
        ...(card.company_name ? [["Empresa", `${card.company_name}${card.company_sector ? ` · ${card.company_sector}` : ""}`] as [string, React.ReactNode]] : []),
        ...(card.contact_name ? [["Pessoa", <>{card.contact_name}{card.contact_role ? `, ${card.contact_role}` : ""}{card.contact_phone ? <><br /><span className="muted">{card.contact_phone}</span></> : null}</>] as [string, React.ReactNode]] : []),
        ["Responsável", owner ? <span className="inline"><Avatar name={owner.full_name} className="sm" />{owner.full_name}</span> : "—"],
        ["Descrição", card.description ? <span style={{ whiteSpace: "pre-wrap" }}>{card.description}</span> : <span className="muted">—</span>],
      ];

  const tabHref = (t: string) => `/cards/${card.id}${t === "details" ? "" : `?tab=${t}`}`;
  return (
    <>
      <Topbar
        title={T.kind[pl.kind]}
        back={back}
        actions={<Link className="btn btn-quiet btn-icon" href={`/cards/${card.id}/edit`} aria-label={T.actions.edit}><Icon name="pencil" /></Link>}
      />
      <div className="page" style={{ maxWidth: 860 }}>
        <div className="page-head" style={{ paddingTop: 8, alignItems: "flex-start", flexDirection: "column", gap: 12 }}>
          <div>
            <div className="caption">
              <Link href={`/pipelines/${pl.slug}`}>{pl.name}</Link>
              {card.company_name ? ` · ${card.company_name}` : ""}
            </div>
            <h1 className="h-display" style={{ marginTop: 4 }}>{card.title}</h1>
            <div className="inline" style={{ marginTop: 10, flexWrap: "wrap" }}>
              <Pill stage={st} changed={sp.moved === "1"} />
              {meeting && card.starts_at ? (
                <span className="caption num">{fmtDayShort(dayKey(card.starts_at))} · {fmtTime(card.starts_at)}</span>
              ) : card.due_at ? (
                <span className="caption num">{fmtDayShort(dayKey(card.due_at))}</span>
              ) : null}
              {owner ? <span className="caption inline"><Avatar name={owner.full_name} className="sm" />{firstName(owner.full_name)}</span> : null}
            </div>
          </div>
          <div className="page-actions" style={{ width: "100%", flexWrap: "wrap" }}>
            <MoveButton cardId={card.id} current={card.stage_id} stages={stagesOf(base, pl.id)} />
            <Link className="btn btn-ghost btn-icon" href={`/cards/${card.id}/edit`} aria-label={T.actions.edit}><Icon name="pencil" size="sm" /></Link>
          </div>
        </div>
        {sp.created === "1" || sp.saved === "1" ? (
          <div className="alert info" role="status" style={{ marginBottom: 12 }}>
            <Icon name="check" />
            <span>{sp.created === "1" ? `${T.form.created}: ${st.name}.` : T.form.saved}</span>
          </div>
        ) : null}
        <nav className="tabs" aria-label="Separadores">
          <Link className={clsx("tab-link", tab === "details" && "is-active")} href={tabHref("details")} replace scroll={false} aria-current={tab === "details" ? "page" : undefined}>Detalhes</Link>
          {meeting ? (
            <Link className={clsx("tab-link", tab === "ata" && "is-active")} href={tabHref("ata")} replace scroll={false} aria-current={tab === "ata" ? "page" : undefined}>
              {T.minutes.one}
              {m ? <span className="n">{m.status === "final" ? "final" : "rascunho"}</span> : null}
            </Link>
          ) : null}
          <Link className={clsx("tab-link", tab === "history" && "is-active")} href={tabHref("history")} replace scroll={false} aria-current={tab === "history" ? "page" : undefined}>
            Histórico<span className="n num">{activity.length}</span>
          </Link>
        </nav>
        {tab === "details" ? (
          <div className="card card-pad">
            <dl className="kv">
              {rows.map(([k, v]) => (
                <div key={k} style={{ display: "contents" }}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : tab === "history" ? (
          <div className="card card-pad">
            <div className="activity">
              {activity.length ? activity.map((a) => (
                <ActivityItem key={a.id} a={a} actor={profileOf(base, a.actor_id)} to={a.to_stage_id ? base.stages.find((s) => s.id === a.to_stage_id) ?? null : null} />
              )) : <span className="caption">Sem histórico.</span>}
            </div>
          </div>
        ) : m ? (
          <div className="card">
            <Link className="row" href={`/atas/${m.id}`} style={{ minHeight: 64 }}>
              <span className="tile"><Icon name="file-text" /></span>
              <span className="row-main">
                <span className="row-title">{m.title}</span>
                <span className="row-sub">
                  {T.minutes.writtenBy} {profileOf(base, m.written_by)?.full_name ?? "—"}
                  {m.held_at ? ` · ${fmtDayShort(m.held_at)}` : ""}
                </span>
              </span>
              <span className="row-end">
                {m.status === "final" ? <Pill stage={{ tone: "success", name: T.minutes.final }} /> : <Pill stage={{ tone: "warning", name: T.minutes.draft }} />}
                <Icon name="chevron-right" size="sm" />
              </span>
            </Link>
          </div>
        ) : (
          <div className="card">
            <Empty icon="file-text" title={T.minutes.noMinutes} hint={T.minutes.noMinutesHint}>
              <Link className="btn btn-primary btn-sm" href={`/atas/new?card=${card.id}`}><Icon name="plus" size="sm" />{T.actions.createMinutes}</Link>
            </Empty>
          </div>
        )}
      </div>
    </>
  );
}
