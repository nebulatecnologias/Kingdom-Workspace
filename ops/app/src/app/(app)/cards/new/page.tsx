import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CardForm, type CardDraft } from "@/components/card-form";
import { Topbar } from "@/components/shell/topbar";
import { PageHead } from "@/components/ui/bits";
import { requireMember } from "@/lib/auth";
import { getBase, getCompanies, meetingsPipeline } from "@/lib/data";
import { dayKey, isDayKey } from "@/lib/format";
import { loadCard } from "../load";
import { T } from "@/lib/texts";

// #24 The tab title follows the pipeline: "Nova oportunidade", "Nova tarefa"…
export async function generateMetadata({ searchParams }: PageProps<"/cards/new">): Promise<Metadata> {
  const sp = await searchParams;
  const base = await getBase();
  const pl = base.pipelines.find((p) => p.slug === sp.pipeline) ?? meetingsPipeline(base);
  return { title: pl ? T.actions.newCard[pl.kind] : T.actions.newMeeting };
}

export default async function NewCardPage({ searchParams }: PageProps<"/cards/new">) {
  const sp = await searchParams;
  const me = await requireMember("/cards/new");
  const [base, companies] = await Promise.all([getBase(), getCompanies()]);
  const pl = base.pipelines.find((p) => p.slug === sp.pipeline) ?? meetingsPipeline(base);
  if (!pl) notFound();
  // #45 "Marcar na agenda" from an ata: the next meeting starts as a copy of the previous one.
  const from = pl.kind === "meetings" && typeof sp.from === "string" ? await loadCard(sp.from) : null;
  const time = typeof sp.time === "string" && /^\d{2}:\d{2}$/.test(sp.time) ? sp.time : "10:00";
  const initial: CardDraft = {
    id: null, pipeline_id: pl.id, kind: pl.kind, title: from?.title ?? "", owner_id: from?.owner_id ?? me.id,
    date: isDayKey(sp.date) ? sp.date : dayKey(new Date()), time, duration: 60,
    location_kind: from?.location_kind ?? "in_person", location: from && from.location_kind !== "phone" ? (from.location ?? "") : "",
    contact_name: from?.contact_name ?? "", contact_role: from?.contact_role ?? "", contact_phone: from?.contact_phone ?? "", contact_email: from?.contact_email ?? "",
    company_name: from?.company_name ?? "", company_sector: from?.company_sector ?? "", value: "", due: "", description: "", channel: "LinkedIn",
    participants: from?.card_participants.map((p) => p.profile_id) ?? [],
  };
  const title = T.actions.newCard[pl.kind];
  const back = pl.kind === "meetings" ? "/agenda" : `/pipelines/${pl.slug}`;
  return (
    <>
      <Topbar title={title} back={back} />
      <div className="page" style={{ maxWidth: 720 }}>
        <PageHead desktopOnly title={title} sub={pl.name} actions={<Link className="btn btn-quiet" href={back}>{T.actions.cancel}</Link>} />
        <CardForm initial={initial} team={base.activeTeam} back={back} submitLabel={T.actions.create} companies={companies} />
      </div>
    </>
  );
}
