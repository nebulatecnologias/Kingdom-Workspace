"use client";

import clsx from "clsx";
import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, CircleCheck, Download, Info, Phone, ReceiptText, RotateCcw, Split, Undo2, Wallet } from "lucide-react";
import { useLive } from "./live";
import { Button, ChannelTag, PageHeader, Pill, buttonClass } from "./ui";
import { CHANNELS, EXCEPTIONS, EXCEPTION_LABEL, PORTFOLIO, type Channel, type ReconException } from "@/lib/data";
import { mt, pct } from "@/lib/format";

const KIND_TONE: Record<ReconException["kind"], "warn" | "danger" | "info" | "neutral"> = {
  referencia: "warn",
  parcial: "warn",
  "a-mais": "info",
  desconhecido: "danger",
  duplicado: "neutral",
};

type Filter = "todas" | Channel;

export function Reconciliation() {
  const { exceptions, exceptionsAmount, reconciliados, pagamentosMes, resolveException } = useLive();
  const [filter, setFilter] = useState<Filter>("todas");
  const [resolved, setResolved] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState(EXCEPTIONS[0].id);
  const [chosen, setChosen] = useState<string | null>(null);

  const list = useMemo(() => EXCEPTIONS.filter((e) => filter === "todas" || e.channel === filter), [filter]);
  const selected = EXCEPTIONS.find((e) => e.id === selectedId) ?? EXCEPTIONS[0];
  const autoRate = (PORTFOLIO.automaticos / pagamentosMes) * 100;

  function resolve(e: ReconException, how: string) {
    if (resolved[e.id]) return;
    setResolved((r) => ({ ...r, [e.id]: how }));
    resolveException(e.amount);
    const next = list.find((x) => x.id !== e.id && !resolved[x.id]);
    window.setTimeout(() => {
      if (next) {
        setSelectedId(next.id);
        setChosen(null);
      }
    }, 900);
  }

  const done = resolved[selected.id];
  const pick = chosen ?? selected.suggestions[0]?.invoice;
  const pickSuggestion = selected.suggestions.find((s) => s.invoice === pick);

  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <PageHeader title="Reconciliação" subtitle="Cada pagamento recebido é associado à factura da fracção. Aqui ficam os que precisam de decisão humana.">
        <button type="button" className={buttonClass("secondary")}>
          <Download className="size-4" aria-hidden />
          Importar extracto bancário
        </button>
        <button type="button" className={buttonClass("dark")}>
          <RotateCcw className="size-4" aria-hidden />
          Correr regras agora
        </button>
      </PageHeader>

      <section aria-label="Resumo de Outubro" className="card grid grid-cols-2 divide-line max-md:gap-y-4 max-md:p-5 md:grid-cols-4 md:divide-x">
        {[
          { label: "Pagamentos em Outubro", value: String(pagamentosMes), sub: "todos os canais" },
          { label: "Reconciliados automaticamente", value: String(PORTFOLIO.automaticos), sub: `${pct(autoRate)} do total` },
          { label: "Reconciliados à mão", value: String(reconciliados - PORTFOLIO.automaticos), sub: "pela equipa este mês" },
          { label: "Por reconciliar", value: String(exceptions), sub: mt(exceptionsAmount), warn: true },
        ].map((s) => (
          <div key={s.label} className="md:p-5">
            <p className="text-[13px] text-ink-3">{s.label}</p>
            <p className={clsx("tnum mt-1 text-[26px] font-semibold tracking-[-0.02em]", s.warn && "text-warn")}>{s.value}</p>
            <p className="tnum text-[13px] text-ink-3">{s.sub}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        {/* Fila de excepções */}
        <section aria-labelledby="fila" className="card flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-line p-4">
            <h2 id="fila" className="mr-auto pl-1 text-[15px] font-semibold">
              Fila de excepções <span className="tnum font-normal text-ink-3">· a mostrar {list.length} de {exceptions}</span>
            </h2>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por canal">
              {(["todas", "mpesa", "emola", "banco"] as Filter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={clsx(
                    "h-8 cursor-pointer rounded-full px-3 text-[13px] font-medium transition-colors",
                    filter === f ? "bg-ink text-white" : "bg-sunken text-ink-2 hover:bg-line",
                  )}
                >
                  {f === "todas" ? "Todas" : CHANNELS[f].label}
                </button>
              ))}
            </div>
          </div>
          <ul className="divide-y divide-line">
            {list.map((e) => {
              const isSel = e.id === selected.id;
              const isDone = Boolean(resolved[e.id]);
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(e.id);
                      setChosen(null);
                    }}
                    aria-current={isSel ? "true" : undefined}
                    className={clsx(
                      "flex w-full cursor-pointer items-start gap-3 px-5 py-4 text-left transition-colors",
                      isSel ? "bg-brand-soft/60" : "hover:bg-sunken",
                      isDone && "opacity-60",
                    )}
                  >
                    <span className="mt-0.5">
                      <ChannelTag channel={e.channel} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-medium">{e.payer}</span>
                        <span className="tnum shrink-0 text-sm font-semibold">{mt(e.amount)}</span>
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-2">
                        {isDone ? <Pill tone="ok">Resolvido</Pill> : <Pill tone={KIND_TONE[e.kind]}>{EXCEPTION_LABEL[e.kind]}</Pill>}
                        <span className="text-xs text-ink-3">{e.received}</span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-auto border-t border-line px-5 py-3 text-xs text-ink-3">
            Outras {Math.max(0, exceptions - list.length)} excepções no protótipo não têm detalhe. Dados fictícios.
          </p>
        </section>

        {/* Decisão */}
        <section key={selected.id} aria-labelledby="decisao" className="card panel-enter flex flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="decisao" className="text-[22px] font-semibold tracking-[-0.02em]">{selected.payer}</h2>
              <p className="mt-1 text-[13px] text-ink-3">Pagamento recebido · {selected.received}</p>
            </div>
            <p className="tnum text-[28px] font-semibold tracking-[-0.02em]">{mt(selected.amount)}</p>
          </div>

          <dl className="mt-5 grid gap-3 rounded-tile bg-sunken p-4 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <dt className="sr-only">Canal</dt>
              <dd className="flex items-center gap-2">
                <ChannelTag channel={selected.channel} size="md" />
                <span className="font-mono text-[13px]">{selected.txId}</span>
              </dd>
            </div>
            {selected.phone && (
              <div className="flex items-center gap-2 text-ink-2">
                <dt><Phone className="size-4 text-ink-3" aria-label="Telefone" /></dt>
                <dd className="tnum">{selected.phone}</dd>
              </div>
            )}
            <div className="flex items-center gap-2 text-ink-2">
              <dt className="text-ink-3">Referência usada:</dt>
              <dd className="font-mono text-[13px] text-ink">{selected.referenceUsed ?? "nenhuma"}</dd>
            </div>
            <div className="flex items-center gap-2 text-ink-2">
              <dt className="text-ink-3">Motivo:</dt>
              <dd className="font-medium text-ink">{EXCEPTION_LABEL[selected.kind]}</dd>
            </div>
          </dl>

          <h3 className="mt-6 text-sm font-semibold">Correspondências sugeridas</h3>
          <ul className="mt-3 space-y-2.5" role="radiogroup" aria-label="Escolher factura">
            {selected.suggestions.map((s) => {
              const on = s.invoice === pick;
              return (
                <li key={s.invoice}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={Boolean(done)}
                    onClick={() => setChosen(s.invoice)}
                    className={clsx(
                      "flex w-full cursor-pointer gap-4 rounded-tile border p-4 text-left transition-colors disabled:cursor-default",
                      on ? "border-brand bg-brand-soft/50" : "border-line hover:border-line-strong",
                    )}
                  >
                    <span className={clsx("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2", on ? "border-brand bg-brand text-white" : "border-line-strong")}>
                      {on && <Check className="size-3" strokeWidth={3} aria-hidden />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <span className="text-sm font-semibold">{s.fraccao} · {s.condomino}</span>
                        <span className={clsx("tnum text-sm font-semibold", s.confidence >= 85 ? "text-brand-strong" : s.confidence >= 60 ? "text-warn" : "text-ink-3")}>
                          {s.confidence}% de confiança
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[13px] text-ink-3">
                        {s.invoice} · {s.condominio} · em dívida {mt(s.due)}
                      </span>
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {s.reasons.map((r) => (
                          <span key={r} className="inline-flex h-6 items-center rounded-full bg-surface px-2.5 text-xs text-ink-2 ring-1 ring-line">{r}</span>
                        ))}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {pickSuggestion && !done && <Outcome e={selected} due={pickSuggestion.due} invoice={pickSuggestion.invoice} />}

          <div className="mt-auto pt-6">
            {done ? (
              <p className="flex items-center gap-2 rounded-tile bg-brand-soft p-4 text-sm font-medium text-brand-strong" role="status">
                <CircleCheck className="size-5" aria-hidden />
                {done}. Recibo enviado por SMS ao condómino.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selected.kind === "duplicado" ? (
                  <>
                    <Button onClick={() => resolve(selected, "Guardado como crédito da fracção")}>
                      <Wallet className="size-4" aria-hidden />
                      Guardar como crédito
                    </Button>
                    <Button variant="secondary" onClick={() => resolve(selected, `Devolução pedida por ${CHANNELS[selected.channel].label}`)}>
                      <Undo2 className="size-4" aria-hidden />
                      Devolver ao pagador
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => resolve(selected, `Associado à ${pick}`)}>
                      <ArrowLeftRight className="size-4" aria-hidden />
                      Associar à {pick}
                    </Button>
                    <Button variant="secondary" onClick={() => resolve(selected, "Dividido por várias facturas")}>
                      <Split className="size-4" aria-hidden />
                      Dividir
                    </Button>
                    <Button variant="ghost" onClick={() => resolve(selected, `Devolução pedida por ${CHANNELS[selected.channel].label}`)}>
                      <Undo2 className="size-4" aria-hidden />
                      Devolver
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <section aria-labelledby="regras" className="card p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-tile border border-line text-ink-2">
            <ReceiptText className="size-[18px]" strokeWidth={1.6} aria-hidden />
          </span>
          <h2 id="regras" className="text-[17px] font-semibold">Como a reconciliação automática decide</h2>
        </div>
        <ol className="mt-5 grid divide-line max-md:divide-y md:grid-cols-4 md:divide-x">
          {[
            ["Referência da factura", "O condómino indica a referência (ex.: JN4D1026) na mensagem do pagamento. Associação directa."],
            ["Telefone registado + valor", "O número do M-Pesa ou e-Mola pertence à fracção e o valor coincide com uma factura em aberto."],
            ["Nome do titular + valor", "Nome da carteira semelhante ao condómino e valor igual. Abaixo de 85% de confiança vem para esta fila."],
            ["Excepções", "Parciais, valores a mais, duplicados e pagadores desconhecidos esperam decisão humana."],
          ].map(([t, d], i) => (
            <li key={t} className="py-4 md:px-5 md:py-1 md:first:pl-0 md:last:pr-0">
              <h3 className="text-sm font-semibold">
                <span className="tnum text-brand-strong">{i + 1}.</span> {t}
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-3">{d}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Outcome({ e, due, invoice }: { e: ReconException; due: number; invoice: string }) {
  const diff = e.amount - due;
  let text: string;
  if (e.kind === "duplicado") text = "A factura já está paga. O valor fica como crédito da fracção ou é devolvido.";
  else if (diff === 0) text = `A ${invoice} fica paga e o recibo segue por SMS.`;
  else if (diff < 0) text = `A ${invoice} fica parcialmente paga. Faltam ${mt(-diff)}; o condómino recebe o novo saldo.`;
  else text = `Sobram ${mt(diff)}, que ficam como crédito para as próximas quotas.`;
  return (
    <p className="mt-4 flex gap-2 text-[13px] leading-relaxed text-ink-2">
      <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
      {text}
    </p>
  );
}
