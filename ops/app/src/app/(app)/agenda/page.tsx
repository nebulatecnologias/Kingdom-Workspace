import type { Metadata } from "next";
import { Topbar } from "@/components/shell/topbar";
import { Empty, PageHead } from "@/components/ui/bits";
import { requireMember } from "@/lib/auth";
import { T } from "@/lib/texts";

export const metadata: Metadata = { title: T.nav.agenda };

export default async function AgendaPage() {
  await requireMember("/agenda");
  return (
    <>
      <Topbar title={T.nav.agenda} />
      <div className="page">
        <PageHead desktopOnly title={T.nav.agenda} />
        <div className="card">
          <Empty icon="calendar" title={T.empty.agenda} hint={T.empty.agendaHint} />
        </div>
      </div>
    </>
  );
}
