import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { CondominiosTable } from "@/components/condominios-table";
import { PageHeader, buttonClass } from "@/components/ui";
import { CONDOMINIOS, PORTFOLIO } from "@/lib/data";
import { int, mt, pct } from "@/lib/format";

export const metadata: Metadata = { title: "Condomínios" };

export default function Page() {
  const best = [...CONDOMINIOS].sort((a, b) => b.cobrado / b.facturado - a.cobrado / a.facturado);
  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <PageHeader title="Condomínios" subtitle={`${PORTFOLIO.condominios} condomínios em gestão · ${int(PORTFOLIO.fraccoes)} fracções`}>
        <button type="button" className={buttonClass("primary")}>
          <Plus className="size-4" aria-hidden />
          Adicionar condomínio
        </button>
      </PageHeader>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {best.map((c) => {
          const rate = (c.cobrado / c.facturado) * 100;
          return (
            <li key={c.id} className="card p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-tile bg-brand-soft text-sm font-bold text-brand-strong">{c.code}</span>
                <div className="min-w-0">
                  <h2 className="truncate text-[15px] font-semibold">{c.name}</h2>
                  <p className="text-xs text-ink-3">{c.bairro} · administra {c.admin}</p>
                </div>
              </div>
              <FraccaoGrid total={c.fraccoes} late={c.devedores} />
              <dl className="tnum mt-4 grid grid-cols-3 gap-2 text-[13px]">
                <div><dt className="text-ink-3">Fracções</dt><dd className="font-semibold">{c.fraccoes}</dd></div>
                <div><dt className="text-ink-3">Cobrança</dt><dd className="font-semibold">{pct(rate, 0)}</dd></div>
                <div><dt className="text-ink-3">Em atraso</dt><dd className="font-semibold">{mt(c.emAtraso, { decimals: false })}</dd></div>
              </dl>
            </li>
          );
        })}
      </ul>
      <CondominiosTable />
    </div>
  );
}

/* Cada quadrado é uma fracção; as vermelhas estão em atraso (posição ilustrativa). */
function FraccaoGrid({ total, late }: { total: number; late: number }) {
  const step = total / late;
  const lateSet = new Set(Array.from({ length: late }, (_, i) => Math.floor(i * step + step / 2)));
  return (
    <div className="mt-4 flex flex-wrap gap-[3px]" role="img" aria-label={`${late} de ${total} fracções em atraso`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={lateSet.has(i) ? "size-2.5 rounded-[2px] bg-danger" : "size-2.5 rounded-[2px] bg-brand-tint"} />
      ))}
    </div>
  );
}
