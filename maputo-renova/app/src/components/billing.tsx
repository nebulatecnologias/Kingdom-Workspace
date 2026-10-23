"use client";

import clsx from "clsx";
import { useState } from "react";
import { Check, Download, FileText, Send } from "lucide-react";
import { Button, PageHeader, Pill, Progress, buttonClass } from "./ui";
import { CONDOMINIOS, INVOICES, INVOICE_STATUS, PORTFOLIO, type InvoiceStatus } from "@/lib/data";
import { int, mt, pct } from "@/lib/format";

const STATUS_TONE: Record<InvoiceStatus, "ok" | "warn" | "danger" | "neutral"> = { paga: "ok", parcial: "warn", "em-aberto": "neutral", vencida: "danger" };

const STEPS = [
  { title: "Rever quotas", body: "6 condomínios, 430 fracções. Sem alterações de quota desde Outubro." },
  { title: "Encargos extra", body: "Fundo de reserva (10%) já incluído. Obra da cobertura no Edifício 24 de Julho: 1 200 MT por fracção." },
  { title: "Pré-visualizar", body: "Cada factura traz a referência da fracção e as instruções para M-Pesa e e-Mola." },
  { title: "Emitir e enviar", body: "Emissão a 01/11/2026 às 07:00; envio por SMS e email; vencimento a 10/11/2026." },
];

export function Billing() {
  const [step, setStep] = useState(0);
  const [issued, setIssued] = useState(false);
  const nextTotal = PORTFOLIO.facturado + 72 * 1200;
  const paidCount = 381;

  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <PageHeader title="Facturação" subtitle="Emissão mensal das quotas de condomínio, por fracção, com referência de pagamento própria.">
        <button type="button" className={buttonClass("secondary")}>
          <Download className="size-4" aria-hidden />
          Exportar facturas
        </button>
      </PageHeader>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section aria-labelledby="ciclo" className="card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-tile border border-line text-ink-2">
              <FileText className="size-[18px]" strokeWidth={1.6} aria-hidden />
            </span>
            <h2 id="ciclo" className="text-[17px] font-semibold">Ciclo de Outubro</h2>
            <span className="ml-auto"><Pill tone="info">Em cobrança</Pill></span>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-line py-5">
            {[
              ["Facturas emitidas", int(PORTFOLIO.fraccoes), "01/10/2026"],
              ["Valor facturado", mt(PORTFOLIO.facturado, { decimals: false }), "quotas + fundo de reserva"],
              ["Pagas por completo", String(paidCount), pct((paidCount / PORTFOLIO.fraccoes) * 100) + " das facturas"],
              ["Entregues por SMS", "428", "2 números inválidos"],
            ].map(([k, v, sub]) => (
              <div key={k}>
                <dt className="text-[13px] text-ink-3">{k}</dt>
                <dd className="tnum mt-1 text-[20px] font-semibold tracking-[-0.01em]">{v}</dd>
                <dd className="text-xs text-ink-3">{sub}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5">
            <div className="flex justify-between text-[13px]">
              <span className="text-ink-2">Cobrado do ciclo</span>
              <span className="tnum font-semibold">{pct((PORTFOLIO.cobrado / PORTFOLIO.facturado) * 100)}</span>
            </div>
            <div className="mt-2"><Progress value={(PORTFOLIO.cobrado / PORTFOLIO.facturado) * 100} label="Cobrado do ciclo de Outubro" /></div>
          </div>
        </section>

        <section aria-labelledby="novembro" className="card p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="novembro" className="text-[17px] font-semibold">Preparar Novembro</h2>
            <p className="tnum text-sm text-ink-3">Previsto: <span className="font-semibold text-ink">{mt(nextTotal, { decimals: false })}</span></p>
          </div>
          <ol className="mt-5 space-y-2">
            {STEPS.map((s, i) => {
              const state = issued || i < step ? "done" : i === step ? "current" : "todo";
              return (
                <li key={s.title} className={clsx("flex gap-3 rounded-tile p-3.5", state === "current" ? "bg-brand-soft/60" : "")}>
                  <span
                    className={clsx(
                      "tnum grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                      state === "done" ? "bg-brand text-white" : state === "current" ? "bg-surface text-brand-strong ring-2 ring-brand" : "bg-sunken text-ink-3",
                    )}
                  >
                    {state === "done" ? <Check className="size-3.5" strokeWidth={3} aria-label="Concluído" /> : i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className={clsx("block text-sm font-semibold", state === "todo" && "text-ink-3")}>{s.title}</span>
                    {state !== "todo" && <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-2">{s.body}</span>}
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="mt-5 flex flex-wrap gap-2">
            {issued ? (
              <p role="status" className="flex items-center gap-2 text-sm font-medium text-brand-strong">
                <Check className="size-4" aria-hidden />
                Lote de Novembro agendado para 01/11/2026 às 07:00.
              </p>
            ) : step < STEPS.length - 1 ? (
              <>
                <Button onClick={() => setStep((s) => s + 1)}>Continuar</Button>
                {step > 0 && <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>Voltar</Button>}
              </>
            ) : (
              <>
                <Button onClick={() => setIssued(true)}>
                  <Send className="size-4" aria-hidden />
                  Agendar emissão de {int(PORTFOLIO.fraccoes)} facturas
                </Button>
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>Voltar</Button>
              </>
            )}
          </div>
        </section>
      </div>

      <section aria-labelledby="facturas" className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-5 pb-4">
          <h2 id="facturas" className="mr-auto text-[17px] font-semibold">Facturas de Outubro</h2>
          <p className="text-[13px] text-ink-3">A mostrar 10 de {int(PORTFOLIO.fraccoes)}</p>
        </div>
        <div className="overflow-x-auto px-3 pb-3">
          <table className="w-full min-w-[900px] border-separate border-spacing-0">
            <thead>
              <tr className="[&>th]:bg-sunken [&>th:first-child]:rounded-l-tile [&>th:last-child]:rounded-r-tile">
                {["Factura", "Fracção · condómino", "Referência", "Vencimento", "Valor", "Pago", "Estado"].map((h, i) => (
                  <th key={h} scope="col" className={clsx("h-10 px-3 text-xs font-medium text-ink-3", i === 4 || i === 5 ? "text-right" : "text-left")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((f) => (
                <tr key={f.number} className="[&>td]:border-b [&>td]:border-line last:[&>td]:border-0">
                  <td className="h-[60px] px-3 text-sm font-medium whitespace-nowrap">{f.number}</td>
                  <td className="px-3">
                    <p className="text-sm">{f.fraccao} · {f.condomino}</p>
                    <p className="text-xs text-ink-3">{f.condominio}</p>
                  </td>
                  <td className="px-3 font-mono text-[13px] text-ink-2">{f.reference}</td>
                  <td className="tnum px-3 text-sm text-ink-2">{f.due}</td>
                  <td className="tnum px-3 text-right text-sm font-semibold">{mt(f.amount)}</td>
                  <td className="tnum px-3 text-right text-sm text-ink-2">{mt(f.paid)}</td>
                  <td className="px-3"><Pill tone={STATUS_TONE[f.status]}>{INVOICE_STATUS[f.status]}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-ink-3">Condomínios na carteira: {CONDOMINIOS.map((c) => c.name).join(", ")}. Dados fictícios.</p>
    </div>
  );
}
