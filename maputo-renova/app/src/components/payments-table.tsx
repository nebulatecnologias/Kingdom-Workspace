import clsx from "clsx";
import { LoaderCircle } from "lucide-react";
import { ChannelTag, Pill } from "./ui";
import type { Payment, PaymentStatus } from "@/lib/data";
import { mt } from "@/lib/format";

export function StatusFor({ status }: { status: PaymentStatus }) {
  switch (status) {
    case "recebido":
      return <Pill tone="neutral">Recebido</Pill>;
    case "reconciliado":
      return <Pill tone="ok">Reconciliado</Pill>;
    case "a-reconciliar":
      return (
        <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-sunken px-2.5 text-xs font-medium whitespace-nowrap text-ink-2">
          <LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden />A reconciliar
        </span>
      );
    case "parcial":
      return <Pill tone="warn">Parcial</Pill>;
    case "por-identificar":
      return <Pill tone="danger">Por identificar</Pill>;
  }
}

function where(p: Payment) {
  return p.fraccao === "?" ? "Fracção por identificar" : `${p.fraccao} · ${p.condominio}`;
}

export function PaymentsTable({ rows, highlightId, showInvoice = false }: { rows: Payment[]; highlightId?: string | null; showInvoice?: boolean }) {
  return (
    <>
      {/* Telemóvel: lista */}
      <ul className="divide-y divide-line px-5 pb-2 md:hidden" aria-live="polite">
        {rows.map((p) => (
          <li key={p.id} className={clsx("py-3.5", p.id === highlightId && "row-arrive")}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.payer}</p>
                <p className="truncate text-xs text-ink-3">{where(p)}</p>
              </div>
              <p className="tnum shrink-0 text-sm font-semibold">{mt(p.amount)}</p>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ChannelTag channel={p.channel} />
              <span className="font-mono text-[11.5px] text-ink-2">{p.txId}</span>
              <span className="tnum text-xs text-ink-3">{p.time}</span>
              <span className="ml-auto">
                <StatusFor status={p.status} />
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Ecrã largo: tabela */}
      <div className="hidden overflow-x-auto px-3 pb-3 md:block">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="[&>th]:bg-sunken [&>th:first-child]:rounded-l-tile [&>th:last-child]:rounded-r-tile">
              <th scope="col" className="h-10 px-3 text-left text-xs font-medium text-ink-3">Condómino</th>
              <th scope="col" className="h-10 px-3 text-left text-xs font-medium text-ink-3">Canal · ID da transacção</th>
              {showInvoice && <th scope="col" className="h-10 px-3 text-left text-xs font-medium text-ink-3">Factura</th>}
              <th scope="col" className="h-10 px-3 text-right text-xs font-medium text-ink-3">Valor</th>
              <th scope="col" className="h-10 px-3 text-left text-xs font-medium text-ink-3">Estado</th>
            </tr>
          </thead>
          <tbody aria-live="polite">
            {rows.map((p) => (
              <tr key={p.id} className={clsx("[&>td]:border-b [&>td]:border-line last:[&>td]:border-0", p.id === highlightId && "row-arrive")}>
                <td className="h-[64px] max-w-[220px] px-3">
                  <p className="truncate text-sm font-medium">{p.payer}</p>
                  <p className="truncate text-xs text-ink-3">{where(p)}</p>
                </td>
                <td className="px-3">
                  <span className="flex flex-col items-start gap-1 2xl:flex-row 2xl:items-center 2xl:gap-2">
                    <ChannelTag channel={p.channel} />
                    <span className="font-mono text-xs whitespace-nowrap text-ink-2">{p.txId}</span>
                  </span>
                </td>
                {showInvoice && <td className="px-3 text-sm whitespace-nowrap text-ink-2">{p.invoice ?? "—"}</td>}
                <td className="px-3 text-right">
                  <p className="tnum text-sm font-semibold whitespace-nowrap">{mt(p.amount)}</p>
                  <p className="tnum text-xs text-ink-3">
                    {p.date === "23/10/2026" ? "Hoje" : p.date}, {p.time}
                  </p>
                </td>
                <td className="px-3">
                  <StatusFor status={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
