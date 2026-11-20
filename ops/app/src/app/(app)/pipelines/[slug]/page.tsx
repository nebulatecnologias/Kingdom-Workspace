import clsx from "clsx";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CardItemBody } from "@/components/cards";
import { Kanban } from "@/components/kanban";
import { Topbar } from "@/components/shell/topbar";
import { Icon } from "@/components/ui/icon";
import { requireMember } from "@/lib/auth";
import { involves, isOpen, type Participation } from "@/lib/cards";
import { CARD_COLS, getBase, profileOf, stageOf, stagesOf } from "@/lib/data";
import { fmtMoney, nowMs } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { T } from "@/lib/texts";
import type { Card } from "@/lib/types";
import { MemberSelect } from "./member-select";

export const metadata: Metadata = { title: T.nav.pipelines };

export default async function PipelinePage({ params, searchParams }: PageProps<"/pipelines/[slug]">) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  await requireMember(`/pipelines/${slug}`);
  const base = await getBase();
  const pl = base.pipelines.find((p) => p.slug === slug);
  if (!pl) notFound();
  const member = typeof sp.member === "string" && base.team.some((p) => p.id === sp.member) ? sp.member : "";
  const supabase = await createClient();
  const { data } = await supabase.from("cards").select(`${CARD_COLS}, card_participants(card_id, profile_id)`).eq("pipeline_id", pl.id).is("archived_at", null);
  const rows = (data ?? []) as (Card & { card_participants: Participation[] })[];
  // #18 Meetings are ordered by date and time inside each column.
  if (pl.kind === "meetings") {
    const byStage = new Map<string, typeof rows>();
    for (const r of rows) byStage.set(r.stage_id, [...(byStage.get(r.stage_id) ?? []), r]);
    for (const list of byStage.values()) list.sort((a, b) => +new Date(a.starts_at ?? 0) - +new Date(b.starts_at ?? 0)).forEach((r, i) => (r.position = i + 1));
  }
  // #47 The reason given when a card went into a stage that asks for one (e.g. Bloqueado).
  const noteStages = new Set(stagesOf(base, pl.id).filter((s) => s.requires_note).map((s) => s.id));
  const waiting = rows.filter((r) => noteStages.has(r.stage_id)).map((r) => r.id);
  const { data: notes } = waiting.length
    ? await supabase.from("card_activity").select("card_id, to_stage_id, note, at").in("card_id", waiting).not("note", "is", null).order("at", { ascending: false })
    : { data: [] };
  const reasonOf = (c: Card) => (notes ?? []).find((n) => n.card_id === c.id && n.to_stage_id === c.stage_id)?.note ?? null;
  const parts = rows.flatMap((r) => r.card_participants);
  const all = rows.filter((c) => involves(c, member, parts));
  const now = nowMs();
  const stages = stagesOf(base, pl.id);
  const openValue = all.filter((c) => isOpen(stageOf(base, c.stage_id))).reduce((s, c) => s + (c.value_cents ?? 0), 0);
  const sub = pl.kind === "sales" ? `${fmtMoney(openValue)} em aberto` : `${all.length} ${all.length === 1 ? "cartão" : "cartões"}`;

  return (
    <>
      <Topbar
        title={pl.name}
        actions={<Link className="btn btn-quiet btn-icon" href={`/cards/new?pipeline=${pl.slug}`} aria-label={T.actions.newCard[pl.kind]}><Icon name="plus" /></Link>}
      />
      <div className="page" style={{ maxWidth: "none" }}>
        <div className="page-head only-desktop">
          <div>
            <div className="caption">
              {T.nav.pipelines} · <span className="num">{sub}</span>
            </div>
            <h1 className="h-display inline" style={{ gap: 10 }}>
              <span className="tile" style={{ width: 36, height: 36, background: "var(--card)" }}><Icon name={pl.icon} /></span>
              {pl.name}
            </h1>
          </div>
          <div className="page-actions">
            <MemberSelect slug={pl.slug} member={member} team={base.activeTeam} />
            <Link className="btn btn-ghost btn-icon" href={`/settings/pipelines/${pl.slug}`} aria-label={T.nav.settings}><Icon name="settings" /></Link>
            <Link className="btn btn-primary" href={`/cards/new?pipeline=${pl.slug}`}><Icon name="plus" />{T.actions.newCard[pl.kind]}</Link>
          </div>
        </div>
        <div className="pipeline-switch">
          {base.pipelines.map((p) => (
            <Link key={p.id} className={clsx("chip", p.id === pl.id && "is-active")} href={`/pipelines/${p.slug}`}>
              <Icon name={p.icon} size="sm" />
              {p.name}
            </Link>
          ))}
        </div>
        <Kanban
          key={`${pl.id}:${member}`}
          sales={pl.kind === "sales"}
          meeting={pl.kind === "meetings"}
          stages={stages}
          cards={all.map((c) => ({
            id: c.id,
            stage_id: c.stage_id,
            position: c.position,
            value_cents: c.value_cents,
            body: <CardItemBody card={c} pipeline={pl} stage={stageOf(base, c.stage_id)} owner={profileOf(base, c.owner_id)} now={now} reason={reasonOf(c)} />,
          }))}
        />
      </div>
    </>
  );
}
