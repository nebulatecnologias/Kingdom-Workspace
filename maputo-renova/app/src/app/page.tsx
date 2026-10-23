import { FileText, ShieldAlert } from "lucide-react";
import { ChannelChart, CollectedPanel, HeaderActions, PaymentsFeed, TodayStrip } from "@/components/dashboard";
import { AgeingCard, KpiCard } from "@/components/dashboard-static";
import { CondominiosTable } from "@/components/condominios-table";
import { PageHeader } from "@/components/ui";
import { PORTFOLIO, TODAY, USER } from "@/lib/data";
import { int } from "@/lib/format";

export default function VisaoGeral() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <PageHeader
        title={`Bom dia, ${USER.first}`}
        subtitle={
          <>
            {TODAY} · {PORTFOLIO.condominios} condomínios, {int(PORTFOLIO.fraccoes)} fracções
          </>
        }
      >
        <HeaderActions />
      </PageHeader>

      <TodayStrip />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.62fr)]">
        <CollectedPanel />
        <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <KpiCard icon={FileText} title="Facturado em Outubro" value={PORTFOLIO.facturado} delta={PORTFOLIO.facturadoVar} goodWhen="up" caption="face a Setembro" href="/facturacao" />
            <KpiCard icon={ShieldAlert} title="Dívida vencida" value={PORTFOLIO.emAtraso} delta={PORTFOLIO.emAtrasoVar} goodWhen="down" caption="face a Setembro" href="/inadimplencia" />
          </div>
          <ChannelChart />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.62fr)]">
        <AgeingCard />
        <PaymentsFeed />
      </div>

      <CondominiosTable compact />
    </div>
  );
}
