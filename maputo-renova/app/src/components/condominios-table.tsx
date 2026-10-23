import clsx from "clsx";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { CardHeader, MoreButton, Progress } from "./ui";
import { CONDOMINIOS } from "@/lib/data";
import { mt, pct } from "@/lib/format";

export function CondominiosTable({ compact = false }: { compact?: boolean }) {
  const rows = [...CONDOMINIOS].sort((a, b) => b.cobrado / b.facturado - a.cobrado / a.facturado);
  return (
    <section aria-labelledby="carteira" className="card overflow-hidden">
      <div className="p-5 pb-4">
        <CardHeader icon={Building2} title="Cobrança por condomínio">
          {compact && (
            <Link href="/condominios" className="inline-flex h-8 items-center rounded-full border border-line px-3 text-[13px] font-medium text-ink-2 hover:bg-sunken">
              Ver carteira
            </Link>
          )}
          <MoreButton label="Mais opções: cobrança por condomínio" />
        </CardHeader>
        <span id="carteira" className="sr-only">Taxa de cobrança de Outubro por condomínio</span>
      </div>
      <ul className="divide-y divide-line px-5 pb-2 md:hidden">
        {rows.map((c) => {
          const rate = (c.cobrado / c.facturado) * 100;
          return (
            <li key={c.id} className="py-3.5">
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-xs font-bold text-brand-strong">{c.code}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="tnum text-xs text-ink-3">{c.fraccoes} fracções · em atraso {mt(c.emAtraso, { decimals: false })}</p>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-3">
                <Progress value={rate} tone={rate >= 85 ? "brand" : rate >= 75 ? "warn" : "danger"} label={`Taxa de cobrança de ${c.name}`} />
                <span className={clsx("tnum w-11 text-right text-sm font-semibold", rate >= 85 ? "text-brand-strong" : rate >= 75 ? "text-warn" : "text-danger")}>{pct(rate, 0)}</span>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="hidden overflow-x-auto px-3 pb-3 md:block">
        <table className="w-full min-w-[860px] border-separate border-spacing-0">
          <thead>
            <tr className="[&>th]:bg-sunken [&>th:first-child]:rounded-l-tile [&>th:last-child]:rounded-r-tile">
              <th scope="col" className="h-10 px-3 text-left text-xs font-medium text-ink-3">Condomínio</th>
              <th scope="col" className="h-10 px-3 text-right text-xs font-medium text-ink-3">Fracções</th>
              <th scope="col" className="h-10 px-3 text-right text-xs font-medium text-ink-3">Facturado</th>
              <th scope="col" className="h-10 px-3 text-right text-xs font-medium text-ink-3">Cobrado</th>
              <th scope="col" className="h-10 w-[200px] px-3 text-left text-xs font-medium text-ink-3">Taxa de cobrança</th>
              <th scope="col" className="h-10 px-3 text-right text-xs font-medium text-ink-3">Em atraso</th>
              <th scope="col" className="h-10 px-3 text-left text-xs font-medium text-ink-3">Administrador</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const rate = (c.cobrado / c.facturado) * 100;
              return (
                <tr key={c.id} className="[&>td]:border-b [&>td]:border-line last:[&>td]:border-0">
                  <td className="h-[60px] px-3">
                    <span className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-xs font-bold text-brand-strong">{c.code}</span>
                      <span>
                        <span className="block text-sm font-medium">{c.name}</span>
                        <span className="block text-xs text-ink-3">{c.bairro}</span>
                      </span>
                    </span>
                  </td>
                  <td className="tnum px-3 text-right text-sm text-ink-2">{c.fraccoes}</td>
                  <td className="tnum px-3 text-right text-sm text-ink-2">{mt(c.facturado, { decimals: false })}</td>
                  <td className="tnum px-3 text-right text-sm font-semibold">{mt(c.cobrado, { decimals: false })}</td>
                  <td className="px-3">
                    <span className="flex items-center gap-3">
                      <Progress value={rate} tone={rate >= 85 ? "brand" : rate >= 75 ? "warn" : "danger"} label={`Taxa de cobrança de ${c.name}`} />
                      <span className={clsx("tnum w-12 text-right text-sm font-semibold", rate >= 85 ? "text-brand-strong" : rate >= 75 ? "text-warn" : "text-danger")}>{pct(rate, 0)}</span>
                    </span>
                  </td>
                  <td className="tnum px-3 text-right text-sm">
                    {mt(c.emAtraso, { decimals: false })}
                    <span className="block text-xs text-ink-3">{c.devedores} fracções</span>
                  </td>
                  <td className="px-3 text-sm text-ink-2">{c.admin}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
