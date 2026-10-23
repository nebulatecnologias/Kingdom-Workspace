import clsx from "clsx";
import Link from "next/link";
import { CalendarClock, type LucideIcon } from "lucide-react";
import { CardHeader, Delta, MoreButton } from "./ui";
import { AGEING, PORTFOLIO } from "@/lib/data";
import { mt, pct } from "@/lib/format";

/* ——— KPI ——— */

export function KpiCard({ icon, title, value, delta, goodWhen, caption, href }: { icon: LucideIcon; title: string; value: number; delta: number; goodWhen: "up" | "down"; caption: string; href: string }) {
  return (
    <section className="card p-5">
      <CardHeader icon={icon} title={title} as="h2">
        <MoreButton label={`Mais opções: ${title}`} />
      </CardHeader>
      <p className="mt-5 text-[30px] leading-none font-semibold tracking-[-0.03em]">
        <span className="tnum">{mt(value, { unit: false })}</span>
        <span className="ml-1.5 text-lg font-medium text-ink-3">MT</span>
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <Delta value={delta} goodWhen={goodWhen}>{caption}</Delta>
        <Link href={href} className="text-[13px] font-medium text-brand-strong hover:text-brand-deep">Detalhe</Link>
      </div>
    </section>
  );
}

/* ——— Antiguidade da dívida ——— */

export function AgeingCard() {
  const total = AGEING.reduce((s, a) => s + a.amount, 0);
  const tones = ["bg-warn/50", "bg-warn", "bg-danger/70", "bg-danger"];
  return (
    <section aria-labelledby="antiguidade" className="card flex flex-col p-5">
      <CardHeader icon={CalendarClock} title="Dívida por antiguidade">
        <MoreButton label="Mais opções: dívida por antiguidade" />
      </CardHeader>
      <span id="antiguidade" className="sr-only">Dívida vencida por antiguidade</span>
      <p className="mt-5 flex items-baseline gap-2">
        <span className="tnum text-[26px] font-semibold tracking-[-0.02em]">{mt(total)}</span>
      </p>
      <p className="mt-1 text-[13px] text-ink-3">
        {PORTFOLIO.devedores} fracções em atraso · {pct(PORTFOLIO.taxaInadimplencia)} da carteira
      </p>
      <div className="mt-4 flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden>
        {AGEING.map((a, i) => (
          <span key={a.bucket} className={tones[i]} style={{ width: `${(a.amount / total) * 100}%` }} />
        ))}
      </div>
      <ul className="mt-4 flex-1 space-y-2.5">
        {AGEING.map((a, i) => (
          <li key={a.bucket}>
            <Link href={`/inadimplencia?antiguidade=${a.bucket}`} className="flex items-center gap-3 rounded-tile bg-sunken px-3.5 py-3 transition-colors hover:bg-line/60">
              <span className={clsx("size-2.5 shrink-0 rounded-[3px]", tones[i])} aria-hidden />
              <span className="flex-1 text-sm font-medium">{a.label}</span>
              <span className="tnum text-xs text-ink-3">{a.fraccoes} fracções</span>
              <span className="tnum w-[104px] text-right text-sm font-semibold">{mt(a.amount, { decimals: false })}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

