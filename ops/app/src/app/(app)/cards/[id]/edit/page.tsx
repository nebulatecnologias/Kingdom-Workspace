import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CardForm, type CardDraft } from "@/components/card-form";
import { Topbar } from "@/components/shell/topbar";
import { PageHead } from "@/components/ui/bits";
import { requireMember } from "@/lib/auth";
import { getBase, getCompanies, pipelineOf } from "@/lib/data";
import { dayKey, localTime, minutesDiff } from "@/lib/format";
import { T } from "@/lib/texts";
import { loadCard } from "../../load";

export const metadata: Metadata = { title: T.actions.edit };

export default async function EditCardPage({ params }: PageProps<"/cards/[id]/edit">) {
  const { id } = await params;
  const me = await requireMember(`/cards/${id}/edit`);
  const [base, card, companies] = await Promise.all([getBase(), loadCard(id), getCompanies()]);
  if (!card) notFound();
  const pl = pipelineOf(base, card.pipeline_id);
  const initial: CardDraft = {
    id: card.id, pipeline_id: pl.id, kind: pl.kind, title: card.title, owner_id: card.owner_id ?? me.id,
    date: card.starts_at ? dayKey(card.starts_at) : dayKey(new Date()), time: card.starts_at ? localTime(card.starts_at) : "10:00",
    duration: card.starts_at && card.ends_at ? minutesDiff(card.ends_at, card.starts_at) : 60,
    location_kind: card.location_kind ?? "in_person", location: card.location_kind === "phone" ? "" : (card.location ?? ""),
    contact_name: card.contact_name ?? "", contact_role: card.contact_role ?? "", contact_phone: card.contact_phone ?? "", contact_email: card.contact_email ?? "",
    company_name: card.company_name ?? "", company_sector: card.company_sector ?? "",
    value: card.value_cents != null ? String(Math.round(card.value_cents / 100)) : "", due: card.due_at ? dayKey(card.due_at) : "",
    description: card.description ?? "", channel: typeof card.fields?.channel === "string" ? card.fields.channel : "LinkedIn",
    participants: card.card_participants.map((p) => p.profile_id),
  };
  const title = `${T.actions.edit} ${T.kind[pl.kind].toLowerCase()}`;
  const back = `/cards/${card.id}`;
  return (
    <>
      <Topbar title={title} back={back} />
      <div className="page" style={{ maxWidth: 720 }}>
        <PageHead desktopOnly title={title} sub={pl.name} actions={<Link className="btn btn-quiet" href={back}>{T.actions.cancel}</Link>} />
        <CardForm initial={initial} team={base.activeTeam} back={back} submitLabel={T.actions.save} companies={companies} />
      </div>
    </>
  );
}
