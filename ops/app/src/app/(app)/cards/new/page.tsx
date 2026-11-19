import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CardForm, type CardDraft } from "@/components/card-form";
import { Topbar } from "@/components/shell/topbar";
import { PageHead } from "@/components/ui/bits";
import { requireMember } from "@/lib/auth";
import { getBase, meetingsPipeline } from "@/lib/data";
import { dayKey, isDayKey } from "@/lib/format";
import { T } from "@/lib/texts";

export const metadata: Metadata = { title: T.actions.newMeeting };

export default async function NewCardPage({ searchParams }: PageProps<"/cards/new">) {
  const sp = await searchParams;
  const me = await requireMember("/cards/new");
  const base = await getBase();
  const pl = base.pipelines.find((p) => p.slug === sp.pipeline) ?? meetingsPipeline(base);
  if (!pl) notFound();
  const initial: CardDraft = {
    id: null, pipeline_id: pl.id, kind: pl.kind, title: "", owner_id: me.id,
    date: isDayKey(sp.date) ? sp.date : dayKey(new Date()), time: "10:00", duration: 60,
    location_kind: "in_person", location: "", contact_name: "", contact_role: "", contact_phone: "", contact_email: "",
    company_name: "", company_sector: "", value: "", due: "", description: "", channel: "LinkedIn", participants: [],
  };
  const title = T.actions.newCard[pl.kind];
  const back = pl.kind === "meetings" ? "/agenda" : `/pipelines/${pl.slug}`;
  return (
    <>
      <Topbar title={title} back={back} />
      <div className="page" style={{ maxWidth: 720 }}>
        <PageHead desktopOnly title={title} sub={pl.name} actions={<Link className="btn btn-quiet" href={back}>{T.actions.cancel}</Link>} />
        <CardForm initial={initial} team={base.activeTeam} back={back} submitLabel={T.actions.create} />
      </div>
    </>
  );
}
