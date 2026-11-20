import type { Metadata } from "next";
import Link from "next/link";
import { Topbar } from "@/components/shell/topbar";
import { Avatar, PageHead, Pill } from "@/components/ui/bits";
import { Icon } from "@/components/ui/icon";
import { requireMember } from "@/lib/auth";
import { involves, isOpen, type Participation } from "@/lib/cards";
import { getBase, meetingsPipeline, stageOf } from "@/lib/data";
import { addDays, dayKey, mondayOf, toIso } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { T } from "@/lib/texts";
import { signOut } from "../../(auth)/actions";

export const metadata: Metadata = { title: T.nav.team };

export default async function TeamPage() {
  const me = await requireMember("/team");
  const base = await getBase();
  const supabase = await createClient();
  const monday = mondayOf(dayKey(new Date()));
  const mp = meetingsPipeline(base);
  const [{ data: week }, { data: open }] = await Promise.all([
    supabase.from("cards").select("id, owner_id, stage_id, card_participants(card_id, profile_id)").eq("pipeline_id", mp?.id ?? "").is("archived_at", null).gte("starts_at", toIso(monday)).lt("starts_at", toIso(addDays(monday, 7))),
    supabase.from("cards").select("id, owner_id, stage_id").neq("pipeline_id", mp?.id ?? "").is("archived_at", null),
  ]);
  const wk = ((week ?? []) as unknown as { id: string; owner_id: string | null; stage_id: string; card_participants: Participation[] }[]).filter((c) => !stageOf(base, c.stage_id)?.is_lost);
  const parts = wk.flatMap((c) => c.card_participants);
  const people = me.role === "admin" ? base.team : base.activeTeam;

  return (
    <>
      <Topbar title={T.nav.team} />
      <div className="page" style={{ maxWidth: 860 }}>
        <PageHead desktopOnly title={T.nav.team} />
        <div className="team-grid">
          {people.map((p) => {
            const n = wk.filter((c) => involves(c, p.id, parts)).length;
            const o = (open ?? []).filter((c) => c.owner_id === p.id && isOpen(stageOf(base, c.stage_id))).length;
            return (
              <div key={p.id} className="card member">
                <Link className="member-main" href={`/agenda?member=${p.id}`} aria-label={`Agenda de ${p.full_name}`}>
                <Avatar name={p.full_name} className="lg" />
                <div className="row-main">
                  <div className="inline">
                    <span className="row-title">{p.full_name}</span>
                    {p.role === "admin" ? <Pill stage={{ tone: "neutral", name: "Admin" }} /> : null}
                    {!p.active ? <Pill stage={{ tone: "warning", name: "Inativo" }} /> : null}
                  </div>
                  <div className="role">
                    {p.job_title ?? "—"}
                    {p.phone_whatsapp ? <> · <span className="num">WhatsApp {p.phone_whatsapp}</span></> : null}
                  </div>
                  <div className="load num">{n} {n === 1 ? "reunião" : "reuniões"} esta semana · {o} cartões abertos</div>
                </div>
                </Link>
                {me.role === "admin" || p.id === me.id ? (
                  <Link className="btn btn-quiet btn-icon btn-sm" href={`/team/${p.id}`} aria-label={`Editar ${p.full_name}`}>
                    <Icon name="pencil" size="sm" />
                  </Link>
                ) : (
                  <Icon name="chevron-right" size="sm" />
                )}
              </div>
            );
          })}
        </div>
        <section className="section">
          <div className="section-head"><h2 className="h-section">Conta</h2></div>
          <div className="card list">
            <Link className="row" href={`/team/${me.id}`}>
              <span className="row-main"><span className="row-title">Editar o meu perfil</span><span className="row-sub">Nome, função, WhatsApp</span></span>
              <span className="row-end"><Icon name="chevron-right" size="sm" /></span>
            </Link>
            <Link className="row only-phone" href="/settings/pipelines/reunioes">
              <span className="row-main"><span className="row-title">{T.nav.settings}</span><span className="row-sub">Etapas dos pipelines, modelos</span></span>
              <span className="row-end"><Icon name="chevron-right" size="sm" /></span>
            </Link>
            <form action={signOut}>
              <button className="row" type="submit">
                <span className="row-main"><span className="row-title">{T.nav.logout}</span></span>
                <span className="row-end"><Icon name="log-out" size="sm" /></span>
              </button>
            </form>
          </div>
        </section>
        {me.role === "admin" ? (
          <p className="caption" style={{ marginTop: 16 }}>Novas contas: <code>npm run user:create</code> (convites por email ficam para a fase 2).</p>
        ) : null}
      </div>
    </>
  );
}
