import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MinutesDoc } from "@/components/minutes-doc";
import { Topbar } from "@/components/shell/topbar";
import { Icon } from "@/components/ui/icon";
import { requireMember } from "@/lib/auth";
import { getBase, profileOf, stageOf } from "@/lib/data";
import { loadMinutes } from "@/lib/minutes-data";
import { T } from "@/lib/texts";
import { ConcludeButton } from "./conclude-button";

export const metadata: Metadata = { title: T.minutes.one };

export default async function MinutesPage({ params }: PageProps<"/atas/[id]">) {
  const { id } = await params;
  await requireMember(`/atas/${id}`);
  const [base, m] = await Promise.all([getBase(), loadMinutes(id)]);
  if (!m) notFound();
  const canConclude = m.status === "final" && !stageOf(base, m.cards.stage_id).is_done;
  return (
    <>
      <Topbar title={T.minutes.one} back="/atas" actions={<Link className="btn btn-quiet btn-icon" href={`/atas/${m.id}/edit`} aria-label={T.actions.edit}><Icon name="pencil" /></Link>} />
      <div className="page" style={{ maxWidth: 820 }}>
        <div className="page-actions" style={{ justifyContent: "flex-end", padding: "8px 0 12px", flexWrap: "wrap" }}>
          {canConclude ? <ConcludeButton cardId={m.card_id} /> : null}
          <Link className="btn btn-ghost" href={`/atas/${m.id}/print`}><Icon name="printer" size="sm" />{T.actions.print}</Link>
          {m.status === "draft" ? (
            <Link className="btn btn-primary" href={`/atas/${m.id}/edit`}><Icon name="pencil" size="sm" />Continuar a escrever</Link>
          ) : (
            <Link className="btn btn-quiet only-desktop" href={`/atas/${m.id}/edit`}>{T.actions.edit}</Link>
          )}
        </div>
        <MinutesDoc m={m} card={m.cards} writer={profileOf(base, m.written_by)} approver={profileOf(base, m.approved_by)} />
      </div>
    </>
  );
}
