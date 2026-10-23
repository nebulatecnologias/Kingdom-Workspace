import type { Metadata } from "next";
import { ChannelTag, PageHeader, Pill, Progress } from "@/components/ui";
import { AGREEMENTS } from "@/lib/data";
import { mt } from "@/lib/format";

export const metadata: Metadata = { title: "Acordos de pagamento" };

const ESTADO = {
  "em-dia": { tone: "ok", label: "Em dia" },
  "vence-hoje": { tone: "info", label: "Prestação vence hoje" },
  atrasado: { tone: "danger", label: "Prestação atrasada" },
} as const;

export default function Page() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <PageHeader title="Acordos de pagamento" subtitle="Dívidas divididas em prestações. Cada prestação paga por M-Pesa ou e-Mola é reconciliada como uma quota." />
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {AGREEMENTS.map((a) => (
          <li key={a.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold">{a.fraccao} · {a.condomino}</h2>
                <p className="text-xs text-ink-3">{a.condominio}</p>
              </div>
              <ChannelTag channel={a.channel} />
            </div>
            <p className="tnum mt-4 text-[22px] font-semibold tracking-[-0.02em]">{mt(a.total)}</p>
            <p className="tnum text-[13px] text-ink-3">{a.numPrestacoes} prestações de {mt(a.prestacao)}</p>
            <div className="mt-4 flex items-center gap-3">
              <Progress value={(a.pagas / a.numPrestacoes) * 100} label={`Prestações pagas de ${a.condomino}`} />
              <span className="tnum shrink-0 text-[13px] font-medium">{a.pagas}/{a.numPrestacoes}</span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-4">
              <span className="tnum text-[13px] text-ink-2">Próxima: {a.proxima}</span>
              <Pill tone={ESTADO[a.estado].tone}>{ESTADO[a.estado].label}</Pill>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-3">Dados fictícios de demonstração.</p>
    </div>
  );
}
