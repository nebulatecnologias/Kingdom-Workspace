"use client";

import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronsUpDown, CircleCheck, HandCoins, MessageSquareText, Send } from "lucide-react";
import { Button, ChannelTag, PageHeader, Pill } from "./ui";
import { AGEING, CONDOMINIOS, DEBTORS, DEBTOR_STATE, PORTFOLIO, type Debtor } from "@/lib/data";
import { mt, pct } from "@/lib/format";

const BUCKETS = [
  { id: "todas", label: "Todas", test: () => true },
  { id: "0-30", label: "Até 30 dias", test: (d: Debtor) => d.dias <= 30 },
  { id: "31-60", label: "31–60", test: (d: Debtor) => d.dias > 30 && d.dias <= 60 },
  { id: "61-90", label: "61–90", test: (d: Debtor) => d.dias > 60 && d.dias <= 90 },
  { id: "90+", label: "Mais de 90", test: (d: Debtor) => d.dias > 90 },
];

const STATE_TONE = { "sem-contacto": "danger", lembrete: "warn", acordo: "info", juridico: "neutral" } as const;
const TONES = ["bg-warn/50", "bg-warn", "bg-danger/70", "bg-danger"];

export function Arrears() {
  const params = useSearchParams();
  const initial = BUCKETS.some((b) => b.id === params.get("antiguidade")) ? params.get("antiguidade")! : "todas";
  const [bucket, setBucket] = useState(initial);
  const [condo, setCondo] = useState("todos");
  const [selected, setSelected] = useState<string[]>([]);
  const [sent, setSent] = useState<string[]>([]);

  const test = BUCKETS.find((b) => b.id === bucket)!.test;
  const rows = useMemo(() => DEBTORS.filter((d) => test(d) && (condo === "todos" || d.condominio === condo)), [test, condo]);
  const total = AGEING.reduce((s, a) => s + a.amount, 0);
  const allOn = rows.length > 0 && rows.every((r) => selected.includes(r.id));
  const chosen = DEBTORS.filter((d) => selected.includes(d.id));
  const sample = chosen[0];

  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <PageHeader title="Inadimplência" subtitle={`${PORTFOLIO.devedores} fracções em atraso · ${pct(PORTFOLIO.taxaInadimplencia)} da carteira · dívida vencida ${mt(total)}`} />

      <section aria-label="Dívida por antiguidade" className="card p-5">
        <div className="flex h-3 gap-0.5 overflow-hidden rounded-full" aria-hidden>
          {AGEING.map((a, i) => (
            <span key={a.bucket} className={TONES[i]} style={{ width: `${(a.amount / total) * 100}%` }} />
          ))}
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-1 lg:grid-cols-4">
          {AGEING.map((a, i) => (
            <li key={a.bucket}>
              <button
                type="button"
                onClick={() => setBucket(bucket === a.bucket ? "todas" : a.bucket)}
                aria-pressed={bucket === a.bucket}
                className={clsx("w-full cursor-pointer rounded-tile p-3 text-left transition-colors", bucket === a.bucket ? "bg-brand-soft/70" : "hover:bg-sunken")}
              >
                <span className="flex items-center gap-2 text-[13px] text-ink-2">
                  <span className={clsx("size-2.5 rounded-[3px]", TONES[i])} aria-hidden />
                  {a.label}
                </span>
                <span className="tnum mt-2 block text-[20px] font-semibold tracking-[-0.01em]">{mt(a.amount, { decimals: false })}</span>
                <span className="tnum text-[13px] text-ink-3">{a.fraccoes} fracções · {pct((a.amount / total) * 100, 0)}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-labelledby="devedores" className="card overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-5 pb-4">
            <h2 id="devedores" className="mr-auto text-[17px] font-semibold">Fracções em atraso</h2>
            <label className="sr-only" htmlFor="f-condo">Condomínio</label>
            <span className="relative">
              <select id="f-condo" value={condo} onChange={(e) => setCondo(e.target.value)} className="h-9 cursor-pointer appearance-none rounded-full border border-line bg-surface pr-9 pl-3.5 text-[13px] font-medium hover:border-line-strong focus:border-brand focus:outline-none">
                <option value="todos">Todos os condomínios</option>
                {CONDOMINIOS.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <ChevronsUpDown className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-ink-3" aria-hidden />
            </span>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Antiguidade">
              {BUCKETS.map((b) => (
                <button key={b.id} type="button" aria-pressed={bucket === b.id} onClick={() => setBucket(b.id)} className={clsx("h-8 cursor-pointer rounded-full px-3 text-[13px] font-medium transition-colors", bucket === b.id ? "bg-ink text-white" : "bg-sunken text-ink-2 hover:bg-line")}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {selected.length > 0 && (
            <div className="panel-enter mx-3 mb-2 flex flex-wrap items-center gap-3 rounded-tile bg-ink px-4 py-2.5 text-sm text-white">
              <span className="tnum">{selected.length} seleccionadas · {mt(chosen.reduce((s, d) => s + d.divida, 0))}</span>
              <span className="ml-auto flex gap-2">
                <button type="button" onClick={() => setSelected([])} className="h-8 cursor-pointer rounded-full px-3 text-[13px] text-white/80 hover:text-white">Limpar</button>
              </span>
            </div>
          )}

          <ul className="divide-y divide-line px-5 pb-2 md:hidden">
            {rows.map((d) => {
              const on = selected.includes(d.id);
              return (
                <li key={d.id} className={clsx("flex gap-3 py-3.5", on && "bg-brand-soft/40")}>
                  <input type="checkbox" aria-label={`Seleccionar ${d.fraccao}`} checked={on} onChange={() => setSelected((s) => (on ? s.filter((x) => x !== d.id) : [...s, d.id]))} className="mt-0.5 size-4 shrink-0 accent-[var(--color-brand)]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 text-sm font-medium">{d.fraccao} · {d.condomino}</p>
                      <p className="tnum shrink-0 text-sm font-semibold">{mt(d.divida)}</p>
                    </div>
                    <p className="truncate text-xs text-ink-3">{d.condominio}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={clsx("tnum text-xs font-semibold", d.dias > 60 ? "text-danger" : "text-warn")}>{d.dias} dias</span>
                      <ChannelTag channel={d.channel} />
                      <span className="tnum text-xs text-ink-3">{d.ultimoPagamento}</span>
                      <span className="ml-auto">{sent.includes(d.id) ? <Pill tone="ok">Lembrete enviado hoje</Pill> : <Pill tone={STATE_TONE[d.state]}>{DEBTOR_STATE[d.state]}</Pill>}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="hidden overflow-x-auto px-3 pb-3 md:block">
            <table className="w-full min-w-[740px] border-separate border-spacing-0">
              <thead>
                <tr className="[&>th]:bg-sunken [&>th:first-child]:rounded-l-tile [&>th:last-child]:rounded-r-tile">
                  <th scope="col" className="h-10 w-10 pl-3">
                    <input type="checkbox" aria-label="Seleccionar todas" checked={allOn} onChange={() => setSelected(allOn ? [] : rows.map((r) => r.id))} className="size-4 accent-[var(--color-brand)]" />
                  </th>
                  <th scope="col" className="h-10 px-3 text-left text-xs font-medium text-ink-3">Fracção · condómino</th>
                  <th scope="col" className="h-10 px-3 text-right text-xs font-medium text-ink-3">Dívida</th>
                  <th scope="col" className="h-10 px-3 text-right text-xs font-medium text-ink-3">Atraso</th>
                  <th scope="col" className="h-10 px-3 text-left text-xs font-medium text-ink-3">Último pagamento</th>
                  <th scope="col" className="h-10 px-3 text-left text-xs font-medium text-ink-3">Situação</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => {
                  const on = selected.includes(d.id);
                  return (
                    <tr key={d.id} className={clsx("[&>td]:border-b [&>td]:border-line last:[&>td]:border-0", on && "bg-brand-soft/40")}>
                      <td className="h-[68px] pl-3">
                        <input type="checkbox" aria-label={`Seleccionar ${d.fraccao}`} checked={on} onChange={() => setSelected((s) => (on ? s.filter((x) => x !== d.id) : [...s, d.id]))} className="size-4 accent-[var(--color-brand)]" />
                      </td>
                      <td className="max-w-[260px] px-3">
                        <p className="truncate text-sm font-medium">{d.fraccao} · {d.condomino}</p>
                        <p className="truncate text-xs text-ink-3">{d.condominio}</p>
                        <p className="tnum text-xs text-ink-3">{d.phone}</p>
                      </td>
                      <td className="tnum px-3 text-right text-sm font-semibold whitespace-nowrap">
                        {mt(d.divida)}
                        <span className="block text-xs font-normal text-ink-3">{d.meses} {d.meses === 1 ? "quota" : "quotas"}</span>
                      </td>
                      <td className={clsx("tnum px-3 text-right text-sm font-medium whitespace-nowrap", d.dias > 90 ? "text-danger" : d.dias > 60 ? "text-danger/80" : "text-warn")}>{d.dias} dias</td>
                      <td className="px-3 text-sm text-ink-2">
                        <span className="flex flex-col items-start gap-1">
                          <ChannelTag channel={d.channel} />
                          <span className="tnum text-[13px]">{d.ultimoPagamento}</span>
                        </span>
                      </td>
                      <td className="px-3">
                        {sent.includes(d.id) ? <Pill tone="ok">Lembrete enviado hoje</Pill> : <Pill tone={STATE_TONE[d.state]}>{DEBTOR_STATE[d.state]}</Pill>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length === 0 && <p className="px-3 py-8 text-center text-sm text-ink-3">Nenhuma fracção em atraso com estes filtros. Boa notícia.</p>}
          </div>
        </section>

        <aside aria-labelledby="lembrete" className="card flex flex-col p-5 xl:sticky xl:top-5 xl:self-start">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-tile border border-line text-ink-2">
              <MessageSquareText className="size-[18px]" strokeWidth={1.6} aria-hidden />
            </span>
            <h2 id="lembrete" className="text-[17px] font-semibold">Lembrete por SMS</h2>
          </div>
          {sample ? (
            <>
              <p className="mt-4 text-[13px] text-ink-3">Pré-visualização para {sample.condomino}{chosen.length > 1 ? ` e mais ${chosen.length - 1}` : ""}</p>
              <div className="mt-2 rounded-tile rounded-tl-sm bg-sunken p-4 text-[13.5px] leading-relaxed">
                Maputo Renova: Caro(a) {sample.condomino.split(" ")[0]}, a fracção {sample.fraccao} tem {mt(sample.divida)} em atraso ({sample.meses} {sample.meses === 1 ? "quota" : "quotas"}). Pague por M-Pesa ou e-Mola com a referência <span className="font-mono">{ref(sample.fraccao)}</span>. Dúvidas: 84 000 0000.
              </div>
              <p className="mt-2 text-xs text-ink-3">Texto de exemplo; o número de contacto é fictício.</p>
              <div className="mt-4 grid gap-2">
                <Button onClick={() => { setSent((s) => [...new Set([...s, ...selected])]); setSelected([]); }}>
                  <Send className="size-4" aria-hidden />
                  Enviar a {chosen.length} {chosen.length === 1 ? "condómino" : "condóminos"}
                </Button>
                <Button variant="secondary">
                  <HandCoins className="size-4" aria-hidden />
                  Propor acordo de pagamento
                </Button>
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-tile border border-dashed border-line-strong p-5 text-sm text-ink-2">
              {sent.length ? (
                <p className="flex items-center gap-2 font-medium text-brand-strong"><CircleCheck className="size-4" aria-hidden />{sent.length} lembretes enviados hoje.</p>
              ) : (
                <p>Seleccione fracções na tabela para pré-visualizar e enviar o lembrete. Cada mensagem leva o valor em dívida e a referência para pagar por M-Pesa ou e-Mola.</p>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function ref(fraccao: string) {
  const parts = fraccao.split("-");
  return `${parts[0]}${parts[parts.length - 1]}1026`;
}
