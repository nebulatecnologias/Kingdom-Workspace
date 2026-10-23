import type { Metadata } from "next";
import { ChannelTag, PageHeader, Pill } from "@/components/ui";
import { DEBTORS, INVOICES } from "@/lib/data";
import { mt } from "@/lib/format";

export const metadata: Metadata = { title: "Condóminos" };

const PHONES: Record<string, string> = {
  "Armando Sitoe": "+258 84 312 0871",
  "Fátima Cossa": "+258 86 455 2190",
  "Ernesto Langa": "+258 84 190 4456",
  "Paulo Mabunda": "+258 84 778 3301",
};

export default function Page() {
  const fromInvoices = INVOICES.map((f) => ({
    fraccao: f.fraccao,
    nome: f.condomino,
    condominio: f.condominio,
    phone: PHONES[f.condomino] ?? "—",
    saldo: f.paid - f.amount,
    channel: null,
  }));
  const fromDebtors = DEBTORS.map((d) => ({ fraccao: d.fraccao, nome: d.condomino, condominio: d.condominio, phone: d.phone, saldo: -d.divida, channel: d.channel }));
  const rows = [...fromInvoices, ...fromDebtors].sort((a, b) => a.fraccao.localeCompare(b.fraccao));

  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <PageHeader title="Condóminos" subtitle="Proprietários e inquilinos responsáveis por cada fracção, com o telefone usado para M-Pesa ou e-Mola." />
      <section className="card overflow-hidden" aria-label="Lista de condóminos">
        <div className="overflow-x-auto p-3">
          <table className="w-full min-w-[760px] border-separate border-spacing-0">
            <thead>
              <tr className="[&>th]:bg-sunken [&>th:first-child]:rounded-l-tile [&>th:last-child]:rounded-r-tile">
                {["Fracção", "Condómino", "Telefone de pagamento", "Saldo"].map((h, i) => (
                  <th key={h} scope="col" className={`h-10 px-3 text-xs font-medium text-ink-3 ${i === 3 ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.fraccao} className="[&>td]:border-b [&>td]:border-line last:[&>td]:border-0">
                  <td className="h-[56px] px-3 text-sm font-medium">{r.fraccao}</td>
                  <td className="px-3">
                    <p className="text-sm">{r.nome}</p>
                    <p className="text-xs text-ink-3">{r.condominio}</p>
                  </td>
                  <td className="px-3 text-sm text-ink-2">
                    <span className="flex items-center gap-2">
                      {r.channel && <ChannelTag channel={r.channel} />}
                      <span className="tnum">{r.phone}</span>
                    </span>
                  </td>
                  <td className="px-3 text-right">
                    {r.saldo < 0 ? <span className="tnum text-sm font-semibold text-danger">{mt(r.saldo)}</span> : <Pill tone="ok">Em dia</Pill>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <p className="text-xs text-ink-3">Dados fictícios de demonstração.</p>
    </div>
  );
}
