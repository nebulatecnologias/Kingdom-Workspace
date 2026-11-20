import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MinutesDoc } from "@/components/minutes-doc";
import { Icon } from "@/components/ui/icon";
import { getBase, profileOf } from "@/lib/data";
import { loadMinutes } from "@/lib/minutes-data";
import { T } from "@/lib/texts";
import { PrintButton } from "./print-button";

export const metadata: Metadata = { title: T.actions.print };

export default async function PrintMinutesPage({ params }: PageProps<"/atas/[id]/print">) {
  const { id } = await params;
  const [base, m] = await Promise.all([getBase(), loadMinutes(id)]);
  if (!m) notFound();
  return (
    <div className="print-page" style={{ maxWidth: 820, margin: "0 auto", padding: 16, width: "100%" }}>
      <div className="inline no-print" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <Link className="btn btn-quiet" href={`/atas/${m.id}`}><Icon name="arrow-left" size="sm" />{T.actions.back}</Link>
        <PrintButton />
      </div>
      <MinutesDoc m={m} card={m.cards} writer={profileOf(base, m.written_by)} approver={profileOf(base, m.approved_by)} />
    </div>
  );
}
