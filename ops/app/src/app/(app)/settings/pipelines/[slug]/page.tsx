import clsx from "clsx";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Topbar } from "@/components/shell/topbar";
import { PageHead } from "@/components/ui/bits";
import { Icon } from "@/components/ui/icon";
import { requireMember } from "@/lib/auth";
import { getBase, stagesOf } from "@/lib/data";
import { T } from "@/lib/texts";
import { StagesForm, Templates } from "./stages-form";

export const metadata: Metadata = { title: T.nav.settings };

export default async function PipelineSettingsPage({ params }: PageProps<"/settings/pipelines/[slug]">) {
  const { slug } = await params;
  const me = await requireMember(`/settings/pipelines/${slug}`);
  const base = await getBase();
  const pl = base.pipelines.find((p) => p.slug === slug);
  if (!pl) notFound();
  const admin = me.role === "admin";
  return (
    <>
      <Topbar title={T.nav.settings} back="/team" />
      <div className="page" style={{ maxWidth: 760 }}>
        <PageHead desktopOnly title={`Etapas · ${pl.name}`} sub={T.nav.settings} />
        <div className="pipeline-switch">
          {base.pipelines.map((p) => (
            <Link key={p.id} className={clsx("chip", p.id === pl.id && "is-active")} href={`/settings/pipelines/${p.slug}`}>
              <Icon name={p.icon} size="sm" />
              {p.name}
            </Link>
          ))}
        </div>
        <StagesForm key={pl.id + stagesOf(base, pl.id).map((s) => s.id + s.position + s.name).join()} pipelineId={pl.id} pipelineName={pl.name} stages={stagesOf(base, pl.id)} canEdit={admin} />
        {admin ? (
          <section className="section">
            <div className="section-head"><h2 className="h-section">{T.actions.newPipeline}</h2></div>
            <div className="card card-pad">
              <p className="caption" style={{ margin: "0 0 10px" }}>Um modelo traz as etapas certas. Depois pode mudar tudo.</p>
              <Templates />
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
