import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MinutesForm } from "@/components/minutes-form";
import { Topbar } from "@/components/shell/topbar";
import { PageHead } from "@/components/ui/bits";
import { Icon } from "@/components/ui/icon";
import { requireMember } from "@/lib/auth";
import { getBase, profileOf, stageOf } from "@/lib/data";
import { dayKey, fmtDayShort, fmtTime } from "@/lib/format";
import { loadMinutes, minutesDraft } from "@/lib/minutes-data";
import { T } from "@/lib/texts";

export const metadata: Metadata = { title: `${T.actions.edit} ata` };

export default async function EditMinutesPage({ params }: PageProps<"/atas/[id]/edit">) {
  const { id } = await params;
  const me = await requireMember(`/atas/${id}/edit`);
  const [base, m] = await Promise.all([getBase(), loadMinutes(id)]);
  if (!m) notFound();
  const c = m.cards;
  const meeting = (
    <div className="alert info">
      <Icon name="calendar" />
      <div>
        <b>{c.title}</b>
        <div className="caption">{c.company_name} · {c.starts_at ? `${fmtDayShort(dayKey(c.starts_at))} ${fmtTime(c.starts_at)}` : ""} · {stageOf(base, c.stage_id).name}</div>
      </div>
    </div>
  );
  const title = `${T.actions.edit} ata`;
  // #10 #42 Final minutes are corrected only by an admin.
  if (m.status === "final" && me.role !== "admin") {
    return (
      <>
        <Topbar title={title} back={`/atas/${m.id}`} />
        <div className="page" style={{ maxWidth: 760 }}>
          <div className="alert" role="note" style={{ marginTop: 12 }}>
            <Icon name="alert" />
            <div>
              <b>Esta ata é final.</b> Só um admin a pode corrigir ou reabrir como rascunho.
              <div style={{ marginTop: 8 }}><Link className="btn btn-ghost btn-sm" href={`/atas/${m.id}`}>Ver a ata</Link></div>
            </div>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <Topbar title={title} back={`/atas/${m.id}`} />
      <div className="page" style={{ maxWidth: 760 }}>
        <PageHead desktopOnly title={title} sub={`${T.minutes.one} · ${c.company_name ?? ""}`} />
        <MinutesForm initial={minutesDraft(base, c, me, m)} meeting={meeting} writer={profileOf(base, m.written_by)?.full_name ?? me.full_name} team={base.activeTeam} back={`/atas/${m.id}`} isFinal={m.status === "final"} />
      </div>
    </>
  );
}
