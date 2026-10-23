"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  ChevronDown,
  CircleCheck,
  Download,
  GitCompareArrows,
  HandCoins,
  Landmark,
  Lock,
  Pause,
  Play,
  Plus,
  Send,
  ShieldAlert,
  SlidersHorizontal,
  Wallet,
} from "lucide-react";
import { useLive } from "./live";
import { PaymentsTable } from "./payments-table";
import { CardHeader, ChannelTag, CHANNEL_BAR, CHANNEL_SOLID, Delta, MoreButton, buttonClass } from "./ui";
import { AGEING, AGREEMENTS_TODAY, BOOTHS, CHANNELS, MONTHLY, PORTFOLIO, type Channel } from "@/lib/data";
import { mt, mtShort, pct } from "@/lib/format";

/* ——— Precisa de si hoje ——— */

export function TodayStrip() {
  const { exceptions, exceptionsAmount } = useLive();
  const over90 = AGEING[3];
  const items = [
    {
      icon: GitCompareArrows,
      tone: "text-warn bg-warn-soft",
      count: exceptions,
      label: exceptions === 1 ? "pagamento por reconciliar" : "pagamentos por reconciliar",
      amount: exceptionsAmount,
      detail: "Referências erradas, valores parciais e pagadores sem fracção",
      href: "/reconciliacao",
      cta: "Resolver agora",
    },
    {
      icon: ShieldAlert,
      tone: "text-danger bg-danger-soft",
      count: over90.fraccoes,
      label: "fracções com mais de 90 dias",
      amount: over90.amount,
      detail: "2 sem contacto há mais de um mês",
      href: "/inadimplencia",
      cta: "Ver devedores",
    },
    {
      icon: HandCoins,
      tone: "text-info bg-info-soft",
      count: AGREEMENTS_TODAY.count,
      label: "prestações de acordo vencem hoje",
      amount: AGREEMENTS_TODAY.amount,
      detail: "Lembrete automático enviado às 08:00",
      href: "/acordos",
      cta: "Ver acordos",
    },
  ];

  return (
    <section aria-labelledby="hoje" className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <h2 id="hoje" className="text-[15px] font-semibold">Precisa de si hoje</h2>
        <span className="text-xs text-ink-3">Actualizado agora</span>
      </div>
      <ul className="grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
        {items.map((it) => (
          <li key={it.href} className="flex gap-4 p-5">
            <span className={clsx("grid size-10 shrink-0 place-items-center rounded-tile", it.tone)}>
              <it.icon className="size-[18px]" strokeWidth={1.8} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-baseline gap-x-2 leading-tight">
                <span key={it.count} className="tnum num-bump text-[28px] font-semibold tracking-[-0.02em]">{it.count}</span>
                <span className="text-sm font-medium text-ink-2">{it.label}</span>
              </p>
              <p className="tnum mt-1 text-sm font-semibold">{mt(it.amount)}</p>
              <p className="mt-0.5 text-[13px] text-ink-3">{it.detail}</p>
              <Link href={it.href} className="group mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-strong hover:text-brand-deep">
                {it.cta}
                <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ——— Cobrado + balcões ——— */

const BOOTH_ICON: Record<Channel, typeof Wallet> = { mpesa: Wallet, emola: Wallet, banco: Landmark, numerario: Wallet };

export function CollectedPanel() {
  const { cobrado, booths, lastArrivalId, payments } = useLive();
  const last = payments.find((p) => p.id === lastArrivalId);

  return (
    <section aria-labelledby="cobrado" className="card flex flex-col p-5">
      <CardHeader icon={Wallet} title="Cobrado em Outubro">
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-[13px] font-medium text-ink-2">
          MZN
        </span>
      </CardHeader>
      <p id="cobrado" className="mt-5 text-[36px] leading-none font-semibold tracking-[-0.03em] sm:text-[40px]">
        <span key={cobrado} className="tnum num-bump">{mt(cobrado, { unit: false })}</span>
        <span className="ml-1.5 text-xl font-medium text-ink-3">MT</span>
      </p>
      <div className="mt-3">
        <Delta value={PORTFOLIO.cobradoVar}>face ao mesmo dia de Setembro</Delta>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <Link href="/pagamentos" className={buttonClass("primary")}>
          <Plus className="size-4" aria-hidden />
          Registar pagamento
        </Link>
        <Link href="/inadimplencia" className={buttonClass("secondary")}>
          <Send className="size-4" aria-hidden />
          Enviar lembretes
        </Link>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Balcões de hoje</h3>
        <Link href="/pagamentos" className="inline-flex h-8 items-center gap-1 rounded-full border border-line px-3 text-[13px] font-medium text-ink-2 hover:bg-sunken hover:text-ink">
          Fecho do dia
        </Link>
      </div>
      <ul className="mt-3 grid flex-1 grid-cols-2 gap-2.5">
        {booths.map((b) => {
          const Icon = BOOTH_ICON[b.channel];
          const justArrived = last?.channel === b.channel;
          return (
            <li
              key={justArrived ? `${b.channel}-${lastArrivalId}` : b.channel}
              className={clsx("relative rounded-tile p-3.5", b.open ? "bg-sunken" : "border border-dashed border-line-strong bg-surface", justArrived && "row-arrive")}
            >
              <div className="flex items-center justify-between gap-2">
                <ChannelTag channel={b.channel} />
                {b.open ? <Icon className="size-4 text-ink-3" strokeWidth={1.6} aria-hidden /> : <Lock className="size-4 text-ink-3" strokeWidth={1.8} aria-label="Fechado" />}
              </div>
              <p className={clsx("tnum mt-3 text-[17px] font-semibold tracking-[-0.01em]", !b.open && "text-ink-2")}>{mt(b.hoje)}</p>
              <p className="tnum mt-0.5 text-xs text-ink-3">
                {b.count} {b.count === 1 ? "pagamento" : "pagamentos"} · {b.note}
              </p>
              <p className={clsx("mt-2 text-xs font-medium", b.open ? "text-brand-strong" : "text-ink-2")}>{b.open ? "Aberto" : "Fechado · conferido com o talão"}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ——— Cobranças por canal (barras empilhadas) ——— */

const ORDER: Channel[] = ["mpesa", "emola", "banco", "numerario"];
const Y_MAX = 3000;
const TICKS = [0, 750, 1500, 2250, 3000];

export function ChannelChart() {
  const { booths } = useLive();
  // Outubro inclui os pagamentos que chegam ao vivo durante a demonstração.
  const liveExtra = Object.fromEntries(booths.map((b) => [b.channel, (b.hoje - BOOTHS.find((x) => x.channel === b.channel)!.hoje) / 1000])) as Record<Channel, number>;
  const months = MONTHLY.map((row, i) => (i === MONTHLY.length - 1 ? { ...row, mpesa: row.mpesa + liveExtra.mpesa, emola: row.emola + liveExtra.emola, banco: row.banco + liveExtra.banco, numerario: row.numerario + liveExtra.numerario } : row));
  const [active, setActive] = useState(MONTHLY.length - 1);
  const [hidden, setHidden] = useState<Channel[]>([]);
  const visible = ORDER.filter((c) => !hidden.includes(c));
  const m = months[active];
  const total = visible.reduce((s, c) => s + m[c], 0);
  const mobileShare = ((m.mpesa + m.emola) / ORDER.reduce((s, c) => s + m[c], 0)) * 100;

  return (
    <section aria-labelledby="canais" className="card flex flex-col p-5">
      <CardHeader icon={SlidersHorizontal} title="Cobranças por canal">
        <button type="button" className="hidden h-8 cursor-pointer items-center gap-1 rounded-full border border-line px-3 text-[13px] font-medium text-ink-2 hover:bg-sunken sm:inline-flex">
          Últimos 12 meses
          <ChevronDown className="size-3.5" aria-hidden />
        </button>
        <MoreButton label="Mais opções do gráfico" />
      </CardHeader>
      <span id="canais" className="sr-only">Valores cobrados por mês, empilhados por canal de pagamento</span>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2" role="group" aria-label="Mostrar ou esconder canais">
        {ORDER.map((c) => {
          const off = hidden.includes(c);
          return (
            <button
              key={c}
              type="button"
              aria-pressed={!off}
              onClick={() => setHidden((h) => (off ? h.filter((x) => x !== c) : visible.length > 1 ? [...h, c] : h))}
              className={clsx("inline-flex cursor-pointer items-center gap-2 text-[13px] transition-opacity", off ? "text-ink-3 line-through opacity-60" : "text-ink-2")}
            >
              <span className="size-2.5 rounded-[3px]" style={{ background: CHANNEL_SOLID[c] }} aria-hidden />
              {CHANNELS[c].label}
              {!off && <span className="tnum font-semibold text-ink">{mtShort(m[c] * 1000)}</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 rounded-tile bg-sunken px-4 py-3" role="status" aria-live="polite">
        <div>
          <p className="text-xs text-ink-3">
            {m.m} {m.year}
            {active === MONTHLY.length - 1 && " · até hoje"}
          </p>
          <p className="tnum text-[17px] font-semibold tracking-[-0.01em]">{mt(total * 1000)}</p>
        </div>
        <p className="text-[13px] text-ink-3">
          Carteira móvel (M-Pesa + e-Mola): <span className="tnum font-semibold text-ink">{pct(mobileShare, 0)}</span>
        </p>
      </div>

      <div className="relative mt-4 flex min-h-[220px] flex-1 gap-3">
        <div className="tnum flex flex-col-reverse justify-between pb-7 text-right text-xs text-ink-3" aria-hidden>
          {TICKS.map((t) => (
            <span key={t} className="leading-none">{t === 0 ? "0" : `${(t / 1000).toString().replace(".", ",")} M`}</span>
          ))}
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-x-0 top-0 bottom-7 flex flex-col-reverse justify-between" aria-hidden>
            {TICKS.map((t) => (
              <span key={t} className="border-t border-dashed border-line" />
            ))}
          </div>
          <ol className="absolute inset-x-0 top-0 bottom-0 grid grid-cols-12 gap-1.5 sm:gap-2.5">
            {months.map((row, i) => {
              const isActive = i === active;
              const sum = visible.reduce((s, c) => s + row[c], 0);
              return (
                <li key={row.m} className="flex flex-col">
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    aria-label={`${row.m} ${row.year}: ${mt(sum * 1000)}`}
                    aria-pressed={isActive}
                    className="group relative flex flex-1 cursor-pointer flex-col justify-end"
                  >
                    <span className="relative flex w-full flex-col-reverse rounded-t-[8px] transition-[height] duration-300" style={{ height: `${(sum / Y_MAX) * 100}%` }}>
                      {isActive && <span className="absolute -top-1.5 left-1/2 z-10 size-3 -translate-x-1/2 rounded-full border-2 border-white bg-ink shadow-card" aria-hidden />}
                      <span className="flex h-full w-full flex-col-reverse overflow-hidden rounded-t-[8px]">
                        {visible.map((c) => (
                          <span
                            key={c}
                            className="block w-full border-t border-white/70 first:border-t-0 transition-colors duration-150"
                            style={{ height: `${(row[c] / sum) * 100}%`, background: isActive ? CHANNEL_SOLID[c] : CHANNEL_BAR[c] }}
                          />
                        ))}
                      </span>
                    </span>
                  </button>
                  <span className={clsx("mt-2 h-5 text-center text-[11px] sm:text-xs", isActive ? "font-semibold text-ink" : "text-ink-3", i % 2 === 1 && !isActive && "max-sm:invisible")}>{row.m}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ——— Pagamentos recebidos (ao vivo) ——— */

export function PaymentsFeed({ limit = 6 }: { limit?: number }) {
  const { payments, running, setRunning, lastArrivalId } = useLive();
  const rows = payments.slice(0, limit);

  return (
    <section aria-labelledby="recebidos" className="card flex flex-col overflow-hidden">
      <div className="p-5 pb-4">
        <CardHeader icon={CircleCheck} title="Pagamentos recebidos">
          <button
            type="button"
            onClick={() => setRunning(!running)}
            aria-pressed={running}
            className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border border-line px-3 text-[13px] font-medium text-ink-2 hover:bg-sunken"
          >
            {running ? (
              <>
                <span className="size-2 rounded-full bg-brand dot-ticking" aria-hidden />
                Ao vivo
                <Pause className="size-3.5" aria-hidden />
              </>
            ) : (
              <>
                Em pausa
                <Play className="size-3.5" aria-hidden />
              </>
            )}
          </button>
          <Link href="/pagamentos" className="hidden h-8 items-center gap-1.5 rounded-full border border-line px-3 text-[13px] font-medium text-ink-2 hover:bg-sunken sm:inline-flex">
            Ver todos
          </Link>
        </CardHeader>
        <span id="recebidos" className="sr-only">Pagamentos recebidos hoje</span>
      </div>
      <PaymentsTable rows={rows} highlightId={lastArrivalId} />
    </section>
  );
}

export function HeaderActions() {
  return (
    <>
      <span className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium">
        <CalendarClock className="size-4 text-ink-3" aria-hidden />
        Ciclo de Outubro
      </span>
      <button type="button" className={buttonClass("dark")}>
        <Download className="size-4" aria-hidden />
        Exportar
      </button>
      <Link href="/facturacao" className={buttonClass("primary")}>
        <Plus className="size-4" aria-hidden />
        Emitir facturas
      </Link>
    </>
  );
}
