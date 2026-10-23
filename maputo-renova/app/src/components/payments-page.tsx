"use client";

import clsx from "clsx";
import { useState, type FormEvent } from "react";
import { Lock, Plus, X } from "lucide-react";
import { useLive } from "./live";
import { PaymentsTable } from "./payments-table";
import { Button, ChannelTag, PageHeader } from "./ui";
import { CHANNELS, CHANNEL_MONTH, type Channel } from "@/lib/data";
import { mt } from "@/lib/format";

type Tab = "todos" | Channel;

const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23646e68' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m7 15 5 5 5-5'/%3E%3Cpath d='m7 9 5-5 5 5'/%3E%3C/svg%3E")`;

export function PaymentsPage() {
  const { payments, booths, closeBooth, lastArrivalId } = useLive();
  const [tab, setTab] = useState<Tab>("todos");
  const [closing, setClosing] = useState<Channel | null>(null);
  const [form, setForm] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const rows = payments.filter((p) => tab === "todos" || p.channel === tab);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setSaved(`Pagamento de ${data.get("valor")} MT registado para ${data.get("fraccao")}. Fica na fila até a equipa confirmar o talão.`);
    setForm(false);
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <PageHeader title="Pagamentos" subtitle="Tudo o que entrou hoje, por balcão. Feche o dia de cada canal quando o total bater com o extracto do operador.">
        <Button onClick={() => setForm((v) => !v)} aria-expanded={form}>
          <Plus className="size-4" aria-hidden />
          Registar pagamento
        </Button>
      </PageHeader>

      {form && (
        <form onSubmit={submit} className="card panel-enter grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5 lg:items-end" aria-label="Registar pagamento manual">
          <Field label="Fracção" name="fraccao" placeholder="ex.: VJ-B-5B" />
          <Field label="Valor (MT)" name="valor" placeholder="4 800,00" inputMode="decimal" />
          <label className="block">
            <span className="text-[13px] font-medium text-ink-2">Canal</span>
            <select name="canal" className="mt-1.5 h-10 w-full cursor-pointer appearance-none rounded-tile border border-line bg-surface bg-[length:16px] bg-[right_12px_center] bg-no-repeat px-3 pr-9 text-sm focus:border-brand focus:outline-none" style={{ backgroundImage: CHEVRON }} defaultValue="numerario">
              <option value="numerario">Numerário (caixa do escritório)</option>
              <option value="banco">Banco (transferência)</option>
            </select>
          </label>
          <Field label="N.º do talão ou transferência" name="talao" placeholder="ex.: CX-0232" />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Guardar</Button>
            <Button variant="ghost" onClick={() => setForm(false)} aria-label="Cancelar">
              <X className="size-4" aria-hidden />
            </Button>
          </div>
          <p className="text-xs text-ink-3 sm:col-span-2 lg:col-span-5">M-Pesa e e-Mola entram sozinhos; registe aqui só numerário e transferências que não vieram no extracto.</p>
        </form>
      )}
      {saved && (
        <p role="status" className="rounded-tile bg-brand-soft px-4 py-3 text-sm font-medium text-brand-strong">{saved}</p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {booths.map((b) => {
          const isClosing = closing === b.channel;
          const pending = payments.filter((p) => p.channel === b.channel && p.status !== "reconciliado").length;
          return (
            <li key={b.channel} className={clsx("card flex flex-col p-5", !b.open && "border-dashed border-line-strong bg-sunken")}>
              <div className="flex items-center justify-between">
                <ChannelTag channel={b.channel} size="md" />
                <span className={clsx("inline-flex items-center gap-1.5 text-xs font-medium", b.open ? "text-brand-strong" : "text-ink-3")}>
                  <span className={clsx("size-1.5 rounded-full", b.open ? "bg-brand" : "bg-ink-3")} aria-hidden />
                  {b.open ? "Aberto" : "Fechado"}
                </span>
              </div>
              <p className="mt-4 text-[13px] text-ink-3">Recebido hoje</p>
              <p className="tnum text-[24px] font-semibold tracking-[-0.02em]">{mt(b.hoje)}</p>
              <p className="tnum mt-1 text-[13px] text-ink-3">
                {b.count} {b.count === 1 ? "pagamento" : "pagamentos"} · {b.note}
              </p>
              <dl className="tnum mt-3 space-y-1 border-t border-line pt-3 text-[13px] text-ink-2">
                <div className="flex justify-between gap-2"><dt>{b.channel === "numerario" ? "Talões da caixa" : "Extracto do operador"}</dt><dd className="font-medium text-ink">{mt(b.hoje)}</dd></div>
                <div className="flex justify-between gap-2"><dt>Diferença</dt><dd className="font-medium text-brand-strong">0,00 MT</dd></div>
                <div className="flex justify-between gap-2"><dt>No mês</dt><dd className="font-medium text-ink">{mt(CHANNEL_MONTH[b.channel], { decimals: false })}</dd></div>
              </dl>

              {isClosing ? (
                <div className="panel-enter mt-4 rounded-tile bg-sunken p-3.5 text-[13px]">
                  <p className="font-semibold">Fechar o dia de {CHANNELS[b.channel].label}?</p>
                  <dl className="tnum mt-2 space-y-1 text-ink-2">
                    <div className="flex justify-between"><dt>Total no sistema</dt><dd className="font-medium text-ink">{mt(b.hoje)}</dd></div>
                    <div className="flex justify-between"><dt>Extracto do operador</dt><dd className="font-medium text-ink">{mt(b.hoje)}</dd></div>
                    <div className="flex justify-between"><dt>Por reconciliar</dt><dd className={clsx("font-medium", pending ? "text-warn" : "text-ink")}>{pending}</dd></div>
                  </dl>
                  {pending > 0 && <p className="mt-2 text-warn">Os pagamentos por reconciliar passam para a fila de amanhã.</p>}
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => { closeBooth(b.channel); setClosing(null); }}>Confirmar fecho</Button>
                    <Button size="sm" variant="ghost" onClick={() => setClosing(null)}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                <Button variant="secondary" size="sm" className="mt-4" disabled={!b.open} onClick={() => setClosing(b.channel)}>
                  <Lock className="size-3.5" aria-hidden />
                  {b.open ? "Fechar o dia" : "Dia fechado"}
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      <section aria-labelledby="lista" className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-5 pb-4">
          <h2 id="lista" className="mr-auto text-[17px] font-semibold">Pagamentos de hoje</h2>
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Canal">
            {(["todos", "mpesa", "emola", "banco", "numerario"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={clsx("h-8 cursor-pointer rounded-full px-3 text-[13px] font-medium transition-colors", tab === t ? "bg-ink text-white" : "bg-sunken text-ink-2 hover:bg-line")}
              >
                {t === "todos" ? "Todos" : CHANNELS[t].label}
              </button>
            ))}
          </div>
        </div>
        {rows.length ? (
          <PaymentsTable rows={rows} highlightId={lastArrivalId} showInvoice />
        ) : (
          <p className="px-5 pb-6 text-sm text-ink-3">Ainda não entrou nenhum pagamento por este canal hoje.</p>
        )}
      </section>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<"input">) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-ink-2">{label}</span>
      <input required className="mt-1.5 h-10 w-full rounded-tile border border-line bg-surface px-3 text-sm placeholder:text-ink-3 focus:border-brand focus:outline-none" {...props} />
    </label>
  );
}
