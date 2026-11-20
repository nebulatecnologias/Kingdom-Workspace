import clsx from "clsx";
import type { Metadata } from "next";
import Link from "next/link";
import { StatusPill } from "@/components/minutes-doc";
import { Topbar } from "@/components/shell/topbar";
import { Empty, PageHead } from "@/components/ui/bits";
import { Icon } from "@/components/ui/icon";
import { requireMember } from "@/lib/auth";
import { getBase, meetingsPipeline, profileOf, stageOf } from "@/lib/data";
import { needsMinutes } from "@/lib/cards";
import { dayKey, firstName, fmtDayShort } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { T } from "@/lib/texts";
import type { ActionItem } from "@/lib/types";

export const metadata: Metadata = { title: T.minutes.title };

export default async function MinutesListPage({ searchParams }: PageProps<"/atas">) {
  const sp = await searchParams;
  await requireMember("/atas");
  const base = await getBase();
  const filter = sp.status === "draft" || sp.status === "final" ? sp.status : "all";
  const supabase = await createClient();
  const mp = meetingsPipeline(base);
  const [{ data: mins }, { data: done }] = await Promise.all([
    supabase.from("minutes").select("id, title, held_at, status, written_by, updated_at, card_id, actions, cards!inner(company_name, archived_at)").is("cards.archived_at", null).order("updated_at", { ascending: false }),
    supabase.from("cards").select("id, title, stage_id, starts_at").eq("pipeline_id", mp?.id ?? "").is("archived_at", null),
  ]);
  const all = (mins ?? []) as unknown as { id: string; title: string; held_at: string | null; status: "draft" | "final"; written_by: string | null; card_id: string; actions: ActionItem[]; cards: { company_name: string | null } | null }[];
  const withMinutes = new Set(all.map((m) => m.card_id));
  const now = new Date();
  const today = dayKey(now);
  // Same rule as Início and the sidebar (#3): done meetings that already happened and have no ata at all.
  const missing = (done ?? []).filter((c) => needsMinutes(c, stageOf(base, c.stage_id), withMinutes, now.getTime()));
  // #44 #46 Pending actions of every ata, overdue first.
  const pending = all
    .flatMap((m) => (m.actions ?? []).map((a, i) => ({ ...a, i, m })))
    .filter((a) => a.what && a.status !== "done")
    .sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"));
  const items = all.filter((m) => filter === "all" || m.status === filter);
  const count = (k: string) => (k === "all" ? all.length : all.filter((m) => m.status === k).length);

  return (
    <>
      <Topbar title={T.minutes.title} actions={<Link className="btn btn-quiet btn-icon" href="/atas/new" aria-label={T.actions.createMinutes}><Icon name="plus" /></Link>} />
      <div className="page">
        <PageHead desktopOnly title={T.minutes.title} actions={<Link className="btn btn-primary" href="/atas/new"><Icon name="plus" />{T.actions.createMinutes}</Link>} />
        {missing.length ? (
          <div className="alert" style={{ marginBottom: 14 }}>
            <Icon name="alert" />
            <div>
              <b>{missing.length} {missing.length === 1 ? "reunião concluída sem ata" : "reuniões concluídas sem ata"}</b>
              <div className="inline" style={{ marginTop: 6, flexWrap: "wrap" }}>
                {missing.map((c) => (
                  <Link key={c.id} className="btn btn-ghost btn-sm" href={`/atas/new?card=${c.id}`}><Icon name="plus" size="xs" />{c.title}</Link>
                ))}
              </div>
            </div>
          </div>
        ) : null}
        {pending.length ? (
          <section className="section" style={{ marginTop: 0, marginBottom: 18 }}>
            <div className="section-head"><h2 className="h-section">Ações pendentes · {pending.length}</h2></div>
            <div className="card list">
              {pending.slice(0, 12).map((a) => {
                const late = !!a.due && a.due < today;
                return (
                  <Link key={`${a.m.id}:${a.i}`} className="row" href={`/atas/${a.m.id}`}>
                    <span className="tile"><Icon name={late ? "alert" : "check-square"} /></span>
                    <span className="row-main">
                      <span className="row-title">{a.what}</span>
                      <span className="row-sub">
                        {a.who || "Sem responsável"} · <span className={late ? "action-late" : undefined}>{a.due ? `${fmtDayShort(a.due)}${late ? " · atrasada" : ""}` : "sem prazo"}</span> · {a.m.title}
                      </span>
                    </span>
                    <span className="row-end"><Icon name="chevron-right" size="sm" /></span>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
        <div className="segmented always" style={{ display: "inline-flex", marginBottom: 12 }}>
          {([["all", "Todas"], ["draft", "Rascunhos"], ["final", "Finais"]] as const).map(([k, l]) => (
            <Link key={k} className={clsx("seg-link", filter === k && "is-active")} href={k === "all" ? "/atas" : `/atas?status=${k}`}>
              {l}<span className="n num">{count(k)}</span>
            </Link>
          ))}
        </div>
        {items.length ? (
          <>
            <div className="card list only-phone">
              {items.map((m) => (
                <Link key={m.id} className="row" href={`/atas/${m.id}`}>
                  <span className="tile"><Icon name="file-text" /></span>
                  <span className="row-main">
                    <span className="row-title">{m.title}</span>
                    <span className="row-sub">
                      {[m.cards?.company_name, m.held_at ? fmtDayShort(m.held_at) : null, firstName(profileOf(base, m.written_by)?.full_name ?? "")].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="row-end"><StatusPill status={m.status} /><Icon name="chevron-right" size="sm" /></span>
                </Link>
              ))}
            </div>
            <div className="card only-desktop">
              <table className="table">
                <thead><tr><th>Reunião</th><th>Empresa</th><th>Data</th><th>Estado</th><th>{T.minutes.writtenBy}</th></tr></thead>
                <tbody>
                  {items.map((m) => (
                    <tr key={m.id}>
                      <td className="strong"><Link href={`/atas/${m.id}`}>{m.title}</Link></td>
                      <td>{m.cards?.company_name}</td>
                      <td className="num">{m.held_at ? fmtDayShort(m.held_at) : "—"}</td>
                      <td><StatusPill status={m.status} /></td>
                      <td>{profileOf(base, m.written_by)?.full_name ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="card"><Empty icon="file-text" title={T.minutes.none} hint={T.minutes.noneHint} /></div>
        )}
      </div>
    </>
  );
}
