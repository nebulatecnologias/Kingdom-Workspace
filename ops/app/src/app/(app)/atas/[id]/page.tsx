import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MinutesDoc } from "@/components/minutes-doc";
import { Topbar } from "@/components/shell/topbar";
import { Icon } from "@/components/ui/icon";
import { requireMember } from "@/lib/auth";
import { getBase, profileOf, stageOf } from "@/lib/data";
import { dayKey, localTime } from "@/lib/format";
import { loadMinutes } from "@/lib/minutes-data";
import { createClient } from "@/lib/supabase/server";
import { T } from "@/lib/texts";
import { ConcludeButton } from "./conclude-button";
import { ActionTask, DeleteMinutesButton } from "./minutes-tools";

export const metadata: Metadata = { title: T.minutes.one };

export default async function MinutesPage({ params }: PageProps<"/atas/[id]">) {
  const { id } = await params;
  const me = await requireMember(`/atas/${id}`);
  const [base, m] = await Promise.all([getBase(), loadMinutes(id)]);
  if (!m) notFound();
  const supabase = await createClient();
  // Tasks already created from this ata's actions (#44).
  const { data: tasks } = await supabase.from("cards").select("id, fields").eq("fields->>source_minutes", m.id).is("archived_at", null);
  const taskOf = (i: number) => (tasks ?? []).find((t) => (t.fields as { source_action?: string })?.source_action === `${m.id}:${i}`)?.id ?? null;
  const st = stageOf(base, m.cards.stage_id);
  const canConclude = m.status === "final" && !st.is_done && !st.is_lost;
  const admin = me.role === "admin";
  // #10 #42 A final ata is changed only by an admin; a draft by anyone in the team.
  const canEdit = m.status === "draft" || admin;
  const canDelete = admin || (m.status === "draft" && m.written_by === me.id);
  // #45 "Marcar na agenda": a new meeting pre-filled from this one, on the agreed date.
  const schedule = m.next_meeting_at
    ? `/cards/new?pipeline=reunioes&from=${m.card_id}&date=${dayKey(m.next_meeting_at)}&time=${localTime(m.next_meeting_at)}`
    : null;
  return (
    <>
      <Topbar
        title={T.minutes.one}
        back="/atas"
        actions={canEdit ? <Link className="btn btn-quiet btn-icon" href={`/atas/${m.id}/edit`} aria-label={T.actions.edit}><Icon name="pencil" /></Link> : undefined}
      />
      <div className="page" style={{ maxWidth: 820 }}>
        <div className="page-actions" style={{ justifyContent: "flex-end", padding: "8px 0 12px", flexWrap: "wrap" }}>
          {canConclude ? <ConcludeButton cardId={m.card_id} /> : null}
          <Link className="btn btn-ghost" href={`/atas/${m.id}/print`}><Icon name="printer" size="sm" />{T.actions.print}</Link>
          {canDelete ? <DeleteMinutesButton id={m.id} /> : null}
          {m.status === "draft" ? (
            <Link className="btn btn-primary" href={`/atas/${m.id}/edit`}><Icon name="pencil" size="sm" />Continuar a escrever</Link>
          ) : canEdit ? (
            <Link className="btn btn-quiet only-desktop" href={`/atas/${m.id}/edit`}>{T.actions.edit}</Link>
          ) : null}
        </div>
        {m.status === "final" && !admin ? (
          <p className="caption" style={{ margin: "0 0 12px" }}>Ata final: só um admin a pode corrigir ou reabrir.</p>
        ) : null}
        <MinutesDoc
          m={m}
          card={m.cards}
          writer={profileOf(base, m.written_by)}
          approver={profileOf(base, m.approved_by)}
          actionTools={(i) => <ActionTask minutesId={m.id} index={i} taskId={taskOf(i)} />}
          nextTools={schedule ? <Link className="btn btn-ghost btn-sm no-print" href={schedule}><Icon name="calendar" size="xs" />Marcar na agenda</Link> : null}
        />
      </div>
    </>
  );
}
